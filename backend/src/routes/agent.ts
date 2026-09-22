/**
 * Agent 聊天路由 — 非流式版本
 */
import { Hono } from 'hono'
import { validAgentTypes } from '../agents/index.js'
import { buildAgentRequestContext } from '../agents/context.js'
import { mastra } from '../mastra/index.js'
import { success, badRequest } from '../utils/response.js'
import { describeError, logTaskError, logTaskPayload, logTaskProgress, logTaskStart, logTaskSuccess } from '../utils/task-logger.js'

const app = new Hono()

// Mastra v1.17 的 ToolCallChunk / ToolResultChunk 结构：
// { type: 'tool-call', payload: { toolCallId, toolName, args } }
// { type: 'tool-result', payload: { toolCallId, toolName, result, isError } }
function normalizeToolName(entry: any) {
  return entry?.payload?.toolName
    || entry?.toolName
    || entry?.tool?.toolName
    || entry?.tool?.id
    || entry?.name
    || entry?.type
    || null
}

function normalizeToolResult(entry: any) {
  const result = entry?.payload?.result ?? entry?.result ?? entry?.payload?.output ?? entry?.output ?? entry?.data ?? null
  return typeof result === 'string' ? result : JSON.stringify(result)
}

// POST /agent/:type/chat — 非流式 Agent 对话
app.post('/:type/chat', async (c) => {
  const agentType = c.req.param('type')
  if (!validAgentTypes.includes(agentType)) {
    return badRequest(c, `无效的 Agent 类型：${agentType}`)
  }

  const body = await c.req.json()
  const { message, drama_id, episode_id } = body

  logTaskStart('Agent', agentType, {
    dramaId: drama_id,
    episodeId: episode_id,
    message,
  })
  logTaskPayload('Agent', `${agentType} input`, body)

  if (!episode_id || !drama_id) {
    logTaskError('Agent', agentType, { reason: 'missing drama_id or episode_id' })
    return badRequest(c, '需要 drama_id 与 episode_id')
  }

  const agent = mastra.getAgent(agentType)
  if (!agent) {
    logTaskError('Agent', agentType, { reason: 'agent not found' })
    return badRequest(c, 'Agent 不存在')
  }

  const requestContext = buildAgentRequestContext({
    episodeId: episode_id,
    dramaId: drama_id,
    modelOverride: body.model || undefined,
    textConfigId: body.config_id || undefined,
  })

  const startTime = performance.now()

  // 心跳：单次 AI 调用可能长达数分钟（改写长剧本时尤其明显），
  // 没有心跳就无法区分「模型仍在生成」和「请求已挂死」。
  // 打点间隔同时也是判定 Node fetch 300s 头超时（UND_ERR_HEADERS_TIMEOUT）的时间依据。
  const heartbeat = setInterval(() => {
    logTaskProgress('Agent', 'waiting', {
      agentType,
      elapsedSeconds: ((performance.now() - startTime) / 1000).toFixed(0),
    })
  }, 15_000)
  heartbeat.unref?.()

  try {
    const result = await agent.generate(
      [{ role: 'user', content: message }],
      {
        maxSteps: 20,
        requestContext,
        // 每步打印工具调用：可看出模型走到「读取」还是「保存」，
        // 断开时能判断是首轮请求就超时，还是多轮循环中途失败
        onStepFinish: (step: any) => {
          const tools = (step?.toolCalls || [])
            .map((t: any) => t?.toolName || t?.payload?.toolName)
            .filter(Boolean)
          logTaskProgress('Agent', `${agentType}-step`, {
            elapsedSeconds: ((performance.now() - startTime) / 1000).toFixed(1),
            tools: tools.length ? tools.join(',') : undefined,
            text: (step?.text || '').slice(0, 200) || undefined,
          })
        },
      },
    )

    const elapsed = ((performance.now() - startTime) / 1000).toFixed(1)
    logTaskSuccess('Agent', agentType, { elapsedSeconds: elapsed })

    // 收集所有 tool calls 和 results
    const toolCalls = result.toolCalls || []
    const toolResults = result.toolResults || []
    const normalizedToolCalls = toolCalls.map((tc: any) => ({
      toolName: normalizeToolName(tc),
      args: tc?.payload?.args ?? tc?.args ?? tc?.input ?? null,
    }))
    const normalizedToolResults = toolResults.map((tr: any) => ({
      toolName: normalizeToolName(tr),
      result: normalizeToolResult(tr),
    }))

    logTaskProgress('Agent', 'tool-summary', {
      agentType,
      toolCalls: normalizedToolCalls.map((tc: any) => tc.toolName),
      toolResults: normalizedToolResults.map((tr: any) => tr.toolName),
    })
    logTaskPayload('Agent', `${agentType} tool-results`, normalizedToolResults)

    return success(c, {
      type: 'done',
      text: result.text || '',
      toolCalls: normalizedToolCalls,
      toolResults: normalizedToolResults,
    })
  } catch (err: any) {
    const elapsed = ((performance.now() - startTime) / 1000).toFixed(1)
    // 顶层 message 往往只是「Agent 执行失败」，真正原因在 cause 链最内层
    const info = describeError(err)
    logTaskError('Agent', agentType, {
      elapsedSeconds: elapsed,
      name: info.name,
      error: info.message,
      code: info.code,
    })
    logTaskError('Agent', `${agentType} cause-chain`, {
      chain: info.causeChain.join(' <- '),
    })
    console.error(err.stack || err)
    return badRequest(c, err.message || 'Agent 执行失败')
  } finally {
    clearInterval(heartbeat)
  }
})

// GET /agent/:type/debug
app.get('/:type/debug', async (c) => {
  const agentType = c.req.param('type')
  if (!validAgentTypes.includes(agentType)) return badRequest(c, '无效的 Agent 类型')
  return success(c, { agent_type: agentType, valid: true })
})

export default app
