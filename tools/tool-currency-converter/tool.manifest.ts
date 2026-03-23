import { defineToolManifest } from '@toolbox/tool-registry'

const toolCurrencyConverterManifest = defineToolManifest({
  id: 'tool-currency-converter',
  path: '/currency-converter',
  namespace: 'toolCurrencyConverter',
  mode: 'client',
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
  loadComponent: () => import('./src/CurrencyConverter'),
  loadMessages: {
    zh: () => import('./src/locales/zh.json'),
    en: () => import('./src/locales/en.json'),
  },
})

export default toolCurrencyConverterManifest
