import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Copy, Check, Baby } from 'lucide-react'
import { PageHero } from '@toolbox/ui-kit'

interface Eli5Item {
  term: string
  explanation: string
  analogy: string
  category: string
}

const DATA: Eli5Item[] = [
  { term: 'Internet', category: '科技',
    explanation: '全世界的电脑用电线和无线电波连在一起，可以互相发送信息。',
    analogy: '就像全球有一张超大的蜘蛛网，每台电脑都是网上的一个点，消息可以沿着网传到任何地方。' },
  { term: 'AI 人工智能', category: '科技',
    explanation: '教电脑学习很多例子，让它自己找规律，然后用规律处理新问题。',
    analogy: '就像教小狗学坐下——看了几百次示范之后，它自己就会了，而且能举一反三。' },
  { term: 'Cloud 云计算', category: '科技',
    explanation: '你的文件和程序不存在自己电脑上，而是存在别人的大型电脑里，随时通过网络使用。',
    analogy: '就像不用自己买洗衣机，把衣服送到洗衣店——用的时候去取，不用的时候不占家里空间。' },
  { term: 'Blockchain 区块链', category: '科技',
    explanation: '一本大家一起记账的本子，每一页都抄了一份给所有人，没人能偷偷改某一页。',
    analogy: '就像全班同学都有一份一模一样的成绩单，你改了自己那份也没用，因为和别人的对不上。' },
  { term: 'DNA', category: '科学',
    explanation: '细胞里一段很长的密码，写着怎么建造和运行你的身体。',
    analogy: '就像一本建造说明书，告诉身体每块砖头放哪里、每个零件怎么组装。' },
  { term: '引力', category: '科学',
    explanation: '有质量的东西会吸引其他有质量的东西，越重吸引力越大。',
    analogy: '就像在一张床单上放一个保龄球，床单凹下去了，旁边的小球就会滚向它。' },
  { term: '通货膨胀', category: '金融',
    explanation: '钱越来越不值钱，同样的东西要花更多钱才能买到。',
    analogy: '就像以前10块钱能买一碗面，现在要20块才能买同一碗面。' },
  { term: '股票', category: '金融',
    explanation: '买了一家公司的股票，就拥有了这家公司的一小块，公司赚钱你也跟着赚。',
    analogy: '就像和朋友一起开披萨店，你出了10%的钱，每次卖出去的披萨你也能分到10%的利润。' },
  { term: '递归', category: '编程',
    explanation: '一个函数解决问题的方式是把问题变小，然后用同样的方法解决更小的问题。',
    analogy: '就像查字典，查一个词的意思，解释里又有不认识的词，再去查那个词，直到全懂了。' },
  { term: '加密', category: '编程',
    explanation: '把信息变成只有知道钥匙的人才能看懂的乱码。',
    analogy: '就像用暗语写信，只有你和朋友知道暗号表，别人抢到信也看不懂。' },
  { term: '进化论', category: '科学',
    explanation: '生物一代一代慢慢变化，适应环境的活下来，不适应的消失了。',
    analogy: '就像班里体育考试，跑得快的年年过关，跑得慢的慢慢就不见了。' },
  { term: '黑洞', category: '科学',
    explanation: '太空中一个引力超强的地方，连光都跑不出去，所以看起来是黑的。',
    analogy: '就像一个大漩涡，连游泳最快的人跳进去也游不出来。' },
]

const CATEGORIES = ['全部', ...Array.from(new Set(DATA.map(d => d.category)))]

export default function Eli5() {
  const { t } = useTranslation('toolEli5')
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('全部')
  const [copied, setCopied] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<Record<number, boolean>>({})

  const filtered = DATA.filter(d => {
    const matchCat = category === '全部' || d.category === category
    const q = search.toLowerCase()
    return matchCat && (!q || d.term.toLowerCase().includes(q) || d.explanation.toLowerCase().includes(q))
  })

  const copy = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 1500)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <PageHero title={t('title')} description={t('description')} icon={Baby} />
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
              <div className="flex items-center gap-3 p-4 cursor-pointer" onClick={() => setExpanded(e => ({ ...e, [i]: !e[i] })) }>
                <div className="text-2xl">🧒</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-gray-900 dark:text-gray-100">{d.term}</span>
                    <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">{d.category}</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">{d.explanation}</p>
                </div>
                <button onClick={e => { e.stopPropagation(); copy(`${d.term}\n解释：${d.explanation}\n类比：${d.analogy}`, String(i)) }}
                  className="shrink-0 text-gray-300 hover:text-indigo-500">
                  {copied === String(i) ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              {expanded[i] && (
                <div className="px-4 pb-4 pt-0">
                  <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3 border border-amber-100 dark:border-amber-800">
                    <span className="text-xs font-semibold text-amber-600">{t('analogy')}：</span>
                    <span className="text-sm text-amber-800 dark:text-amber-300">{d.analogy}</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
