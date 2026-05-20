// 垃圾分类数据库 —— 中国大陆 4 大类标准
// recyclable 可回收物 / wet 湿垃圾（厨余）/ dry 干垃圾（其他）/ hazardous 有害垃圾
// 数据为常见生活品目人工整理，部分条目地方标准可能略有差异

export type TrashCategory = 'recyclable' | 'wet' | 'dry' | 'hazardous'

export interface CategoryMeta {
  id: TrashCategory
  zh: string
  en: string
  emoji: string
  ringColor: string // tailwind classes for badge bg
  desc_zh: string
  desc_en: string
}

export const CATEGORIES: Record<TrashCategory, CategoryMeta> = {
  recyclable: {
    id: 'recyclable',
    zh: '可回收物',
    en: 'Recyclable',
    emoji: '♻️',
    ringColor: 'bg-sky-100 text-sky-700 border-sky-300',
    desc_zh: '废纸、塑料、玻璃、金属、织物等可再生利用',
    desc_en: 'Paper, plastic, glass, metal, textiles — reusable',
  },
  wet: {
    id: 'wet',
    zh: '湿垃圾 / 厨余',
    en: 'Wet / Food Waste',
    emoji: '🍃',
    ringColor: 'bg-emerald-100 text-emerald-700 border-emerald-300',
    desc_zh: '食物残渣、果皮等易腐生物质废弃物',
    desc_en: 'Food scraps and biodegradable organic waste',
  },
  dry: {
    id: 'dry',
    zh: '干垃圾 / 其他',
    en: 'Dry / Other Waste',
    emoji: '🗑️',
    ringColor: 'bg-gray-100 text-gray-700 border-gray-300',
    desc_zh: '除其它三类外的所有垃圾',
    desc_en: 'Everything not in the other three categories',
  },
  hazardous: {
    id: 'hazardous',
    zh: '有害垃圾',
    en: 'Hazardous',
    emoji: '☣️',
    ringColor: 'bg-rose-100 text-rose-700 border-rose-300',
    desc_zh: '电池、灯管、药品、化学品等有毒有害',
    desc_en: 'Batteries, bulbs, drugs, chemicals — toxic',
  },
}

export interface TrashItem {
  name: string
  category: TrashCategory
  /** 同义词 / 别名（用于检索） */
  aliases?: string[]
  /** 注意事项简短说明 */
  hint?: string
}

export const TRASH_DB: TrashItem[] = [
  // ─── 可回收物（约 30 条） ──────────────────────────────
  { name: '报纸', category: 'recyclable', aliases: ['旧报纸'] },
  { name: '纸箱', category: 'recyclable', aliases: ['快递盒', '纸盒', '硬纸盒'] },
  { name: '书本', category: 'recyclable', aliases: ['杂志', '广告纸', '宣传单'] },
  { name: '塑料瓶', category: 'recyclable', aliases: ['矿泉水瓶', '饮料瓶'], hint: '请将瓶身和瓶盖分别投放' },
  { name: '洗发水瓶', category: 'recyclable', aliases: ['沐浴露瓶', '化妆品瓶'] },
  { name: '塑料袋', category: 'recyclable', aliases: ['购物袋'], hint: '需洁净干燥，否则归干垃圾' },
  { name: '易拉罐', category: 'recyclable', aliases: ['啤酒罐', '可乐罐', '铝罐'] },
  { name: '铁罐头盒', category: 'recyclable', aliases: ['铁罐'] },
  { name: '玻璃瓶', category: 'recyclable', aliases: ['酒瓶', '罐头瓶'] },
  { name: '玻璃杯', category: 'recyclable', hint: '完整无破损' },
  { name: '旧衣服', category: 'recyclable', aliases: ['旧衣物', '布料'] },
  { name: '旧鞋', category: 'recyclable', aliases: ['旧鞋子'], hint: '请成对投放' },
  { name: '毛绒玩具', category: 'recyclable' },
  { name: '旧手机', category: 'recyclable', aliases: ['废旧手机', '废弃手机'] },
  { name: '旧电脑', category: 'recyclable', aliases: ['废旧电脑', '废弃电脑'] },
  { name: '充电器', category: 'recyclable', aliases: ['充电线', '数据线', 'usb线'] },
  { name: '电源适配器', category: 'recyclable', aliases: ['插线板', '排插'] },
  { name: '金属餐具', category: 'recyclable', aliases: ['不锈钢勺', '金属勺'] },
  { name: '铁锅', category: 'recyclable', aliases: ['炒锅', '不锈钢锅'] },
  { name: '牛奶盒', category: 'recyclable', aliases: ['利乐包装', '果汁盒'], hint: '请清洗后投放' },
  { name: '泡沫塑料', category: 'recyclable', aliases: ['泡沫箱', '泡沫板'] },
  { name: '旧家具', category: 'recyclable', aliases: ['废旧家具', '废家具'], hint: '大件需预约清运' },
  { name: '玩具', category: 'recyclable', aliases: ['塑料玩具'] },
  { name: '木制品', category: 'recyclable', aliases: ['废旧木材', '木板'] },
  { name: '锅碗瓢盆（金属）', category: 'recyclable', aliases: ['金属锅碗', '不锈钢盆'] },
  { name: '塑料盒', category: 'recyclable', aliases: ['塑料保鲜盒', '塑料饭盒'], hint: '清洁后' },
  { name: '快递袋', category: 'recyclable', hint: '清洁干燥' },
  { name: '空调外机', category: 'recyclable', aliases: ['废旧家电'] },
  { name: '台灯', category: 'recyclable', aliases: ['废旧灯具'], hint: '灯管/灯泡需单独按有害垃圾投放' },

  // ─── 湿垃圾 / 厨余（约 30 条） ─────────────────────────
  { name: '剩饭', category: 'wet', aliases: ['剩菜', '剩汤'] },
  { name: '米饭', category: 'wet', aliases: ['面条', '馒头', '包子'] },
  { name: '鱼骨', category: 'wet', aliases: ['鸡骨', '小骨头', '禽骨'], hint: '小骨头属湿垃圾，大骨头属干垃圾' },
  { name: '虾壳', category: 'wet', aliases: ['蟹壳', '贝壳', '海鲜壳'] },
  { name: '苹果皮', category: 'wet', aliases: ['梨皮', '果皮'] },
  { name: '橘子皮', category: 'wet', aliases: ['橙子皮', '柚子皮'] },
  { name: '香蕉皮', category: 'wet' },
  { name: '西瓜皮', category: 'wet', aliases: ['哈密瓜皮'] },
  { name: '菜叶', category: 'wet', aliases: ['菜根', '烂菜', '蔬菜'] },
  { name: '茶叶渣', category: 'wet', aliases: ['茶叶', '茶包'] },
  { name: '咖啡渣', category: 'wet', aliases: ['咖啡粉'] },
  { name: '蛋壳', category: 'wet' },
  { name: '花生壳', category: 'wet', aliases: ['坚果壳（小）', '瓜子壳'] },
  { name: '中药渣', category: 'wet', aliases: ['药渣'] },
  { name: '过期食物', category: 'wet', aliases: ['过期食品'], hint: '请去除外包装后投放' },
  { name: '动物内脏', category: 'wet' },
  { name: '生肉', category: 'wet', aliases: ['生肉边角料'] },
  { name: '熟食', category: 'wet', aliases: ['熟肉'] },
  { name: '樱桃核', category: 'wet', aliases: ['小水果核'] },
  { name: '葡萄', category: 'wet', aliases: ['草莓', '荔枝'] },
  { name: '面包', category: 'wet', aliases: ['蛋糕', '糕点'] },
  { name: '调味品', category: 'wet', aliases: ['过期调料'] },
  { name: '盆栽植物', category: 'wet', aliases: ['花卉', '残花', '枯叶'] },
  { name: '宠物饲料', category: 'wet', aliases: ['宠物粮'] },
  { name: '中药材', category: 'wet' },
  { name: '点心', category: 'wet' },
  { name: '冰激凌', category: 'wet', aliases: ['雪糕'], hint: '木棍/塑料杆单独按干垃圾' },
  { name: '酸奶', category: 'wet', hint: '空盒/瓶清洗后可回收' },

  // ─── 干垃圾 / 其他（约 30 条） ─────────────────────────
  { name: '纸巾', category: 'dry', aliases: ['湿纸巾', '卫生纸', '抽纸'] },
  { name: '卫生巾', category: 'dry', aliases: ['护垫'] },
  { name: '尿布', category: 'dry', aliases: ['纸尿裤'] },
  { name: '大骨头', category: 'dry', aliases: ['猪骨', '牛骨', '羊骨'] },
  { name: '椰子壳', category: 'dry', aliases: ['榴莲壳'] },
  { name: '一次性餐具', category: 'dry', aliases: ['一次性筷子', '塑料勺', '吸管'] },
  { name: '烟蒂', category: 'dry', aliases: ['烟头'] },
  { name: '灰尘', category: 'dry', aliases: ['扫地灰'] },
  { name: '陶瓷', category: 'dry', aliases: ['陶瓷碎片', '破碎瓷器'] },
  { name: '碎玻璃', category: 'dry', aliases: ['破碎玻璃'], hint: '需用纸/布包好' },
  { name: '棒棒糖棍', category: 'dry', aliases: ['冰棍棒'] },
  { name: '口香糖', category: 'dry' },
  { name: '创可贴', category: 'dry' },
  { name: '头发', category: 'dry', aliases: ['毛发'] },
  { name: '指甲', category: 'dry' },
  { name: '圆珠笔', category: 'dry', aliases: ['油性笔', '记号笔'] },
  { name: '橡皮擦', category: 'dry' },
  { name: '破袜子', category: 'dry', aliases: ['单只鞋', '单鞋'] },
  { name: '渣土', category: 'dry' },
  { name: '化妆海绵', category: 'dry', aliases: ['粉扑'] },
  { name: '剃须刀片', category: 'dry', aliases: ['一次性剃须刀'] },
  { name: '猫砂', category: 'dry', aliases: ['宠物粪便'] },
  { name: '吸尘器尘袋', category: 'dry' },
  { name: '镜子', category: 'dry', aliases: ['玻璃镜'] },
  { name: '陶瓷餐具', category: 'dry', hint: '完整可送旧物回收，破碎按干垃圾' },
  { name: '塑料桶（污染）', category: 'dry', hint: '被严重污染的塑料制品归干垃圾' },
  { name: '砂纸', category: 'dry' },
  { name: '陶瓷花盆', category: 'dry' },
  { name: '保鲜膜', category: 'dry', hint: '清洁可回收，污染按干垃圾' },

  // ─── 有害垃圾（约 20 条） ──────────────────────────────
  { name: '干电池', category: 'hazardous', aliases: ['一次性电池', '碱性电池'] },
  { name: '纽扣电池', category: 'hazardous', aliases: ['手表电池'] },
  { name: '充电电池', category: 'hazardous', aliases: ['锂电池', '镍镉电池'] },
  { name: '荧光灯管', category: 'hazardous', aliases: ['节能灯', '日光灯'] },
  { name: 'LED 灯泡', category: 'hazardous', aliases: ['灯泡'], hint: '含微量重金属，集中投放' },
  { name: '温度计', category: 'hazardous', aliases: ['水银温度计'] },
  { name: '血压计', category: 'hazardous', aliases: ['水银血压计'] },
  { name: '过期药品', category: 'hazardous', aliases: ['过期药', '废弃药品'], hint: '连包装一起投放' },
  { name: '保健品（过期）', category: 'hazardous' },
  { name: '油漆桶', category: 'hazardous', aliases: ['废油漆', '稀释剂'] },
  { name: '染发剂', category: 'hazardous', aliases: ['烫发剂'] },
  { name: '指甲油', category: 'hazardous', aliases: ['卸甲水'] },
  { name: '杀虫剂', category: 'hazardous', aliases: ['农药', '驱蚊剂'] },
  { name: '消毒剂', category: 'hazardous', aliases: ['杀菌剂'] },
  { name: 'X 光片', category: 'hazardous', aliases: ['相纸', '医用胶片'] },
  { name: '墨盒', category: 'hazardous', aliases: ['硒鼓', '碳粉盒'] },
  { name: '汞温度计', category: 'hazardous', aliases: ['水银'] },
  { name: '过期化妆品', category: 'hazardous' },
  { name: '强酸强碱', category: 'hazardous', aliases: ['洁厕灵', '通渠剂'] },
  { name: '胶水', category: 'hazardous', aliases: ['强力胶', '万能胶'] },
]

/**
 * 模糊匹配：查询 q（小写化、去空格）对所有条目按相关度评分
 * 评分：完全相等 > 别名相等 > 名称包含 > 别名包含 > 名称被查询包含（反向）
 */
export interface MatchResult {
  item: TrashItem
  score: number
}

export function searchTrash(q: string): MatchResult[] {
  const query = q.trim().toLowerCase()
  if (!query) return []
  const out: MatchResult[] = []
  for (const item of TRASH_DB) {
    const name = item.name.toLowerCase()
    const aliases = (item.aliases ?? []).map((a) => a.toLowerCase())
    let score = 0
    if (name === query) score = 100
    else if (aliases.includes(query)) score = 95
    else if (name.includes(query)) score = 80 - Math.abs(name.length - query.length)
    else if (aliases.some((a) => a.includes(query))) score = 70
    else if (query.length >= 2 && query.includes(name)) score = 60
    if (score > 0) out.push({ item, score })
  }
  out.sort((a, b) => b.score - a.score)
  return out
}
