/**
 * kie 模型注册表 —— 唯一的事实来源。
 *
 * 移植自 HeliosGen（D:\Code\SIDE_PROJECT\HeliosGen\lib\modelConfig.ts，线上运行中），
 * 只保留 huobao-drama 用得到的字段。kie 所有模型共用同一个端点
 * （POST /api/v1/jobs/createTask）和同一套轮询响应，差异**只在 input 的字段名与取值**，
 * 所以这里用声明式表而不是给每个模型写一个类。
 *
 * 新增模型 = 加一条记录，不需要改 adapter 逻辑。
 */

// ── 图片模型 ─────────────────────────────────────────────────────────────────

export interface KieImageModel {
  /** 发给 kie 的 model 字符串（有参考图时） */
  apiId: string
  /**
   * 无参考图时改用的 model（部分模型是 i2i / t2i 两个独立 id）。
   * 设置后：没有参考图 → 用这个 id 且不发送图片字段。
   */
  textOnlyApiId?: string
  /** 参考图字段名；不支持的模型留空 */
  imageInputKey?: string
  /** 宽高比字段名（各模型不同：aspect_ratio 或 image_size） */
  aspectRatioKey: string
  /** 该模型接受的宽高比取值；项目尺寸比例会就近匹配到这里 */
  ratios: string[]
  /** 参考图上限 */
  maxImages: number
  /** 画质字段名（resolution / quality） */
  qualityKey?: string
  /** 项目内画质档（1k/2k/4k）→ 该模型的官方取值 */
  qualityMap?: Record<string, string>
  /** 支持的画质档；缺省表示该模型不支持画质选择 */
  qualityOptions?: string[]
  /** prompt 截断长度 */
  promptMaxLength: number
  /** 固定输出格式 */
  outputFormat?: string
  /** 其他恒定字段 */
  extra?: Record<string, unknown>
}

export const KIE_IMAGE_MODELS: Record<string, KieImageModel> = {
  // ── Google ──
  'google-nano-banana': {
    apiId: 'google/nano-banana',
    aspectRatioKey: 'image_size',
    ratios: ['1:1', '16:9', '9:16', '4:3', '3:4', '3:2', '2:3', '5:4', '4:5', '21:9'],
    maxImages: 0,
    promptMaxLength: 5000,
    outputFormat: 'jpeg',
  },
  'nano-banana-2': {
    apiId: 'nano-banana-2',
    imageInputKey: 'image_input',
    aspectRatioKey: 'aspect_ratio',
    ratios: ['1:1', '16:9', '9:16', '4:3', '3:4', '2:3', '3:2', '21:9'],
    maxImages: 14,
    qualityKey: 'quality',
    qualityMap: { '1k': 'basic', '2k': 'basic', '4k': 'high' },
    qualityOptions: ['1k', '2k', '4k'],
    promptMaxLength: 10000,
    outputFormat: 'jpg',
  },
  'nano-banana-pro': {
    apiId: 'nano-banana-pro',
    imageInputKey: 'image_input',
    aspectRatioKey: 'aspect_ratio',
    ratios: ['1:1', '16:9', '9:16', '4:3', '3:4', '4:5', '5:4', '2:3', '3:2', '21:9'],
    maxImages: 8,
    qualityKey: 'quality',
    qualityMap: { '1k': 'basic', '2k': 'basic', '4k': 'high' },
    qualityOptions: ['1k', '2k', '4k'],
    promptMaxLength: 10000,
    outputFormat: 'jpg',
  },
  'nano-banana-2-lite': {
    apiId: 'nano-banana-2-lite',
    imageInputKey: 'image_urls',
    aspectRatioKey: 'aspect_ratio',
    ratios: ['auto', '1:1', '16:9', '9:16', '4:3', '3:4', '4:5', '5:4', '2:3', '3:2', '21:9'],
    maxImages: 10,
    promptMaxLength: 20000,
  },
  // ── Z-AI ──
  'z-image': {
    apiId: 'z-image',
    aspectRatioKey: 'aspect_ratio',
    ratios: ['1:1', '4:3', '3:4', '16:9', '9:16'],
    maxImages: 0,
    promptMaxLength: 1000,
    extra: { nsfw_checker: true },
  },
  // ── Seedream ──
  'seedream-5-lite': {
    apiId: 'seedream/5-lite-text-to-image',
    imageInputKey: 'image_urls',
    aspectRatioKey: 'aspect_ratio',
    ratios: ['1:1', '4:3', '3:4', '16:9', '9:16', '2:3', '3:2', '21:9'],
    maxImages: 14,
    qualityKey: 'quality',
    qualityMap: { '1k': 'basic', '2k': 'basic', '4k': 'high' },
    qualityOptions: ['2k', '4k'],
    promptMaxLength: 3000,
    extra: { nsfw_checker: false },
  },
  'seedream-5-pro': {
    apiId: 'seedream/5-pro-image-to-image',
    textOnlyApiId: 'seedream/5-pro-text-to-image',
    imageInputKey: 'image_urls',
    aspectRatioKey: 'aspect_ratio',
    ratios: ['1:1', '4:3', '3:4', '16:9', '9:16', '2:3', '3:2'],
    maxImages: 10,
    qualityKey: 'quality',
    qualityMap: { '1k': 'basic', '2k': 'high' },
    qualityOptions: ['1k', '2k'],
    promptMaxLength: 3000,
    extra: { nsfw_checker: false },
  },
  // ── X (Grok) ──
  'grok-imagine-image': {
    apiId: 'grok-imagine/image-to-image',
    textOnlyApiId: 'grok-imagine/text-to-image',
    imageInputKey: 'image_urls',
    aspectRatioKey: 'aspect_ratio',
    ratios: ['1:1', '16:9', '9:16', '2:3', '3:2'],
    maxImages: 5,
    promptMaxLength: 5000,
    extra: { nsfw_checker: false },
  },
  // ── OpenAI GPT Image ──
  'gpt-image-2': {
    apiId: 'gpt-image-2-image-to-image',
    textOnlyApiId: 'gpt-image-2-text-to-image',
    imageInputKey: 'input_urls',
    aspectRatioKey: 'aspect_ratio',
    ratios: ['auto', '1:1', '16:9', '9:16', '4:3', '3:4'],
    maxImages: 16,
    qualityKey: 'resolution',
    qualityOptions: ['1k', '2k', '4k'],
    promptMaxLength: 20000,
    extra: { nsfw_checker: false },
  },
  'gpt-image-2-5-flare': {
    apiId: 'gpt-image-2-5-flare-image-to-image',
    textOnlyApiId: 'gpt-image-2-5-flare-text-to-image',
    imageInputKey: 'input_urls',
    aspectRatioKey: 'aspect_ratio',
    ratios: ['auto', '1:1', '3:2', '2:3', '4:3', '3:4', '16:9', '9:16', '21:9', '27:16', '16:27', '9:8', '8:9'],
    maxImages: 16,
    qualityKey: 'resolution',
    qualityOptions: ['1k', '2k', '4k'],
    promptMaxLength: 20000,
  },
  'gpt-image-2-5-sunburst': {
    apiId: 'gpt-image-2-5-sunburst-image-to-image',
    textOnlyApiId: 'gpt-image-2-5-sunburst-text-to-image',
    imageInputKey: 'input_urls',
    aspectRatioKey: 'aspect_ratio',
    ratios: ['auto', '1:1', '3:2', '2:3', '4:3', '3:4', '16:9', '9:16', '21:9', '27:16', '16:27', '9:8', '8:9'],
    maxImages: 16,
    qualityKey: 'resolution',
    qualityOptions: ['1k', '2k', '4k'],
    promptMaxLength: 20000,
  },
}

// ── 视频模型 ─────────────────────────────────────────────────────────────────

/**
 * kie 视频模型的 payload 结构差异很大，用一组互斥的 `route` 标记选择构建分支，
 * 与 HeliosGen 的 useXxx 布尔标记同构但更明确（一个模型只能走一条分支）。
 *
 * - `frames`     首尾帧 + 多模态参考数组（Seedance 系列）
 * - `kling`      首尾帧合并进 image_urls + elements（Kling 3.0）
 * - `klingTurbo` 有首帧走 i2v、否则走 t2v（Kling 3.0 Turbo）
 * - `grok`       参考图数组驱动的 t2v/i2v（Grok Imagine）
 * - `minimaxH3`  首尾帧优先、其次参考素材、最后纯文本（MiniMax H3）
 * - `plain`      只有 prompt/比例/时长/分辨率（HappyHorse 等）
 */
export type KieVideoRoute = 'frames' | 'kling' | 'klingTurbo' | 'grok' | 'minimaxH3' | 'plain'

export interface KieVideoModel {
  apiId: string
  /** 有参考图/首帧时改用的 model（缺省则沿用 apiId） */
  imageApiId?: string
  route: KieVideoRoute
  aspectRatioKey?: string
  durationKey?: string
  /** Kling 系列要求 duration 传字符串 */
  durationAsString?: boolean
  durationMin: number
  durationMax: number
  resolutionKey?: string
  /**
   * 项目内三档分辨率（480p/720p/1080p，另兼容 4k）→ 该模型自己的取值。
   * 各模型枚举差异很大（Seedance Mini 止步 720p、MiniMax 用 768P/2K、Kling 用 std/pro/4K），
   * 且字面高度不可直接比较（MiniMax 的 2K 比 768P 高，但数字差更大），
   * 所以用显式映射而非就近推算。与前端 episode.vue 的 RESOLUTION_DISPLAY 保持一致。
   */
  resolutionMap?: Record<string, string>
  soundKey?: string
  /** 首帧字段名 */
  firstFrameKey?: string
  /** 尾帧字段名 */
  lastFrameKey?: string
  /** 参考图数组字段名 */
  referenceImagesKey?: string
  referenceVideosKey?: string
  referenceAudiosKey?: string
  /** 参考图上限 */
  maxImages?: number
  maxReferenceVideos?: number
  promptMaxLength: number
  promptOptional?: boolean
  extra?: Record<string, unknown>
}

export const KIE_VIDEO_MODELS: Record<string, KieVideoModel> = {
  // ── Kling ──
  'kling-3.0': {
    apiId: 'kling-3.0/video',
    route: 'kling',
    aspectRatioKey: 'aspect_ratio',
    durationKey: 'duration',
    durationAsString: true,
    durationMin: 3,
    durationMax: 15,
    resolutionKey: 'mode',
    resolutionMap: { '480p': 'std', '720p': 'std', '1080p': 'pro', '4k': '4K' },
    soundKey: 'sound',
    promptMaxLength: 2500,
    extra: { multi_shots: false, multi_prompt: [], kling_elements: [] },
  },
  'kling-3.0-turbo': {
    apiId: 'kling/v3-turbo-text-to-video',
    imageApiId: 'kling/v3-turbo-image-to-video',
    route: 'klingTurbo',
    aspectRatioKey: 'aspect_ratio',
    durationKey: 'duration',
    durationAsString: true,
    durationMin: 3,
    durationMax: 15,
    resolutionKey: 'resolution',
    resolutionMap: { '480p': '720p', '720p': '720p', '1080p': '1080p' },
    promptMaxLength: 2500,
  },
  // ── Bytedance Seedance ──
  'seedance-2': {
    apiId: 'bytedance/seedance-2',
    route: 'frames',
    aspectRatioKey: 'aspect_ratio',
    durationKey: 'duration',
    durationMin: 4,
    durationMax: 15,
    resolutionKey: 'resolution',
    resolutionMap: { '480p': '480p', '720p': '720p', '1080p': '1080p' },
    soundKey: 'generate_audio',
    firstFrameKey: 'first_frame_url',
    lastFrameKey: 'last_frame_url',
    referenceImagesKey: 'reference_image_urls',
    referenceVideosKey: 'reference_video_urls',
    referenceAudiosKey: 'reference_audio_urls',
    maxImages: 9,
    maxReferenceVideos: 3,
    promptMaxLength: 20000,
    promptOptional: true,
    extra: { web_search: false },
  },
  'seedance-2-fast': {
    apiId: 'bytedance/seedance-2-fast',
    route: 'frames',
    aspectRatioKey: 'aspect_ratio',
    durationKey: 'duration',
    durationMin: 4,
    durationMax: 15,
    resolutionKey: 'resolution',
    resolutionMap: { '480p': '480p', '720p': '720p', '1080p': '1080p' },
    soundKey: 'generate_audio',
    firstFrameKey: 'first_frame_url',
    lastFrameKey: 'last_frame_url',
    referenceImagesKey: 'reference_image_urls',
    referenceVideosKey: 'reference_video_urls',
    referenceAudiosKey: 'reference_audio_urls',
    maxImages: 9,
    maxReferenceVideos: 3,
    promptMaxLength: 20000,
    promptOptional: true,
    extra: { web_search: false },
  },
  'seedance-2-mini': {
    apiId: 'bytedance/seedance-2-mini',
    route: 'frames',
    aspectRatioKey: 'aspect_ratio',
    durationKey: 'duration',
    durationMin: 4,
    durationMax: 15,
    resolutionKey: 'resolution',
    resolutionMap: { '480p': '480p', '720p': '720p', '1080p': '720p' },
    soundKey: 'generate_audio',
    firstFrameKey: 'first_frame_url',
    lastFrameKey: 'last_frame_url',
    referenceImagesKey: 'reference_image_urls',
    referenceVideosKey: 'reference_video_urls',
    referenceAudiosKey: 'reference_audio_urls',
    maxImages: 9,
    maxReferenceVideos: 3,
    promptMaxLength: 20000,
    promptOptional: true,
    extra: { web_search: false },
  },
  'seedance-2-5': {
    apiId: 'bytedance/seedance-2-5',
    route: 'frames',
    aspectRatioKey: 'aspect_ratio',
    durationKey: 'duration',
    durationMin: 4,
    durationMax: 30,
    resolutionKey: 'resolution',
    resolutionMap: { '480p': '480p', '720p': '720p', '1080p': '720p' },
    soundKey: 'generate_audio',
    firstFrameKey: 'first_frame_url',
    lastFrameKey: 'last_frame_url',
    referenceImagesKey: 'reference_image_urls',
    referenceVideosKey: 'reference_video_urls',
    referenceAudiosKey: 'reference_audio_urls',
    maxImages: 30,
    maxReferenceVideos: 10,
    promptMaxLength: 30000,
    promptOptional: true,
    extra: { web_search: false },
  },
  // ── X (Grok) ──
  'grok-imagine': {
    apiId: 'grok-imagine/text-to-video',
    imageApiId: 'grok-imagine/image-to-video',
    route: 'grok',
    aspectRatioKey: 'aspect_ratio',
    durationKey: 'duration',
    durationAsString: true,
    durationMin: 6,
    durationMax: 30,
    resolutionKey: 'resolution',
    resolutionMap: { '480p': '480p', '720p': '720p', '1080p': '720p' },
    referenceImagesKey: 'image_urls',
    maxImages: 7,
    promptMaxLength: 5000,
  },
  'grok-imagine-1-5-preview': {
    apiId: 'grok-imagine-video-1-5-preview',
    route: 'grok',
    aspectRatioKey: 'aspect_ratio',
    durationKey: 'duration',
    durationMin: 1,
    durationMax: 15,
    resolutionKey: 'resolution',
    resolutionMap: { '480p': '480p', '720p': '720p', '1080p': '720p' },
    referenceImagesKey: 'image_urls',
    maxImages: 1,
    promptMaxLength: 4096,
    promptOptional: true,
  },
  // ── MiniMax ──
  'minimax-h3': {
    apiId: 'minimax-h3/text-to-video',
    imageApiId: 'minimax-h3/image-to-video',
    route: 'minimaxH3',
    aspectRatioKey: 'aspect_ratio',
    durationKey: 'duration',
    durationMin: 4,
    durationMax: 15,
    resolutionKey: 'resolution',
    resolutionMap: { '480p': '768P', '720p': '768P', '1080p': '2K' },
    firstFrameKey: 'first_frame_url',
    lastFrameKey: 'last_frame_url',
    referenceImagesKey: 'reference_image_urls',
    referenceVideosKey: 'reference_video_urls',
    referenceAudiosKey: 'reference_audio_urls',
    maxImages: 9,
    maxReferenceVideos: 3,
    promptMaxLength: 7000,
  },
  // ── Alibaba HappyHorse ──
  happyhorse: {
    apiId: 'happyhorse/text-to-video',
    imageApiId: 'happyhorse/image-to-video',
    route: 'plain',
    aspectRatioKey: 'aspect_ratio',
    durationKey: 'duration',
    durationMin: 3,
    durationMax: 15,
    resolutionKey: 'resolution',
    resolutionMap: { '480p': '720p', '720p': '720p', '1080p': '1080p' },
    firstFrameKey: 'image_urls',
    referenceImagesKey: 'reference_image',
    maxImages: 9,
    promptMaxLength: 5000,
    promptOptional: true,
  },
}

/** 项目内统一的画质档 → kie 官方写法 */
export function mapQuality(quality: string, model: KieImageModel): string {
  if (model.qualityMap?.[quality]) return model.qualityMap[quality]
  // 默认把 1k/2k/4k 转成官方写法 1K/2K/4K
  return quality === '4k' ? '4K' : quality === '2k' ? '2K' : quality === '1k' ? '1K' : quality
}
