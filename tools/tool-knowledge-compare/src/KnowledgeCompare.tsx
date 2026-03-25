import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Trash2, GitCompareArrows } from 'lucide-react'
import { PageHero } from '@toolbox/ui-kit'
import { useToolStorage } from '@toolbox/storage'

interface CompareState {
  items: string[]
  dimensions: string[]
  notes: Record<string, string> // `${item}__${dim}` => text
}

const TEMPLATES: Record<string, CompareState> = {
  'React vs Vue vs Angular': {
    items: ['React', 'Vue', 'Angular'],
    dimensions: ['学习曲线', '性能', '生态系统', '适用场景', '公司背景', '模板语法'],
    notes: {
      'React__学习曲线': 'JSX 有一定门槛，概念较多',
      'Vue__学习曲线': '入门简单，渐进式框架',
      'Angular__学习曲线': '陡峭，概念体系庞大',
      'React__性能': '虚拟DOM，需手动优化',
      'Vue__性能': 'Vue3 Proxy 响应式，性能优秀',
      'Angular__性能': '变更检测机制，可优化',
      'React__公司背景': 'Meta',
      'Vue__公司背景': '个人+社区',
      'Angular__公司背景': 'Google',
    }
  },
  'MySQL vs PostgreSQL': {
    items: ['MySQL', 'PostgreSQL'],
    dimensions: ['性能', 'JSON支持', '事务', '全文搜索', '扩展性', '许可证'],
    notes: {
      'MySQL__性能': '读性能强，适合高并发读',
      'PostgreSQL__性能': '复杂查询更强',
      'MySQL__JSON支持': '5.7+ 支持，功能有限',
      'PostgreSQL__JSON支持': 'JSONB 原生支持，性能好',
      'MySQL__许可证': 'GPL / 商业双授权',
      'PostgreSQL__许可证': 'MIT-like，完全开源',
    }
  },
  '空白模板': {
    items: ['选项A', '选项B'],
    dimensions: ['维度1', '维度2', '维度3'],
    notes: {}
  }
}

const DEFAULT: CompareState = TEMPLATES['空白模板']

export default function KnowledgeCompare() {
  const { t } = useTranslation('toolKnowledgeCompare')
  const { data: state, save } = useToolStorage<CompareState>('knowledge-compare', 'data', DEFAULT)
  const [newItem, setNewItem] = useState('')
  const [newDim, setNewDim] = useState('')

  const upd = (patch: Partial<CompareState>) => save({ ...state, ...patch })

  const addItem = () => {
    if (!newItem.trim() || state.items.includes(newItem.trim())) return
    upd({ items: [...state.items, newItem.trim()] })
    setNewItem('')
  }

  const removeItem = (item: string) => {
    const notes = { ...state.notes }
    state.dimensions.forEach(d => delete notes[`${item}__${d}`])
    upd({ items: state.items.filter(i => i !== item), notes })
  }

  const addDim = () => {
    if (!newDim.trim() || state.dimensions.includes(newDim.trim())) return
    upd({ dimensions: [...state.dimensions, newDim.trim()] })
    setNewDim('')
  }

  const removeDim = (dim: string) => {
    const notes = { ...state.notes }
    state.items.forEach(i => delete notes[`${i}__${dim}`])
    upd({ dimensions: state.dimensions.filter(d => d !== dim), notes })
  }

  const setNote = (item: string, dim: string, text: string) =>
    upd({ notes: { ...state.notes, [`${item}__${dim}`]: text } })

  const loadTemplate = (name: string) => {
    if (TEMPLATES[name]) save(TEMPLATES[name])
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <PageHero title={t('title')} description={t('description')} icon={GitCompareArrows} />
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-4">

        {/* 模板 + 操作 */}
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm text-gray-500">{t('template')}:</span>
          {Object.keys(TEMPLATES).map(name => (
            <button key={name} onClick={() => loadTemplate(name)}
              className="px-3 py-1.5 text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-600 dark:text-gray-400 hover:border-indigo-400 transition-colors">{name}</button>
          ))}
        </div>

        {/* 添加对比项 */}
        <div className="flex gap-2">
          <input value={newItem} onChange={e => setNewItem(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addItem()}
            placeholder={t('itemPlaceholder')}
            className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
          <button onClick={addItem} className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm flex items-center gap-1">
            <Plus className="w-4 h-4" />{t('addItem')}
          </button>
        </div>

        {/* 添加维度 */}
        <div className="flex gap-2">
          <input value={newDim} onChange={e => setNewDim(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addDim()}
            placeholder={t('dimensionPlaceholder')}
            className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
          <button onClick={addDim} className="px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm flex items-center gap-1">
            <Plus className="w-4 h-4" />{t('addDimension')}
          </button>
        </div>

        {/* 对比表格 */}
        {state.items.length > 0 && state.dimensions.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 w-32">维度 \ 对比项</th>
                  {state.items.map(item => (
                    <th key={item} className="px-4 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      <div className="flex items-center gap-2 justify-center">
                        {item}
                        <button onClick={() => removeItem(item)} className="text-gray-300 hover:text-red-400">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {state.dimensions.map((dim, di) => (
                  <tr key={dim} className={di % 2 === 0 ? '' : 'bg-gray-50 dark:bg-gray-700/30'}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{dim}</span>
                        <button onClick={() => removeDim(dim)} className="text-gray-300 hover:text-red-400">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                    {state.items.map(item => (
                      <td key={item} className="px-3 py-2 border-l border-gray-100 dark:border-gray-700">
                        <textarea
                          value={state.notes[`${item}__${dim}`] || ''}
                          onChange={e => setNote(item, dim, e.target.value)}
                          placeholder={t('notePlaceholder')}
                          rows={2}
                          className="w-full min-w-[160px] text-sm bg-transparent resize-none outline-none text-gray-700 dark:text-gray-300 placeholder-gray-300 dark:placeholder-gray-600"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="text-xs text-center text-gray-400">{t('autoSave')}</p>
      </div>
    </div>
  )
}
