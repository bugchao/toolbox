import React, { useState, useCallback } from 'react'
import { FileText, Upload, AlertTriangle, CheckCircle } from 'lucide-react'

interface LeaseEntry {
  ip: string
  mac: string
  hostname: string
  starts: string
  ends: string
  state: 'active' | 'expired' | 'free'
  binding: string
}

const SAMPLE_LEASE = `lease 192.168.1.100 {
  starts 6 2026/03/15 08:00:00;
  ends 6 2026/03/16 08:00:00;
  binding state active;
  hardware ethernet aa:bb:cc:dd:ee:01;
  client-hostname "workstation-01";
}
lease 192.168.1.101 {
  starts 5 2026/03/14 10:00:00;
  ends 5 2026/03/14 22:00:00;
  binding state expired;
  hardware ethernet aa:bb:cc:dd:ee:02;
  client-hostname "laptop-02";
}
lease 192.168.1.102 {
  starts 6 2026/03/15 12:00:00;
  ends 6 2026/03/16 12:00:00;
  binding state active;
  hardware ethernet aa:bb:cc:dd:ee:03;
  client-hostname "phone-03";
}
lease 192.168.1.103 {
  starts 4 2026/03/13 09:00:00;
  ends 4 2026/03/13 21:00:00;
  binding state free;
  hardware ethernet aa:bb:cc:dd:ee:04;
  client-hostname "";
}`

function parseLease(text: string): LeaseEntry[] {
  const entries: LeaseEntry[] = []
  const blocks = text.match(/lease\s+[\d.]+\s*\{[^}]+\}/g) || []
  for (const block of blocks) {
    const ip = block.match(/lease\s+([\d.]+)/)?.[1] || ''
    const mac = block.match(/hardware ethernet\s+([\w:]+)/)?.[1] || ''
    const hostname = block.match(/client-hostname\s+"([^"]*)"/)?.[1] || ''
    const starts = block.match(/starts\s+\d+\s+([^;]+)/)?.[1]?.trim() || ''
    const ends = block.match(/ends\s+\d+\s+([^;]+)/)?.[1]?.trim() || ''
    const binding = block.match(/binding state\s+(\w+)/)?.[1] || 'unknown'
    const state: LeaseEntry['state'] = binding === 'active' ? 'active' : binding === 'expired' ? 'expired' : 'free'
    entries.push({ ip, mac, hostname, starts, ends, state, binding })
  }
  return entries
}

export function DhcpLeaseAnalysis() {
  const [text, setText] = useState('')
  const [leases, setLeases] = useState<LeaseEntry[]>([])
  const [parsed, setParsed] = useState(false)

  const parse = useCallback(() => {
    const result = parseLease(text)
    setLeases(result)
    setParsed(true)
  }, [text])

  const loadSample = () => { setText(SAMPLE_LEASE); setParsed(false); setLeases([]) }

  const active = leases.filter(l => l.state === 'active').length
  const expired = leases.filter(l => l.state === 'expired').length
  const free = leases.filter(l => l.state === 'free').length

  const getStateBadge = (state: string) => {
    if (state === 'active') return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
    if (state === 'expired') return 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
    return 'bg-gray-100 dark:bg-gray-700 text-gray-500'
  }

  const getStateLabel = (state: string) =>
    state === 'active' ? '活跃' : state === 'expired' ? '已过期' : '空闲'

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">DHCP Lease 分析</h1>
      <p className="text-gray-500 dark:text-gray-400">粘贴 ISC DHCP dhcpd.leases 文件内容，解析租约状态和分配详情</p>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">粘贴 dhcpd.leases 内容</label>
          <button onClick={loadSample} className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline">加载示例</button>
        </div>
        <textarea value={text} onChange={e => setText(e.target.value)}
          rows={8} placeholder="lease 192.168.1.x { ... }"
          className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
        <button onClick={parse} disabled={!text.trim()}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg font-medium transition-colors">
          <FileText className="w-4 h-4" />解析
        </button>
      </div>

      {parsed && (
        <>
          {leases.length === 0 ? (
            <div className="flex items-center gap-2 text-orange-500 bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-800 rounded-xl p-4">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              未解析到租约记录，请检查格式是否为 ISC DHCP lease 格式
            </div>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: '活跃租约', value: active, color: 'text-green-500' },
                  { label: '已过期', value: expired, color: 'text-red-500' },
                  { label: '空闲', value: free, color: 'text-gray-500' },
                ].map(item => (
                  <div key={item.label} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 text-center">
                    <div className={`text-3xl font-bold ${item.color}`}>{item.value}</div>
                    <div className="text-xs text-gray-500 mt-1">{item.label}</div>
                  </div>
                ))}
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300">
                  租约详情（共 {leases.length} 条）
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-700/50">
                      <tr>
                        {['IP 地址', 'MAC 地址', '主机名', '开始时间', '结束时间', '状态'].map(h => (
                          <th key={h} className="px-4 py-2 text-left text-xs font-medium text-gray-500 whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                      {leases.map((l, i) => (
                        <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                          <td className="px-4 py-2.5 font-mono text-gray-900 dark:text-gray-100">{l.ip}</td>
                          <td className="px-4 py-2.5 font-mono text-gray-600 dark:text-gray-400 text-xs">{l.mac}</td>
                          <td className="px-4 py-2.5 text-gray-700 dark:text-gray-300">{l.hostname || '—'}</td>
                          <td className="px-4 py-2.5 font-mono text-xs text-gray-500">{l.starts}</td>
                          <td className="px-4 py-2.5 font-mono text-xs text-gray-500">{l.ends}</td>
                          <td className="px-4 py-2.5">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStateBadge(l.state)}`}>
                              {getStateLabel(l.state)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}
