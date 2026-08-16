import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { RefreshCw, ExternalLink } from 'lucide-react'
import { NewsItem } from '../types'

const HotNews: React.FC = () => {
  const { t } = useTranslation('hotNews')
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const categories = [
    { value: 'all', label: t('categoryAll') },
    { value: '科技', label: t('categoryTech') },
    { value: '体育', label: t('categorySports') },
    { value: 'AI', label: 'AI' },
    { value: 'OpenClaw', label: 'OpenClaw' },
    { value: 'MCP', label: 'MCP' },
    { value: '国际', label: t('categoryInternational') },
  ]

  const fetchNews = async () => {
    setLoading(true)
    try {
      // 调用后端API获取新闻数据
      const response = await fetch('/api/news')
      if (response.ok) {
        const data = await response.json()
        setNews(data)
      } else {
        // 模拟数据
        setNews([
          {
            id: '1',
            title: t('mockTitle1'),
            source: t('mockSource1'),
            time: '2026-03-09 10:30',
            url: 'https://openclaw.ai',
            category: 'OpenClaw'
          },
          {
            id: '2',
            title: t('mockTitle2'),
            source: t('mockSource2'),
            time: '2026-03-09 09:15',
            url: '#',
            category: 'MCP'
          },
          {
            id: '3',
            title: t('mockTitle3'),
            source: t('mockSource3'),
            time: '2026-03-09 08:45',
            url: '#',
            category: 'AI'
          },
          {
            id: '4',
            title: t('mockTitle4'),
            source: t('mockSource4'),
            time: '2026-03-09 11:20',
            url: '#',
            category: '科技'
          },
          {
            id: '5',
            title: t('mockTitle5'),
            source: t('mockSource5'),
            time: '2026-03-09 07:30',
            url: '#',
            category: '国际'
          },
        ])
      }
    } catch (err) {
      console.error('获取新闻失败:', err)
      // 使用模拟数据
      setNews([
        {
          id: '1',
          title: t('mockTitle1'),
          source: t('mockSource1'),
          time: '2026-03-09 10:30',
          url: 'https://openclaw.ai',
          category: 'OpenClaw'
        },
        {
          id: '2',
          title: t('mockTitle2'),
          source: t('mockSource2'),
          time: '2026-03-09 09:15',
          url: '#',
          category: 'MCP'
        },
        {
          id: '3',
          title: t('mockTitle3'),
          source: t('mockSource3'),
          time: '2026-03-09 08:45',
          url: '#',
          category: 'AI'
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNews()
  }, [])

  const filteredNews = selectedCategory === 'all' 
    ? news 
    : news.filter(item => item.category === selectedCategory)

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      '科技': 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300',
      '体育': 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
      'AI': 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300',
      'OpenClaw': 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300',
      'MCP': 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300',
      '国际': 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300',
    }
    return colors[category] || 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="card">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-ink">{t('title')}</h1>
          <button
            onClick={fetchNews}
            disabled={loading}
            className="btn btn-primary flex items-center"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            {loading ? t('refreshing') : t('refresh')}
          </button>
        </div>

        {/* 分类标签 */}
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map(category => (
            <button
              key={category.value}
              onClick={() => setSelectedCategory(category.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === category.value
                  ? 'bg-indigo-600 text-white'
                  : 'bg-surface-inset text-ink hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>

        {/* 新闻列表 */}
        <div className="space-y-4">
          {loading ? (
            Array(5).fill(0).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-6 bg-surface-inset rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-surface-inset rounded w-1/4"></div>
              </div>
            ))
          ) : filteredNews.length > 0 ? (
            filteredNews.map(item => (
              <a
                key={item.id}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-4 border border-edge rounded-lg hover:bg-surface-muted transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-ink mb-2 hover:text-indigo-600">
                      {item.title}
                    </h3>
                    <div className="flex items-center text-sm text-ink-muted space-x-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor(item.category)}`}>
                        {item.category}
                      </span>
                      <span>{item.source}</span>
                      <span>{item.time}</span>
                    </div>
                  </div>
                  <ExternalLink className="w-5 h-5 text-ink-subtle ml-4 flex-shrink-0" />
                </div>
              </a>
            ))
          ) : (
            <div className="text-center py-12 text-ink-muted">
              {t('emptyState')}
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <h2 className="text-xl font-bold text-ink mb-4">{t('featuresTitle')}</h2>
        <ul className="list-disc pl-5 space-y-2 text-ink-muted">
          <li>{t('feature1')}</li>
          <li>{t('feature2')}</li>
          <li>{t('feature3')}</li>
          <li>{t('feature4')}</li>
          <li>{t('feature5')}</li>
        </ul>
      </div>
    </div>
  )
}

export default HotNews
