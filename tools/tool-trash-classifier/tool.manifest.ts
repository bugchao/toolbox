import { defineToolManifest } from '@toolbox/tool-registry'
import { Recycle } from 'lucide-react'

const toolTrashClassifierManifest = defineToolManifest({
  id: 'tool-trash-classifier',
  path: '/trash-classifier',
  namespace: 'toolTrashClassifier',
  mode: 'client',
  categoryKey: 'life',
  icon: Recycle,
  keywords: ['垃圾分类', '环保', '可回收', '湿垃圾', '干垃圾', '有害', 'trash', 'recycle'],
  meta: {
    zh: {
      title: '垃圾分类助手',
      description: '内置 100+ 常见品目，输入物品名查询所属四大类（可回收/湿/干/有害），支持模糊匹配、随机抽题、自定义补录',
    },
    en: {
      title: 'Trash Classifier',
      description: '100+ built-in items: type any item to see its category (recyclable / wet / dry / hazardous); fuzzy match, random draw, and custom entries',
    },
  },
  loadComponent: () => import('./src/index'),
  loadMessages: {
    zh: () => import('./src/locales/zh.json'),
    en: () => import('./src/locales/en.json'),
  },
})

export default toolTrashClassifierManifest
