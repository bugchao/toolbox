import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Code2, Copy, Check, Trash2, Zap } from 'lucide-react'
import { PageHero } from '@toolbox/ui-kit'

type Lang = 'auto' | 'javascript' | 'typescript' | 'python' | 'java' | 'go' | 'rust' | 'css' | 'html' | 'sql' | 'bash'

const LANGS: Lang[] = ['auto', 'javascript', 'typescript', 'python', 'java', 'go', 'rust', 'css', 'html', 'sql', 'bash']

interface LineExplanation {
  line: number
  code: string
  explanation: string
  type: 'comment' | 'import' | 'declaration' | 'control' | 'function' | 'expression' | 'other'
}

const TYPE_COLORS: Record<LineExplanation['type'], string> = {
  comment: 'text-gray-400',
  import: 'text-blue-600 dark:text-blue-400',
  declaration: 'text-purple-600 dark:text-purple-400',
  control: 'text-orange-600 dark:text-orange-400',
  function: 'text-green-600 dark:text-green-400',
  expression: 'text-indigo-600 dark:text-indigo-400',
  other: 'text-gray-600 dark:text-gray-400',
}

function detectLang(code: string): Lang {
  if (/^\s*(import|from|def |class |print\(|if __name__)/m.test(code)) return 'python'
  if (/^\s*(package main|func |import ")/m.test(code)) return 'go'
  if (/^\s*(fn |let mut|use std|impl )/m.test(code)) return 'rust'
  if (/^\s*(SELECT|INSERT|UPDATE|DELETE|CREATE TABLE)/im.test(code)) return 'sql'
  if (/^\s*(<html|<div|<span|<!DOCTYPE)/i.test(code)) return 'html'
  if (/^\s*(\.|#|@media|@keyframes|\{\s*\n)/m.test(code) && !/{/.test(code.slice(0, 20))) return 'css'
  if (/^\s*(public class|import java|System\.out)/m.test(code)) return 'java'
  if (/^\s*(#!\/bin\/|echo |grep |awk |sed )/m.test(code)) return 'bash'
  if (/: \w+[;,]|interface |<T>|as \w+/.test(code)) return 'typescript'
  return 'javascript'
}

function explainLine(line: string, lang: Lang): { explanation: string; type: LineExplanation['type'] } {
  const t = line.trim()
  if (!t) return { explanation: '空行', type: 'other' }
  if (/^\/\/|^#|^\/\*|^\*/.test(t)) return { explanation: '注释：' + t.replace(/^\/\/\s*|^#\s*|^\/\*\s*|^\*\s*/, ''), type: 'comment' }
  if (/^import|^from|^require|^use /.test(t)) return { explanation: '导入模块/依赖：' + t, type: 'import' }
  if (/^(const|let|var|val|int|float|string|bool|auto)\s/.test(t)) return { explanation: '声明变量：' + t, type: 'declaration' }
  if (/^(if|else|for|while|switch|case|break|continue|return)/.test(t)) return { explanation: '控制流语句：' + t, type: 'control' }
  if (/^(function|def |fn |func |class |public |private |async )/.test(t)) return { explanation: '定义函数/类：' + t, type: 'function' }
  if (/=>|\(.*\)\s*\{/.test(t)) return { explanation: '箭头函数/回调：' + t, type: 'function' }
  if (/=/.test(t) && !/==|!=|<=|>=/.test(t)) return { explanation: '赋值操作：' + t, type: 'expression' }
  if (/\(.*\)/.test(t)) return { explanation: '函数调用：' + t, type: 'expression' }
  return { explanation: t, type: 'other' }
}

function explainCode(code: string, lang: Lang): { lines: LineExplanation[]; overview: string } {
  const detectedLang = lang === 'auto' ? detectLang(code) : lang
  const lines = code.split('\n').map((l, i) => {
    const { explanation, type } = explainLine(l, detectedLang)
    return { line: i + 1, code: l, explanation, type }
  }).filter(l => l.code.trim())

  const importCount = lines.filter(l => l.type === 'import').length
  const funcCount = lines.filter(l => l.type === 'function').length
  const controlCount = lines.filter(l => l.type === 'control').length
  const overview = `这段 ${detectedLang} 代码共 ${lines.length} 个有效行，包含 ${importCount} 个导入、${funcCount} 个函数/类定义、${controlCount} 个控制流语句。`

  return { lines, overview }
}

export default function CodeExplainer() {
  const { t } = useTranslation('toolCodeExplainer')
  const [code, setCode] = useState('')
  const [lang, setLang] = useState<Lang>('auto')
  const [result, setResult] = useState<{ lines: LineExplanation[]; overview: string } | null>(null)
  const [copied, setCopied] = useState(false)

  const handleExplain = () => {
    if (!code.trim()) return
    setResult(explainCode(code, lang))
  }

  const handleCopy = () => {
    if (!result) return
    const text = result.lines.map(l => `第${l.line}行: ${l.code}\n→ ${l.explanation}`).join('\n\n')
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <PageHero
        icon={Code2}
        titleKey="title"
        descriptionKey="description"
        i18nNamespace="toolCodeExplainer"
      />
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Lang selector */}
        <div className="flex flex-wrap gap-2">
          {LANGS.map(l => (
            <button key={l} onClick={() => setLang(l)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                lang === l
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-indigo-400'
              }`}>
              {l === 'auto' ? t('auto') : l}
            </button>
          ))}
        </div>

        {/* Code input */}
        <div className="bg-gray-900 rounded-xl overflow-hidden">
          <textarea
            className="w-full h-52 px-4 py-3 text-sm text-green-400 font-mono bg-transparent resize-none outline-none"
            placeholder={t('inputPlaceholder')}
            value={code}
            onChange={e => setCode(e.target.value)}
            spellCheck={false}
          />
        </div>

        <div className="flex gap-3">
          <button onClick={handleExplain} disabled={!code.trim()}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-lg text-sm font-medium transition-colors">
            <Zap className="w-4 h-4" />
            {t('explain')}
          </button>
          <button onClick={() => { setCode(''); setResult(null) }}
            className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-colors">
            <Trash2 className="w-4 h-4" />
            {t('clear')}
          </button>
        </div>

        {result && (
          <div className="space-y-4">
            {/* Overview */}
            <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800 px-4 py-3">
              <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">{t('overview')}：</span>
              <span className="text-sm text-indigo-800 dark:text-indigo-200">{result.overview}</span>
            </div>

            {/* Line by line */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-xs font-medium text-gray-500">{t('result')}</span>
                <button onClick={handleCopy} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-indigo-600">
                  {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? t('copied') : t('copy')}
                </button>
              </div>
              <div className="divide-y divide-gray-50 dark:divide-gray-700">
                {result.lines.map(l => (
                  <div key={l.line} className="px-4 py-3 flex gap-4">
                    <span className="shrink-0 text-xs text-gray-400 w-8 pt-0.5">{l.line}</span>
                    <div className="flex-1 min-w-0">
                      <code className="text-xs font-mono text-gray-800 dark:text-gray-200 block truncate">{l.code}</code>
                      <p className={`text-xs mt-1 ${TYPE_COLORS[l.type]}`}>→ {l.explanation}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
