/**
 * kie 的共用响应解析 —— 创建与轮询两处都用同一套结构。
 *
 * 创建：POST /api/v1/jobs/createTask → { code: 200, msg, data: { taskId } }
 * 轮询：GET  /api/v1/jobs/recordInfo   → { code, msg, data: { state, resultJson, failCode, failMsg, ... } }
 */

/** kie 官方 state 枚举 → 项目内部轮询状态 */
const STATE_MAP: Record<string, 'pending' | 'processing' | 'completed' | 'failed'> = {
  waiting: 'pending',
  queuing: 'pending',
  generating: 'processing',
  // 少数接口返回 succeeded，一并兜住
  success: 'completed',
  succeeded: 'completed',
  fail: 'failed',
  failed: 'failed',
  error: 'failed',
}

/** 从 createTask 响应里取 taskId；缺失即视为失败 */
export function parseCreateResponse(result: any): string {
  // 业务错误码可能出现在 200 响应体里
  if (result?.code !== undefined && result.code !== 200) {
    throw new Error(`kie 创建任务失败：${result?.msg ?? `code ${result.code}`}`)
  }
  const taskId = result?.data?.taskId ?? result?.data?.id ?? result?.taskId ?? result?.id
  if (!taskId) throw new Error('kie 创建任务响应中没有 taskId')
  return String(taskId)
}

export interface KiePollResult {
  status: 'pending' | 'processing' | 'completed' | 'failed'
  /** resultUrls 里的第一个结果 */
  url?: string
  error?: string
}

/**
 * 解析 recordInfo 响应。
 *
 * 注意 resultJson 是**字符串形式的 JSON**，需要二次解析；失败态下 kie 会把
 * failCode/failMsg 也塞在字符串里（成功时为 ''），所以两条路径都要兜。
 */
export function parseRecordInfo(result: any): KiePollResult {
  if (result?.code !== undefined && result.code !== 200) {
    return { status: 'failed', error: `kie 查询任务失败：${result?.msg ?? `code ${result.code}`}` }
  }

  const data = result?.data ?? result ?? {}
  const rawState = String(data.state ?? data.status ?? '').toLowerCase()
  const status = STATE_MAP[rawState]

  if (!status) {
    // 未知状态按进行中处理，避免误判失败把任务提前终止
    return { status: 'processing' }
  }

  if (status === 'failed') {
    const msg = data.failMsg || data.error || data.failReason || data.msg || 'kie 生成失败'
    const code = data.failCode ? `[${data.failCode}] ` : ''
    return { status: 'failed', error: `${code}${msg}` }
  }

  if (status === 'completed') {
    const url = extractResultUrl(data)
    if (!url) return { status: 'failed', error: 'kie 任务成功但没有返回结果 URL' }
    return { status: 'completed', url }
  }

  return { status }
}

/** 从 data.resultJson 中取出第一个结果 URL（兼容多个历史字段名） */
export function extractResultUrl(data: any): string | null {
  const resultJson = data?.resultJson
  if (typeof resultJson === 'string' && resultJson.trim()) {
    try {
      const parsed = JSON.parse(resultJson)
      const urls = parsed?.resultUrls ?? parsed?.resultUrl
      if (Array.isArray(urls)) {
        const first = urls.find((u: unknown) => typeof u === 'string' && u)
        if (first) return first
      } else if (typeof urls === 'string' && urls) {
        return urls
      }
    } catch {
      // resultJson 不是合法 JSON —— 落到下面的兜底字段
    }
  }
  if (typeof data?.videoUrl === 'string' && data.videoUrl) return data.videoUrl
  const output = data?.output
  if (Array.isArray(output) && typeof output[0] === 'string') return output[0]
  if (typeof output === 'string' && output) return output
  return null
}

/** 轮询时上游返回的业务错误（如 recordInfo is null）直接暴露 */
export function parsePollError(result: any): string | null {
  if (result?.code !== undefined && result.code !== 200) {
    return `kie 查询任务失败：${result?.msg ?? `code ${result.code}`}`
  }
  return null
}
