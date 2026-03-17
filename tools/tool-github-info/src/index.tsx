import React, { useMemo, useState } from 'react'
import { Github, LockKeyhole, FolderGit2, UserRound } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import {
  Button,
  Card,
  DataTable,
  Input,
  NoticeCard,
  PageHero,
  PropertyGrid,
} from '@toolbox/ui-kit'

interface GithubUser {
  login: string
  name: string | null
  avatar_url: string
  html_url: string
  company: string | null
  location: string | null
  email: string | null
  bio: string | null
  followers: number
  following: number
  public_repos: number
  type: string
  created_at: string
  updated_at: string
}

interface GithubRepo {
  id: number
  full_name: string
  html_url: string
  private: boolean
  visibility?: string
  description: string | null
  language: string | null
  stargazers_count: number
  forks_count: number
  updated_at: string
}

interface GithubPayload {
  user: GithubUser
  repos: GithubRepo[]
  fetchedAt: string
}

async function fetchGithubInfo(token: string) {
  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  }

  const [userResponse, reposResponse] = await Promise.all([
    fetch('https://api.github.com/user', { headers }),
    fetch('https://api.github.com/user/repos?sort=updated&per_page=30&type=all', { headers }),
  ])

  if (!userResponse.ok) {
    const errorText = await userResponse.text()
    throw new Error(errorText || `GitHub API ${userResponse.status}`)
  }

  const user = (await userResponse.json()) as GithubUser
  const repos = reposResponse.ok ? ((await reposResponse.json()) as GithubRepo[]) : []

  return {
    user,
    repos,
    fetchedAt: new Date().toISOString(),
  } satisfies GithubPayload
}

function ResultSwitch({
  active,
  onChange,
  userLabel,
  reposLabel,
}: {
  active: 'user' | 'repos'
  onChange: (tab: 'user' | 'repos') => void
  userLabel: string
  reposLabel: string
}) {
  const base = 'inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors'
  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => onChange('user')}
        className={`${base} ${active === 'user' ? 'bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900' : 'bg-white text-gray-600 dark:bg-gray-800 dark:text-gray-300'}`}
      >
        <UserRound className="h-4 w-4" />
        {userLabel}
      </button>
      <button
        type="button"
        onClick={() => onChange('repos')}
        className={`${base} ${active === 'repos' ? 'bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900' : 'bg-white text-gray-600 dark:bg-gray-800 dark:text-gray-300'}`}
      >
        <FolderGit2 className="h-4 w-4" />
        {reposLabel}
      </button>
    </div>
  )
}

export default function GithubInfo() {
  const { t } = useTranslation('toolGithubInfo')
  const [token, setToken] = useState('')
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'user' | 'repos'>('user')
  const [payload, setPayload] = useState<GithubPayload | null>(null)
  const [error, setError] = useState<string | null>(null)

  const notes = useMemo(() => t('notes', { returnObjects: true }) as string[], [t])

  const handleLoad = async () => {
    if (!token.trim()) return
    setLoading(true)
    setError(null)
    try {
      const next = await fetchGithubInfo(token.trim())
      setPayload(next)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Request failed'
      setError(`${t('result.errorPrefix')}: ${message}`)
      setPayload(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="relative overflow-hidden border-slate-200/80 bg-gradient-to-br from-slate-100 via-white to-zinc-100 dark:border-slate-700/80 dark:from-slate-950 dark:via-slate-900 dark:to-zinc-950/40">
        <div className="relative py-2">
          <PageHero icon={Github} title={t('title')} description={t('description')} />
        </div>
      </Card>

      <Card className="space-y-4">
        <label className="space-y-2">
          <div className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('form.token')}</div>
          <Input
            type="password"
            autoComplete="off"
            value={token}
            placeholder={t('form.placeholder')}
            onChange={(event) => setToken(event.target.value)}
          />
        </label>

        <NoticeCard
          tone="warning"
          icon={LockKeyhole}
          title={t('form.hint')}
        />

        <div className="flex justify-end">
          <Button onClick={handleLoad} disabled={loading || !token.trim()}>
            {loading ? t('form.submitting') : t('form.submit')}
          </Button>
        </div>
      </Card>

      {error ? <NoticeCard tone="danger" title={error} /> : null}

      {!payload && !error ? (
        <Card>
          <div className="py-10 text-center text-sm text-gray-500 dark:text-gray-400">{t('result.empty')}</div>
        </Card>
      ) : null}

      {payload ? (
        <Card className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <ResultSwitch
              active={activeTab}
              onChange={setActiveTab}
              userLabel={t('tabs.user')}
              reposLabel={t('tabs.repos')}
            />
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {t('result.updated')}: {new Date(payload.fetchedAt).toLocaleString()}
            </div>
          </div>

          {activeTab === 'user' ? (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center gap-4">
                <img
                  src={payload.user.avatar_url}
                  alt={payload.user.login}
                  className="h-20 w-20 rounded-2xl border border-gray-200 object-cover dark:border-gray-700"
                />
                <div>
                  <div className="text-xl font-semibold text-gray-900 dark:text-gray-100">{payload.user.login}</div>
                  <a
                    href={payload.user.html_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
                  >
                    {payload.user.html_url}
                  </a>
                </div>
              </div>

              <PropertyGrid
                items={[
                  { label: t('result.fields.login'), value: payload.user.login, tone: 'primary' },
                  { label: t('result.fields.name'), value: payload.user.name || '—' },
                  { label: t('result.fields.company'), value: payload.user.company || '—' },
                  { label: t('result.fields.location'), value: payload.user.location || '—' },
                  { label: t('result.fields.email'), value: payload.user.email || '—' },
                  { label: t('result.fields.followers'), value: payload.user.followers },
                  { label: t('result.fields.following'), value: payload.user.following },
                  { label: t('result.fields.publicRepos'), value: payload.user.public_repos },
                  { label: t('result.fields.type'), value: payload.user.type },
                  { label: t('result.fields.createdAt'), value: new Date(payload.user.created_at).toLocaleString() },
                  { label: t('result.fields.updatedAt'), value: new Date(payload.user.updated_at).toLocaleString() },
                  { label: t('result.fields.bio'), value: payload.user.bio || '—' },
                ]}
              />
            </div>
          ) : (
            <div className="space-y-4">
              <PropertyGrid
                items={[
                  { label: t('result.repoCount'), value: payload.repos.length, tone: 'primary' },
                ]}
                className="xl:grid-cols-1"
              />

              <DataTable<GithubRepo>
                rows={payload.repos}
                emptyText={t('result.repoEmpty')}
                rowKey={(repo) => String(repo.id)}
                columns={[
                  {
                    key: 'name',
                    header: t('result.reposTitle'),
                    cell: (repo) => (
                      <div className="space-y-1">
                        <a
                          href={repo.html_url}
                          target="_blank"
                          rel="noreferrer"
                          className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
                        >
                          {repo.full_name}
                        </a>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{repo.description || '—'}</div>
                      </div>
                    ),
                  },
                  {
                    key: 'visibility',
                    header: t('result.fields.visibility'),
                    cell: (repo) => (repo.private ? t('result.private') : (repo.visibility || t('result.public'))),
                  },
                  {
                    key: 'language',
                    header: t('result.fields.language'),
                    cell: (repo) => repo.language || '—',
                  },
                  {
                    key: 'stars',
                    header: t('result.fields.stars'),
                    cell: (repo) => repo.stargazers_count,
                  },
                  {
                    key: 'forks',
                    header: t('result.fields.forks'),
                    cell: (repo) => repo.forks_count,
                  },
                  {
                    key: 'updated',
                    header: t('result.fields.updated'),
                    cell: (repo) => new Date(repo.updated_at).toLocaleString(),
                  },
                ]}
              />
            </div>
          )}
        </Card>
      ) : null}

      <Card className="space-y-3">
        <div className="text-sm font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">
          {t('notesTitle')}
        </div>
        <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
          {notes.map((item) => (
            <li key={item} className="rounded-xl bg-gray-50 px-3 py-2 dark:bg-gray-900/50">
              {item}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  )
}
