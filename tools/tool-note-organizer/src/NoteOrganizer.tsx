import React, { useMemo, useState } from 'react'
import { NotebookTabs, Sparkles } from 'lucide-react'
import { Card, NoticeCard, PageHero, PropertyGrid } from '@toolbox/ui-kit'
import { useTranslation } from 'react-i18next'

const NoteOrganizer: React.FC = () => {
  const { t } = useTranslation('toolNoteOrganizer')
  const [text, setText] = useState('Refactor auth middleware\nTODO: align token expiry copy\nWhy are users dropping after onboarding?\nNeed examples from enterprise customers')

  const organized = useMemo(() => {
    const lines = text.split('\n').map((item) => item.trim()).filter(Boolean)
    return {
      tasks: lines.filter((line) => /^(-|\*|\[ \]|todo[:：]?)/i.test(line) || /TODO/i.test(line)),
      questions: lines.filter((line) => /\?$|为什么|是否|how/i.test(line)),
      insights: lines.filter((line) => !/^(-|\*|\[ \]|todo[:：]?)/i.test(line) && !/\?$|为什么|是否|how/i.test(line)),
    }
  }, [text])

  return (
    <div className="space-y-6">
      <Card className="border-purple-200/70 bg-gradient-to-br from-white via-purple-50 to-indigo-50/70 dark:border-purple-900/60 dark:from-slate-950 dark:via-purple-950/20 dark:to-indigo-950/10">
        <PageHero icon={NotebookTabs} title={t('title')} description={t('description')} />
      </Card>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_420px]">
        <Card className="space-y-3">
          <div className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('inputTitle')}</div>
          <textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            rows={16}
            placeholder={t('placeholder')}
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm leading-6 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          />
        </Card>

        <div className="space-y-6">
          <NoticeCard tone="info" icon={Sparkles} title={t('noticeTitle')} description={t('noticeDescription')} />
          <Card>
            <PropertyGrid
              items={[
                { label: t('stats.tasks'), value: organized.tasks.length, tone: 'warning' },
                { label: t('stats.questions'), value: organized.questions.length, tone: 'primary' },
                { label: t('stats.insights'), value: organized.insights.length, tone: 'success' },
              ]}
              className="xl:grid-cols-1"
            />
          </Card>
          {(['tasks', 'questions', 'insights'] as const).map((key) => (
            <Card key={key} className="space-y-3">
              <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">{t(`sections.${key}`)}</div>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                {organized[key].length ? organized[key].map((item) => <li key={item}>• {item}</li>) : <li>{t('empty')}</li>}
              </ul>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

export default NoteOrganizer
