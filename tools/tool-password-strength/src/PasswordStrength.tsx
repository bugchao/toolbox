import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Eye, EyeOff, Copy, Check, ShieldCheck, RefreshCw } from 'lucide-react'
import { PageHero } from '@toolbox/ui-kit'

function analyze(pwd: string) {
  const checks = {
    length: pwd.length >= 8,
    longLength: pwd.length >= 12,
    upper: /[A-Z]/.test(pwd),
    lower: /[a-z]/.test(pwd),
    number: /[0-9]/.test(pwd),
    special: /[^A-Za-z0-9]/.test(pwd),
    noRepeats: !/(..)\1/.test(pwd),
    noCommon: !['password','123456','qwerty','abc123','111111'].some(c => pwd.toLowerCase().includes(c)),
  }
  let score = 0
  if (checks.length) score++
  if (checks.longLength) score++
  if (checks.upper) score++
  if (checks.lower) score++
  if (checks.number) score++
  if (checks.special) score += 2
  if (checks.noRepeats) score++
  if (checks.noCommon) score++
  return { checks, score: Math.min(score, 8) }
}

function generate(): string {
  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const lower = 'abcdefghijklmnopqrstuvwxyz'
  const nums = '0123456789'
  const special = '!@#$%^&*()_+-=[]{}|;:,.<>?'
  const all = upper + lower + nums + special
  let pwd = [
    upper[Math.floor(Math.random() * upper.length)],
    lower[Math.floor(Math.random() * lower.length)],
    nums[Math.floor(Math.random() * nums.length)],
    special[Math.floor(Math.random() * special.length)],
  ]
  for (let i = 0; i < 12; i++) pwd.push(all[Math.floor(Math.random() * all.length)])
  return pwd.sort(() => Math.random() - 0.5).join('')
}

export default function PasswordStrength() {
  const { t } = useTranslation('toolPasswordStrength')
  const [pwd, setPwd] = useState('')
  const [show, setShow] = useState(false)
  const [copied, setCopied] = useState(false)
  const [generated, setGenerated] = useState('')
  const [copiedGen, setCopiedGen] = useState(false)

  const { checks, score } = analyze(pwd)
  const pct = Math.round(score / 8 * 100)
  const levels = [
    { min: 0, label: t('veryWeak'), color: 'bg-red-500' },
    { min: 25, label: t('weak'), color: 'bg-orange-400' },
    { min: 50, label: t('fair'), color: 'bg-yellow-400' },
    { min: 75, label: t('strong'), color: 'bg-blue-500' },
    { min: 88, label: t('veryStrong'), color: 'bg-green-500' },
  ]
  const level = [...levels].reverse().find(l => pct >= l.min) || levels[0]

  const copy = (text: string, setFn: (v: boolean) => void) => {
    navigator.clipboard.writeText(text)
    setFn(true)
    setTimeout(() => setFn(false), 1500)
  }

  const suggestions: string[] = []
  if (!checks.length) suggestions.push('密码长度至少8位')
  if (!checks.longLength) suggestions.push('建议12位以上')
  if (!checks.upper) suggestions.push('添加大写字母（A-Z）')
  if (!checks.lower) suggestions.push('添加小写字母（a-z）')
  if (!checks.number) suggestions.push('添加数字（0-9）')
  if (!checks.special) suggestions.push('添加特殊字符（!@#$...）')
  if (!checks.noCommon) suggestions.push('避免使用常见密码')
  if (!checks.noRepeats) suggestions.push('避免重复字符模式')

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <PageHero title={t('title')} description={t('description')} icon={ShieldCheck} />
      <div className="max-w-md mx-auto px-4 py-6 space-y-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-3">
          <div className="flex items-center gap-2">
            <input type={show ? 'text' : 'password'} value={pwd}
              onChange={e => setPwd(e.target.value)}
              placeholder={t('placeholder')}
              className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
            <button onClick={() => setShow(s => !s)} className="text-gray-400 hover:text-gray-600 px-2">
              {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
            <button onClick={() => copy(pwd, setCopied)} className="text-gray-400 hover:text-indigo-500 px-1">
              {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          {pwd && (
            <>
              <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                <div className={`h-2 rounded-full transition-all ${level.color}`} style={{ width: `${pct}%` }} />
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-sm font-semibold ${
                  pct >= 88 ? 'text-green-500' : pct >= 75 ? 'text-blue-500' : pct >= 50 ? 'text-yellow-500' : 'text-red-500'
                }`}>{level.label}</span>
                <span className="text-xs text-gray-400">{score}/8 分</span>
              </div>
            </>
          )}
        </div>

        {pwd && suggestions.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-xs font-semibold text-gray-500 mb-2">{t('suggestions')}</p>
            <ul className="space-y-1">
              {suggestions.map((s, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />{s}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-3">
          <button onClick={() => setGenerated(generate())}
            className="w-full flex items-center justify-center gap-2 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium">
            <RefreshCw className="w-4 h-4" />{t('generate')}
          </button>
          {generated && (
            <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700 rounded-lg px-3 py-2">
              <span className="flex-1 font-mono text-sm text-gray-800 dark:text-gray-200 break-all">{generated}</span>
              <button onClick={() => copy(generated, setCopiedGen)} className="text-gray-400 hover:text-indigo-500 shrink-0">
                {copiedGen ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
