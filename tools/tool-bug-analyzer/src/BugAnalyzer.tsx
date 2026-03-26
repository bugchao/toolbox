import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Bug, Copy, Check, Trash2, AlertTriangle, AlertCircle, Info } from 'lucide-react'
import { PageHero } from '@toolbox/ui-kit'

interface BugResult {
  errorType: string
  severity: 'high' | 'medium' | 'low'
  causes: string[]
  fixes: string[]
  checklist: string[]
  docs?: string
}

const PATTERNS: Array<{ pattern: RegExp; result: BugResult }> = [
  {
    pattern: /TypeError|is not a function|Cannot read propert/i,
    result: {
      errorType: 'TypeError - 类型错误',
      severity: 'high',
      causes: ['访问了 undefined 或 null 对象的属性', '调用了非函数类型的值', '变量未初始化就使用'],
      fixes: ['使用可选链 `?.` 访问属性：`obj?.prop`', '使用 `typeof` 检查变量类型', '确保异步数据加载完成后再渲染', '添加空值判断：`if (obj && obj.prop)`'],
      checklist: ['检查变量是否已定义', '检查 API 响应数据结构', '检查 async/await 是否正确使用', '检查导入的模块名称是否正确'],
      docs: 'https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Errors/Not_a_function',
    },
  },
  {
    pattern: /ReferenceError|is not defined/i,
    result: {
      errorType: 'ReferenceError - 引用错误',
      severity: 'high',
      causes: ['使用了未声明的变量', '变量作用域问题', '拼写错误导致变量名不匹配'],
      fixes: ['使用 `const`/`let` 声明变量', '检查变量作用域', '检查变量名拼写', '确认模块已正确导入'],
      checklist: ['检查变量声明位置', '检查 import 语句', '检查变量名大小写', '检查是否在声明前使用了变量（TDZ）'],
    },
  },
  {
    pattern: /SyntaxError|Unexpected token|Unexpected end/i,
    result: {
      errorType: 'SyntaxError - 语法错误',
      severity: 'high',
      causes: ['代码语法不正确', '缺少括号/引号/分号', 'JSON 格式错误'],
      fixes: ['检查括号是否配对', '检查引号是否闭合', '使用代码格式化工具', '验证 JSON 格式'],
      checklist: ['运行 eslint 检查', '检查最近修改的代码', '使用 JSON validator 验证数据', '检查模板字符串是否闭合'],
    },
  },
  {
    pattern: /CORS|Access-Control-Allow-Origin|blocked by CORS/i,
    result: {
      errorType: 'CORS 跨域错误',
      severity: 'medium',
      causes: ['服务器未设置跨域响应头', '请求来源不在白名单内', '预检请求失败'],
      fixes: ['服务器添加 `Access-Control-Allow-Origin` 响应头', '使用代理服务器转发请求', '开发环境使用 vite proxy 或 webpack devServer proxy', '检查请求的 URL 是否正确'],
      checklist: ['检查后端是否配置了 CORS 中间件', '确认请求 URL 的协议/域名/端口', '检查 OPTIONS 预检请求是否通过', '开发时是否需要配置代理'],
    },
  },
  {
    pattern: /404|Not Found|ENOENT|no such file/i,
    result: {
      errorType: '404 资源不存在',
      severity: 'medium',
      causes: ['请求的 URL 路径不正确', '文件或资源被删除/移动', 'API 接口地址变更'],
      fixes: ['检查 URL 路径是否正确', '确认资源是否存在', '检查 API 文档确认正确地址', '检查路由配置'],
      checklist: ['在浏览器直接访问该 URL', '检查路由配置文件', '确认文件路径大小写', '检查 API 版本号'],
    },
  },
  {
    pattern: /500|Internal Server Error|ECONNREFUSED|ECONNRESET/i,
    result: {
      errorType: '服务器错误 / 连接失败',
      severity: 'high',
      causes: ['后端服务崩溃或未启动', '数据库连接失败', '服务器内部异常'],
      fixes: ['检查后端服务是否正在运行', '查看服务器日志排查原因', '检查数据库连接配置', '重启相关服务'],
      checklist: ['查看服务器错误日志', '检查数据库是否运行', '检查环境变量配置', '检查磁盘空间和内存'],
    },
  },
  {
    pattern: /out of memory|heap|stack overflow|Maximum call stack/i,
    result: {
      errorType: '内存溢出 / 栈溢出',
      severity: 'high',
      causes: ['无限递归调用', '内存泄漏', '处理超大数据集'],
      fixes: ['检查递归函数是否有终止条件', '使用迭代替代深度递归', '分批处理大数据', '检查事件监听器是否正确移除'],
      checklist: ['检查递归函数终止条件', '使用 Chrome DevTools Memory 面板分析', '检查 useEffect 依赖项', '检查是否有循环引用'],
    },
  },
  {
    pattern: /Module not found|Cannot find module|import error/i,
    result: {
      errorType: '模块找不到',
      severity: 'medium',
      causes: ['依赖包未安装', '路径别名配置错误', '模块名称拼写错误'],
      fixes: ['运行 `npm install` 或 `pnpm install`', '检查 `tsconfig.json` 路径别名', '确认包名拼写正确', '清除 node_modules 重新安装'],
      checklist: ['运行 pnpm install', '检查 package.json dependencies', '确认路径别名配置', '检查是否使用了正确的包名'],
    },
  },
]

const DEFAULT_RESULT: BugResult = {
  errorType: '未知错误',
  severity: 'medium',
  causes: ['错误信息不够明确，需要更多上下文', '可能是运行时错误或配置问题'],
  fixes: ['仔细阅读完整的错误堆栈信息', '搜索错误关键词 + 技术栈名称', '查看最近的代码变更', '在开发者工具中设置断点调试'],
  checklist: ['查看完整堆栈追踪', '检查最近的代码变更', 'Google 或 Stack Overflow 搜索', '查阅官方文档'],
}

function analyze(input: string): BugResult {
  for (const { pattern, result } of PATTERNS) {
    if (pattern.test(input)) return result
  }
  return DEFAULT_RESULT
}

const SEVERITY_CONFIG = {
  high: { color: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800', icon: AlertTriangle },
  medium: { color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800', icon: AlertCircle },
  low: { color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800', icon: Info },
}

export default function BugAnalyzer() {
  const { t } = useTranslation('toolBugAnalyzer')
  const [input, setInput] = useState('')
  const [result, setResult] = useState<BugResult | null>(null)
  const [copied, setCopied] = useState(false)

  const handleAnalyze = () => {
    if (!input.trim()) return
    setResult(analyze(input))
  }

  const handleCopy = () => {
    if (!result) return
    const text = `错误类型：${result.errorType}\n\n可能原因：\n${result.causes.map(c => '• ' + c).join('\n')}\n\n修复建议：\n${result.fixes.map(f => '• ' + f).join('\n')}`
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const sev = result ? SEVERITY_CONFIG[result.severity] : null

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <PageHero
        icon={Bug}
        titleKey="title"
        descriptionKey="description"
        i18nNamespace="toolBugAnalyzer"
      />
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <div className="bg-gray-900 rounded-xl overflow-hidden">
          <textarea
            className="w-full h-48 px-4 py-3 text-sm text-red-300 font-mono bg-transparent resize-none outline-none"
            placeholder={t('inputPlaceholder')}
            value={input}
            onChange={e => setInput(e.target.value)}
            spellCheck={false}
          />
        </div>

        <div className="flex gap-3">
          <button onClick={handleAnalyze} disabled={!input.trim()}
            className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white rounded-lg text-sm font-medium transition-colors">
            <Bug className="w-4 h-4" />
            {t('analyze')}
          </button>
          <button onClick={() => { setInput(''); setResult(null) }}
            className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-colors">
            <Trash2 className="w-4 h-4" />
            {t('clear')}
          </button>
        </div>

        {result && sev && (
          <div className="space-y-4">
            {/* Error type + severity */}
            <div className={`rounded-xl border p-4 flex items-start gap-3 ${sev.color}`}>
              <sev.icon className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-semibold mb-0.5">{t('errorType')}</div>
                <div className="text-sm font-bold">{result.errorType}</div>
              </div>
              <div className="ml-auto text-xs font-semibold px-2 py-0.5 rounded-full bg-white/50 dark:bg-black/20">
                {t('severity')}: {t(result.severity)}
              </div>
            </div>

            {/* Causes */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">{t('cause')}</h3>
              <ul className="space-y-2">
                {result.causes.map((c, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <span className="text-amber-500 mt-0.5">•</span>{c}
                  </li>
                ))}
              </ul>
            </div>

            {/* Fixes */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">{t('fix')}</h3>
                <button onClick={handleCopy} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-indigo-600">
                  {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? t('copied') : t('copy')}
                </button>
              </div>
              <ul className="space-y-2">
                {result.fixes.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <span className="text-green-500 mt-0.5">✓</span>{f}
                  </li>
                ))}
              </ul>
            </div>

            {/* Checklist */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">{t('checklist')}</h3>
              <ul className="space-y-2">
                {result.checklist.map((c, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <input type="checkbox" className="rounded" readOnly />{c}
                  </li>
                ))}
              </ul>
            </div>

            {result.docs && (
              <a href={result.docs} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-indigo-600 hover:underline">
                {t('relatedDocs')} →
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  )
}