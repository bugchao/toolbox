import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { PageHero } from '@toolbox/ui-kit'
import { FileText, Loader2, Sparkles, Download, Palette } from 'lucide-react'
import PptxGenJS from 'pptxgenjs'
import { parseOutline } from './outline'

type ThemeId = 'blue' | 'gray' | 'green' | 'purple'
const THEMES: Record<ThemeId, { titleColor: string; bodyColor: string; accentColor: string; titleBg?: string }> = {
  blue: { titleColor: '1E40AF', bodyColor: '374151', accentColor: '2563EB', titleBg: 'EFF6FF' },
  gray: { titleColor: '1F2937', bodyColor: '4B5563', accentColor: '6B7280', titleBg: 'F9FAFB' },
  green: { titleColor: '166534', bodyColor: '374151', accentColor: '16A34A', titleBg: 'F0FDF4' },
  purple: { titleColor: '5B21B6', bodyColor: '374151', accentColor: '7C3AED', titleBg: 'FAF5FF' },
}

const DEFAULT_OUTLINE_ZH = `封面
（副标题在下方填写）
---
背景与目标
- 当前情况简述
- 本次汇报/演讲目标
---
主要内容
- 要点一
- 要点二
- 要点三
---
数据与案例
- 关键指标
- 案例说明
---
总结与下一步
- 核心结论
- 后续行动
---
谢谢 / Q&A`

const DEFAULT_OUTLINE_EN = `Title
(Subtitle in field below)
---
Background & Goals
- Current situation
- Objectives for this presentation
---
Main content
- Point one
- Point two
- Point three
---
Data & cases
- Key metrics
- Case study
---
Summary & next steps
- Key takeaways
- Next actions
---
Thanks / Q&A`

function generateOutlineFromTopic(topic: string, lang: string): string {
  const base = lang === 'zh' ? DEFAULT_OUTLINE_ZH : DEFAULT_OUTLINE_EN
  const slides = parseOutline(base)
  if (slides.length > 0) slides[0].title = topic
  return slides.map((s) => [s.title, ...s.bullets.map((b) => `- ${b}`)].join('\n')).join('\n---\n')
}

function isThankYouSlide(title: string, lang: string): boolean {
  const t = title.toLowerCase()
  return t.includes('谢谢') || t.includes('thanks') || t.includes('q&a') || t.includes('q and a')
}

const PptGenerator: React.FC = () => {
  const { t, i18n } = useTranslation('toolPptGenerator')
  const [topic, setTopic] = useState('')
  const [subtitle, setSubtitle] = useState('')
  const [outline, setOutline] = useState('')
  const [theme, setTheme] = useState<ThemeId>('blue')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleGenOutline = () => {
    const tTrim = topic.trim()
    if (!tTrim) {
      setError(t('error_topic'))
      return
    }
    setError('')
    setOutline(generateOutlineFromTopic(tTrim, i18n.language))
  }

  const handleGenPpt = async () => {
    const tTrim = topic.trim()
    const slides = parseOutline(outline)
    if (!tTrim) {
      setError(t('error_topic'))
      return
    }
    if (slides.length === 0 || slides.every((s) => !s.title)) {
      setError(t('error_outline'))
      return
    }
    setError('')
    setLoading(true)
    try {
      const pptx = new PptxGenJS()
      const th = THEMES[theme]
      const w = 13.333
      const h = 7.5

      // Title slide
      const titleSlide = pptx.addSlide()
      if (th.titleBg) {
        titleSlide.addShape('rect', { x: 0, y: 0, w, h, fill: { color: th.titleBg }, line: { type: 'none' } })
      }
      titleSlide.addText(tTrim, {
        x: 0.5, y: 2.2, w: w - 1, h: 1.4,
        fontSize: 36, bold: true, align: 'center', color: th.titleColor,
      })
      const subText = subtitle.trim() || new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
      titleSlide.addText(subText, {
        x: 0.5, y: 3.6, w: w - 1, h: 0.5,
        fontSize: 16, align: 'center', color: th.bodyColor,
      })

      // Content slides
      for (let i = 0; i < slides.length; i++) {
        const { title, bullets } = slides[i]
        if (!title) continue

        const slide = pptx.addSlide()
        const isThanks = isThankYouSlide(title, i18n.language)

        if (isThanks) {
          slide.addText(title, {
            x: 0.5, y: 2.8, w: w - 1, h: 1.2,
            fontSize: 28, bold: true, align: 'center', color: th.accentColor,
          })
        } else {
          slide.addText(title, {
            x: 0.5, y: 0.4, w: w - 1, h: 0.7,
            fontSize: 24, bold: true, color: th.titleColor,
          })
          if (bullets.length > 0) {
            slide.addText(bullets.join('\n'), {
              x: 0.5, y: 1.2, w: w - 1, h: 5.2,
              fontSize: 14, color: th.bodyColor, bullet: true,
            })
          }
          slide.addText(`${i + 2} / ${slides.length + 1}`, {
            x: 0.5, y: h - 0.5, w: w - 1, h: 0.3,
            fontSize: 10, align: 'right', color: '999999',
          })
        }
      }

      const filename = `${tTrim.slice(0, 40).replace(/[/\\?*:|\"]/g, '')}.pptx`
      await pptx.writeFile({ fileName: filename })
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const themeOptions: { value: ThemeId; labelKey: string }[] = [
    { value: 'blue', labelKey: 'theme_blue' },
    { value: 'gray', labelKey: 'theme_gray' },
    { value: 'green', labelKey: 'theme_green' },
    { value: 'purple', labelKey: 'theme_purple' },
  ]

  return (
    <div className="max-w-4xl mx-auto">
      <PageHero title={t('title')} description={t('description')} className="mb-8" />

      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('topic_label')}</label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder={t('topic_placeholder')}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('subtitle_label')}</label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder={t('subtitle_placeholder')}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <span className="inline-flex items-center gap-1.5"><Palette className="w-4 h-4" /> {t('theme_label')}</span>
            </label>
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value as ThemeId)}
              className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              {themeOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{t(opt.labelKey)}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleGenOutline}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg font-medium transition-colors"
            >
              <Sparkles className="w-4 h-5" />
              {t('gen_outline_btn')}
            </button>
            <button
              type="button"
              onClick={handleGenPpt}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-lg font-medium transition-colors"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
              {loading ? t('loading') : t('gen_ppt_btn')}
            </button>
          </div>
          {error && <p className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p>}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('outline_label')}
          </label>
          <textarea
            value={outline}
            onChange={(e) => setOutline(e.target.value)}
            placeholder={t('outline_placeholder')}
            rows={14}
            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 outline-none resize-y font-sans text-sm leading-relaxed"
          />
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 flex items-start gap-1.5">
            <FileText className="w-4 h-4 shrink-0 mt-0.5" />
            {t('tip')}
          </p>
        </div>
      </div>
    </div>
  )
}

export default PptGenerator
