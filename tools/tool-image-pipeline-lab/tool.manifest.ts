import { defineToolManifest } from '@toolbox/tool-registry'
import { FlaskConical } from 'lucide-react'

const toolImagePipelineLabManifest = defineToolManifest({
  id: 'tool-image-pipeline-lab',
  path: '/image-pipeline-lab',
  namespace: 'toolImagePipelineLab',
  mode: 'client',
  categoryKey: 'utils',
  icon: FlaskConical,
  keywords: ['pipeline', 'filter', 'image', '图像处理', '管线', '滤镜', '像素', '实验', '马赛克', '二值化'],
  meta: {
    zh: {
      title: '图像处理实验工作台',
      description: '责任链式效果叠加、参数调节、撤销/重做、流程保存',
    },
    en: {
      title: 'Image Pipeline Lab',
      description: 'Chainable image effects with live tuning, undo/redo and pipeline presets',
    },
  },
  loadComponent: () => import('./src/index'),
  loadMessages: {
    zh: () => import('./src/locales/zh.json'),
    en: () => import('./src/locales/en.json'),
  },
})

export default toolImagePipelineLabManifest
