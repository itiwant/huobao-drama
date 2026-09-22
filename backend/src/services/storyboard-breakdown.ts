/**
 * 分镜拆解任务 — 异步执行，按集跟踪
 *
 * 与 script-rewrite 同理：拆解要一次产出整集分镜（分批多次调用 save_storyboards），
 * 是长耗时 Agent 任务，同步 HTTP 调用会同时踩前端/上游两侧超时，因此改为
 * 「接口立即返回 → 后台跑 Agent → 前端轮询状态」。
 *
 * 关键：用 agent.stream() 而非 agent.generate()。
 * 流式下上游在开始推理前就返回 SSE 响应头，headersTimeout 不再适用、
 * bodyTimeout 每收到一个 chunk 就被重置；只要模型持续吐 token（真实模型如此），
 * 长任务就不会被 undici 的 300s 超时掐断。
 *
 * 成败判定：以「是否真的调用了 save_storyboards 且库里确有分镜」为准，
 * 因为 Agent 可能「正常结束但什么都没保存」（输出被截断、或只顾输出正文没生成工具调用）。
 *
 * 任务状态为进程内内存态：后端重启后运行中的任务状态丢失（Agent 调用本身已被中断）。
 */
import { eq } from 'drizzle-orm'
import { db, schema } from '../db/index.js'
import { mastra } from '../mastra/index.js'
import { buildAgentRequestContext } from '../agents/context.js'
import { describeError, logTaskError, logTaskProgress, logTaskStart, logTaskSuccess } from '../utils/task-logger.js'

export interface StoryboardBreakdownTask {
  status: 'running' | 'done' | 'error'
  started_at: string
  finished_at?: string
  error?: string
  /** 已执行步数（每一步 = 一轮模型输出，通常含一次工具调用） */
  steps: number
  /** 最近一步调用的工具名，用于前端显示「正在读取 / 正在保存」 */
  last_tool?: string
  /** 拆解后落库的分镜段数；未保存成功则不计 */
  storyboard_count?: number
}

const tasks = new Map<number, StoryboardBreakdownTask>()

/**
 * 拆解指令：角色/场景/道具清单由后端现查（与 read_storyboard_context 同源），
 * 避免前端传入的列表随页面停留而过期。
 */
async function buildBreakdownMessage(episodeId: number, dramaId: number, videoModelLabel: string): Promise<string> {
  const [ep] = await db.select().from(schema.episodes).where(eq(schema.episodes.id, episodeId))
  const script = ep?.scriptContent || ep?.content || ''

  const charLinks = await db.select().from(schema.episodeCharacters)
    .where(eq(schema.episodeCharacters.episodeId, episodeId))
  const sceneLinks = await db.select().from(schema.episodeScenes)
    .where(eq(schema.episodeScenes.episodeId, episodeId))
  const propLinks = await db.select().from(schema.episodeProps)
    .where(eq(schema.episodeProps.episodeId, episodeId))

  const linkedCharIds = new Set(charLinks.map(l => l.characterId))
  const linkedSceneIds = new Set(sceneLinks.map(l => l.sceneId))
  const linkedPropIds = new Set(propLinks.map(l => l.propId))

  const chars = (await db.select().from(schema.characters).where(eq(schema.characters.dramaId, dramaId)))
    .filter(c => !c.deletedAt && (!linkedCharIds.size || linkedCharIds.has(c.id)))
  const scns = (await db.select().from(schema.scenes).where(eq(schema.scenes.dramaId, dramaId)))
    .filter(s => !s.deletedAt && (!linkedSceneIds.size || linkedSceneIds.has(s.id)))
  const prps = (await db.select().from(schema.props).where(eq(schema.props.dramaId, dramaId)))
    .filter(p => !p.deletedAt && (!linkedPropIds.size || linkedPropIds.has(p.id)))

  const charList = chars.length ? chars.map(c => `${c.name}(ID:${c.id})`).join('、') : '（当前集还没有角色）'
  const sceneList = scns.length
    ? scns.map(s => `${s.location} · ${s.time || '未设时间'}(ID:${s.id})`).join('、')
    : '（当前集还没有场景）'
  const propList = prps.length ? prps.map(p => `${p.name}(ID:${p.id})`).join('、') : '（当前集还没有道具）'

  return `请基于当前集剧本拆分分镜，并为每个分镜段落同时生成 video_prompt（视频生成提示词）。
本次视频模型：${videoModelLabel}，请按该模型的特性与时长限制生成 video_prompt。

当前集已有角色：${charList}
当前集已有场景：${sceneList}
当前集已有道具：${propList}

绑定要求：
- 每个镜头必须根据剧本内容，从上述当前集已有角色中选出出场的角色绑定 character_ids（ID 必须来自上述列表；有角色出场就必须绑定，不要遗漏）
- 每个镜头尽量匹配上述已有场景填写 scene_id（ID 必须来自上述列表），不要凭空创造新场景
- 每个镜头出现关键道具（被使用、交接、特写或在画面中明显可见）时，从上述当前集已有道具中绑定 prop_ids（ID 必须来自上述列表）；没有道具出现可传空数组
- 只有纯环境空镜头才可以不绑定角色

剧本长度：${script.length} 字。`
}

/**
 * 启动异步拆解任务（立即返回）；同集已在运行时返回 false
 * videoModelLabel 由前端传入（顶栏所选视频模型是生成时的实际取值）
 */
export function startStoryboardBreakdown(
  episodeId: number,
  dramaId: number,
  opts: { model?: string; configId?: number; videoModelLabel?: string } = {},
): boolean {
  if (tasks.get(episodeId)?.status === 'running') return false

  const task: StoryboardBreakdownTask = {
    status: 'running',
    started_at: new Date().toISOString(),
    steps: 0,
  }
  tasks.set(episodeId, task)

  logTaskStart('Breakdown', 'storyboard', {
    episodeId,
    dramaId,
    model: opts.model || undefined,
    configId: opts.configId || undefined,
    videoModel: opts.videoModelLabel || undefined,
  })

  ;(async () => {
    const agent = mastra.getAgent('storyboard_breaker')
    if (!agent) throw new Error('分镜拆解 Agent 不可用')
    const requestContext = buildAgentRequestContext({
      episodeId,
      dramaId,
      modelOverride: opts.model || undefined,
      textConfigId: opts.configId || undefined,
    })
    const message = await buildBreakdownMessage(episodeId, dramaId, opts.videoModelLabel || '默认')

    // 记录是否真的调用过保存工具：Agent 可能只输出正文而不落库
    let saveCalled = false

    const result = await agent.stream([{ role: 'user', content: message }], {
      maxSteps: 20,
      requestContext,
      onStepFinish: (step: any) => {
        const tools = (step?.toolCalls || [])
          .map((t: any) => t?.toolName || t?.payload?.toolName)
          .filter(Boolean)
        task.steps++
        if (tools.length) task.last_tool = tools.join(',')
        if (tools.some((t: string) => t.includes('save_storyboards'))) saveCalled = true
        logTaskProgress('Breakdown', 'step', {
          episodeId,
          step: task.steps,
          tools: tools.length ? tools.join(',') : undefined,
          text: (step?.text || '').slice(0, 200) || undefined,
        })
      },
    })
    // 必须消费完整个流，否则工具循环不会推进到底（分批保存可能只完成一部分）
    const output = await result.getFullOutput()
    return { output, saveCalled }
  })()
    .then(async ({ output, saveCalled }: any) => {
      // 以实际落库为准判定成败
      let count = 0
      try {
        const rows = await db.select().from(schema.storyboards)
          .where(eq(schema.storyboards.episodeId, episodeId))
        count = rows.filter(sb => !sb.deletedAt).length
      } catch { /* 读取失败按未保存处理 */ }

      if (!saveCalled || count === 0) {
        task.status = 'error'
        task.finished_at = new Date().toISOString()
        task.error = '拆解完成但未保存分镜，请重试'
        logTaskError('Breakdown', 'storyboard', {
          episodeId,
          steps: task.steps,
          saveCalled,
          count,
          reply: (output?.text || '').slice(0, 300) || undefined,
        })
        return
      }

      task.status = 'done'
      task.finished_at = new Date().toISOString()
      task.storyboard_count = count
      logTaskSuccess('Breakdown', 'storyboard', { episodeId, steps: task.steps, storyboards: count })
    })
    .catch((err: any) => {
      task.status = 'error'
      task.finished_at = new Date().toISOString()
      // 顶层 message 往往只是「Agent 执行失败」，真正原因在 cause 链最内层
      const info = describeError(err)
      task.error = info.code ? `${info.message} (${info.code})` : info.message
      logTaskError('Breakdown', 'storyboard', {
        episodeId,
        steps: task.steps,
        name: info.name,
        code: info.code,
        error: info.message,
      })
      logTaskError('Breakdown', 'storyboard cause-chain', { episodeId, chain: info.causeChain.join(' <- ') })
    })

  return true
}

/** 查询某集的拆解任务状态（未启动过为 null） */
export function getStoryboardBreakdownStatus(episodeId: number): StoryboardBreakdownTask | null {
  return tasks.get(episodeId) || null
}
