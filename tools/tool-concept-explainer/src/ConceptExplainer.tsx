import React, { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Lightbulb, Copy, Check, Search } from 'lucide-react'
import { PageHero } from '@toolbox/ui-kit'

interface Concept {
  name: string; category: string; simple: string
  analogy: string; detail: string; example: string; related: string[]
}

const CONCEPTS: Concept[] = [
  { name: '递归', category: '编程', simple: '函数调用自身解决更小的同类问题',
    analogy: '查字典时，解释里有不认识的词，再查，直到全懂',
    detail: '递归需要终止条件和递推关系，每次调用压入调用栈，终止后逐层返回。',
    example: 'factorial(5) = 5×4×3×2×1 = 120', related: ['迭代','调用栈','分治','动态规划'] },
  { name: '闭包', category: '编程', simple: '函数记住了创建时所在作用域的变量',
    analogy: '离家后把钥匙带走，依然能开门',
    detail: '内部函数可访问外部函数变量，即使外部函数已执行完毕。常用于私有数据和函数工厂。',
    example: 'const add5 = (x => y => x+y)(5); add5(3) // 8', related: ['作用域','高阶函数','柯里化'] },
  { name: '量子纠缠', category: '物理', simple: '两粒子无论多远，测量一个瞬间影响另一个',
    analogy: '两枚硬币，一枚正面时另一枚必定反面，不论距离多远',
    detail: '纠缠粒子的量子态相互关联，测量一个会瞬间确定另一个状态，已在千公里距离验证。',
    example: '中国墨子号卫星实现1200km量子纠缠分发', related: ['量子叠加','波函数坍缩','贝尔不等式'] },
  { name: '通货膨胀', category: '经济', simple: '钱越来越不值钱，物价持续上涨',
    analogy: '以前10元一碗面，现在同一碗面要20元',
    detail: '货币购买力持续下降，由需求拉动、成本推动或货币超发引起。央行通过利率政策调控。',
    example: '年通胀率3%：今天100元，明年购买力仅相当于97元', related: ['CPI','利率','货币政策','通缩'] },
  { name: 'HTTP', category: '网络', simple: '浏览器和服务器传输数据的规则',
    analogy: '像寄信：有格式的信封(请求头)、内容(请求体)和回信规则(响应)',
    detail: 'HTTP是超文本传输协议，基于请求-响应模式，无状态。HTTPS是加密版本，使用TLS/SSL。',
    example: '输入网址 -> 浏览器发GET请求 -> 服务器返回HTML', related: ['HTTPS','REST API','TCP/IP','Cookie'] },
  { name: '机器学习', category: 'AI', simple: '让计算机从数据中自动学习规律',
    analogy: '给小孩看1000张猫的图片，他自己总结出猫的特征',
    detail: '通过算法让模型从数据中学习，分监督学习、无监督学习、强化学习三大类。',
    example: '垃圾邮件过滤：学习大量垃圾邮件特征，自动判断新邮件', related: ['深度学习','神经网络','训练数据','过拟合'] },
  { name: 'Docker', category: '编程', simple: '把应用和运行环境打包在一起，到哪都能运行',
    analogy: '标准集装箱：不管放哪艘船都能运输',
    detail: '将应用、依赖、配置打包成镜像，在任何环境中一致运行，解决环境不一致问题。',
    example: 'docker run -p 3000:3000 my-app 即可启动应用', related: ['容器','Kubernetes','微服务','虚拟机'] },
  { name: 'API', category: '编程', simple: '软件之间互相交流的接口',
    analogy: '餐厅的菜单：你按菜单点餐，厨房按规则出餐，互不干扰',
    detail: 'API定义了软件组件如何交互。REST API使用HTTP协议，通过URL和JSON交换数据。',
    example: '天气APP调用天气API获取数据，无需关心数据如何获取', related: ['REST','GraphQL','SDK','Webhook'] },
]

const CATEGORIES = ['全部', ...Array.from(new Set(CONCEPTS.map(c => c.category)))]

export default function ConceptExplainer() {
  const { t } = useTranslation('toolConceptExplainer')
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('全部')
  const [selected, setSelected] = useState<Concept | null>(null)
  const [copied, setCopied] = useState(false)

  const filtered = useMemo(() => CONCEPTS.filter(c => {
    const matchCat = category === '全部' || c.category === category
    const matchSearch = !search || c.name.includes(search) || c.simple.includes(search)
    return matchCat && matchSearch
  }), [search, category])

  const handleCopy = (c: Concept) => {
    navigator.clipboard.writeText(`${c.name}\n一句话：${c.simple}\n类比：${c.analogy}\n详解：${c.detail}\n例子：${c.example}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <PageHero icon={Lightbulb} titleKey="title" descriptionKey="description" i18nNamespace="toolConceptExplainer" />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 outline-none focus:border-indigo-400"
              placeholder={t('searchPlaceholder')} value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  category === cat ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-indigo-400'
                }`}>{cat}</button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(c => (
            <div key={c.name} onClick={() => setSelected(selected?.name === c.name ? null : c)}
              className={`bg-white dark:bg-gray-800 rounded-xl border cursor-pointer transition-all ${
                selected?.name === c.name
                  ? 'border-indigo-400 shadow-md shadow-indigo-100 dark:shadow-indigo-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300'
              }`}>
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">{c.name}</span>
                    <span className="ml-2 text-xs text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">{c.category}</span>
                  </div>
                  <Lightbulb className="w-4 h-4 text-amber-400 shrink-0" />
                </div>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{c.simple}</p>
              </div>
              {selected?.name === c.name && (
                <div className="border-t border-gray-100 dark:border-gray-700 p-4 space-y-3">
                  <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3">
                    <span className="text-xs font-semibold text-amber-600">{t('analogy')}：</span>
                    <span className="text-sm text-amber-800 dark:text-amber-300">{c.analogy}</span>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-gray-500">{t('detail')}：</span>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{c.detail}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                    <span className="text-xs font-semibold text-gray-500">{t('example')}：</span>
                    <code className="text-sm text-indigo-600 dark:text-indigo-400">{c.example}</code>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold text-gray-500">{t('related')}：</span>
                    {c.related.map(r => <span key={r} className="text-xs px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full">{r}</span>)}
                  </div>
                  <button onClick={e => { e.stopPropagation(); handleCopy(c) }}
                    className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-indigo-600">
                    {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? t('copied') : t('copy')}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
