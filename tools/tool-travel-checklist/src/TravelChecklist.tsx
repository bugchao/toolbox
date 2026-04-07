import React, { useState, useEffect } from 'react'
import { Plus, Trash2, CheckSquare, Square, RotateCcw, Download, Upload, Check, X } from 'lucide-react'

interface CheckItem {
  id: string
  text: string
  checked: boolean
  category: string
}

const TEMPLATES: Record<string, string[]> = {
  '证件': ['护照/身份证', '签证', '机票/车票', '酒店确认单', '旅行保险', '驾照（自驾）'],
  '衣物': ['换洗衣物', '外套/防寒服', '舒适步行鞋', '拖鞋/凉鞋', '泳衣（海边）', '帽子/太阳镜'],
  '电子': ['手机充电器', '充电宝', '转换插头（境外）', '相机/存储卡', '耳机', '笔记本（需要时）'],
  '洗漱': ['牙刷牙膏', '洗发水/沐浴露', '防晒霜', '面霜/护肤品', '剃须刀', '湿纸巾'],
  '健康': ['常用药品', '晕车药', '止泻药', '创可贴', '口罩', '消毒湿巾'],
  '其他': ['现金/信用卡', '折叠购物袋', '水杯', '零食', '书/Kindle', '雨伞'],
}

const CAT_COLORS: Record<string, string> = {
  证件: 'bg-red-100 dark:bg-red-900/30 text-red-600',
  衣物: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600',
  电子: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600',
  洗漱: 'bg-green-100 dark:bg-green-900/30 text-green-600',
  健康: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600',
  其他: 'bg-gray-100 dark:bg-gray-700 text-gray-600',
}

const STORAGE_KEY = 'travel-checklist-items'

let uid = 0
const nid = () => String(++uid + Date.now())

function buildFromTemplate(): CheckItem[] {
  return Object.entries(TEMPLATES).flatMap(([cat, items]) =>
    items.map(text => ({ id: nid(), text, checked: false, category: cat }))
  )
}

const ItemInput = ({ value, onChange, onAdd }: { value: string; onChange: (v: string) => void; onAdd: () => void }) => (
  <input value={value} onChange={e => onChange(e.target.value)} placeholder="添加物品..."
    onKeyDown={e => e.key === 'Enter' && onAdd()}
    className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500" />
)

export function TravelChecklist() {
  const [items, setItems] = useState<CheckItem[]>([])
  const [newText, setNewText] = useState('')
  const [newCat, setNewCat] = useState('其他')
  const [filterCat, setFilterCat] = useState('全部')
  const [isLoaded, setIsLoaded] = useState(false)
  const [batchMode, setBatchMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  // 从 localStorage 加载数据
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        setItems(JSON.parse(saved))
      } else {
        // 首次使用，加载模板数据
        setItems(buildFromTemplate())
      }
    } catch (error) {
      console.error('Failed to load travel checklist:', error)
      setItems(buildFromTemplate())
    } finally {
      setIsLoaded(true)
    }
  }, [])

  // 保存数据到 localStorage（仅在加载完成后）
  useEffect(() => {
    if (!isLoaded) return
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch (error) {
      console.error('Failed to save travel checklist:', error)
    }
  }, [items, isLoaded])

  const toggle = (id: string) => setItems(prev => prev.map(i => i.id === id ? { ...i, checked: !i.checked } : i))
  const remove = (id: string) => setItems(prev => prev.filter(i => i.id !== id))
  const reset = () => setItems(prev => prev.map(i => ({ ...i, checked: false })))

  // 批量操作函数
  const toggleBatchMode = () => {
    setBatchMode(!batchMode)
    setSelectedIds(new Set())
  }

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedIds(newSelected)
  }

  const selectAll = () => {
    setSelectedIds(new Set(filtered.map(i => i.id)))
  }

  const deselectAll = () => {
    setSelectedIds(new Set())
  }

  const batchCheck = () => {
    setItems(prev => prev.map(i => selectedIds.has(i.id) ? { ...i, checked: true } : i))
    setSelectedIds(new Set())
  }

  const batchUncheck = () => {
    setItems(prev => prev.map(i => selectedIds.has(i.id) ? { ...i, checked: false } : i))
    setSelectedIds(new Set())
  }

  const batchDelete = () => {
    if (confirm(`确定要删除选中的 ${selectedIds.size} 项吗？`)) {
      setItems(prev => prev.filter(i => !selectedIds.has(i.id)))
      setSelectedIds(new Set())
    }
  }

  const resetToTemplate = () => {
    if (confirm('确定要重置为模板数据吗？当前数据将被覆盖！')) {
      setItems(buildFromTemplate())
    }
  }

  const clearAll = () => {
    if (confirm('确定要清空所有项目吗？此操作不可恢复！')) {
      setItems([])
      localStorage.removeItem(STORAGE_KEY)
    }
  }

  const exportData = () => {
    const data = {
      items,
      exportDate: new Date().toISOString(),
    }
    const dataStr = JSON.stringify(data, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `travel-checklist-${new Date().toISOString().split('T')[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const importData = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string)
          if (data.items) {
            setItems(data.items)
            alert('导入成功！')
          } else {
            alert('导入失败：文件格式错误')
          }
        } catch (error) {
          alert('导入失败：文件格式错误')
        }
      }
      reader.readAsText(file)
    }
    input.click()
  }

  const add = () => {
    if (!newText.trim()) return
    setItems(prev => [...prev, { id: nid(), text: newText.trim(), checked: false, category: newCat }])
    setNewText('')
  }

  const categories = ['全部', ...Object.keys(TEMPLATES)]
  const filtered = filterCat === '全部' ? items : items.filter(i => i.category === filterCat)
  const total = filtered.length
  const done = filtered.filter(i => i.checked).length
  const pct = total > 0 ? Math.round(done / total * 100) : 0

  return (
    <div className="max-w-xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">旅行 Checklist</h1>
          <p className="text-gray-500 dark:text-gray-400">出发前必备清单，确保不遗漏重要物品</p>
        </div>
        <div className="flex gap-2">
          <button onClick={toggleBatchMode} title="批量操作"
            className={`p-2 rounded-lg transition-colors ${
              batchMode 
                ? 'bg-indigo-600 text-white' 
                : 'text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20'
            }`}>
            <CheckSquare className="w-5 h-5" />
          </button>
          <button onClick={exportData} title="导出数据"
            className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors">
            <Download className="w-5 h-5" />
          </button>
          <button onClick={importData} title="导入数据"
            className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors">
            <Upload className="w-5 h-5" />
          </button>
          <button onClick={resetToTemplate} title="重置为模板"
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
            <RotateCcw className="w-5 h-5" />
          </button>
          <button onClick={clearAll} title="清空所有"
            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 进度 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">已准备 {done}/{total} 项</span>
          <div className="flex gap-2">
            <span className={`font-semibold ${pct === 100 ? 'text-green-500' : 'text-indigo-500'}`}>{pct}%</span>
            <button onClick={reset} className="text-gray-400 hover:text-gray-600">
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
        <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all ${pct === 100 ? 'bg-green-500' : 'bg-indigo-500'}`} style={{ width: `${pct}%` }} />
        </div>
      </div>

      {/* 分类筛选 */}
      <div className="flex gap-2 flex-wrap">
        {categories.map(c => (
          <button key={c} onClick={() => setFilterCat(c)}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              filterCat === c ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
            }`}>{c}</button>
        ))}
      </div>

      {/* 批量操作工具栏 */}
      {batchMode && (
        <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-xl p-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-indigo-600 dark:text-indigo-400 font-medium">
                已选择 {selectedIds.size} 项
              </span>
              <button onClick={selectAll} className="text-xs text-indigo-600 hover:text-indigo-700 underline">
                全选
              </button>
              <button onClick={deselectAll} className="text-xs text-indigo-600 hover:text-indigo-700 underline">
                取消
              </button>
            </div>
            <div className="flex gap-2">
              <button onClick={batchCheck} disabled={selectedIds.size === 0}
                className="px-3 py-1.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                标记完成
              </button>
              <button onClick={batchUncheck} disabled={selectedIds.size === 0}
                className="px-3 py-1.5 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-1">
                <X className="w-3.5 h-3.5" />
                取消完成
              </button>
              <button onClick={batchDelete} disabled={selectedIds.size === 0}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-1">
                <Trash2 className="w-3.5 h-3.5" />
                删除
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 添加 */}
      <div className="flex gap-2">
        <ItemInput value={newText} onChange={setNewText} onAdd={add} />
        <select value={newCat} onChange={e => setNewCat(e.target.value)}
          className="px-2 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none">
          {Object.keys(TEMPLATES).map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <button onClick={add} className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors">
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* 列表 */}
      <div className="space-y-2">
        {filtered.map(item => (
          <div key={item.id} className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${
            item.checked ? 'bg-gray-50 dark:bg-gray-700/30 border-gray-100 dark:border-gray-700' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
          } ${
            batchMode && selectedIds.has(item.id) ? 'ring-2 ring-indigo-500' : ''
          }`}>
            {batchMode && (
              <input
                type="checkbox"
                checked={selectedIds.has(item.id)}
                onChange={() => toggleSelect(item.id)}
                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
              />
            )}
            <button onClick={() => !batchMode && toggle(item.id)} className="shrink-0" disabled={batchMode}>
              {item.checked
                ? <CheckSquare className="w-5 h-5 text-green-500" />
                : <Square className="w-5 h-5 text-gray-300 dark:text-gray-600" />}
            </button>
            <span className={`flex-1 text-sm transition-colors ${
              item.checked ? 'line-through text-gray-400' : 'text-gray-700 dark:text-gray-300'
            }`}>{item.text}</span>
            <span className={`px-1.5 py-0.5 rounded text-xs ${CAT_COLORS[item.category] || CAT_COLORS['其他']}`}>{item.category}</span>
            {!batchMode && (
              <button onClick={() => remove(item.id)} className="text-gray-200 hover:text-red-400 transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
