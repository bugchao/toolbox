import React, { useState, useCallback, useRef } from 'react'
import { Play, RotateCcw, Wifi } from 'lucide-react'

type StepStatus = 'idle' | 'active' | 'done' | 'error'

interface Step {
  id: number
  name: string
  from: string
  to: string
  desc: string
  detail: string
  color: string
}

const STEPS: Step[] = [
  {
    id: 1, name: 'DHCP Discover', from: '客户端', to: '广播 (255.255.255.255)',
    desc: '客户端广播发现可用 DHCP 服务器',
    detail: 'src=0.0.0.0:68 dst=255.255.255.255:67 | 携带 MAC 地址，请求 IP 配置',
    color: '#6366f1'
  },
  {
    id: 2, name: 'DHCP Offer', from: 'DHCP 服务器', to: '客户端 (广播)',
    desc: '服务器提供可用 IP 地址及配置',
    detail: '提供 IP: 192.168.1.100 | 子网: 255.255.255.0 | 网关: 192.168.1.1 | DNS: 8.8.8.8 | 租期: 24h',
    color: '#3b82f6'
  },
  {
    id: 3, name: 'DHCP Request', from: '客户端', to: '广播 (255.255.255.255)',
    desc: '客户端广播请求使用该 IP（通知其他服务器）',
    detail: 'src=0.0.0.0:68 dst=255.255.255.255:67 | 携带 Server ID 确认选择哪个服务器',
    color: '#10b981'
  },
  {
    id: 4, name: 'DHCP ACK', from: 'DHCP 服务器', to: '客户端',
    desc: '服务器确认，客户端获得 IP 配置',
    detail: '租约确认: 192.168.1.100/24 | T1=12h (续约) | T2=21h (重绑) | 租期到期需重新发起 Discover',
    color: '#f59e0b'
  },
]

export function DhcpDiscoverSim() {
  const [stepStatuses, setStepStatuses] = useState<StepStatus[]>(['idle', 'idle', 'idle', 'idle'])
  const [running, setRunning] = useState(false)
  const [currentStep, setCurrentStep] = useState(-1)
  const [config, setConfig] = useState({ subnet: '192.168.1.0/24', startIp: '192.168.1.100', dns: '8.8.8.8', lease: '24' })
  const [done, setDone] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const runSim = useCallback(() => {
    setRunning(true)
    setDone(false)
    setStepStatuses(['idle', 'idle', 'idle', 'idle'])
    setCurrentStep(-1)
    let step = 0
    const next = () => {
      if (step >= STEPS.length) {
        setRunning(false)
        setDone(true)
        return
      }
      setCurrentStep(step)
      setStepStatuses(prev => prev.map((s, i) => i === step ? 'active' : s))
      timerRef.current = setTimeout(() => {
        setStepStatuses(prev => prev.map((s, i) => i === step ? 'done' : s))
        step++
        timerRef.current = setTimeout(next, 400)
      }, 1200)
    }
    next()
  }, [])

  const reset = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setRunning(false)
    setDone(false)
    setCurrentStep(-1)
    setStepStatuses(['idle', 'idle', 'idle', 'idle'])
  }, [])

  const getStepBg = (status: StepStatus) => {
    if (status === 'active') return 'border-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 shadow-md'
    if (status === 'done') return 'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/10'
    return 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">DHCP Discover 模拟</h1>
      <p className="text-gray-500 dark:text-gray-400">动态演示 DHCP 四步握手过程（Discover → Offer → Request → ACK）</p>

      {/* 配置 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">服务器配置</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: '子网', key: 'subnet', placeholder: '192.168.1.0/24' },
            { label: '起始 IP', key: 'startIp', placeholder: '192.168.1.100' },
            { label: 'DNS', key: 'dns', placeholder: '8.8.8.8' },
            { label: '租期 (h)', key: 'lease', placeholder: '24' },
          ].map(f => (
            <div key={f.key}>
              <label className="block text-xs text-gray-500 mb-1">{f.label}</label>
              <input value={(config as any)[f.key]}
                onChange={e => setConfig(c => ({ ...c, [f.key]: e.target.value }))}
                className="w-full px-2 py-1.5 text-xs rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500" />
            </div>
          ))}
        </div>
      </div>

      {/* 控制 */}
      <div className="flex gap-3">
        <button onClick={runSim} disabled={running}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg font-medium transition-colors">
          <Play className="w-4 h-4" />开始模拟
        </button>
        <button onClick={reset}
          className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors">
          <RotateCcw className="w-4 h-4" />重置
        </button>
      </div>

      {/* 步骤动画 */}
      <div className="space-y-3">
        {STEPS.map((step, i) => (
          <div key={step.id} className={`rounded-xl border-2 p-4 transition-all duration-500 ${getStepBg(stepStatuses[i])}`}>
            <div className="flex items-start gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 transition-all ${
                stepStatuses[i] === 'done' ? 'bg-green-500' : stepStatuses[i] === 'active' ? 'animate-pulse' : 'bg-gray-300 dark:bg-gray-600'
              }`} style={stepStatuses[i] === 'active' ? { backgroundColor: step.color } : {}}>
                {stepStatuses[i] === 'done' ? '✓' : step.id}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-gray-900 dark:text-gray-100" style={{ color: stepStatuses[i] !== 'idle' ? step.color : undefined }}>
                    {step.name}
                  </span>
                  <span className="text-xs text-gray-500">{step.from} → {step.to}</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">{step.desc}</p>
                {(stepStatuses[i] === 'active' || stepStatuses[i] === 'done') && (
                  <p className="text-xs font-mono text-gray-500 dark:text-gray-400 mt-1 bg-gray-50 dark:bg-gray-700/50 rounded px-2 py-1">{step.detail}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {done && (
        <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-xl p-4 flex items-center gap-3">
          <Wifi className="w-5 h-5 text-green-500 shrink-0" />
          <div>
            <div className="font-semibold text-green-700 dark:text-green-400">IP 地址获取成功！</div>
            <div className="text-sm text-green-600 dark:text-green-500">已分配 {config.startIp}，租期 {config.lease}h，DNS {config.dns}</div>
          </div>
        </div>
      )}
    </div>
  )
}
