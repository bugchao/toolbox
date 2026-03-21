import React, { useState, useCallback } from 'react'
import { FileText, AlertTriangle } from 'lucide-react'

interface LogEntry {
  time: string
  type: 'DISCOVER' | 'OFFER' | 'REQUEST' | 'ACK' | 'NAK' | 'RELEASE' | 'INFORM' | 'OTHER'
  ip: string
  mac: string
  hostname: string
  raw: string
}

const TYPE_COLORS: Record<string, string> = {
  DISCOVER: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
  OFFER: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400',
  REQUEST: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
  ACK: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400',
  NAK: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
  RELEASE: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400',
  INFORM: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
  OTHER: 'bg-gray-100 dark:bg-gray-700 text-gray-500',
}

const SAMPLE_LOG = `Mar 21 10:00:01 dhcpd: DHCPDISCOVER from aa:bb:cc:dd:ee:01 via eth0
Mar 21 10:00:01 dhcpd: DHCPOFFER on 192.168.1.100 to aa:bb:cc:dd:ee:01 via eth0
Mar 21 10:00:02 dhcpd: DHCPREQUEST for 192.168.1.100 from aa:bb:cc:dd:ee:01 (workstation-01) via eth0
Mar 21 10:00:02 dhcpd: DHCPACK on 192.168.1.100 to aa:bb:cc:dd:ee:01 (workstation-01) via eth0
Mar 21 10:01:15 dhcpd: DHCPDISCOVER from aa:bb:cc:dd:ee:02 via eth0
Mar 21 10:01:15 dhcpd: DHCPOFFER on 192.168.1.101 to aa:bb:cc:dd:ee:02 via eth0
Mar 21 10:01:16 dhcpd: DHCPREQUEST for 192.168.1.101 from aa:bb:cc:dd:ee:02 (laptop-02) via eth0
Mar 21 10:01:16 dhcpd: DHCPACK on 192.168.1.101 to aa:bb:cc:dd:ee:02 (laptop-02) via eth0
Mar 21 10:05:33 dhcpd: DHCPNAK on 192.168.1.200 to aa:bb:cc:dd:ee:03 via eth0
Mar 21 10:10:00 dhcpd: DHCPRELEASE of 192.168.1.100 from aa:bb:cc:dd:ee:01 (workstation-01) via eth0
Mar 21 10:15:22 dhcpd: DHCPDISCOVER from aa:bb:cc:dd:ee:04 via eth0
Mar 21 10:15:22 dhcpd: DHCPOFFER on 192.168.1.102 to aa:bb:cc:dd:ee:04 via eth0
Mar 21 10:15:23 dhcpd: DHCPREQUEST for 192.168.1.102 from aa:bb:cc:dd:ee:04 (phone-04) via eth0
Mar 21 10:15:23 dhcpd: DHCPACK on 192.168.1.102 to aa:bb:cc:dd:ee:04 (phone-04) via eth0`

function parseLog(text: string): LogEntry[] {
  const entries: LogEntry[] = []
  const lines = text.split('\n').filter(l => l.trim() && l.includes('dhcpd'))
  for (const line of lines) {
    const timeMatch = line.match(/^(\w+ \d+ \d+:\d+:\d+)/)
    const time = timeMatch?.[1] || ''
    let type: LogEntry['type'] = 'OTHER'
    if (line.includes('DHCPDISCOVER')) type = 'DISCOVER'
    else if (line.includes('DHCPOFFER')) type = 'OFFER'
    else if (line.includes('DHCPREQUEST')) type = 'REQUEST'
    else if (line.includes('DHCPACK')) type = 'ACK'
    else if (line.includes('DHCPNAK')) type = 'NAK'
    else if (line.includes('DHCPRELEASE')) type = 'RELEASE'
    else if (line.includes('DHCPINFORM')) type = 'INFORM'
    const ipMatch = line.match(/(\d+\.\d+\.\d+\.\d+)/)
    const ip = ipMatch?.[1] || ''
    const macMatch = line.match(/([0-9a-f]{2}(?::[0-9a-f]{2}){5})/i)
    const mac = macMatch?.[1] || ''
    const hostnameMatch = line.match(/\(([^)]+)\)/)
    const hostname = hostnameMatch?.[1] || ''
    entries.push({ time, type, ip, mac, hostname, raw: line })
  }
  return entries
}

export function DhcpLogAnalysis() {
  const [text, setText] = useState('')
  const [entries, setEntries] = useState<LogEntry[]>([])
  const [parsed, setParsed] = useState(false)
  const [filter, setFilter] = useState<string>('ALL')

  const parse = useCallback(() => { setEntries(parseLog(text)); setParsed(true) }, [text])
  const loadSample = () => { setText(SAMPLE_LOG); setParsed(false); setEntries([]) }

  const filtered = filter === 'ALL' ? entries : entries.filter(e => e.type === filter)

  const counts = entries.reduce((acc, e) => { acc[e.type] = (acc[e.type] || 0) + 1; return acc }, {} as Record<string, number>)

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">DHCP 日志分析</h1>
      <p className="text-gray-500 dark:text-gray-400">解析 ISC DHCP 服务器日志，分析各类消息分布和设备活动</p>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">粘贴 DHCP 日志</label>
          <button onClick={loadSample} className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline">加载示例</button>
        </div>
        <textarea value={text} onChange={e => setText(e.target.value)} rows={7}
          placeholder="Mar 21 10:00:01 dhcpd: DHCPDISCOVER from ..."
          className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
        <button onClick={parse} disabled={!text.trim()}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg font-medium transition-colors">
          <FileText className="w-4 h-4" />解析日志
        </button>
      </div>

      {parsed && entries.length === 0 && (
        <div className="flex items-center gap-2 text-orange-500 bg-orange-50 dark:bg-orange-900/10 border border-orange-200 rounded-xl p-4">
          <AlertTriangle className="w-4 h-4" />未解析到 DHCP 日志条目，请确认日志格式
        </div>
      )}

      {parsed && entries.length > 0 && (
        <>
          {/* 统计 */}
          <div className="flex flex-wrap gap-2">
            {(['ALL', 'DISCOVER', 'OFFER', 'REQUEST', 'ACK', 'NAK', 'RELEASE'] as const).map(t => (
              <button key={t} onClick={() => setFilter(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  filter === t ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
                }`}>
                {t === 'ALL' ? `全部 (${entries.length})` : `${t} (${counts[t] || 0})`}
              </button>
            ))}
          </div>

          {/* 日志表 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto max-h-96 overflow-y-auto">
              <table className="w-full text-xs">
                <thead className="bg-gray-50 dark:bg-gray-700/50 sticky top-0">
                  <tr>
                    {['时间', '类型', 'IP', 'MAC', '主机名'].map(h => (
                      <th key={h} className="px-3 py-2 text-left font-medium text-gray-500 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {filtered.map((e, i) => (
                    <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                      <td className="px-3 py-2 font-mono text-gray-500 whitespace-nowrap">{e.time}</td>
                      <td className="px-3 py-2">
                        <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${TYPE_COLORS[e.type]}`}>{e.type}</span>
                      </td>
                      <td className="px-3 py-2 font-mono text-gray-700 dark:text-gray-300">{e.ip || '—'}</td>
                      <td className="px-3 py-2 font-mono text-gray-500">{e.mac || '—'}</td>
                      <td className="px-3 py-2 text-gray-700 dark:text-gray-300">{e.hostname || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
