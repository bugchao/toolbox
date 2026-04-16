import { defineServiceModule } from '@toolbox/service-core'
import { registerDnsNsApiRoutes } from '../../../tools/tool-dns-ns/server/dns-ns-api.js'
import { registerDnsCnameChainApiRoutes } from '../../../tools/tool-dns-cname-chain/server/dns-cname-chain-api.js'
import { registerDnsNxdomainApiRoutes } from '../../../tools/tool-dns-nxdomain/server/dns-nxdomain-api.js'
import { registerDomainSuiteApiRoutes } from '../../../tools/tool-domain-suite/server/domain-suite-api.js'
import { registerDomainMxApiRoutes } from '../../../tools/tool-domain-mx/server/domain-mx-api.js'
import { registerDomainTxtApiRoutes } from '../../../tools/tool-domain-txt/server/domain-txt-api.js'
import { registerDnsLatencyApiRoutes } from '../../../tools/tool-dns-latency/server/dns-latency-api.js'
import { registerDnsAuthoritativeApiRoutes } from '../../../tools/tool-dns-authoritative/server/dns-authoritative-api.js'
import { registerDnsRecursiveApiRoutes } from '../../../tools/tool-dns-recursive/server/dns-recursive-api.js'
import { registerDnsPathVizApiRoutes } from '../../../tools/tool-dns-path-viz/server/dns-path-viz-api.js'
import { registerDnsTunnelApiRoutes } from '../../../tools/tool-dns-tunnel/server/dns-tunnel-api.js'
import { registerWhoisLookupApiRoutes } from '../../../tools/tool-whois-lookup/server/whois-lookup-api.js'

export const dnsService = defineServiceModule({
  id: 'dns-service',
  name: 'DNS Service',
  version: '1.0.0',
  kind: 'domain',
  capabilities: ['dns-api', 'domain-api', 'whois-api'],
  async register(app) {
    registerDnsNsApiRoutes(app)
    registerDnsCnameChainApiRoutes(app)
    registerDnsNxdomainApiRoutes(app)
    registerDomainSuiteApiRoutes(app)
    registerDomainMxApiRoutes(app)
    registerDomainTxtApiRoutes(app)
    registerDnsLatencyApiRoutes(app)
    registerDnsAuthoritativeApiRoutes(app)
    registerDnsRecursiveApiRoutes(app)
    registerDnsPathVizApiRoutes(app)
    registerDnsTunnelApiRoutes(app)
    registerWhoisLookupApiRoutes(app)
  },
})
