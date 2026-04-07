import React, { useMemo, useState, useEffect } from 'react'
import { CheckCheck, NotebookPen, Sparkles, Download, Upload, Calendar } from 'lucide-react'
import { Card, NoticeCard, PageHero, PropertyGrid } from '@toolbox/ui-kit'
import { useTranslation } from 'react-i18next'

interface DailyReviewData {
  date: string
  wins: string
  blockers: string
  lesson: string
  gratitude: string
  energy: number
}

const STORAGE_KEY = 'daily-review-history'

const DailyReview: React.FC = () => {
  const { t } = useTranslation('toolDailyReview')
  const [currentDate, setCurrentDate] = useState(() => new Date().toISOString().split('T')[0])
  const [wins, setWins] = useState('')
  const [blockers, setBlockers] = useState('')
  const [lesson, setLesson] = useState('')
  const [gratitude, setGratitude] = useState('')
  const [energy, setEnergy] = useState(3)
  const [history, setHistory] = useState<Record<string, DailyReviewData>>({})
  const [isLoaded, setIsLoaded] = useState(false)

  // 从 localStorage 加载历史数据
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        setHistory(JSON.parse(saved))
      }
    } catch (error) {
      console.error('Failed to load daily review history:', error)
    } finally {
      setIsLoaded(true)
    }
  }, [])

  // 加载当前日期的数据
  useEffect(() => {
    if (!isLoaded) return
    
    const data = history[currentDate]
    if (data) {
      setWins(data.wins)
      setBlockers(data.blockers)
      setLesson(data.lesson)
      setGratitude(data.gratitude)
      setEnergy(data.energy)
    } else {
      // 清空表单
      setWins('')
      setBlockers('')
      setLesson('')
      setGratitude('')
      setEnergy(3)
    }
  }, [currentDate, isLoaded, history])

  // 自动保存当前数据
  useEffect(() => {
    if (!isLoaded) return
    
    const data: DailyReviewData = {
      date: currentDate,
      wins,
      blockers,
      lesson,
      gratitude,
      energy,
    }
    
    const newHistory = { ...history, [currentDate]: data }
    setHistory(newHistory)
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory))
    } catch (error) {
      console.error('Failed to save daily review:', error)
    }
  }, [wins, blockers, lesson, gratitude, energy, currentDate, isLoaded])

  const exportData = () => {
    const dataStr = JSON.stringify(history, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `daily-review-${new Date().toISOString().split('T')[0]}.json`
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
          setHistory(data)
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
          alert('导入成功！')
        } catch (error) {
          alert('导入失败：文件格式错误')
        }
      }
      reader.readAsText(file)
    }
    input.click()
  }

  const summary = useMemo(() => {
    const winList = wins.split('\n').map((item) => item.trim()).filter(Boolean)
    const blockerList = blockers.split('\n').map((item) => item.trim()).filter(Boolean)
    const tomorrow = [
      winList[0] ? t('generated.keepDoing', { item: winList[0] }) : t('generated.keepRhythm'),
      blockerList[0] ? t('generated.clearBlocker', { item: blockerList[0] }) : t('generated.protectFocus'),
      lesson.trim() ? t('generated.applyLesson', { item: lesson.trim() }) : t('generated.endWithPlan'),
    ]

    return {
      winCount: winList.length,
      blockerCount: blockerList.length,
      energyLabel: t(`energyScale.${energy}`),
      reflection:
        winList.length || blockerList.length || lesson.trim()
          ? t('generated.summary', {
              wins: winList.length || 0,
              blockers: blockerList.length || 0,
              energy: t(`energyScale.${energy}`),
            })
          : t('generated.empty'),
      tomorrow,
    }
  }, [wins, blockers, lesson, energy, gratitude, t])

  return (
    <div className="space-y-6">
      <Card className="border-amber-200/70 bg-gradient-to-br from-white via-amber-50 to-rose-50/70 dark:border-amber-900/60 dark:from-slate-950 dark:via-amber-950/20 dark:to-rose-950/10">
        <div className="flex items-center justify-between">
          <PageHero icon={NotebookPen} title={t('title')} description={t('description')} />
          <div className="flex gap-2">
            <input
              type="date"
              value={currentDate}
              onChange={(e) => setCurrentDate(e.target.value)}
              className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm"
            />
            <button onClick={exportData} title="导出数据"
              className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors">
              <Download className="w-5 h-5" />
            </button>
            <button onClick={importData} title="导入数据"
              className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors">
              <Upload className="w-5 h-5" />
            </button>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_420px]">
        <Card className="space-y-4">
          {[
            ['wins', t('fields.wins'), wins, setWins, t('placeholders.wins')],
            ['blockers', t('fields.blockers'), blockers, setBlockers, t('placeholders.blockers')],
            ['lesson', t('fields.lesson'), lesson, setLesson, t('placeholders.lesson')],
            ['gratitude', t('fields.gratitude'), gratitude, setGratitude, t('placeholders.gratitude')],
          ].map(([key, label, value, setter, placeholder]) => (
            <label key={key as string} className="block space-y-2">
              <div className="text-sm font-medium text-slate-700 dark:text-slate-300">{label as string}</div>
              <textarea
                value={value as string}
                onChange={(event) => (setter as React.Dispatch<React.SetStateAction<string>>)(event.target.value)}
                rows={key === 'lesson' || key === 'gratitude' ? 3 : 4}
                placeholder={placeholder as string}
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm leading-6 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
            </label>
          ))}

          <div className="space-y-2">
            <div className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('fields.energy')}</div>
            <div className="grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setEnergy(value)}
                  className={[
                    'rounded-xl border px-3 py-2 text-sm font-semibold transition',
                    value === energy
                      ? 'border-indigo-500 bg-indigo-600 text-white'
                      : 'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300',
                  ].join(' ')}
                >
                  {t(`energyScale.${value}`)}
                </button>
              ))}
            </div>
          </div>
        </Card>

        <div className="space-y-6">
          <NoticeCard tone="info" icon={Sparkles} title={t('output.summaryTitle')} description={summary.reflection} />

          <Card className="space-y-4">
            <PropertyGrid
              items={[
                { label: t('output.winCount'), value: summary.winCount, tone: 'success' },
                { label: t('output.blockerCount'), value: summary.blockerCount, tone: 'warning' },
                { label: t('output.energy'), value: summary.energyLabel, tone: 'primary' },
              ]}
              className="xl:grid-cols-1"
            />
          </Card>

          <Card className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
              <CheckCheck className="h-4 w-4" />
              {t('output.tomorrowTitle')}
            </div>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
              {summary.tomorrow.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default DailyReview
