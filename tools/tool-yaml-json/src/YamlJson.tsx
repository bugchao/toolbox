import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Button,
  Card,
  NoticeCard,
  PageHero,
  ParticlesBackground,
  TextArea,
} from '@toolbox/ui-kit'
import { Check, Copy, FileJson2, Sparkles, Trash2 } from 'lucide-react'
import {
  type ConvertResult,
  type JsonIndent,
  type YamlFlowStyle,
  jsonToYaml,
  yamlToJson,
} from './lib/convert'
import { SAMPLES } from './lib/samples'

type Direction = 'auto' | 'yaml-to-json' | 'json-to-yaml'
type IndentChoice = '2' | '4' | 'tab'
type Side = 'yaml' | 'json'

interface SideError {
  side: Side
  message: string
  line?: number
}

const INDENT_MAP: Record<IndentChoice, JsonIndent> = {
  '2': 2,
  '4': 4,
  tab: '\t',
}

function applyResult(
  result: ConvertResult,
  side: Side,
): { text: string | null; error: SideError | null } {
  if (result.ok) {
    return { text: result.text, error: null }
  }
  return {
    text: null,
    error: { side, message: result.message, line: result.line },
  }
}

const YamlJson: React.FC = () => {
  const { t, i18n } = useTranslation('toolYamlJson')
  const isZh = (i18n.language || '').toLowerCase().startsWith('zh')

  const [yamlText, setYamlText] = useState<string>(SAMPLES[0]?.yaml ?? '')
  const [jsonText, setJsonText] = useState<string>('')
  const [direction, setDirection] = useState<Direction>('auto')
  const [indent, setIndent] = useState<IndentChoice>('2')
  const [yamlStyle, setYamlStyle] = useState<YamlFlowStyle>('block')
  const [yamlError, setYamlError] = useState<SideError | null>(null)
  const [jsonError, setJsonError] = useState<SideError | null>(null)
  const [copied, setCopied] = useState<Side | null>(null)

  /** 上次编辑的一侧。用来在 auto 模式下决定单向同步，避免无限回灌循环。 */
  const lastEditedSide = useRef<Side>('yaml')
  /** 编程式 setState 时短暂打开，下一次 effect 不要触发反向写入。 */
  const skipNextSync = useRef<boolean>(false)

  const jsonIndent = INDENT_MAP[indent]

  /**
   * 单向同步：YAML 已变化 → 写 JSON。
   * 仅当方向允许时执行（auto 且 lastEditedSide==='yaml'，或显式 yaml-to-json）。
   */
  const syncYamlToJson = useCallback(
    (yamlSource: string) => {
      const result = yamlToJson(yamlSource, { indent: jsonIndent })
      const { text, error } = applyResult(result, 'yaml')
      setYamlError(error)
      if (text != null) {
        skipNextSync.current = true
        setJsonText(text)
        // 重置另一侧的错误（其内容来自我们）
        setJsonError(null)
      }
    },
    [jsonIndent],
  )

  /**
   * 单向同步：JSON 已变化 → 写 YAML。
   */
  const syncJsonToYaml = useCallback(
    (jsonSource: string) => {
      const result = jsonToYaml(jsonSource, { style: yamlStyle })
      const { text, error } = applyResult(result, 'json')
      setJsonError(error)
      if (text != null) {
        skipNextSync.current = true
        setYamlText(text)
        setYamlError(null)
      }
    },
    [yamlStyle],
  )

  // 首次挂载时基于初始 YAML 计算一次 JSON
  useEffect(() => {
    syncYamlToJson(yamlText)
    // 故意只跑一次
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 选项变更（indent / style / direction）时，按 lastEditedSide 重算一次
  useEffect(() => {
    if (lastEditedSide.current === 'yaml') {
      syncYamlToJson(yamlText)
    } else {
      syncJsonToYaml(jsonText)
    }
    // 故意不把 yamlText/jsonText 放依赖，避免循环：这里只跟随选项
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jsonIndent, yamlStyle, syncJsonToYaml, syncYamlToJson])

  const handleYamlChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value
      if (skipNextSync.current) {
        skipNextSync.current = false
        setYamlText(value)
        return
      }
      lastEditedSide.current = 'yaml'
      setYamlText(value)
      if (direction === 'json-to-yaml') {
        // 方向锁定为 J→Y，禁止从 YAML 回灌
        return
      }
      syncYamlToJson(value)
    },
    [direction, syncYamlToJson],
  )

  const handleJsonChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value
      if (skipNextSync.current) {
        skipNextSync.current = false
        setJsonText(value)
        return
      }
      lastEditedSide.current = 'json'
      setJsonText(value)
      if (direction === 'yaml-to-json') {
        return
      }
      syncJsonToYaml(value)
    },
    [direction, syncJsonToYaml],
  )

  const handleCopy = useCallback(async (text: string, side: Side) => {
    if (!text) return
    try {
      await navigator.clipboard.writeText(text)
      setCopied(side)
      window.setTimeout(() => setCopied(null), 1500)
    } catch {
      // 忽略剪贴板异常，不打断用户
    }
  }, [])

  const handleClearAll = useCallback(() => {
    skipNextSync.current = true
    setYamlText('')
    skipNextSync.current = true
    setJsonText('')
    setYamlError(null)
    setJsonError(null)
  }, [])

  const handleLoadSample = useCallback(
    (sampleYaml: string) => {
      lastEditedSide.current = 'yaml'
      setYamlText(sampleYaml)
      syncYamlToJson(sampleYaml)
    },
    [syncYamlToJson],
  )

  const yamlCharCount = useMemo(() => yamlText.length, [yamlText])
  const jsonCharCount = useMemo(() => jsonText.length, [jsonText])

  const directions: { value: Direction; label: string }[] = [
    { value: 'auto', label: t('directionAuto') },
    { value: 'yaml-to-json', label: t('directionYamlToJson') },
    { value: 'json-to-yaml', label: t('directionJsonToYaml') },
  ]

  return (
    <div className="relative min-h-[60vh]">
      <ParticlesBackground preset="minimal" className="absolute inset-0" />
      <div className="relative z-10 mx-auto max-w-7xl space-y-6 px-4 py-6">
        <PageHero
          title={t('title')}
          description={t('description')}
          icon={FileJson2}
        />

        <NoticeCard
          tone="info"
          title={t('noticeTitle')}
          description={t('noticeDesc')}
        />

        {/* 工具栏 */}
        <Card padded className="!p-4 sm:!p-5">
          <div className="flex flex-wrap items-end gap-4">
            {/* 方向 */}
            <div>
              <div className="mb-1 text-xs font-medium text-gray-500 dark:text-gray-400">
                {t('directionLabel')}
              </div>
              <div
                className="inline-flex overflow-hidden rounded-lg border border-gray-300 dark:border-gray-600"
                role="group"
              >
                {directions.map((d) => (
                  <button
                    key={d.value}
                    type="button"
                    onClick={() => setDirection(d.value)}
                    className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                      direction === d.value
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            {/* JSON 缩进 */}
            <div>
              <label
                className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400"
                htmlFor="yaml-json-indent"
              >
                {t('jsonIndent')}
              </label>
              <select
                id="yaml-json-indent"
                value={indent}
                onChange={(e) => setIndent(e.target.value as IndentChoice)}
                className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
              >
                <option value="2">2</option>
                <option value="4">4</option>
                <option value="tab">Tab</option>
              </select>
            </div>

            {/* YAML 风格 */}
            <div>
              <label
                className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400"
                htmlFor="yaml-json-style"
              >
                {t('yamlStyle')}
              </label>
              <select
                id="yaml-json-style"
                value={yamlStyle}
                onChange={(e) =>
                  setYamlStyle(e.target.value as YamlFlowStyle)
                }
                className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
              >
                <option value="block">{t('styleBlock')}</option>
                <option value="flow">{t('styleFlow')}</option>
              </select>
            </div>

            {/* 样例下拉 */}
            <div>
              <div className="mb-1 text-xs font-medium text-gray-500 dark:text-gray-400">
                {t('loadSample')}
              </div>
              <div className="flex flex-wrap gap-2">
                {SAMPLES.map((s) => (
                  <Button
                    key={s.name}
                    variant="secondary"
                    size="sm"
                    onClick={() => handleLoadSample(s.yaml)}
                  >
                    <span className="inline-flex items-center gap-1">
                      <Sparkles className="h-3.5 w-3.5" />
                      {isZh ? s.labelZh : s.labelEn}
                    </span>
                  </Button>
                ))}
              </div>
            </div>

            <div className="ml-auto">
              <Button variant="ghost" size="sm" onClick={handleClearAll}>
                <span className="inline-flex items-center gap-1">
                  <Trash2 className="h-3.5 w-3.5" />
                  {t('clearAll')}
                </span>
              </Button>
            </div>
          </div>
        </Card>

        {/* 双栏 */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* YAML 栏 */}
          <Card padded className="!p-4 sm:!p-5">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                {t('yamlSide')}
              </h2>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {t('chars', { count: yamlCharCount })}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy(yamlText, 'yaml')}
                  disabled={!yamlText}
                >
                  <span className="inline-flex items-center gap-1">
                    {copied === 'yaml' ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                    {copied === 'yaml' ? t('copied') : t('copy')}
                  </span>
                </Button>
              </div>
            </div>
            <TextArea
              value={yamlText}
              onChange={handleYamlChange}
              placeholder={t('yamlPlaceholder')}
              error={!!yamlError}
              spellCheck={false}
              className="h-[420px] resize-none font-mono text-sm"
            />
            {yamlError && (
              <div className="mt-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-800 dark:border-rose-800 dark:bg-rose-950/30 dark:text-rose-200">
                <div className="font-semibold">{t('errorTitle')}</div>
                <div className="mt-0.5 break-words">
                  {yamlError.line != null && (
                    <span className="mr-2 font-mono">
                      {t('errorLine', { line: yamlError.line })}
                    </span>
                  )}
                  {yamlError.message}
                </div>
              </div>
            )}
          </Card>

          {/* JSON 栏 */}
          <Card padded className="!p-4 sm:!p-5">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                {t('jsonSide')}
              </h2>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {t('chars', { count: jsonCharCount })}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy(jsonText, 'json')}
                  disabled={!jsonText}
                >
                  <span className="inline-flex items-center gap-1">
                    {copied === 'json' ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                    {copied === 'json' ? t('copied') : t('copy')}
                  </span>
                </Button>
              </div>
            </div>
            <TextArea
              value={jsonText}
              onChange={handleJsonChange}
              placeholder={t('jsonPlaceholder')}
              error={!!jsonError}
              spellCheck={false}
              className="h-[420px] resize-none font-mono text-sm"
            />
            {jsonError && (
              <div className="mt-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-800 dark:border-rose-800 dark:bg-rose-950/30 dark:text-rose-200">
                <div className="font-semibold">{t('errorTitle')}</div>
                <div className="mt-0.5 break-words">
                  {jsonError.line != null && (
                    <span className="mr-2 font-mono">
                      {t('errorLine', { line: jsonError.line })}
                    </span>
                  )}
                  {jsonError.message}
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}

export default YamlJson
