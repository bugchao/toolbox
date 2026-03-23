import { defineToolManifest } from '@toolbox/tool-registry'

const toolJwtDecoderManifest = defineToolManifest({
  id: 'tool-jwt-decoder',
  path: '/jwt-decoder',
  namespace: 'toolJwtDecoder',
  mode: 'client',
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
  loadComponent: () => import('./src/JwtDecoder'),
  loadMessages: {
    zh: () => import('./src/locales/zh.json'),
    en: () => import('./src/locales/en.json'),
  },
})

export default toolJwtDecoderManifest
