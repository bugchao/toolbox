import React, { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  QrCode, Newspaper, MapPin, Cloud, Menu, X, ChevronRight, ChevronDown,
  Code, FileCode, Clock, Link2, Shuffle, Calendar, Key,
  Fingerprint, Braces, Hash, Image, FileText, Heart, Palette, Wand2,
  Eraser, Ruler, Search, File, Globe, Server, Sun, Moon, Languages, Layers, Sparkles,
  PanelLeftClose, PanelLeft, ChevronRight as BreadcrumbSep,
  Radio, Shield, Database, Network
} from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'
import { GlobalBackground, ParticlesBackground, useBackgroundVisibility } from '@toolbox/ui-kit'
import { setLocale, type Locale } from '../i18n'
import { TOOLS, getToolTitle, getToolByPath } from '../config/tools'
import { CommandPalette } from './CommandPalette'

interface LayoutProps {
  children: React.ReactNode
}

const NAV_ITEMS = TOOLS.map((t) => ({
  ...t,
  href: t.path,
}))

const CATEGORIES = [
  { id: 'qrcode', nameKey: 'category_qrcode', icon: QrCode },
  { id: 'dev', nameKey: 'category_dev', icon: Code },
  { id: 'ai', nameKey: 'category_ai', icon: Sparkles },
  { id: 'query', nameKey: 'category_query', icon: Search },
  { id: 'utils', nameKey: 'category_utils', icon: Wand2 },
  { id: 'network', nameKey: 'category_network', icon: Server },
  { id: 'dns', nameKey: 'category_dns', icon: Radio },
  { id: 'domain', nameKey: 'category_domain', icon: Globe },
  { id: 'ip', nameKey: 'category_ip', icon: Network },
  { id: 'ipam', nameKey: 'category_ipam', icon: Database },
  { id: 'security', nameKey: 'category_security', icon: Shield },
  { id: 'news', nameKey: 'category_news', icon: Newspaper },
] as const

const SIDEBAR_WIDTH = 260
const SIDEBAR_COLLAPSED = 64
const SIDEBAR_COLLAPSED_KEY = 'toolbox-sidebar-collapsed'

const TAB_STORAGE_KEY = 'toolbox-open-tabs'
const MAX_TABS = 12

function getBreadcrumb(path: string, t: (k: string) => string, getTitle: (path: string) => string): { href: string; label: string }[] {
  if (path === '/') return [{ href: '/', label: t('home') }]
  if (path === '/favorites') return [{ href: '/favorites', label: t('favorites') }]
  const tool = getToolByPath(path)
  if (!tool) return [{ href: path, label: path }]
  const title = getTitle(path)
  if (tool.categoryKey) {
    return [
      { href: path, label: t('category_' + tool.categoryKey) },
      { href: path, label: title },
    ]
  }
  return [{ href: path, label: title }]
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { t } = useTranslation('nav')
  const { t: tCommon } = useTranslation('common')
  const { t: tFooter } = useTranslation('footer')
  const { t: tCommonTheme } = useTranslation('common')
  const { t: tCp } = useTranslation('commandPalette')
  const { theme, toggleTheme } = useTheme()
  const { visible: backgroundVisible, setVisible: setBackgroundVisible } = useBackgroundVisibility()
  const navigate = useNavigate()
  const location = useLocation()

  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try {
      if (typeof window === 'undefined') return false
      return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === 'true'
    } catch {
      return false
    }
  })
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['dev', 'utils', 'network']))
  const [langOpen, setLangOpen] = useState(false)
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)
  const [tabs, setTabs] = useState<{ path: string; title: string }[]>(() => {
    try {
      const raw = sessionStorage.getItem(TAB_STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as { path: string; title: string }[]
        if (Array.isArray(parsed) && parsed.length > 0) return parsed.slice(0, MAX_TABS)
      }
    } catch { /* ignore */ }
    return []
  })
  const [isLg, setIsLg] = useState(typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches)
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null)
  const [flyoutTop, setFlyoutTop] = useState(0)
  const langRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    const handler = () => setIsLg(mq.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(sidebarCollapsed))
    } catch { /* ignore */ }
  }, [sidebarCollapsed])

  const groupedNav = NAV_ITEMS.reduce((acc, item) => {
    if (item.categoryKey) {
      if (!acc[item.categoryKey]) acc[item.categoryKey] = []
      acc[item.categoryKey].push(item)
    }
    return acc
  }, {} as Record<string, (typeof NAV_ITEMS)[number][]>)

  const getTitleForPath = (path: string) => {
    const tool = getToolByPath(path)
    return tool ? getToolTitle(tool, t) : path
  }

  // Sync current path into tabs (only tool routes)
  useEffect(() => {
    const path = location.pathname
    if (path === '/' || path === '/favorites') return
    const title = getTitleForPath(path)
    setTabs((prev) => {
      const exists = prev.some((tab) => tab.path === path)
      if (exists) return prev.map((tab) => (tab.path === path ? { path, title } : tab))
      const next = [...prev.filter((tab) => tab.path !== path), { path, title }].slice(-MAX_TABS)
      try { sessionStorage.setItem(TAB_STORAGE_KEY, JSON.stringify(next)) } catch { /* ignore */ }
      return next
    })
  }, [location.pathname])

  const closeTab = (pathToClose: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setTabs((prev) => {
      const next = prev.filter((tab) => tab.path !== pathToClose)
      try { sessionStorage.setItem(TAB_STORAGE_KEY, JSON.stringify(next)) } catch { /* ignore */ }
      return next
    })
    if (location.pathname === pathToClose) {
      const remaining = tabs.filter((tab) => tab.path !== pathToClose)
      if (remaining.length > 0) navigate(remaining[remaining.length - 1].path)
      else navigate('/')
    }
  }

  const toggleCategory = (id: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        const target = e.target as HTMLElement
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return
        setCommandPaletteOpen(true)
      }
      if (e.key === 'Escape') setSidebarOpen(false)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const breadcrumbs = getBreadcrumb(location.pathname, t, getTitleForPath)
  const sidebarW = sidebarCollapsed ? SIDEBAR_COLLAPSED : SIDEBAR_WIDTH

  const sidebarContent = (
    <>
      <div className={`flex items-center shrink-0 border-b border-gray-200 dark:border-gray-700 ${sidebarCollapsed ? 'justify-center px-0 h-14' : 'gap-2 px-4 h-14'}`}>
        <img src="/favicon.png" alt="" className="w-8 h-8 shrink-0 object-contain" />
        {!sidebarCollapsed && (
          <h1 className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent truncate">
            {tCommon('appName')}
          </h1>
        )}
      </div>

      <nav className={`flex-1 overflow-y-auto py-3 px-2 ${sidebarCollapsed ? 'overflow-x-visible' : 'overflow-x-hidden'}`}>
        {NAV_ITEMS.filter((item) => !item.categoryKey).map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.href
          return (
            <Link
              key={item.href}
              to={item.href}
              onClick={() => setSidebarOpen(false)}
              title={sidebarCollapsed ? getToolTitle(item, t) : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-200'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'
              } ${sidebarCollapsed ? 'justify-center' : ''}`}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {!sidebarCollapsed && <span className="truncate">{getToolTitle(item, t)}</span>}
            </Link>
          )
        })}

        {CATEGORIES.map((category) => {
          const items = groupedNav[category.id]
          if (!items?.length) return null
          const CategoryIcon = category.icon
          const isExpanded = expandedCategories.has(category.id) && !sidebarCollapsed
          const hasActive = items.some((item) => location.pathname === item.href)
          const categoryBlock = (
            <>
              <button
                type="button"
                onClick={() => !sidebarCollapsed && toggleCategory(category.id)}
                title={sidebarCollapsed ? t(category.nameKey) : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  hasActive
                    ? 'text-indigo-700 dark:text-indigo-200 bg-indigo-50 dark:bg-indigo-900/20'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                } ${sidebarCollapsed ? 'justify-center' : ''}`}
              >
                <CategoryIcon className="w-5 h-5 shrink-0" />
                {!sidebarCollapsed && (
                  <>
                    <span className="flex-1 text-left truncate">{t(category.nameKey)}</span>
                    <ChevronDown className={`w-4 h-4 shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                  </>
                )}
              </button>
              {!sidebarCollapsed && isExpanded && (
                <div className="ml-2 mt-0.5 pl-3 border-l border-gray-200 dark:border-gray-600 space-y-0.5">
                  {items.map((item) => {
                    const ItemIcon = item.icon
                    const isActive = location.pathname === item.href
                    return (
                      <Link
                        key={item.href}
                        to={item.href}
                        onClick={() => setSidebarOpen(false)}
                        className={`flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm transition-colors ${
                          isActive
                            ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-200 font-medium'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-gray-100'
                        }`}
                      >
                        <ItemIcon className="w-4 h-4 shrink-0 opacity-80" />
                        <span className="truncate">{getToolTitle(item, t)}</span>
                        {isActive && <ChevronRight className="w-3.5 h-3.5 shrink-0 ml-auto" />}
                      </Link>
                    )
                  })}
                </div>
              )}
            </>
          )
          return (
            <div
              key={category.id}
              className={`mt-1 ${sidebarCollapsed ? 'relative' : ''}`}
              onMouseEnter={(e) => {
                if (sidebarCollapsed) {
                  setHoveredCategory(category.id)
                  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
                  setFlyoutTop(rect.top)
                }
              }}
              onMouseLeave={() => sidebarCollapsed && setHoveredCategory(null)}
            >
              {categoryBlock}
            </div>
          )
        })}
      </nav>

      {!sidebarCollapsed && (
        <div className="shrink-0 p-2 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={() => setSidebarCollapsed(true)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50"
            title="收起菜单"
          >
            <PanelLeftClose className="w-5 h-5" />
          </button>
        </div>
      )}
    </>
  )

  return (
    <div className="min-h-screen flex relative">
      <GlobalBackground />
      <ParticlesBackground className="fixed inset-0 -z-10" />

      {/* Desktop sidebar */}
      <aside
        className={`hidden lg:flex flex-col fixed left-0 top-0 bottom-0 z-30 bg-white/90 dark:bg-gray-900/95 backdrop-blur-md border-r border-gray-200 dark:border-gray-700 shadow-sm transition-[width] duration-200 ${sidebarCollapsed ? 'overflow-visible' : ''} ${sidebarCollapsed && hoveredCategory ? '!z-[100]' : ''}`}
        style={{ width: sidebarW }}
      >
        {sidebarContent}
      </aside>

      {/* Collapsed: expand button */}
      {sidebarCollapsed && (
        <button
          type="button"
          onClick={() => setSidebarCollapsed(false)}
          className="hidden lg:flex fixed left-2 bottom-4 z-30 p-2 rounded-lg bg-white dark:bg-gray-800 shadow border border-gray-200 dark:border-gray-600 text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400"
          title="展开菜单"
        >
          <PanelLeft className="w-5 h-5" />
        </button>
      )}

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-hidden
          />
          <aside
            className="fixed left-0 top-0 bottom-0 z-50 w-[280px] max-w-[85vw] flex flex-col bg-white dark:bg-gray-900 shadow-xl lg:hidden"
          >
            {sidebarContent}
          </aside>
        </>
      )}

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0" style={{ marginLeft: isLg ? sidebarW : 0 } as React.CSSProperties}>
        {/* Header: 图标 + 面包屑 */}
        <header className="sticky top-0 z-20 flex items-center h-12 sm:h-14 px-3 sm:px-4 lg:px-6 bg-white/90 dark:bg-gray-800/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <nav className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400 min-w-0">
              {breadcrumbs.map((seg, i) => (
                <span key={seg.href + i} className="flex items-center gap-1.5 min-w-0">
                  {i > 0 && <BreadcrumbSep className="w-4 h-4 shrink-0 text-gray-400" />}
                  {i < breadcrumbs.length - 1 ? (
                    <Link to={seg.href} className="truncate hover:text-indigo-600 dark:hover:text-indigo-400">
                      {seg.label}
                    </Link>
                  ) : (
                    <span className="truncate font-medium text-gray-900 dark:text-gray-100">{seg.label}</span>
                  )}
                </span>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => setCommandPaletteOpen(true)}
              className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
              title={tCp('shortcut')}
            >
              <Search className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => setBackgroundVisible(!backgroundVisible)}
              className={`p-2 rounded-lg ${backgroundVisible ? 'text-indigo-500 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'} hover:bg-gray-100 dark:hover:bg-gray-700`}
              title={backgroundVisible ? tCommon('backgroundHide') : tCommon('backgroundShow')}
            >
              <Layers className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
              title={theme === 'dark' ? tCommonTheme('theme.light') : tCommonTheme('theme.dark')}
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <div className="relative" ref={langRef}>
              <button
                type="button"
                onClick={() => setLangOpen(!langOpen)}
                className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                title="Language"
              >
                <Languages className="w-5 h-5" />
              </button>
              {langOpen && (
                <div className="absolute right-0 top-full z-20 mt-1 w-24 rounded-lg shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black/5 dark:ring-white/10 py-1">
                  {(['zh', 'en'] as Locale[]).map((lng) => (
                    <button
                      key={lng}
                      type="button"
                      onClick={() => { setLocale(lng); setLangOpen(false) }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      {tCommon('lang_' + lng)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Tab 标签栏 */}
        {tabs.length > 0 && (
          <div className="flex items-center gap-0.5 px-3 sm:px-4 lg:px-6 py-1.5 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
            {tabs.map((tab) => {
              const isActive = location.pathname === tab.path
              return (
                <div
                  key={tab.path}
                  className={`group flex items-center gap-1.5 pl-3 pr-1 py-1.5 rounded-t-lg border-b-2 shrink-0 transition-colors ${
                    isActive
                      ? 'bg-white dark:bg-gray-800 border-indigo-500 text-indigo-700 dark:text-indigo-300'
                      : 'border-transparent text-gray-600 dark:text-gray-400 hover:bg-white/80 dark:hover:bg-gray-700/80'
                  }`}
                >
                  <Link
                    to={tab.path}
                    className="max-w-[140px] sm:max-w-[180px] truncate text-sm font-medium"
                  >
                    {tab.title}
                  </Link>
                  <button
                    type="button"
                    onClick={(e) => closeTab(tab.path, e)}
                    className="p-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                    aria-label="Close tab"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )
            })}
          </div>
        )}

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-6xl mx-auto w-full">
          {children}
        </main>

        <footer className="py-4 px-4 sm:px-6 lg:px-8 border-t border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/30">
          <p className="text-center text-gray-500 dark:text-gray-400 text-sm">
            {tFooter('copyright')}
          </p>
        </footer>
      </div>

      {sidebarCollapsed &&
        hoveredCategory &&
        (() => {
          const cat = CATEGORIES.find((c) => c.id === hoveredCategory)
          const flyoutItems = groupedNav[hoveredCategory] || []
          if (!cat || flyoutItems.length === 0) return null
          const FLYOUT_OVERLAP = 8
          return createPortal(
            <div
              className="fixed z-[200] py-2 min-w-[200px] rounded-r-lg rounded-bl-lg shadow-xl bg-white dark:bg-gray-800 border border-l-0 border-gray-200 dark:border-gray-600"
              style={{ left: SIDEBAR_COLLAPSED - FLYOUT_OVERLAP, top: flyoutTop, paddingLeft: FLYOUT_OVERLAP }}
              onMouseEnter={() => setHoveredCategory(hoveredCategory)}
              onMouseLeave={() => setHoveredCategory(null)}
            >
              <div className="px-3 py-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">
                {t(cat.nameKey)}
              </div>
              <div className="max-h-[70vh] overflow-y-auto">
                {flyoutItems.map((item) => {
                  const ItemIcon = item.icon
                  const isActive = location.pathname === item.href
                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      onClick={() => setHoveredCategory(null)}
                      className={`flex items-center gap-2.5 px-3 py-2 text-sm transition-colors ${
                        isActive
                          ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-200 font-medium'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                      }`}
                    >
                      <ItemIcon className="w-4 h-4 shrink-0 opacity-80" />
                      <span className="truncate">{getToolTitle(item, t)}</span>
                      {isActive && <ChevronRight className="w-3.5 h-3.5 shrink-0 ml-auto" />}
                    </Link>
                  )
                })}
              </div>
            </div>,
            document.body
          )
        })()}

      <CommandPalette open={commandPaletteOpen} onClose={() => setCommandPaletteOpen(false)} />
    </div>
  )
}

export default Layout
