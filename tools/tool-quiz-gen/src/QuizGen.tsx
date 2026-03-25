import React, { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Brain, RotateCcw, Trophy } from 'lucide-react'
import { PageHero, ProgressRing } from '@toolbox/ui-kit'
import { useToolStorage } from '@toolbox/storage'

interface Question {
  q: string
  options: string[]
  answer: number
  explanation?: string
  category: string
}

const QUESTIONS: Question[] = [
  // 常识
  { q: '世界上面积最大的国家是？', options: ['中国', '美国', '俄罗斯', '加拿大'], answer: 2, category: '常识' },
  { q: '光在真空中的速度约为多少？', options: ['30万km/s', '3万km/s', '300km/s', '3000km/s'], answer: 0, category: '常识' },
  { q: '人体血液中含量最多的细胞是？', options: ['白细胞', '红细胞', '血小板', '淋巴细胞'], answer: 1, category: '常识' },
  { q: '地球距离太阳约多少公里？', options: ['1亿km', '1.5亿km', '2亿km', '5000万km'], answer: 1, category: '常识' },
  { q: '最早发明印刷术的国家是？', options: ['德国', '英国', '中国', '日本'], answer: 2, category: '常识' },
  // 历史
  { q: '中国第一个封建王朝是？', options: ['商朝', '周朝', '秦朝', '夏朝'], answer: 2, category: '历史', explanation: '秦始皇建立了中国第一个统一的封建中央集权制国家' },
  { q: '第二次世界大战结束于哪一年？', options: ['1943', '1944', '1945', '1946'], answer: 2, category: '历史' },
  { q: '文艺复兴发源于哪个国家？', options: ['法国', '英国', '意大利', '德国'], answer: 2, category: '历史' },
  { q: '指南针是由哪个国家发明的？', options: ['中国', '希腊', '阿拉伯', '埃及'], answer: 0, category: '历史' },
  { q: '奥运会起源于哪个国家？', options: ['罗马', '埃及', '希腊', '中国'], answer: 2, category: '历史' },
  // 科学
  { q: '水的化学式是？', options: ['H2O', 'CO2', 'NaCl', 'O2'], answer: 0, category: '科学' },
  { q: '人体有多少块骨头（成年人）？', options: ['186', '196', '206', '216'], answer: 2, category: '科学' },
  { q: '元素周期表中原子序数最小的元素是？', options: ['氦', '氢', '锂', '碳'], answer: 1, category: '科学' },
  { q: '声音在空气中的传播速度约为？', options: ['3km/s', '340m/s', '1500m/s', '34m/s'], answer: 1, category: '科学' },
  { q: 'DNA的全称是？', options: ['脱氧核糖核酸', '核糖核酸', '氨基酸', '蛋白质'], answer: 0, category: '科学' },
  // 地理
  { q: '世界上最长的河流是？', options: ['长江', '亚马逊河', '尼罗河', '密西西比河'], answer: 2, category: '地理' },
  { q: '中国的首都是？', options: ['上海', '广州', '北京', '西安'], answer: 2, category: '地理' },
  { q: '撒哈拉沙漠位于哪个大洲？', options: ['亚洲', '北美洲', '非洲', '大洋洲'], answer: 2, category: '地理' },
  { q: '世界上最高的山峰是？', options: ['珠穆朗玛峰', 'K2', '洛子峰', '马卡鲁峰'], answer: 0, category: '地理' },
  { q: '澳大利亚的首都是？', options: ['悉尼', '墨尔本', '布里斯班', '堪培拉'], answer: 3, category: '地理' },
  // 数学
  { q: '圆周率 π 约等于？', options: ['3.14159', '3.12159', '3.16159', '3.14259'], answer: 0, category: '数学' },
  { q: '2的10次方是？', options: ['512', '1024', '2048', '256'], answer: 1, category: '数学' },
  { q: '斐波那契数列中第10个数是？', options: ['34', '55', '89', '144'], answer: 1, category: '数学' },
]

interface ScoreRecord { date: string; score: number; total: number; category: string }
interface QuizState { records: ScoreRecord[] }
const DEFAULT: QuizState = { records: [] }

export default function QuizGen() {
  const { t } = useTranslation('toolQuizGen')
  const { data: state, save } = useToolStorage<QuizState>('quiz-gen', 'data', DEFAULT)
  const [category, setCategory] = useState('全部')
  const [quizQuestions, setQuizQuestions] = useState<Question[]>([])
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [answers, setAnswers] = useState<boolean[]>([])
  const [phase, setPhase] = useState<'config' | 'quiz' | 'result'>('config')

  const categories = ['全部', ...Array.from(new Set(QUESTIONS.map(q => q.category)))]

  const startQuiz = () => {
    const pool = category === '全部' ? QUESTIONS : QUESTIONS.filter(q => q.category === category)
    const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, 10)
    setQuizQuestions(shuffled)
    setCurrent(0)
    setSelected(null)
    setAnswers([])
    setPhase('quiz')
  }

  const handleAnswer = (idx: number) => {
    if (selected !== null) return
    setSelected(idx)
  }

  const next = () => {
    const isCorrect = selected === quizQuestions[current].answer
    const newAnswers = [...answers, isCorrect]
    if (current + 1 >= quizQuestions.length) {
      const score = newAnswers.filter(Boolean).length
      save({ records: [{ date: new Date().toLocaleDateString('zh-CN'), score, total: quizQuestions.length, category }, ...state.records].slice(0, 20) })
      setAnswers(newAnswers)
      setPhase('result')
    } else {
      setAnswers(newAnswers)
      setCurrent(c => c + 1)
      setSelected(null)
    }
  }

  const score = answers.filter(Boolean).length
  const q = quizQuestions[current]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <PageHero title={t('title')} description={t('description')} icon={Brain} />
      <div className="max-w-xl mx-auto px-4 py-6 space-y-4">

        {/* 配置页 */}
        {phase === 'config' && (
          <>
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 space-y-4">
              <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">选择题目分类</h2>
              <div className="flex gap-2 flex-wrap">
                {categories.map(c => (
                  <button key={c} onClick={() => setCategory(c)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      category === c ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                    }`}>{c}</button>
                ))}
              </div>
              <div className="text-xs text-gray-400">将从{category === '全部' ? QUESTIONS.length : QUESTIONS.filter(q => q.category === category).length}道题中随机抽取10题</div>
              <button onClick={startQuiz}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors">{t('start')}</button>
            </div>
            {/* 历史成绩 */}
            {state.records.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2"><Trophy className="w-4 h-4 text-amber-400" />历史成绩</h3>
                </div>
                {state.records.slice(0, 5).map((r, i) => (
                  <div key={i} className="flex items-center gap-3 px-4 py-2.5 border-b border-gray-50 dark:border-gray-700/50 last:border-0">
                    <span className="text-xs text-gray-400">{r.date}</span>
                    <span className="text-xs text-gray-500">{r.category}</span>
                    <span className="ml-auto font-semibold text-indigo-500">{r.score}/{r.total}</span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* 答题页 */}
        {phase === 'quiz' && q && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">{current + 1} / {quizQuestions.length}</span>
              <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-500">{q.category}</span>
            </div>
            <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1.5">
              <div className="bg-indigo-500 h-1.5 rounded-full transition-all" style={{ width: `${(current / quizQuestions.length) * 100}%` }} />
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
              <p className="text-base font-medium text-gray-800 dark:text-gray-200 mb-4">{q.q}</p>
              <div className="space-y-2">
                {q.options.map((opt, idx) => {
                  let cls = 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300'
                  if (selected !== null) {
                    if (idx === q.answer) cls = 'bg-green-50 dark:bg-green-900/20 border-green-400 text-green-700 dark:text-green-400'
                    else if (idx === selected && selected !== q.answer) cls = 'bg-red-50 dark:bg-red-900/20 border-red-400 text-red-600'
                  } else if (false) cls = 'border-indigo-400 bg-indigo-50'
                  return (
                    <button key={idx} onClick={() => handleAnswer(idx)}
                      className={`w-full text-left px-4 py-3 rounded-lg border-2 text-sm transition-colors ${cls}`}>
                      <span className="font-medium mr-2">{String.fromCharCode(65 + idx)}.</span>{opt}
                    </button>
                  )
                })}
              </div>
              {selected !== null && (
                <div className="mt-4 space-y-2">
                  <div className={`text-sm font-medium ${
                    selected === q.answer ? 'text-green-600' : 'text-red-500'
                  }`}>{selected === q.answer ? t('correct') : t('wrong')}</div>
                  {q.explanation && <div className="text-xs text-gray-500">{q.explanation}</div>}
                  <button onClick={next}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium">
                    {current + 1 < quizQuestions.length ? t('next') : t('finish')}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 结果页 */}
        {phase === 'result' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 text-center space-y-4">
            <ProgressRing value={Math.round(score / quizQuestions.length * 100)} size={100} label={`${score}/${quizQuestions.length}`} />
            <div>
              <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {score >= 8 ? '🎉 优秀！' : score >= 6 ? '👍 良好' : score >= 4 ? '💪 继续努力' : '📚 需要加强'}
              </div>
              <div className="text-sm text-gray-500 mt-1">{t('score')}: {score}/{quizQuestions.length}</div>
            </div>
            <button onClick={() => setPhase('config')}
              className="flex items-center gap-2 mx-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium">
              <RotateCcw className="w-4 h-4" />{t('restart')}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
