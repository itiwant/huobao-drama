/**
 * kie.ai Provider Adapter（图片 + 视频）
 *
 * 端点（全模型统一）：
 *   创建 POST {baseUrl}/api/v1/jobs/createTask   body { model, input }
 *   轮询 GET  {baseUrl}/api/v1/jobs/recordInfo?taskId=xxx
 *
 * 与其他厂商最大的不同：kie 只接受 HTTP(S) 的参考素材 URL，不接受 base64/data URL。
 * 而 generation.ts 在进 adapter 之前会把本地图片压成 data URL，所以这里必须先上传
 * 换取公网地址再定稿请求体 —— 这也是 buildGenerateRequest 允许返回 Promise 的原因。
 *
 * 不使用 callBackUrl：项目统一走轮询（桌面版没有公网入口）。
 */
import type {
  ImageProviderAdapter,
  VideoProviderAdapter,
  ProviderRequest,
  AIConfig,
  ImageGenerationRecord,
  VideoGenerationRecord,
  ImageGenResponse,
  ImagePollResponse,
  VideoGenResponse,
  VideoPollResponse,
} from '../types'
import { joinProviderUrl } from '../url'
import { KIE_IMAGE_MODELS, KIE_VIDEO_MODELS, mapQuality } from './models'
import type { KieVideoModel } from './models'
import { ensureKieReachableImages, rewriteLocalMediaForKie } from './upload'
import { parseCreateResponse, parseRecordInfo, extractResultUrl } from './poll'

/** 项目内画质档位；与前端 imageModelOptions 的取值一致 */
const DEFAULT_QUALITY = '2k'

function parseJsonArray(raw?: string | null): string[] {
  if (!raw) return []
  try {
    const arr = JSON.parse(raw)
    return Array.isArray(arr) ? arr.filter((u): u is string => typeof u === 'string' && !!u.trim()) : []
  } catch {
    return []
  }
}

/** 首尾帧、参考图、imageUrl 都可能承载首帧，按优先级取第一个可用值 */
function pickStartFrame(record: VideoGenerationRecord): string {
  const refs = parseJsonArray(record.referenceImageUrls)
  return (record.firstFrameUrl || refs[0] || record.imageUrl || '').trim()
}

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b)
}

/**
 * record.size 是像素尺寸（如 "1920x1080"），kie 要的是比例字符串。
 * 与 gemini-image.parseAspectRatio 同一套推导，保证多渠道结果一致。
 */
function toAspectRatio(size?: string | null): string {
  if (!size) return '16:9'
  const [w, h] = size.split('x').map(Number)
  if (!w || !h) return '16:9'
  const d = gcd(w, h)
  return `${w / d}:${h / d}`
}

/**
 * kie 每个模型的 ratio 枚举不同（有的没有 21:9，有的用 auto），
 * 直接把项目比例丢过去会被 422 拒掉。这里按数值就近挑一个模型支持的取值。
 */
function matchRatio(ratio: string, supported: string[]): string {
  if (supported.length === 0) return ratio
  if (supported.includes(ratio)) return ratio

  const parse = (r: string): number | null => {
    const [w, h] = r.split(':').map(Number)
    return w && h ? w / h : null
  }
  const target = parse(ratio)
  // 比例无法解析（如 "auto"）时退回模型的第一个取值
  if (target === null) return supported[0]

  let best = supported[0]
  let bestDelta = Infinity
  for (const candidate of supported) {
    const value = parse(candidate)
    if (value === null) continue
    const delta = Math.abs(value - target)
    if (delta < bestDelta) {
      bestDelta = delta
      best = candidate
    }
  }
  return best
}

function clampDuration(value: number | null | undefined, model: KieVideoModel): number {
  const n = Math.round(Number(value ?? model.durationMin))
  if (!Number.isFinite(n)) return model.durationMin
  return Math.min(model.durationMax, Math.max(model.durationMin, n))
}

/**
 * 项目内统一用 480p/720p/1080p 三档，各模型只接受自己的枚举，
 * 所以要显式映射而不是推算（MiniMax 的 768P 与 2K 无法用数字直接比较）。
 * 模型未声明映射时按同名透传，缺省收敛到 720p。
 */
function matchResolution(resolution: string | null | undefined, model: KieVideoModel): string {
  const key = String(resolution || '720p').trim().toLowerCase()
  const mapped = model.resolutionMap?.[key]
  if (mapped) return mapped
  return model.resolutionMap ? '720p' : (resolution || '720p')
}

/** 创建任务请求体：{ model, input } */
function createTaskRequest(config: AIConfig, input: Record<string, unknown>, model: string): ProviderRequest {
  return {
    url: joinProviderUrl(config.baseUrl, '/api/v1', '/jobs/createTask'),
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: { model, input },
  }
}

function pollRequest(config: AIConfig, taskId: string): ProviderRequest {
  // joinProviderUrl 只处理 pathname，query 必须另挂（否则 ? 会被编码成 %3F）
  const url = new URL(joinProviderUrl(config.baseUrl, '/api/v1', '/jobs/recordInfo'))
  url.searchParams.set('taskId', taskId)
  return {
    url: url.toString(),
    method: 'GET',
    headers: { Authorization: `Bearer ${config.apiKey}` },
    body: undefined,
  }
}

// ── 图片 ─────────────────────────────────────────────────────────────────────

export class KieImageAdapter implements ImageProviderAdapter {
  provider = 'kie'

  async buildGenerateRequest(config: AIConfig, record: ImageGenerationRecord): Promise<ProviderRequest> {
    const modelId = record.model || config.model
    const model = KIE_IMAGE_MODELS[modelId]
    if (!model) {
      throw new Error(`kie 不支持的图片模型：${modelId}（可选：${Object.keys(KIE_IMAGE_MODELS).join(', ')}）`)
    }

    const refs = parseJsonArray(record.referenceImages)
    const hasImages = refs.length > 0 && model.maxImages > 0
    // 无参考图时切到 text-only 变体（部分模型 i2i / t2i 是两个独立 id）
    const apiId = !hasImages && model.textOnlyApiId ? model.textOnlyApiId : model.apiId

    const input: Record<string, unknown> = {
      prompt: (record.prompt || '').slice(0, model.promptMaxLength),
      [model.aspectRatioKey]: matchRatio(toAspectRatio(record.size), model.ratios),
    }

    if (model.outputFormat) input.output_format = model.outputFormat
    if (hasImages) {
      const uploaded = await ensureKieReachableImages(refs.slice(0, model.maxImages), config.apiKey)
      input[model.imageInputKey!] = uploaded
    }
    if (model.qualityKey) {
      const options = model.qualityOptions ?? []
      // 模型只支持部分档位时（如 Seedream 5 Pro 只到 2k），回落到它支持的最高档
      const quality = options.length > 0 && !options.includes(DEFAULT_QUALITY)
        ? options[options.length - 1]
        : DEFAULT_QUALITY
      input[model.qualityKey] = mapQuality(quality, model)
    }
    if (model.extra) Object.assign(input, model.extra)

    return createTaskRequest(config, input, apiId)
  }

  parseGenerateResponse(result: any): ImageGenResponse {
    return { isAsync: true, taskId: parseCreateResponse(result) }
  }

  buildPollRequest(config: AIConfig, taskId: string): ProviderRequest {
    return pollRequest(config, taskId)
  }

  parsePollResponse(result: any): ImagePollResponse {
    const parsed = parseRecordInfo(result)
    return { status: parsed.status, imageUrl: parsed.url, error: parsed.error }
  }

  extractImageUrl(result: any): string | null {
    return extractResultUrl(result?.data ?? result)
  }

  /** kie 只返回 URL，不返回 base64 */
  extractImageBase64(): { data: string; mimeType: string } | null {
    return null
  }
}

// ── 视频 ─────────────────────────────────────────────────────────────────────

export class KieVideoAdapter implements VideoProviderAdapter {
  provider = 'kie'

  async buildGenerateRequest(config: AIConfig, record: VideoGenerationRecord): Promise<ProviderRequest> {
    const modelId = record.model || config.model
    const model = KIE_VIDEO_MODELS[modelId]
    if (!model) {
      throw new Error(`kie 不支持的视频模型：${modelId}（可选：${Object.keys(KIE_VIDEO_MODELS).join(', ')}）`)
    }

    const refImages = parseJsonArray(record.referenceImageUrls)
    const refVideos = parseJsonArray(record.referenceVideoUrls)
    const refAudios = parseJsonArray(record.referenceAudioUrls)
    const startFrame = pickStartFrame(record)
    const sound = record.generateAudio !== 0 && record.generateAudio !== false
    const duration = clampDuration(record.duration, model)
    const resolution = matchResolution(record.resolution, model)

    const input: Record<string, unknown> = {}
    const prompt = (record.prompt || '').slice(0, model.promptMaxLength)
    if (prompt || !model.promptOptional) input.prompt = prompt

    let apiId = model.apiId

    if (model.route === 'frames') {
      // Seedance 系列：首尾帧与参考图数组互斥，官方语义如此
      if (model.aspectRatioKey) input[model.aspectRatioKey] = record.aspectRatio || 'adaptive'
      if (model.durationKey) input[model.durationKey] = duration
      if (model.resolutionKey) input[model.resolutionKey] = resolution
      if (model.soundKey) input[model.soundKey] = sound
      if (model.firstFrameKey && record.firstFrameUrl) input[model.firstFrameKey] = record.firstFrameUrl
      if (model.lastFrameKey && record.lastFrameUrl) input[model.lastFrameKey] = record.lastFrameUrl
      if (model.referenceImagesKey && refImages.length > 0 && !record.firstFrameUrl && !record.lastFrameUrl) {
        input[model.referenceImagesKey] = refImages.slice(0, model.maxImages ?? refImages.length)
      }
      if (model.referenceVideosKey && refVideos.length > 0) input[model.referenceVideosKey] = refVideos
      if (model.referenceAudiosKey && refAudios.length > 0) input[model.referenceAudiosKey] = refAudios
    } else if (model.route === 'kling') {
      // Kling 3.0：首尾帧合并进 image_urls，其余走 elements
      if (model.aspectRatioKey) input[model.aspectRatioKey] = record.aspectRatio || '16:9'
      if (model.durationKey) input[model.durationKey] = model.durationAsString ? String(duration) : duration
      if (model.resolutionKey) input[model.resolutionKey] = resolution
      if (model.soundKey) input[model.soundKey] = sound
      const urls = [record.firstFrameUrl, record.lastFrameUrl].filter((u): u is string => !!u)
      if (urls.length > 0) input.image_urls = urls
    } else if (model.route === 'klingTurbo') {
      // 有首帧走 i2v（不发比例），否则走 t2v
      if (startFrame) {
        apiId = model.imageApiId || model.apiId
        input.image_urls = [startFrame]
        if (model.durationKey) input[model.durationKey] = String(duration)
        if (model.resolutionKey) input[model.resolutionKey] = resolution
      } else {
        if (model.aspectRatioKey) input[model.aspectRatioKey] = record.aspectRatio || '16:9'
        if (model.durationKey) input[model.durationKey] = String(duration)
        if (model.resolutionKey) input[model.resolutionKey] = resolution
      }
    } else if (model.route === 'grok') {
      const hasImages = refImages.length > 0
      if (hasImages && model.imageApiId) apiId = model.imageApiId
      if (model.aspectRatioKey) input[model.aspectRatioKey] = record.aspectRatio || '16:9'
      if (model.durationKey) {
        input[model.durationKey] = model.durationAsString ? String(duration) : duration
      }
      if (model.resolutionKey) input[model.resolutionKey] = resolution
      if (hasImages && model.referenceImagesKey) {
        input[model.referenceImagesKey] = refImages.slice(0, model.maxImages ?? refImages.length)
      }
    } else if (model.route === 'minimaxH3') {
      // 首尾帧优先于参考素材
      if (startFrame || record.lastFrameUrl) {
        apiId = model.imageApiId || model.apiId
        if (model.durationKey) input[model.durationKey] = duration
        if (model.firstFrameKey && startFrame) input[model.firstFrameKey] = startFrame
        if (model.lastFrameKey && record.lastFrameUrl) input[model.lastFrameKey] = record.lastFrameUrl
        if (model.resolutionKey) input[model.resolutionKey] = resolution
      } else if (refImages.length > 0) {
        if (model.referenceImagesKey) {
          input[model.referenceImagesKey] = refImages.slice(0, model.maxImages ?? refImages.length)
        }
        if (model.aspectRatioKey) input[model.aspectRatioKey] = record.aspectRatio || '16:9'
        if (model.durationKey) input[model.durationKey] = duration
        if (model.referenceVideosKey && refVideos.length > 0) input[model.referenceVideosKey] = refVideos
        if (model.referenceAudiosKey && refAudios.length > 0) input[model.referenceAudiosKey] = refAudios
        if (model.resolutionKey) input[model.resolutionKey] = resolution
      } else {
        if (model.aspectRatioKey) input[model.aspectRatioKey] = record.aspectRatio || '16:9'
        if (model.durationKey) input[model.durationKey] = duration
        if (model.resolutionKey) input[model.resolutionKey] = resolution
      }
    } else {
      // plain：HappyHorse 等
      if (startFrame) {
        apiId = model.imageApiId || model.apiId
        if (model.firstFrameKey) input[model.firstFrameKey] = [startFrame]
        if (model.durationKey) input[model.durationKey] = duration
        // 分辨率由输入图决定，不发送
      } else if (refImages.length > 0 && model.referenceImagesKey) {
        input[model.referenceImagesKey] = refImages.slice(0, model.maxImages ?? refImages.length)
        if (model.aspectRatioKey) input[model.aspectRatioKey] = record.aspectRatio || '16:9'
        if (model.durationKey) input[model.durationKey] = duration
        if (model.resolutionKey) input[model.resolutionKey] = resolution
      } else {
        if (model.aspectRatioKey) input[model.aspectRatioKey] = record.aspectRatio || '16:9'
        if (model.durationKey) input[model.durationKey] = duration
        if (model.resolutionKey) input[model.resolutionKey] = resolution
      }
    }

    if (model.extra) Object.assign(input, model.extra)

    // kie 抓不到内网/内联素材：把所有层级的本地素材换成 kie 临时 URL
    await rewriteLocalMediaForKie(input, config.apiKey)

    return createTaskRequest(config, input, apiId)
  }

  parseGenerateResponse(result: any): VideoGenResponse {
    return { isAsync: true, taskId: parseCreateResponse(result) }
  }

  buildPollRequest(config: AIConfig, taskId: string): ProviderRequest {
    return pollRequest(config, taskId)
  }

  parsePollResponse(result: any): VideoPollResponse {
    const parsed = parseRecordInfo(result)
    return { status: parsed.status, videoUrl: parsed.url, error: parsed.error }
  }

  extractVideoUrl(result: any): string | null {
    return extractResultUrl(result?.data ?? result)
  }
}
