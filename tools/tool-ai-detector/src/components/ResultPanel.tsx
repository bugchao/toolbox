import React from 'react'
import { useTranslation } from 'react-i18next'
import { ProgressRing } from '@toolbox/ui-kit'
import type { ScoreResult, Verdict } from '../lib/score'
import type { SuspiciousSentence } from '../lib/textFeatures'

type Tone = { wrap: string; chip: string; ringColor: string }

const TONE: Record<Verdict, Tone> = {
  human: {
    wrap: 'border-emerald-200 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-900/20',
    chip: 'bg-emerald-600 text-white',
    ringColor: '#10b981',
  },
  suspect: {
    wrap: 'border-amber-200 bg-amber-50 dark:border-amber-700 dark:bg-amber-900/20',
    chip: 'bg-amber-500 text-white',
    ringColor: '#f59e0b',
  },
  ai: {
    wrap: 'border-rose-200 bg-rose-50 dark:border-rose-700 dark:bg-rose-900/20',
    chip: 'bg-rose-600 text-white',
    ringColor: '#f43f5e',
  },
}

export type ResultPanelProps = {
  result: ScoreResult
  suspicious?: SuspiciousSentence[]
}

const ResultPanel: React.FC<ResultPanelProps> = ({ result, suspicious }) => {
  const { t } = useTranslation('toolAiDetector')
  const tone = TONE[result.verdict]

  return (
    <div className={`space-y-4 rounded-2xl border p-5 ${tone.wrap}`}>
      <div className="flex items-center gap-5">
        <ProgressRing
          value={result.total}
          size={96}
          strokeWidth={10}
          color={tone.ringColor}
        />
        <div>
          <div className="text-sm text-gray-600 dark:text-gray-300">
            {t('result.aiLikelihood')}
          </div>
          <div className="text-3xl font-extrabold text-gray-900 dark:text-gray-100 tabular-nums">
            {result.total}
            <span className="ml-1 text-base font-normal text-gray-500 dark:text-gray-400">
              / 100
            </span>
          </div>
          <span
            className={`mt-2 inline-block rounded-full px-3 py-0.5 text-xs font-semibold ${tone.chip}`}
          >
            {t(`verdict.${result.verdict}`)}
          </span>
        </div>
      </div>

      <div>
        <h4 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-200">
          {t('result.breakdown')}
        </h4>
        <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500 dark:bg-gray-800 dark:text-gray-400">
              <tr>
                <th className="px-3 py-2">{t('result.feature')}</th>
                <th className="px-3 py-2">{t('result.value')}</th>
                <th className="px-3 py-2 text-right">{t('result.contribution')}</th>
                <th className="px-3 py-2 text-right">{t('result.weight')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700 bg-white dark:bg-gray-900">
              {result.features.map((f) => (
                <tr key={f.key}>
                  <td className="px-3 py-2 text-gray-700 dark:text-gray-200">{f.rawLabel}</td>
                  <td className="px-3 py-2 font-mono text-xs text-gray-600 dark:text-gray-300">
                    {String(f.value)}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <ContributionCell contribution={f.contribution} />
                  </td>
                  <td className="px-3 py-2 text-right text-xs text-gray-500 dark:text-gray-400">
                    {(f.weight * 100).toFixed(0)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {suspicious && suspicious.length > 0 && (
        <div>
          <h4 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-200">
            {t('result.suspicious')}
          </h4>
          <ul className="space-y-2">
            {suspicious.map((s, i) => (
              <li
                key={i}
                className="flex items-start gap-3 rounded-lg border border-rose-200 bg-rose-50/60 px-3 py-2 text-sm dark:border-rose-800 dark:bg-rose-900/20"
              >
                <span className="mt-0.5 shrink-0 rounded bg-rose-600 px-2 py-0.5 text-xs font-bold text-white">
                  {s.score}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="leading-relaxed text-gray-800 dark:text-gray-100">{s.text}</p>
                  {s.reasons.length > 0 && (
                    <p className="mt-1 text-xs text-rose-700 dark:text-rose-300">
                      {s.reasons.slice(0, 4).map((r) => `“${r}”`).join(' · ')}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

const ContributionCell: React.FC<{ contribution: number }> = ({ contribution }) => {
  const color =
    contribution >= 65
      ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300'
      : contribution < 35
        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
        : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
  return (
    <span className={`inline-block rounded px-2 py-0.5 text-xs font-semibold ${color}`}>
      {contribution}
    </span>
  )
}

export default ResultPanel
