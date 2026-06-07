import { defineToolManifest } from '@toolbox/tool-registry'
import { ShieldCheck } from 'lucide-react'

const toolJsonSchemaValidatorManifest = defineToolManifest({
  id: 'tool-json-schema-validator',
  path: '/json-schema-validator',
  namespace: 'toolJsonSchemaValidator',
  mode: 'client',
  categoryKey: 'dev',
  icon: ShieldCheck,
  keywords: [
    'json',
    'schema',
    'json-schema',
    'validate',
    'ajv',
    'draft-07',
    'draft-2019-09',
    'draft-2020-12',
    'json校验',
    'JSON Schema 校验',
    '数据校验',
  ],
  meta: {
    zh: {
      title: 'JSON Schema 校验器',
      description:
        '在浏览器本地用 Ajv 校验 JSON 数据是否符合 JSON Schema，支持 draft-07 / 2019-09 / 2020-12，详细错误定位到 JSON Path。',
    },
    en: {
      title: 'JSON Schema Validator',
      description:
        'Validate JSON data against a JSON Schema locally with Ajv. Supports draft-07 / 2019-09 / 2020-12 with detailed JSON-Path error locations.',
    },
  },
  loadComponent: () => import('./src/index'),
  loadMessages: {
    zh: () => import('./src/locales/zh.json'),
    en: () => import('./src/locales/en.json'),
  },
})

export default toolJsonSchemaValidatorManifest
