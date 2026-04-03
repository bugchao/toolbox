import React from 'react'
import { CalendarDays, ScrollText } from 'lucide-react'
import { Card, PageHero, StatusBadge } from '@toolbox/ui-kit'
import { useTranslation } from 'react-i18next'
import { CHANGELOG_ENTRIES, getLocalizedChangeText } from '../data/changelog'
import { getToolByPath, getToolTitle } from '../config/tools'

function ItemPill({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-200">
      {label}
    </span>
  )
}

export default function Changelog() {
  const { t, i18n } = useTranslation('changelogPage')
  const { t: tNav } = useTranslation('nav')
  const language = i18n.resolvedLanguage ?? i18n.language

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <PageHero
        icon={ScrollText}
        title={t('title')}
        description={t('description')}
      />

      <Card className="bg-gradient-to-br from-indigo-50 via-white to-sky-50 dark:from-indigo-950/60 dark:via-gray-900 dark:to-sky-950/40">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-indigo-600 dark:text-indigo-300">
              {t('latest')}
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">
              {CHANGELOG_ENTRIES[0]?.date}
            </h2>
            <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">
              {t('summary')}
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/70 bg-white/80 px-4 py-3 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5">
              <div className="text-xs uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">{t('stats.entryCount')}</div>
              <div className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">{CHANGELOG_ENTRIES.length}</div>
            </div>
            <div className="rounded-2xl border border-white/70 bg-white/80 px-4 py-3 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5">
              <div className="text-xs uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">{t('stats.totalUpdates')}</div>
              <div className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">
                {CHANGELOG_ENTRIES.reduce((count, entry) => count + entry.items.length, 0)}
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div className="space-y-5">
        {CHANGELOG_ENTRIES.map((entry) => (
          <Card key={entry.date} as="section" className="overflow-hidden">
            <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
              <div className="lg:w-56 lg:shrink-0">
                <div className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700 dark:bg-gray-700/60 dark:text-gray-200">
                  <CalendarDays className="h-4 w-4" />
                  {entry.date}
                </div>
                <h2 className="mt-3 text-xl font-semibold text-gray-900 dark:text-white">
                  {getLocalizedChangeText(entry.title, language)}
                </h2>
              </div>

              <div className="flex-1 space-y-4">
                {entry.items.map((item, index) => {
                  const labels = item.paths
                    .map((path) => {
                      if (path === '/changelog') return tNav('changelog')
                      const tool = getToolByPath(path)
                      return tool ? getToolTitle(tool, tNav) : path
                    })
                    .filter(Boolean)

                  const extraLabels = item.extraLabels?.map((text) => getLocalizedChangeText(text, language)) ?? []

                  return (
                    <article
                      key={`${entry.date}-${index}`}
                      className="rounded-2xl border border-gray-200 bg-gray-50/80 p-5 dark:border-gray-700 dark:bg-gray-900/50"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="max-w-3xl">
                          <div className="flex flex-wrap items-center gap-2">
                            <StatusBadge
                              level={item.type === 'added' ? 'success' : 'info'}
                              label={item.type === 'added' ? t('itemType.added') : t('itemType.updated')}
                            />
                          </div>
                          <p className="mt-3 text-sm leading-6 text-gray-700 dark:text-gray-200">
                            {getLocalizedChangeText(item.summary, language)}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {[...labels, ...extraLabels].map((label) => (
                          <ItemPill key={label} label={label} />
                        ))}
                      </div>
                    </article>
                  )
                })}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
