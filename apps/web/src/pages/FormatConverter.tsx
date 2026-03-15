import React, { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ArrowRightLeft, CheckCircle2, Copy, Download, FileCode2, RefreshCw, TriangleAlert } from 'lucide-react'
import { Card, FadeIn, PageHero, StaggerChildren } from '@toolbox/ui-kit'
import {
  parseXml,
  parseYaml,
  stringifyXml,
  stringifyYaml,
  type StructuredValue,
} from '../utils/dataTransform'

type FormatType = 'json' | 'yaml' | 'xml'

const EXAMPLES: Record<FormatType, string> = {
  json: `{
  "project": "Bug Tide",
  "enabled": true,
  "members": [
    { "name": "Alice", "role": "PM" },
    { "name": "Bob", "role": "Engineer" }
  ]
}`,
  yaml: `project: Bug Tide
enabled: true
members:
  -
    name: Alice
    role: PM
  -
    name: Bob
    role: Engineer`,
  xml: `<project enabled="true">
  <name>Bug Tide</name>
  <members>
    <member>
      <name>Alice</name>
      <role>PM</role>
    </member>
    <member>
      <name>Bob</name>
      <role>Engineer</role>
    </member>
  </members>
</project>`,
}

function parseSource(format: FormatType, source: string): StructuredValue {
  if (format === 'json') return JSON.parse(source) as StructuredValue
  if (format === 'yaml') return parseYaml(source)
  return parseXml(source)
}

function stringifyTarget(format: FormatType, value: StructuredValue) {
  if (format === 'json') return JSON.stringify(value, null, 2)
  if (format === 'yaml') return stringifyYaml(value)
  return stringifyXml(value)
}

const FormatConverter: React.FC = () => {
  const { t } = useTranslation('nav')
  const { t: tHome } = useTranslation('home')

  const [sourceFormat, setSourceFormat] = useState<FormatType>('json')
  const [targetFormat, setTargetFormat] = useState<FormatType>('yaml')
  const [input, setInput] = useState(EXAMPLES.json)
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [parsedValue, setParsedValue] = useState<StructuredValue | null>(null)

  useEffect(() => {
    if (!input.trim()) {
      setOutput('')
      setParsedValue(null)
      setError('')
      return
    }

    try {
      const parsed = parseSource(sourceFormat, input)
      setParsedValue(parsed)
      setOutput(stringifyTarget(targetFormat, parsed))
      setError('')
    } catch (currentError) {
      setParsedValue(null)
      setOutput('')
      setError((currentError as Error).message)
    }
  }, [input, sourceFormat, targetFormat])

  const structurePreview = useMemo(() => {
    if (parsedValue == null) return ''
    return JSON.stringify(parsedValue, null, 2)
  }, [parsedValue])

  const swapFormats = () => {
    setSourceFormat(targetFormat)
    setTargetFormat(sourceFormat)
    if (output) setInput(output)
  }

  const loadExample = () => {
    setInput(EXAMPLES[sourceFormat])
  }

  const copyOutput = async () => {
    if (!output) return
    await navigator.clipboard.writeText(output)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1600)
  }

  const downloadOutput = () => {
    if (!output) return
    const extension = targetFormat === 'json' ? 'json' : targetFormat === 'yaml' ? 'yaml' : 'xml'
    const blob = new Blob([output], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `converted.${extension}`
    anchor.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <PageHero title={t('tools.format_converter')} description={tHome('toolDesc.format_converter')} className="mb-4" />

      <FadeIn>
        <Card className="bg-gradient-to-br from-white via-slate-50 to-cyan-50 dark:from-gray-800 dark:via-gray-800 dark:to-slate-900">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 text-slate-900 dark:text-slate-50">
                <FileCode2 className="w-5 h-5 text-cyan-500" />
                <h2 className="text-xl font-semibold">多格式互转</h2>
              </div>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">
                JSON / YAML / XML 即时校验。XML 转对象时，属性会映射为 <code>@attr</code>，文本节点映射为 <code>#text</code>。
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <select
                value={sourceFormat}
                onChange={(event) => setSourceFormat(event.target.value as FormatType)}
                className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-cyan-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              >
                <option value="json">JSON</option>
                <option value="yaml">YAML</option>
                <option value="xml">XML</option>
              </select>
              <button
                type="button"
                onClick={swapFormats}
                className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white p-3 text-slate-600 transition hover:border-cyan-300 hover:text-cyan-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              >
                <ArrowRightLeft className="w-4 h-4" />
              </button>
              <select
                value={targetFormat}
                onChange={(event) => setTargetFormat(event.target.value as FormatType)}
                className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-cyan-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              >
                <option value="json">JSON</option>
                <option value="yaml">YAML</option>
                <option value="xml">XML</option>
              </select>
              <button
                type="button"
                onClick={loadExample}
                className="inline-flex items-center gap-2 rounded-lg bg-cyan-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-cyan-700"
              >
                <RefreshCw className="w-4 h-4" />
                加载示例
              </button>
            </div>
          </div>
        </Card>
      </FadeIn>

      <StaggerChildren className="grid gap-8 xl:grid-cols-[1.05fr_0.95fr]">
        <Card>
          <div className="grid gap-8">
            <div>
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">输入与校验</h2>
                {error ? (
                  <div className="inline-flex items-center gap-2 rounded-full bg-rose-50 px-3 py-1 text-sm text-rose-600 dark:bg-rose-950/40 dark:text-rose-300">
                    <TriangleAlert className="w-4 h-4" />
                    校验失败
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-sm text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300">
                    <CheckCircle2 className="w-4 h-4" />
                    结构有效
                  </div>
                )}
              </div>
              <textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                className="mt-4 min-h-[420px] w-full rounded-xl border border-slate-200 bg-slate-950 p-4 font-mono text-sm text-slate-100 outline-none transition focus:border-cyan-400 dark:border-slate-700"
              />
              {error && (
                <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-200">
                  {error}
                </div>
              )}
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">格式约定</h3>
              <div className="mt-4 grid gap-4 md:grid-cols-3">
                <Card className="bg-slate-50 dark:bg-slate-900/60" padded>
                  <h4 className="font-semibold text-slate-900 dark:text-slate-50">JSON</h4>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">严格遵循标准 JSON，适合接口调试和配置文件。</p>
                </Card>
                <Card className="bg-slate-50 dark:bg-slate-900/60" padded>
                  <h4 className="font-semibold text-slate-900 dark:text-slate-50">YAML</h4>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">当前实现覆盖常见对象、数组和标量，适合 DevOps 与配置编辑场景。</p>
                </Card>
                <Card className="bg-slate-50 dark:bg-slate-900/60" padded>
                  <h4 className="font-semibold text-slate-900 dark:text-slate-50">XML</h4>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">属性映射为 <code>@name</code>，文本映射为 <code>#text</code>，重复节点会归并为数组。</p>
                </Card>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">转换结果</h2>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={copyOutput}
                    disabled={!output}
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-cyan-300 hover:text-cyan-600 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-100"
                  >
                    <Copy className="w-4 h-4" />
                    {copied ? '已复制' : '复制'}
                  </button>
                  <button
                    type="button"
                    onClick={downloadOutput}
                    disabled={!output}
                    className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-cyan-600 dark:hover:bg-cyan-700"
                  >
                    <Download className="w-4 h-4" />
                    下载
                  </button>
                </div>
              </div>
              <textarea
                readOnly
                value={output}
                placeholder="转换结果会实时显示在这里"
                className="mt-4 min-h-[260px] w-full rounded-xl border border-slate-200 bg-white p-4 font-mono text-sm text-slate-800 outline-none dark:border-slate-700 dark:bg-slate-950/60 dark:text-slate-100"
              />
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">结构预览</h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">所有格式都会先归一成对象结构，再输出成目标格式。</p>
              <textarea
                readOnly
                value={structurePreview}
                placeholder="解析成功后，这里会显示中间结构"
                className="mt-4 min-h-[240px] w-full rounded-xl border border-slate-200 bg-slate-950 p-4 font-mono text-sm text-emerald-300 outline-none dark:border-slate-700"
              />
            </div>
          </div>
        </Card>
      </StaggerChildren>
    </div>
  )
}

export default FormatConverter
