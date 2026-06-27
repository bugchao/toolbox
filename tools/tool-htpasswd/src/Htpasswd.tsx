import React, { useState } from 'react'
import { Button, Card, Input, NoticeCard, PageHero, ParticlesBackground, Switch } from '@toolbox/ui-kit'
import { useTranslation } from 'react-i18next'
import { Check, ClipboardCopy, Download, ShieldCheck, Trash2 } from 'lucide-react'
import {
  buildHtpasswdFile,
  computeHash,
  formatEntry,
  isPasswordValid,
  validateUsername,
  type HtpasswdAlgorithm,
  type HtpasswdEntry,
} from './lib/htpasswd'
import { DEFAULT_BCRYPT_COST, MAX_BCRYPT_COST, MIN_BCRYPT_COST } from './lib/bcrypt'

const ALGORITHMS: HtpasswdAlgorithm[] = ['bcrypt', 'apr1', 'sha']

const Htpasswd: React.FC = () => {
  const { t } = useTranslation('toolHtpasswd')

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [algorithm, setAlgorithm] = useState<HtpasswdAlgorithm>('bcrypt')
  const [cost, setCost] = useState(DEFAULT_BCRYPT_COST)

  const [entry, setEntry] = useState<HtpasswdEntry | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [copiedEntry, setCopiedEntry] = useState(false)
  const [copiedAll, setCopiedAll] = useState(false)

  const [entries, setEntries] = useState<HtpasswdEntry[]>([])

  const algoHint = t(`algo.${algorithm}Hint`)

  const validate = (): boolean => {
    const u = validateUsername(username.trim())
    if (!u.ok) {
      const map = { empty: 'usernameEmpty', colon: 'usernameColon', whitespace: 'usernameWhitespace' } as const
      setError(t(`error.${map[u.reason]}`))
      return false
    }
    if (!isPasswordValid(password)) {
      setError(t('error.passwordEmpty'))
      return false
    }
    setError(null)
    return true
  }

  const onGenerate = async (): Promise<HtpasswdEntry | null> => {
    if (!validate()) return null
    setBusy(true)
    try {
      const hash = await computeHash(algorithm, password, { cost })
      const result: HtpasswdEntry = { username: username.trim(), hash, algorithm }
      setEntry(result)
      return result
    } catch {
      setError(t('error.generic'))
      return null
    } finally {
      setBusy(false)
    }
  }

  const onAdd = async () => {
    const result = entry && entry.username === username.trim() ? entry : await onGenerate()
    if (!result) return
    setEntries((prev) => {
      const withoutDup = prev.filter((e) => e.username !== result.username)
      return [...withoutDup, result]
    })
  }

  const copy = async (text: string, mark: (v: boolean) => void) => {
    try {
      await navigator.clipboard.writeText(text)
      mark(true)
      window.setTimeout(() => mark(false), 1200)
    } catch {
      /* ignore */
    }
  }

  const fileContent = buildHtpasswdFile(entries)

  const onDownload = () => {
    const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = '.htpasswd'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const labelCls = 'mb-1 block text-xs font-medium text-gray-700 dark:text-gray-200'

  return (
    <div className="relative min-h-[60vh]">
      <ParticlesBackground preset="minimal" className="absolute inset-0" />
      <div className="relative z-10 space-y-6">
        <PageHero title={t('title')} description={t('description')} />

        <NoticeCard tone="success" title={t('notice.title')} description={t('notice.body')} icon={ShieldCheck} />

        <Card>
          <h2 className="mb-3 text-lg font-semibold text-gray-900 dark:text-gray-100">{t('form.heading')}</h2>

          <div className="grid gap-4 lg:grid-cols-2">
            <div>
              <span className={labelCls}>{t('form.username')}</span>
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={t('form.usernamePlaceholder')}
                spellCheck={false}
                autoComplete="off"
              />
            </div>

            <div>
              <div className="mb-1 flex items-center justify-between">
                <span className="text-xs font-medium text-gray-700 dark:text-gray-200">{t('form.password')}</span>
                <Switch checked={showPassword} onChange={setShowPassword} label={t('form.showPassword')} />
              </div>
              <Input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('form.passwordPlaceholder')}
                spellCheck={false}
                autoComplete="off"
              />
            </div>
          </div>

          <div className="mt-4">
            <span className={labelCls}>{t('form.algorithm')}</span>
            <div className="inline-flex flex-wrap gap-0.5 rounded-md border border-gray-200 p-0.5 dark:border-gray-700">
              {ALGORITHMS.map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setAlgorithm(a)}
                  className={[
                    'rounded px-3 py-1 text-xs font-medium transition',
                    algorithm === a
                      ? 'bg-indigo-500 text-white shadow-sm'
                      : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800',
                  ].join(' ')}
                >
                  {t(`algo.${a}`)}
                </button>
              ))}
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{algoHint}</p>
          </div>

          {algorithm === 'bcrypt' && (
            <div className="mt-4 max-w-xs">
              <span className={labelCls}>
                {t('form.cost')} <span className="font-mono text-gray-500">({cost})</span>
              </span>
              <input
                type="range"
                min={MIN_BCRYPT_COST}
                max={MAX_BCRYPT_COST}
                value={cost}
                onChange={(e) => setCost(Number(e.target.value))}
                className="w-full accent-indigo-500"
              />
            </div>
          )}

          {error && (
            <p className="mt-3 text-sm text-rose-600 dark:text-rose-300">{error}</p>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            <Button onClick={onGenerate} disabled={busy}>
              {t('form.generate')}
            </Button>
            <Button variant="secondary" onClick={onAdd} disabled={busy}>
              {t('form.add')}
            </Button>
          </div>
        </Card>

        <Card>
          <h2 className="mb-3 text-lg font-semibold text-gray-900 dark:text-gray-100">{t('result.heading')}</h2>
          {entry ? (
            <div className="flex items-center gap-2">
              <code className="flex-1 overflow-x-auto rounded-md bg-gray-100 px-3 py-2 font-mono text-xs text-gray-800 dark:bg-gray-800 dark:text-gray-100">
                {formatEntry(entry.username, entry.hash)}
              </code>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => copy(formatEntry(entry.username, entry.hash), setCopiedEntry)}
              >
                {copiedEntry ? <Check className="h-4 w-4" /> : <ClipboardCopy className="h-4 w-4" />}
                <span className="ml-1">{copiedEntry ? t('result.copied') : t('result.copy')}</span>
              </Button>
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('result.empty')}</p>
          )}
        </Card>

        <Card>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('list.heading')}</h2>
            {entries.length > 0 && (
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="secondary" onClick={() => copy(fileContent, setCopiedAll)}>
                  {copiedAll ? <Check className="h-4 w-4" /> : <ClipboardCopy className="h-4 w-4" />}
                  <span className="ml-1">{copiedAll ? t('result.copied') : t('list.copyAll')}</span>
                </Button>
                <Button size="sm" onClick={onDownload}>
                  <Download className="h-4 w-4" />
                  <span className="ml-1">{t('list.download')}</span>
                </Button>
                <Button size="sm" variant="danger" onClick={() => setEntries([])}>
                  {t('list.clear')}
                </Button>
              </div>
            )}
          </div>

          {entries.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('list.empty')}</p>
          ) : (
            <ul className="space-y-2">
              {entries.map((e) => (
                <li key={e.username} className="flex items-center gap-2">
                  <code className="flex-1 overflow-x-auto rounded-md bg-gray-100 px-3 py-2 font-mono text-xs text-gray-800 dark:bg-gray-800 dark:text-gray-100">
                    {formatEntry(e.username, e.hash)}
                  </code>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setEntries((prev) => prev.filter((x) => x.username !== e.username))}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="ml-1">{t('list.remove')}</span>
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  )
}

export default Htpasswd
