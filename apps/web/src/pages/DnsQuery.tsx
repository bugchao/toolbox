import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Search, Copy, Check, Loader2, Server, Globe, AlertCircle } from 'lucide-react'
import { PageHero } from '@toolbox/ui-kit'

const DOH_URL = 'https://cloudflare-dns.com/dns-query'

const RECORD_TYPES = [
  { value: 'A', label: 'A (IPv4)' },
  { value: 'AAAA', label: 'AAAA (IPv6)' },
  { value: 'MX', label: 'MX (邮件)' },
  { value: 'TXT', label: 'TXT' },
  { value: 'CNAME', label: 'CNAME' },
  { value: 'NS', label: 'NS' },
  { value: 'SOA', label: 'SOA' },
] as const

interface DnsQuestion {
  name: string
  type: number
}

interface DnsAnswer {
  name: string
  type: number
  TTL: number
  data: string
}

interface DnsResponse {
  Status: number
  TC: boolean
  RD: boolean
  RA: boolean
  AD?: boolean
  CD?: boolean
  Question?: DnsQuestion[]
  Answer?: DnsAnswer[]
  Authority?: DnsAnswer[]
  Comment?: string
}

const TYPE_NAMES: Record<number, string> = {
  1: 'A',
  5: 'CNAME',
  6: 'SOA',
  15: 'MX',
  16: 'TXT',
  2: 'NS',
  28: 'AAAA',
}

function formatSoaData(data: string): string {
  const parts = data.split(' ')
  if (parts.length >= 7) {
    const [mname, rname, serial, refresh, retry, expire, minimum] = parts
    return `MNAME ${mname} RNAME ${rname} Serial ${serial} Refresh ${refresh} Retry ${retry} Expire ${expire} Minimum ${minimum}`
  }
  return data
}

const DnsQuery: React.FC = () => {
  const { t } = useTranslation('nav')
  const { t: tHome } = useTranslation('home')
  const [domain, setDomain] = useState('')
  const [recordType, setRecordType] = useState<string>('A')
  const [result, setResult] = useState<DnsResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const normalizeDomain = (raw: string) => {
    const s = raw.trim().toLowerCase().replace(/^https?:\/\//, '').split('/')[0]
    return s || ''
  }

  const queryDns = async (e: React.FormEvent) => {
    e.preventDefault()
    const name = normalizeDomain(domain)
    if (!name) {
      setError('请输入要查询的域名')
      return
    }
    const hostnameRegex = /^([a-z0-9]([a-z0-9-]*[a-z0-9])?\.)*[a-z0-9]([a-z0-9-]*[a-z0-9])?$/i
    if (!hostnameRegex.test(name)) {
      setError('请输入有效的域名')
      return
    }
    const qname = name.endsWith('.') ? name : name

    setLoading(true)
    setError('')
    setResult(null)
    try {
      const url = `${DOH_URL}?name=${encodeURIComponent(qname)}&type=${recordType}`
      const res = await fetch(url, { headers: { Accept: 'application/dns-json' } })
      const data: DnsResponse = await res.json()
      setResult(data)
      if (data.Status !== 0 && data.Status !== 3) {
        setError(data.Comment || `DNS 返回状态码 ${data.Status}`)
      }
    } catch (err) {
      setError('网络请求失败，请检查网络或稍后重试')
    } finally {
      setLoading(false)
    }
  }

  const copyResult = () => {
    if (!result) return
    const text = JSON.stringify(result, null, 2)
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const renderAnswer = (r: DnsAnswer) => {
    const typeName = TYPE_NAMES[r.type] ?? `TYPE${r.type}`
    const displayData = r.type === 6 ? formatSoaData(r.data) : r.data
    return (
      <tr key={`${r.name}-${r.data}-${r.TTL}`} className="border-b border-gray-100 last:border-0">
        <td className="py-2 px-3 text-gray-700 font-mono text-sm">{r.name}</td>
        <td className="py-2 px-3">
          <span className="inline-flex px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 text-xs font-medium">
            {typeName}
          </span>
        </td>
        <td className="py-2 px-3 text-gray-600 text-sm">{r.TTL}</td>
        <td className="py-2 px-3 text-gray-900 font-mono text-sm break-all">{displayData}</td>
      </tr>
    )
  }

  return (
    <div className="space-y-6">
      <PageHero
        title={t('tools.dns_query')}
        description={tHome('toolDesc.dns_query')}
      />

      <div className="card">
        <form onSubmit={queryDns} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label htmlFor="dns-domain" className="block text-sm font-medium text-gray-700 mb-2">
                域名
              </label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  id="dns-domain"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  placeholder="example.com"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
            <div className="w-full sm:w-40">
              <label htmlFor="dns-type" className="block text-sm font-medium text-gray-700 mb-2">
                记录类型
              </label>
              <select
                id="dns-type"
                value={recordType}
                onChange={(e) => setRecordType(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
              >
                {RECORD_TYPES.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
          </div>
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 flex items-center">
              <AlertCircle className="w-5 h-5 mr-2 shrink-0" />
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            ) : (
              <Search className="w-5 h-5 mr-2" />
            )}
            查询
          </button>
        </form>
      </div>

      {loading && (
        <div className="card text-center py-12">
          <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">正在查询 DNS…</p>
        </div>
      )}

      {result && !loading && (
        <div className="card bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-indigo-900 flex items-center">
              <Server className="w-5 h-5 mr-2" />
              查询结果
            </h3>
            <button
              type="button"
              onClick={copyResult}
              className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center"
            >
              {copied ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
              {copied ? '已复制' : '复制 JSON'}
            </button>
          </div>
          <div className="text-sm text-gray-600 mb-3">
            状态: {result.Status === 0 ? '成功' : result.Status === 3 ? 'NXDOMAIN' : `错误 (${result.Status})`}
            {result.Question?.length ? ` · 查询: ${result.Question.map((q) => `${q.name} ${TYPE_NAMES[q.type] || q.type}`).join(', ')}` : ''}
          </div>
          {(result.Answer?.length ?? 0) > 0 && (
            <div className="overflow-x-auto rounded-lg border border-indigo-100 bg-white">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-indigo-50 text-gray-700">
                    <th className="py-2 px-3 text-sm font-medium">名称</th>
                    <th className="py-2 px-3 text-sm font-medium">类型</th>
                    <th className="py-2 px-3 text-sm font-medium">TTL</th>
                    <th className="py-2 px-3 text-sm font-medium">数据</th>
                  </tr>
                </thead>
                <tbody>
                  {result.Answer!.map(renderAnswer)}
                </tbody>
              </table>
            </div>
          )}
          {(result.Authority?.length ?? 0) > 0 && (
            <>
              <h4 className="text-sm font-medium text-gray-700 mt-4 mb-2">权威记录 (Authority)</h4>
              <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50 text-gray-600">
                      <th className="py-2 px-3 text-sm font-medium">名称</th>
                      <th className="py-2 px-3 text-sm font-medium">类型</th>
                      <th className="py-2 px-3 text-sm font-medium">TTL</th>
                      <th className="py-2 px-3 text-sm font-medium">数据</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.Authority!.map(renderAnswer)}
                  </tbody>
                </table>
              </div>
            </>
          )}
          {(!result.Answer?.length && !result.Authority?.length) && result.Status === 0 && (
            <p className="text-gray-500 text-sm">该查询无记录返回。</p>
          )}
          {result.Status === 3 && (
            <p className="text-amber-700 text-sm">域名不存在 (NXDOMAIN)。</p>
          )}
        </div>
      )}

      <div className="card bg-gray-50">
        <h3 className="text-lg font-bold text-gray-900 mb-3">使用说明</h3>
        <ul className="space-y-2 text-gray-600 text-sm">
          <li className="flex items-start">
            <span className="text-indigo-600 mr-2">•</span>
            输入域名即可查询，支持 A、AAAA、MX、TXT、CNAME、NS、SOA 等常见记录类型。
          </li>
          <li className="flex items-start">
            <span className="text-indigo-600 mr-2">•</span>
            查询通过 Cloudflare DoH (DNS over HTTPS) 进行，结果与本地 DNS 可能因缓存或策略不同而略有差异。
          </li>
          <li className="flex items-start">
            <span className="text-indigo-600 mr-2">•</span>
            不记录查询历史，所有请求直接发往公共 DNS，保护隐私。
          </li>
        </ul>
      </div>
    </div>
  )
}

export default DnsQuery
