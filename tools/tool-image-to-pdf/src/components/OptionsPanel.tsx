import React from 'react'
import { useTranslation } from 'react-i18next'
import type { MarginKey, Orientation, PaperKey } from '../lib/pageSize'
import type { PerPage } from '../lib/layout'

export type Options = {
  paper: PaperKey
  orientation: Orientation
  margin: MarginKey
  perPage: PerPage
}

export type OptionsPanelProps = {
  options: Options
  onChange: (next: Options) => void
}

const PAPERS: PaperKey[] = ['a4', 'letter', 'legal', 'a3', 'a5', 'fit']
const ORIENTATIONS: Orientation[] = ['portrait', 'landscape']
const MARGINS: MarginKey[] = ['none', 'small', 'medium', 'large']
const PER_PAGES: PerPage[] = [1, 2, 4]

const OptionsPanel: React.FC<OptionsPanelProps> = ({ options, onChange }) => {
  const { t } = useTranslation('toolImageToPdf')

  return (
    <div className="space-y-4">
      <Field label={t('options.paper')}>
        <Select
          value={options.paper}
          onChange={(v) => onChange({ ...options, paper: v as PaperKey })}
          items={PAPERS.map((p) => ({ value: p, label: t(`options.paperOpts.${p}`) }))}
        />
      </Field>
      <Field label={t('options.orientation')}>
        <SegmentGroup
          value={options.orientation}
          onChange={(v) => onChange({ ...options, orientation: v as Orientation })}
          items={ORIENTATIONS.map((o) => ({ value: o, label: t(`options.orientationOpts.${o}`) }))}
        />
      </Field>
      <Field label={t('options.margin')}>
        <SegmentGroup
          value={options.margin}
          onChange={(v) => onChange({ ...options, margin: v as MarginKey })}
          items={MARGINS.map((m) => ({ value: m, label: t(`options.marginOpts.${m}`) }))}
        />
      </Field>
      <Field label={t('options.perPage')}>
        <SegmentGroup
          value={String(options.perPage)}
          onChange={(v) => onChange({ ...options, perPage: Number(v) as PerPage })}
          items={PER_PAGES.map((n) => ({ value: String(n), label: t(`options.perPageOpts.${n}`) }))}
        />
      </Field>
    </div>
  )
}

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div>
    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
      {label}
    </label>
    {children}
  </div>
)

const Select: React.FC<{
  value: string
  onChange: (v: string) => void
  items: { value: string; label: string }[]
}> = ({ value, onChange, items }) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
  >
    {items.map((i) => (
      <option key={i.value} value={i.value}>
        {i.label}
      </option>
    ))}
  </select>
)

const SegmentGroup: React.FC<{
  value: string
  onChange: (v: string) => void
  items: { value: string; label: string }[]
}> = ({ value, onChange, items }) => (
  <div className="inline-flex rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden">
    {items.map((i) => (
      <button
        key={i.value}
        type="button"
        onClick={() => onChange(i.value)}
        className={[
          'px-3 py-1.5 text-sm transition-colors',
          value === i.value
            ? 'bg-indigo-600 text-white'
            : 'bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600',
        ].join(' ')}
      >
        {i.label}
      </button>
    ))}
  </div>
)

export default OptionsPanel
