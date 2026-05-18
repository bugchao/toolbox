import React, { useCallback, useEffect, useState } from 'react'
import {
  FileSignature,
  Shuffle,
  Copy,
  Check,
  Info,
  AlertCircle,
  ShieldCheck,
  ShieldX,
} from 'lucide-react'
import { PageHero } from '@toolbox/ui-kit'
import { useToolStorage } from '@toolbox/storage'
import { useTranslation } from 'react-i18next'

const NAMESPACE = 'toolHmacSign'

type HashAlg = 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512'
type Encoding = 'utf8' | 'base64' | 'hex' | 'base64url'
type Mode = 'sign' | 'verify'

interface PersistedState {
  algorithm: HashAlg
  keyEncoding: Encoding
  messageEncoding: Encoding
  outputEncoding: Encoding
}

const DEFAULT_STATE: PersistedState = {
  algorithm: 'SHA-256',
  keyEncoding: 'utf8',
  messageEncoding: 'utf8',
  outputEncoding: 'hex',
}

// ── encoding helpers ──────────────────────────────────────
function utf8Encode(s: string): Uint8Array {
  return new TextEncoder().encode(s)
}
function bytesToHex(b: Uint8Array): string {
  let s = ''
  for (let i = 0; i < b.length; i++) s += b[i].toString(16).padStart(2, '0')
  return s
}
function hexToBytes(hex: string): Uint8Array {
  const c = hex.replace(/\s+|0x/gi, '')
  if (c.length % 2 !== 0) throw new Error('Invalid hex length')
  const a = new Uint8Array(c.length / 2)
  for (let i = 0; i < a.length; i++) {
    const v = parseInt(c.slice(i * 2, i * 2 + 2), 16)
    if (Number.isNaN(v)) throw new Error('Invalid hex char')
    a[i] = v
  }
  return a
}
function bytesToBase64(b: Uint8Array): string {
  let bin = ''
  for (let i = 0; i < b.length; i++) bin += String.fromCharCode(b[i])
  return btoa(bin)
}
function base64ToBytes(s: string): Uint8Array {
  const bin = atob(s.replace(/\s+/g, '').replace(/-/g, '+').replace(/_/g, '/'))
  const a = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) a[i] = bin.charCodeAt(i)
  return a
}
function bytesToBase64Url(b: Uint8Array): string {
  return bytesToBase64(b).replace(/=+$/g, '').replace(/\+/g, '-').replace(/\//g, '_')
}
function decodeBytes(s: string, enc: Encoding): Uint8Array {
  if (!s) return new Uint8Array(0)
  if (enc === 'utf8') return utf8Encode(s)
  if (enc === 'hex') return hexToBytes(s)
  return base64ToBytes(s) // base64 and base64url both decodable via base64ToBytes
}
function encodeBytes(b: Uint8Array, enc: Encoding): string {
  if (enc === 'hex') return bytesToHex(b)
  if (enc === 'base64') return bytesToBase64(b)
  if (enc === 'base64url') return bytesToBase64Url(b)
  // utf8 doesn't really make sense for an HMAC tag, but allow
  return new TextDecoder('utf-8', { fatal: false }).decode(b)
}

// Constant-time compare for two byte arrays of equal length
function constantTimeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i]
  return diff === 0
}

const HmacSign: React.FC = () => {
  const { t } = useTranslation(NAMESPACE)
  const { data, save, loading } = useToolStorage<PersistedState>(
    'hmac-sign',
    'config',
    DEFAULT_STATE,
  )

  const [mode, setMode] = useState<Mode>('sign')
  const [key, setKey] = useState('')
  const [message, setMessage] = useState('')
  const [expected, setExpected] = useState('')
  const [output, setOutput] = useState('')
  const [verifyResult, setVerifyResult] = useState<'match' | 'mismatch' | null>(null)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [running, setRunning] = useState(false)

  const update = useCallback(
    <K extends keyof PersistedState>(k: K, v: PersistedState[K]) => {
      void save({ ...data, [k]: v })
    },
    [data, save],
  )

  // When mode flips, clear transient results so stale UI doesn't confuse
  useEffect(() => {
    setVerifyResult(null)
    setError('')
  }, [mode])

  const computeHmac = useCallback(
    async (msg: string, k: string): Promise<Uint8Array> => {
      const keyBytes = decodeBytes(k, data.keyEncoding)
      if (keyBytes.length === 0) throw new Error(t('errors.noKey'))
      const msgBytes = decodeBytes(msg, data.messageEncoding)
      const cryptoKey = await crypto.subtle.importKey(
        'raw',
        new Uint8Array(keyBytes),
        { name: 'HMAC', hash: data.algorithm },
        false,
        ['sign'],
      )
      const sig = await crypto.subtle.sign('HMAC', cryptoKey, new Uint8Array(msgBytes))
      return new Uint8Array(sig)
    },
    [data, t],
  )

  const doSign = useCallback(async () => {
    setError('')
    setRunning(true)
    setVerifyResult(null)
    try {
      const sig = await computeHmac(message, key)
      setOutput(encodeBytes(sig, data.outputEncoding))
    } catch (e) {
      setError((e as Error).message || String(e))
      setOutput('')
    } finally {
      setRunning(false)
    }
  }, [computeHmac, message, key, data.outputEncoding])

  const doVerify = useCallback(async () => {
    setError('')
    setRunning(true)
    setOutput('')
    try {
      if (!expected.trim()) throw new Error(t('errors.noExpected'))
      const computed = await computeHmac(message, key)
      const expectedBytes = decodeBytes(expected.trim(), data.outputEncoding)
      setOutput(encodeBytes(computed, data.outputEncoding))
      setVerifyResult(constantTimeEqual(computed, expectedBytes) ? 'match' : 'mismatch')
    } catch (e) {
      setError((e as Error).message || String(e))
      setVerifyResult(null)
    } finally {
      setRunning(false)
    }
  }, [computeHmac, message, key, expected, data.outputEncoding, t])

  const generateRandomKey = () => {
    const bytes = new Uint8Array(32)
    crypto.getRandomValues(bytes)
    if (data.keyEncoding === 'utf8') {
      // utf8 random key is awkward; switch to base64 for the user
      update('keyEncoding', 'base64')
      setKey(bytesToBase64(bytes))
    } else if (data.keyEncoding === 'hex') {
      setKey(bytesToHex(bytes))
    } else {
      setKey(bytesToBase64(bytes))
    }
  }

  const copyOutput = async () => {
    if (!output) return
    try {
      await navigator.clipboard.writeText(output)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      /* ignore */
    }
  }

  if (loading) {
    return (
      <div className="w-full space-y-6">
        <PageHero title={t('title')} description={t('description')} />
        <div className="text-center text-sm text-gray-400 py-12">{t('loading')}</div>
      </div>
    )
  }

  return (
    <div className="w-full space-y-6 pb-24">
      <PageHero title={t('title')} description={t('description')} />

      <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2 flex items-start gap-2">
        <Info className="w-4 h-4 mt-0.5 shrink-0" />
        <span>{t('disclaimer')}</span>
      </div>

      {/* Config */}
      <section className="rounded-lg border border-gray-200 bg-white p-4 space-y-3">
        <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
          <FileSignature className="w-4 h-4" /> {t('section.config')}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">{t('field.algorithm')}</label>
            <select
              value={data.algorithm}
              onChange={(e) => update('algorithm', e.target.value as HashAlg)}
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="SHA-1">HMAC-SHA1</option>
              <option value="SHA-256">HMAC-SHA256</option>
              <option value="SHA-384">HMAC-SHA384</option>
              <option value="SHA-512">HMAC-SHA512</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">{t('field.outputEncoding')}</label>
            <select
              value={data.outputEncoding}
              onChange={(e) => update('outputEncoding', e.target.value as Encoding)}
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="hex">Hex</option>
              <option value="base64">Base64</option>
              <option value="base64url">Base64URL</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">{t('field.mode')}</label>
            <div className="grid grid-cols-2 border border-gray-300 rounded-md overflow-hidden">
              <button
                type="button"
                onClick={() => setMode('sign')}
                className={`px-2 py-1.5 text-sm font-medium transition-colors ${
                  mode === 'sign' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {t('action.sign')}
              </button>
              <button
                type="button"
                onClick={() => setMode('verify')}
                className={`px-2 py-1.5 text-sm font-medium transition-colors ${
                  mode === 'verify' ? 'bg-emerald-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {t('action.verify')}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Key */}
      <section className="rounded-lg border border-gray-200 bg-white p-4 space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">{t('field.key')}</label>
          <button
            type="button"
            onClick={generateRandomKey}
            className="text-xs text-gray-500 hover:text-indigo-600 inline-flex items-center gap-1"
          >
            <Shuffle className="w-3 h-3" /> {t('key.random')}
          </button>
        </div>
        <input
          type="text"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder={t('key.placeholder')}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
          autoComplete="off"
          spellCheck={false}
        />
        <EncodingPicker
          value={data.keyEncoding}
          onChange={(e) => update('keyEncoding', e)}
          label={t('field.keyEncoding')}
        />
      </section>

      {/* Message */}
      <section className="rounded-lg border border-gray-200 bg-white p-4 space-y-2">
        <label className="text-sm font-medium text-gray-700 block">{t('field.message')}</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={t('message.placeholder')}
          className="w-full h-40 px-3 py-2 text-sm border border-gray-300 rounded-md font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          spellCheck={false}
        />
        <EncodingPicker
          value={data.messageEncoding}
          onChange={(e) => update('messageEncoding', e)}
          label={t('field.messageEncoding')}
        />
      </section>

      {/* Verify mode: expected signature */}
      {mode === 'verify' && (
        <section className="rounded-lg border border-gray-200 bg-white p-4 space-y-2">
          <label className="text-sm font-medium text-gray-700 block">{t('field.expected')}</label>
          <input
            type="text"
            value={expected}
            onChange={(e) => setExpected(e.target.value)}
            placeholder={t('verify.placeholder')}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
            spellCheck={false}
          />
          <p className="text-xs text-gray-400">{t('verify.hint')}</p>
        </section>
      )}

      {/* Output */}
      <section className="rounded-lg border border-gray-200 bg-white p-4 space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">{t('field.output')}</label>
          <button
            type="button"
            onClick={copyOutput}
            disabled={!output}
            className="px-2 py-1 text-xs text-gray-700 hover:text-indigo-600 border border-gray-200 rounded hover:border-indigo-300 disabled:opacity-40 transition-colors flex items-center gap-1"
          >
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            {copied ? t('copied') : t('copy')}
          </button>
        </div>
        <textarea
          value={output}
          readOnly
          placeholder={t('output.placeholder')}
          className="w-full h-24 px-3 py-2 text-sm border border-gray-300 rounded-md font-mono bg-gray-50 resize-none break-all"
          spellCheck={false}
        />
        {verifyResult && (
          <div
            className={`flex items-center gap-2 text-sm rounded-md border px-3 py-2 ${
              verifyResult === 'match'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                : 'bg-red-50 border-red-200 text-red-700'
            }`}
          >
            {verifyResult === 'match' ? (
              <ShieldCheck className="w-4 h-4" />
            ) : (
              <ShieldX className="w-4 h-4" />
            )}
            {verifyResult === 'match' ? t('verify.match') : t('verify.mismatch')}
          </div>
        )}
        {error && (
          <div className="flex items-start gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span className="break-all">{error}</span>
          </div>
        )}
      </section>

      <div className="sticky bottom-4 z-10 flex justify-center pt-2">
        <button
          type="button"
          onClick={mode === 'sign' ? doSign : doVerify}
          disabled={running}
          className={`w-full max-w-md px-6 py-3 text-base font-medium rounded-full shadow-lg transition-colors flex items-center justify-center gap-2 ${
            mode === 'sign' ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-emerald-600 hover:bg-emerald-700'
          } text-white disabled:bg-gray-300 disabled:cursor-not-allowed`}
        >
          <FileSignature className="w-5 h-5" />
          {running ? t('running') : mode === 'sign' ? t('action.sign') : t('action.verify')}
        </button>
      </div>
    </div>
  )
}

interface EncodingPickerProps {
  value: Encoding
  onChange: (e: Encoding) => void
  label: string
}
const EncodingPicker: React.FC<EncodingPickerProps> = ({ value, onChange, label }) => (
  <div className="flex items-center gap-2">
    <span className="text-xs text-gray-500 shrink-0">{label}:</span>
    <div className="inline-flex border border-gray-300 rounded-md overflow-hidden">
      {(['utf8', 'base64', 'hex'] as Encoding[]).map((o) => (
        <button
          key={o}
          type="button"
          onClick={() => onChange(o)}
          className={`px-2 py-1 text-xs uppercase ${
            value === o ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          {o}
        </button>
      ))}
    </div>
  </div>
)

export default HmacSign
