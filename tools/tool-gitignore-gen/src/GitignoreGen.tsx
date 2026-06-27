import React, { useMemo, useState } from 'react'
import {
  Button,
  Card,
  Input,
  NoticeCard,
  PageHero,
  ParticlesBackground,
  TextArea,
  cn,
} from '@toolbox/ui-kit'
import { useTranslation } from 'react-i18next'
import { Check, Copy, Download, FolderGit2 } from 'lucide-react'
import {
  TEMPLATES,
  TEMPLATE_GROUPS,
  buildGitignore,
  type GitignoreTemplate,
} from './templates'

const GitignoreGen: React.FC = () => {
  const { t } = useTranslation('toolGitignoreGen')
  const [selected, setSelected] = useState<string[]>(['node', 'macos'])
  const [search, setSearch] = useState('')
  const [copied, setCopied] = useState(false)

  const filtered = useMemo<GitignoreTemplate[]>(() => {
    const q = search.trim().toLowerCase()
    if (!q) return TEMPLATES
    return TEMPLATES.filter(
      (tpl) =>
        tpl.name.toLowerCase().includes(q) ||
        t(`groups.${tpl.group}`).toLowerCase().includes(q),
    )
  }, [search, t])

  const grouped = useMemo(
    () =>
      TEMPLATE_GROUPS.map((group) => ({
        group,
        items: filtered.filter((tpl) => tpl.group === group),
      })).filter((g) => g.items.length > 0),
    [filtered],
  )

  const output = useMemo(() => buildGitignore(selected), [selected])
  const lineCount = useMemo(
    () => output.split('\n').filter((l) => l && !l.startsWith('#')).length,
    [output],
  )

  const toggle = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )
  }

  const onCopy = async () => {
    if (!output) return
    try {
      await navigator.clipboard.writeText(output)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1200)
    } catch {
      /* ignore */
    }
  }

  const onDownload = () => {
    if (!output) return
    const blob = new Blob([`${output}\n`], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = '.gitignore'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="relative min-h-[60vh]">
      <ParticlesBackground preset="minimal" className="absolute inset-0" />
      <div className="relative z-10 space-y-6">
        <PageHero title={t('title')} description={t('description')} />

        <NoticeCard
          tone="info"
          title={t('notice.title')}
          description={t('notice.body')}
          icon={FolderGit2}
        />

        <Card>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {t('templates.heading')}
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {t('templates.selectedCount', { count: selected.length })}
              </span>
              {selected.length > 0 && (
                <Button variant="ghost" size="sm" onClick={() => setSelected([])}>
                  {t('templates.clear')}
                </Button>
              )}
            </div>
          </div>

          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('templates.searchPlaceholder')}
            className="mb-4"
          />

          {grouped.length === 0 ? (
            <p className="py-6 text-center text-sm text-gray-500 dark:text-gray-400">
              {t('templates.noResults')}
            </p>
          ) : (
            <div className="space-y-4">
              {grouped.map(({ group, items }) => (
                <div key={group}>
                  <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    {t(`groups.${group}`)}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {items.map((tpl) => {
                      const active = selected.includes(tpl.id)
                      return (
                        <button
                          key={tpl.id}
                          type="button"
                          onClick={() => toggle(tpl.id)}
                          aria-pressed={active}
                          className={cn(
                            'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition',
                            active
                              ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:border-indigo-500 dark:bg-indigo-900/30 dark:text-indigo-300'
                              : 'border-gray-300 text-gray-700 hover:border-indigo-300 dark:border-gray-600 dark:text-gray-200 dark:hover:border-indigo-700',
                          )}
                        >
                          {active && <Check className="h-3.5 w-3.5" />}
                          {tpl.name}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {t('output.heading')}
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t('output.filename')}
                {output && ` · ${t('output.lineCount', { count: lineCount })}`}
              </p>
            </div>
            {output && (
              <div className="flex items-center gap-2">
                <Button variant="secondary" size="sm" onClick={() => void onCopy()}>
                  <span className="inline-flex items-center gap-1.5">
                    {copied ? (
                      <Check className="h-3.5 w-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                    {copied ? t('output.copied') : t('output.copy')}
                  </span>
                </Button>
                <Button variant="primary" size="sm" onClick={onDownload}>
                  <span className="inline-flex items-center gap-1.5">
                    <Download className="h-3.5 w-3.5" />
                    {t('output.download')}
                  </span>
                </Button>
              </div>
            )}
          </div>

          {output ? (
            <TextArea
              value={output}
              readOnly
              rows={16}
              spellCheck={false}
              className="!font-mono !text-sm"
            />
          ) : (
            <NoticeCard
              tone="warning"
              title={t('output.empty.title')}
              description={t('output.empty.body')}
            />
          )}
        </Card>
      </div>
    </div>
  )
}

export default GitignoreGen
