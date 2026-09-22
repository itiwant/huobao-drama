/**
 * 把本地参考素材变成 kie 能抓取的公网 URL。
 *
 * 背景：huobao-drama 在调用 adapter 前会把本地图片压成 data URL（见 generation.ts
 * normalizeReferenceImages），而 kie 只接受 HTTP(S) URL（"File URL after upload,
 * not file content"）。视频/音频更是直接是本地路径。
 *
 * 解决办法与 HeliosGen 一致：走 kie 的临时文件存储把素材换成一个公网 URL。
 * 注意上传主机不是 api.kie.ai —— 官方文档与实际不符，实际在 kieai.redpandaai.co，
 * 文件保留 3 天，足够一次生成任务。
 */
/** kie 临时文件存储（不在 api.kie.ai，文档未更新） */
const UPLOAD_URL = 'https://kieai.redpandaai.co/api/file-base64-upload'
/** kie 要求上传时指定目录名，便于在控制台区分来源 */
const UPLOAD_PATH = 'huobao'

/** 公网可直连的 URL 无需二次上传 */
function isRemotelyReachable(url: string): boolean {
  if (!/^https?:\/\//i.test(url)) return false
  try {
    const { hostname } = new URL(url)
    return hostname !== 'localhost' && hostname !== '127.0.0.1' && hostname !== '0.0.0.0'
  } catch {
    return false
  }
}

/**
 * 需要 re-host 的素材：data URL（图片被压缩后的形态）或本地 static 路径。
 * 公网 URL 交由 isRemotelyReachable 判断放行。
 */
function isLocalMedia(url: string): boolean {
  return url.startsWith('data:') || url.startsWith('static/') || url.startsWith('/static/')
}

/**
 * 同一张参考图可能在多个输入字段出现，缓存 Promise 保证只上传一次。
 * 存的是 Promise 而非结果：并发调用时后续请求直接复用同一个在途上传。
 */
const uploadCache = new Map<string, Promise<string>>()

async function doUpload(dataUrl: string, apiKey: string): Promise<string> {
  const res = await fetch(UPLOAD_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ base64Data: dataUrl, uploadPath: UPLOAD_PATH }),
    signal: AbortSignal.timeout(120_000),
  })
  const json = await res.json().catch(() => null)
  // 响应结构在不同版本间有 data.downloadUrl 与顶层 downloadUrl 两种，都兜住
  const url = json?.data?.downloadUrl || json?.downloadUrl
  if (!res.ok || !url) {
    throw new Error(`kie 参考素材上传失败（HTTP ${res.status}）：${json?.msg ?? '响应中缺少 downloadUrl'}`)
  }
  return url as string
}

function uploadOne(input: string, apiKey: string): Promise<string> {
  let p = uploadCache.get(input)
  if (!p) {
    p = doUpload(input, apiKey)
    // 失败不上缓存，否则一次网络抖动会永久毒化这一项的后续重试
    p.catch(() => uploadCache.delete(input))
    uploadCache.set(input, p)
  }
  return p
}

/**
 * 图片参考：把列表里本地/内联的素材换成 kie 临时 URL，公网 URL 原样放行。
 * 上传失败直接抛出（调用方负责呈现）——静默丢参考图比报错更糟。
 */
export async function ensureKieReachableImages(urls: string[], apiKey: string): Promise<string[]> {
  return Promise.all(urls.map((u) => (isRemotelyReachable(u) ? Promise.resolve(u) : uploadOne(u, apiKey))))
}

/**
 * 视频参考：递归遍历 kie 的 input 负载，把任意层级里的本地素材字符串换成 kie 临时 URL。
 * 视频各模型族的 payload 结构差异很大（数组、嵌套对象、kling_elements），
 * 逐个字段处理既啰嗦又易漏，直接整体深扫更稳。就地修改。
 */
export async function rewriteLocalMediaForKie(node: unknown, apiKey: string): Promise<void> {
  if (Array.isArray(node)) {
    for (let i = 0; i < node.length; i++) {
      const item = node[i]
      if (typeof item === 'string' && isLocalMedia(item)) {
        node[i] = await uploadOne(item, apiKey)
      } else {
        await rewriteLocalMediaForKie(item, apiKey)
      }
    }
    return
  }
  if (node && typeof node === 'object') {
    const obj = node as Record<string, unknown>
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string' && isLocalMedia(value)) {
        obj[key] = await uploadOne(value, apiKey)
      } else {
        await rewriteLocalMediaForKie(value, apiKey)
      }
    }
  }
}
