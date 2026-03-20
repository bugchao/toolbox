import React, { useState, useCallback } from 'react'
import { Plus, Trash2, BarChart2 } from 'lucide-react'

interface SubnetEntry {
  id: string
  cidr: string
  used: number
  label: string
}

function cidrToSize(cidr: string): number | null {
  const match = cidr.match(/\/(\d+)$/)
  if (!match) return null
  const prefix = parseInt(match[1])
  if (prefix < 0 || prefix > 32) return null
  return Math.pow(2, 32 - prefix) - 2 // usable hosts
}

function parseIp(ip: string): number | null {
  const parts = ip.split('.').map(Number)
  if (parts.length !== 4 || parts.some(p => isNaN(p) || p < 0 || p > 255)) return null
  return (parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]
}

function ipFromInt(n: number): string {
  return [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join('.')
}

function subnetInfo(cidr: string) {
  const [base, prefixStr] = cidr.split('/')
  const prefix = parseInt(prefixStr)
  const baseInt = parseIp(base)
  if (baseInt === null || isNaN(prefix)) return null
  const mask = prefix === 0 ? 0 : (~0 << (32 - prefix)) >>> 0
  const network = (baseInt & mask) >>> 0
  const broadcast = (network | (~mask >>> 0)) >>> 0
  const total = Math.pow(2, 32 - prefix)
  const usable = Math.max(0, total - 2)
  return {
    network: ipFromInt(network),
    broadcast: ipFromInt(broadcast),
    first: ipFromInt(network + 1),
    last: ipFromInt(broadcast - 1),
    total, usable,
    mask: ipFromInt(mask)
  }
}

const COLORS = ['#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#84cc16']

let idCounter = 0
const nextId = () => String(++idCounter)

export function IpamSubnetUtil() {
  const [subnets, setSubnets] = useState<SubnetEntry[]>([
    { id: nextId(), cidr: '192.168.1.0/24', used: 120, label: '办公网络' },
    { id: nextId(), cidr: '192.168.2.0/24', used: 200, label: '生产环境' },
    { id: nextId(), cidr: '10.0.0.0/22', used: 300, label: '数据中心' },
  ])
  const [newCidr, setNewCidr] = useState('')
  const [newUsed, setNewUsed] = useState('')
  const [newLabel, setNewLabel] = useState('')
  const [error, setError] = useState('')

  const addSubnet = useCallback(() => {
    const cidr = newCidr.trim()
    if (!cidr) return
    const info = subnetInfo(cidr)
    if (!info) { setError('无效的 CIDR 格式'); return }
    const used = parseInt(newUsed) || 0
    if (used > info.usable) { setError(`已用 IP 不能超过可用数 ${info.usable}`); return }
    setError('')
    setSubnets(prev => [...prev, { id: nextId(), cidr, used, label: newLabel || cidr }])
    setNewCidr(''); setNewUsed(''); setNewLabel('')
  }, [newCidr, newUsed, newLabel])

  const remove = (id: string) => setSubnets(prev => prev.filter(s => s.id !== id))

  const totalUsable = subnets.reduce((s, n) => s + (subnetInfo(n.cidr)?.usable ?? 0), 0)
  const totalUsed = subnets.reduce((s, n) => s + n.used, 0)
  const overallUtil = totalUsable > 0 ? Math.round((totalUsed / totalUsable) * 100) : 0

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">子网利用率统计</h1>
      <p className="text-gray-500 dark:text-gray-400">添加子网并输入已用 IP 数，可视化展示各子网利用率</p>

      {/* 总览 */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: '子网数量', value: subnets.length + ' 个' },
          { label: '总可用 IP', value: totalUsable.toLocaleString() },
          { label: '整体利用率', value: overallUtil + '%', color: overallUtil > 80 ? 'text-red-500' : overallUtil > 60 ? 'text-orange-500' : 'text-green-500' },
        ].map(item => (
          <div key={item.label} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 text-center">
            <div className={`text-2xl font-bold ${(item as any).color || 'text-gray-900 dark:text-gray-100'}`}>{item.value}</div>
            <div className="text-xs text-gray-500 mt-1">{item.label}</div>
          </div>
        ))}
      </div>

      {/* 添加子网 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-3">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">添加子网</h2>
        <div className="grid grid-cols-3 gap-2">
          <input value={newCidr} onChange={e => setNewCidr(e.target.value)}
            placeholder="192.168.3.0/24"
            className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          <input value={newUsed} onChange={e => setNewUsed(e.target.value)}
            type="number" min="0" placeholder="已用 IP 数"
            className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          <input value={newLabel} onChange={e => setNewLabel(e.target.value)}
            placeholder="备注（可选）"
            className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        {error && <p className="text-red-500 text-xs">{error}</p>}
        <button onClick={addSubnet}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" />添加
        </button>
      </div>

      {/* 子网列表 */}
      <div className="space-y-3">
        {subnets.map((s, idx) => {
          const info = subnetInfo(s.cidr)
          if (!info) return null
          const util = Math.min(100, Math.round((s.used / info.usable) * 100))
          const color = COLORS[idx % COLORS.length]
          const utilColor = util > 85 ? '#ef4444' : util > 65 ? '#f59e0b' : '#10b981'
          return (
            <div key={s.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: color }} />
                  <div>
                    <span className="font-semibold text-gray-900 dark:text-gray-100 font-mono">{s.cidr}</span>
                    {s.label && s.label !== s.cidr && <span className="ml-2 text-sm text-gray-500">{s.label}</span>}
                  </div>
                </div>
                <button onClick={() => remove(s.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors shrink-0">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-4 gap-2 text-xs text-gray-500 mb-2">
                <div><span className="block font-medium text-gray-700 dark:text-gray-300">{info.first}</span>起始 IP</div>
                <div><span className="block font-medium text-gray-700 dark:text-gray-300">{info.last}</span>结束 IP</div>
                <div><span className="block font-medium text-gray-700 dark:text-gray-300">{info.usable.toLocaleString()}</span>可用 IP</div>
                <div><span className="block font-medium" style={{ color: utilColor }}>{s.used.toLocaleString()} ({util}%)</span>已用</div>
              </div>
              <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${util}%`, backgroundColor: utilColor }} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
