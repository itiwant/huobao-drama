import assert from 'node:assert/strict'
import { test, mock } from 'node:test'
import { KieImageAdapter, KieVideoAdapter } from '../src/services/adapters/kie/index.ts'

const imageAdapter = new KieImageAdapter()
const videoAdapter = new KieVideoAdapter()

const config = {
  provider: 'kie',
  baseUrl: 'https://api.kie.ai',
  apiKey: 'sk-test',
  model: 'nano-banana-2',
}

const videoConfig = {
  provider: 'kie',
  baseUrl: 'https://api.kie.ai',
  apiKey: 'sk-test',
  model: 'seedance-2',
}

// ── 图片 ─────────────────────────────────────────────────────────────────────

test('kie image request posts to the unified createTask endpoint', async () => {
  const request = await imageAdapter.buildGenerateRequest(config, {
    id: 1,
    prompt: '一只猫',
    size: '1920x1080',
  })

  assert.equal(request.url, 'https://api.kie.ai/api/v1/jobs/createTask')
  assert.equal(request.method, 'POST')
  assert.equal(request.headers.Authorization, 'Bearer sk-test')
  assert.equal(request.body.model, 'nano-banana-2')
  assert.equal(request.body.input.prompt, '一只猫')
  assert.equal(request.body.input.aspect_ratio, '16:9')
  // 画质档位按模型的 qualityMap 转换
  assert.equal(request.body.input.quality, 'basic')
  assert.equal(request.body.input.output_format, 'jpg')
})

test('kie image model without reference images switches to its text-only variant', async () => {
  const request = await imageAdapter.buildGenerateRequest(
    { ...config, model: 'seedream-5-pro' },
    { id: 2, prompt: '山水', size: '1024x1024' },
  )

  // 无参考图 → t2i 变体，且不发送图片字段
  assert.equal(request.body.model, 'seedream/5-pro-text-to-image')
  assert.equal(request.body.input.image_urls, undefined)
})

test('kie image model with reference images keeps the i2i variant and uploads them', async () => {
  const uploaded = 'https://tempfile.redpandaai.co/huobao/ref.png'
  mock.method(globalThis, 'fetch', async (url: string | URL | Request) => {
    assert.match(String(url), /kieai\.redpandaai\.co\/api\/file-base64-upload/)
    return new Response(JSON.stringify({ code: 200, data: { downloadUrl: uploaded } }), { status: 200 })
  })

  try {
    const request = await imageAdapter.buildGenerateRequest(
      { ...config, model: 'seedream-5-pro' },
      // data URL 是 generation.ts 压缩参考图后的形态，kie 不能直接吃
      { id: 3, prompt: '山水', size: '1024x1024', referenceImages: JSON.stringify(['data:image/jpeg;base64,AAAA']) },
    )

    assert.equal(request.body.model, 'seedream/5-pro-image-to-image')
    assert.deepEqual(request.body.input.image_urls, [uploaded])
  } finally {
    mock.restoreAll()
  }
})

test('kie derives the aspect ratio from pixel size and snaps to a supported value', async () => {
  // 1920x1080 → 16:9，模型支持 → 原样送出
  const exact = await imageAdapter.buildGenerateRequest(config, { id: 20, prompt: 'x', size: '1920x1080' })
  assert.equal(exact.body.input.aspect_ratio, '16:9')

  // 5:4 不在 nano-banana-2 的枚举里 → 就近落到 4:3（差值 0.083，小于到 3:2 的 0.25）
  const snapped = await imageAdapter.buildGenerateRequest(config, { id: 21, prompt: 'x', size: '1280x1024' })
  assert.equal(snapped.body.input.aspect_ratio, '4:3')

  // 1920x1920 是 1:1，在枚举内
  const square = await imageAdapter.buildGenerateRequest(config, { id: 22, prompt: 'x', size: '1920x1920' })
  assert.equal(square.body.input.aspect_ratio, '1:1')

  // 缺失 size 时退回 16:9，而不是把 "1920x1080" 原样当比例发出去
  const fallback = await imageAdapter.buildGenerateRequest(config, { id: 23, prompt: 'x' })
  assert.equal(fallback.body.input.aspect_ratio, '16:9')
})

test('kie maps the ratio field to the model-specific key', async () => {
  // google-nano-banana 用 image_size 而非 aspect_ratio
  const request = await imageAdapter.buildGenerateRequest(
    { ...config, model: 'google-nano-banana' },
    { id: 24, prompt: 'x', size: '1024x1024' },
  )

  assert.equal(request.body.input.image_size, '1:1')
  assert.equal(request.body.input.aspect_ratio, undefined)
})

test('kie rejects an unknown image model', async () => {
  await assert.rejects(
    () => imageAdapter.buildGenerateRequest({ ...config, model: 'not-a-model' }, { id: 4, prompt: 'x' }),
    /不支持的图片模型/,
  )
})

test('kie reports an upload failure instead of silently dropping a reference', async () => {
  mock.method(globalThis, 'fetch', async () => new Response('{}', { status: 500 }))

  try {
    await assert.rejects(
      () => imageAdapter.buildGenerateRequest(
        { ...config, model: 'seedream-5-pro' },
        // 用与上一个用例不同的 data URL —— 相同输入会命中上传缓存而不发请求
        { id: 5, prompt: '山水', referenceImages: JSON.stringify(['data:image/jpeg;base64,BBBB']) },
      ),
      /参考素材上传失败/,
    )
  } finally {
    mock.restoreAll()
  }
})

test('kie uploads the same reference only once across calls', async () => {
  let calls = 0
  mock.method(globalThis, 'fetch', async () => {
    calls++
    return new Response(
      JSON.stringify({ code: 200, data: { downloadUrl: 'https://tempfile.redpandaai.co/huobao/cached.png' } }),
      { status: 200 },
    )
  })

  try {
    const ref = JSON.stringify(['data:image/jpeg;base64,CCCC'])
    await imageAdapter.buildGenerateRequest(
      { ...config, model: 'seedream-5-pro' },
      { id: 6, prompt: 'a', referenceImages: ref },
    )
    await imageAdapter.buildGenerateRequest(
      { ...config, model: 'seedream-5-pro' },
      { id: 7, prompt: 'b', referenceImages: ref },
    )

    assert.equal(calls, 1)
  } finally {
    mock.restoreAll()
  }
})

// ── 视频 ─────────────────────────────────────────────────────────────────────

test('kie Seedance video request maps frames and reference arrays', async () => {
  const request = await videoAdapter.buildGenerateRequest(videoConfig, {
    id: 10,
    prompt: '镜头推进',
    firstFrameUrl: 'https://example.com/first.png',
    duration: 8,
    aspectRatio: '16:9',
    resolution: '720p',
    generateAudio: 1,
  })

  assert.equal(request.url, 'https://api.kie.ai/api/v1/jobs/createTask')
  assert.equal(request.body.model, 'bytedance/seedance-2')
  assert.equal(request.body.input.prompt, '镜头推进')
  assert.equal(request.body.input.first_frame_url, 'https://example.com/first.png')
  assert.equal(request.body.input.duration, 8)
  assert.equal(request.body.input.resolution, '720p')
  assert.equal(request.body.input.generate_audio, true)
  assert.equal(request.body.input.web_search, false)
})

test('kie Seedance omits reference images when a first frame is present (mutually exclusive)', async () => {
  const request = await videoAdapter.buildGenerateRequest(videoConfig, {
    id: 11,
    prompt: 'x',
    firstFrameUrl: 'https://example.com/first.png',
    referenceImageUrls: JSON.stringify(['https://example.com/ref.png']),
    duration: 5,
  })

  assert.equal(request.body.input.first_frame_url, 'https://example.com/first.png')
  assert.equal(request.body.input.reference_image_urls, undefined)
})

test('kie Kling sends duration as a string and maps the mode field', async () => {
  const request = await videoAdapter.buildGenerateRequest(
    { ...videoConfig, model: 'kling-3.0' },
    { id: 12, prompt: 'x', firstFrameUrl: 'https://example.com/f.png', duration: 10, resolution: '1080p' },
  )

  assert.equal(request.body.model, 'kling-3.0/video')
  assert.equal(request.body.input.duration, '10')
  assert.equal(request.body.input.mode, 'pro')
  // 首帧合并进 image_urls
  assert.deepEqual(request.body.input.image_urls, ['https://example.com/f.png'])
})

test('kie Kling Turbo switches to the image-to-video model when a frame is present', async () => {
  const withFrame = await videoAdapter.buildGenerateRequest(
    { ...videoConfig, model: 'kling-3.0-turbo' },
    { id: 13, prompt: 'x', firstFrameUrl: 'https://example.com/f.png', duration: 5 },
  )
  assert.equal(withFrame.body.model, 'kling/v3-turbo-image-to-video')
  assert.deepEqual(withFrame.body.input.image_urls, ['https://example.com/f.png'])

  const withoutFrame = await videoAdapter.buildGenerateRequest(
    { ...videoConfig, model: 'kling-3.0-turbo' },
    { id: 14, prompt: 'x', duration: 5, aspectRatio: '9:16' },
  )
  assert.equal(withoutFrame.body.model, 'kling/v3-turbo-text-to-video')
  assert.equal(withoutFrame.body.input.aspect_ratio, '9:16')
  assert.equal(withoutFrame.body.input.image_urls, undefined)
})

test('kie snaps resolution to what the model actually accepts', async () => {
  const build = (model: string, resolution: string) =>
    videoAdapter.buildGenerateRequest(
      { ...videoConfig, model },
      { id: 30, prompt: 'x', firstFrameUrl: 'https://example.com/f.png', duration: 5, resolution },
    )

  // Seedance Mini 最高 720p —— 1080p 必须收敛，否则上游 422
  const mini = await build('seedance-2-mini', '1080p')
  assert.equal(mini.body.input.resolution, '720p')

  // MiniMax 用自己的枚举 768P/2K，项目内 1080p 对应 2K
  const minimax = await build('minimax-h3', '1080p')
  assert.equal(minimax.body.input.resolution, '2K')
  const minimaxLow = await build('minimax-h3', '480p')
  assert.equal(minimaxLow.body.input.resolution, '768P')

  // Seedance 2.5 只到 720p
  const s25 = await build('seedance-2-5', '1080p')
  assert.equal(s25.body.input.resolution, '720p')

  // Grok 只到 720p
  const grok = await build('grok-imagine', '1080p')
  assert.equal(grok.body.input.resolution, '720p')
})

test('kie Kling maps resolution onto its std/pro/4K mode field', async () => {
  const build = (resolution: string) =>
    videoAdapter.buildGenerateRequest(
      { ...videoConfig, model: 'kling-3.0' },
      { id: 31, prompt: 'x', firstFrameUrl: 'https://example.com/f.png', duration: 5, resolution },
    )

  assert.equal((await build('720p')).body.input.mode, 'std')
  assert.equal((await build('1080p')).body.input.mode, 'pro')
  assert.equal((await build('4k')).body.input.mode, '4K')
})

test('kie clamps duration into the model range', async () => {
  const request = await videoAdapter.buildGenerateRequest(videoConfig, {
    id: 15,
    prompt: 'x',
    duration: 999,
    aspectRatio: '16:9',
  })

  // seedance-2 的 durationMax 是 15
  assert.equal(request.body.input.duration, 15)
})

test('kie rejects an unknown video model', async () => {
  await assert.rejects(
    () => videoAdapter.buildGenerateRequest({ ...videoConfig, model: 'nope' }, { id: 16, prompt: 'x' }),
    /不支持的视频模型/,
  )
})

// ── 轮询 ─────────────────────────────────────────────────────────────────────

test('kie parses the createTask response', () => {
  assert.deepEqual(
    imageAdapter.parseGenerateResponse({ code: 200, msg: 'success', data: { taskId: 'task_abc' } }),
    { isAsync: true, taskId: 'task_abc' },
  )

  // 业务错误码出现在 200 响应体里也要抛
  assert.throws(
    () => imageAdapter.parseGenerateResponse({ code: 402, msg: 'insufficient credits' }),
    /insufficient credits/,
  )
})

test('kie maps every recordInfo state to the internal poll status', () => {
  // success 必须带结果才有意义（无结果会被判为失败，另有单独用例覆盖）
  const result = JSON.stringify({ resultUrls: ['https://example.com/out.png'] })
  const state = (s: string) =>
    imageAdapter.parsePollResponse({ code: 200, data: { state: s, resultJson: result } }).status

  assert.equal(state('waiting'), 'pending')
  assert.equal(state('queuing'), 'pending')
  assert.equal(state('generating'), 'processing')
  assert.equal(state('success'), 'completed')
  assert.equal(state('fail'), 'failed')
})

test('kie parses resultJson (a JSON string) for image and video results', () => {
  const payload = {
    code: 200,
    data: {
      state: 'success',
      resultJson: JSON.stringify({ resultUrls: ['https://example.com/out.png'] }),
    },
  }

  assert.deepEqual(imageAdapter.parsePollResponse(payload), {
    status: 'completed',
    imageUrl: 'https://example.com/out.png',
    error: undefined,
  })
  assert.deepEqual(videoAdapter.parsePollResponse(payload), {
    status: 'completed',
    videoUrl: 'https://example.com/out.png',
    error: undefined,
  })
})

test('kie surfaces failCode and failMsg on failure', () => {
  const parsed = imageAdapter.parsePollResponse({
    code: 200,
    data: { state: 'fail', failCode: 'GENERATION_FAILED', failMsg: 'The generation task failed.' },
  })

  assert.equal(parsed.status, 'failed')
  assert.match(parsed.error!, /GENERATION_FAILED/)
  assert.match(parsed.error!, /The generation task failed/)
})

test('kie treats a succeeded task with no result URL as failed', () => {
  const parsed = imageAdapter.parsePollResponse({ code: 200, data: { state: 'success' } })
  assert.equal(parsed.status, 'failed')
  assert.match(parsed.error!, /没有返回结果 URL/)
})

test('kie buildPollRequest hits recordInfo with the task id', () => {
  const request = imageAdapter.buildPollRequest(config, 'task/with space')
  assert.equal(request.method, 'GET')
  // searchParams 按 application/x-www-form-urlencoded 编码，空格写作 +
  assert.equal(request.url, 'https://api.kie.ai/api/v1/jobs/recordInfo?taskId=task%2Fwith+space')
  assert.equal(request.headers.Authorization, 'Bearer sk-test')
})

test('kie never returns base64 image data', () => {
  assert.equal(imageAdapter.extractImageBase64(), null)
})
