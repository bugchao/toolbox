import React, { useState, useCallback } from 'react'
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react'

interface RuleError {
  line: number
  message: string
  severity: 'error' | 'warning'
}

interface ParsedRule {
  id: string
  type: string
  condition: string
  action: string
  priority: number
  raw: string
}

const SAMPLE_RULES = `# GSLB 解析规则示例
# 格式: [优先级] [类型] [条件] -> [动作]

100 geo region=cn-east -> node=sh1
90 geo region=cn-north -> node=bj1
80 geo region=cn-south -> node=gz1
70 isp isp=mobile -> node=sh1
60 isp isp=unicom -> node=bj1
50 isp isp=telecom -> node=gz1
10 default * -> node=sg1
5 fallback * -> node=us1`

function validateRules(text: string): { rules: ParsedRule[]; errors: RuleError[] } {
  const lines = text.split('\n')
  const rules: ParsedRule[] = []
  const errors: RuleError[] = []
  const priorities = new Set<number>()
  const usedNodes = new Set<string>()

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line || line.startsWith('#')) continue
    const lineNum = i + 1

    // 解析格式: [priority] [type] [condition] -> [action]
    const match = line.match(/^(\d+)\s+(\w+)\s+(.+?)\s*->\s*(.+)$/)
    if (!match) {
      errors.push({ line: lineNum, message: `格式错误，期望: [优先级] [类型] [条件] -> [动作]`, severity: 'error' })
      continue
    }
    const [, prioStr, type, condition, action] = match
    const priority = parseInt(prioStr)

    // 检查优先级重复
    if (priorities.has(priority)) {
      errors.push({ line: lineNum, message: `优先级 ${priority} 重复，可能导致规则冲突`, severity: 'warning' })
    }
    priorities.add(priority)

    // 检查类型
    const validTypes = ['geo', 'isp', 'default', 'fallback', 'ip', 'asn', 'custom']
    if (!validTypes.includes(type)) {
      errors.push({ line: lineNum, message: `未知规则类型 "${type}"，有效类型: ${validTypes.join(', ')}`, severity: 'warning' })
    }

    // 检查动作格式
    if (!action.match(/^(node|pool|redirect|deny)=/)) {
      errors.push({ line: lineNum, message: `动作格式错误，应为 node=xxx / pool=xxx / redirect=xxx / deny`, severity: 'error' })
    }

    // 检查 default/fallback 规则的条件
    if ((type === 'default' || type === 'fallback') && condition !== '*') {
      errors.push({ line: lineNum, message: `${type} 规则的条件应为 "*"`, severity: 'warning' })
    }

    // 提取目标节点
    const nodeMatch = action.match(/node=(\w+)/)
    if (nodeMatch) usedNodes.add(nodeMatch[1])

    rules.push({ id: String(lineNum), type, condition, action, priority, raw: line })
  }

  // 检查是否有 default/fallback 兜底规则
  const hasDefault = rules.some(r => r.type === 'default' || r.type === 'fallback')
  if (rules.length > 0 && !hasDefault) {
    errors.push({ line: 0, message: '建议添加 default 或 fallback 兜底规则，避免无法匹配时无节点可用', severity: 'warning' })
  }

  return { rules: rules.sort((a, b) => b.priority - a.priority), errors }
}

export function GslbRuleValidate() {
  const [text, setText] = useState('')
  const [result, setResult] = useState<ReturnType<typeof validateRules> | null>(null)

  const validate = useCallback(() => setResult(validateRules(text)), [text])
  const loadSample = () => { setText(SAMPLE_RULES); setResult(null) }

  const errorCount = result?.errors.filter(e => e.severity === 'error').length ?? 0
  const warnCount = result?.errors.filter(e => e.severity === 'warning').length ?? 0

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">GSLB 规则验证</h1>
      <p className="text-gray-500 dark:text-gray-400">检查 GSLB 解析规则语法，检测优先级冲突、缺失兜底规则等问题</p>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">规则内容</label>
          <button onClick={loadSample} className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline">加载示例</button>
        </div>
        <textarea value={text} onChange={e => setText(e.target.value)}
          rows={10}
          placeholder="100 geo region=cn-east -> node=sh1&#10;10 default * -> node=us1"
          className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
        <button onClick={validate} disabled={!text.trim()}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg font-medium transition-colors">
          <CheckCircle className="w-4 h-4" />验证规则
        </button>
      </div>

      {result && (
        <div className="space-y-4">
          {/* 验证结果 */}
          <div className={`rounded-xl border-2 p-4 flex items-center gap-3 ${
            errorCount > 0 ? 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10'
            : warnCount > 0 ? 'border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/10'
            : 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/10'
          }`}>
            {errorCount > 0 ? <XCircle className="w-6 h-6 text-red-500 shrink-0" />
              : warnCount > 0 ? <AlertTriangle className="w-6 h-6 text-yellow-500 shrink-0" />
              : <CheckCircle className="w-6 h-6 text-green-500 shrink-0" />}
            <div>
              <div className={`font-semibold ${
                errorCount > 0 ? 'text-red-700 dark:text-red-400' : warnCount > 0 ? 'text-yellow-700 dark:text-yellow-400' : 'text-green-700 dark:text-green-400'
              }`}>
                {errorCount > 0 ? `发现 ${errorCount} 个错误${warnCount > 0 ? `，${warnCount} 个警告` : ''}`
                  : warnCount > 0 ? `规则有效，${warnCount} 个警告`
                  : '规则验证通过，无错误'}
              </div>
              <div className="text-sm text-gray-500 mt-0.5">共解析 {result.rules.length} 条规则</div>
            </div>
          </div>

          {/* 错误/警告列表 */}
          {result.errors.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300">问题列表</div>
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {result.errors.map((e, i) => (
                  <div key={i} className="flex items-start gap-3 px-4 py-2.5">
                    {e.severity === 'error'
                      ? <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                      : <AlertTriangle className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />}
                    <div>
                      {e.line > 0 && <span className="text-xs font-mono text-gray-400 mr-2">第{e.line}行</span>}
                      <span className="text-sm text-gray-700 dark:text-gray-300">{e.message}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 规则表 */}
          {result.rules.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300">解析后规则（按优先级排序）</div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-700/50">
                    <tr>
                      {['优先级', '类型', '条件', '动作'].map(h => (
                        <th key={h} className="px-4 py-2 text-left text-xs font-medium text-gray-500">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {result.rules.map(r => (
                      <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                        <td className="px-4 py-2 font-mono font-bold text-indigo-600 dark:text-indigo-400">{r.priority}</td>
                        <td className="px-4 py-2"><span className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-medium text-gray-600 dark:text-gray-400">{r.type}</span></td>
                        <td className="px-4 py-2 font-mono text-xs text-gray-600 dark:text-gray-400">{r.condition}</td>
                        <td className="px-4 py-2 font-mono text-xs text-green-600 dark:text-green-400">{r.action}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
