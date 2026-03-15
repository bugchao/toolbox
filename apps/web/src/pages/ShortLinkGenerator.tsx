import React, { useState, useEffect } from 'react'
import { Link2, Copy, Check, Clock, BarChart2, Settings, Trash2, ExternalLink } from 'lucide-react'

interface ShortLink {
  id: string
  originalUrl: string
  shortCode: string
  shortUrl: string
  createdAt: string
  expiresAt?: string
  clicks: number
  active: boolean
}

// 生成短链接码的字符集（排除易混淆字符），与 customAlphabet 行为一致
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
const generateShortCode = (size = 6): string => {
  let result = ''
  for (let i = 0; i < size; i++) {
    result += ALPHABET[Math.floor(Math.random() * ALPHABET.length)]
  }
  return result
}

const ShortLinkGenerator: React.FC = () => {
  const [originalUrl, setOriginalUrl] = useState('')
  const [customCode, setCustomCode] = useState('')
  const [expiresDays, setExpiresDays] = useState('')
  const [shortLinks, setShortLinks] = useState<ShortLink[]>([])
  const [generatedLink, setGeneratedLink] = useState<ShortLink | null>(null)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')

  // 页面加载时从localStorage加载历史记录
  useEffect(() => {
    const saved = localStorage.getItem('shortLinks')
    if (saved) {
      setShortLinks(JSON.parse(saved))
    }
  }, [])

  // 保存到localStorage
  useEffect(() => {
    localStorage.setItem('shortLinks', JSON.stringify(shortLinks))
  }, [shortLinks])

  // 验证URL格式
  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  const generateShortLink = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!originalUrl.trim()) {
      setError('请输入原始链接')
      return
    }

    if (!isValidUrl(originalUrl.trim())) {
      setError('请输入有效的URL地址（需要包含 http:// 或 https://）')
      return
    }

    if (customCode && !/^[a-zA-Z0-9_-]{3,20}$/.test(customCode)) {
      setError('自定义后缀只能包含字母、数字、下划线和中划线，长度3-20位')
      return
    }

    // 检查自定义后缀是否已存在
    if (customCode && shortLinks.some(link => link.shortCode === customCode)) {
      setError('该自定义后缀已被使用，请选择其他后缀')
      return
    }

    const shortCode = customCode || generateShortCode()
    const shortUrl = `${window.location.origin}/s/${shortCode}`
    
    const newLink: ShortLink = {
      id: Date.now().toString(),
      originalUrl: originalUrl.trim(),
      shortCode,
      shortUrl,
      createdAt: new Date().toISOString(),
      expiresAt: expiresDays ? new Date(Date.now() + parseInt(expiresDays) * 24 * 60 * 60 * 1000).toISOString() : undefined,
      clicks: 0,
      active: true
    }

    setShortLinks(prev => [newLink, ...prev])
    setGeneratedLink(newLink)
    setOriginalUrl('')
    setCustomCode('')
    setExpiresDays('')
  }

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const deleteLink = (id: string) => {
    if (confirm('确定要删除这个短链接吗？')) {
      setShortLinks(prev => prev.filter(link => link.id !== id))
      if (generatedLink?.id === id) {
        setGeneratedLink(null)
      }
    }
  }

  const toggleLinkStatus = (id: string) => {
    setShortLinks(prev => prev.map(link => 
      link.id === id ? { ...link, active: !link.active } : link
    ))
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN')
  }

  const isExpired = (link: ShortLink) => {
    return link.expiresAt && new Date(link.expiresAt) < new Date()
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-2">短链接生成器</h1>
        <p className="text-white opacity-80">将长链接转换为短小精悍的短链接，方便分享和传播</p>
      </div>

      {/* 生成表单 */}
      <div className="card">
        <form onSubmit={generateShortLink} className="space-y-4">
          <div>
            <label htmlFor="originalUrl" className="block text-sm font-medium text-gray-700 mb-2">
              原始链接
            </label>
            <div className="relative">
              <input
                type="url"
                id="originalUrl"
                value={originalUrl}
                onChange={(e) => setOriginalUrl(e.target.value)}
                placeholder="请输入要缩短的长链接（包含 http:// 或 https://）"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <Link2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="customCode" className="block text-sm font-medium text-gray-700 mb-2">
                自定义后缀（可选）
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  {window.location.origin}/s/
                </span>
                <input
                  type="text"
                  id="customCode"
                  value={customCode}
                  onChange={(e) => setCustomCode(e.target.value)}
                  placeholder="例如：my-link"
                  className="w-full pl-32 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                支持字母、数字、下划线、中划线，长度3-20位
              </p>
            </div>

            <div>
              <label htmlFor="expiresDays" className="block text-sm font-medium text-gray-700 mb-2">
                过期时间（可选）
              </label>
              <div className="relative">
                <input
                  type="number"
                  id="expiresDays"
                  value={expiresDays}
                  onChange={(e) => setExpiresDays(e.target.value)}
                  placeholder="永久有效"
                  min="1"
                  max="365"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  天
                </span>
              </div>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium flex items-center justify-center"
          >
            <Link2 className="w-5 h-5 mr-2" />
            生成短链接
          </button>
        </form>
      </div>

      {/* 生成结果 */}
      {generatedLink && (
        <div className="card bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200">
          <h3 className="text-lg font-semibold text-indigo-900 mb-4 flex items-center">
            <Check className="w-5 h-5 mr-2 text-green-600" />
            短链接生成成功！
          </h3>
          
          <div className="flex items-center space-x-2">
            <input
              type="text"
              readOnly
              value={generatedLink.shortUrl}
              className="flex-1 px-4 py-2 border border-indigo-300 rounded-lg bg-white font-mono"
            />
            <button
              onClick={() => copyToClipboard(generatedLink.shortUrl)}
              className={`px-4 py-2 rounded-lg flex items-center ${
                copied ? 'bg-green-600 text-white' : 'bg-indigo-600 text-white hover:bg-indigo-700'
              } transition-colors`}
            >
              {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
              {copied ? '已复制' : '复制'}
            </button>
            <a
              href={generatedLink.shortUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex items-center"
              title="访问"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">原始链接：</span>
              <a 
                href={generatedLink.originalUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-indigo-600 hover:underline truncate block"
              >
                {generatedLink.originalUrl}
              </a>
            </div>
            <div>
              <span className="text-gray-500">创建时间：</span>
              <span className="text-gray-900">{formatDate(generatedLink.createdAt)}</span>
            </div>
            {generatedLink.expiresAt && (
              <div>
                <span className="text-gray-500">过期时间：</span>
                <span className="text-gray-900">{formatDate(generatedLink.expiresAt)}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 历史记录 */}
      {shortLinks.length > 0 && (
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <BarChart2 className="w-5 h-5 mr-2 text-indigo-600" />
              历史记录
            </h3>
            <button
              onClick={() => {
                if (confirm('确定要清空所有历史记录吗？')) {
                  setShortLinks([])
                  setGeneratedLink(null)
                }
              }}
              className="text-sm text-red-600 hover:text-red-800"
            >
              清空历史
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">短链接</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">原始链接</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">点击量</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">创建时间</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">状态</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {shortLinks.map((link) => (
                  <tr key={link.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <a 
                        href={link.shortUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:underline font-mono text-sm"
                      >
                        {link.shortUrl}
                      </a>
                    </td>
                    <td className="py-3 px-4 max-w-xs truncate">
                      <a 
                        href={link.originalUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-gray-900 hover:underline text-sm"
                        title={link.originalUrl}
                      >
                        {link.originalUrl}
                      </a>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900">{link.clicks}</td>
                    <td className="py-3 px-4 text-sm text-gray-500">
                      {formatDate(link.createdAt).split(' ')[0]}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        isExpired(link)
                          ? 'bg-gray-100 text-gray-800'
                          : link.active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {isExpired(link) ? '已过期' : link.active ? '正常' : '已禁用'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => copyToClipboard(link.shortUrl)}
                        className="text-indigo-600 hover:text-indigo-900"
                        title="复制"
                      >
                        <Copy className="w-4 h-4 inline" />
                      </button>
                      <button
                        onClick={() => toggleLinkStatus(link.id)}
                        className={`${
                          link.active ? 'text-yellow-600 hover:text-yellow-900' : 'text-green-600 hover:text-green-900'
                        }`}
                        title={link.active ? '禁用' : '启用'}
                      >
                        <Settings className="w-4 h-4 inline" />
                      </button>
                      <button
                        onClick={() => deleteLink(link.id)}
                        className="text-red-600 hover:text-red-900"
                        title="删除"
                      >
                        <Trash2 className="w-4 h-4 inline" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 使用说明 */}
      <div className="card bg-gray-50">
        <h3 className="text-lg font-bold text-gray-900 mb-3">使用说明</h3>
        <ul className="space-y-2 text-gray-600">
          <li className="flex items-start">
            <span className="text-indigo-600 mr-2">•</span>
            所有短链接数据保存在浏览器本地，不会上传到服务器，保护隐私
          </li>
          <li className="flex items-start">
            <span className="text-indigo-600 mr-2">•</span>
            支持自定义短链接后缀，方便记忆和品牌传播
          </li>
          <li className="flex items-start">
            <span className="text-indigo-600 mr-2">•</span>
            可设置过期时间，到期后短链接自动失效
          </li>
          <li className="flex items-start">
            <span className="text-indigo-600 mr-2">•</span>
            内置点击统计功能，查看链接访问情况
          </li>
          <li className="flex items-start">
            <span className="text-indigo-600 mr-2">•</span>
            支持启用/禁用短链接，灵活控制访问权限
          </li>
        </ul>
      </div>
    </div>
  )
}

export default ShortLinkGenerator
