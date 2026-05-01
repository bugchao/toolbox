import React, { useState, useCallback, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { PageHero } from '@toolbox/ui-kit'
import { useToolStorage } from '@toolbox/storage'
import {
  Ticket,
  Plus,
  Trash2,
  Download,
  Upload,
  Sparkles,
  History,
  Settings,
  Edit2,
  Check,
  X,
  Copy,
} from 'lucide-react'

interface LotteryOption {
  id: string
  text: string
  weight: number
}

interface DrawResult {
  id: string
  options: string[]
  timestamp: number
  mode: DrawMode
}

type DrawMode = 'single' | 'multiple' | 'noRepeat'

interface LotteryState {
  options: LotteryOption[]
  drawCount: number
  mode: DrawMode
  enableWeight: boolean
  history: DrawResult[]
}

const DEFAULT_STATE: LotteryState = {
  options: [],
  drawCount: 1,
  mode: 'single',
  enableWeight: false,
  history: [],
}

const TEMPLATES = {
  numbers1to100: Array.from({ length: 100 }, (_, i) => `${i + 1}`),
  lettersAtoZ: Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i)),
}

export default function Lottery() {
  const { t } = useTranslation('toolLottery')
  const { data: state, save } = useToolStorage<LotteryState>('lottery', 'data', DEFAULT_STATE)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [inputText, setInputText] = useState('')
  const [drawing, setDrawing] = useState(false)
  const [result, setResult] = useState<string[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editText, setEditText] = useState('')

  const { options, drawCount, mode, enableWeight, history } = state
  const set = (patch: Partial<LotteryState>) => save({ ...state, ...patch })

  // 添加选项
  const addOptions = useCallback(() => {
    if (!inputText.trim()) return
    const lines = inputText.split('\n').filter(line => line.trim())
    const newOptions: LotteryOption[] = lines.map(line => ({
      id: `${Date.now()}-${Math.random()}`,
      text: line.trim(),
      weight: 1,
    }))
    set({ options: [...options, ...newOptions] })
    setInputText('')
  }, [inputText, options, set])

  // 删除选项
  const deleteOption = useCallback((id: string) => {
    set({ options: options.filter(opt => opt.id !== id) })
  }, [options, set])

  // 编辑选项
  const startEdit = useCallback((option: LotteryOption) => {
    setEditingId(option.id)
    setEditText(option.text)
  }, [])

  const saveEdit = useCallback(() => {
    if (!editingId || !editText.trim()) return
    set({
      options: options.map(opt =>
        opt.id === editingId ? { ...opt, text: editText.trim() } : opt
      ),
    })
    setEditingId(null)
    setEditText('')
  }, [editingId, editText, options, set])

  const cancelEdit = useCallback(() => {
    setEditingId(null)
    setEditText('')
  }, [])

  // 更新权重
  const updateWeight = useCallback((id: string, weight: number) => {
    set({
      options: options.map(opt =>
        opt.id === id ? { ...opt, weight: Math.max(1, weight) } : opt
      ),
    })
  }, [options, set])

  // 清空选项
  const clearOptions = useCallback(() => {
    set({ options: [] })
    setResult([])
  }, [set])

  // 使用模板
  const useTemplate = useCallback((template: keyof typeof TEMPLATES) => {
    const templateOptions: LotteryOption[] = TEMPLATES[template].map(text => ({
      id: `${Date.now()}-${Math.random()}`,
      text,
      weight: 1,
    }))
    set({ options: templateOptions })
  }, [set])

  // 导入选项
  const importOptions = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handleFileImport = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string
        const lines = text.split(/[\r\n]+/).filter(line => line.trim())
        const importedOptions: LotteryOption[] = lines.map(line => ({
          id: `${Date.now()}-${Math.random()}`,
          text: line.trim(),
          weight: 1,
        }))
        set({ options: [...options, ...importedOptions] })
      } catch (error) {
        console.error('Import failed:', error)
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }, [options, set])

  // 导出选项
  const exportOptions = useCallback(() => {
    const text = options.map(opt => opt.text).join('\n')
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `lottery-options-${Date.now()}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }, [options])

  // 加权随机抽取
  const weightedRandom = useCallback((opts: LotteryOption[]): LotteryOption => {
    const totalWeight = opts.reduce((sum, opt) => sum + opt.weight, 0)
    let random = Math.random() * totalWeight
    for (const opt of opts) {
      random -= opt.weight
      if (random <= 0) return opt
    }
    return opts[opts.length - 1]
  }, [])

  // 开始抽签
  const startDraw = useCallback(() => {
    if (options.length === 0) {
      alert(t('optionRequired'))
      return
    }

    if (drawCount <= 0) {
      alert(t('drawCountInvalid'))
      return
    }

    if (mode !== 'single' && drawCount > options.length) {
      alert(t('drawCountExceed'))
      return
    }

    setDrawing(true)
    setResult([])

    // 动画效果
    let count = 0
    const maxCount = 20
    const interval = setInterval(() => {
      if (mode === 'single') {
        const randomOpt = enableWeight
          ? weightedRandom(options)
          : options[Math.floor(Math.random() * options.length)]
        setResult([randomOpt.text])
      } else {
        const tempResult: string[] = []
        const availableOpts = [...options]
        for (let i = 0; i < Math.min(drawCount, availableOpts.length); i++) {
          const randomOpt = enableWeight
            ? weightedRandom(availableOpts)
            : availableOpts[Math.floor(Math.random() * availableOpts.length)]
          tempResult.push(randomOpt.text)
          if (mode === 'noRepeat') {
            const index = availableOpts.findIndex(opt => opt.id === randomOpt.id)
            availableOpts.splice(index, 1)
          }
        }
        setResult(tempResult)
      }

      count++
      if (count >= maxCount) {
        clearInterval(interval)
        
        // 最终结果
        let finalResult: string[]
        if (mode === 'single') {
          const randomOpt = enableWeight
            ? weightedRandom(options)
            : options[Math.floor(Math.random() * options.length)]
          finalResult = [randomOpt.text]
        } else {
          finalResult = []
          const availableOpts = [...options]
          for (let i = 0; i < Math.min(drawCount, availableOpts.length); i++) {
            const randomOpt = enableWeight
              ? weightedRandom(availableOpts)
              : availableOpts[Math.floor(Math.random() * availableOpts.length)]
            finalResult.push(randomOpt.text)
            if (mode === 'noRepeat') {
              const index = availableOpts.findIndex(opt => opt.id === randomOpt.id)
              availableOpts.splice(index, 1)
            }
          }
        }

        setResult(finalResult)
        setDrawing(false)

        // 保存历史
        const newHistory: DrawResult = {
          id: `${Date.now()}`,
          options: finalResult,
          timestamp: Date.now(),
          mode,
        }
        set({ history: [newHistory, ...history].slice(0, 20) })
      }
    }, 80)
  }, [options, drawCount, mode, enableWeight, history, set, t, weightedRandom])

  // 清空历史
  const clearHistory = useCallback(() => {
    set({ history: [] })
  }, [set])

  // 删除历史记录
  const deleteHistory = useCallback((id: string) => {
    set({ history: history.filter(h => h.id !== id) })
  }, [history, set])

  // 复制结果
  const copyResult = useCallback((text: string) => {
    navigator.clipboard.writeText(text).then(
      () => alert(t('copySuccess')),
      () => alert(t('copyFailed'))
    )
  }, [t])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <PageHero
        title={t('title')}
        description={t('description')}
        icon={Ticket}
      />
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* 选项输入 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Settings className="w-5 h-5" />
              {t('options')}
            </h3>
            <div className="flex gap-2">
              <button
                onClick={importOptions}
                className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-1"
              >
                <Upload className="w-4 h-4" />
                {t('importOptions')}
              </button>
              <button
                onClick={exportOptions}
                disabled={options.length === 0}
                className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4" />
                {t('exportOptions')}
              </button>
              <button
                onClick={clearOptions}
                disabled={options.length === 0}
                className="px-3 py-1.5 text-sm bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trash2 className="w-4 h-4" />
                {t('clearOptions')}
              </button>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.csv"
            onChange={handleFileImport}
            className="hidden"
          />

          <div className="space-y-4">
            <div>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={t('optionsPlaceholder')}
                className="w-full h-32 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
              <button
                onClick={addOptions}
                disabled={!inputText.trim()}
                className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4" />
                {t('addOption')}
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('templates')}
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => useTemplate('numbers1to100')}
                  className="px-3 py-1.5 text-sm bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
                >
                  {t('numbers1to100')}
                </button>
                <button
                  onClick={() => useTemplate('lettersAtoZ')}
                  className="px-3 py-1.5 text-sm bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
                >
                  {t('lettersAtoZ')}
                </button>
              </div>
            </div>

            {options.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('option')} ({options.length})
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <input
                      type="checkbox"
                      checked={enableWeight}
                      onChange={(e) => set({ enableWeight: e.target.checked })}
                      className="rounded border-gray-300 dark:border-gray-600"
                    />
                    {t('enableWeight')}
                  </label>
                </div>
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {options.map((option) => (
                    <div
                      key={option.id}
                      className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                    >
                      {editingId === option.id ? (
                        <>
                          <input
                            type="text"
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            className="flex-1 px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            autoFocus
                          />
                          <button
                            onClick={saveEdit}
                            className="p-1.5 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30 rounded"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="p-1.5 text-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          <span className="flex-1 text-gray-900 dark:text-white">
                            {option.text}
                          </span>
                          {enableWeight && (
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                {t('weight')}:
                              </span>
                              <input
                                type="number"
                                min="1"
                                value={option.weight}
                                onChange={(e) =>
                                  updateWeight(option.id, parseInt(e.target.value) || 1)
                                }
                                className="w-16 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                              />
                            </div>
                          )}
                          <button
                            onClick={() => startEdit(option)}
                            className="p-1.5 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteOption(option.id)}
                            className="p-1.5 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 抽签设置 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {t('mode')}
          </h3>
          <div className="space-y-4">
            <div className="flex gap-2">
              {(['single', 'multiple', 'noRepeat'] as DrawMode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => set({ mode: m })}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    mode === m
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {t(m === 'single' ? 'singleDraw' : m === 'multiple' ? 'multipleDraw' : 'noRepeat')}
                </button>
              ))}
            </div>

            {mode !== 'single' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('drawCount')}
                </label>
                <input
                  type="number"
                  min="1"
                  max={options.length}
                  value={drawCount}
                  onChange={(e) => set({ drawCount: parseInt(e.target.value) || 1 })}
                  className="w-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            )}
          </div>
        </div>

        {/* 抽签按钮 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <button
            onClick={startDraw}
            disabled={drawing || options.length === 0}
            className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-semibold text-lg flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Sparkles className={`w-5 h-5 ${drawing ? 'animate-spin' : ''}`} />
            {drawing ? t('drawing') : t('startDraw')}
          </button>
        </div>

        {/* 抽签结果 */}
        {result.length > 0 && (
          <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-8 text-white">
            <div className="text-center">
              <div className="text-sm opacity-80 mb-4">{t('result')}</div>
              <div className="space-y-3">
                {result.map((item, index) => (
                  <div
                    key={index}
                    className="text-4xl font-bold bg-white/20 rounded-xl p-4 backdrop-blur-sm"
                  >
                    {item}
                  </div>
                ))}
              </div>
              <button
                onClick={() => copyResult(result.join('\n'))}
                className="mt-4 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors flex items-center gap-2 mx-auto"
              >
                <Copy className="w-4 h-4" />
                {t('exportResult')}
              </button>
            </div>
          </div>
        )}

        {/* 历史记录 */}
        {history.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <History className="w-5 h-5" />
                {t('history')}
              </h3>
              <button
                onClick={clearHistory}
                className="px-3 py-1.5 text-sm bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
              >
                {t('clearHistory')}
              </button>
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex flex-wrap gap-2 mb-2">
                      {item.options.map((opt, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-sm font-medium"
                        >
                          {opt}
                        </span>
                      ))}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(item.timestamp).toLocaleString()} · {t(item.mode === 'single' ? 'singleDraw' : item.mode === 'multiple' ? 'multipleDraw' : 'noRepeat')}
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => copyResult(item.options.join('\n'))}
                      className="p-1.5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteHistory(item.id)}
                      className="p-1.5 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
