import React, { useCallback, useState } from 'react'
import {
  KeyRound,
  Lock,
  Unlock,
  Shuffle,
  Copy,
  Check,
  Eye,
  EyeOff,
  Info,
  AlertCircle,
} from 'lucide-react'
import { PageHero } from '@toolbox/ui-kit'
import { useToolStorage } from '@toolbox/storage'
import { useTranslation } from 'react-i18next'

import {
  type AesMode,
  type KeyBits,
  type Encoding,
  base64ToBytes,
  bytesToBase64,
  bytesToHex,
  decodeBytes,
  derivePbkdf2Key,
  encodeBytes,
  encryptBytes,
  decryptBytes,
  hexToBytes,
  importRawKey,
  ivBytesForMode,
  randomBytes,
  utf8Decode,
  utf8Encode,
} from './cryptoUtils'

const NAMESPACE = 'toolAesCipher'

type KeySource = 'passphrase' | 'raw'
type Direction = 'encrypt' | 'decrypt'

interface PersistedState {
  mode: AesMode
  bits: KeyBits
  keySource: KeySource
  keyEncoding: Encoding
  ivEncoding: Encoding
  outputEncoding: Encoding
  showAad: boolean
  pbkdf2Iterations: number
}

const DEFAULT_STATE: PersistedState = {
  mode: 'GCM',
  bits: 256,
  keySource: 'passphrase',
  keyEncoding: 'base64',
  ivEncoding: 'base64',
  outputEncoding: 'base64',
  showAad: false,
  pbkdf2Iterations: 200_000,
}

const AesCipher: React.FC = () => {
  const { t } = useTranslation(NAMESPACE)
  const { data, save, loading } = useToolStorage<PersistedState>(
    'aes-cipher',
    'config',
    DEFAULT_STATE,
  )

  const [direction, setDirection] = useState<Direction>('encrypt')

  // Transient (NOT persisted): keys, IV, salt, data
  const [passphrase, setPassphrase] = useState('')
  const [showPassphrase, setShowPassphrase] = useState(false)
  const [rawKey, setRawKey] = useState('')
  const [iv, setIv] = useState('')
  const [salt, setSalt] = useState('')
  const [aad, setAad] = useState('')
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [running, setRunning] = useState(false)
  const [copied, setCopied] = useState(false)

  const update = useCallback(
    <K extends keyof PersistedState>(key: K, value: PersistedState[K]) => {
      void save({ ...data, [key]: value })
    },
    [data, save],
  )

  const generateRandomIv = () => {
    const bytes = ivBytesForMode(data.mode)
    setIv(encodeBytes(bytes, data.ivEncoding))
  }
  const generateRandomSalt = () => {
    setSalt(encodeBytes(randomBytes(16), data.ivEncoding))
  }
  const generateRandomRawKey = () => {
    const keyBytes = randomBytes(data.bits / 8)
    setRawKey(encodeBytes(keyBytes, data.keyEncoding))
  }

  const run = useCallback(async () => {
    setError('')
    setRunning(true)
    setOutput('')
    try {
      // ── prepare key ──
      let cryptoKey: CryptoKey
      if (data.keySource === 'passphrase') {
        if (!passphrase) throw new Error(t('errors.noPassphrase'))
        let saltBytes: Uint8Array
        if (direction === 'encrypt') {
          if (salt.trim()) {
            saltBytes = decodeBytes(salt.trim(), data.ivEncoding)
          } else {
            saltBytes = randomBytes(16)
            setSalt(encodeBytes(saltBytes, data.ivEncoding))
          }
        } else {
          if (!salt.trim()) throw new Error(t('errors.noSaltDecrypt'))
          saltBytes = decodeBytes(salt.trim(), data.ivEncoding)
        }
        cryptoKey = await derivePbkdf2Key(
          passphrase,
          saltBytes,
          data.bits,
          data.mode,
          data.pbkdf2Iterations,
        )
      } else {
        if (!rawKey.trim()) throw new Error(t('errors.noRawKey'))
        const raw = decodeBytes(rawKey.trim(), data.keyEncoding)
        const expectedLen = data.bits / 8
        if (raw.length !== expectedLen) {
          throw new Error(
            t('errors.keyLenMismatch', { actual: raw.length, expected: expectedLen }),
          )
        }
        cryptoKey = await importRawKey(raw, data.mode)
      }

      // ── prepare IV ──
      let ivBytes: Uint8Array
      if (direction === 'encrypt') {
        if (iv.trim()) {
          ivBytes = decodeBytes(iv.trim(), data.ivEncoding)
        } else {
          ivBytes = ivBytesForMode(data.mode)
          setIv(encodeBytes(ivBytes, data.ivEncoding))
        }
      } else {
        if (!iv.trim()) throw new Error(t('errors.noIvDecrypt'))
        ivBytes = decodeBytes(iv.trim(), data.ivEncoding)
      }
      // Validate IV length
      const expectedIvLen = data.mode === 'GCM' ? 12 : 16
      if (ivBytes.length !== expectedIvLen && data.mode !== 'CTR') {
        throw new Error(
          t('errors.ivLenMismatch', { actual: ivBytes.length, expected: expectedIvLen }),
        )
      }

      // ── AAD (GCM only) ──
      const aadBytes = data.mode === 'GCM' && data.showAad && aad ? utf8Encode(aad) : undefined

      // ── encrypt or decrypt ──
      if (direction === 'encrypt') {
        const ptBytes = utf8Encode(input)
        const ctBytes = await encryptBytes(ptBytes, {
          mode: data.mode,
          key: cryptoKey,
          iv: ivBytes,
          aad: aadBytes,
        })
        setOutput(encodeBytes(ctBytes, data.outputEncoding))
      } else {
        const ctBytes = decodeBytes(input.trim(), data.outputEncoding)
        const ptBytes = await decryptBytes(ctBytes, {
          mode: data.mode,
          key: cryptoKey,
          iv: ivBytes,
          aad: aadBytes,
        })
        setOutput(utf8Decode(ptBytes))
      }
    } catch (e) {
      const msg = (e as Error).message || String(e)
      setError(
        direction === 'decrypt' && /tag|operation-specific reason|cipher/i.test(msg)
          ? t('errors.decryptFail')
          : msg,
      )
    } finally {
      setRunning(false)
    }
  }, [
    data,
    direction,
    passphrase,
    rawKey,
    iv,
    salt,
    aad,
    input,
    t,
  ])

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

  // When switching encoding for a field, try to re-encode existing value across encodings
  const recodeField = (cur: string, from: Encoding, to: Encoding): string => {
    if (!cur || from === to) return cur
    try {
      const bytes = from === 'base64' ? base64ToBytes(cur) : from === 'hex' ? hexToBytes(cur) : utf8Encode(cur)
      return to === 'base64' ? bytesToBase64(bytes) : to === 'hex' ? bytesToHex(bytes) : utf8Decode(bytes)
    } catch {
      return cur
    }
  }

  const setKeyEncoding = (enc: Encoding) => {
    setRawKey((cur) => recodeField(cur, data.keyEncoding, enc))
    update('keyEncoding', enc)
  }
  const setIvEncoding = (enc: Encoding) => {
    setIv((cur) => recodeField(cur, data.ivEncoding, enc))
    setSalt((cur) => recodeField(cur, data.ivEncoding, enc))
    update('ivEncoding', enc)
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

      {/* Algorithm config */}
      <section className="rounded-lg border border-gray-200 bg-white p-4 space-y-3">
        <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
          <KeyRound className="w-4 h-4" /> {t('section.algorithm')}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">{t('field.mode')}</label>
            <select
              value={data.mode}
              onChange={(e) => update('mode', e.target.value as AesMode)}
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="GCM">AES-GCM ({t('mode.gcmHint')})</option>
              <option value="CBC">AES-CBC ({t('mode.cbcHint')})</option>
              <option value="CTR">AES-CTR ({t('mode.ctrHint')})</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">{t('field.bits')}</label>
            <select
              value={data.bits}
              onChange={(e) => update('bits', Number(e.target.value) as KeyBits)}
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value={128}>128 bit</option>
              <option value={192}>192 bit</option>
              <option value={256}>256 bit</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">{t('field.direction')}</label>
            <div className="grid grid-cols-2 border border-gray-300 rounded-md overflow-hidden">
              <button
                type="button"
                onClick={() => setDirection('encrypt')}
                className={`px-2 py-1.5 text-sm font-medium transition-colors flex items-center justify-center gap-1 ${
                  direction === 'encrypt'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                {t('action.encrypt')}
              </button>
              <button
                type="button"
                onClick={() => setDirection('decrypt')}
                className={`px-2 py-1.5 text-sm font-medium transition-colors flex items-center justify-center gap-1 ${
                  direction === 'decrypt'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Unlock className="w-3.5 h-3.5" />
                {t('action.decrypt')}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Key */}
      <section className="rounded-lg border border-gray-200 bg-white p-4 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
            <KeyRound className="w-4 h-4" /> {t('section.key')}
          </h2>
          <div className="inline-flex border border-gray-300 rounded-md overflow-hidden">
            <button
              type="button"
              onClick={() => update('keySource', 'passphrase')}
              className={`px-3 py-1 text-xs ${
                data.keySource === 'passphrase' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700'
              }`}
            >
              {t('key.passphrase')}
            </button>
            <button
              type="button"
              onClick={() => update('keySource', 'raw')}
              className={`px-3 py-1 text-xs ${
                data.keySource === 'raw' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700'
              }`}
            >
              {t('key.raw')}
            </button>
          </div>
        </div>

        {data.keySource === 'passphrase' ? (
          <>
            <div className="relative">
              <input
                type={showPassphrase ? 'text' : 'password'}
                value={passphrase}
                onChange={(e) => setPassphrase(e.target.value)}
                placeholder={t('key.passphrasePlaceholder')}
                className="w-full pr-10 px-3 py-2 text-sm border border-gray-300 rounded-md font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                autoComplete="off"
                spellCheck={false}
              />
              <button
                type="button"
                onClick={() => setShowPassphrase((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
              >
                {showPassphrase ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto] gap-2 items-center">
              <input
                type="text"
                value={salt}
                onChange={(e) => setSalt(e.target.value)}
                placeholder={t('key.saltPlaceholder')}
                className="px-3 py-2 text-sm border border-gray-300 rounded-md font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                spellCheck={false}
              />
              <button
                type="button"
                onClick={generateRandomSalt}
                className="px-2 py-1.5 text-xs text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-1"
                title={t('key.saltRandom')}
              >
                <Shuffle className="w-3 h-3" /> {t('key.saltRandom')}
              </button>
              <input
                type="number"
                min={10_000}
                max={2_000_000}
                step={50_000}
                value={data.pbkdf2Iterations}
                onChange={(e) =>
                  update('pbkdf2Iterations', Math.max(10_000, Number(e.target.value) || 10_000))
                }
                className="w-28 px-2 py-1.5 text-xs border border-gray-300 rounded-md font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                title={t('key.iterationsTitle')}
              />
            </div>
            <p className="text-xs text-gray-400">{t('key.passphraseHint')}</p>
          </>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-2 items-center">
              <input
                type="text"
                value={rawKey}
                onChange={(e) => setRawKey(e.target.value)}
                placeholder={t('key.rawPlaceholder', { bytes: data.bits / 8 })}
                className="px-3 py-2 text-sm border border-gray-300 rounded-md font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                spellCheck={false}
              />
              <button
                type="button"
                onClick={generateRandomRawKey}
                className="px-2 py-1.5 text-xs text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-1"
              >
                <Shuffle className="w-3 h-3" /> {t('key.rawRandom')}
              </button>
            </div>
            <EncodingPicker
              value={data.keyEncoding}
              onChange={setKeyEncoding}
              label={t('field.keyEncoding')}
              compact
              forbidUtf8
            />
          </>
        )}
      </section>

      {/* IV */}
      <section className="rounded-lg border border-gray-200 bg-white p-4 space-y-3">
        <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
          <Shuffle className="w-4 h-4" /> {t('section.iv')}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-2 items-center">
          <input
            type="text"
            value={iv}
            onChange={(e) => setIv(e.target.value)}
            placeholder={t('iv.placeholder', { bytes: data.mode === 'GCM' ? 12 : 16 })}
            className="px-3 py-2 text-sm border border-gray-300 rounded-md font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
            spellCheck={false}
          />
          <button
            type="button"
            onClick={generateRandomIv}
            className="px-2 py-1.5 text-xs text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-1"
          >
            <Shuffle className="w-3 h-3" /> {t('iv.random')}
          </button>
        </div>
        <EncodingPicker
          value={data.ivEncoding}
          onChange={setIvEncoding}
          label={t('field.ivEncoding')}
          compact
          forbidUtf8
        />
        {data.mode === 'GCM' && (
          <div className="space-y-2">
            <label className="inline-flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={data.showAad}
                onChange={(e) => update('showAad', e.target.checked)}
                className="rounded border-gray-300"
              />
              {t('iv.useAad')}
            </label>
            {data.showAad && (
              <input
                type="text"
                value={aad}
                onChange={(e) => setAad(e.target.value)}
                placeholder={t('iv.aadPlaceholder')}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                spellCheck={false}
              />
            )}
          </div>
        )}
      </section>

      {/* Output encoding */}
      <section className="rounded-lg border border-gray-200 bg-white p-4 space-y-2">
        <EncodingPicker
          value={data.outputEncoding}
          onChange={(enc) => update('outputEncoding', enc)}
          label={t('field.outputEncoding')}
          forbidUtf8
        />
      </section>

      {/* Input + Output */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            {direction === 'encrypt' ? t('io.plaintext') : t('io.ciphertext')}
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              direction === 'encrypt' ? t('io.plaintextPlaceholder') : t('io.ciphertextPlaceholder')
            }
            className="w-full h-64 px-3 py-2 text-sm border border-gray-300 rounded-md font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            spellCheck={false}
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">
              {direction === 'encrypt' ? t('io.ciphertext') : t('io.plaintext')}
            </label>
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
            placeholder={t('io.outputPlaceholder')}
            className="w-full h-64 px-3 py-2 text-sm border border-gray-300 rounded-md font-mono bg-gray-50 resize-none"
            spellCheck={false}
          />
        </div>
      </section>

      {error && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span className="break-all">{error}</span>
        </div>
      )}

      <div className="sticky bottom-4 z-10 flex justify-center pt-2">
        <button
          type="button"
          onClick={run}
          disabled={running}
          className={`w-full max-w-md px-6 py-3 text-base font-medium rounded-full shadow-lg transition-colors flex items-center justify-center gap-2 ${
            direction === 'encrypt'
              ? 'bg-indigo-600 hover:bg-indigo-700'
              : 'bg-emerald-600 hover:bg-emerald-700'
          } text-white disabled:bg-gray-300 disabled:cursor-not-allowed`}
        >
          {direction === 'encrypt' ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}
          {running ? t('running') : direction === 'encrypt' ? t('action.encrypt') : t('action.decrypt')}
        </button>
      </div>
    </div>
  )
}

interface EncodingPickerProps {
  value: Encoding
  onChange: (e: Encoding) => void
  label: string
  compact?: boolean
  forbidUtf8?: boolean
}
const EncodingPicker: React.FC<EncodingPickerProps> = ({ value, onChange, label, compact, forbidUtf8 }) => {
  const options: Encoding[] = forbidUtf8 ? ['base64', 'hex'] : ['base64', 'hex', 'utf8']
  return (
    <div className={`flex items-center gap-2 ${compact ? '' : 'flex-wrap'}`}>
      <span className="text-xs text-gray-500 shrink-0">{label}:</span>
      <div className="inline-flex border border-gray-300 rounded-md overflow-hidden">
        {options.map((o) => (
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
}

export default AesCipher
