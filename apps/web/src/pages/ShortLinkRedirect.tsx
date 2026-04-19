import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Link2, AlertCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const STORAGE_KEY = 'shortLinks'

interface ShortLinkRecord {
  id: string
  originalUrl: string
  shortCode: string
  shortUrl: string
  createdAt: string
  expiresAt?: string
  clicks: number
  active: boolean
}

const ShortLinkRedirect: React.FC = () => {
  const { t } = useTranslation();
  const { code } = useParams<{ code: string }>()
  const [status, setStatus] = useState<'redirecting' | 'not_found' | 'expired' | 'disabled' | null>(null)

  useEffect(() => {
    if (!code) {
      setStatus('not_found')
      return
    }
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      setStatus('not_found')
      return
    }
    let list: ShortLinkRecord[]
    try {
      list = JSON.parse(raw)
    } catch {
      setStatus('not_found')
      return
    }
    const link = list.find((l) => l.shortCode === code)
    if (!link) {
      setStatus('not_found')
      return
    }
    if (!link.active) {
      setStatus('disabled')
      return
    }
    if (link.expiresAt && new Date(link.expiresAt) < new Date()) {
      setStatus('expired')
      return
    }
    // 更新点击次数并写回
    const updated = list.map((l) =>
      l.shortCode === code ? { ...l, clicks: l.clicks + 1 } : l
    )
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    setStatus('redirecting')
    window.location.replace(link.originalUrl)
  }, [code])

  if (status === 'redirecting' || status === null) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] text-gray-500 dark:text-gray-400">
        <Link2 className="w-12 h-12 animate-pulse mb-4 text-indigo-500" />
        <p>正在跳转…</p>
      </div>
    )
  }

  const messages: Record<string, string> = {
    not_found: '短链接不存在或已被删除',
    expired: '该短链接已过期',
    disabled: '该短链接已禁用',
  }
  const msg = messages[status] ?? '链接无效'

  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] px-4">
      <AlertCircle className="w-14 h-14 text-amber-500 mb-4" />
      <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">{msg}</h2>
      <Link
        to="/short-link"
        className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
      >
        去生成短链接
      </Link>
    </div>
  )
}

export default ShortLinkRedirect
