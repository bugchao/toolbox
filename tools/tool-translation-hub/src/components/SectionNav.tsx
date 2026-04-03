import React from 'react'
import type { LucideIcon } from 'lucide-react'
import { BookMarked, FileText, History, Languages, Settings2 } from 'lucide-react'
import { Card, StatusBadge } from '@toolbox/ui-kit'
import { useTranslation } from 'react-i18next'
import type { StudioSection } from '../types'

const ICONS: Record<StudioSection, LucideIcon> = {
  main: Languages,
  documents: FileText,
  history: History,
  glossary: BookMarked,
  settings: Settings2,
}

type SectionNavProps = {
  activeSection: StudioSection
  onChange: (section: StudioSection) => void
  historyCount: number
  glossaryCount: number
  memoryCount: number
}

export default function SectionNav({
  activeSection,
  onChange,
  historyCount,
  glossaryCount,
  memoryCount,
}: SectionNavProps) {
  const { t } = useTranslation('toolTranslationHub')
  const sections: StudioSection[] = ['main', 'documents', 'history', 'glossary', 'settings']

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden border-0 bg-slate-950 text-white shadow-[0_28px_90px_-40px_rgba(15,23,42,0.9)] dark:bg-slate-950">
        <div className="rounded-[28px] bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.24),_transparent_35%),linear-gradient(135deg,rgba(15,23,42,0.96),rgba(67,56,202,0.88))] p-6">
          <div className="text-xs uppercase tracking-[0.28em] text-white/65">{t('nav.eyebrow')}</div>
          <div className="mt-3 text-2xl font-semibold leading-tight">{t('nav.title')}</div>
          <div className="mt-2 text-sm leading-6 text-white/75">{t('nav.description')}</div>
          <div className="mt-5 flex flex-wrap gap-2">
            <StatusBadge level="info" label={`${historyCount} ${t('nav.badges.histories')}`} />
            <StatusBadge level="success" label={`${glossaryCount} ${t('nav.badges.glossary')}`} />
            <StatusBadge level="warning" label={`${memoryCount} ${t('nav.badges.memory')}`} />
          </div>
        </div>
      </Card>

      <Card className="space-y-2">
        {sections.map((section) => {
          const Icon = ICONS[section]
          const active = section === activeSection
          return (
            <button
              key={section}
              type="button"
              onClick={() => onChange(section)}
              className={[
                'flex w-full items-start gap-3 rounded-2xl px-4 py-3 text-left transition',
                active
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100 dark:bg-slate-900/60 dark:text-slate-200 dark:hover:bg-slate-900',
              ].join(' ')}
            >
              <span
                className={[
                  'mt-0.5 inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl',
                  active ? 'bg-white/15 text-white' : 'bg-indigo-100 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-300',
                ].join(' ')}
              >
                <Icon className="h-4 w-4" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold">{t(`sections.${section}`)}</span>
                <span className={active ? 'block pt-1 text-xs leading-5 text-white/80' : 'block pt-1 text-xs leading-5 text-slate-500 dark:text-slate-400'}>
                  {t(`sectionDesc.${section}`)}
                </span>
              </span>
            </button>
          )
        })}
      </Card>
    </div>
  )
}
