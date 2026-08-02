import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FolderTree } from 'lucide-react'
import { CopyButton, PageHero } from '@toolbox/ui-kit'

const TEMPLATES: Record<string, Record<string, string[]>> = {
  'React + Vite': {
    base: [
      'my-app/',
      '├── public/',
      '│   └── favicon.ico',
      '├── src/',
      '│   ├── assets/',
      '│   ├── components/',
      '│   ├── hooks/',
      '│   ├── pages/',
      '│   ├── utils/',
      '│   ├── App.tsx',
      '│   └── main.tsx',
      '├── index.html',
      '├── package.json',
      '├── tsconfig.json',
      '└── vite.config.ts',
    ],
    'React Router': [
      '│   ├── router/',
      '│   │   └── index.tsx',
    ],
    'Tailwind CSS': [
      '├── tailwind.config.js',
      '├── postcss.config.js',
    ],
    'State (Zustand)': [
      '│   ├── stores/',
      '│   │   └── useAppStore.ts',
    ],
    'API Layer': [
      '│   ├── api/',
      '│   │   ├── client.ts',
      '│   │   └── endpoints.ts',
    ],
    'i18n': [
      '│   ├── locales/',
      '│   │   ├── zh.json',
      '│   │   └── en.json',
      '│   └── i18n.ts',
    ],
    '测试 (Vitest)': [
      '├── __tests__/',
      '│   └── App.test.tsx',
      '├── vitest.config.ts',
    ],
  },
  'Next.js': {
    base: [
      'my-app/',
      '├── app/',
      '│   ├── layout.tsx',
      '│   ├── page.tsx',
      '│   └── globals.css',
      '├── components/',
      '├── lib/',
      '├── public/',
      '├── next.config.js',
      '├── package.json',
      '└── tsconfig.json',
    ],
    'API Routes': [
      '│   ├── api/',
      '│   │   └── route.ts',
    ],
    'Auth (NextAuth)': [
      '│   ├── api/auth/',
      '│   │   └── [...nextauth]/route.ts',
      '├── auth.ts',
    ],
    'Prisma (DB)': [
      '├── prisma/',
      '│   └── schema.prisma',
      '├── lib/db.ts',
    ],
    'Tailwind CSS': [
      '├── tailwind.config.ts',
    ],
  },
  'Node.js + Express': {
    base: [
      'my-server/',
      '├── src/',
      '│   ├── controllers/',
      '│   ├── middleware/',
      '│   ├── models/',
      '│   ├── routes/',
      '│   ├── services/',
      '│   ├── utils/',
      '│   └── app.ts',
      '├── tests/',
      '├── .env.example',
      '├── package.json',
      '└── tsconfig.json',
    ],
    'MongoDB (Mongoose)': [
      '│   ├── models/User.ts',
      '│   └── config/db.ts',
    ],
    'JWT Auth': [
      '│   ├── middleware/auth.ts',
      '│   └── utils/jwt.ts',
    ],
    'Docker': [
      '├── Dockerfile',
      '├── docker-compose.yml',
      '└── .dockerignore',
    ],
    '日志 (Winston)': [
      '│   └── utils/logger.ts',
    ],
  },
  'Python + FastAPI': {
    base: [
      'my-api/',
      '├── app/',
      '│   ├── api/',
      '│   │   └── v1/',
      '│   ├── core/',
      '│   │   └── config.py',
      '│   ├── models/',
      '│   ├── schemas/',
      '│   ├── services/',
      '│   └── main.py',
      '├── tests/',
      '├── requirements.txt',
      '├── .env.example',
      '└── Dockerfile',
    ],
    'SQLAlchemy (DB)': [
      '│   ├── db/',
      '│   │   ├── base.py',
      '│   │   └── session.py',
    ],
    'JWT Auth': [
      '│   ├── core/security.py',
      '│   └── api/v1/auth.py',
    ],
    'Celery (任务队列)': [
      '│   └── worker.py',
      '├── celery_app.py',
    ],
  },
  'Monorepo (pnpm)': {
    base: [
      'monorepo/',
      '├── apps/',
      '│   └── web/',
      '├── packages/',
      '│   ├── ui/',
      '│   └── utils/',
      '├── pnpm-workspace.yaml',
      '├── package.json',
      '└── turbo.json',
    ],
    'Turborepo': [
      '├── turbo.json',
      '└── .turbo/',
    ],
    'Shared Types': [
      '├── packages/types/',
      '│   ├── src/index.ts',
      '│   └── package.json',
    ],
  },
}

export default function ProjectScaffold() {
  const { t } = useTranslation('toolProjectScaffold')
  const [framework, setFramework] = useState('React + Vite')
  const [selected, setSelected] = useState<string[]>([])

  const tpl = TEMPLATES[framework]
  const features = Object.keys(tpl).filter(k => k !== 'base')

  const toggleFeature = (f: string) =>
    setSelected(prev => prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f])

  const tree = [
    ...tpl.base,
    ...selected.flatMap(f => tpl[f] || []),
  ]

  const treeText = tree.join('\n')


  const download = () => {
    const blob = new Blob([treeText], { type: 'text/plain' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'project-structure.txt'
    a.click()
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <PageHero title={t('title')} description={t('description')} icon={FolderTree} />
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">

        {/* 框架选择 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-3">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">{t('framework')}</h2>
          <div className="flex gap-2 flex-wrap">
            {Object.keys(TEMPLATES).map(fw => (
              <button key={fw} onClick={() => { setFramework(fw); setSelected([]) }}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  framework === fw ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
                }`}>{fw}</button>
            ))}
          </div>
        </div>

        {/* 功能模块 */}
        {features.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-3">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">{t('features')}</h2>
            <div className="flex gap-2 flex-wrap">
              {features.map(f => (
                <button key={f} onClick={() => toggleFeature(f)}
                  className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                    selected.includes(f) ? 'bg-green-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
                  }`}>{f}</button>
              ))}
            </div>
          </div>
        )}

        {/* 目录树预览 */}
        <div className="bg-gray-900 dark:bg-gray-950 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 border-b border-gray-700">
            <span className="text-xs text-gray-400 font-mono">{t('preview')}</span>
            <div className="flex gap-2">
              <CopyButton
                variant="button"
                size="sm"
                value={treeText}
                label={t('copy')}
                copiedLabel={t('copied')}
                className="!bg-gray-700 hover:!bg-gray-600 !text-gray-200"
              />
              <button onClick={download}
                className="px-3 py-1 text-xs bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg">{t('download')}</button>
            </div>
          </div>
          <pre className="p-4 text-sm text-green-400 font-mono overflow-x-auto whitespace-pre leading-relaxed">{treeText}</pre>
        </div>
      </div>
    </div>
  )
}
