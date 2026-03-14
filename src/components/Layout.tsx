import React, { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { 
  Home, QrCode, Newspaper, MapPin, Cloud, Menu, X, ChevronDown,
  Code, FileCode, Clock, Link2, Shuffle, Calendar, Key, 
  Fingerprint, Braces, Hash, Image, FileText, Heart, Palette, Wand2,
  Eraser, Ruler, Search, File, Globe
} from 'lucide-react'

interface LayoutProps {
  children: React.ReactNode
}

interface NavItem {
  name: string
  href: string
  icon: React.ElementType
  category?: string
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [openCategory, setOpenCategory] = useState<string | null>(null)
  const categoryRef = useRef<HTMLDivElement>(null)
  const location = useLocation()

  // 按分类组织导航项
  const navigation: NavItem[] = [
    { name: '首页', href: '/', icon: Home },
    { name: '二维码生成', href: '/qrcode/generate', icon: QrCode, category: '二维码工具' },
    { name: '二维码解析', href: '/qrcode/read', icon: QrCode, category: '二维码工具' },
    { name: '二维码美化', href: '/qrcode/beautifier', icon: Wand2, category: '二维码工具' },
    { name: '每日热点', href: '/news', icon: Newspaper, category: '资讯工具' },
    { name: '邮编查询', href: '/zipcode', icon: MapPin, category: '查询工具' },
    { name: '天气查询', href: '/weather', icon: Cloud, category: '查询工具' },
    { name: 'IP地址查询', href: '/ip-query', icon: Globe, category: '查询工具' },
    { name: 'JSON格式化', href: '/json', icon: Braces, category: '研发工具' },
    { name: 'Base64编解码', href: '/base64', icon: FileCode, category: '研发工具' },
    { name: '时间戳转换', href: '/timestamp', icon: Clock, category: '研发工具' },
    { name: 'URL编解码', href: '/url', icon: Link2, category: '研发工具' },
    { name: '正则测试', href: '/regex', icon: Shuffle, category: '研发工具' },
    { name: 'Cron生成', href: '/cron', icon: Calendar, category: '研发工具' },
    { name: '密码生成', href: '/password', icon: Key, category: '研发工具' },
    { name: '哈希计算', href: '/hash', icon: Fingerprint, category: '研发工具' },
    { name: '代码美化', href: '/code', icon: Code, category: '研发工具' },
    { name: 'UUID生成', href: '/uuid', icon: Hash, category: '研发工具' },
    { name: '文本对比', href: '/text-comparator', icon: Shuffle, category: '研发工具' },
    { name: '图片压缩', href: '/image-compressor', icon: Image, category: '实用工具' },
    { name: '图片去背景', href: '/image-background-remover', icon: Eraser, category: '实用工具' },
    { name: 'Markdown转换', href: '/markdown', icon: FileText, category: '实用工具' },
    { name: 'BMI计算', href: '/bmi', icon: Heart, category: '实用工具' },
    { name: '颜色拾取', href: '/color-picker', icon: Palette, category: '实用工具' },
    { name: '单位换算', href: '/unit-converter', icon: Ruler, category: '实用工具' },
    { name: 'PDF工具集', href: '/pdf-tools', icon: File, category: '实用工具' },
    { name: '短链接生成', href: '/short-link', icon: Link2, category: '实用工具' },
  ]

  // 分类
  const categories = [
    { id: 'qrcode', name: '二维码工具', icon: QrCode },
    { id: 'dev', name: '研发工具', icon: Code },
    { id: 'query', name: '查询工具', icon: Search },
    { id: 'utils', name: '实用工具', icon: Wand2 },
    { id: 'news', name: '资讯工具', icon: Newspaper },
  ]

  // 按分类分组
  const groupedNav = navigation.reduce((acc, item) => {
    if (item.category) {
      if (!acc[item.category]) {
        acc[item.category] = []
      }
      acc[item.category].push(item)
    }
    return acc
  }, {} as Record<string, NavItem[]>)

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (categoryRef.current && !categoryRef.current.contains(event.target as Node)) {
        setOpenCategory(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="min-h-screen">
      {/* 导航栏 */}
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  🛠️ 工具盒子
                </h1>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4">
              {/* 首页 */}
              {navigation.filter(item => !item.category).map((item) => {
                const Icon = item.icon
                const isActive = location.pathname === item.href
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      isActive
                        ? 'border-indigo-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {item.name}
                  </Link>
                )
              })}

              {/* 分类下拉菜单 */}
              {categories.map((category) => {
                const CategoryIcon = category.icon
                const isCategoryActive = groupedNav[category.name]?.some(item => location.pathname === item.href)
                const isOpen = openCategory === category.id

                return (
                  <div key={category.id} className="relative" ref={isOpen ? categoryRef : undefined}>
                    <button
                      onClick={() => setOpenCategory(isOpen ? null : category.id)}
                      className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium hover:text-gray-700 ${
                        isCategoryActive
                          ? 'border-indigo-500 text-gray-900'
                          : 'border-transparent text-gray-500 hover:border-gray-300'
                      }`}
                    >
                      <CategoryIcon className="w-4 h-4 mr-2" />
                      {category.name}
                      <ChevronDown className={`w-4 h-4 ml-1 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* 下拉内容 */}
                    {isOpen && (
                      <div className="absolute left-0 z-10 mt-1 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 py-1">
                        {groupedNav[category.name]?.map((item) => {
                          const ItemIcon = item.icon
                          const isActive = location.pathname === item.href
                          return (
                            <Link
                              key={item.name}
                              to={item.href}
                              className={`flex items-center px-4 py-2 text-sm ${
                                isActive
                                  ? 'bg-indigo-50 text-indigo-700'
                                  : 'text-gray-700 hover:bg-gray-50'
                              }`}
                              onClick={() => setOpenCategory(null)}
                            >
                              <ItemIcon className="w-4 h-4 mr-3" />
                              {item.name}
                            </Link>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
            </div>
            <div className="-mr-2 flex items-center sm:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              >
                {mobileMenuOpen ? (
                  <X className="block h-6 w-6" />
                ) : (
                  <Menu className="block h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* 移动端菜单 */}
        {mobileMenuOpen && (
          <div className="sm:hidden">
            <div className="pt-2 pb-3 space-y-1">
              {/* 首页 */}
              {navigation.filter(item => !item.category).map((item) => {
                const Icon = item.icon
                const isActive = location.pathname === item.href
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                      isActive
                        ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                        : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    {item.name}
                  </Link>
                )
              })}

              {/* 分类导航 */}
              {categories.map((category) => {
                const CategoryIcon = category.icon
                const isCategoryActive = groupedNav[category.name]?.some(item => location.pathname === item.href)
                
                return (
                  <div key={category.id} className="space-y-1">
                    <button
                      onClick={() => setOpenCategory(openCategory === category.id ? null : category.id)}
                      className={`w-full flex items-center justify-between pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                        isCategoryActive
                          ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                          : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
                      }`}
                    >
                      <div className="flex items-center">
                        <CategoryIcon className="w-5 h-5 mr-3" />
                        {category.name}
                      </div>
                      <ChevronDown className={`w-4 h-4 transition-transform ${openCategory === category.id ? 'rotate-180' : ''}`} />
                    </button>

                    {/* 分类下的工具 */}
                    {openCategory === category.id && groupedNav[category.name]?.map((item) => {
                      const ItemIcon = item.icon
                      const isActive = location.pathname === item.href
                      return (
                        <Link
                          key={item.name}
                          to={item.href}
                          className={`flex items-center pl-10 pr-4 py-2 text-sm ${
                            isActive
                              ? 'bg-indigo-50 text-indigo-700'
                              : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                          }`}
                          onClick={() => {
                            setMobileMenuOpen(false)
                            setOpenCategory(null)
                          }}
                        >
                          <ItemIcon className="w-4 h-4 mr-3" />
                          {item.name}
                        </Link>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </nav>

      {/* 主内容 */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {children}
        </div>
      </main>

      {/* 页脚 */}
      <footer className="bg-white shadow-inner mt-12">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-500 text-sm">
            © 2026 工具盒子 | 持续更新中... | 基于 React + TypeScript + Vite 构建
          </p>
        </div>
      </footer>
    </div>
  )
}

export default Layout
