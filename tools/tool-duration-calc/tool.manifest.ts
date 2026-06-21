import { defineToolManifest } from '@toolbox/tool-registry'
import { Timer } from 'lucide-react'

const toolDurationCalcManifest = defineToolManifest({
  id: 'tool-duration-calc',
  path: '/duration-calc',
  namespace: 'toolDurationCalc',
  mode: 'client',
  categoryKey: 'dev',
  icon: Timer,
  keywords: [
    'duration',
    'time',
    'convert',
    'humanize',
    'seconds',
    'clock',
    '时长',
    '时间',
    '换算',
    '人性化',
  ],
  meta: {
    zh: {
      title: '时长计算器',
      description: '解析 1d2h30m 等时长串、各单位（ms/s/m/h/d/w）互转、秒数人性化、时钟格式，并可加减到基准时间。纯本地。',
    },
    en: {
      title: 'Duration Calculator',
      description: 'Parse durations like 1d2h30m, convert across units (ms/s/m/h/d/w), humanize, clock-format, and add/subtract to a base time. Fully local.',
    },
  },
  loadComponent: () => import('./src/index'),
  loadMessages: {
    zh: () => import('./src/locales/zh.json'),
    en: () => import('./src/locales/en.json'),
  },
})

export default toolDurationCalcManifest
