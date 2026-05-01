import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Ticket, RotateCcw, Play } from 'lucide-react'
import { PageHero } from '@toolbox/ui-kit'

export default function Lottery() {
  const { t } = useTranslation('toolLottery')
  const [options, setOptions] = useState('选项1\n选项2\n选项3\n选项4\n选项5')
  const [count, setCount] = useState(1)
  const [allowDuplicate, setAllowDuplicate] = useState(false)
  const [isDrawing, setIsDrawing] = useState(false)
  const [results, setResults] = useState<string[]>([])
  const [animatingIndex, setAnimatingIndex] = useState<number | null>(null)
  const [currentOption, setCurrentOption] = useState('')

  const optionList = options.split('\n').filter(o => o.trim())
  const maxCount = allowDuplicate ? 100 : optionList.length

  useEffect(() => {
    if (count > maxCount) {
      setCount(maxCount)
    }
  }, [maxCount, count])

  const startDraw = () => {
    if (optionList.length === 0) return
    if (count < 1 || count > maxCount) return

    setIsDrawing(true)
    setResults([])
    setAnimatingIndex(0)

    const selected: string[] = []
    const pool = [...optionList]

    // 逐个抽取，带动画
    let currentIndex = 0
    const drawNext = () => {
      if (currentIndex >= count) {
        setIsDrawing(false)
        setAnimatingIndex(null)
        return
      }

      setAnimatingIndex(currentIndex)

      // 动画效果：快速滚动
      let animationCount = 0
      const animationInterval = setInterval(() => {
        const randomOption = pool[Math.floor(Math.random() * pool.length)]
        setCurrentOption(randomOption)
        animationCount++

        if (animationCount >= 15) {
          clearInterval(animationInterval)

          // 真正抽取
          const availablePool = allowDuplicate ? optionList : pool
          const randomIndex = Math.floor(Math.random() * availablePool.length)
          const picked = availablePool[randomIndex]
          
          if (!allowDuplicate) {
            pool.splice(pool.indexOf(picked), 1)
          }

          selected.push(picked)
          setResults([...selected])
          setCurrentOption('')

          currentIndex++
          setTimeout(drawNext, 300)
        }
      }, 50)
    }

    drawNext()
  }

  const reset = () => {
    setResults([])
    setAnimatingIndex(null)
    setCurrentOption('')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <PageHero title={t('title')} description={t('description')} icon={Ticket} />
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">

        {/* 输入区 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
              {t('optionsLabel')}
            </label>
            <textarea
              value={options}
              onChange={e => setOptions(e.target.value)}
              rows={8}
              placeholder={t('optionsPlaceholder')}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
              disabled={isDrawing}
            />
            <p className="text-xs text-gray-500 mt-1">
              {t('totalOptions', { count: optionList.length })}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                {t('drawCount')}
              </label>
              <input
                type="number"
                value={count}
                onChange={e => setCount(Math.max(1, Math.min(maxCount, Number(e.target.value))))}
                min={1}
                max={maxCount}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={isDrawing}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                {t('allowDuplicate')}
              </label>
              <button
                onClick={() => setAllowDuplicate(!allowDuplicate)}
                disabled={isDrawing}
                className={`w-full py-2 text-sm rounded-lg font-medium transition-colors ${
                  allowDuplicate
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                } disabled:opacity-50`}
              >
                {allowDuplicate ? t('yes') : t('no')}
              </button>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={startDraw}
              disabled={isDrawing || optionList.length === 0 || count < 1}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Play className="w-4 h-4" />
              {isDrawing ? t('drawing') : t('startDraw')}
            </button>

            {results.length > 0 && (
              <button
                onClick={reset}
                disabled={isDrawing}
                className="px-4 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* 动画区 */}
        {isDrawing && animatingIndex !== null && (
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-8 text-center">
            <div className="text-white/60 text-sm mb-2">
              {t('drawingNumber', { current: animatingIndex + 1, total: count })}
            </div>
            <div className="text-white text-3xl font-bold animate-pulse min-h-[3rem] flex items-center justify-center">
              {currentOption || '...'}
            </div>
          </div>
        )}

        {/* 结果区 */}
        {results.length > 0 && !isDrawing && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              {t('results')}
            </h3>
            <div className="space-y-2">
              {results.map((result, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800 animate-fadeIn"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex-shrink-0 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1 text-gray-900 dark:text-gray-100 font-medium">
                    {result}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 说明 */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-sm text-blue-800 dark:text-blue-200">
          <p className="font-medium mb-2">{t('howToUse')}</p>
          <ul className="space-y-1 list-disc list-inside text-blue-700 dark:text-blue-300">
            <li>{t('tip1')}</li>
            <li>{t('tip2')}</li>
            <li>{t('tip3')}</li>
            <li>{t('tip4')}</li>
          </ul>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  )
}
