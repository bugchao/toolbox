import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CreditCard } from 'lucide-react'
import { PageHero } from '@toolbox/ui-kit'

// 省份代码
const REGIONS: Record<string, string> = {
  '11': '北京市', '12': '天津市', '13': '河北省', '14': '山西省', '15': '内蒙古自治区',
  '21': '辽宁省', '22': '吉林省', '23': '黑龙江省',
  '31': '上海市', '32': '江苏省', '33': '浙江省', '34': '安徽省', '35': '福建省', '36': '江西省', '37': '山东省',
  '41': '河南省', '42': '湖北省', '43': '湖南省', '44': '广东省', '45': '广西壮族自治区', '46': '海南省',
  '50': '重庆市', '51': '四川省', '52': '贵州省', '53': '云南省', '54': '西藏自治区',
  '61': '陕西省', '62': '甘肃省', '63': '青海省', '64': '宁夏回族自治区', '65': '新疆维吾尔自治区',
  '71': '台湾省', '81': '香港特别行政区', '82': '澳门特别行政区',
}

const WEIGHTS = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2]
const CHECK_CHARS = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2']

function validateId(id: string): boolean {
  if (!/^\d{17}[\dX]$/i.test(id)) return false
  const sum = WEIGHTS.reduce((s, w, i) => s + parseInt(id[i]) * w, 0)
  return CHECK_CHARS[sum % 11].toUpperCase() === id[17].toUpperCase()
}

interface ParseResult {
  valid: boolean
  region: string
  birthday: string
  age: number
  gender: string
  checksum: string
  zodiac: string
  constellation: string
}

function getZodiac(year: number): string {
  const zodiacs = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪']
  return zodiacs[(year - 4) % 12]
}

function getConstellation(month: number, day: number): string {
  const consts = [
    [1, 20, '水瓶座'], [2, 19, '双鱼座'], [3, 21, '白羊座'], [4, 20, '金牛座'],
    [5, 21, '双子座'], [6, 21, '巨蟹座'], [7, 23, '狮子座'], [8, 23, '处女座'],
    [9, 23, '天秤座'], [10, 23, '天蝎座'], [11, 22, '射手座'], [12, 22, '摩羯座'],
  ]
  for (const [m, d, name] of consts) {
    if (month === m && day < (d as number)) return name as string
    if (month === (m as number) + 1 && day >= (d as number)) continue
  }
  const idx = month - 1
  return (consts[idx] || consts[0])[2] as string
}

function parseId(id: string): ParseResult {
  const valid = validateId(id)
  const regionCode = id.slice(0, 2)
  const region = REGIONS[regionCode] || '未知地区'
  const year = parseInt(id.slice(6, 10))
  const month = parseInt(id.slice(10, 12))
  const day = parseInt(id.slice(12, 14))
  const birthday = `${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`
  const today = new Date()
  let age = today.getFullYear() - year
  if (today.getMonth() + 1 < month || (today.getMonth() + 1 === month && today.getDate() < day)) age--
  const genderCode = parseInt(id[16])
  const gender = genderCode % 2 === 1 ? 'male' : 'female'
  const checksum = id[17].toUpperCase()
  return { valid, region, birthday, age, gender, checksum, zodiac: getZodiac(year), constellation: getConstellation(month, day) }
}

export default function IdCardParser() {
  const { t } = useTranslation('toolIdCardParser')
  const [input, setInput] = useState('')
  const [result, setResult] = useState<ParseResult | null>(null)

  const parse = () => {
    const id = input.trim().toUpperCase()
    if (!id) return
    setResult(parseId(id))
  }

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') parse()
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <PageHero title={t('title')} description={t('description')} icon={CreditCard} />
      <div className="max-w-xl mx-auto px-4 py-6 space-y-4">

        {/* 输入 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-3">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder={t('placeholder')}
            maxLength={18}
            className="w-full px-4 py-3 text-base font-mono border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 tracking-widest"
          />
          <button onClick={parse}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors">
            {t('parse')}
          </button>
        </div>

        {/* 结果 */}
        {result && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className={`px-4 py-3 text-sm font-medium border-b border-gray-100 dark:border-gray-700 ${
              result.valid ? 'bg-green-50 dark:bg-green-900/20 text-green-600' : 'bg-red-50 dark:bg-red-900/20 text-red-500'
            }`}>{result.valid ? t('valid') : t('invalid')}</div>

            {result.valid && (
              <div className="divide-y divide-gray-50 dark:divide-gray-700">
                {[
                  { label: t('region'), value: result.region },
                  { label: t('birthday'), value: result.birthday },
                  { label: t('age'), value: `${result.age} 岁` },
                  { label: t('gender'), value: t(result.gender) },
                  { label: '生肖', value: result.zodiac },
                  { label: '星座', value: result.constellation },
                  { label: t('checksum'), value: result.checksum },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center px-4 py-3">
                    <span className="text-sm text-gray-500 w-24 shrink-0">{label}</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="text-xs text-center text-gray-400 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800 rounded-lg p-2">
          ⚠️ 仅作格式解析，不联网验证真实性，请勿输入他人真实证件号
        </div>
      </div>
    </div>
  )
}
