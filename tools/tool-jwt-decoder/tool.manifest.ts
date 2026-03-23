import type { ToolManifest } from '@toolbox/tool-registry'

const manifest: ToolManifest = {
  path: '/jwt-decoder',
  meta: {
    zh: {
      title: 'JWT 解析工具',
      description: '解码 JWT Token，查看 Header 和 Payload',
    },
    en: {
      title: 'JWT Decoder',
      description: 'Decode JWT tokens and view Header and Payload',
    },
  },
  component: () => import('./src/index'),
}

export default manifest
