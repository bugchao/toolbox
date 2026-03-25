import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Trash2, ListChecks } from 'lucide-react'
import { PageHero, ProgressRing } from '@toolbox/ui-kit'
import { useToolStorage } from '@toolbox/storage'

interface Option { text: string }
interface Question { id: string; question: string; options: Option[]; correct: number }
interface McqState { questions: Question[] }
const DEFAULT: McqState = { questions: [] }

type Phase = 'edit' | 'quiz' | 'result'

export default function McqGen() {
  const { t } = useTranslation('toolMcqGen')
  const { data: state, save } = useToolStorage<McqState>('mcq-gen', 'data', DEFAULT)
  const [phase, setPhase] = useState<Phase>('edit')
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [current, setCurrent] = useState(0)
  const [form, setForm] = useState({ question: '', options: ['', '', '', ''], correct: 0 })
  const [adding, setAdding] = useState(false)

  const { questions } = state
  const set = (q: Question[]) => save({ questions: q })

  const addQ = () => {
    if (!form.question.trim() || form.options.filter(o => o.trim()).length < 2) return
    const opts = form.options.filter(o => o.trim()).map(text => ({ text }))
    set([...questions, { id: Date.now().toString(), question: form.question, options: opts, correct: form.correct }])
    setForm({ question: '', options: ['', '', '', ''], correct: 0 })
    setAdding(false)
  }

  const removeQ = (id: string) => set(questions.filter(q => q.id !== id))

  const startQuiz = () => {
    setAnswers({})
    setCurrent(0)
    setPhase('quiz')
  }

  const answer = (qId: string, idx: number) => {
    setAnswers(a => ({ ...a, [qId]: idx }))
    setTimeout(() => {
      if (current + 1 >= questions.length) setPhase('result')
      else setCurrent(c => c + 1)
    }, 800)
  }

  const score = questions.filter(q => answers[q.id] === q.correct).length
  const pct = questions.length ? Math.round(score / questions.length * 100) : 0
  const currentQ = questions[current]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <PageHero title={t('title')} description={t('description')} icon={ListChecks} />
      <div className="max-w-xl mx-auto px-4 py-6 space-y-4">

        {/* 编辑模式 */}
        {phase === 'edit' && (
          <>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">共 {questions.length} 道题</span>
              <div className="flex gap-2">
                <button onClick={() => setAdding(v => !v)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-600 hover:border-indigo-400">
                  <Plus className="w-3.5 h-3.5" />{t('addQuestion')}
                </button>
                {questions.length > 0 && (
                  <button onClick={startQuiz}
                    className="px-3 py-1.5 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg">{t('startQuiz')}</button>
                )}
              </div>
            </div>

            {adding && (
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-3">
                <input value={form.question} onChange={e => setForm(f => ({ ...f, question: e.target.value }))}
                  placeholder={t('questionPlaceholder')}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                {form.options.map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <button onClick={() => setForm(f => ({ ...f, correct: idx }))}
                      className={`w-6 h-6 rounded-full border-2 shrink-0 flex items-center justify-center text-xs transition-colors ${
                        form.correct === idx ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300'
                      }`}>{form.correct === idx ? '✓' : String.fromCharCode(65 + idx)}</button>
                    <input value={opt} onChange={e => setForm(f => ({ ...f, options: f.options.map((o, i) => i === idx ? e.target.value : o) }))}
                      placeholder={`${t('optionPlaceholder')} ${String.fromCharCode(65 + idx)}`}
                      className="flex-1 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none" />
                  </div>
                ))}
                <p className="text-xs text-gray-400">点击左侧圆圈设置正确答案</p>
                <div className="flex gap-2 justify-end">
                  <button onClick={() => setAdding(false)} className="px-4 py-2 text-sm text-gray-500">取消</button>
                  <button onClick={addQ} className="px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg">保存</button>
                </div>
              </div>
            )}

            {questions.length === 0 && !adding && (
              <div className="text-center py-12 text-gray-400 text-sm">{t('empty')}</div>
            )}

            <div className="space-y-2">
              {questions.map((q, i) => (
                <div key={q.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-3 flex items-start gap-3">
                  <span className="text-xs text-gray-400 shrink-0 mt-0.5">Q{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-gray-800 dark:text-gray-200">{q.question}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{q.options.length}个选项 · 答案: {String.fromCharCode(65 + q.correct)}</div>
                  </div>
                  <button onClick={() => removeQ(q.id)} className="text-gray-300 hover:text-red-400 shrink-0"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
          </>
        )}

        {/* 答题模式 */}
        {phase === 'quiz' && currentQ && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">{current + 1} / {questions.length}</span>
              <button onClick={() => setPhase('edit')} className="text-xs text-gray-400 hover:text-gray-600">退出</button>
            </div>
            <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1.5">
              <div className="bg-indigo-500 h-1.5 rounded-full transition-all" style={{ width: `${(current / questions.length) * 100}%` }} />
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
              <p className="text-base font-medium text-gray-800 dark:text-gray-200 mb-4">Q{current + 1}. {currentQ.question}</p>
              <div className="space-y-2">
                {currentQ.options.map((opt, idx) => {
                  const answered = answers[currentQ.id] !== undefined
                  let cls = 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
                  if (answered) {
                    if (idx === currentQ.correct) cls = 'bg-green-50 dark:bg-green-900/20 border-green-400'
                    else if (idx === answers[currentQ.id]) cls = 'bg-red-50 dark:bg-red-900/20 border-red-400'
                  }
                  return (
                    <button key={idx} onClick={() => !answered && answer(currentQ.id, idx)}
                      className={`w-full text-left px-4 py-3 rounded-lg border-2 text-sm transition-colors ${cls}`}>
                      <span className="font-medium mr-2">{String.fromCharCode(65 + idx)}.</span>{opt.text}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* 结果 */}
        {phase === 'result' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 text-center space-y-4">
            <ProgressRing value={pct} size={100} label={`${score}/${questions.length}`} />
            <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {pct >= 80 ? '🎉 优秀！' : pct >= 60 ? '👍 良好' : '📚 继续加油'}
            </div>
            <div className="text-sm text-gray-500">{t('score')}: {score}/{questions.length} ({pct}%)</div>
            <div className="flex gap-3 justify-center">
              <button onClick={startQuiz} className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm">{t('restart')}</button>
              <button onClick={() => setPhase('edit')} className="px-5 py-2 border border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-600 dark:text-gray-400">编辑题目</button>
            </div>
          </div>
        )}
        <p className="text-xs text-center text-gray-400">{t('autoSave')}</p>
      </div>
    </div>
  )
}
