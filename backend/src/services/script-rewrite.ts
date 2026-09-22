/**
 * 剧本改写任务 — 异步执行，按集跟踪
 *
 * 背景：改写是唯一「一次产出全部正文」的 Agent 任务（长剧本可达数万字），
 * 同步 HTTP 调用会同时踩两个超时：
 *  1) 前端→后端 这一跳等模型跑完才响应，长任务期间连接裸露在各类超时下；
 *  2) 后端→上游模型 这一跳 Node fetch(undici) 对「响应头未到达」有 300s 硬超时
 *     （UND_ERR_HEADERS_TIMEOUT，表现为无信息量的 "fetch failed"）。
 * 因此改为：接口立即返回 → 后台跑 Agent → 前端轮询状态（与 extract / video-prompts 一致）。
 *
 * 关键：改用 agent.stream() 而非 agent.generate()。
 * 流式下上游在开始推理前就返回 SSE 响应头，headersTimeout 不再适用、
 * bodyTimeout 每收到一个 chunk 就被重置，长任务因此不再被 300s 掐断。
 *
 * 成败以实际落库为准（改写是否真的写进了 episodes.script_content），
 * 因为 Agent 可能「正常结束但什么都没保存」——输出被 max_tokens 截断、
 * 或只顾输出正文却没生成 save_script 工具调用。
 *
 * 任务状态为进程内内存态：后端重启后运行中的任务状态丢失（Agent 调用本身已被中断）。
 */
import { eq } from 'drizzle-orm'
import { db, schema } from '../db/index.js'
import { mastra } from '../mastra/index.js'
import { buildAgentRequestContext } from '../agents/context.js'
import { describeError, logTaskError, logTaskProgress, logTaskStart, logTaskSuccess } from '../utils/task-logger.js'

export interface ScriptRewriteTask {
  status: 'running' | 'done' | 'error'
  started_at: string
  finished_at?: string
  error?: string
  /** 已执行步数（每一步 = 一轮模型输出，通常含一次工具调用） */
  steps: number
  /** 最近一步调用的工具名，用于前端显示「正在读取 / 正在保存」 */
  last_tool?: string
  /** 改写后的字数；以落库结果为准，未保存成功则不计 */
  word_count?: number
}

const tasks = new Map<number, ScriptRewriteTask>()

/** 发给 Agent 的指令是功能性提示词而非 UI 文案：产出语言由后端全局「内容语言」指令控制 */
const REWRITE_MESSAGE = '请读取剧本并改写为格式化剧本，然后保存'

/**
 * 启动异步改写任务（立即返回）；同集已在运行时返回 false
 * 可指定文本模型覆盖（沿用前端顶栏选择）
 */
export function startScriptRewrite(
  episodeId: number,
  dramaId: number,
  opts: { model?: string; configId?: number } = {},
): boolean {
  if (tasks.get(episodeId)?.status === 'running') return false

  const task: ScriptRewriteTask = {
    status: 'running',
    started_at: new Date().toISOString(),
    steps: 0,
  }
  tasks.set(episodeId, task)

  logTaskStart('Rewrite', 'script', {
    episodeId,
    dramaId,
    model: opts.model || undefined,
    configId: opts.configId || undefined,
  })

  ;(async () => {
    const agent = mastra.getAgent('script_rewriter')
    if (!agent) throw new Error('改写 Agent 不可用')
    const requestContext = buildAgentRequestContext({
      episodeId,
      dramaId,
      modelOverride: opts.model || undefined,
      textConfigId: opts.configId || undefined,
    })

    // 改写前的剧本内容：改写可能覆盖同名长度的旧稿，所以比对内容而非字数
    const [before] = await db.select().from(schema.episodes).where(eq(schema.episodes.id, episodeId))
    const beforeContent = before?.scriptContent || ''

    // 用 stream 而非 generate：见文件头说明（规避 undici 300s 响应头超时）
    const result = await agent.stream([{ role: 'user', content: REWRITE_MESSAGE }], {
      maxSteps: 20,
      requestContext,
      onStepFinish: (step: any) => {
        const tools = (step?.toolCalls || [])
          .map((t: any) => t?.toolName || t?.payload?.toolName)
          .filter(Boolean)
        task.steps++
        if (tools.length) task.last_tool = tools.join(',')
        logTaskProgress('Rewrite', 'step', {
          episodeId,
          step: task.steps,
          tools: tools.length ? tools.join(',') : undefined,
          text: (step?.text || '').slice(0, 200) || undefined,
        })
      },
    })
    // 必须消费完整个流，否则工具循环不会推进到底（保存工具可能根本没机会执行）
    const output = await result.getFullOutput()
    return { output, beforeContent }
  })()
    .then(async ({ output, beforeContent }: any) => {
      // 以实际落库为准判定成败：Agent 可能「正常结束但什么都没保存」
      // （输出被 max_tokens 截断、或没生成工具调用）
      let saved = ''
      try {
        const [fresh] = await db.select().from(schema.episodes).where(eq(schema.episodes.id, episodeId))
        saved = fresh?.scriptContent || ''
      } catch { /* 读取失败按未保存处理 */ }

      if (!saved.trim() || saved === beforeContent) {
        task.status = 'error'
        task.finished_at = new Date().toISOString()
        task.error = '改写完成但未保存内容，请重试'
        logTaskError('Rewrite', 'script', {
          episodeId,
          steps: task.steps,
          savedLen: saved.length,
          beforeLen: beforeContent.length,
          savedToolCalled: task.last_tool?.includes('save_script') || false,
          reply: (output?.text || '').slice(0, 300) || undefined,
        })
        return
      }

      task.status = 'done'
      task.finished_at = new Date().toISOString()
      task.word_count = saved.length
      logTaskSuccess('Rewrite', 'script', {
        episodeId,
        steps: task.steps,
        wordCount: saved.length,
        beforeLen: beforeContent.length,
      })
    })
    .catch((err: any) => {
      task.status = 'error'
      task.finished_at = new Date().toISOString()
      // 顶层 message 往往只是「Agent 执行失败」，真正原因在 cause 链最内层
      // （如 UND_ERR_HEADERS_TIMEOUT / 401），这里展开后落进任务状态与日志
      const info = describeError(err)
      task.error = info.code ? `${info.message} (${info.code})` : info.message
      logTaskError('Rewrite', 'script', {
        episodeId,
        steps: task.steps,
        name: info.name,
        code: info.code,
        error: info.message,
      })
      logTaskError('Rewrite', 'script cause-chain', { episodeId, chain: info.causeChain.join(' <- ') })
    })

  return true
}

/** 查询某集的改写任务状态（未启动过为 null） */
export function getScriptRewriteStatus(episodeId: number): ScriptRewriteTask | null {
  return tasks.get(episodeId) || null
}
