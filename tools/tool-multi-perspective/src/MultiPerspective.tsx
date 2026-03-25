import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Copy, Check, Telescope } from 'lucide-react'
import { PageHero } from '@toolbox/ui-kit'

interface Perspective { expert: string; beginner: string; history: string; analogy: string }
interface Item { term: string; category: string; perspectives: Perspective }

const DATA: Item[] = [
  { term: 'JavaScript', category: '编程', perspectives: {
    expert: 'ECMAScript 标准实现，单线程事件循环，原型链继承，V8 JIT 编译。',
    beginner: '网页上能动起来的那部分代码，比如点按钮弹出提示框。',
    history: '1995年布兰登·艾克用10天写成，借助Java热度推广，两者其实毫无关系。',
    analogy: 'HTML是房子的砖墙，CSS是装修，JavaScript是让灯能开关的电路。'
  }},
  { term: 'Git', category: '编程', perspectives: {
    expert: '分布式版本控制，基于DAG对象数据库，SHA-1哈希确保完整性。',
    beginner: '能帮你保存代码每次修改记录，出错随时回到之前版本。',
    history: '2005年林纳斯·托瓦兹用两周开发，起因是Linux团队无法继续免费使用BitKeeper。',
    analogy: '像游戏存档，每次打Boss前存一下，死了可以读档重来，还能维护多条剧情线（分支）。'
  }},
  { term: 'TCP/IP', category: '网络', perspectives: {
    expert: 'TCP提供可靠字节流（三次握手/滑动窗口/拥塞控制），IP负责路由寻址。',
    beginner: '互联网发消息的规则，确保数据完整准确地到达对方。',
    history: '1970年代ARPANET研究成果，1983年成为互联网标准协议。',
    analogy: '像快递系统：IP是地址系统，TCP是确保货物完好送达的规则（丢件要补发）。'
  }},
  { term: 'HTTP', category: '网络', perspectives: {
    expert: '无状态的请求-响应协议，建立在TCP之上，HTTP/2引入多路复用，HTTP/3基于QUIC。',
    beginner: '浏览器和网站服务器之间说话的语言。',
    history: '1991年蒂姆·伯纳斯-李发明，最初只有GET方法。',
    analogy: '像餐厅点菜：你（浏览器）告诉服务员（服务器）要什么，服务员把菜（网页）端来。'
  }},
  { term: '区块链', category: '科技', perspectives: {
    expert: '基于密码学的分布式账本，通过共识算法（PoW/PoS）实现去中心化信任。',
    beginner: '一本大家一起记账的本子，所有人各持一份，没人能偷偷篡改。',
    history: '2008年中本聪发表比特币白皮书，2009年创世区块诞生。',
    analogy: '全班同学都有一份一模一样的成绩单，你改自己那份也没用，和其他人的对不上。'
  }},
  { term: '机器学习', category: 'AI', perspectives: {
    expert: '通过统计学习算法从数据中归纳规律，包括监督/无监督/强化学习范式。',
    beginner: '给电脑看很多例子，让它自己找规律，之后遇到新问题就用规律判断。',
    history: '1950年图灵提出图灵测试，1986年反向传播算法复兴神经网络，2012年AlexNet掀起深度学习热潮。',
    analogy: '教小孩认苹果：给他看1000个苹果，他就能认出没见过的苹果，机器学习也这样。'
  }},
  { term: '通货膨胀', category: '金融', perspectives: {
    expert: '货币供给增速超过商品供给增速导致购买力下降，用CPI衡量，央行通过利率工具调控。',
    beginner: '钱越来越不值钱，同样的东西要花更多钱买。',
    history: '魏玛共和国1923年恶性通胀，人们用独轮车运钱买面包。',
    analogy: '就像奖励积分越发越多，以前1000分能换一杯咖啡，现在要5000分。'
  }},
  { term: '进化论', category: '科学', perspectives: {
    expert: '基因突变提供变异原材料，自然选择使适应性状频率增加，隔离导致物种分化。',
    beginner: '生物一代一代慢慢变化，适应环境的活下来，不适应的消失了。',
    history: '1859年达尔文发表《物种起源》，当时引发巨大争议，因与宗教创世论冲突。',
    analogy: '像班里体育考试，跑得快的年年过关，跑得慢的慢慢就不见了，剩下的越来越能跑。'
  }},
]

const PERSPECTIVE_KEYS = [
  { key: 'expert', emoji: '👨‍🔬', color: 'bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800' },
  { key: 'beginner', emoji: '🌱', color: 'bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-800' },
  { key: 'history', emoji: '📜', color: 'bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-800' },
  { key: 'analogy', emoji: '💡', color: 'bg-purple-50 dark:bg-purple-900/20 border-purple-100 dark:border-purple-800' },
] as const

const CATEGORIES = ['全部', ...Array.from(new Set(DATA.map(d => d.category)))]

export default function MultiPerspective() {
  const { t } = useTranslation('toolMultiPerspective')
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('全部')
  const [expanded, setExpanded] = useState<number | null>(null)
  const [copied, setCopied] = useState<string | null>(null)

  const filtered = DATA.filter(d => {
    const matchCat = category === '全部' || d.category === category
    const q = search.toLowerCase()
    return matchCat && (!q || d.term.toLowerCase().includes(q))
  })

  const copy = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 1500)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <PageHero title={t('title')} description={t('description')} icon={Telescope} />
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
        <div className="space-y-3">
          {filtered.map((d, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/30"
                onClick={() => setExpanded(expanded === i ? null : i)}>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-gray-900 dark:text-gray-100">{d.term}</span>
                    <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">{d.category}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">4个视角：专家 / 小白 / 历史 / 类比</p>
                </div>
                <span className="text-gray-400 text-sm">{expanded === i ? '▲' : '▼'}</span>
              </div>
              {expanded === i && (
                <div className="px-4 pb-4 space-y-2">
                  {PERSPECTIVE_KEYS.map(({ key, emoji, color }) => (
                    <div key={key} className={`rounded-lg border p-3 ${color}`}>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">{emoji} {t(key)}</span>
                          <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{d.perspectives[key]}</p>
                        </div>
                        <button onClick={() => copy(d.perspectives[key], `${i}-${key}`)}
                          className="shrink-0 text-gray-300 hover:text-indigo-500">
                          {copied === `${i}-${key}` ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
