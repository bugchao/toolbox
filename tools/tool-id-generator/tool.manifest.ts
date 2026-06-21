import { defineToolManifest } from '@toolbox/tool-registry'
import { Fingerprint } from 'lucide-react'

const toolIdGeneratorManifest = defineToolManifest({
  id: 'tool-id-generator',
  path: '/id-generator',
  namespace: 'toolIdGenerator',
  mode: 'client',
  categoryKey: 'dev',
  icon: Fingerprint,
  keywords: [
    'uuid',
    'uuid v4',
    'uuid v7',
    'ulid',
    'nanoid',
    'id',
    'generator',
    'random',
    '唯一标识',
    '生成',
    '随机',
  ],
  meta: {
    zh: {
      title: 'ID 生成器',
      description: '生成 UUID v4 / v7、ULID、NanoID：批量、可调数量与 NanoID 长度，全部用 WebCrypto 本地生成；ULID/UUIDv7 时间有序。',
    },
    en: {
      title: 'ID Generator',
      description: 'Generate UUID v4 / v7, ULID and NanoID in bulk with adjustable count and NanoID length — all via WebCrypto, locally; ULID/UUIDv7 are time-ordered.',
    },
  },
  loadComponent: () => import('./src/index'),
  loadMessages: {
    zh: () => import('./src/locales/zh.json'),
    en: () => import('./src/locales/en.json'),
  },
})

export default toolIdGeneratorManifest
