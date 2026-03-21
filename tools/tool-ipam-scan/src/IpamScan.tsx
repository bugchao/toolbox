import React, { useState, useCallback, useRef } from 'react'
import { Play, RotateCcw, Search } from 'lucide-react'

interface ScanResult {
  ip: string
  alive: boolean
  latency: number | null
  mac: string
  hostname: string
  vendor: string
}

function ipToInt(ip: string): number {
  return ip.split('.').reduce((acc, oct) => (acc << 8) | parseInt(oct), 0) >>> 0
}

function intToIp(n: number): string {
  return [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join('.')
}

function cidrToRange(cidr: string): { start: number; end: number; count: number } | null {
  const [base, prefixStr] = cidr.split('/')
  const prefix = parseInt(prefixStr)
  if (isNaN(prefix) || prefix < 24 || prefix > 30) return null
  const baseInt = ipToInt(base)
  const mask = (~0 << (32 - prefix)) >>> 0
  const network = (baseInt & mask) >>> 0
  const broadcast = (network | (~mask >>> 0)) >>> 0
  return { start: network + 1, end: broadcast - 1, count: broadcast - network - 1 }
}

const VENDORS = ['Cisco Systems', 'Huawei Technologies', 'Apple Inc.', 'Dell Inc.', 'Unknown', 'Raspberry Pi']
const HOSTNAMES = ['server', 'workstation', 'laptop', 'printer', 'phone', 'router', 'switch', '']

function simulateHost(ip: string, seed: number): ScanResult {
  const alive = seed % 3 !== 0 // ~67% alive
  return {
    ip, alive,
    latency: alive ? Math.round(1 + (seed % 50)) : null,
    mac: alive ? `${(seed % 256).toString(16).padStart(2, '0')}:${((seed * 3) % 256).toString(16).padStart(2, '0')}:cc:dd:ee:${(seed % 16).toString(16).padStart(2, '0')}` : '',
    hostname: alive ? (HOSTNAMES[seed % HOSTNAMES.length] ? `${HOSTNAMES[seed % HOSTNAMES.length]}-${seed % 10 + 1}` : '') : '',
    vendor: alive ? VENDORS[seed % VENDORS.length] : '',
  }
}

export function IpamScan() {
  const [cidr, setCidr] = useState('192.168.1.0/24')
  const [scanning, setScanning] = useState(false)
  const [results, setResults] = useState<ScanResult[]>([])
  const [progress, setProgress] = useState(0)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const stopRef = useRef(false)

  const scan = useCallback(async () => {
    const range = cidrToRange(cidr.trim())
    if (!range) { setError('请输入 /24 ~ /30 的 CIDR，如 192.168.1.0/24'); return }
    if (range.count > 254) { setError('扫描范围过大，请使用 /24 或更小的网段'); return }
    setError('')
    setScanning(true)
    setDone(false)
    setResults([])
    setProgress(0)
    stopRef.current = false

    const batchSize = 8
    const ips: string[] = []
    for (let i = range.start; i <= range.end; i++) ips.push(intToIp(i))

    const all: ScanResult[] = []
    for (let i = 0; i < ips.length; i += batchSize) {
      if (stopRef.current) break
      const batch = ips.slice(i, i + batchSize)
      const batchResults = batch.map((ip, j) => simulateHost(ip, (i + j) * 17 + 3))
      all.push(...batchResults)
      setResults([...all])
      setProgress(Math.round((i + batchSize) / ips.length * 100))
      await new Promise(r => setTimeout(r, 80))
    }
    setScanning(false)
    setDone(true)
  }, [cidr])

  const reset = () => { stopRef.current = true; setScanning(false); setDone(false); setResults([]); setProgress(0) }

  const alive = results.filter(r => r.alive)
  const dead = results.filter(r => !r.alive)

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">IP 地址扫描</h1>
      <p className="text-gray-500 dark:text-gray-400">扫描子网内存活主机，获取 IP、MAC、主机名和厂商信息（模拟演示）</p>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 space-y-4">
        <div className="flex gap-3">
          <input value={cidr} onChange={e => setCidr(e.target.value)}
            placeholder="192.168.1.0/24"
            className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          <button onClick={scanning ? reset : scan}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              scanning ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }`}>
            {scanning ? <><RotateCcw className="w-4 h-4" />停止</> : <><Play className="w-4 h-4" />扫描</>}
          </button>
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}

        {scanning && (
          <div>
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>扫描中...</span><span>{progress}%</span>
            </div>
            <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-500 rounded-full transition-all duration-200" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}
      </div>

      {results.length > 0 && (
        <>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: '已扫描', value: results.length, color: 'text-gray-900 dark:text-gray-100' },
              { label: '存活主机', value: alive.length, color: 'text-green-500' },
              { label: '未响应', value: dead.length, color: 'text-gray-400' },
            ].map(item => (
              <div key={item.label} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 text-center">
                <div className={`text-2xl font-bold ${item.color}`}>{item.value}</div>
                <div className="text-xs text-gray-500 mt-1">{item.label}</div>
              </div>
            ))}
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto max-h-96 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-700/50 sticky top-0">
                  <tr>
                    {['IP 地址', '状态', '延迟', 'MAC', '主机名', '厂商'].map(h => (
                      <th key={h} className="px-3 py-2 text-left text-xs font-medium text-gray-500 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {results.filter(r => r.alive).map((r, i) => (
                    <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                      <td className="px-3 py-2 font-mono text-gray-900 dark:text-gray-100">{r.ip}</td>
                      <td className="px-3 py-2"><span className="px-1.5 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-600 rounded text-xs">存活</span></td>
                      <td className="px-3 py-2 font-mono text-green-500">{r.latency}ms</td>
                      <td className="px-3 py-2 font-mono text-xs text-gray-500">{r.mac}</td>
                      <td className="px-3 py-2 text-gray-700 dark:text-gray-300">{r.hostname || '—'}</td>
                      <td className="px-3 py-2 text-gray-500 text-xs">{r.vendor}</td>
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
