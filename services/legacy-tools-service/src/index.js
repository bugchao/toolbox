import fs from 'node:fs'
import path from 'node:path'
import { exec } from 'node:child_process'
import { defineServiceModule } from '@toolbox/service-core'
import { registerSecurityApiRoutes } from '../../../tools/tool-security-suite/server/security-api.js'
import { registerDnsNsApiRoutes } from '../../../tools/tool-dns-ns/server/dns-ns-api.js'
import { registerDnsCnameChainApiRoutes } from '../../../tools/tool-dns-cname-chain/server/dns-cname-chain-api.js'
import { registerDnsNxdomainApiRoutes } from '../../../tools/tool-dns-nxdomain/server/dns-nxdomain-api.js'
import { registerDomainSuiteApiRoutes } from '../../../tools/tool-domain-suite/server/domain-suite-api.js'
import { registerDomainMxApiRoutes } from '../../../tools/tool-domain-mx/server/domain-mx-api.js'
import { registerDomainTxtApiRoutes } from '../../../tools/tool-domain-txt/server/domain-txt-api.js'
import { registerIpOpsApiRoutes } from '../../../tools/tool-ip-ops-suite/server/ip-ops-api.js'
import { registerHttpHeadersApiRoutes } from '../../../tools/tool-http-headers/server/http-headers-api.js'
import { registerSslCertApiRoutes } from '../../../tools/tool-ssl-cert/server/ssl-cert-api.js'
import { registerHttpStatusApiRoutes } from '../../../tools/tool-http-status/server/http-status-api.js'
import { registerTcpPortApiRoutes } from '../../../tools/tool-tcp-port/server/tcp-port-api.js'
import { registerPingApiRoutes } from '../../../tools/tool-ping/server/ping-api.js'
import { registerDnsLatencyApiRoutes } from '../../../tools/tool-dns-latency/server/dns-latency-api.js'
import { registerDnsAuthoritativeApiRoutes } from '../../../tools/tool-dns-authoritative/server/dns-authoritative-api.js'
import { registerDnsRecursiveApiRoutes } from '../../../tools/tool-dns-recursive/server/dns-recursive-api.js'
import { registerDnsPathVizApiRoutes } from '../../../tools/tool-dns-path-viz/server/dns-path-viz-api.js'
import { registerDnsTunnelApiRoutes } from '../../../tools/tool-dns-tunnel/server/dns-tunnel-api.js'
import { registerTracerouteApiRoutes } from '../../../tools/tool-traceroute/server/traceroute-api.js'
import { registerWebAvailabilityApiRoutes } from '../../../tools/tool-web-availability/server/web-availability-api.js'
import { registerSecurityDomainScoreApiRoutes } from '../../../tools/tool-security-domain-score/server/security-domain-score-api.js'
import { registerDnssecVerifyApiRoutes } from '../../../tools/tool-security-dnssec-verify/server/dnssec-verify-api.js'
import { registerSecurityDnsDdosApiRoutes } from '../../../tools/tool-security-dns-ddos/server/dns-ddos-api.js'
import { registerCdnCheckApiRoutes } from '../../../tools/tool-cdn-check/server/cdn-check-api.js'
import { registerServerLatencyApiRoutes } from '../../../tools/tool-server-latency/server/server-latency-api.js'
import { registerApiAvailabilityApiRoutes } from '../../../tools/tool-api-availability/server/api-availability-api.js'
import { registerSecurityDomainHijackApiRoutes } from '../../../tools/tool-security-domain-hijack/server/domain-hijack-api.js'
import { registerStoreApiRoutes } from '../../../server/store-api.js'
import { registerWhoisLookupApiRoutes } from '../../../tools/tool-whois-lookup/server/whois-lookup-api.js'
import { registerCertToolsApiRoutes } from '../../../tools/tool-cert-suite-shared/server/cert-tools-api.js'

function readNewsFallback(rootDir) {
  const candidates = [
    path.join(rootDir, 'apps/web/public/news.json'),
    path.join(rootDir, 'public/news.json'),
  ]

  for (const candidate of candidates) {
    if (!fs.existsSync(candidate)) continue

    try {
      return JSON.parse(fs.readFileSync(candidate, 'utf-8'))
    } catch {
      return []
    }
  }

  return []
}

export const legacyToolsService = defineServiceModule({
  id: 'legacy-tools-bridge',
  name: 'Legacy Tools Bridge',
  version: '1.0.0',
  kind: 'bridge',
  capabilities: [
    'network-api',
    'security-api',
    'domain-api',
    'store-api',
    'news-api',
    'zipcode-api',
  ],
  async register(app, context) {
    const { rootDir } = context

    registerSecurityApiRoutes(app)
    registerDnsCnameChainApiRoutes(app)
    registerDnsNsApiRoutes(app)
    registerDomainSuiteApiRoutes(app)
    registerDomainTxtApiRoutes(app)
    registerDomainMxApiRoutes(app)
    registerDnsNxdomainApiRoutes(app)
    registerHttpHeadersApiRoutes(app)
    registerSslCertApiRoutes(app)
    registerHttpStatusApiRoutes(app)
    registerTcpPortApiRoutes(app)
    registerPingApiRoutes(app)
    registerDnsLatencyApiRoutes(app)
    registerDnsAuthoritativeApiRoutes(app)
    registerDnsRecursiveApiRoutes(app)
    registerDnsPathVizApiRoutes(app)
    registerDnsTunnelApiRoutes(app)
    registerTracerouteApiRoutes(app)
    registerWebAvailabilityApiRoutes(app)
    registerSecurityDomainScoreApiRoutes(app)
    registerDnssecVerifyApiRoutes(app)
    registerSecurityDnsDdosApiRoutes(app)
    registerCdnCheckApiRoutes(app)
    registerServerLatencyApiRoutes(app)
    registerApiAvailabilityApiRoutes(app)
    registerSecurityDomainHijackApiRoutes(app)
    registerWhoisLookupApiRoutes(app)
    registerCertToolsApiRoutes(app)
    registerIpOpsApiRoutes(app)
    await registerStoreApiRoutes(app).catch((error) => {
      console.warn('[store-api] init error:', error.message)
    })

    app.get('/api/news', (req, res) => {
      const crawlerPath = path.join(rootDir, 'crawler', 'news_crawler.ts')
      const outputPath = '/tmp/news.json'

      exec(
        `npx tsx "${crawlerPath}" --output ${outputPath}`,
        { cwd: rootDir },
        (error) => {
          if (error) {
            console.error('爬虫执行错误:', error.message)
            res.json(readNewsFallback(rootDir))
            return
          }

          try {
            const news = JSON.parse(fs.readFileSync(outputPath, 'utf-8'))
            res.json(news)
          } catch {
            res.json(readNewsFallback(rootDir))
          }
        }
      )
    })

    app.get('/api/zipcode', (req, res) => {
      const q = String(req.query.q || '')

      if (/^\d{6}$/.test(q)) {
        res.json({
          code: q,
          province: '北京市',
          city: '北京市',
          district: '海淀区',
          address: '北京市海淀区相关地址',
        })
        return
      }

      res.json({
        code: '100080',
        province: '北京市',
        city: '北京市',
        district: '海淀区',
        address: q,
      })
    })
  },
})
