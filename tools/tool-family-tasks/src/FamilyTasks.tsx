import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Trash2, Users } from 'lucide-react'
import { PageHero, StatusBadge } from '@toolbox/ui-kit'
import { useToolStorage } from '@toolbox/storage'

type Priority = 'high' | 'medium' | 'low'

interface Task {
  id: string
  text: string
  assignee: string
  priority: Priority
  dueDate: string
  done: boolean
  createdAt: string
}

interface Member { id: string; name: string; emoji: string }
interface FamilyState { members: Member[]; tasks: Task[] }

const EMOJIS = ['👨','👩','👦','👧','👴','👵','🧑']
const DEFAULT: FamilyState = {
  members: [
    { id: '1', name: '爸爸', emoji: '👨' },
    { id: '2', name: '妈妈', emoji: '👩' },
  ],
  tasks: [
    { id: '1', text: '买菜', assignee: '妈妈', priority: 'high', dueDate: '', done: false, createdAt: new Date().toLocaleDateString('zh-CN') },
    { id: '2', text: '倒垃圾', assignee: '爸爸', priority: 'medium', dueDate: '', done: true, createdAt: new Date().toLocaleDateString('zh-CN') },
  ]
}

const PRIORITY_COLOR: Record<Priority, 'danger' | 'warning' | 'neutral'> = {
  high: 'danger', medium: 'warning', low: 'neutral'
}

export default function FamilyTasks() {
  const { t } = useTranslation('toolFamilyTasks')
  const { data: state, save } = useToolStorage<FamilyState>('family-tasks', 'data', DEFAULT)
  const [memberFilter, setMemberFilter] = useState('全部')
  const [statusFilter, setStatusFilter] = useState<'all' | 'done' | 'pending'>('all')
  const [addingMember, setAddingMember] = useState(false)
  const [newMember, setNewMember] = useState('')
  const [addingTask, setAddingTask] = useState(false)
  const [form, setForm] = useState({ text: '', assignee: '', priority: 'medium' as Priority, dueDate: '' })

  const { members, tasks } = state
  const upd = (patch: Partial<FamilyState>) => save({ ...state, ...patch })

  const filtered = tasks.filter(task => {
    if (memberFilter !== '全部' && task.assignee !== memberFilter) return false
    if (statusFilter === 'done' && !task.done) return false
    if (statusFilter === 'pending' && task.done) return false
    return true
  })

  const addMember = () => {
    if (!newMember.trim()) return
    const emoji = EMOJIS[members.length % EMOJIS.length]
    upd({ members: [...members, { id: Date.now().toString(), name: newMember.trim(), emoji }] })
    setNewMember('')
    setAddingMember(false)
  }

  const removeMember = (id: string) => upd({ members: members.filter(m => m.id !== id) })

  const addTask = () => {
    if (!form.text.trim()) return
    upd({ tasks: [{ id: Date.now().toString(), ...form, done: false, createdAt: new Date().toLocaleDateString('zh-CN') }, ...tasks] })
    setForm({ text: '', assignee: members[0]?.name || '', priority: 'medium', dueDate: '' })
    setAddingTask(false)
  }

  const toggleTask = (id: string) => upd({ tasks: tasks.map(t => t.id === id ? { ...t, done: !t.done } : t) })
  const removeTask = (id: string) => upd({ tasks: tasks.filter(t => t.id !== id) })

  React.useEffect(() => {
    if (!form.assignee && members.length > 0) setForm(f => ({ ...f, assignee: members[0].name }))
  }, [members])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <PageHero title={t('title')} description={t('description')} icon={Users} />
      <div className="max-w-xl mx-auto px-4 py-6 space-y-4">

        {/* 成员管理 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">家庭成员</h2>
            <button onClick={() => setAddingMember(v => !v)}
              className="flex items-center gap-1 text-xs text-indigo-500 hover:text-indigo-700">
              <Plus className="w-3.5 h-3.5" />{t('addMember')}
            </button>
          </div>
          <div className="flex gap-2 flex-wrap">
            {members.map(m => (
              <div key={m.id} className="group flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <span>{m.emoji}</span>
                <span className="text-sm text-gray-700 dark:text-gray-300">{m.name}</span>
                <button onClick={() => removeMember(m.id)} className="text-gray-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-3 h-3" /></button>
              </div>
            ))}
          </div>
          {addingMember && (
            <div className="flex gap-2 mt-3">
              <input value={newMember} onChange={e => setNewMember(e.target.value)} onKeyDown={e => e.key === 'Enter' && addMember()}
                placeholder={t('memberPlaceholder')}
                className="flex-1 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
              <button onClick={addMember} className="px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-lg">确定</button>
            </div>
          )}
        </div>

        {/* 筛选 */}
        <div className="flex gap-2 flex-wrap">
          {['全部', ...members.map(m => m.name)].map(name => (
            <button key={name} onClick={() => setMemberFilter(name)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                memberFilter === name ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
              }`}>{name}</button>
          ))}
          <div className="ml-auto flex gap-2">
            {(['all','pending','done'] as const).map(f => (
              <button key={f} onClick={() => setStatusFilter(f)}
                className={`px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                  statusFilter === f ? 'bg-gray-700 text-white dark:bg-gray-200 dark:text-gray-800' : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500'
                }`}>{t(f)}</button>
            ))}
          </div>
        </div>

        {/* 添加任务 */}
        <button onClick={() => setAddingTask(v => !v)}
          className="w-full flex items-center justify-center gap-2 py-2.5 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl text-sm text-gray-400 hover:border-indigo-400 hover:text-indigo-500 transition-colors">
          <Plus className="w-4 h-4" />{t('addTask')}
        </button>

        {addingTask && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-3">
            <input value={form.text} onChange={e => setForm(f => ({ ...f, text: e.target.value }))}
              placeholder={t('taskPlaceholder')}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
            <div className="flex gap-2">
              <select value={form.assignee} onChange={e => setForm(f => ({ ...f, assignee: e.target.value }))}
                className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none">
                {members.map(m => <option key={m.id} value={m.name}>{m.emoji} {m.name}</option>)}
              </select>
              <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value as Priority }))}
                className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none">
                {(['high','medium','low'] as Priority[]).map(p => <option key={p} value={p}>{t(p)}</option>)}
              </select>
              <input type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))}
                className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none" />
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setAddingTask(false)} className="px-4 py-2 text-sm text-gray-500">取消</button>
              <button onClick={addTask} className="px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg">{t('addTask')}</button>
            </div>
          </div>
        )}

        {/* 任务列表 */}
        {filtered.length === 0 && <div className="text-center py-12 text-gray-400 text-sm">{t('empty')}</div>}
        <div className="space-y-2">
          {filtered.map(task => {
            const member = members.find(m => m.name === task.assignee)
            return (
              <div key={task.id} className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                task.done ? 'bg-gray-50 dark:bg-gray-700/30 border-gray-100 dark:border-gray-700' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
              }`}>
                <button onClick={() => toggleTask(task.id)}
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                    task.done ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300'
                  }`}>{task.done && <span className="text-xs">✓</span>}</button>
                <div className="flex-1 min-w-0">
                  <span className={`text-sm ${
                    task.done ? 'line-through text-gray-400' : 'text-gray-800 dark:text-gray-200'
                  }`}>{task.text}</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-gray-500">{member?.emoji} {task.assignee}</span>
                    <StatusBadge level={PRIORITY_COLOR[task.priority]} label={t(task.priority)} />
                    {task.dueDate && <span className="text-xs text-gray-400">{task.dueDate}</span>}
                  </div>
                </div>
                <button onClick={() => removeTask(task.id)} className="text-gray-300 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
              </div>
            )
          })}
        </div>
        <p className="text-xs text-center text-gray-400">{t('autoSave')}</p>
      </div>
    </div>
  )
}
