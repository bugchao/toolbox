import React, { useCallback, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Check, Copy, FileSearch, Loader2, Trash2, Upload, Zap } from 'lucide-react'
import { PageHero } from '@toolbox/ui-kit'
import * as pdfjsLib from 'pdfjs-dist'
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl

const MAX_BYTES = 50 * 1024 * 1024

type Length = 'short' | 'medium' | 'long'

const STOP_WORDS = new Set([
  '的','了','是','在','和','有','我','你','他','她','它','们','这','那','个','一','不','人','都','也','就','但','而','与','或','从','到','被','把','让','对','为','以','及','等','中','上','下','前','后','内','外','大','小','多','少','可','要','能','会','说','去','来','做','看','想','知','用','时','其','所','如','还','已','又','很','只','才','没','最','再','更','些','什','么','谁','哪','怎','因','虽','然','若','当','于','由','自','至',
  'the','a','an','and','or','but','if','then','of','at','by','for','with','about','to','in','on','as','is','are','was','were','be','been','being','have','has','had','do','does','did','will','would','can','could','should','may','might','this','that','these','those','it','its','they','them','their','we','us','our','you','your','he','him','his','she','her','i','me','my'
])

function extractSentences(text: string): string[] {
  return text
    .replace(/\s+/g, ' ')
    .split(/(?<=[。！？.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 6)
}

function extractKeywords(text: string, top = 8): string[] {
  const words = text
    .replace(/[^一-龥a-zA-Z]+/g, ' ')
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 1 && !STOP_WORDS.has(w))
  const freq: Record<string, number> = {}
  for (const w of words) freq[w] = (freq[w] ?? 0) + 1
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, top)
    .map(([w]) => w)
}

function summarize(text: string, length: Length): string {
  const sentences = extractSentences(text)
  if (sentences.length === 0) return ''
  const counts: Record<Length, number> = { short: 2, medium: 4, long: 8 }
  const keywords = extractKeywords(text, 12)
  const target = Math.min(counts[length], sentences.length)
  const scored = sentences.map((s, i) => {
    let score = 0
    for (const k of keywords) if (s.toLowerCase().includes(k)) score += 2
    if (i < 3) score += 3
    if (i === sentences.length - 1) score += 1
    if (s.length > 20 && s.length < 200) score += 1
    return { s, i, score }
  })
  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, target)
    .sort((a, b) => a.i - b.i)
    .map((x) => x.s)
    .join(' ')
}

async function extractPdfText(file: File): Promise<{ text: string; pages: number }> {
  const buffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise
  let text = ''
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    const pageText = content.items
      .map((item: { str?: string } | unknown) => (typeof item === 'object' && item !== null && 'str' in item ? (item as { str: string }).str : ''))
      .join(' ')
    text += pageText + '\n\n'
  }
  return { text: text.trim(), pages: pdf.numPages }
}

export default function PdfSummary() {
  const { t } = useTranslation('toolPdfSummary')
  const [file, setFile] = useState<File | null>(null)
  const [pages, setPages] = useState(0)
  const [text, setText] = useState('')
  const [length, setLength] = useState<Length>('medium')
  const [summary, setSummary] = useState('')
  const [keywords, setKeywords] = useState<string[]>([])
  const [busy, setBusy] = useState<'extract' | 'summarize' | null>(null)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const onPick = (f: File | null) => {
    setError('')
    setSummary('')
    setKeywords([])
    setText('')
    setPages(0)
    if (!f) {
      setFile(null)
      return
    }
    if (!/\.pdf$/i.test(f.name) && f.type !== 'application/pdf') {
      setError(t('errors.notPdf'))
      return
    }
    if (f.size > MAX_BYTES) {
      setError(t('errors.tooLarge'))
      return
    }
    setFile(f)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    onPick(e.dataTransfer.files?.[0] ?? null)
  }

  const run = useCallback(async () => {
    if (!file) return
    setError('')
    setBusy('extract')
    try {
      const { text: extracted, pages: numPages } = await extractPdfText(file)
      setPages(numPages)
      setText(extracted)
      if (!extracted) {
        setError(t('errors.emptyText'))
        setBusy(null)
        return
      }
      setBusy('summarize')
      await new Promise((r) => setTimeout(r, 0))
      setSummary(summarize(extracted, length))
      setKeywords(extractKeywords(extracted, 8))
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      setError(t('errors.parseFailed', { message: msg }))
    } finally {
      setBusy(null)
    }
  }, [file, length, t])

  const handleCopy = () => {
    if (!summary) return
    navigator.clipboard.writeText(summary)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const inputLen = text.length
  const summaryLen = summary.length
  const compression = inputLen > 0 && summaryLen > 0 ? Math.round((1 - summaryLen / inputLen) * 100) : 0
  const readingTime = Math.max(1, Math.ceil(inputLen / 400))

  const tipsItems = (t('tips.items', { returnObjects: true }) as string[]) || []

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <PageHero icon={FileSearch} title={t('title')} description={t('description')} />

      <div className="container mx-auto max-w-4xl px-4 pb-12 space-y-6">
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="rounded-xl border-2 border-dashed border-indigo-300 bg-white p-8 text-center transition hover:border-indigo-500 dark:border-indigo-700 dark:bg-gray-800 dark:hover:border-indigo-400"
        >
          <Upload className="mx-auto mb-3 h-10 w-10 text-indigo-500" />
          <p className="font-medium text-gray-800 dark:text-gray-100">{t('upload.drop')}</p>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{t('upload.limit')}</p>
          <div className="mt-4 flex justify-center gap-2">
            <button
              onClick={() => inputRef.current?.click()}
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              {file ? t('upload.replace') : t('upload.select')}
            </button>
            {file && (
              <button
                onClick={() => onPick(null)}
                className="flex items-center gap-1 rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
              >
                <Trash2 className="h-4 w-4" /> {t('upload.clear')}
              </button>
            )}
          </div>
          {file && (
            <div className="mt-3 text-sm text-gray-600 dark:text-gray-300">
              <span className="font-mono">{file.name}</span>
              <span className="mx-2 text-gray-400">·</span>
              <span>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
            </div>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf,.pdf"
            className="hidden"
            onChange={(e) => onPick(e.target.files?.[0] ?? null)}
          />
        </div>

        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-700 dark:bg-red-900/30 dark:text-red-300">
            {error}
          </div>
        )}

        <div className="rounded-xl bg-white p-5 shadow-sm dark:bg-gray-800">
          <div className="flex flex-wrap items-center gap-3">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200">{t('fields.length')}</label>
            <div className="flex gap-2">
              {(['short', 'medium', 'long'] as Length[]).map((opt) => (
                <button
                  key={opt}
                  onClick={() => setLength(opt)}
                  className={`rounded-md px-3 py-1.5 text-sm transition ${
                    length === opt
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {t(`fields.length${opt[0].toUpperCase()}${opt.slice(1)}` as 'fields.lengthShort')}
                </button>
              ))}
            </div>
            <button
              onClick={run}
              disabled={!file || busy !== null}
              className="ml-auto flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {busy === 'extract' ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> {t('actions.extracting')}
                </>
              ) : busy === 'summarize' ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> {t('actions.summarizing')}
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4" /> {t('actions.summarize')}
                </>
              )}
            </button>
          </div>
        </div>

        <div className="rounded-xl bg-white p-5 shadow-sm dark:bg-gray-800">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-semibold text-gray-800 dark:text-gray-100">{t('result.summary')}</h3>
            {summary && (
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 rounded-md border border-gray-300 px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? t('actions.copied') : t('actions.copy')}
              </button>
            )}
          </div>
          {summary ? (
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-800 dark:text-gray-100">{summary}</p>
          ) : (
            <p className="text-sm text-gray-400 dark:text-gray-500">{t('result.empty')}</p>
          )}

          {keywords.length > 0 && (
            <div className="mt-5">
              <h4 className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">{t('result.keywords')}</h4>
              <div className="flex flex-wrap gap-2">
                {keywords.map((k) => (
                  <span
                    key={k}
                    className="rounded-full bg-indigo-50 px-3 py-1 text-xs text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300"
                  >
                    {k}
                  </span>
                ))}
              </div>
            </div>
          )}

          {summary && (
            <div className="mt-5 grid grid-cols-2 gap-3 text-xs text-gray-600 dark:text-gray-300 sm:grid-cols-4">
              <div className="rounded-md bg-gray-50 p-2 dark:bg-gray-900/50">
                {t('result.pages', { count: pages })}
              </div>
              <div className="rounded-md bg-gray-50 p-2 dark:bg-gray-900/50">
                {t('result.chars', { count: inputLen })}
              </div>
              <div className="rounded-md bg-gray-50 p-2 dark:bg-gray-900/50">
                {t('result.compression', { rate: compression })}
              </div>
              <div className="rounded-md bg-gray-50 p-2 dark:bg-gray-900/50">
                {t('result.readingTime', { min: readingTime })}
              </div>
            </div>
          )}
        </div>

        <div className="rounded-xl bg-indigo-50 p-5 text-sm dark:bg-indigo-900/20">
          <h4 className="mb-2 font-medium text-indigo-900 dark:text-indigo-200">{t('tips.title')}</h4>
          <ul className="space-y-1 text-indigo-800 dark:text-indigo-300">
            {tipsItems.map((tip) => (
              <li key={tip}>• {tip}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
