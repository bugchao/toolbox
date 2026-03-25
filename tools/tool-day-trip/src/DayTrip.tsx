import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Compass } from 'lucide-react'
import { PageHero } from '@toolbox/ui-kit'

interface CityPlan {
  morning: string[]
  noon: string[]
  afternoon: string[]
  evening: string[]
  food: string[]
  tips: string[]
}

const CITIES: Record<string, CityPlan> = {
  北京: {
    morning: ['天安门广场（建议早到）', '故宫博物院（游览约3小时）'],
    noon: ['仿膳饭庄或附近胡同小吃'],
    afternoon: ['景山公园俯瞰故宫', '南锣鼓巷胡同文化'],
    evening: ['王府井步行街', '前门大街夜游'],
    food: ['北京烤鸭', '炸酱面', '豆汁焦圈', '卤煮火烧'],
    tips: ['提前预约故宫门票', '穿舒适步行鞋', '地铁1号线直达天安门'],
  },
  上海: {
    morning: ['外滩漫步', '南京东路步行街'],
    noon: ['城隍庙小吃：生煎、小笼包'],
    afternoon: ['豫园', '新天地石库门建筑群'],
    evening: ['陆家嘴夜景（东方明珠/上海中心）', '衡山路'],
    food: ['小笼包', '生煎馒头', '红烧肉', '大闸蟹（秋季）'],
    tips: ['外滩建议地铁出行', '豫园门票80元', '周末人流较大'],
  },
  成都: {
    morning: ['宽窄巷子（8:00前人少）', '青羊宫'],
    noon: ['锦里小吃街：钵钵鸡/担担面'],
    afternoon: ['武侯祠（三国文化）', '太古里'],
    evening: ['春熙路夜逛', '川剧变脸表演'],
    food: ['麻辣火锅', '夫妻肺片', '担担面', '龙抄手', '钵钵鸡'],
    tips: ['火锅建议中午吃（价格较便宜）', '熊猫基地需提前预约'],
  },
  西安: {
    morning: ['兵马俑（上午人少）', '秦始皇帝陵博物院'],
    noon: ['回民街：羊肉泡馍、肉夹馍、凉皮'],
    afternoon: ['城墙骑自行车', '碑林博物馆'],
    evening: ['大唐不夜城', '永兴坊摔碗酒'],
    food: ['肉夹馍', '羊肉泡馍', '凉皮', '葫芦鸡', '桂花糕'],
    tips: ['兵马俑在郊区打车约1小时', '大唐不夜城免费', '城墙租车60元/小时'],
  },
  杭州: {
    morning: ['西湖断桥漫步（清晨最美）', '苏堤春晓'],
    noon: ['楼外楼（西湖醋鱼/东坡肉）', '河坊街小吃'],
    afternoon: ['灵隐寺', '西溪湿地泛舟'],
    evening: ['印象西湖实景演出', '南宋御街夜游'],
    food: ['西湖醋鱼', '东坡肉', '龙井虾仁', '叫花鸡', '桂花藕粉'],
    tips: ['西湖免费开放', '灵隐寺门票75元', '雨天别有韵味'],
  },
  广州: {
    morning: ['陈家祠（岭南建筑精华）', '荔湾湖公园'],
    noon: ['早茶：虾饺/肠粉/叉烧包（点都德/广州酒家）'],
    afternoon: ['北京路步行街', '永庆坊老城区漫步'],
    evening: ['珠江夜游', '上下九步行街夜市'],
    food: ['肠粉', '虾饺', '叉烧', '云吞面', '椰汁糕'],
    tips: ['早茶建议11点前到避开高峰', '地铁1号线直达陈家祠', '夏季注意防暑'],
  },
  重庆: {
    morning: ['洪崖洞（仿古吊脚楼建筑）', '千厮门大桥观景'],
    noon: ['解放碑步行街附近火锅'],
    afternoon: ['磁器口古镇', '李子坝穿楼轻轨打卡'],
    evening: ['南山一棵树观景台（重庆夜景绝佳）', '洪崖洞夜景'],
    food: ['重庆火锅', '酸辣粉', '麻辣小面', '豆花饭', '陈麻花'],
    tips: ['重庆山城多坡道，舒适鞋必备', '洪崖洞夜间最美但人多', '轻轨2号线穿楼是网红打卡点'],
  },
  厦门: {
    morning: ['鼓浪屿（轮渡约35元，建议早上出发）', '日光岩俯瞰全岛'],
    noon: ['鼓浪屿海鲜午餐或台湾小吃'],
    afternoon: ['曾厝垵文创村', '厦大白城沙滩'],
    evening: ['中山路步行街小吃夜游', '八市海鲜大排档'],
    food: ['沙茶面', '海蛎煎', '土笋冻', '花生汤', '烧肉粽'],
    tips: ['鼓浪屿不允许私家车上岛', '曾厝垵周末人流大', '厦大校园需预约参观'],
  },
  苏州: {
    morning: ['拙政园（江南园林精华，约2小时）', '苏州博物馆（贝聿铭设计，免费）'],
    noon: ['观前街：松鼠桂鱼/响油鳝糊'],
    afternoon: ['平江路水乡古街漫步', '虎丘斜塔'],
    evening: ['山塘街夜游', '昆曲评弹表演'],
    food: ['松鼠桂鱼', '碧螺虾仁', '响油鳝糊', '苏式月饼', '鸡头米'],
    tips: ['拙政园门票90元，需提前预约', '苏博免费但需预约', '春秋两季最适合游园'],
  },
  南京: {
    morning: ['中山陵（孙中山纪念地）', '明孝陵（世界遗产）'],
    noon: ['夫子庙：鸭血粉丝/桂花鸭/小吃'],
    afternoon: ['秦淮河游船', '总统府近代史遗址'],
    evening: ['夫子庙灯会夜景', '1912街区'],
    food: ['鸭血粉丝汤', '盐水鸭', '桂花糖芋苗', '赤豆酒酿元宵', '状元豆'],
    tips: ['中山陵需登台阶约400级，量力而行', '夫子庙免费入场', '周末秦淮河人多'],
  },
}

const SECTION_CONFIG = [
  { key: 'morning', icon: '🌅', color: 'bg-blue-50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-800' },
  { key: 'noon', icon: '🍽️', color: 'bg-orange-50 dark:bg-orange-900/10 border-orange-100 dark:border-orange-800' },
  { key: 'afternoon', icon: '☀️', color: 'bg-yellow-50 dark:bg-yellow-900/10 border-yellow-100 dark:border-yellow-800' },
  { key: 'evening', icon: '🌆', color: 'bg-purple-50 dark:bg-purple-900/10 border-purple-100 dark:border-purple-800' },
  { key: 'food', icon: '🥢', color: 'bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-800' },
  { key: 'tips', icon: '💡', color: 'bg-green-50 dark:bg-green-900/10 border-green-100 dark:border-green-800' },
] as const

export default function DayTrip() {
  const { t } = useTranslation('toolDayTrip')
  const [city, setCity] = useState('')

  const plan = city ? CITIES[city] : null
  const cityList = Object.keys(CITIES)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <PageHero title={t('title')} description={t('description')} icon={Compass} />
      <div className="max-w-xl mx-auto px-4 py-6 space-y-4">

        {/* 城市选择 */}
        <div className="grid grid-cols-5 gap-2">
          {cityList.map(c => (
            <button key={c} onClick={() => setCity(c)}
              className={`py-2.5 rounded-xl text-sm font-medium transition-colors ${
                city === c
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-none'
                  : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-indigo-300'
              }`}>{c}</button>
          ))}
        </div>

        {/* 无选择提示 */}
        {!plan && (
          <div className="text-center py-16">
            <Compass className="w-16 h-16 mx-auto text-gray-200 dark:text-gray-600 mb-4" />
            <p className="text-gray-400 text-sm">{t('noCity')}</p>
          </div>
        )}

        {/* 行程卡片 */}
        {plan && (
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">📍 {city} 一日游路线</h2>
            {SECTION_CONFIG.map(({ key, icon, color }) => {
              const items = plan[key as keyof CityPlan]
              if (!items || items.length === 0) return null
              return (
                <div key={key} className={`rounded-xl border p-4 ${color}`}>
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    {icon} {t(key)}
                  </h3>
                  <ul className="space-y-1">
                    {items.map((item, i) => (
                      <li key={i} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                        <span className="text-gray-300 shrink-0 mt-0.5">•</span>{item}
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
