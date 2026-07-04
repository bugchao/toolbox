import { spawn, spawnSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

// 纯本地会议声音转写：BlackHole 虚拟声卡 -> whisper-stream(whisper.cpp) -> SSE 推给前端。
// 纪要总结走本地 Ollama，全链路不出本机。
const WHISPER_BIN = process.env.WHISPER_STREAM_BIN || 'whisper-stream'
const MODEL_NAME = process.env.WHISPER_MODEL || 'base'
const MODEL_DIR = process.env.WHISPER_MODEL_DIR || path.join(os.homedir(), '.cache', 'whisper-cpp')
const MODEL_PATH = path.join(MODEL_DIR, `ggml-${MODEL_NAME}.bin`)
const MODEL_URL = `https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-${MODEL_NAME}.bin`
const OLLAMA_URL = process.env.OLLAMA_URL || 'http://127.0.0.1:11434'

const ANSI_RE = /\x1B\[[0-9;]*[A-Za-z]/g

// whisper-stream stdout -> 一段转写文本；非文本行（日志/标记/纯音效标注）返回 null
export function parseTranscriptLine(line) {
  const clean = String(line).replace(ANSI_RE, '').replace(/\r/g, '').trim()
  if (!clean || clean.startsWith('###')) return null
  const timestamped = clean.match(/^\[[\d:.,]+\s*-->\s*[\d:.,]+\]\s*(.*)$/)
  const text = (timestamped ? timestamped[1] : clean).trim()
  if (!text) return null
  if (/^[[(][^\])]{0,60}[\])]$/.test(text)) return null // [BLANK_AUDIO]、(音乐) 之类
  return text
}

// whisper-stream 启动时打到 stderr 的 SDL 设备列表
export function parseCaptureDevices(stderrText) {
  const devices = []
  const re = /Capture device #(\d+): '([^']+)'/g
  let match
  while ((match = re.exec(String(stderrText)))) {
    devices.push({ id: Number(match[1]), name: match[2] })
  }
  return devices
}

export function pickOllamaModel(tagNames) {
  if (process.env.OLLAMA_MODEL) return process.env.OLLAMA_MODEL
  const chatModels = tagNames.filter((n) => !/embed/i.test(n))
  return chatModels.find((n) => /qwen/i.test(n)) || chatModels[0] || null
}

// 注：不能用 `whisper-stream -h` 探测，部分 build 的 -h 不退出会挂住
function binaryAvailable() {
  if (WHISPER_BIN.includes('/')) return fs.existsSync(WHISPER_BIN)
  return spawnSync('which', [WHISPER_BIN], { stdio: 'ignore' }).status === 0
}

// 用 curl 下载而非 node fetch：fetch 不走 HTTPS_PROXY，代理环境下会直接失败
async function ensureModel(onProgress) {
  if (fs.existsSync(MODEL_PATH)) return
  fs.mkdirSync(MODEL_DIR, { recursive: true })
  const tmpPath = `${MODEL_PATH}.download`
  fs.rmSync(tmpPath, { force: true })
  const head = spawnSync('curl', ['-sIL', MODEL_URL], { encoding: 'utf8', timeout: 15000 })
  const total = Number([...(head.stdout || '').matchAll(/content-length: *(\d+)/gi)].pop()?.[1]) || 0
  await new Promise((resolve, reject) => {
    const child = spawn('curl', ['-fsSL', '--retry', '2', '-o', tmpPath, MODEL_URL])
    const poll = setInterval(() => {
      const size = fs.existsSync(tmpPath) ? fs.statSync(tmpPath).size : 0
      onProgress(total ? Math.min(99, Math.floor((size / total) * 100)) : 0)
    }, 1000)
    child.on('error', (error) => {
      clearInterval(poll)
      reject(error)
    })
    child.on('exit', (code) => {
      clearInterval(poll)
      if (code === 0) resolve()
      else reject(new Error(`whisper 模型下载失败（curl exit ${code}）`))
    })
  })
  onProgress(100)
  fs.renameSync(tmpPath, MODEL_PATH)
}

// whisper-stream 只接受设备序号，探测一次拿列表：设备列表打印在模型加载前，见到 "attempt to open" 即可杀掉。
// 超时要盖过 Metal backend 初始化（实测 6 秒+）
function probeDevices() {
  return new Promise((resolve, reject) => {
    const child = spawn(WHISPER_BIN, ['-m', MODEL_PATH, '-c', '-1'])
    let stderr = ''
    const finish = () => {
      clearTimeout(timer)
      child.kill('SIGKILL')
      resolve(parseCaptureDevices(stderr))
    }
    const timer = setTimeout(finish, 20000)
    child.stderr.on('data', (data) => {
      stderr += data
      if (/attempt(ing)? to open/i.test(stderr)) finish()
    })
    child.on('error', (error) => {
      clearTimeout(timer)
      reject(error)
    })
    child.on('exit', finish)
  })
}

function killChild(child) {
  child.kill('SIGTERM')
  const force = setTimeout(() => child.kill('SIGKILL'), 2000)
  child.on('exit', () => clearTimeout(force))
}

async function fetchOllamaTags(timeoutMs = 1500) {
  const res = await fetch(`${OLLAMA_URL}/api/tags`, { signal: AbortSignal.timeout(timeoutMs) })
  if (!res.ok) throw new Error(`Ollama HTTP ${res.status}`)
  const tags = (await res.json()).models ?? []
  return tags.map((tag) => tag.name)
}

async function handleStatus() {
  let ollamaModel = null
  try {
    ollamaModel = pickOllamaModel(await fetchOllamaTags(1000))
  } catch {
    // Ollama 未运行，纪要走前端规则提取兜底
  }
  return {
    binary: binaryAvailable(),
    model: fs.existsSync(MODEL_PATH),
    modelName: MODEL_NAME,
    ollamaModel,
  }
}

async function handleStream(req, res, url) {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
  })
  const send = (event, data) => res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
  const heartbeat = setInterval(() => res.write(':ping\n\n'), 15000)
  let child = null
  let closed = false
  const shutdown = () => {
    closed = true
    clearInterval(heartbeat)
    if (child) killChild(child)
  }
  req.on('close', shutdown)

  const fail = (message) => {
    if (!closed) {
      send('error', { message })
      res.end()
    }
    shutdown()
  }

  try {
    if (!binaryAvailable()) {
      fail('未找到 whisper-stream，请先 brew install whisper-cpp')
      return
    }
    if (!fs.existsSync(MODEL_PATH)) {
      send('status', { message: `首次使用，正在下载 whisper 模型（${MODEL_NAME}）` })
      await ensureModel((percent) => {
        if (!closed) send('model', { progress: percent })
      })
    }
    if (closed) return

    send('status', { message: '正在探测音频输入设备' })
    const devices = await probeDevices()
    if (closed) return
    const requested = url.searchParams.get('device')
    const device = requested
      ? devices.find((d) => d.id === Number(requested))
      : devices.find((d) => /blackhole/i.test(d.name))
    if (!device) {
      const found = devices.map((d) => `#${d.id} ${d.name}`).join('、') || '无'
      fail(`未找到 BlackHole 输入设备（当前设备：${found}）。请 brew install blackhole-2ch，并在“音频 MIDI 设置”中创建含 BlackHole 的多输出设备后重试`)
      return
    }

    const lang = url.searchParams.get('lang') || 'zh'
    child = spawn(WHISPER_BIN, [
      '-m', MODEL_PATH,
      '-c', String(device.id),
      '-l', lang,
      // VAD 分段模式：说完一句出一段，whisper.cpp 官方推荐参数
      '--step', '0',
      '--length', '30000',
      '--vad-thold', '0.6',
    ])
    send('status', { message: `正在从「${device.name}」捕获系统声音并本地转写` })

    let buffer = ''
    child.stdout.on('data', (data) => {
      buffer += data
      const lines = buffer.split('\n')
      buffer = lines.pop()
      for (const line of lines) {
        const text = parseTranscriptLine(line)
        if (text && !closed) send('text', { text })
      }
    })
    child.on('error', (error) => {
      fail(error.code === 'ENOENT' ? '未找到 whisper-stream，请先 brew install whisper-cpp' : error.message)
    })
    child.on('exit', (code) => {
      if (!closed) fail(`whisper-stream 意外退出（code ${code}）`)
    })
  } catch (error) {
    fail(error.message)
  }
}

async function handleSummarize(body) {
  const transcript = String(body.transcript || '').trim()
  if (!transcript) {
    throw Object.assign(new Error('transcript 不能为空'), { statusCode: 400 })
  }
  const tagNames = await fetchOllamaTags().catch(() => {
    throw Object.assign(new Error('本地 Ollama 未运行'), { statusCode: 503 })
  })
  const model = pickOllamaModel(tagNames)
  if (!model) throw Object.assign(new Error('Ollama 没有可用模型'), { statusCode: 503 })

  const res = await fetch(`${OLLAMA_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    signal: AbortSignal.timeout(180000),
    body: JSON.stringify({
      model,
      stream: false,
      format: 'json',
      messages: [
        {
          role: 'system',
          content:
            '你是会议纪要助手。根据会议转写稿输出 JSON，字段：summary（string[]，3-5 条要点摘要）、participants（string[]，参会人）、decisions（string[]，明确的决策）、risks（string[]，风险与问题）、actionItems（{task,owner,due}[]，行动项，owner/due 无法确定填"待确认"）。只输出 JSON，使用与转写稿相同的语言。',
        },
        {
          role: 'user',
          content: `会议标题：${body.title || '未命名'}\n日期：${body.date || ''}\n转写稿：\n${transcript}`,
        },
      ],
    }),
  })
  if (!res.ok) {
    throw Object.assign(new Error(`Ollama 调用失败：HTTP ${res.status}`), { statusCode: 502 })
  }

  const content = (await res.json()).message?.content ?? '{}'
  const parsed = JSON.parse(content)
  const strings = (value) => (Array.isArray(value) ? value.map(String).filter(Boolean) : [])
  return {
    model,
    minutes: {
      summary: strings(parsed.summary),
      participants: strings(parsed.participants),
      decisions: strings(parsed.decisions),
      risks: strings(parsed.risks),
      actionItems: (Array.isArray(parsed.actionItems) ? parsed.actionItems : [])
        .map((item) => ({
          task: String(item?.task ?? '').trim(),
          owner: String(item?.owner || '待确认'),
          due: String(item?.due || '待确认'),
        }))
        .filter((item) => item.task),
    },
  }
}

function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode
  if (typeof res.setHeader === 'function') {
    res.setHeader('Content-Type', 'application/json; charset=utf-8')
  }
  res.end(JSON.stringify(payload))
}

async function readJsonBody(req) {
  if (req.body && typeof req.body === 'object') return req.body
  const chunks = []
  for await (const chunk of req) chunks.push(chunk)
  const raw = Buffer.concat(chunks).toString('utf8')
  return raw ? JSON.parse(raw) : {}
}

export function createMeetingAudioApiMiddleware() {
  return async (req, res, next) => {
    const url = new URL(req.url ?? '', 'http://localhost')
    if (!url.pathname.startsWith('/api/meeting-audio/')) {
      next()
      return
    }
    try {
      if (req.method === 'GET' && url.pathname === '/api/meeting-audio/status') {
        sendJson(res, 200, await handleStatus())
        return
      }
      if (req.method === 'GET' && url.pathname === '/api/meeting-audio/stream') {
        await handleStream(req, res, url)
        return
      }
      if (req.method === 'POST' && url.pathname === '/api/meeting-audio/summarize') {
        sendJson(res, 200, await handleSummarize(await readJsonBody(req)))
        return
      }
      sendJson(res, 404, { error: 'Not found' })
    } catch (error) {
      sendJson(res, error.statusCode || 500, { error: error.message || 'Request failed' })
    }
  }
}
