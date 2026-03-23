import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { PageHero } from '@toolbox/ui-kit'
import { useToolStorage } from '@toolbox/storage'
import { Key, AlertTriangle, CheckCircle } from 'lucide-react'

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/')
  while (base64.length % 4) base64 += '='
  try {
    return decodeURIComponent(
      atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
    )
  } catch {
    return atob(base64)
  }
}

function decodeJwt(token: string) {
  try {
    const parts = token.trim().split('.')
    if (parts.length !== 3) return { valid: false, error: '无效的 JWT 格式，应包含 3 个部分', header: {}, payload: {}, signature: '' }
    const [h, p, signature] = parts
    return { valid: true, header: JSON.parse(base64UrlDecode(h)), payload: JSON.parse(base64UrlDecode(p)), signature }
  } catch (e: any) {
    return { valid: false, error: e.message || '解码失败', header: {}, payload: {}, signature: '' }
  }
}

const SAMPLE_JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'

interface JwtState {
  token: string
}

const DEFAULT_STATE: JwtState = { token: '' }

export default function JwtDecoder() {
  const { t } = useTranslation('toolJwtDecoder')
  const [state, setState] = useToolStorage<JwtState>('jwt-decoder', DEFAULT_STATE)
  const { token } = state
  const setToken = (token: string) => setState(prev => ({ ...prev, token }))

  const result = useMemo(() => decodeJwt(token), [token])

  const fmt = (obj: object) => JSON.stringify(obj, null, 2)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <PageHero
        title={t('title')}
        description={t('description')}
        icon={<Key className="w-8 h-8" />}
      />
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
        {/* 输入 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-3">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('token')}</label>
          <textarea value={token} onChange={e => setToken(e.target.value)}
            placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
            rows={4}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          <button onClick={() => setToken(SAMPLE_JWT)} className="text-sm text-indigo-500 hover:text-indigo-600 transition-colors">
            {t('loadSample')}
          </button>
        </div>

        {/* 验证状态 */}
        {token && (
          <div className={`rounded-xl p-4 flex items-center gap-3 ${
            result.valid
              ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
              : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
          }`}>
            {result.valid
              ? <CheckCircle className="w-5 h-5 text-green-500" />
              : <AlertTriangle className="w-5 h-5 text-red-500" />}
            <div>
              <div className={`font-medium ${result.valid ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
                {result.valid ? t('validFormat') : t('invalidFormat')}
              </div>
              {!result.valid && result.error && <div className="text-sm text-red-600 dark:text-red-400">{result.error}</div>}
            </div>
          </div>
        )}

        {/* 解析结果 */}
        {result.valid && (
          <div className="grid gap-4">
            {[
              { label: t('header'), data: result.header, color: 'bg-indigo-500' },
              { label: t('payload'), data: result.payload, color: 'bg-green-500' },
            ].map(({ label, data, color }) => (
              <div key={label} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className={`${color} text-white px-4 py-2 font-medium`}>{label}</div>
                <pre className="p-4 text-sm font-mono text-gray-900 dark:text-gray-100 overflow-x-auto bg-gray-50 dark:bg-gray-900">
                  {fmt(data as object)}
                </pre>
              </div>
            ))}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="bg-purple-500 text-white px-4 py-2 font-medium">{t('signature')}</div>
              <pre className="p-4 text-sm font-mono text-gray-900 dark:text-gray-100 overflow-x-auto bg-gray-50 dark:bg-gray-900 break-all">
                {result.signature}
              </pre>
            </div>
          </div>
        )}

        {/* 说明 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <p className="text-sm text-gray-500">⚠️ 本工具仅用于解码 JWT，不验证签名。生产环境中请务必验证签名！</p>
        </div>
      </div>
    </div>
  )
}
