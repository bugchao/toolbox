import React, { useMemo, useState } from 'react'
import { Button, Card, Input, NoticeCard, PageHero, ParticlesBackground, TextArea } from '@toolbox/ui-kit'
import { useTranslation } from 'react-i18next'
import { Check, ClipboardCopy, Download, FileDigit, FileText, Type, Upload } from 'lucide-react'
import {
  base64ToBytes,
  bytesToBase64,
  formatSize,
  looksLikeText,
  sniffType,
  toDataUri,
} from './lib/base64'

const MAX_BYTES = 20 * 1024 * 1024 // 编码方向单文件上限 20 MB

type EncodeState = {
  fileName: string
  size: number
  mime: string
  base64: string
} | null

const Base64File: React.FC = () => {
  const { t } = useTranslation('toolBase64File')
  const [mode, setMode] = useState<'encode' | 'decode'>('encode')
  const [encoded, setEncoded] = useState<EncodeState>(null)
  const [encodeError, setEncodeError] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const [decodeInput, setDecodeInput] = useState('')
  const [decodeName, setDecodeName] = useState('decoded')

  // —— 编码方向 ——
  const onFiles = async (list: FileList | null) => {
    setEncodeError(null)
    const f = list?.[0]
    if (!f) return
    if (f.size > MAX_BYTES) {
      setEncodeError(t('encode.tooLarge', { max: formatSize(MAX_BYTES) }))
      return
    }
    const buf = new Uint8Array(await f.arrayBuffer())
    setEncoded({
      fileName: f.name,
      size: f.size,
      mime: f.type || sniffType(buf)?.mime || 'application/octet-stream',
      base64: bytesToBase64(buf),
    })
  }

  const onCopy = async (key: string, text: string) => {
    if (!text) return
    try {
      await navigator.clipboard.writeText(text)
      setCopied(key)
      window.setTimeout(() => setCopied((c) => (c === key ? null : c)), 1200)
    } catch { /* ignore */ }
  }

  // —— 解码方向 ——
  const decoded = useMemo(() => {
    if (!decodeInput.trim()) return null
    const r = base64ToBytes(decodeInput)
    if (!r.ok) return { error: r.message } as const
    const sniffed = sniffType(r.bytes)
    const isText = !sniffed && looksLikeText(r.bytes)
    return {
      error: null,
      bytes: r.bytes,
      mime: r.mime ?? sniffed?.mime ?? (isText ? 'text/plain' : 'application/octet-stream'),
      ext: sniffed?.ext ?? (isText ? 'txt' : 'bin'),
      isText,
      preview: isText ? new TextDecoder().decode(r.bytes.subarray(0, 2000)) : null,
      isImage: (r.mime ?? sniffed?.mime ?? '').startsWith('image/'),
    } as const
  }, [decodeInput])

  const onDownloadDecoded = () => {
    if (!decoded || decoded.error) return
    const blob = new Blob([decoded.bytes as BlobPart], { type: decoded.mime })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    const name = decodeName.includes('.') ? decodeName : `${decodeName}.${decoded.ext}`
    a.download = name
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    setTimeout(() => URL.revokeObjectURL(url), 0)
  }

  const decodedImageSrc = useMemo(() => {
    if (!decoded || decoded.error || !decoded.isImage) return null
    return toDataUri(bytesToBase64(decoded.bytes), decoded.mime)
  }, [decoded])

  return (
    <div className="relative min-h-[60vh]">
      <ParticlesBackground preset="minimal" className="absolute inset-0" />
      <div className="relative z-10 space-y-6">
        <PageHero title={t('title')} description={t('description')} />

        <NoticeCard
          tone="info"
          title={t('notice.title')}
          description={t('notice.body')}
          icon={FileDigit}
        />

        <Card>
          {/* 方向 Tab */}
          <div className="mb-4 inline-flex rounded-md border border-gray-200 p-0.5 dark:border-gray-700">
            <button
              type="button"
              onClick={() => setMode('encode')}
              className={[
                'inline-flex items-center gap-1.5 rounded px-3 py-1 text-xs font-medium transition',
                mode === 'encode'
                  ? 'bg-indigo-500 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800',
              ].join(' ')}
            >
              <Upload className="h-3.5 w-3.5" />
              {t('mode.encode')}
            </button>
            <button
              type="button"
              onClick={() => setMode('decode')}
              className={[
                'inline-flex items-center gap-1.5 rounded px-3 py-1 text-xs font-medium transition',
                mode === 'decode'
                  ? 'bg-indigo-500 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800',
              ].join(' ')}
            >
              <Type className="h-3.5 w-3.5" />
              {t('mode.decode')}
            </button>
          </div>

          {mode === 'encode' ? (
            <div className="space-y-4">
              <label
                htmlFor="base64-file-input"
                onDrop={(e) => { e.preventDefault(); void onFiles(e.dataTransfer.files) }}
                onDragOver={(e) => e.preventDefault()}
                className="flex h-36 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-indigo-300 bg-indigo-50/50 text-center transition-colors hover:border-indigo-400 hover:bg-indigo-50 dark:border-indigo-700 dark:bg-indigo-900/20 dark:hover:bg-indigo-900/30"
              >
                <Upload className="mb-2 h-7 w-7 text-indigo-500" />
                <span className="font-medium text-indigo-700 dark:text-indigo-200">{t('encode.dropCta')}</span>
                <span className="mt-1 text-xs text-indigo-500/80 dark:text-indigo-300/80">
                  {t('encode.dropHint', { max: formatSize(MAX_BYTES) })}
                </span>
                <input
                  id="base64-file-input"
                  type="file"
                  className="hidden"
                  onChange={(e) => void onFiles(e.target.files)}
                />
              </label>

              {encodeError && (
                <div className="rounded-md border border-rose-300 bg-rose-50 px-3 py-2 text-xs text-rose-700 dark:border-rose-700 dark:bg-rose-900/30 dark:text-rose-200">
                  {encodeError}
                </div>
              )}

              {encoded && (
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
                    <FileText className="h-4 w-4" />
                    <span className="font-medium">{encoded.fileName}</span>
                    <span>·</span>
                    <span>{formatSize(encoded.size)}</span>
                    <span>·</span>
                    <code className="rounded bg-gray-100 px-1.5 py-0.5 dark:bg-gray-800">{encoded.mime}</code>
                    <span>·</span>
                    <span>{t('encode.b64Length', { n: encoded.base64.length })}</span>
                  </div>

                  <OutputBlock
                    label="Base64"
                    value={encoded.base64}
                    copied={copied === 'b64'}
                    onCopy={() => onCopy('b64', encoded.base64)}
                  />
                  <OutputBlock
                    label="Data URI"
                    value={toDataUri(encoded.base64, encoded.mime)}
                    copied={copied === 'uri'}
                    onCopy={() => onCopy('uri', toDataUri(encoded.base64, encoded.mime))}
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-200">
                  {t('decode.inputLabel')}
                </label>
                <TextArea
                  value={decodeInput}
                  onChange={(e) => setDecodeInput(e.target.value)}
                  rows={8}
                  placeholder={t('decode.placeholder')}
                  spellCheck={false}
                  className="!font-mono !text-xs"
                />
              </div>

              {decoded && decoded.error && (
                <div className="rounded-md border border-rose-300 bg-rose-50 px-3 py-2 text-xs text-rose-700 dark:border-rose-700 dark:bg-rose-900/30 dark:text-rose-200">
                  {t(`decode.error.${decoded.error}`, { defaultValue: t('decode.error.generic', { msg: decoded.error }) })}
                </div>
              )}

              {decoded && !decoded.error && (
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
                    <span>{t('decode.detected')}:</span>
                    <code className="rounded bg-gray-100 px-1.5 py-0.5 dark:bg-gray-800">{decoded.mime}</code>
                    <span>·</span>
                    <span>{formatSize(decoded.bytes.length)}</span>
                  </div>

                  {decodedImageSrc && (
                    <div className="rounded-md border border-gray-200 p-2 dark:border-gray-700">
                      <img src={decodedImageSrc} alt="decoded preview" className="max-h-64 rounded" />
                    </div>
                  )}

                  {decoded.preview != null && (
                    <pre className="max-h-48 overflow-auto rounded-md border border-gray-200 bg-gray-50 p-3 font-mono text-xs text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100">
                      {decoded.preview}
                    </pre>
                  )}

                  <div className="flex flex-wrap items-end gap-2">
                    <label className="block">
                      <span className="mb-1 block text-xs text-gray-500 dark:text-gray-400">{t('decode.filename')}</span>
                      <Input
                        value={decodeName}
                        onChange={(e) => setDecodeName(e.target.value)}
                        spellCheck={false}
                        className="!w-56"
                      />
                    </label>
                    <Button onClick={onDownloadDecoded}>
                      <span className="inline-flex items-center gap-1.5">
                        <Download className="h-4 w-4" />
                        {t('decode.download', { ext: decodeName.includes('.') ? '' : `.${decoded.ext}` })}
                      </span>
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}

const OutputBlock: React.FC<{
  label: string
  value: string
  copied: boolean
  onCopy: () => void
}> = ({ label, value, copied, onCopy }) => (
  <div>
    <div className="mb-1 flex items-center justify-between text-xs">
      <span className="font-medium text-gray-700 dark:text-gray-200">{label}</span>
      <button
        type="button"
        onClick={onCopy}
        className="inline-flex items-center gap-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
      >
        {copied ? <Check className="h-3 w-3" /> : <ClipboardCopy className="h-3 w-3" />}
        {copied ? 'Copied' : 'Copy'}
      </button>
    </div>
    <pre className="max-h-36 overflow-auto break-all rounded-md border border-gray-200 bg-gray-50 p-3 font-mono text-[11px] leading-relaxed text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200">
      {value.length > 4096 ? value.slice(0, 4096) + `\n… (${value.length} chars total — use Copy)` : value}
    </pre>
  </div>
)

export default Base64File
