import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Dumbbell, RotateCcw, Zap } from 'lucide-react'
import { PageHero } from '@toolbox/ui-kit'

type Goal = 'lose' | 'muscle' | 'fit' | 'health'
type Level = 'beginner' | 'intermediate' | 'advanced'
type Gender = 'male' | 'female'

interface FormData {
  age: string
  gender: Gender
  weight: string
  height: string
  goal: Goal
  level: Level
  daysPerWeek: number
}

interface Exercise {
  name: string
  sets?: number
  reps?: number
  duration?: number
}

interface DayPlan {
  isRest: boolean
  warmup: Exercise[]
  main: Exercise[]
  cooldown: Exercise[]
  calories: number
}

const PLANS: Record<Goal, Record<Level, { warmup: Exercise[]; main: Exercise[]; cooldown: Exercise[]; calories: number }>> = {
  lose: {
    beginner: {
      warmup: [{ name: '慢跑热身', duration: 5 }, { name: '动态拉伸', duration: 3 }],
      main: [{ name: '快走/慢跑', duration: 20 }, { name: '深蹲', sets: 3, reps: 15 }, { name: '俯卧撑', sets: 3, reps: 10 }],
      cooldown: [{ name: '静态拉伸', duration: 5 }],
      calories: 250,
    },
    intermediate: {
      warmup: [{ name: '跳绳热身', duration: 5 }, { name: '动态拉伸', duration: 3 }],
      main: [{ name: 'HIIT循环', duration: 25 }, { name: '保加利亚深蹲', sets: 4, reps: 12 }, { name: '俯卧撑变式', sets: 4, reps: 15 }],
      cooldown: [{ name: '泡沫轴放松', duration: 5 }, { name: '静态拉伸', duration: 5 }],
      calories: 400,
    },
    advanced: {
      warmup: [{ name: '动态热身', duration: 8 }],
      main: [{ name: 'Tabata训练', duration: 30 }, { name: '负重深蹲', sets: 5, reps: 10 }, { name: '引体向上', sets: 4, reps: 10 }],
      cooldown: [{ name: '全身拉伸', duration: 10 }],
      calories: 550,
    },
  },
  muscle: {
    beginner: {
      warmup: [{ name: '轻重量热身', duration: 5 }],
      main: [{ name: '哑铃卧推', sets: 3, reps: 12 }, { name: '哑铃划船', sets: 3, reps: 12 }, { name: '哑铃弯举', sets: 3, reps: 12 }],
      cooldown: [{ name: '肌肉拉伸', duration: 5 }],
      calories: 200,
    },
    intermediate: {
      warmup: [{ name: '激活热身', duration: 8 }],
      main: [{ name: '杠铃卧推', sets: 4, reps: 8 }, { name: '杠铃深蹲', sets: 4, reps: 8 }, { name: '硬拉', sets: 3, reps: 8 }, { name: '肩推', sets: 3, reps: 10 }],
      cooldown: [{ name: '全身拉伸', duration: 8 }],
      calories: 350,
    },
    advanced: {
      warmup: [{ name: '全面激活', duration: 10 }],
      main: [{ name: '大重量卧推', sets: 5, reps: 5 }, { name: '深蹲', sets: 5, reps: 5 }, { name: '硬拉', sets: 4, reps: 5 }, { name: '引体向上', sets: 4, reps: 8 }, { name: '双杠臂屈伸', sets: 4, reps: 10 }],
      cooldown: [{ name: '深度拉伸', duration: 10 }],
      calories: 480,
    },
  },
  fit: {
    beginner: {
      warmup: [{ name: '关节活动', duration: 5 }],
      main: [{ name: '跳绳', duration: 10 }, { name: '波比跳', sets: 3, reps: 8 }, { name: '平板支撑', sets: 3, reps: 30 }],
      cooldown: [{ name: '拉伸放松', duration: 5 }],
      calories: 280,
    },
    intermediate: {
      warmup: [{ name: '动态热身', duration: 8 }],
      main: [{ name: '跳绳', duration: 15 }, { name: '波比跳', sets: 4, reps: 12 }, { name: '山地爬行', sets: 4, reps: 20 }, { name: '侧向跳', sets: 3, reps: 15 }],
      cooldown: [{ name: '全身拉伸', duration: 8 }],
      calories: 420,
    },
    advanced: {
      warmup: [{ name: '全面热身', duration: 10 }],
      main: [{ name: '速度跑', duration: 20 }, { name: '箱跳', sets: 5, reps: 10 }, { name: '波比跳', sets: 5, reps: 15 }, { name: '绳梯训练', duration: 10 }],
      cooldown: [{ name: '深度放松', duration: 10 }],
      calories: 600,
    },
  },
  health: {
    beginner: {
      warmup: [{ name: '散步', duration: 5 }],
      main: [{ name: '快走', duration: 20 }, { name: '基础深蹲', sets: 2, reps: 10 }, { name: '坐姿拉伸', duration: 5 }],
      cooldown: [{ name: '冥想呼吸', duration: 5 }],
      calories: 150,
    },
    intermediate: {
      warmup: [{ name: '慢跑', duration: 5 }],
      main: [{ name: '慢跑', duration: 25 }, { name: '核心训练', sets: 3, reps: 15 }, { name: '瑜伽流', duration: 10 }],
      cooldown: [{ name: '冥想拉伸', duration: 8 }],
      calories: 280,
    },
    advanced: {
      warmup: [{ name: '慢跑热身', duration: 8 }],
      main: [{ name: '跑步', duration: 30 }, { name: '全身力量', sets: 3, reps: 15 }, { name: '瑜伽', duration: 15 }],
      cooldown: [{ name: '深度冥想', duration: 10 }],
      calories: 380,
    },
  },
}

function calcBMI(weight: number, height: number) {
  const h = height / 100
  return (weight / (h * h)).toFixed(1)
}

export default function FitnessPlanner() {
  const { t } = useTranslation('toolFitnessPlanner')
  const [form, setForm] = useState<FormData>({ age: '', gender: 'male', weight: '', height: '', goal: 'lose', level: 'beginner', daysPerWeek: 3 })
  const [plan, setPlan] = useState<DayPlan[] | null>(null)

  const handleGenerate = () => {
    const template = PLANS[form.goal][form.level]
    const days: DayPlan[] = Array.from({ length: 7 }, (_, i) => {
      if (i >= form.daysPerWeek) return { isRest: true, warmup: [], main: [], cooldown: [], calories: 0 }
      return { isRest: false, ...template }
    })
    setPlan(days)
  }

  const bmi = form.weight && form.height ? calcBMI(Number(form.weight), Number(form.height)) : null
  const bmiLabel = bmi ? (Number(bmi) < 18.5 ? t('bmiUnderweight') : Number(bmi) < 24 ? t('bmiNormal') : Number(bmi) < 28 ? t('bmiOverweight') : t('bmiObese')) : null

  const inputCls = 'w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500'
  const selectCls = inputCls

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <PageHero icon={Dumbbell} titleKey="title" descriptionKey="description" namespace="toolFitnessPlanner" />
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* Form */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">{t('age')}</label>
              <input type="number" className={inputCls} placeholder={t('agePlaceholder')} value={form.age} onChange={e => setForm(f => ({ ...f, age: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">{t('gender')}</label>
              <select className={selectCls} value={form.gender} onChange={e => setForm(f => ({ ...f, gender: e.target.value as Gender }))}>
                <option value="male">{t('male')}</option>
                <option value="female">{t('female')}</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">{t('weight')}</label>
              <input type="number" className={inputCls} placeholder={t('weightPlaceholder')} value={form.weight} onChange={e => setForm(f => ({ ...f, weight: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">{t('height')}</label>
              <input type="number" className={inputCls} placeholder={t('heightPlaceholder')} value={form.height} onChange={e => setForm(f => ({ ...f, height: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">{t('goal')}</label>
              <select className={selectCls} value={form.goal} onChange={e => setForm(f => ({ ...f, goal: e.target.value as Goal }))}>
                <option value="lose">{t('goalLose')}</option>
                <option value="muscle">{t('goalMuscle')}</option>
                <option value="fit">{t('goalFit')}</option>
                <option value="health">{t('goalHealth')}</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">{t('level')}</label>
              <select className={selectCls} value={form.level} onChange={e => setForm(f => ({ ...f, level: e.target.value as Level }))}>
                <option value="beginner">{t('levelBeginner')}</option>
                <option value="intermediate">{t('levelIntermediate')}</option>
                <option value="advanced">{t('levelAdvanced')}</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-500 mb-1">{t('daysPerWeek')}: {form.daysPerWeek}</label>
              <input type="range" min={1} max={7} value={form.daysPerWeek} onChange={e => setForm(f => ({ ...f, daysPerWeek: Number(e.target.value) }))} className="w-full accent-indigo-600" />
              <div className="flex justify-between text-xs text-gray-400 mt-1">{[1,2,3,4,5,6,7].map(d => <span key={d}>{d}</span>)}</div>
            </div>
          </div>
          {bmi && (
            <div className="mt-4 flex items-center gap-2 text-sm">
              <span className="text-gray-500">{t('bmi')}:</span>
              <span className="font-bold text-indigo-600">{bmi}</span>
              <span className="text-gray-500">({bmiLabel})</span>
            </div>
          )}
          <div className="flex gap-3 mt-6">
            <button onClick={handleGenerate} className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-2.5 text-sm font-medium transition-colors">
              <Zap className="w-4 h-4" />{t('generate')}
            </button>
            <button onClick={() => { setForm({ age: '', gender: 'male', weight: '', height: '', goal: 'lose', level: 'beginner', daysPerWeek: 3 }); setPlan(null) }} className="px-4 flex items-center gap-1.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-500 hover:text-gray-700 transition-colors">
              <RotateCcw className="w-4 h-4" />{t('reset')}
            </button>
          </div>
        </div>

        {/* Plan */}
        {plan && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">{t('planTitle')}</h2>
            {plan.map((day, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-semibold text-gray-700 dark:text-gray-200">{t('day', { day: i + 1 })}</span>
                  {!day.isRest && <span className="text-xs text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded-full">{t('calories')}: {day.calories} {t('kcal')}</span>}
                </div>
                {day.isRest ? (
                  <p className="text-sm text-gray-400">{t('restDay')}</p>
                ) : (
                  <div className="space-y-2 text-sm">
                    {[{ label: t('warmup'), items: day.warmup }, { label: t('main'), items: day.main }, { label: t('cooldown'), items: day.cooldown }].map(section => (
                      <div key={section.label}>
                        <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">{section.label}</span>
                        <ul className="mt-1 space-y-1">
                          {section.items.map((ex, j) => (
                            <li key={j} className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 flex-shrink-0" />
                              {ex.name}
                              {ex.sets && ex.reps && <span className="text-gray-400 text-xs">{ex.sets}{t('sets')} × {ex.reps}{t('reps')}</span>}
                              {ex.duration && <span className="text-gray-400 text-xs">{ex.duration}{t('minutes')}</span>}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
