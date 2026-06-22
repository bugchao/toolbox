import React, { useMemo, useState } from 'react'
import { Card, Input, NoticeCard, PageHero, ParticlesBackground, TextArea } from '@toolbox/ui-kit'
import { useTranslation } from 'react-i18next'
import { GitCompareArrows } from 'lucide-react'
import { compareStrings, diff, inc, isValid, maxSatisfying, parse, satisfies, sortVersions } from './lib/semver'

const Semver: React.FC = () => {
  const { t } = useTranslation('toolSemver')

  const [single, setSingle] = useState('1.2.3-rc.1+build.5')
  const [cmpA, setCmpA] = useState('1.2.0')
  const [cmpB, setCmpB] = useState('1.10.0')
  const [version, setVersion] = useState('1.4.2')
  const [range, setRange] = useState('^1.0.0')
  const [list, setList] = useState('1.0.0\n1.2.0\n1.9.0\n2.0.0\nbad\n1.0.0-rc.1')
  const [listRange, setListRange] = useState('^1.0.0')

  const parsed = useMemo(() => parse(single), [single])

  const cmpResult = useMemo(() => {
    if (!isValid(cmpA) || !isValid(cmpB)) return null
    const r = compareStrings(cmpA, cmpB)
    return { r, sym: r < 0 ? '<' : r > 0 ? '>' : '=', d: diff(cmpA, cmpB) }
  }, [cmpA, cmpB])

  const sat = useMemo(() => (isValid(version) ? satisfies(version, range) : null), [version, range])

  const lines = useMemo(() => list.split(/\r?\n/).map((s) => s.trim()).filter(Boolean), [list])
  const sorted = useMemo(() => sortVersions(lines, true), [lines])
  const best = useMemo(() => maxSatisfying(lines, listRange), [lines, listRange])

  return (
    <div className="relative min-h-[60vh]">
      <ParticlesBackground preset="minimal" className="absolute inset-0" />
      <div className="relative z-10 space-y-6">
        <PageHero title={t('title')} description={t('description')} />

        <NoticeCard tone="info" title={t('notice.title')} description={t('notice.body')} icon={GitCompareArrows} />

        <Card>
          <h2 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-200">{t('parse.heading')}</h2>
          <Input value={single} onChange={(e) => setSingle(e.target.value)} spellCheck={false} className="!font-mono" />
          {parsed ? (
            <div className="mt-2 flex flex-wrap gap-2 text-xs">
              {([['major', parsed.major], ['minor', parsed.minor], ['patch', parsed.patch]] as const).map(([k, v]) => (
                <span key={k} className="rounded bg-gray-100 px-2 py-1 dark:bg-gray-800">
                  <span className="text-gray-400">{k}</span> <b className="font-mono">{v}</b>
                </span>
              ))}
              {parsed.prerelease.length > 0 && (
                <span className="rounded bg-amber-100 px-2 py-1 dark:bg-amber-900/30"><span className="text-amber-600 dark:text-amber-400">prerelease</span> <b className="font-mono">{parsed.prerelease.join('.')}</b></span>
              )}
              {parsed.build.length > 0 && (
                <span className="rounded bg-sky-100 px-2 py-1 dark:bg-sky-900/30"><span className="text-sky-600 dark:text-sky-400">build</span> <b className="font-mono">{parsed.build.join('.')}</b></span>
              )}
              <span className="rounded bg-gray-100 px-2 py-1 dark:bg-gray-800 text-gray-400">{t('parse.next')}: <b className="font-mono text-gray-700 dark:text-gray-200">{inc(single, 'major')} / {inc(single, 'minor')} / {inc(single, 'patch')}</b></span>
            </div>
          ) : (
            <p className="mt-2 text-xs text-rose-600 dark:text-rose-300">{t('parse.invalid')}</p>
          )}
        </Card>

        <div className="grid gap-3 md:grid-cols-2">
          <Card>
            <h2 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-200">{t('compare.heading')}</h2>
            <div className="flex items-center gap-2">
              <Input value={cmpA} onChange={(e) => setCmpA(e.target.value)} spellCheck={false} className="!font-mono" />
              <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">{cmpResult?.sym ?? '?'}</span>
              <Input value={cmpB} onChange={(e) => setCmpB(e.target.value)} spellCheck={false} className="!font-mono" />
            </div>
            {cmpResult ? (
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                {cmpResult.r === 0 ? t('compare.equal') : t('compare.result', { a: cmpResult.r < 0 ? cmpA : cmpB, b: cmpResult.r < 0 ? cmpB : cmpA })}
                {cmpResult.d && cmpResult.d !== 'none' && <> · <span className="font-mono">{cmpResult.d}</span></>}
              </p>
            ) : (
              <p className="mt-2 text-xs text-rose-500">{t('parse.invalid')}</p>
            )}
          </Card>

          <Card>
            <h2 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-200">{t('satisfies.heading')}</h2>
            <div className="space-y-2">
              <Input value={version} onChange={(e) => setVersion(e.target.value)} placeholder="1.4.2" spellCheck={false} className="!font-mono" />
              <Input value={range} onChange={(e) => setRange(e.target.value)} placeholder="^1.0.0 || >=2.1.0 <3.0.0" spellCheck={false} className="!font-mono" />
            </div>
            {sat !== null && (
              <div className={['mt-2 inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium', sat ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300'].join(' ')}>
                {sat ? t('satisfies.yes') : t('satisfies.no')}
              </div>
            )}
          </Card>
        </div>

        <Card>
          <h2 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-200">{t('sort.heading')}</h2>
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs text-gray-500 dark:text-gray-400">{t('sort.input')}</label>
              <TextArea value={list} onChange={(e) => setList(e.target.value)} rows={8} spellCheck={false} className="!font-mono !text-xs" />
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-500 dark:text-gray-400">{t('sort.output')}</label>
              <ol className="rounded-md border border-gray-200 p-2 text-xs dark:border-gray-700">
                {sorted.map((v) => (
                  <li key={v} className="font-mono text-gray-800 dark:text-gray-100">{v}</li>
                ))}
              </ol>
              <div className="mt-2 flex items-center gap-2 text-xs">
                <span className="text-gray-500 dark:text-gray-400">maxSatisfying</span>
                <Input value={listRange} onChange={(e) => setListRange(e.target.value)} spellCheck={false} className="!w-28 !font-mono" />
                <span className="font-mono font-semibold text-indigo-700 dark:text-indigo-300">{best ?? '—'}</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default Semver
