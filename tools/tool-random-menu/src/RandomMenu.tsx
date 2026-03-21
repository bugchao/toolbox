import React, { useState } from 'react'
import { Shuffle, Plus, Trash2, UtensilsCrossed } from 'lucide-react'

interface MenuItem {
  id: string
  name: string
  category: string
  tags: string[]
}

const CATEGORIES = ['中餐', '西餐', '日料', '快餐', '小吃', '外卖']

let uid = 0
const nid = () => String(++uid + Date.now())

const DEFAULT_MENUS: MenuItem[] = [
  { id: nid(), name: '红烧肉', category: '中餐', tags: ['家常', '下饭'] },
  { id: nid(), name: '宫保鸡丁', category: '中餐', tags: ['家常', '辣'] },
  { id: nid(), name: '番茄炒蛋', category: '中餐', tags: ['家常', '快手'] },
  { id: nid(), name: '蛋炒饭', category: '中餐', tags: ['快手', '简单'] },
  { id: nid(), name: '麻婆豆腐', category: '中餐', tags: ['辣', '下饭'] },
  { id: nid(), name: '牛肉拉面', category: '中餐', tags: ['面食', '暖胃'] },
  { id: nid(), name: '披萨', category: '西餐', tags: ['外卖', '聚餐'] },
  { id: nid(), name: '意大利面', category: '西餐', tags: ['西式', '简单'] },
  { id: nid(), name: '寿司', category: '日料', tags: ['清淡', '精致'] },
  { id: nid(), name: '拉面', category: '日料', tags: ['面食', '汤'] },
  { id: nid(), name: '汉堡', category: '快餐', tags: ['快手', '外卖'] },
  { id: nid(), name: '炸鸡', category: '快餐', tags: ['解馋', '外卖'] },
  { id: nid(), name: '煎饼果子', category: '小吃', tags: ['早餐', '快手'] },
  { id: nid(), name: '沙县小吃', category: '小吃', tags: ['经济', '快手'] },
]

const NameInput = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
  <input value={value} onChange={e => onChange(e.target.value)} placeholder="菜名"
    className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500" />
)

export function RandomMenu() {
  const [menus, setMenus] = useState<MenuItem[]>(DEFAULT_MENUS)
  const [picked, setPicked] = useState<MenuItem | null>(null)
  const [spinning, setSpinning] = useState(false)
  const [filterCat, setFilterCat] = useState('全部')
  const [newName, setNewName] = useState('')
  const [newCat, setNewCat] = useState('中餐')
  const [history, setHistory] = useState<string[]>([])

  const pool = filterCat === '全部' ? menus : menus.filter(m => m.category === filterCat)

  const spin = () => {
    if (pool.length === 0) return
    setSpinning(true)
    setPicked(null)
    let count = 0
    const maxCount = 8 + Math.floor(Math.random() * 5)
    const interval = setInterval(() => {
      const random = pool[Math.floor(Math.random() * pool.length)]
      setPicked(random)
      count++
      if (count >= maxCount) {
        clearInterval(interval)
        setSpinning(false)
        setHistory(h => [random.name, ...h.slice(0, 9)])
      }
    }, 100)
  }

  const addMenu = () => {
    if (!newName.trim()) return
    setMenus(prev => [...prev, { id: nid(), name: newName.trim(), category: newCat, tags: [] }])
    setNewName('')
  }

  const remove = (id: string) => setMenus(prev => prev.filter(m => m.id !== id))

  return (
    <div className="max-w-xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">随机菜单</h1>
      <p className="text-gray-500 dark:text-gray-400">选择困难症救星 — 今天吃什么？</p>

      {/* 大转盘区 */}
      <div className="bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl p-8 text-center text-white">
        <div className="min-h-20 flex items-center justify-center">
          {picked ? (
            <div className={`text-4xl font-bold transition-all ${spinning ? 'opacity-60 scale-95' : 'opacity-100 scale-100'}`}>
              🍽️ {picked.name}
            </div>
          ) : (
            <div className="text-white/60 text-lg">按下按钮决定今天吃什么</div>
          )}
        </div>
        {picked && !spinning && (
          <div className="mt-2 text-sm opacity-80">{picked.category} · {picked.tags.join(' ')}</div>
        )}
        <button onClick={spin} disabled={pool.length === 0 || spinning}
          className="mt-6 flex items-center gap-2 mx-auto px-8 py-3 bg-white text-orange-500 rounded-full font-bold text-lg hover:bg-orange-50 disabled:opacity-50 transition-all hover:scale-105 active:scale-95">
          <Shuffle className={`w-5 h-5 ${spinning ? 'animate-spin' : ''}`} />
          {spinning ? '选择中...' : '随机一个！'}
        </button>
      </div>

      {/* 分类筛选 */}
      <div className="flex gap-2 flex-wrap">
        {(['全部', ...CATEGORIES]).map(c => (
          <button key={c} onClick={() => setFilterCat(c)}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              filterCat === c ? 'bg-orange-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
            }`}>{c} {c !== '全部' ? `(${menus.filter(m => m.category === c).length})` : `(${menus.length})`}</button>
        ))}
      </div>

      {/* 添加菜品 */}
      <div className="flex gap-2">
        <NameInput value={newName} onChange={setNewName} />
        <select value={newCat} onChange={e => setNewCat(e.target.value)}
          className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500">
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <button onClick={addMenu} className="px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm transition-colors">
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* 菜品列表 */}
      <div className="grid grid-cols-2 gap-2">
        {(filterCat === '全部' ? menus : menus.filter(m => m.category === filterCat)).map(m => (
          <div key={m.id} className={`flex items-center gap-2 p-2.5 rounded-xl border transition-all ${
            picked?.id === m.id ? 'border-orange-400 bg-orange-50 dark:bg-orange-900/20' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
          }`}>
            <UtensilsCrossed className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <span className="text-sm flex-1 text-gray-700 dark:text-gray-300">{m.name}</span>
            <button onClick={() => remove(m.id)} className="text-gray-200 hover:text-red-400 transition-colors">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* 历史 */}
      {history.length > 0 && (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
          <div className="text-xs text-gray-400 mb-2">最近选择</div>
          <div className="flex gap-1.5 flex-wrap">
            {history.map((h, i) => (
              <span key={i} className="px-2 py-0.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded text-xs text-gray-500">{h}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
