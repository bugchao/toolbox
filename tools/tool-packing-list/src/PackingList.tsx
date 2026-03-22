import React, { useState } from 'react'
import { Plus, Trash2, CheckSquare, Square, RotateCcw, Luggage } from 'lucide-react'

interface PackItem {
  id: string
  text: string
  category: string
  qty: number
  packed: boolean
}

const TEMPLATES: Record<string, Record<string, string[]>> = {
  '商务出行': {
    '证件': ['护照/身份证', '名片', '邀请函'],
    '电子': ['笔记本电脑', '充电器', '移动硬盘', '鼠标'],
    '衣物': ['正装衬衫×3', '西裤×2', '领带', '皮鞋'],
    '其他': ['充电宝', '耳机', '记事本'],
  },
  '海岛度假': {
    '证件': ['护照', '签证', '机票'],
    '衣物': ['泳衣×2', '短袖×5', '沙滩裤', '防晒衬衫', '凉鞋'],
    '护肤': ['防晒霜SPF50+', '晒后修复', '防水相机'],
    '其他': ['浮潜面具', '防水袋', '驱虫喷雾'],
  },
  '背包穷游': {
    '证件': ['护照', '签证', '青旅订单'],
    '衣物': ['速干T恤×4', '速干裤×2', '轻量羽绒服', '运动鞋'],
    '背包': ['背包雨衣', '压缩袋', '小背包'],
    '其他': ['净水片', '多功能刀', '急救包', '睡袋内胆'],
  },
}

let uid = 0
const nid = () => String(++uid + Date.now())

function buildFromTemplate(tpl: string): PackItem[] {
  const t = TEMPLATES[tpl]
  if (!t) return []
  return Object.entries(t).flatMap(([cat, items]) =>
    items.map(text => ({ id: nid(), text, category: cat, qty: 1, packed: false }))
  )
}

const ItemInput = ({ value, onChange, onAdd }: { value: string; onChange: (v: string) => void; onAdd: () => void }) => (
  <input value={value} onChange={e => onChange(e.target.value)} placeholder="添加物品..."
    onKeyDown={e => e.key === 'Enter' && onAdd()}
    className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500" />
)

export function PackingList() {
  const [items, setItems] = useState<PackItem[]>(buildFromTemplate('商务出行'))
  const [selectedTpl, setSelectedTpl] = useState('商务出行')
  const [newText, setNewText] = useState('')
  const [newCat, setNewCat] = useState('其他')
  const [filterCat, setFilterCat] = useState('全部')

  const loadTemplate = (tpl: string) => {
    setSelectedTpl(tpl)
    setItems(buildFromTemplate(tpl))
    setFilterCat('全部')
  }

  const toggle = (id: string) => setItems(prev => prev.map(i => i.id === id ? { ...i, packed: !i.packed } : i))
  const remove = (id: string) => setItems(prev => prev.filter(i => i.id !== id))
  const reset = () => setItems(prev => prev.map(i => ({ ...i, packed: false })))
  const setQty = (id: string, qty: number) => setItems(prev => prev.map(i => i.id === id ? { ...i, qty: Math.max(1, qty) } : i))

  const add = () => {
    if (!newText.trim()) return
    setItems(prev => [...prev, { id: nid(), text: newText.trim(), category: newCat, qty: 1, packed: false }])
    setNewText('')
  }

  const categories = ['全部', ...Array.from(new Set(items.map(i => i.category)))]
  const filtered = filterCat === '全部' ? items : items.filter(i => i.category === filterCat)
  const packed = filtered.filter(i => i.packed).length
  const pct = filtered.length > 0 ? Math.round(packed / filtered.length * 100) : 0

  return (
    <div className="max-w-xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">行李清单</h1>
      <p className="text-gray-500 dark:text-gray-400">根据旅行类型生成行李清单，逐项打包确认</p>

      {/* 模板选择 */}
      <div className="flex gap-2 flex-wrap">
        {Object.keys(TEMPLATES).map(tpl => (
          <button key={tpl} onClick={() => loadTemplate(tpl)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              selectedTpl === tpl ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
            }`}><Luggage className="w-3.5 h-3.5" />{tpl}</button>
        ))}
      </div>

      {/* 进度 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">已装包 {packed}/{filtered.length}</span>
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

      {/* 添加 */}
      <div className="flex gap-2">
        <ItemInput value={newText} onChange={setNewText} onAdd={add} />
        <select value={newCat} onChange={e => setNewCat(e.target.value)}
          className="px-2 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none">
          {Array.from(new Set(items.map(i => i.category))).map(c => <option key={c} value={c}>{c}</option>)}
          <option value="其他">其他</option>
        </select>
        <button onClick={add} className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg">
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* 列表 */}
      <div className="space-y-1.5">
        {filtered.map(item => (
          <div key={item.id} className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${
            item.packed ? 'bg-gray-50 dark:bg-gray-700/30 border-gray-100 dark:border-gray-700' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
          }`}>
            <button onClick={() => toggle(item.id)} className="shrink-0">
              {item.packed
                ? <CheckSquare className="w-5 h-5 text-green-500" />
                : <Square className="w-5 h-5 text-gray-300 dark:text-gray-600" />}
            </button>
            <span className={`flex-1 text-sm ${
              item.packed ? 'line-through text-gray-400' : 'text-gray-700 dark:text-gray-300'
            }`}>{item.text}</span>
            <span className="text-xs text-gray-400 px-2">×</span>
            <input type="number" min={1} value={item.qty} onChange={e => setQty(item.id, parseInt(e.target.value) || 1)}
              className="w-12 text-center text-sm rounded border border-gray-200 dark:border-gray-600 bg-transparent text-gray-700 dark:text-gray-300 focus:outline-none" />
            <button onClick={() => remove(item.id)} className="text-gray-200 hover:text-red-400 transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
