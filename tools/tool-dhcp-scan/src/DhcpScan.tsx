import React, { useState, useCallback, useRef } from 'react'
import { Play, RotateCcw, Wifi } from 'lucide-react'

interface DhcpServer {
  id: string
  ip: string
  mac: string
  offeredIp: string
  subnetMask: string
  gateway: string
  dns: string
  leasetime: string
  vendor: string
  rogue: boolean
}

const SIMULATED_SERVERS: DhcpServer[] = [
  {
    id: '1', ip: '192.168.1.1', mac: 'aa:bb:cc:00:00:01', offeredIp: '192.168.1.100',
    subnetMask: '255.255.255.0', gateway: '192.168.1.1', dns: '8.8.8.8',
    leasetime: '86400s', vendor: 'Cisco IOS', rogue: false
  },
  {
    id: '2', ip: '192.168.1.254', mac: 'ff:ee:dd:00:00:02', offeredIp: '192.168.1.200',
    subnetMask: '255.255.255.0', gateway: '192.168.1.254', dns: '1.2.3.4',
    leasetime: '3600s', vendor: 'Unknown', rogue: true
  },
]

type ScanStep = 'idle' | 'sending' | 'listening' | 'done'

export function DhcpScan() {
  const [step, setStep] = useState<ScanStep>('idle')
  const [found, setFound] = useState<DhcpServer[]>([])
  const [iface, setIface] = useState('eth0')
  const [timeout, setTimeout_] = useState(5)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const scan = useCallback(() => {
    setStep('sending')
    setFound([])
    timerRef.current = setTimeout(() => {
      setStep('listening')
      // 逐步发现服务器（模拟）
      timerRef.current = setTimeout(() => {
        setFound([SIMULATED_SERVERS[0]])
        timerRef.current = setTimeout(() => {
          setFound(SIMULATED_SERVERS)
          setStep('done')
        }, 1500)
      }, 1200)
    }, 800)
  }, [])

  const reset = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setStep('idle'); setFound([])
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">DHCP 网络扫描</h1>
      <p className="text-gray-500 dark:text-gray-400">模拟发送 DHCP Discover 广播，发现网络中所有 DHCP 服务器（含非授权服务器）</p>

      <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4 text-sm text-yellow-700 dark:text-yellow-400">
        ⚠️ 真实扫描需要 root 权限和原始套接字。此工具为演示模拟，实际部署请使用 dhcping 或 nmap --script broadcast-dhcp-discover。
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">网络接口</label>
            <input value={iface} onChange={e => setIface(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">超时时间 (s)</label>
            <input type="number" min={1} max={30} value={timeout} onChange={e => setTimeout_(parseInt(e.target.value) || 5)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={scan} disabled={step === 'sending' || step === 'listening'}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg font-medium transition-colors">
            <Play className="w-4 h-4" />{step === 'idle' || step === 'done' ? '开始扫描' : '扫描中...'}
          </button>
          <button onClick={reset} className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-lg transition-colors">
            <RotateCcw className="w-4 h-4" />重置
          </button>
        </div>
      </div>

      {/* 状态指示 */}
      {step !== 'idle' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            {step !== 'done' && <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />}
            {step === 'done' && <Wifi className="w-4 h-4 text-green-500" />}
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {step === 'sending' && `正在发送 DHCP Discover 广播到 ${iface}...`}
              {step === 'listening' && `监听 DHCP Offer 响应（超时: ${timeout}s）...`}
              {step === 'done' && `扫描完成，发现 ${found.length} 个 DHCP 服务器`}
            </span>
          </div>
        </div>
      )}

      {/* 发现的服务器 */}
      {found.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">发现的 DHCP 服务器</h2>
          {found.map(s => (
            <div key={s.id} className={`rounded-xl border-2 p-4 ${
              s.rogue ? 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/10' : 'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/10'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900 dark:text-gray-100">{s.ip}</span>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    s.rogue ? 'bg-red-100 dark:bg-red-900/30 text-red-600' : 'bg-green-100 dark:bg-green-900/30 text-green-600'
                  }`}>{s.rogue ? '⚠️ 非授权服务器' : '✅ 授权服务器'}</span>
                </div>
                <span className="text-xs text-gray-400 font-mono">{s.mac}</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                {[
                  ['提供 IP', s.offeredIp], ['子网掩码', s.subnetMask], ['网关', s.gateway],
                  ['DNS', s.dns], ['租期', s.leasetime], ['厂商', s.vendor],
                ].map(([k, v]) => (
                  <div key={k} className="bg-white dark:bg-gray-700/50 rounded p-2">
                    <div className="text-gray-400">{k}</div>
                    <div className="font-mono font-medium text-gray-700 dark:text-gray-300 mt-0.5">{v}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
