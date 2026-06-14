import { defineToolManifest } from '@toolbox/tool-registry'
import { KeySquare } from 'lucide-react'

const toolJwtBuilderManifest = defineToolManifest({
  id: 'tool-jwt-builder',
  path: '/jwt-builder',
  namespace: 'toolJwtBuilder',
  mode: 'client',
  categoryKey: 'dev',
  icon: KeySquare,
  keywords: [
    'jwt',
    'sign',
    'hmac',
    'hs256',
    'hs384',
    'hs512',
    'token',
    'webcrypto',
    '签名',
    '令牌',
    '生成',
  ],
  meta: {
    zh: {
      title: 'JWT 生成器',
      description: '用 WebCrypto 在浏览器本地签发 HS256 / HS384 / HS512 JWT：自定义 payload 与 header、密钥支持 UTF-8 / Base64、附带签名验证。',
    },
    en: {
      title: 'JWT Builder',
      description: 'Sign HS256 / HS384 / HS512 JWTs locally with WebCrypto: custom payload & header, UTF-8 / Base64 secrets, plus signature verification.',
    },
  },
  loadComponent: () => import('./src/index'),
  loadMessages: {
    zh: () => import('./src/locales/zh.json'),
    en: () => import('./src/locales/en.json'),
  },
})

export default toolJwtBuilderManifest
