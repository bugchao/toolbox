import { useCallback, useEffect, useRef, useState } from 'react'

// 完全本地：getDisplayMedia 抓系统/标签页声音 -> 浏览器内 whisper 转写。
// 音频不出本机，模型首次运行时从 HF CDN 下载后缓存。
export type TranscriberPhase = 'idle' | 'loading-model' | 'recording' | 'error'

// ponytail: whisper-base 兼顾中文质量与 CPU 速度；换 whisper-tiny 更快更轻、whisper-small 更准（改这一行即可）。
const MODEL = 'Xenova/whisper-base'
const SAMPLE_RATE = 16000
const CHUNK_SECONDS = 15

// 模块级缓存：模型只加载一次，跨开关会话复用。
let transcriberPromise: Promise<(audio: Float32Array, opts?: unknown) => Promise<{ text: string }>> | null = null

async function getTranscriber(onProgress: (percent: number) => void) {
  if (!transcriberPromise) {
    transcriberPromise = (async () => {
      const { pipeline, env } = await import('@huggingface/transformers')
      env.allowLocalModels = false
      return pipeline('automatic-speech-recognition', MODEL, {
        progress_callback: (e: { status?: string; progress?: number }) => {
          if (e.status === 'progress' && typeof e.progress === 'number') onProgress(Math.round(e.progress))
        },
      }) as unknown as (audio: Float32Array, opts?: unknown) => Promise<{ text: string }>
    })()
  }
  return transcriberPromise
}

export function useSystemAudioTranscriber(onText: (text: string) => void) {
  const [phase, setPhase] = useState<TranscriberPhase>('idle')
  const [modelProgress, setModelProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const streamRef = useRef<MediaStream | null>(null)
  const ctxRef = useRef<AudioContext | null>(null)
  const processorRef = useRef<ScriptProcessorNode | null>(null)
  const transcriberRef = useRef<((audio: Float32Array, opts?: unknown) => Promise<{ text: string }>) | null>(null)
  const bufferRef = useRef<Float32Array[]>([])
  const bufferLenRef = useRef(0)
  const busyRef = useRef(false)
  const timerRef = useRef<number | null>(null)
  const onTextRef = useRef(onText)
  onTextRef.current = onText

  // 把累积的 PCM 交给 whisper 转一段。busyRef 保证不重叠（whisper 比实时慢时跳过本轮，音频继续累积）。
  const flush = useCallback(async () => {
    if (busyRef.current || bufferLenRef.current === 0 || !transcriberRef.current) return
    const chunks = bufferRef.current
    const total = bufferLenRef.current
    bufferRef.current = []
    bufferLenRef.current = 0
    const audio = new Float32Array(total)
    let offset = 0
    for (const c of chunks) {
      audio.set(c, offset)
      offset += c.length
    }
    busyRef.current = true
    try {
      // ponytail: 固定中文识别；纯英文会议把 'chinese' 改成 'english' 或删掉走自动检测。
      const out = await transcriberRef.current(audio, { language: 'chinese', task: 'transcribe' })
      const text = (out?.text ?? '').trim()
      if (text) onTextRef.current(text)
    } catch {
      // 单段失败不中断整场，继续下一段
    } finally {
      busyRef.current = false
    }
  }, [])

  const stop = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    processorRef.current?.disconnect()
    processorRef.current = null
    void ctxRef.current?.close()
    ctxRef.current = null
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    void flush() // 尽力转写最后不足一段的尾音
    setPhase('idle')
  }, [flush])

  const start = useCallback(async () => {
    setError(null)
    try {
      // getDisplayMedia 需要 video:true 才允许勾选“分享音频”；video 轨随即停掉，只留音频。
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
      if (stream.getAudioTracks().length === 0) {
        stream.getTracks().forEach((t) => t.stop())
        setError('未捕获到系统声音，请在共享弹窗里勾选“分享标签页/系统音频”')
        setPhase('error')
        return
      }
      stream.getVideoTracks().forEach((t) => t.stop())
      streamRef.current = stream

      setPhase('loading-model')
      transcriberRef.current = await getTranscriber(setModelProgress)

      const ctx = new AudioContext({ sampleRate: SAMPLE_RATE })
      ctxRef.current = ctx
      const source = ctx.createMediaStreamSource(stream)
      // ScriptProcessorNode 已弃用但单文件即可用；量大再迁 AudioWorklet + Worker 免主线程卡顿。
      const processor = ctx.createScriptProcessor(4096, 1, 1)
      processorRef.current = processor
      processor.onaudioprocess = (e) => {
        const input = e.inputBuffer.getChannelData(0)
        bufferRef.current.push(new Float32Array(input))
        bufferLenRef.current += input.length
      }
      source.connect(processor)
      processor.connect(ctx.destination) // 输出静音，仅用于让 processor 持续触发

      stream.getAudioTracks()[0].addEventListener('ended', stop) // 用户从浏览器 UI 结束共享

      timerRef.current = window.setInterval(() => void flush(), CHUNK_SECONDS * 1000)
      setPhase('recording')
    } catch (err) {
      stop()
      const name = (err as { name?: string })?.name
      setError(name === 'NotAllowedError' ? '已取消共享或未授权' : '无法开始捕获系统声音')
      setPhase('error')
    }
  }, [flush, stop])

  useEffect(() => () => stop(), [stop])

  return { phase, modelProgress, error, start, stop, supported: typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getDisplayMedia }
}
