import type { DohProvider } from './types'

export const DOH_PROVIDERS: DohProvider[] = [
  {
    id: 'cloudflare',
    name: 'Cloudflare',
    url: 'https://cloudflare-dns.com/dns-query',
    description: '注重隐私、全球延迟低',
    needsJsonAccept: true,
  },
  {
    id: 'google',
    name: 'Google',
    url: 'https://dns.google/resolve',
    description: 'Google 公共 DoH，全球通用',
    needsJsonAccept: false,
  },
  {
    id: 'quad9',
    name: 'Quad9',
    url: 'https://dns.quad9.org:5053/dns-query',
    description: '内置恶意域名过滤',
    needsJsonAccept: true,
  },
  {
    id: 'adguard',
    name: 'AdGuard',
    url: 'https://dns.adguard-dns.com/dns-query',
    description: '内置广告与跟踪器过滤',
    needsJsonAccept: true,
  },
  {
    id: 'alidns',
    name: '阿里 DNS',
    url: 'https://dns.alidns.com/resolve',
    description: '阿里云公共 DoH，国内解析速度快',
    needsJsonAccept: false,
  },
  {
    id: 'dnspod',
    name: '腾讯 DNSPod',
    url: 'https://doh.pub/dns-query',
    description: '腾讯 DNSPod 公共 DoH，国内解析速度快',
    needsJsonAccept: true,
  },
]
