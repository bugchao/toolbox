import React, { useState } from 'react'
import { Plus, Trash2, ChevronDown, ChevronRight, Target } from 'lucide-react'

interface KeyResult {
  id: string
  text: string
  progress: number // 0-100
}

interface Objective {
  id: string
  title: string
  quarter: string
  keyResults: KeyResult[]
  expanded: boolean
}

let uid = 0
const nid = () => String(++uid + Date.now())

const SAMPLE: Objective[] = [
  {
    id: nid(), title: '提升产品用户留存率', quarter: '2026-Q2', expanded: true,
    keyResults: [
      { id: nid(), text: '7日留存率从 30% 提升至 45%', progress: 40 },
      { id: nid(), text: '用户满意度 NPS 达到 50+', progress: 20 },
      { id: nid(), text: '完成 3 次用户访谈并输出报告', progress: 66 },
    ]
  },
]

const ObjTitleInput = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
  <input value={value} onChange={e => onChange(e.target.value)} placeholder="目标描述..."
    className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500" />
)

const KrInput = ({ value, onChange, onAdd }: { value: string; onChange: (v: string) => void; onAdd: () => void }) => (
  <input value={value} onChange={e => onChange(e.target.value)} placeholder="关键结果描述..."
    onKeyDown={e => e.key === 'Enter' && onAdd()}
    className="flex-1 px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500" />
)

export function OkrPlanner() {
  const [objectives, setObjectives] = useState<Objective[]>(SAMPLE)
  const [newObjTitle, setNewObjTitle] = useState('')
  const [newObjQuarter, setNewObjQuarter] = useState('2026-Q2')
  const [newKrTexts, setNewKrTexts] = useState<Record<string, string>>({})

  const addObjective = () => {
    if (!newObjTitle.trim()) return
    setObjectives(prev => [...prev, { id: nid(), title: newObjTitle.trim(), quarter: newObjQuarter, keyResults: [], expanded: true }])
    setNewObjTitle('')
  }

  const removeObjective = (id: string) => setObjectives(prev => prev.filter(o => o.id !== id))

  const toggleExpand = (id: string) => setObjectives(prev => prev.map(o => o.id === id ? { ...o, expanded: !o.expanded } : o))

  const addKr = (objId: string) => {
    const text = newKrTexts[objId]?.trim()
    if (!text) return
    setObjectives(prev => prev.map(o => o.id === objId
      ? { ...o, keyResults: [...o.keyResults, { id: nid(), text, progress: 0 }] }
      : o))
    setNewKrTexts(t => ({ ...t, [objId]: '' }))
  }

  const removeKr = (objId: string, krId: string) => setObjectives(prev => prev.map(o => o.id === objId
    ? { ...o, keyResults: o.keyResults.filter(kr => kr.id !== krId) } : o))

  const setProgress = (objId: string, krId: string, progress: number) => setObjectives(prev => prev.map(o => o.id === objId
    ? { ...o, keyResults: o.keyResults.map(kr => kr.id === krId ? { ...kr, progress } : kr) } : o))

  const objProgress = (o: Objective) => o.keyResults.length === 0 ? 0 :
    Math.round(o.keyResults.reduce((s, kr) => s + kr.progress, 0) / o.keyResults.length)

  const quarters = ['2026-Q1', '2026-Q2', '2026-Q3', '2026-Q4', '2027-Q1']

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">目标拆解（OKR）</h1>
      <p className="text-gray-500 dark:text-gray-400">设定季度目标与关键结果，追踪完成进度</p>

      {/* 添加目标 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-3">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">新增目标 (O)</h2>
        <div className="flex gap-2">
          <ObjTitleInput value={newObjTitle} onChange={setNewObjTitle} />
          <select value={newObjQuarter} onChange={e => setNewObjQuarter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
            {quarters.map(q => <option key={q} value={q}>{q}</option>)}
          </select>
          <button onClick={addObjective} className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors">
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 目标列表 */}
      <div className="space-y-4">
        {objectives.map(obj => {
          const pct = objProgress(obj)
          return (
            <div key={obj.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              {/* 目标头 */}
              <div className="p-4">
                <div className="flex items-start gap-3">
                  <button onClick={() => toggleExpand(obj.id)} className="mt-0.5 text-gray-400 hover:text-gray-600">
                    {obj.expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </button>
                  <Target className="w-4 h-4 mt-0.5 text-indigo-500 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-gray-900 dark:text-gray-100">{obj.title}</span>
                      <span className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded text-xs">{obj.quarter}</span>
                      <span className="text-xs text-gray-400">{obj.keyResults.length} 个 KR</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-xs font-medium text-indigo-500">{pct}%</span>
                    </div>
                  </div>
                  <button onClick={() => removeObjective(obj.id)} className="text-gray-300 hover:text-red-400 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* KR 列表 */}
              {obj.expanded && (
                <div className="border-t border-gray-100 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700">
                  {obj.keyResults.map((kr, idx) => (
                    <div key={kr.id} className="px-4 py-3 flex items-center gap-3">
                      <span className="text-xs text-gray-400 w-5 shrink-0">KR{idx + 1}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-gray-700 dark:text-gray-300 mb-1.5">{kr.text}</div>
                        <input type="range" min={0} max={100} value={kr.progress}
                          onChange={e => setProgress(obj.id, kr.id, parseInt(e.target.value))}
                          className="w-full h-1.5 accent-indigo-500" />
                      </div>
                      <span className="text-xs font-medium text-indigo-500 w-8 text-right shrink-0">{kr.progress}%</span>
                      <button onClick={() => removeKr(obj.id, kr.id)} className="text-gray-300 hover:text-red-400 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  {/* 添加 KR */}
                  <div className="px-4 py-3 flex gap-2">
                    <span className="text-xs text-gray-400 w-5 shrink-0 pt-2">+</span>
                    <KrInput
                      value={newKrTexts[obj.id] || ''}
                      onChange={v => setNewKrTexts(t => ({ ...t, [obj.id]: v }))}
                      onAdd={() => addKr(obj.id)}
                    />
                    <button onClick={() => addKr(obj.id)}
                      className="px-2 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-500 rounded-lg hover:bg-gray-200 transition-colors">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
