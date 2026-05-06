import { defineToolManifest } from '@toolbox/tool-registry'
import { FileText } from 'lucide-react'

const toolApiDocGenManifest = defineToolManifest({
  id: 'tool-api-doc-gen',
  path: '/api-doc-gen',
  namespace: 'toolApiDocGen',
  mode: 'client',
  categoryKey: 'dev',
  icon: FileText,
  keywords: ['api', 'doc', 'documentation', 'openapi', 'swagger', 'rest', 'markdown', 'API文档', '接口文档'],
  meta: {
    zh: {
      title: 'API 文档生成器',
      description: '根据接口信息生成 Markdown 和 HTML 文档，支持 OpenAPI/Swagger 规范',
    },
    en: {
      title: 'API Doc Generator',
      description: 'Generate Markdown and HTML documentation from API information, supports OpenAPI/Swagger',
    },
  },
  loadComponent: () => import('./src/index'),
  loadMessages: {
    zh: () => import('./src/locales/zh.json'),
    en: () => import('./src/locales/en.json'),
  },
})

export default toolApiDocGenManifest
