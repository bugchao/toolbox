import React, { useState } from 'react'
import { FolderGit2, Star, GitFork, Eye, TriangleAlert } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button, Card, Input, NoticeCard, PageHero, PropertyGrid } from '@toolbox/ui-kit'

interface RepoPayload {
  full_name: string
  description: string | null
  html_url: string
  language: string | null
  stargazers_count: number
  forks_count: number
  watchers_count: number
  open_issues_count: number
  subscribers_count?: number
  default_branch: string
  license?: { name: string } | null
  archived: boolean
  visibility?: string
  updated_at: string
}

export default function GithubRepo() {
  const { t } = useTranslation('toolGithubRepo')
  const [repo, setRepo] = useState('facebook/react')
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<RepoPayload | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleLookup = async () => {
    const value = repo.trim().replace(/^https:\/\/github\.com\//, '').replace(/\/+$/, '')
    if (!value) return
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`https://api.github.com/repos/${value}`, {
        headers: { Accept: 'application/vnd.github+json' },
      })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload?.message || `GitHub API ${response.status}`)
      setData(payload as RepoPayload)
    } catch (err) {
      setData(null)
      setError(err instanceof Error ? err.message : t('errorFallback'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <PageHero icon={FolderGit2} title={t('title')} description={t('description')} />
      </Card>

      <Card className="space-y-4">
        <label className="space-y-2">
          <div className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('form.label')}</div>
          <Input
            value={repo}
            onChange={(event) => setRepo(event.target.value)}
            placeholder={t('form.placeholder')}
          />
        </label>
        <div className="flex justify-end">
          <Button onClick={handleLookup} disabled={loading || !repo.trim()}>
            {loading ? t('form.loading') : t('form.submit')}
          </Button>
        </div>
      </Card>

      {error ? <NoticeCard tone="danger" icon={TriangleAlert} title={error} /> : null}

      {data ? (
        <Card className="space-y-6">
          <div className="space-y-2">
            <div className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{data.full_name}</div>
            <a href={data.html_url} target="_blank" rel="noreferrer" className="text-sm text-indigo-600 dark:text-indigo-400">
              {data.html_url}
            </a>
            <p className="text-sm text-gray-600 dark:text-gray-300">{data.description || '—'}</p>
          </div>

          <PropertyGrid
            items={[
              { label: t('fields.language'), value: data.language || '—', tone: 'primary' },
              { label: t('fields.branch'), value: data.default_branch },
              { label: t('fields.visibility'), value: data.visibility || 'public' },
              { label: t('fields.license'), value: data.license?.name || '—' },
              { label: t('fields.archived'), value: data.archived ? t('yes') : t('no') },
              { label: t('fields.updated'), value: new Date(data.updated_at).toLocaleString() },
            ]}
            columns={3}
          />

          <div className="grid gap-4 md:grid-cols-4">
            {[
              { label: t('stats.stars'), value: data.stargazers_count, icon: <Star className="h-4 w-4" /> },
              { label: t('stats.forks'), value: data.forks_count, icon: <GitFork className="h-4 w-4" /> },
              { label: t('stats.watchers'), value: data.watchers_count, icon: <Eye className="h-4 w-4" /> },
              { label: t('stats.issues'), value: data.open_issues_count, icon: <TriangleAlert className="h-4 w-4" /> },
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
        </Card>
      ) : null}
    </div>
  )
}
