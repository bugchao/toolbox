import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Copy, Check, Lightbulb } from 'lucide-react'
import { PageHero } from '@toolbox/ui-kit'

interface Concept { term: string; oneLiner: string; category: string }

const CONCEPTS: Concept[] = [
  { term: 'API', oneLiner: '两个软件之间沟通的标准接口，就像餐厅的菜单让顾客和厨房能交流', category: '编程' },
  { term: 'Git', oneLiner: '代码的时光机，能记录每一次修改并随时回溯', category: '编程' },
  { term: 'Docker', oneLiner: '把应用和其运行环境打包成集装箱，在任何机器上都能一致运行', category: '编程' },
  { term: 'TypeScript', oneLiner: '给 JavaScript 加上类型标注，让错误在运行前就被发现', category: '编程' },
  { term: 'REST', oneLiner: '用 HTTP 动词（GET/POST/PUT/DELETE）对资源进行 CRUD 操作的 API 风格', category: '编程' },
  { term: '递归', oneLiner: '函数调用自身来解决问题，每次缩小问题规模直到最简单情况', category: '编程' },
  { term: '闭包', oneLiner: '函数记住并能访问其定义时所在作用域中的变量', category: '编程' },
  { term: '微服务', oneLiner: '把大应用拆成多个小服务，各自独立部署、独立扩展', category: '编程' },
  { term: 'WebSocket', oneLiner: '浏览器和服务器之间的持久双向通道，无需反复建立连接', category: '编程' },
  { term: 'CI/CD', oneLiner: '代码提交后自动测试、构建、部署的流水线', category: '编程' },
  // 科技
  { term: '人工智能', oneLiner: '让计算机模拟人类智能行为（学习、推理、感知）的技术总称', category: '科技' },
  { term: '机器学习', oneLiner: '让机器从数据中自动学习规律，无需人工编写每条规则', category: '科技' },
  { term: '区块链', oneLiner: '去中心化的分布式账本，每条记录不可篡改且对所有参与者可见', category: '科技' },
  { term: '云计算', oneLiner: '通过互联网按需租用计算资源，用多少付多少', category: '科技' },
  { term: '量子计算', oneLiner: '利用量子叠加和纠缠原理，同时计算多种可能性的计算方式', category: '科技' },
  { term: 'NFT', oneLiner: '区块链上独一无二的数字所有权凭证', category: '科技' },
  { term: '元宇宙', oneLiner: '集社交、游戏、工作于一体的沉浸式虚拟世界', category: '科技' },
  { term: '边缘计算', oneLiner: '在数据产生的地方就近处理，而不是全部传到云端', category: '科技' },
  // 金融
  { term: '复利', oneLiner: '利息也产生利息，让财富像滚雪球一样增长', category: '金融' },
  { term: '通货膨胀', oneLiner: '货币购买力下降，同样的钱能买到更少的东西', category: '金融' },
  { term: 'ETF', oneLiner: '像买一只股票一样，一次性投资一篮子资产', category: '金融' },
  { term: '对冲', oneLiner: '同时持有相反方向的投资，降低单一风险', category: '金融' },
  { term: '市盈率', oneLiner: '股价是每股盈利的多少倍，衡量市场愿意为利润支付多少溢价', category: '金融' },
  // 科学
  { term: '熵', oneLiner: '系统混乱程度的量度，宇宙总是倾向于从有序变为无序', category: '科学' },
  { term: '量子纠缠', oneLiner: '两个粒子无论相距多远，测量一个会瞬间影响另一个', category: '科学' },
  { term: 'DNA', oneLiner: '细胞的建造蓝图，用四种碱基的排列组合编码生命信息', category: '科学' },
  { term: '黑洞', oneLiner: '引力强到连光都无法逃脱的时空区域', category: '科学' },
  { term: '进化论', oneLiner: '物种通过自然选择适者生存，在漫长时间里逐渐改变的过程', category: '科学' },
  // 哲学
  { term: '奥卡姆剃刀', oneLiner: '如无必要，勿增实体——最简单的解释往往最可能是正确的', category: '哲学' },
  { term: '墨菲定律', oneLiner: '如果事情有可能出错，那它最终一定会出错', category: '哲学' },
  { term: '帕累托原则', oneLiner: '80%的结果来自20%的原因', category: '哲学' },
  { term: '邓宁-克鲁格效应', oneLiner: '知道得越少越自信，了解越深越谦逊', category: '哲学' },
]

const CATEGORIES = ['全部', ...Array.from(new Set(CONCEPTS.map(c => c.category)))]

export default function OneLiner() {
  const { t } = useTranslation('toolOneLiner')
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('全部')
  const [copied, setCopied] = useState<string | null>(null)

  const filtered = CONCEPTS.filter(c => {
    const matchCat = category === '全部' || c.category === category
    const q = search.toLowerCase()
    const matchSearch = !q || c.term.toLowerCase().includes(q) || c.oneLiner.toLowerCase().includes(q)
    return matchCat && matchSearch
  })

  const copy = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 1500)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <PageHero title={t('title')} description={t('description')} icon={Lightbulb} />
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder={t('search')}
          className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCategory(c)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                category === c ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
              }`}>{c}</button>
          ))}
        </div>
        <div className="space-y-2">
          {filtered.map((c, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-sm text-indigo-600 dark:text-indigo-400">{c.term}</span>
                  <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">{c.category}</span>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300">{c.oneLiner}</p>
              </div>
              <button onClick={() => copy(`${c.term}：${c.oneLiner}`, String(i))}
                className="shrink-0 text-gray-300 hover:text-indigo-500 transition-colors pt-0.5">
                {copied === String(i) ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
