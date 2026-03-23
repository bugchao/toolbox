import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Trash2, ChevronDown, ChevronRight, Target, CheckSquare, Square, Edit2, Check, X } from 'lucide-react'
import { PageHero } from '@toolbox/ui-kit'
import { useToolStorage } from '@toolbox/storage'

// ---- Types ----
interface SubTask {
  id: string
  text: string
  done: boolean
}

interface KeyResult {
  id: string
  text: string
  progress: number
  subTasks: SubTask[]
  expanded: boolean
}

interface Objective {
  id: string
  title: string
  quarter: string
  keyResults: KeyResult[]
  expanded: boolean
}

interface OkrGroup {
  id: string
  name: string
  objectives: Objective[]
}

interface OkrState {
  groups: OkrGroup[]
  activeGroupId: string
}

// ---- Helpers ----
let _uid = 0
const nid = () => `${++_uid}-${Date.now()}`

const QUARTERS = ['2026-Q1', '2026-Q2', '2026-Q3', '2026-Q4', '2027-Q1']

function makeGroup(name: string, withSample = false): OkrGroup {
  const g: OkrGroup = { id: nid(), name, objectives: [] }
  if (withSample) {
    g.objectives = [{
      id: nid(), title: '提升产品用户留存率', quarter: '2026-Q2', expanded: true,
      keyResults: [
        { id: nid(), text: '7日留存率从 30% 提升至 45%', progress: 40, subTasks: [], expanded: false },
        { id: nid(), text: '完成 3 次用户访谈并输出报告', progress: 66, subTasks: [
          { id: nid(), text: '准备访谈提纲', done: true },
          { id: nid(), text: '完成第1轮访谈', done: true },
          { id: nid(), text: '完成第2轮访谈', done: false },
        ], expanded: true },
      ]
    }]
  }
  return g
}

const DEFAULT_STATE: OkrState = (() => {
  const g = makeGroup('工作目标', true)
  return { groups: [g], activeGroupId: g.id }
})()

// ---- Component ----
export default function OkrPlanner() {
  const { t } = useTranslation('toolOkrPlanner')
  const { data: state, save } = useToolStorage<OkrState>('okr-planner', 'data', DEFAULT_STATE)
  const [newObjTitle, setNewObjTitle] = useState('')
  const [newObjQuarter, setNewObjQuarter] = useState('2026-Q2')
  const [newKrTexts, setNewKrTexts] = useState<Record<string, string>>({})
  const [newSubTexts, setNewSubTexts] = useState<Record<string, string>>({})
  const [newGroupName, setNewGroupName] = useState('')
  const [addingGroup, setAddingGroup] = useState(false)
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null)
  const [editingGroupName, setEditingGroupName] = useState('')

  const { groups, activeGroupId } = state
  const activeGroup = groups.find(g => g.id === activeGroupId) || groups[0]
  const objectives = activeGroup?.objectives || []

  const upd = (patch: Partial<OkrState>) => save({ ...state, ...patch })

  const updGroup = (gid: string, patch: Partial<OkrGroup>) =>
    upd({ groups: groups.map(g => g.id === gid ? { ...g, ...patch } : g) })

  const updObjs = (objs: Objective[]) => updGroup(activeGroupId, { objectives: objs })

  // ---- Group actions ----
  const addGroup = () => {
    if (!newGroupName.trim()) return
    const g = makeGroup(newGroupName.trim())
    upd({ groups: [...groups, g], activeGroupId: g.id })
    setNewGroupName('')
    setAddingGroup(false)
  }

  const removeGroup = (gid: string) => {
    if (groups.length <= 1) return
    const newGroups = groups.filter(g => g.id !== gid)
    upd({ groups: newGroups, activeGroupId: newGroups[0].id })
  }

  const renameGroup = (gid: string) => {
    if (!editingGroupName.trim()) return
    updGroup(gid, { name: editingGroupName.trim() })
    setEditingGroupId(null)
  }

  // ---- Objective actions ----
  const addObjective = () => {
    if (!newObjTitle.trim()) return
    updObjs([...objectives, {
      id: nid(), title: newObjTitle.trim(), quarter: newObjQuarter,
      keyResults: [], expanded: true
    }])
    setNewObjTitle('')
  }

  const removeObjective = (id: string) => updObjs(objectives.filter(o => o.id !== id))

  const toggleObj = (id: string) => updObjs(objectives.map(o => o.id === id ? { ...o, expanded: !o.expanded } : o))

  const objProgress = (o: Objective) => o.keyResults.length === 0 ? 0 :
    Math.round(o.keyResults.reduce((s, kr) => s + kr.progress, 0) / o.keyResults.length)

  // ---- KR actions ----
  const addKr = (objId: string) => {
    const text = newKrTexts[objId]?.trim()
    if (!text) return
    updObjs(objectives.map(o => o.id === objId
      ? { ...o, keyResults: [...o.keyResults, { id: nid(), text, progress: 0, subTasks: [], expanded: false }] }
      : o))
    setNewKrTexts(t => ({ ...t, [objId]: '' }))
  }

  const removeKr = (objId: string, krId: string) => updObjs(objectives.map(o => o.id === objId
    ? { ...o, keyResults: o.keyResults.filter(kr => kr.id !== krId) } : o))

  const setProgress = (objId: string, krId: string, progress: number) => updObjs(objectives.map(o => o.id === objId
    ? { ...o, keyResults: o.keyResults.map(kr => kr.id === krId ? { ...kr, progress } : kr) } : o))

  const toggleKr = (objId: string, krId: string) => updObjs(objectives.map(o => o.id === objId
    ? { ...o, keyResults: o.keyResults.map(kr => kr.id === krId ? { ...kr, expanded: !kr.expanded } : kr) } : o))

  // ---- SubTask actions ----
  const addSubTask = (objId: string, krId: string) => {
    const key = `${objId}-${krId}`
    const text = newSubTexts[key]?.trim()
    if (!text) return
    updObjs(objectives.map(o => o.id === objId
      ? { ...o, keyResults: o.keyResults.map(kr => kr.id === krId
          ? { ...kr, subTasks: [...kr.subTasks, { id: nid(), text, done: false }] }
          : kr) }
      : o))
    setNewSubTexts(t => ({ ...t, [key]: '' }))
  }

  const toggleSubTask = (objId: string, krId: string, subId: string) => updObjs(objectives.map(o => o.id === objId
    ? { ...o, keyResults: o.keyResults.map(kr => kr.id === krId
        ? { ...kr, subTasks: kr.subTasks.map(s => s.id === subId ? { ...s, done: !s.done } : s) }
        : kr) }
    : o))

  const removeSubTask = (objId: string, krId: string, subId: string) => updObjs(objectives.map(o => o.id === objId
    ? { ...o, keyResults: o.keyResults.map(kr => kr.id === krId
        ? { ...kr, subTasks: kr.subTasks.filter(s => s.id !== subId) }
        : kr) }
    : o))

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <PageHero
        title={t('title')}
        description={t('description')}
        icon={Target}
      />
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">

        {/* ---- Group Tabs ---- */}
        <div className="flex items-center gap-2 flex-wrap">
          {groups.map(g => (
            <div key={g.id} className="flex items-center gap-1">
              {editingGroupId === g.id ? (
                <div className="flex items-center gap-1">
                  <input value={editingGroupName} onChange={e => setEditingGroupName(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') renameGroup(g.id); if (e.key === 'Escape') setEditingGroupId(null) }}
                    className="px-2 py-1 text-sm border border-indigo-400 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 w-28 focus:outline-none" autoFocus />
                  <button onClick={() => renameGroup(g.id)} className="text-green-500 hover:text-green-600"><Check className="w-3.5 h-3.5" /></button>
                  <button onClick={() => setEditingGroupId(null)} className="text-gray-400 hover:text-gray-600"><X className="w-3.5 h-3.5" /></button>
                </div>
              ) : (
                <button
                  onClick={() => upd({ activeGroupId: g.id })}
                  className={`group flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    g.id === activeGroupId
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-indigo-300'
                  }`}>
                  {g.name}
                  {g.id === activeGroupId && (
                    <span className="flex gap-1 ml-1">
                      <Edit2 className="w-3 h-3 opacity-70 cursor-pointer hover:opacity-100" onClick={e => { e.stopPropagation(); setEditingGroupId(g.id); setEditingGroupName(g.name) }} />
                      {groups.length > 1 && <Trash2 className="w-3 h-3 opacity-70 cursor-pointer hover:text-red-400" onClick={e => { e.stopPropagation(); removeGroup(g.id) }} />}
                    </span>
                  )}
                </button>
              )}
            </div>
          ))}

          {/* 新增 Tab */}
          {addingGroup ? (
            <div className="flex items-center gap-1">
              <input value={newGroupName} onChange={e => setNewGroupName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') addGroup(); if (e.key === 'Escape') setAddingGroup(false) }}
                placeholder={t('groupPlaceholder')}
                className="px-2 py-1 text-sm border border-indigo-400 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 w-32 focus:outline-none" autoFocus />
              <button onClick={addGroup} className="text-green-500 hover:text-green-600"><Check className="w-4 h-4" /></button>
              <button onClick={() => setAddingGroup(false)} className="text-gray-400"><X className="w-4 h-4" /></button>
            </div>
          ) : (
            <button onClick={() => setAddingGroup(true)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm text-gray-400 border border-dashed border-gray-300 dark:border-gray-600 hover:border-indigo-400 hover:text-indigo-500 transition-colors">
              <Plus className="w-3.5 h-3.5" />{t('newGroup')}
            </button>
          )}
        </div>

        {/* ---- Add Objective ---- */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-3">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">{t('addObjective')}</h2>
          <div className="flex gap-2">
            <input value={newObjTitle} onChange={e => setNewObjTitle(e.target.value)}
              placeholder={t('objectivePlaceholder')} onKeyDown={e => e.key === 'Enter' && addObjective()}
              className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            <select value={newObjQuarter} onChange={e => setNewObjQuarter(e.target.value)}
              className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none">
              {QUARTERS.map(q => <option key={q} value={q}>{q}</option>)}
            </select>
            <button onClick={addObjective} className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors">
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ---- Objectives List ---- */}
        <div className="space-y-4">
          {objectives.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <Target className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">{t('emptyHint')}</p>
            </div>
          )}
          {objectives.map(obj => {
            const pct = objProgress(obj)
            return (
              <div key={obj.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                {/* Obj Header */}
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    <button onClick={() => toggleObj(obj.id)} className="mt-0.5 text-gray-400 hover:text-gray-600">
                      {obj.expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </button>
                    <Target className="w-4 h-4 mt-0.5 text-indigo-500 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-gray-900 dark:text-gray-100">{obj.title}</span>
                        <span className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded text-xs">{obj.quarter}</span>
                        <span className="text-xs text-gray-400">{obj.keyResults.length} 个 KR</span>
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-500 transition-all" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs font-medium text-indigo-500 shrink-0">{pct}%</span>
                      </div>
                    </div>
                    <button onClick={() => removeObjective(obj.id)} className="text-gray-300 hover:text-red-400 transition-colors mt-0.5">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* KR List */}
                {obj.expanded && (
                  <div className="border-t border-gray-100 dark:border-gray-700">
                    {obj.keyResults.map((kr, idx) => {
                      const subDone = kr.subTasks.filter(s => s.done).length
                      const subKey = `${obj.id}-${kr.id}`
                      return (
                        <div key={kr.id} className="border-b border-gray-50 dark:border-gray-700/50 last:border-0">
                          {/* KR Row */}
                          <div className="px-4 py-3 flex items-start gap-3">
                            <button onClick={() => toggleKr(obj.id, kr.id)} className="mt-0.5 text-gray-300 hover:text-gray-500">
                              {kr.expanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                            </button>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-medium text-gray-400">KR{idx + 1}</span>
                                <span className="text-sm text-gray-700 dark:text-gray-300">{kr.text}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <input type="range" min={0} max={100} value={kr.progress}
                                  onChange={e => setProgress(obj.id, kr.id, parseInt(e.target.value))}
                                  className="flex-1 h-1.5 accent-indigo-500" />
                                <span className="text-xs font-medium text-indigo-500 w-8 text-right shrink-0">{kr.progress}%</span>
                              </div>
                              {kr.subTasks.length > 0 && (
                                <div className="text-xs text-gray-400 mt-1">
                                  子任务 {subDone}/{kr.subTasks.length} 完成
                                </div>
                              )}
                            </div>
                            <button onClick={() => removeKr(obj.id, kr.id)} className="text-gray-300 hover:text-red-400 transition-colors shrink-0">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* SubTasks */}
                          {kr.expanded && (
                            <div className="px-10 pb-3 space-y-1.5">
                              {kr.subTasks.map(sub => (
                                <div key={sub.id} className="flex items-center gap-2">
                                  <button onClick={() => toggleSubTask(obj.id, kr.id, sub.id)} className="shrink-0">
                                    {sub.done
                                      ? <CheckSquare className="w-4 h-4 text-green-500" />
                                      : <Square className="w-4 h-4 text-gray-300 dark:text-gray-600" />}
                                  </button>
                                  <span className={`flex-1 text-sm ${
                                    sub.done ? 'line-through text-gray-400' : 'text-gray-600 dark:text-gray-400'
                                  }`}>{sub.text}</span>
                                  <button onClick={() => removeSubTask(obj.id, kr.id, sub.id)} className="text-gray-200 hover:text-red-400 transition-colors">
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              ))}
                              {/* Add SubTask */}
                              <div className="flex items-center gap-2 pt-1">
                                <Plus className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                                <input
                                  value={newSubTexts[subKey] || ''}
                                  onChange={e => setNewSubTexts(t => ({ ...t, [subKey]: e.target.value }))}
                                  onKeyDown={e => e.key === 'Enter' && addSubTask(obj.id, kr.id)}
                                  placeholder={t('subTaskPlaceholder')}
                                  className="flex-1 px-2 py-1 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                                <button onClick={() => addSubTask(obj.id, kr.id)}
                                  className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-500 rounded-lg hover:bg-gray-200 transition-colors">
                                  <Plus className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}

                    {/* Add KR */}
                    <div className="px-4 py-3 flex gap-2 border-t border-gray-100 dark:border-gray-700">
                      <span className="text-xs text-gray-400 w-5 shrink-0 pt-2">KR</span>
                      <input
                        value={newKrTexts[obj.id] || ''}
                        onChange={v => setNewKrTexts(t => ({ ...t, [obj.id]: v.target.value }))}
                        onKeyDown={e => e.key === 'Enter' && addKr(obj.id)}
                        placeholder={t('krPlaceholder')}
                        className="flex-1 px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500" />
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

        <p className="text-xs text-center text-gray-400">{t('autoSave')}</p>
      </div>
    </div>
  )
}
