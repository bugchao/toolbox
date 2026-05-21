// 物品类型与场景预设

export type CategoryId =
  | 'clothing'
  | 'shoesBags'
  | 'watchJewelry'
  | 'electronics'
  | 'documents'
  | 'cosmetics'
  | 'tools'
  | 'medicine'
  | 'food'
  | 'books'
  | 'toys'
  | 'decor'
  | 'other'

export type ScenarioId =
  | 'homeBedroom'
  | 'homeLiving'
  | 'homeKitchen'
  | 'homeStudy'
  | 'homeStorage'
  | 'homeBalcony'
  | 'homeBathroom'
  | 'office'
  | 'car'
  | 'warehouse'
  | 'friend'
  | 'otherPlace'

export interface CategoryMeta {
  id: CategoryId
  zh: string
  en: string
  emoji: string
}
export interface ScenarioMeta {
  id: ScenarioId
  zh: string
  en: string
  emoji: string
}

export const CATEGORIES: CategoryMeta[] = [
  { id: 'clothing', zh: '衣物', en: 'Clothing', emoji: '👕' },
  { id: 'shoesBags', zh: '鞋包', en: 'Shoes / Bags', emoji: '👜' },
  { id: 'watchJewelry', zh: '首饰 / 手表', en: 'Jewelry / Watch', emoji: '⌚' },
  { id: 'electronics', zh: '电子产品', en: 'Electronics', emoji: '💻' },
  { id: 'documents', zh: '文档 / 证件', en: 'Documents', emoji: '📄' },
  { id: 'cosmetics', zh: '化妆 / 护肤', en: 'Cosmetics', emoji: '💄' },
  { id: 'tools', zh: '工具 / 五金', en: 'Tools', emoji: '🔧' },
  { id: 'medicine', zh: '药品 / 保健', en: 'Medicine', emoji: '💊' },
  { id: 'food', zh: '食品', en: 'Food', emoji: '🍱' },
  { id: 'books', zh: '书籍 / 文具', en: 'Books / Stationery', emoji: '📚' },
  { id: 'toys', zh: '玩具', en: 'Toys', emoji: '🧸' },
  { id: 'decor', zh: '装饰品', en: 'Decor', emoji: '🎨' },
  { id: 'other', zh: '其他', en: 'Other', emoji: '📦' },
]

export const SCENARIOS: ScenarioMeta[] = [
  { id: 'homeBedroom', zh: '家中-卧室', en: 'Home · Bedroom', emoji: '🛏️' },
  { id: 'homeLiving', zh: '家中-客厅', en: 'Home · Living Room', emoji: '🛋️' },
  { id: 'homeKitchen', zh: '家中-厨房', en: 'Home · Kitchen', emoji: '🍴' },
  { id: 'homeStudy', zh: '家中-书房', en: 'Home · Study', emoji: '📖' },
  { id: 'homeStorage', zh: '家中-储物间', en: 'Home · Storage', emoji: '🗄️' },
  { id: 'homeBalcony', zh: '家中-阳台', en: 'Home · Balcony', emoji: '🌿' },
  { id: 'homeBathroom', zh: '家中-卫生间', en: 'Home · Bathroom', emoji: '🛁' },
  { id: 'office', zh: '办公室', en: 'Office', emoji: '💼' },
  { id: 'car', zh: '车里', en: 'Car', emoji: '🚗' },
  { id: 'warehouse', zh: '仓储 / 寄存', en: 'Warehouse', emoji: '🏬' },
  { id: 'friend', zh: '朋友处', en: 'At a friend\'s', emoji: '👫' },
  { id: 'otherPlace', zh: '其他场所', en: 'Other place', emoji: '📍' },
]

export const CATEGORY_BY_ID: Record<CategoryId, CategoryMeta> =
  CATEGORIES.reduce((m, c) => ((m[c.id] = c), m), {} as Record<CategoryId, CategoryMeta>)
export const SCENARIO_BY_ID: Record<ScenarioId, ScenarioMeta> =
  SCENARIOS.reduce((m, c) => ((m[c.id] = c), m), {} as Record<ScenarioId, ScenarioMeta>)
