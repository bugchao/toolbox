import { defineToolManifest } from '@toolbox/tool-registry'
import { Search } from 'lucide-react'

const toolWhoisLookupManifest = defineToolManifest({
  id: 'tool-whois-lookup',
  path: '/whois-lookup',
  namespace: 'toolWhoisLookup',
  mode: 'server',
  categoryKey: 'domain',
  icon: Search,
  keywords: ['whois', 'rdap', 'domain', 'ip', '域名', '注册信息'],
  meta: {
    zh: {
      title: 'WHOIS 查询',
      description: '查询域名或 IP 的注册信息、生命周期、名称服务器和原始 WHOIS 文本。',
    },
    en: {
      title: 'WHOIS Lookup',
      description: 'Inspect registration details, lifecycle dates, name servers, and raw WHOIS text for a domain or IP.',
    },
  },
  loadComponent: () => import('./src/index'),
  loadMessages: {
    zh: () => import('./src/locales/zh.json'),
    en: () => import('./src/locales/en.json'),
  },
})

export default toolWhoisLookupManifest
