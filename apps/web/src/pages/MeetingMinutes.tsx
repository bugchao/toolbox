import React, { useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  AudioLines,
  CheckCircle2,
  Copy,
  Download,
  FileAudio2,
  FileVideo2,
  Mic,
  MicOff,
  Sparkles,
  Upload,
} from 'lucide-react'
import { Card, FadeIn, PageHero, StaggerChildren } from '@toolbox/ui-kit'

interface MeetingAsset {
  name: string
  size: string
  type: string
}

interface ActionItem {
  task: string
  owner: string
  due: string
}

interface GeneratedMinutes {
  summary: string[]
  participants: string[]
  decisions: string[]
  risks: string[]
  actionItems: ActionItem[]
  markdown: string
}

declare global {
  interface Window {
    webkitSpeechRecognition?: new () => SpeechRecognition
    SpeechRecognition?: new () => SpeechRecognition
  }
}

interface SpeechRecognitionEventLike extends Event {
  results: ArrayLike<{
    isFinal: boolean
    0: { transcript: string }
  }>
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  start: () => void
  stop: () => void
  onresult: ((event: SpeechRecognitionEventLike) => void) | null
  onerror: (() => void) | null
  onend: (() => void) | null
}

function cleanTranscript(raw: string) {
  return raw
    .replace(/\r/g, '')
    .split('\n')
    .filter((line) => !/^\d+$/.test(line.trim()))
    .filter((line) => !/^\d{2}:\d{2}:\d{2}[,.]\d{3}\s+-->\s+\d{2}:\d{2}:\d{2}[,.]\d{3}$/.test(line.trim()))
    .join('\n')
    .trim()
}

function splitSentences(text: string) {
  return cleanTranscript(text)
    .split(/[\n。！？!?]/)
    .map((item) => item.trim())
    .filter((item) => item.length >= 8)
}

function extractParticipants(text: string) {
  const names = new Set<string>()
  const lines = cleanTranscript(text).split('\n')
  lines.forEach((line) => {
    const match = line.match(/^([A-Za-z\u4e00-\u9fa5]{2,20})[:：]/)
    if (match) names.add(match[1])
  })
  return Array.from(names)
}

function extractKeywords(sentences: string[], patterns: RegExp[]) {
  const matched = sentences.filter((sentence) => patterns.some((pattern) => pattern.test(sentence)))
  return Array.from(new Set(matched)).slice(0, 6)
}

function extractActionItems(sentences: string[]) {
  const candidates = sentences.filter((sentence) =>
    /(待办|行动项|跟进|负责人|本周|下周|明天|完成|owner|deadline|follow up|next step)/i.test(sentence)
  )

  return candidates.slice(0, 6).map((sentence) => {
    const owner = sentence.match(/([A-Za-z\u4e00-\u9fa5]{2,20})(负责|跟进|owner)/)?.[1] ?? '待确认'
    const due =
      sentence.match(/(今天|明天|本周|下周|月底|\d{4}-\d{2}-\d{2}|\d{1,2}月\d{1,2}日)/)?.[1] ?? '待同步'

    return {
      task: sentence,
      owner,
      due,
    }
  })
}

function generateMinutes(title: string, date: string, transcript: string) {
  const sentences = splitSentences(transcript)
  const summary = sentences.slice(0, 3)
  const participants = extractParticipants(transcript)
  const decisions = extractKeywords(sentences, [/(决定|确定|结论|批准|同意|将会|agreed|decided)/i])
  const risks = extractKeywords(sentences, [/(风险|阻塞|问题|挑战|依赖|延期|blocker|risk|issue)/i])
  const actionItems = extractActionItems(sentences)

  const markdown = [
    `# ${title || '会议纪要'}`,
    '',
    `- 日期：${date || '待补充'}`,
    `- 参会人：${participants.length ? participants.join('、') : '待补充'}`,
    '',
    '## 摘要',
    ...summary.map((item) => `- ${item}`),
    '',
    '## 决策',
    ...(decisions.length ? decisions.map((item) => `- ${item}`) : ['- 暂未识别到明确决策']),
    '',
    '## 风险与问题',
    ...(risks.length ? risks.map((item) => `- ${item}`) : ['- 暂未识别到显著风险']),
    '',
    '## 行动项',
    ...(actionItems.length
      ? actionItems.map((item) => `- ${item.task} | 负责人：${item.owner} | 截止：${item.due}`)
      : ['- 暂未识别到行动项']),
  ].join('\n')

  return { summary, participants, decisions, risks, actionItems, markdown }
}

function formatFileSize(size: number) {
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
  return `${(size / 1024 / 1024).toFixed(1)} MB`
}

const MeetingMinutes: React.FC = () => {
  const { t } = useTranslation('nav')
  const { t: tHome } = useTranslation('home')
  const transcriptFileRef = useRef<HTMLInputElement>(null)
  const mediaFileRef = useRef<HTMLInputElement>(null)
  const recognitionRef = useRef<SpeechRecognition | null>(null)

  const [meetingTitle, setMeetingTitle] = useState('产品周会')
  const [meetingDate, setMeetingDate] = useState(new Date().toISOString().slice(0, 10))
  const [transcript, setTranscript] = useState(`Alice: 我们这周重点看新工具上线节奏。
Bob: sheet-editor 和 format-converter 今天可以联调完成。
Carol: meeting-minutes 的实时语音输入需要走浏览器能力兜底。
Alice: 我们决定先交付前端 MVP，本周五前完成文档更新。
Bob: 风险是 XML/YAML 的边界输入还需要继续补强。
Carol: 我负责把构建验证和回归检查在下周一前跑完。`)
  const [assets, setAssets] = useState<MeetingAsset[]>([])
  const [minutes, setMinutes] = useState<GeneratedMinutes | null>(null)
  const [status, setStatus] = useState('支持上传音视频素材、字幕文件，或直接粘贴转写稿')
  const [isRecording, setIsRecording] = useState(false)
  const [copied, setCopied] = useState(false)

  const speechSupported = useMemo(() => Boolean(window.SpeechRecognition || window.webkitSpeechRecognition), [])

  const handleTranscriptFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    const text = await file.text()
    setTranscript(cleanTranscript(text))
    setStatus(`已导入转写文件 ${file.name}`)
    event.target.value = ''
  }

  const handleMediaFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? [])
    if (!files.length) return
    setAssets((current) => [
      ...current,
      ...files.map((file) => ({
        name: file.name,
        size: formatFileSize(file.size),
        type: file.type.startsWith('video') ? 'video' : 'audio',
      })),
    ])
    setStatus(`已收录 ${files.length} 个音视频素材，可配合字幕或实时转写使用`)
    event.target.value = ''
  }

  const toggleRecording = () => {
    if (!speechSupported) {
      setStatus('当前浏览器不支持 SpeechRecognition，请改用字幕文件或手动转写稿')
      return
    }

    if (isRecording) {
      recognitionRef.current?.stop()
      setIsRecording(false)
      return
    }

    const RecognitionCtor = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!RecognitionCtor) return

    const recognition = new RecognitionCtor()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'zh-CN'
    recognition.onresult = (event: SpeechRecognitionEventLike) => {
      const next = Array.from(event.results)
        .map((result) => result[0].transcript)
        .join('')
      setTranscript((current) => `${current.trim()}\n${next}`.trim())
    }
    recognition.onerror = () => {
      setStatus('语音转写中断，请检查麦克风权限后重试')
      setIsRecording(false)
    }
    recognition.onend = () => {
      setIsRecording(false)
    }
    recognition.start()
    recognitionRef.current = recognition
    setIsRecording(true)
    setStatus('正在实时转写，请保持麦克风开启')
  }

  const buildMinutes = () => {
    const nextMinutes = generateMinutes(meetingTitle, meetingDate, transcript)
    setMinutes(nextMinutes)
    setStatus('已生成结构化纪要，可继续修改转写稿后重新生成')
  }

  const copyMarkdown = async () => {
    if (!minutes) return
    await navigator.clipboard.writeText(minutes.markdown)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1500)
  }

  const downloadMarkdown = () => {
    if (!minutes) return
    const blob = new Blob([minutes.markdown], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'meeting-minutes.md'
    anchor.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <PageHero title={t('tools.meeting_minutes')} description={tHome('toolDesc.meeting_minutes')} className="mb-4" />

      <FadeIn>
        <Card className="bg-gradient-to-br from-white via-amber-50 to-rose-50 dark:from-gray-800 dark:via-gray-800 dark:to-slate-900">
          <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">会议输入</h2>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">素材上传、实时语音输入和转写稿编辑可以组合使用，适合先录会后整理。</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  value={meetingTitle}
                  onChange={(event) => setMeetingTitle(event.target.value)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-amber-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                  placeholder="会议标题"
                />
                <input
                  type="date"
                  value={meetingDate}
                  onChange={(event) => setMeetingDate(event.target.value)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-amber-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                />
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => mediaFileRef.current?.click()}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:border-amber-300 hover:text-amber-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                >
                  <Upload className="w-4 h-4" />
                  上传音视频
                </button>
                <button
                  type="button"
                  onClick={() => transcriptFileRef.current?.click()}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:border-amber-300 hover:text-amber-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                >
                  <AudioLines className="w-4 h-4" />
                  导入字幕 / TXT
                </button>
                <button
                  type="button"
                  onClick={toggleRecording}
                  className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white ${isRecording ? 'bg-rose-600 hover:bg-rose-700' : 'bg-amber-500 hover:bg-amber-600'}`}
                >
                  {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  {isRecording ? '停止转写' : '实时语音输入'}
                </button>
                <input ref={mediaFileRef} type="file" accept="audio/*,video/*" multiple className="hidden" onChange={handleMediaFile} />
                <input ref={transcriptFileRef} type="file" accept=".txt,.md,.srt,.vtt" className="hidden" onChange={handleTranscriptFile} />
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-300">{status}</p>
            </div>

            <Card className="bg-slate-950 text-slate-50 dark:bg-slate-900" padded>
              <div className="flex items-center gap-2 text-sm text-amber-300">
                <Sparkles className="w-4 h-4" />
                结构化输出
              </div>
              <ul className="mt-4 space-y-3 text-sm text-slate-200">
                <li>自动提取摘要、决策、风险与行动项</li>
                <li>兼容字幕文件和人工修订后的转写稿</li>
                <li>输出 Markdown，可直接发到飞书、Notion 或 PR 描述</li>
              </ul>
            </Card>
          </div>
        </Card>
      </FadeIn>

      <StaggerChildren className="grid gap-8 xl:grid-cols-[1.05fr_0.95fr]">
        <Card>
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">转写稿编辑器</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">支持边导入边修改。建议带上“姓名: 内容”的说话人标记，识别效果会更好。</p>
            </div>
            <button
              type="button"
              onClick={buildMinutes}
              className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 dark:bg-amber-500 dark:text-slate-950 dark:hover:bg-amber-400"
            >
              <Sparkles className="w-4 h-4" />
              生成纪要
            </button>
          </div>
          <textarea
            value={transcript}
            onChange={(event) => setTranscript(event.target.value)}
            className="mt-4 min-h-[420px] w-full rounded-xl border border-slate-200 bg-white p-4 font-mono text-sm text-slate-800 outline-none focus:border-amber-400 dark:border-slate-700 dark:bg-slate-950/60 dark:text-slate-100"
          />

          {!!assets.length && (
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {assets.map((asset) => (
                <Card key={`${asset.name}-${asset.size}`} className="bg-slate-50 dark:bg-slate-900/60" padded>
                  <div className="flex items-start gap-3">
                    {asset.type === 'video' ? (
                      <FileVideo2 className="mt-1 w-5 h-5 text-rose-500" />
                    ) : (
                      <FileAudio2 className="mt-1 w-5 h-5 text-amber-500" />
                    )}
                    <div>
                      <div className="font-medium text-slate-900 dark:text-slate-50">{asset.name}</div>
                      <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">{asset.size}</div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </Card>

        <div className="space-y-8">
          <Card>
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">结构化结果</h2>
              {minutes && (
                <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-sm text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300">
                  <CheckCircle2 className="w-4 h-4" />
                  已生成
                </div>
              )}
            </div>

            {minutes ? (
              <div className="mt-4 space-y-6">
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-slate-50">摘要</h3>
                  <ul className="mt-2 space-y-2 text-sm text-slate-600 dark:text-slate-300">
                    {minutes.summary.map((item) => (
                      <li key={item}>- {item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-slate-50">参会人</h3>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                    {minutes.participants.length ? minutes.participants.join('、') : '暂未识别到说话人'}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-slate-50">行动项</h3>
                  <div className="mt-3 space-y-3">
                    {minutes.actionItems.length ? (
                      minutes.actionItems.map((item) => (
                        <Card key={`${item.task}-${item.owner}`} className="bg-slate-50 dark:bg-slate-900/60" padded>
                          <div className="text-sm text-slate-700 dark:text-slate-200">{item.task}</div>
                          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                            负责人：{item.owner} · 截止：{item.due}
                          </div>
                        </Card>
                      ))
                    ) : (
                      <div className="text-sm text-slate-500 dark:text-slate-400">暂未识别到行动项</div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">上传素材或粘贴转写稿后，点击“生成纪要”即可得到结构化输出。</p>
            )}
          </Card>

          <Card>
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">Markdown 输出</h2>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={copyMarkdown}
                  disabled={!minutes}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:border-amber-300 hover:text-amber-600 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-100"
                >
                  <Copy className="w-4 h-4" />
                  {copied ? '已复制' : '复制'}
                </button>
                <button
                  type="button"
                  onClick={downloadMarkdown}
                  disabled={!minutes}
                  className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-amber-500 dark:text-slate-950 dark:hover:bg-amber-400"
                >
                  <Download className="w-4 h-4" />
                  下载
                </button>
              </div>
            </div>
            <textarea
              readOnly
              value={minutes?.markdown ?? ''}
              placeholder="这里会输出结构化纪要 Markdown"
              className="mt-4 min-h-[260px] w-full rounded-xl border border-slate-200 bg-slate-950 p-4 font-mono text-sm text-emerald-300 outline-none dark:border-slate-700"
            />
          </Card>
        </div>
      </StaggerChildren>
    </div>
  )
}

export default MeetingMinutes
