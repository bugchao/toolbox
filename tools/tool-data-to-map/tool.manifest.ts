import { defineToolManifest } from '@toolbox/tool-registry'
import { Map } from 'lucide-react'

const toolDataToMapManifest = defineToolManifest({
  id: 'tool-data-to-map',
  path: '/data-to-map',
  namespace: 'toolDataToMap',
  mode: 'client',
  categoryKey: 'utility',
  icon: Map,
  keywords: [
    'map',
    'choropleth',
    'echarts',
    'geojson',
    'china map',
    'world map',
    'visualization',
    '地图',
    '数据地图',
    '中国地图',
    '世界地图',
    '可视化',
    '数据可视化',
  ],
  meta: {
    zh: {
      title: '数据地图可视化',
      description: '上传 CSV/JSON 区域数据，在中国地图或世界地图上生成分级着色可视化，纯本地处理。',
    },
    en: {
      title: 'Data to Map',
      description: 'Upload CSV/JSON region data and visualize it as a choropleth on a China or World map, fully local.',
    },
  },
  loadComponent: () => import('./src/index'),
  loadMessages: {
    zh: () => import('./src/locales/zh.json'),
    en: () => import('./src/locales/en.json'),
  },
})

export default toolDataToMapManifest
