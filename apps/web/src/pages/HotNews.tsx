import React, { useState, useEffect } from 'react'
import { RefreshCw, ExternalLink } from 'lucide-react'
import { NewsItem } from '../types'
import { useTranslation } from 'react-i18next'

const HotNews: React.FC = () => {
  const { t } = useTranslation();
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const categories = [
    { value: 'all', label: t('hotNews.allCategories') },
    { value: '科技', label: t('hotNews.categories.tech') },
    { value: '体育', label: t('hotNews.categories.sports') },
    { value: 'AI', label: t('hotNews.categories.ai') },
    { value: 'OpenClaw', label: t('hotNews.categories.openclaw') },
    { value: 'MCP', label: t('hotNews.categories.mcp') },
    { value: '国际', label: t('hotNews.categories.international') },
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
            title: 'OpenClaw 发布最新版本，支持更多AI代理功能',
            source: 'OpenClaw官方',
            time: '2026-03-09 10:30',
            url: 'https://openclaw.ai',
            category: 'OpenClaw'
          },
          {
            id: '2',
            title: 'MCP协议获得重大更新，跨代理通信效率提升300%',
            source: '技术日报',
            time: '2026-03-09 09:15',
            url: '#',
            category: 'MCP'
          },
          {
            id: '3',
            title: 'Google发布新一代AI模型，性能超越GPT-5',
            source: '科技新闻',
            time: '2026-03-09 08:45',
            url: '#',
            category: 'AI'
          },
          {
            id: '4',
            title: 'React 19正式发布，带来众多革命性特性',
            source: '前端技术',
            time: '2026-03-09 11:20',
            url: '#',
            category: '科技'
          },
          {
            id: '5',
            title: '国际奥委会宣布2032年奥运会举办城市',
            source: '新华社',
            time: '2026-03-09 07:30',
            url: '#',
            category: '国际'
          },
        ])
      }
    } catch (err) {
      console.error(t('hotNews.fetchError'), err)
      // 使用模拟数据
      setNews([
        {
          id: '1',
          title: 'OpenClaw 发布最新版本，支持更多AI代理功能',
          source: 'OpenClaw官方',
          time: '2026-03-09 10:30',
          url: 'https://openclaw.ai',
          category: 'OpenClaw'
        },
        {
          id: '2',
          title: 'MCP协议获得重大更新，跨代理通信效率提升300%',
          source: '技术日报',
          time: '2026-03-09 09:15',
          url: '#',
          category: 'MCP'
        },
        {
          id: '3',
          title: 'Google发布新一代AI模型，性能超越GPT-5',
          source: '科技新闻',
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
      '科技': 'bg-blue-100 text-blue-800',
      '体育': 'bg-green-100 text-green-800',
      'AI': 'bg-purple-100 text-purple-800',
      'OpenClaw': 'bg-orange-100 text-orange-800',
      'MCP': 'bg-red-100 text-red-800',
      '国际': 'bg-indigo-100 text-indigo-800',
    }
    return colors[category] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="card">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">{t('hotNews.title')}</h1>
          <button
            onClick={fetchNews}
            disabled={loading}
            className="btn btn-primary flex items-center"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            {loading ? t('common.loading') : t('common.refresh')}
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
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </div>
            ))
          ) : filteredNews.length > 0 ? (
            filteredNews.map(item => (
              <a
                key={item.id}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-indigo-600">
                      {item.title}
                    </h3>
                    <div className="flex items-center text-sm text-gray-500 space-x-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor(item.category)}`}>
                        {item.category}
                      </span>
                      <span>{item.source}</span>
                      <span>{item.time}</span>
                    </div>
                  </div>
                  <ExternalLink className="w-5 h-5 text-gray-400 ml-4 flex-shrink-0" />
                </div>
              </a>
            ))
          ) : (
            <div className="text-center py-12 text-gray-500">
              {t('hotNews.noNews')}
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-4">功能说明</h2>
        <ul className="list-disc pl-5 space-y-2 text-gray-600">
          <li>新闻数据实时爬取，覆盖科技、体育、AI、OpenClaw、MCP、国际等多个领域</li>
          <li>支持按分类筛选，快速找到感兴趣的内容</li>
          <li>点击新闻标题可跳转到原始来源查看详情</li>
          <li>点击刷新按钮获取最新的热点新闻</li>
          <li>爬虫脚本每天自动更新数据源，确保内容时效性</li>
        </ul>
      </div>
    </div>
  )
}

export default HotNews
