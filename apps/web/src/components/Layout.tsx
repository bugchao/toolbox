import React, { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  QrCode, Newspaper, MapPin, Cloud, Menu, X, ChevronDown,
  Code, FileCode, Clock, Link2, Shuffle, Calendar, Key,
  Fingerprint, Braces, Hash, Image, FileText, Heart, Palette, Wand2,
  Eraser, Ruler, Search, File, Globe, Sun, Moon, Languages
} from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'
import { setLocale, type Locale } from '../i18n'
import { TOOLS } from '../config/tools'
import { CommandPalette } from './CommandPalette'

interface LayoutProps {
  children: React.ReactNode
}

const NAV_ITEMS = TOOLS.map((t) => ({
  nameKey: t.nameKey,
  href: t.path,
  icon: t.icon,
  categoryKey: t.categoryKey,
}))

const CATEGORIES = [
  { id: 'qrcode', nameKey: 'category_qrcode', icon: QrCode },
  { id: 'dev', nameKey: 'category_dev', icon: Code },
  { id: 'query', nameKey: 'category_query', icon: Search },
  { id: 'utils', nameKey: 'category_utils', icon: Wand2 },
  { id: 'news', nameKey: 'category_news', icon: Newspaper },
] as const

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { t } = useTranslation('nav')
  const { t: tCommon } = useTranslation('common')
  const { t: tFooter } = useTranslation('footer')
  const { t: tCommonTheme } = useTranslation('common')
  const { t: tCp } = useTranslation('commandPalette')
  const { theme, toggleTheme } = useTheme()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [openCategory, setOpenCategory] = useState<string | null>(null)
  const [langOpen, setLangOpen] = useState(false)
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)
  const categoryRef = useRef<HTMLDivElement>(null)
  const location = useLocation()

  const groupedNav = NAV_ITEMS.reduce((acc, item) => {
    if (item.categoryKey) {
      if (!acc[item.categoryKey]) acc[item.categoryKey] = []
      acc[item.categoryKey].push(item)
    }
    return acc
  }, {} as Record<string, (typeof NAV_ITEMS)[number][]>)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        const target = e.target as HTMLElement
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return
        setCommandPaletteOpen(true)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

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
    <div className="min-h-screen flex flex-col bg-[#f0f4f8] dark:bg-gray-900 transition-colors">
      <nav className="bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  🛠️ {tCommon('appName')}
                </h1>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4">
                {NAV_ITEMS.filter((item) => !item.categoryKey).map((item) => {
                  const Icon = item.icon
                  const isActive = location.pathname === item.href
                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                        isActive
                          ? 'border-indigo-500 text-gray-900 dark:text-white'
                          : 'border-transparent text-gray-500 dark:text-gray-300 hover:border-gray-300 hover:text-gray-700 dark:hover:text-gray-200'
                      }`}
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {t(item.nameKey)}
                    </Link>
                  )
                })}
                {CATEGORIES.map((category) => {
                  const CategoryIcon = category.icon
                  const isCategoryActive = groupedNav[category.id]?.some((item) => location.pathname === item.href)
                  const isOpen = openCategory === category.id
                  return (
                    <div key={category.id} className="relative" ref={isOpen ? categoryRef : undefined}>
                      <button
                        onClick={() => setOpenCategory(isOpen ? null : category.id)}
                        className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                          isCategoryActive
                            ? 'border-indigo-500 text-gray-900 dark:text-white'
                            : 'border-transparent text-gray-500 dark:text-gray-300 hover:border-gray-300 hover:text-gray-700 dark:hover:text-gray-200'
                        }`}
                      >
                        <CategoryIcon className="w-4 h-4 mr-2" />
                        {t(category.nameKey)}
                        <ChevronDown className={`w-4 h-4 ml-1 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                      </button>
                      {isOpen && (
                        <div className="absolute left-0 z-10 mt-1 w-56 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 dark:ring-gray-600 py-1">
                          {groupedNav[category.id]?.map((item) => {
                            const ItemIcon = item.icon
                            const isActive = location.pathname === item.href
                            return (
                              <Link
                                key={item.href}
                                to={item.href}
                                className={`flex items-center px-4 py-2 text-sm ${
                                  isActive
                                    ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                                    : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                                }`}
                                onClick={() => setOpenCategory(null)}
                              >
                                <ItemIcon className="w-4 h-4 mr-3" />
                                {t(item.nameKey)}
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
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCommandPaletteOpen(true)}
                className="p-2 rounded-lg text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title={tCp('shortcut')}
              >
                <Search className="w-5 h-5" />
              </button>
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title={theme === 'dark' ? tCommonTheme('theme.light') : tCommonTheme('theme.dark')}
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <div className="relative">
                <button
                  onClick={() => setLangOpen(!langOpen)}
                  className="p-2 rounded-lg text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-1"
                  title="Language"
                >
                  <Languages className="w-5 h-5" />
                </button>
                {langOpen && (
                  <div className="absolute right-0 z-20 mt-1 w-24 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 py-1">
                    {(['zh', 'en'] as Locale[]).map((lng) => (
                      <button
                        key={lng}
                        onClick={() => { setLocale(lng); setLangOpen(false) }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        {tCommon('lang_' + lng)}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="sm:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="sm:hidden border-t border-gray-200 dark:border-gray-700">
            <div className="pt-2 pb-3 space-y-1">
              {NAV_ITEMS.filter((item) => !item.categoryKey).map((item) => {
                const Icon = item.icon
                const isActive = location.pathname === item.href
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={`flex items-center pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                      isActive
                        ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-500 text-indigo-700 dark:text-indigo-300'
                        : 'border-transparent text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    {t(item.nameKey)}
                  </Link>
                )
              })}
              {CATEGORIES.map((category) => {
                const CategoryIcon = category.icon
                const isCategoryActive = groupedNav[category.id]?.some((item) => location.pathname === item.href)
                return (
                  <div key={category.id} className="space-y-1">
                    <button
                      onClick={() => setOpenCategory(openCategory === category.id ? null : category.id)}
                      className={`w-full flex items-center justify-between pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                        isCategoryActive
                          ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-500 text-indigo-700 dark:text-indigo-300'
                          : 'border-transparent text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      <div className="flex items-center">
                        <CategoryIcon className="w-5 h-5 mr-3" />
                        {t(category.nameKey)}
                      </div>
                      <ChevronDown className={`w-4 h-4 transition-transform ${openCategory === category.id ? 'rotate-180' : ''}`} />
                    </button>
                    {openCategory === category.id &&
                      groupedNav[category.id]?.map((item) => {
                        const ItemIcon = item.icon
                        const isActive = location.pathname === item.href
                        return (
                          <Link
                            key={item.href}
                            to={item.href}
                            className={`flex items-center pl-10 pr-4 py-2 text-sm ${
                              isActive
                                ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                                : 'text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                            }`}
                            onClick={() => { setMobileMenuOpen(false); setOpenCategory(null) }}
                          >
                            <ItemIcon className="w-4 h-4 mr-3" />
                            {t(item.nameKey)}
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

      <main className="flex-1 max-w-7xl w-full mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {children}
        </div>
      </main>

      <footer className="mt-auto bg-white dark:bg-gray-800 shadow-inner border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-500 dark:text-gray-300 text-sm">
            {tFooter('copyright')}
          </p>
        </div>
      </footer>
      <CommandPalette open={commandPaletteOpen} onClose={() => setCommandPaletteOpen(false)} />
    </div>
  )
}

export default Layout
