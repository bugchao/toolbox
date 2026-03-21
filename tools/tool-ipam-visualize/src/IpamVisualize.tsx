import React, { useState, useCallback } from 'react'
import { Plus, Trash2 } from 'lucide-react'

interface SubnetNode {
  id: string
  cidr: string
  label: string
  used: number
  color: string
}

function cidrToInfo(cidr: string) {
  const [base, prefixStr] = cidr.split('/')
  const prefix = parseInt(prefixStr)
  if (isNaN(prefix) || prefix < 0 || prefix > 32) return null
  const parts = base.split('.').map(Number)
  if (parts.length !== 4 || parts.some(p => isNaN(p) || p < 0 || p > 255)) return null
  const total = Math.pow(2, 32 - prefix)
  const usable = Math.max(0, total - 2)
  const baseInt = (parts[0] << 24 | parts[1] << 16 | parts[2] << 8 | parts[3]) >>> 0
  const mask = prefix === 0 ? 0 : (~0 << (32 - prefix)) >>> 0
  const network = (baseInt & mask) >>> 0
  const broadcast = (network | (~mask >>> 0)) >>> 0
  const n2ip = (n: number) => [(n>>>24)&255,(n>>>16)&255,(n>>>8)&255,n&255].join('.')
  return { prefix, usable, total, network: n2ip(network), broadcast: n2ip(broadcast), first: n2ip(network+1), last: n2ip(broadcast-1) }
}

const COLORS = ['#6366f1','#3b82f6','#10b981','#f59e0b','#ec4899','#8b5cf6','#06b6d4','#84cc16','#f97316','#14b8a6']
let uid = 0
const nid = () => String(++uid)

export function IpamVisualize() {
  const [subnets, setSubnets] = useState<SubnetNode[]>([
    { id: nid(), cidr: '10.0.0.0/8', label: '企业总网络', used: 0, color: COLORS[0] },
    { id: nid(), cidr: '10.1.0.0/16', label: '上海办公室', used: 800, color: COLORS[1] },
    { id: nid(), cidr: '10.1.1.0/24', label: '工程部', used: 45, color: COLORS[2] },
    { id: nid(), cidr: '10.1.2.0/24', label: '销售部', used: 88, color: COLORS[3] },
    { id: nid(), cidr: '10.2.0.0/16', label: '北京办公室', used: 400, color: COLORS[4] },
    { id: nid(), cidr: '10.2.1.0/24', label: '研发部', used: 120, color: COLORS[5] },
  ])
  const [newCidr, setNewCidr] = useState('')
  const [newLabel, setNewLabel] = useState('')
  const [newUsed, setNewUsed] = useState('')

  const add = () => {
    const cidr = newCidr.trim()
    if (!cidr || !cidrToInfo(cidr)) return
    const color = COLORS[subnets.length % COLORS.length]
    setSubnets(prev => [...prev, { id: nid(), cidr, label: newLabel || cidr, used: parseInt(newUsed) || 0, color }])
    setNewCidr(''); setNewLabel(''); setNewUsed('')
  }

  const remove = (id: string) => setSubnets(prev => prev.filter(s => s.id !== id))

  // 构建树结构
  const sorted = [...subnets].sort((a, b) => {
    const pa = parseInt(a.cidr.split('/')[1])
    const pb = parseInt(b.cidr.split('/')[1])
    return pa - pb
  })

  const isChild = (parent: string, child: string) => {
    if (parent === child) return false
    const [pb, pp] = parent.split('/')
    const [cb, cp] = child.split('/')
    const pp_ = parseInt(pp), cp_ = parseInt(cp)
    if (cp_ <= pp_) return false
    const pParts = pb.split('.').map(Number)
    const cParts = cb.split('.').map(Number)
    const pInt = (pParts[0]<<24|pParts[1]<<16|pParts[2]<<8|pParts[3])>>>0
    const cInt = (cParts[0]<<24|cParts[1]<<16|cParts[2]<<8|cParts[3])>>>0
    const mask = pp_ === 0 ? 0 : (~0<<(32-pp_))>>>0
    return (pInt & mask) === (cInt & mask)
  }

  const getDepth = (cidr: string) => {
    let depth = 0
    for (const s of sorted) {
      if (isChild(s.cidr, cidr)) depth++
    }
    return depth
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">IP 资源可视化</h1>
      <p className="text-gray-500 dark:text-gray-400">以树状图展示子网层级关系，直观呈现 IP 地址空间结构</p>

      {/* 添加 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-3">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">添加子网</h2>
        <div className="grid grid-cols-3 gap-2">
          <input value={newCidr} onChange={e => setNewCidr(e.target.value)}
            placeholder="10.3.0.0/16" onKeyDown={e => e.key === 'Enter' && add()}
            className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          <input value={newLabel} onChange={e => setNewLabel(e.target.value)}
            placeholder="标签（可选）"
            className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          <input value={newUsed} onChange={e => setNewUsed(e.target.value)}
            type="number" placeholder="已用 IP 数"
            className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        <button onClick={add}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" />添加
        </button>
      </div>

      {/* 树状图 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">子网层级树</h2>
        <div className="space-y-2">
          {sorted.map(s => {
            const info = cidrToInfo(s.cidr)
            if (!info) return null
            const depth = getDepth(s.cidr)
            const util = info.usable > 0 ? Math.min(100, Math.round((s.used / info.usable) * 100)) : 0
            const utilColor = util > 85 ? '#ef4444' : util > 65 ? '#f59e0b' : '#10b981'
            return (
              <div key={s.id} style={{ marginLeft: depth * 24 }}
                className="flex items-center gap-3 rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2.5 bg-gray-50 dark:bg-gray-700/30">
                {depth > 0 && (
                  <div className="flex items-center shrink-0" style={{ marginLeft: -12 }}>
                    <div className="w-3 h-px bg-gray-300 dark:bg-gray-600" />
                    <div className="w-px h-4 bg-gray-300 dark:bg-gray-600" style={{ marginLeft: -1, marginTop: -8 }} />
                  </div>
                )}
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-semibold text-gray-900 dark:text-gray-100">{s.cidr}</span>
                    {s.label && s.label !== s.cidr && <span className="text-xs text-gray-500">{s.label}</span>}
                    <span className="text-xs text-gray-400">/{info.prefix} · {info.usable.toLocaleString()} 可用</span>
                  </div>
                  {s.used > 0 && (
                    <div className="mt-1 flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${util}%`, backgroundColor: utilColor }} />
                      </div>
                      <span className="text-xs font-medium" style={{ color: utilColor }}>{util}%</span>
                    </div>
                  )}
                </div>
                <button onClick={() => remove(s.id)} className="text-gray-300 hover:text-red-500 transition-colors shrink-0">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {/* 统계 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: '子网总数', value: subnets.length },
          { label: '最大前缀', value: Math.max(...subnets.map(s => parseInt(s.cidr.split('/')[1]))) + '' },
          { label: '最小前缀', value: Math.min(...subnets.map(s => parseInt(s.cidr.split('/')[1]))) + '' },
          { label: '总 IP 空间', value: subnets.reduce((acc, s) => acc + (cidrToInfo(s.cidr)?.total ?? 0), 0).toLocaleString() },
        ].map(item => (
          <div key={item.label} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-3 text-center">
            <div className="text-xl font-bold text-gray-900 dark:text-gray-100">{item.value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
