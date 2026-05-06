import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Key, Copy, Download, AlertTriangle, Check } from 'lucide-react'
import { PageHero } from '@toolbox/ui-kit'

type KeySize = 1024 | 2048 | 4096
type OutputFormat = 'PKCS#1' | 'PKCS#8'

interface KeyPair {
  publicKey: string
  privateKey: string
  fingerprint: string
}

// 将 ArrayBuffer 转换为 Base64
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

// 计算 SHA-256 指纹
async function calculateFingerprint(publicKey: CryptoKey): Promise<string> {
  const exported = await crypto.subtle.exportKey('spki', publicKey)
  const hash = await crypto.subtle.digest('SHA-256', exported)
  const hashArray = Array.from(new Uint8Array(hash))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join(':')
}

// 格式化 PEM
function formatPEM(base64: string, type: string): string {
  const lines: string[] = []
  for (let i = 0; i < base64.length; i += 64) {
    lines.push(base64.substring(i, i + 64))
  }
  return `-----BEGIN ${type}-----\n${lines.join('\n')}\n-----END ${type}-----`
}

export default function RsaKeygen() {
  const { t } = useTranslation('toolRsaKeygen')
  const [keySize, setKeySize] = useState<KeySize>(2048)
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('PKCS#1')
  const [keyPair, setKeyPair] = useState<KeyPair | null>(null)
  const [generating, setGenerating] = useState(false)
  const [copiedPublic, setCopiedPublic] = useState(false)
  const [copiedPrivate, setCopiedPrivate] = useState(false)

  const generateKeys = async () => {
    setGenerating(true)
    setCopiedPublic(false)
    setCopiedPrivate(false)
    
    try {
      // 生成 RSA 密钥对
      const keyPair = await crypto.subtle.generateKey(
        {
          name: 'RSA-OAEP',
          modulusLength: keySize,
          publicExponent: new Uint8Array([1, 0, 1]),
          hash: 'SHA-256',
        },
        true,
        ['encrypt', 'decrypt']
      )

      // 导出公钥 (SPKI format)
      const publicKeyBuffer = await crypto.subtle.exportKey('spki', keyPair.publicKey)
      const publicKeyBase64 = arrayBufferToBase64(publicKeyBuffer)
      const publicKeyPEM = formatPEM(publicKeyBase64, 'PUBLIC KEY')

      // 导出私钥 (PKCS#8 format)
      const privateKeyBuffer = await crypto.subtle.exportKey('pkcs8', keyPair.privateKey)
      const privateKeyBase64 = arrayBufferToBase64(privateKeyBuffer)
      const privateKeyPEM = formatPEM(
        privateKeyBase64,
        outputFormat === 'PKCS#8' ? 'PRIVATE KEY' : 'RSA PRIVATE KEY'
      )

      // 计算指纹
      const fingerprint = await calculateFingerprint(keyPair.publicKey)

      setKeyPair({
        publicKey: publicKeyPEM,
        privateKey: privateKeyPEM,
        fingerprint,
      })
    } catch (error) {
      console.error('Key generation failed:', error)
      alert(t('generateError'))
    } finally {
      setGenerating(false)
    }
  }

  const copyToClipboard = async (text: string, isPublic: boolean) => {
    try {
      await navigator.clipboard.writeText(text)
      if (isPublic) {
        setCopiedPublic(true)
        setTimeout(() => setCopiedPublic(false), 2000)
      } else {
        setCopiedPrivate(true)
        setTimeout(() => setCopiedPrivate(false), 2000)
      }
    } catch (error) {
      console.error('Copy failed:', error)
    }
  }

  const downloadKey = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <PageHero title={t('title')} description={t('description')} icon={Key} />
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">

        {/* 配置区 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                {t('keySize')}
              </label>
              <div className="flex gap-2">
                {([1024, 2048, 4096] as KeySize[]).map(size => (
                  <button
                    key={size}
                    onClick={() => setKeySize(size)}
                    className={`flex-1 py-2 px-3 text-sm rounded-lg font-medium transition-colors ${
                      keySize === size
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {size} bit
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {keySize === 1024 && t('keySizeWarning1024')}
                {keySize === 2048 && t('keySizeRecommended')}
                {keySize === 4096 && t('keySizeHighSecurity')}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                {t('outputFormat')}
              </label>
              <div className="flex gap-2">
                {(['PKCS#1', 'PKCS#8'] as OutputFormat[]).map(format => (
                  <button
                    key={format}
                    onClick={() => setOutputFormat(format)}
                    className={`flex-1 py-2 px-3 text-sm rounded-lg font-medium transition-colors ${
                      outputFormat === format
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {format}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-1">{t('formatDescription')}</p>
            </div>
          </div>

          <button
            onClick={generateKeys}
            disabled={generating}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Key size={18} />
            {generating ? t('generating') : t('generate')}
          </button>
        </div>

        {/* 安全提示 */}
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex gap-3">
          <AlertTriangle className="text-amber-600 flex-shrink-0" size={20} />
          <div className="text-sm text-amber-800 dark:text-amber-200">
            <p className="font-semibold mb-1">{t('securityWarningTitle')}</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>{t('securityWarning1')}</li>
              <li>{t('securityWarning2')}</li>
              <li>{t('securityWarning3')}</li>
            </ul>
          </div>
        </div>

        {/* 密钥显示区 */}
        {keyPair && (
          <div className="space-y-4">
            {/* 指纹 */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                {t('fingerprint')}
              </h3>
              <code className="text-xs text-gray-600 dark:text-gray-400 font-mono break-all">
                {keyPair.fingerprint}
              </code>
            </div>

            {/* 公钥 */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="px-4 py-3 bg-green-50 dark:bg-green-900/20 border-b border-green-100 dark:border-green-800 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-green-700 dark:text-green-300">
                  {t('publicKey')}
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => copyToClipboard(keyPair.publicKey, true)}
                    className="px-3 py-1.5 text-xs bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-1.5 transition-colors"
                  >
                    {copiedPublic ? <Check size={14} /> : <Copy size={14} />}
                    {copiedPublic ? t('copied') : t('copy')}
                  </button>
                  <button
                    onClick={() => downloadKey(keyPair.publicKey, 'public_key.pem')}
                    className="px-3 py-1.5 text-xs bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-1.5 transition-colors"
                  >
                    <Download size={14} />
                    {t('download')}
                  </button>
                </div>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-900">
                <pre className="text-xs text-gray-700 dark:text-gray-300 font-mono overflow-x-auto whitespace-pre-wrap break-all">
                  {keyPair.publicKey}
                </pre>
              </div>
            </div>

            {/* 私钥 */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-red-200 dark:border-red-800 overflow-hidden">
              <div className="px-4 py-3 bg-red-50 dark:bg-red-900/20 border-b border-red-100 dark:border-red-800 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-red-700 dark:text-red-300">
                  {t('privateKey')}
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => copyToClipboard(keyPair.privateKey, false)}
                    className="px-3 py-1.5 text-xs bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center gap-1.5 transition-colors"
                  >
                    {copiedPrivate ? <Check size={14} /> : <Copy size={14} />}
                    {copiedPrivate ? t('copied') : t('copy')}
                  </button>
                  <button
                    onClick={() => downloadKey(keyPair.privateKey, 'private_key.pem')}
                    className="px-3 py-1.5 text-xs bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center gap-1.5 transition-colors"
                  >
                    <Download size={14} />
                    {t('download')}
                  </button>
                </div>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-900">
                <pre className="text-xs text-gray-700 dark:text-gray-300 font-mono overflow-x-auto whitespace-pre-wrap break-all">
                  {keyPair.privateKey}
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
