import React, { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Copy, Download, ImageUp, LayoutTemplate, Sparkles, Wand2 } from 'lucide-react'
import { Card, FadeIn, PageHero, StaggerChildren } from '@toolbox/ui-kit'

type Platform = 'web' | 'mobile'
type VisualPreset = 'editorial' | 'workspace' | 'product'

interface SketchMeta {
  name: string
  url: string
  width: number
  height: number
}

interface UiSection {
  id: string
  title: string
  description: string
  tone: string
  blocks: string[]
}

interface GeneratedSpec {
  palette: {
    background: string
    surface: string
    accent: string
    accentSoft: string
    text: string
  }
  frame: Platform
  sections: UiSection[]
  jsx: string
}

const PRESET_COPY: Record<VisualPreset, { label: string; palette: GeneratedSpec['palette'] }> = {
  editorial: {
    label: 'Editorial Hero',
    palette: {
      background: '#f7efe5',
      surface: '#fff9f3',
      accent: '#d9481f',
      accentSoft: '#f2c1ae',
      text: '#2a211c',
    },
  },
  workspace: {
    label: 'Warm Workspace',
    palette: {
      background: '#eef3ed',
      surface: '#f9fcf8',
      accent: '#1d6f5f',
      accentSoft: '#b8dfd4',
      text: '#1d2b28',
    },
  },
  product: {
    label: 'Bento Product',
    palette: {
      background: '#eef2ff',
      surface: '#f8faff',
      accent: '#4f46e5',
      accentSoft: '#c7d2fe',
      text: '#1f2340',
    },
  },
}

function inferSections(prompt: string) {
  const lowered = prompt.toLowerCase()
  const sections: UiSection[] = []

  if (/(dashboard|数据|analytics|指标|看板)/i.test(lowered)) {
    sections.push({
      id: 'hero',
      title: '洞察头图',
      description: '一句话价值主张 + 主操作按钮 + 今日关键指标',
      tone: '强调效率和判断速度',
      blocks: ['Headline', 'Primary CTA', 'Metric Cards'],
    })
    sections.push({
      id: 'insights',
      title: '核心数据区',
      description: '大图表 + 趋势摘要 + 指标对比',
      tone: '突出变化趋势',
      blocks: ['Chart', 'Trend Callout', 'Comparison Grid'],
    })
    sections.push({
      id: 'ops',
      title: '执行清单',
      description: '任务列表、负责人、状态筛选',
      tone: '偏中后台',
      blocks: ['Table', 'Status Pills', 'Side Panel'],
    })
  }

  if (/(landing|官网|营销|品牌|saas|产品页|homepage)/i.test(lowered)) {
    sections.push({
      id: 'story',
      title: '品牌叙事',
      description: '大标题、副标题、Logo 云和视觉强调块',
      tone: '更偏品牌表达',
      blocks: ['Headline', 'Subhead', 'Logo Cloud'],
    })
    sections.push({
      id: 'features',
      title: '能力亮点',
      description: '3-4 个卖点卡片，带图标或数据锚点',
      tone: '利于快速扫读',
      blocks: ['Feature Cards', 'Mini Stats', 'Icon Row'],
    })
    sections.push({
      id: 'cta',
      title: '强 CTA 区',
      description: '价格、表单或咨询入口',
      tone: '强调转化',
      blocks: ['Pricing', 'Form', 'CTA Banner'],
    })
  }

  if (/(表单|预约|注册|提交|申请|表单页|form)/i.test(lowered)) {
    sections.push({
      id: 'form',
      title: '表单流程',
      description: '分步表单、说明侧栏和提交状态',
      tone: '减少输入压力',
      blocks: ['Stepper', 'Fields', 'Summary Panel'],
    })
  }

  if (/(社区|消息|聊天|chat|inbox|工单)/i.test(lowered)) {
    sections.push({
      id: 'conversation',
      title: '会话工作区',
      description: '左侧列表、中间会话、右侧详情',
      tone: '强调上下文切换',
      blocks: ['Sidebar', 'Conversation Pane', 'Detail Rail'],
    })
  }

  if (!sections.length) {
    sections.push(
      {
        id: 'hero',
        title: '主视觉',
        description: '核心价值陈述 + 首要入口',
        tone: '开场要有记忆点',
        blocks: ['Headline', 'CTA', 'Visual Panel'],
      },
      {
        id: 'content',
        title: '内容区',
        description: '用 2-3 种卡片组织主体信息',
        tone: '层次清晰',
        blocks: ['Cards', 'List', 'Callout'],
      },
      {
        id: 'action',
        title: '收口区',
        description: '二次触达、FAQ 或下一步行动',
        tone: '带出闭环',
        blocks: ['CTA Banner', 'FAQ', 'Footer Links'],
      }
    )
  }

  return sections.slice(0, 4)
}

function buildJsx(platform: Platform, preset: VisualPreset, sections: UiSection[]) {
  const frameClass = platform === 'mobile' ? 'max-w-sm' : 'max-w-6xl'
  return [
    `export default function GeneratedUI() {`,
    `  return (`,
    `    <div className="${frameClass} mx-auto min-h-screen px-6 py-8">`,
    `      <main className="grid gap-6">`,
    ...sections.map(
      (section) =>
        `        <section className="rounded-3xl border p-6 shadow-sm">` +
        `\n          <h2 className="text-2xl font-semibold">${section.title}</h2>` +
        `\n          <p className="mt-2 text-sm opacity-70">${section.description}</p>` +
        `\n          <div className="mt-6 grid gap-4 ${platform === 'mobile' ? '' : 'md:grid-cols-3'}">` +
        `\n            ${section.blocks.map((block) => `<div className="rounded-2xl border p-4">${block}</div>`).join('\n            ')}` +
        `\n          </div>` +
        `\n        </section>`
    ),
    `      </main>`,
    `    </div>`,
    `  )`,
    `}`,
    '',
    `// Visual preset: ${PRESET_COPY[preset].label}`,
  ].join('\n')
}

function renderPreviewBlock(block: string, accent: string, accentSoft: string, text: string) {
  return (
    <div
      key={block}
      className="rounded-2xl border p-4 shadow-sm"
      style={{
        borderColor: accentSoft,
        backgroundColor: '#ffffffcc',
        color: text,
      }}
    >
      <div className="h-2 w-20 rounded-full" style={{ backgroundColor: accentSoft }} />
      <div className="mt-4 text-sm font-medium">{block}</div>
      <div className="mt-3 h-16 rounded-xl" style={{ backgroundColor: `${accent}12` }} />
    </div>
  )
}

const UIGenerator: React.FC = () => {
  const { t } = useTranslation('nav')
  const { t: tHome } = useTranslation('home')

  const [prompt, setPrompt] = useState('做一个 SaaS 数据看板首页，包含品牌头图、核心指标、趋势图和待办列表。')
  const [platform, setPlatform] = useState<Platform>('web')
  const [preset, setPreset] = useState<VisualPreset>('product')
  const [sketch, setSketch] = useState<SketchMeta | null>(null)
  const [spec, setSpec] = useState<GeneratedSpec | null>(null)
  const [copied, setCopied] = useState(false)
  const [status, setStatus] = useState('输入需求描述后生成线框预览，草图会用于推断桌面/移动画板比例')

  const activePalette = useMemo(() => PRESET_COPY[preset].palette, [preset])

  const handleSketchUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const url = URL.createObjectURL(file)
    const image = new Image()
    image.onload = () => {
      const nextPlatform = image.width < image.height ? 'mobile' : 'web'
      setPlatform(nextPlatform)
      setSketch({
        name: file.name,
        url,
        width: image.width,
        height: image.height,
      })
      setStatus(`已导入草图 ${file.name}，画板比例推断为 ${nextPlatform === 'mobile' ? '移动端' : '桌面端'}`)
    }
    image.src = url
    event.target.value = ''
  }

  const generate = () => {
    const sections = inferSections(prompt)
    const jsx = buildJsx(platform, preset, sections)
    setSpec({
      palette: PRESET_COPY[preset].palette,
      frame: platform,
      sections,
      jsx,
    })
    setStatus('已生成 UI 线框与代码骨架，可继续调整描述后再次生成')
  }

  const copyCode = async () => {
    if (!spec) return
    await navigator.clipboard.writeText(spec.jsx)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1500)
  }

  const downloadCode = () => {
    if (!spec) return
    const blob = new Blob([spec.jsx], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'generated-ui.tsx'
    anchor.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <PageHero title={t('tools.ui_generator')} description={tHome('toolDesc.ui_generator')} className="mb-4" />

      <FadeIn>
        <Card className="bg-gradient-to-br from-white via-violet-50 to-orange-50 dark:from-gray-800 dark:via-gray-800 dark:to-slate-900">
          <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">需求输入</h2>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">用一句话描述产品目标、关键区块和风格倾向，工具会输出线框结构和前端骨架。</p>
              </div>
              <textarea
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                className="min-h-[180px] w-full rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-800 outline-none focus:border-violet-400 dark:border-slate-700 dark:bg-slate-950/60 dark:text-slate-100"
                placeholder="例如：做一个适合创作者的项目协作首页，包含任务面板、活动流和 AI 建议区。"
              />
              <div className="grid gap-3 md:grid-cols-3">
                <select
                  value={platform}
                  onChange={(event) => setPlatform(event.target.value as Platform)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-violet-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                >
                  <option value="web">桌面 Web</option>
                  <option value="mobile">移动端</option>
                </select>
                <select
                  value={preset}
                  onChange={(event) => setPreset(event.target.value as VisualPreset)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-violet-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                >
                  {Object.entries(PRESET_COPY).map(([value, item]) => (
                    <option key={value} value={value}>
                      {item.label}
                    </option>
                  ))}
                </select>
                <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 hover:border-violet-300 hover:text-violet-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
                  <ImageUp className="w-4 h-4" />
                  上传草图
                  <input type="file" accept="image/*" className="hidden" onChange={handleSketchUpload} />
                </label>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={generate}
                  className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700"
                >
                  <Sparkles className="w-4 h-4" />
                  生成 UI
                </button>
                <span className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-sm text-slate-100 dark:bg-slate-950">
                  <Wand2 className="w-4 h-4 text-orange-300" />
                  {status}
                </span>
              </div>
            </div>

            <Card className="bg-slate-950 text-slate-50 dark:bg-slate-900" padded>
              <div className="flex items-center gap-2 text-sm text-violet-300">
                <LayoutTemplate className="w-4 h-4" />
                生成策略
              </div>
              <ul className="mt-4 space-y-3 text-sm text-slate-200">
                <li>优先从 prompt 里识别场景关键词，再映射成区块组合</li>
                <li>草图主要用于推断画板比例，避免桌面/移动布局方向选错</li>
                <li>输出结果同时包含视觉预览、区块清单和 React/Tailwind 骨架</li>
              </ul>
            </Card>
          </div>
        </Card>
      </FadeIn>

      <StaggerChildren className="grid gap-8 xl:grid-cols-[1.05fr_0.95fr]">
        <Card>
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">线框预览</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">当前用更偏结构化的低保真预览展示信息层级，适合先确定页面骨架和视觉方向。</p>
            </div>
          </div>

          {spec ? (
            <div
              className={`mt-6 mx-auto rounded-[32px] border p-5 shadow-xl ${spec.frame === 'mobile' ? 'max-w-[360px]' : 'max-w-5xl'}`}
              style={{
                backgroundColor: spec.palette.background,
                borderColor: spec.palette.accentSoft,
                color: spec.palette.text,
              }}
            >
              {sketch && (
                <div className="mb-4 overflow-hidden rounded-2xl border" style={{ borderColor: spec.palette.accentSoft }}>
                  <img src={sketch.url} alt={sketch.name} className="h-36 w-full object-cover" />
                  <div className="flex items-center justify-between px-4 py-2 text-xs" style={{ backgroundColor: spec.palette.surface }}>
                    <span>{sketch.name}</span>
                    <span>
                      {sketch.width} × {sketch.height}
                    </span>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {spec.sections.map((section) => (
                  <section
                    key={section.id}
                    className="rounded-[28px] border p-5"
                    style={{
                      borderColor: spec.palette.accentSoft,
                      backgroundColor: spec.palette.surface,
                    }}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="text-xl font-semibold">{section.title}</h3>
                        <p className="mt-2 text-sm opacity-80">{section.description}</p>
                      </div>
                      <div
                        className="rounded-full px-3 py-1 text-xs font-semibold"
                        style={{ backgroundColor: spec.palette.accentSoft, color: spec.palette.text }}
                      >
                        {section.tone}
                      </div>
                    </div>
                    <div className={`mt-5 grid gap-4 ${spec.frame === 'mobile' ? '' : 'md:grid-cols-3'}`}>
                      {section.blocks.map((block) =>
                        renderPreviewBlock(block, spec.palette.accent, spec.palette.accentSoft, spec.palette.text)
                      )}
                    </div>
                  </section>
                ))}
              </div>
            </div>
          ) : (
            <div className="mt-6 rounded-2xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
              生成后这里会出现页面线框和结构分区。
            </div>
          )}
        </Card>

        <div className="space-y-8">
          <Card>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">区块清单</h2>
            {spec ? (
              <div className="mt-4 space-y-4">
                {spec.sections.map((section) => (
                  <Card key={section.id} className="bg-slate-50 dark:bg-slate-900/60" padded>
                    <div className="font-semibold text-slate-900 dark:text-slate-50">{section.title}</div>
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{section.description}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {section.blocks.map((block) => (
                        <span
                          key={block}
                          className="rounded-full bg-slate-200 px-3 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200"
                        >
                          {block}
                        </span>
                      ))}
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">描述需求后，工具会在这里拆出区块层级和建议模块。</p>
            )}
          </Card>

          <Card>
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">React/Tailwind 骨架</h2>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={copyCode}
                  disabled={!spec}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:border-violet-300 hover:text-violet-600 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-100"
                >
                  <Copy className="w-4 h-4" />
                  {copied ? '已复制' : '复制'}
                </button>
                <button
                  type="button"
                  onClick={downloadCode}
                  disabled={!spec}
                  className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-violet-600 dark:hover:bg-violet-700"
                >
                  <Download className="w-4 h-4" />
                  下载
                </button>
              </div>
            </div>
            <textarea
              readOnly
              value={spec?.jsx ?? ''}
              placeholder="生成后会输出一段可继续扩展的 React / Tailwind 骨架"
              className="mt-4 min-h-[320px] w-full rounded-xl border border-slate-200 bg-slate-950 p-4 font-mono text-sm text-emerald-300 outline-none dark:border-slate-700"
            />
          </Card>
        </div>
      </StaggerChildren>
    </div>
  )
}

export default UIGenerator
