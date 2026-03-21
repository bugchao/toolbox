import React, { useState } from 'react'
import { Plus, Trash2, AlertTriangle, CheckCircle } from 'lucide-react'

interface IpRecord {
  id: string
  ip: string
  label: string
  lastSeen: string // YYYY-MM-DD
  status: 'active' | 'idle' | 'unknown'
}

function daysSince(dateStr: string): number {
  const d = new Date(dateStr)
  const now = new Date()
  return Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24))
}

function getReclaimStatus(days: number, status: string): { label: string; color: string; canReclaim: boolean } {
  if (status === 'active') return { label: '活跃使用中', color: 'text-green-500', canReclaim: false }
  if (days > 90) return { label: `闲置 ${days} 天，建议回收`, color: 'text-red-500', canReclaim: true }
  if (days > 30) return { label: `闲置 ${days} 天，观察中`, color: 'text-orange-500', canReclaim: false }
  return { label: `${days} 天前活跃`, color: 'text-yellow-500', canReclaim: false }
}

const today = new Date().toISOString().split('T')[0]
const daysAgo = (n: number) => {
  const d = new Date(); d.setDate(d.getDate() - n); return d.toISOString().split('T')[0]
}

let uid = 0
const nid = () => String(++uid)

export function IpamReclaim() {
  const [records, setRecords] = useState<IpRecord[]>([
    { id: nid(), ip: '192.168.1.10', label: 'web-server-01', lastSeen: daysAgo(5), status: 'active' },
    { id: nid(), ip: '192.168.1.11', label: 'db-server-01', lastSeen: daysAgo(120), status: 'idle' },
    { id: nid(), ip: '192.168.1.12', label: 'test-vm-deprecated', lastSeen: daysAgo(180), status: 'idle' },
    { id: nid(), ip: '192.168.1.13', label: 'printer-floor2', lastSeen: daysAgo(45), status: 'idle' },
    { id: nid(), ip: '192.168.1.14', label: 'unknown-device', lastSeen: daysAgo(200), status: 'unknown' },
    { id: nid(), ip: '192.168.1.15', label: 'vpn-gateway', lastSeen: daysAgo(2), status: 'active' },
  ])
  const [newIp, setNewIp] = useState('')
  const [newLabel, setNewLabel] = useState('')
  const [newLastSeen, setNewLastSeen] = useState(today)
  const [newStatus, setNewStatus] = useState<IpRecord['status']>('idle')
  const [idleThreshold, setIdleThreshold] = useState(90)
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const add = () => {
    if (!newIp.trim()) return
    setRecords(prev => [...prev, { id: nid(), ip: newIp.trim(), label: newLabel || newIp.trim(), lastSeen: newLastSeen, status: newStatus }])
    setNewIp(''); setNewLabel('')
  }

  const remove = (id: string) => { setRecords(prev => prev.filter(r => r.id !== id)); setSelected(prev => { const s = new Set(prev); s.delete(id); return s }) }

  const toggleSelect = (id: string) => setSelected(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s })

  const reclaimSelected = () => {
    setRecords(prev => prev.filter(r => !selected.has(r.id)))
    setSelected(new Set())
  }

  const analyzed = records.map(r => {
    const days = daysSince(r.lastSeen)
    const rec = getReclaimStatus(days, r.status)
    const canReclaim = rec.canReclaim || (r.status !== 'active' && days > idleThreshold)
    return { ...r, days, ...rec, canReclaim }
  })

  const reclaimable = analyzed.filter(r => r.canReclaim)

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">IP 地址回收分析</h1>
      <p className="text-gray-500 dark:text-gray-400">分析 IP 地址使用情况，识别长期闲置地址并批量回收</p>

      {/* 概览 */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: '总 IP 数', value: records.length, color: 'text-gray-900 dark:text-gray-100' },
          { label: '活跃', value: analyzed.filter(r => r.status === 'active').length, color: 'text-green-500' },
          { label: '可回收', value: reclaimable.length, color: 'text-red-500' },
        ].map(item => (
          <div key={item.label} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 text-center">
            <div className={`text-3xl font-bold ${item.color}`}>{item.value}</div>
            <div className="text-xs text-gray-500 mt-1">{item.label}</div>
          </div>
        ))}
      </div>

      {/* 阈值配置 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 flex items-center gap-4">
        <label className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">闲置阈值（天）</label>
        <input type="number" min={1} max={365} value={idleThreshold}
          onChange={e => setIdleThreshold(parseInt(e.target.value) || 90)}
          className="w-24 px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        <span className="text-xs text-gray-400">超过此天数的非活跃 IP 标记为可回收</span>
      </div>

      {/* 添加 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-2">
        <div className="grid grid-cols-4 gap-2">
          <input value={newIp} onChange={e => setNewIp(e.target.value)} placeholder="192.168.1.x"
            className="px-2 py-1.5 text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500" />
          <input value={newLabel} onChange={e => setNewLabel(e.target.value)} placeholder="设备名称"
            className="px-2 py-1.5 text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
          <input type="date" value={newLastSeen} onChange={e => setNewLastSeen(e.target.value)}
            className="px-2 py-1.5 text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
          <select value={newStatus} onChange={e => setNewStatus(e.target.value as any)}
            className="px-2 py-1.5 text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500">
            <option value="active">活跃</option><option value="idle">闲置</option><option value="unknown">未知</option>
          </select>
        </div>
        <button onClick={add} className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors">
          <Plus className="w-3.5 h-3.5" />添加
        </button>
      </div>

      {/* IP 列表 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">IP 列表</span>
          {selected.size > 0 && (
            <button onClick={reclaimSelected}
              className="flex items-center gap-1.5 px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs font-medium transition-colors">
              回收选中 ({selected.size})
            </button>
          )}
        </div>
        <div className="divide-y divide-gray-100 dark:divide-gray-700">
          {analyzed.sort((a, b) => b.days - a.days).map(r => (
            <div key={r.id} className={`flex items-center gap-3 px-4 py-2.5 ${
              r.canReclaim ? 'bg-red-50/50 dark:bg-red-900/5' : ''
            }`}>
              {r.canReclaim && (
                <input type="checkbox" checked={selected.has(r.id)} onChange={() => toggleSelect(r.id)}
                  className="w-4 h-4 accent-red-500 shrink-0" />
              )}
              {!r.canReclaim && <div className="w-4 shrink-0" />}
              <span className="font-mono text-sm text-gray-900 dark:text-gray-100 w-32 shrink-0">{r.ip}</span>
              <span className="text-sm text-gray-600 dark:text-gray-400 flex-1 truncate">{r.label}</span>
              <span className="text-xs text-gray-400 w-24 shrink-0">{r.lastSeen}</span>
              <span className={`text-xs font-medium w-32 shrink-0 ${r.color}`}>{r.label_}</span>
              <span className={`text-xs font-medium shrink-0 ${r.color}`}>{r.canReclaim ? '建议回收' : r.status === 'active' ? '活跃' : `闲置${r.days}天`}</span>
              <button onClick={() => remove(r.id)} className="text-gray-300 hover:text-red-500 transition-colors shrink-0">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
