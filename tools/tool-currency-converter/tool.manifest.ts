import type { ToolManifest } from '@toolbox/tool-registry'

const manifest: ToolManifest = {
  path: '/currency-converter',
  meta: {
    zh: {
      title: '汇率换算',
      description: '实时汇率换算，支持多种货币',
    },
    en: {
      title: 'Currency Converter',
      description: 'Real-time currency conversion with multiple currencies',
    },
  },
  component: () => import('./src/index'),
}

export default manifest
