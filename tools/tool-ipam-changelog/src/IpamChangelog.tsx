import React, { useState } from 'react'
import { Plus, Clock } from 'lucide-react'

interface ChangeRecord {
  id: string
  time: string
  ip: string
  action: 'assign' | 'release' | 'update' | 'reserve' | 'delete'
  fromLabel: string
  toLabel: string
  operator: string
  note: string
}

const ACTION_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  assign: { label: '分配', color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400', dot: 'bg-green-500' },
  release: { label: '释放', color: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400', dot: 'bg-gray-400' },
  update: { label: '更新', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400', dot: 'bg-blue-500' },
  reserve: { label: '预留', color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400', dot: 'bg-purple-500' },
  delete: { label: '删除', color: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400', dot: 'bg-red-500' },
}

const now = () => new Date().toISOString().replace('T', ' ').substring(0, 19)
const ago = (h: number) => new Date(Date.now() - h * 3600000).toISOString().replace('T', ' ').substring(0, 19)

let uid = 0
const nid = () => String(++uid)

export function IpamChangelog() {
  const [records, setRecords] = useState<ChangeRecord[]>([
    { id: nid(), time: ago(48), ip: '10.1.1.50', action: 'assign', fromLabel: '', toLabel: 'web-server-01', operator: 'admin', note: '新服务器上线' },
    { id: nid(), time: ago(36), ip: '10.1.1.51', action: 'assign', fromLabel: '', toLabel: 'db-server-01', operator: 'admin', note: '数据库节点' },
    { id: nid(), time: ago(24), ip: '10.1.1.50', action: 'update', fromLabel: 'web-server-01', toLabel: 'web-server-01-prod', operator: 'ops', note: '更新标签' },
    { id: nid(), time: ago(12), ip: '10.1.1.52', action: 'reserve', fromLabel: '', toLabel: 'vpn-gateway', operator: 'admin', note: '为 VPN 预留' },
    { id: nid(), time: ago(2), ip: '10.1.1.99', action: 'release', fromLabel: 'test-vm-old', toLabel: '', operator: 'ops', note: '测试机下线回收' },
    { id: nid(), time: ago(1), ip: '10.1.1.100', action: 'assign', fromLabel: '', toLabel: 'monitor-01', operator: 'admin', note: '监控节点' },
  ])

  const [form, setForm] = useState({ ip: '', action: 'assign' as ChangeRecord['action'], fromLabel: '', toLabel: '', operator: '', note: '' })
  const [filterAction, setFilterAction] = useState('ALL')
  const [filterIp, setFilterIp] = useState('')

  const add = () => {
    if (!form.ip.trim()) return
    setRecords(prev => [{ id: nid(), time: now(), ...form }, ...prev])
    setForm({ ip: '', action: 'assign', fromLabel: '', toLabel: '', operator: '', note: '' })
  }

  const filtered = records
    .filter(r => filterAction === 'ALL' || r.action === filterAction)
    .filter(r => !filterIp || r.ip.includes(filterIp))

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">IP 地址变更记录</h1>
      <p className="text-gray-500 dark:text-gray-400">记录 IP 地址的分配、释放、更新等变更历史，支持审计追踪</p>

      {/* 添加记录 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-3">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">添加变更记录</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          <input value={form.ip} onChange={e => setForm(f => ({...f, ip: e.target.value}))}
            placeholder="IP 地址" className="px-2 py-1.5 text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500" />
          <select value={form.action} onChange={e => setForm(f => ({...f, action: e.target.value as any}))}
            className="px-2 py-1.5 text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500">
            {Object.entries(ACTION_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
          <input value={form.operator} onChange={e => setForm(f => ({...f, operator: e.target.value}))}
            placeholder="操作人" className="px-2 py-1.5 text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
          <input value={form.fromLabel} onChange={e => setForm(f => ({...f, fromLabel: e.target.value}))}
            placeholder="原标签" className="px-2 py-1.5 text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
          <input value={form.toLabel} onChange={e => setForm(f => ({...f, toLabel: e.target.value}))}
            placeholder="新标签" className="px-2 py-1.5 text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
          <input value={form.note} onChange={e => setForm(f => ({...f, note: e.target.value}))}
            placeholder="备注" className="px-2 py-1.5 text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
        </div>
        <button onClick={add} className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors">
          <Plus className="w-3.5 h-3.5" />记录变更
        </button>
      </div>

      {/* 筛选 */}
      <div className="flex gap-2 flex-wrap">
        {(['ALL', ...Object.keys(ACTION_CONFIG)] as const).map(a => (
          <button key={a} onClick={() => setFilterAction(a)}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              filterAction === a ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
            }`}>{a === 'ALL' ? '全部' : ACTION_CONFIG[a]?.label}</button>
        ))}
        <input value={filterIp} onChange={e => setFilterIp(e.target.value)}
          placeholder="按 IP 筛选" className="px-2 py-1 text-xs rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
      </div>

      {/* 时间线 */}
      <div className="space-y-3">
        {filtered.map(r => {
          const cfg = ACTION_CONFIG[r.action]
          return (
            <div key={r.id} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className={`w-3 h-3 rounded-full mt-1 shrink-0 ${cfg.dot}`} />
                <div className="w-px flex-1 bg-gray-200 dark:bg-gray-700 mt-1" />
              </div>
              <div className="flex-1 pb-3">
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-3">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-mono font-semibold text-gray-900 dark:text-gray-100">{r.ip}</span>
                    <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${cfg.color}`}>{cfg.label}</span>
                    {r.operator && <span className="text-xs text-gray-400">by {r.operator}</span>}
                    <span className="text-xs text-gray-400 ml-auto flex items-center gap-1">
                      <Clock className="w-3 h-3" />{r.time}
                    </span>
                  </div>
                  {(r.fromLabel || r.toLabel) && (
                    <div className="text-xs text-gray-500 mb-1">
                      {r.fromLabel && <span className="line-through mr-2">{r.fromLabel}</span>}
                      {r.toLabel && <span className="text-gray-700 dark:text-gray-300 font-medium">{r.toLabel}</span>}
                    </div>
                  )}
                  {r.note && <div className="text-xs text-gray-500">{r.note}</div>}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
