import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Copy, Check, Clock } from 'lucide-react'
import { PageHero } from '@toolbox/ui-kit'

const CronGenerator: React.FC = () => {
  const { t } = useTranslation('nav')
  const { t: tHome } = useTranslation('home')
  const [cron, setCron] = useState('* * * * *')
  const [second, setSecond] = useState('*')
  const [minute, setMinute] = useState('*')
  const [hour, setHour] = useState('*')
  const [day, setDay] = useState('*')
  const [month, setMonth] = useState('*')
  const [week, setWeek] = useState('*')
  const [useSeconds, setUseSeconds] = useState(false)
  const [description, setDescription] = useState('')
  const [copied, setCopied] = useState(false)

  // 生成Cron表达式
  useEffect(() => {
    const parts = useSeconds 
      ? [second, minute, hour, day, month, week]
      : [minute, hour, day, month, week]
    setCron(parts.join(' '))
  }, [second, minute, hour, day, month, week, useSeconds])

  // 复制到剪贴板
  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(cron)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // 常用Cron模板
  const commonTemplates = [
    { name: '每分钟', cron: '* * * * *', desc: '每分钟执行一次' },
    { name: '每小时', cron: '0 * * * *', desc: '每小时整点执行' },
    { name: '每天', cron: '0 0 * * *', desc: '每天0点执行' },
    { name: '每天上午9点', cron: '0 9 * * *', desc: '每天上午9点执行' },
    { name: '每周一', cron: '0 0 * * 1', desc: '每周一0点执行' },
    { name: '每月1号', cron: '0 0 1 * *', desc: '每月1号0点执行' },
    { name: '每工作日', cron: '0 9 * * 1-5', desc: '周一到周五上午9点执行' },
    { name: '每30分钟', cron: '0/30 * * * *', desc: '每30分钟执行一次' },
    { name: '每2小时', cron: '0 */2 * * *', desc: '每2小时执行一次' },
  ]

  const loadTemplate = (cronStr: string) => {
    const parts = cronStr.split(' ')
    if (parts.length === 5) {
      setUseSeconds(false)
      setMinute(parts[0])
      setHour(parts[1])
      setDay(parts[2])
      setMonth(parts[3])
      setWeek(parts[4])
    } else if (parts.length === 6) {
      setUseSeconds(true)
      setSecond(parts[0])
      setMinute(parts[1])
      setHour(parts[2])
      setDay(parts[3])
      setMonth(parts[4])
      setWeek(parts[5])
    }
  }

  // 生成说明文字（简化版）
  const generateDescription = () => {
    if (cron === '* * * * *') return '每分钟执行一次'
    if (cron === '0 * * * *') return '每小时整点执行'
    if (cron === '0 0 * * *') return '每天0点执行'
    if (cron === '0 9 * * *') return '每天上午9点执行'
    if (cron === '0 0 * * 1') return '每周一0点执行'
    if (cron === '0 0 1 * *') return '每月1号0点执行'
    if (cron === '0 9 * * 1-5') return '周一到周五上午9点执行'
    if (cron === '0/30 * * * *') return '每30分钟执行一次'
    if (cron === '0 */2 * * *') return '每2小时执行一次'
    
    return '自定义Cron表达式'
  }

  useEffect(() => {
    setDescription(generateDescription())
  }, [cron])

  return (
    <div className="max-w-4xl mx-auto">
      <PageHero title={t('tools.cron')} description={tHome('toolDesc.cron')} className="mb-8" />

      <div className="space-y-6">
        {/* 结果展示 */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Cron表达式</h3>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={useSeconds}
                  onChange={(e) => setUseSeconds(e.target.checked)}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                包含秒位
              </label>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex-1 px-4 py-3 bg-gray-50 border border-gray-300 rounded-md font-mono text-lg text-center">
              {cron}
            </div>
            <button
              onClick={copyToClipboard}
              className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? '已复制' : '复制'}
            </button>
          </div>
          
          <div className="mt-4 text-center text-gray-600">
            <p className="text-lg">{description}</p>
          </div>
        </div>

        {/* 常用模板 */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">常用模板</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {commonTemplates.map((template, index) => (
              <div
                key={index}
                className="p-3 border border-gray-200 rounded-md hover:border-indigo-300 cursor-pointer transition-colors"
                onClick={() => loadTemplate(template.cron)}
              >
                <div className="font-medium text-gray-900 mb-1">{template.name}</div>
                <div className="text-xs font-mono text-gray-600 mb-1">{template.cron}</div>
                <div className="text-xs text-gray-500">{template.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Cron配置项 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {useSeconds && (
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-5 h-5 text-indigo-600" />
                <h4 className="font-medium text-gray-900">秒 (Seconds)</h4>
              </div>
              <input
                type="text"
                value={second}
                onChange={(e) => setSecond(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="*"
              />
              <p className="mt-2 text-xs text-gray-500">允许值: 0-59, * / , -</p>
            </div>
          )}

          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-5 h-5 text-indigo-600" />
              <h4 className="font-medium text-gray-900">分 (Minutes)</h4>
            </div>
            <input
              type="text"
              value={minute}
              onChange={(e) => setMinute(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="*"
            />
            <p className="mt-2 text-xs text-gray-500">允许值: 0-59, * / , -</p>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-5 h-5 text-indigo-600" />
              <h4 className="font-medium text-gray-900">时 (Hours)</h4>
            </div>
            <input
              type="text"
              value={hour}
              onChange={(e) => setHour(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="*"
            />
            <p className="mt-2 text-xs text-gray-500">允许值: 0-23, * / , -</p>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-5 h-5 text-indigo-600" />
              <h4 className="font-medium text-gray-900">日 (Day)</h4>
            </div>
            <input
              type="text"
              value={day}
              onChange={(e) => setDay(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="*"
            />
            <p className="mt-2 text-xs text-gray-500">允许值: 1-31, * / , - ?</p>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-5 h-5 text-indigo-600" />
              <h4 className="font-medium text-gray-900">月 (Month)</h4>
            </div>
            <input
              type="text"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="*"
            />
            <p className="mt-2 text-xs text-gray-500">允许值: 1-12, * / , -</p>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-5 h-5 text-indigo-600" />
              <h4 className="font-medium text-gray-900">周 (Week)</h4>
            </div>
            <input
              type="text"
              value={week}
              onChange={(e) => setWeek(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="*"
            />
            <p className="mt-2 text-xs text-gray-500">允许值: 0-7 (0/7是周日), * / , - ?</p>
          </div>
        </div>

        {/* Cron说明 */}
        <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
          <h3 className="text-sm font-medium text-blue-800 mb-2">Cron表达式结构</h3>
          <div className="text-sm text-blue-700 space-y-1">
            <p>• 5位结构: <code className="bg-blue-100 px-1 rounded">分 时 日 月 周</code></p>
            <p>• 6位结构: <code className="bg-blue-100 px-1 rounded">秒 分 时 日 月 周</code></p>
            <p>• <code>*</code> 表示匹配该域的任意值</p>
            <p>• <code>/</code> 表示步长，例如 <code>0/5</code> 表示每隔5个单位</p>
            <p>• <code>-</code> 表示范围，例如 <code>1-5</code> 表示1到5</p>
            <p>• <code>,</code> 表示枚举多个值，例如 <code>1,3,5</code> 表示1、3、5</p>
            <p>• <code>?</code> 表示不指定值，用于日和周字段互斥的场景</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CronGenerator
