import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Copy, Check, Languages } from 'lucide-react'
import { PageHero } from '@toolbox/ui-kit'

interface Phrase {
  zh: string
  en: string
  ja: string
  ko: string
  fr: string
  es: string
  category: string
}

const PHRASES: Phrase[] = [
  // 基础
  { category: '基础', zh: '你好', en: 'Hello', ja: 'こんにちは', ko: '안녕하세요', fr: 'Bonjour', es: 'Hola' },
  { category: '基础', zh: '谢谢', en: 'Thank you', ja: 'ありがとう', ko: '감사합니다', fr: 'Merci', es: 'Gracias' },
  { category: '基础', zh: '对不起', en: 'Sorry', ja: 'すみません', ko: '죄송합니다', fr: 'Désolé', es: 'Lo siento' },
  { category: '基础', zh: '不客气', en: "You're welcome", ja: 'どういたしまして', ko: '천만에요', fr: 'De rien', es: 'De nada' },
  { category: '基础', zh: '再见', en: 'Goodbye', ja: 'さようなら', ko: '안녕히 가세요', fr: 'Au revoir', es: 'Adiós' },
  { category: '基础', zh: '是', en: 'Yes', ja: 'はい', ko: '네', fr: 'Oui', es: 'Sí' },
  { category: '基础', zh: '不是', en: 'No', ja: 'いいえ', ko: '아니요', fr: 'Non', es: 'No' },
  { category: '基础', zh: '请', en: 'Please', ja: 'お願いします', ko: '부탁합니다', fr: 'S\'il vous plaît', es: 'Por favor' },
  // 问路
  { category: '问路', zh: '在哪里？', en: 'Where is it?', ja: 'どこですか？', ko: '어디에 있어요?', fr: 'Où est-ce?', es: '¿Dónde está?' },
  { category: '问路', zh: '怎么走？', en: 'How do I get there?', ja: 'どうやって行きますか？', ko: '어떻게 가요?', fr: 'Comment y aller?', es: '¿Cómo llego?' },
  { category: '问路', zh: '地铁站在哪里？', en: 'Where is the subway?', ja: '地下鉄はどこですか？', ko: '지하철역이 어디에요?', fr: 'Où est le métro?', es: '¿Dónde está el metro?' },
  { category: '问路', zh: '去机场怎么走？', en: 'How to get to the airport?', ja: '空港へはどうやって？', ko: '공항에 어떻게 가요?', fr: "Comment aller à l'aéroport?", es: '¿Cómo ir al aeropuerto?' },
  { category: '问路', zh: '请帮我叫出租车', en: 'Please call me a taxi', ja: 'タクシーを呼んでください', ko: '택시를 불러주세요', fr: 'Appelez-moi un taxi', es: 'Llámame un taxi' },
  // 住宿
  { category: '住宿', zh: '我有预订', en: 'I have a reservation', ja: '予約があります', ko: '예약이 있어요', fr: "J'ai une réservation", es: 'Tengo una reserva' },
  { category: '住宿', zh: '退房', en: 'Check out', ja: 'チェックアウト', ko: '체크아웃', fr: 'Check-out', es: 'Check-out' },
  { category: '住宿', zh: 'WiFi密码是什么？', en: 'What is the WiFi password?', ja: 'WiFiのパスワードは？', ko: 'WiFi 비밀번호가 뭐예요?', fr: 'Quel est le mot de passe WiFi?', es: '¿Cuál es la contraseña WiFi?' },
  { category: '住宿', zh: '空调坏了', en: 'The AC is broken', ja: 'エアコンが壊れています', ko: '에어컨이 고장났어요', fr: 'La clim est cassée', es: 'El aire está roto' },
  // 餐厅
  { category: '餐厅', zh: '菜单在哪里？', en: 'Where is the menu?', ja: 'メニューはどこですか？', ko: '메뉴 주세요', fr: 'Où est le menu?', es: '¿Dónde está el menú?' },
  { category: '餐厅', zh: '我想点这个', en: 'I want to order this', ja: 'これをください', ko: '이것을 주문하고 싶어요', fr: 'Je veux commander ça', es: 'Quiero pedir esto' },
  { category: '餐厅', zh: '买单', en: 'Check please', ja: 'お会計をお願いします', ko: '계산해 주세요', fr: "L'addition s'il vous plaît", es: 'La cuenta por favor' },
  { category: '餐厅', zh: '我不吃辣', en: "I don't eat spicy food", ja: '辛いものは食べません', ko: '매운 것은 못 먹어요', fr: 'Je ne mange pas épicé', es: 'No como picante' },
  { category: '餐厅', zh: '好吃！', en: 'Delicious!', ja: 'おいしい！', ko: '맛있어요!', fr: 'Délicieux!', es: '¡Delicioso!' },
  // 购物
  { category: '购物', zh: '多少钱？', en: 'How much?', ja: 'いくらですか？', ko: '얼마예요?', fr: 'Combien ça coûte?', es: '¿Cuánto cuesta?' },
  { category: '购物', zh: '太贵了', en: 'Too expensive', ja: '高すぎます', ko: '너무 비싸요', fr: 'Trop cher', es: 'Muy caro' },
  { category: '购物', zh: '可以便宜一点吗？', en: 'Can you give a discount?', ja: '少し安くなりますか？', ko: '좀 깎아줄 수 있어요?', fr: 'Pouvez-vous baisser le prix?', es: '¿Puede dar descuento?' },
  { category: '购物', zh: '我想退货', en: 'I want a refund', ja: '返品したいです', ko: '환불하고 싶어요', fr: 'Je veux un remboursement', es: 'Quiero un reembolso' },
  // 紧急
  { category: '紧急', zh: '帮帮我！', en: 'Help!', ja: '助けてください！', ko: '도와주세요!', fr: 'Aidez-moi!', es: '¡Ayúdame!' },
  { category: '紧急', zh: '叫救护车', en: 'Call an ambulance', ja: '救急車を呼んでください', ko: '구급차를 불러주세요', fr: "Appelez une ambulance", es: 'Llame una ambulancia' },
  { category: '紧急', zh: '我丢东西了', en: 'I lost my belongings', ja: '荷物を失くしました', ko: '물건을 잃어버렸어요', fr: "J'ai perdu mes affaires", es: 'Perdí mis cosas' },
  { category: '紧急', zh: '我需要医生', en: 'I need a doctor', ja: '医者が必要です', ko: '의사가 필요해요', fr: "J'ai besoin d'un médecin", es: 'Necesito un médico' },
]

const LANGS = [
  { key: 'zh', label: '中文' },
  { key: 'en', label: 'EN' },
  { key: 'ja', label: '日本語' },
  { key: 'ko', label: '한국어' },
  { key: 'fr', label: 'FR' },
  { key: 'es', label: 'ES' },
]

const CATEGORIES = ['全部', ...Array.from(new Set(PHRASES.map(p => p.category)))]

export default function TravelTranslator() {
  const { t } = useTranslation('toolTravelTranslator')
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('全部')
  const [activeLangs, setActiveLangs] = useState(['zh', 'en', 'ja'])
  const [copied, setCopied] = useState<string | null>(null)

  const filtered = PHRASES.filter(p => {
    const matchCat = category === '全部' || p.category === category
    const q = search.toLowerCase()
    const matchSearch = !q || Object.values(p).some(v => typeof v === 'string' && v.toLowerCase().includes(q))
    return matchCat && matchSearch
  })

  const toggleLang = (key: string) => {
    setActiveLangs(prev =>
      prev.includes(key) ? prev.length > 1 ? prev.filter(l => l !== key) : prev : [...prev, key]
    )
  }

  const copy = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 1500)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <PageHero title={t('title')} description={t('description')} icon={Languages} />
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">

        {/* 搜索 */}
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder={t('search')}
          className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500" />

        {/* 语言选择 */}
        <div className="flex gap-2 flex-wrap">
          {LANGS.map(l => (
            <button key={l.key} onClick={() => toggleLang(l.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeLangs.includes(l.key) ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500'
              }`}>{l.label}</button>
          ))}
        </div>

        {/* 分类 */}
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCategory(c)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                category === c ? 'bg-gray-700 dark:bg-gray-200 text-white dark:text-gray-800' : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500'
              }`}>{c}</button>
          ))}
        </div>

        {/* 短语列表 */}
        <div className="space-y-2">
          {filtered.map((p, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="px-3 py-1.5 bg-gray-50 dark:bg-gray-700/50 text-xs text-gray-400 border-b border-gray-100 dark:border-gray-700">{p.category}</div>
              <div className="divide-y divide-gray-50 dark:divide-gray-700/50">
                {activeLangs.map(lang => {
                  const text = p[lang as keyof Phrase] as string
                  const id = `${i}-${lang}`
                  return (
                    <div key={lang} className="flex items-center gap-3 px-3 py-2.5">
                      <span className="text-xs text-gray-400 w-12 shrink-0">{LANGS.find(l => l.key === lang)?.label}</span>
                      <span className="flex-1 text-sm text-gray-800 dark:text-gray-200">{text}</span>
                      <button onClick={() => copy(text, id)}
                        className="shrink-0 text-gray-300 hover:text-indigo-500 transition-colors">
                        {copied === id ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
