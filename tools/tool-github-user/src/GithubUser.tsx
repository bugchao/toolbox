import React, { useState } from 'react'
import { Github, Users, FolderGit2, TriangleAlert } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button, Card, DataTable, Input, NoticeCard, PageHero, PropertyGrid } from '@toolbox/ui-kit'

interface UserPayload {
  login: string
  name: string | null
  avatar_url: string
  html_url: string
  bio: string | null
  company: string | null
  location: string | null
  followers: number
  following: number
  public_repos: number
  created_at: string
}

interface Repo {
  id: number
  name: string
  html_url: string
  stargazers_count: number
  forks_count: number
  language: string | null
  updated_at: string
}

export default function GithubUser() {
  const { t } = useTranslation('toolGithubUser')
  const [username, setUsername] = useState('octocat')
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<UserPayload | null>(null)
  const [repos, setRepos] = useState<Repo[]>([])
  const [error, setError] = useState<string | null>(null)

  const handleLookup = async () => {
    const value = username.trim().replace(/^https:\/\/github\.com\//, '').replace(/\/+$/, '')
    if (!value) return
    setLoading(true)
    setError(null)
    try {
      const [userResponse, repoResponse] = await Promise.all([
        fetch(`https://api.github.com/users/${value}`, { headers: { Accept: 'application/vnd.github+json' } }),
        fetch(`https://api.github.com/users/${value}/repos?sort=updated&per_page=8`, { headers: { Accept: 'application/vnd.github+json' } }),
      ])
      const userPayload = await userResponse.json()
      if (!userResponse.ok) throw new Error(userPayload?.message || `GitHub API ${userResponse.status}`)
      const repoPayload = repoResponse.ok ? ((await repoResponse.json()) as Repo[]) : []
      setUser(userPayload as UserPayload)
      setRepos(repoPayload)
    } catch (err) {
      setUser(null)
      setRepos([])
      setError(err instanceof Error ? err.message : t('errorFallback'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <PageHero icon={Github} title={t('title')} description={t('description')} />
      </Card>

      <Card className="space-y-4">
        <label className="space-y-2">
          <div className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('form.label')}</div>
          <Input value={username} onChange={(event) => setUsername(event.target.value)} placeholder={t('form.placeholder')} />
        </label>
        <div className="flex justify-end">
          <Button onClick={handleLookup} disabled={loading || !username.trim()}>
            {loading ? t('form.loading') : t('form.submit')}
          </Button>
        </div>
      </Card>

      {error ? <NoticeCard tone="danger" icon={TriangleAlert} title={error} /> : null}

      {user ? (
        <Card className="space-y-6">
          <div className="flex flex-wrap items-center gap-4">
            <img src={user.avatar_url} alt={user.login} className="h-20 w-20 rounded-2xl border border-gray-200 dark:border-gray-700" />
            <div>
              <div className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{user.name || user.login}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">@{user.login}</div>
              <a href={user.html_url} target="_blank" rel="noreferrer" className="text-sm text-indigo-600 dark:text-indigo-400">
                {user.html_url}
              </a>
            </div>
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-300">{user.bio || '—'}</p>

          <PropertyGrid
            items={[
              { label: t('fields.company'), value: user.company || '—' },
              { label: t('fields.location'), value: user.location || '—' },
              { label: t('fields.joined'), value: new Date(user.created_at).toLocaleDateString() },
              { label: t('fields.repos'), value: user.public_repos, tone: 'primary' },
            ]}
            columns={4}
          />

          <div className="grid gap-4 md:grid-cols-3">
            {[
              { label: t('stats.followers'), value: user.followers, icon: <Users className="h-4 w-4" /> },
              { label: t('stats.following'), value: user.following, icon: <Users className="h-4 w-4" /> },
              { label: t('stats.repositories'), value: user.public_repos, icon: <FolderGit2 className="h-4 w-4" /> },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900/70">
                <div className="mb-2 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  {item.icon}
                  {item.label}
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{item.value}</div>
              </div>
            ))}
          </div>

          <DataTable<Repo>
            data={repos}
            columns={[
              {
                key: 'name',
                header: t('repoColumns.name'),
                render: (repo) => (
                  <a href={repo.html_url} target="_blank" rel="noreferrer" className="text-indigo-600 dark:text-indigo-400">
                    {repo.name}
                  </a>
                ),
              },
              { key: 'language', header: t('repoColumns.language'), render: (repo) => repo.language || '—' },
              { key: 'stargazers_count', header: t('repoColumns.stars') },
              { key: 'forks_count', header: t('repoColumns.forks') },
              { key: 'updated_at', header: t('repoColumns.updated'), render: (repo) => new Date(repo.updated_at).toLocaleDateString() },
            ]}
            emptyText={t('repoColumns.empty')}
          />
        </Card>
      ) : null}
    </div>
  )
}
