import { defineToolManifest } from '@toolbox/tool-registry'
import { Boxes } from 'lucide-react'

const toolItemLocatorManifest = defineToolManifest({
  id: 'tool-item-locator',
  path: '/item-locator',
  namespace: 'toolItemLocator',
  mode: 'client',
  categoryKey: 'life',
  icon: Boxes,
  keywords: ['物品', '存放', '位置', '记录', '搜索', '衣物', '手表', '收纳', 'item', 'storage', 'inventory'],
  meta: {
    zh: {
      title: '物品放置记录',
      description: '记录衣物 / 手表 / 日常用品放在哪里；按类型 + 场景多维筛选，全文搜索，本地存储，再也不用翻箱倒柜',
    },
    en: {
      title: 'Item Locator',
      description: 'Record where you put clothes / watches / daily items; filter by category + scenario, full-text search, all local-only',
    },
  },
  loadComponent: () => import('./src/index'),
  loadMessages: {
    zh: () => import('./src/locales/zh.json'),
    en: () => import('./src/locales/en.json'),
  },
})

export default toolItemLocatorManifest
