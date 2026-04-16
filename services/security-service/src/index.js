import { defineServiceModule } from '@toolbox/service-core'
import { registerSecurityApiRoutes } from '../../../tools/tool-security-suite/server/security-api.js'
import { registerSecurityDomainScoreApiRoutes } from '../../../tools/tool-security-domain-score/server/security-domain-score-api.js'
import { registerDnssecVerifyApiRoutes } from '../../../tools/tool-security-dnssec-verify/server/dnssec-verify-api.js'
import { registerSecurityDnsDdosApiRoutes } from '../../../tools/tool-security-dns-ddos/server/dns-ddos-api.js'
import { registerSecurityDomainHijackApiRoutes } from '../../../tools/tool-security-domain-hijack/server/domain-hijack-api.js'
import { registerSslCertApiRoutes } from '../../../tools/tool-ssl-cert/server/ssl-cert-api.js'
import { registerHttpHeadersApiRoutes } from '../../../tools/tool-http-headers/server/http-headers-api.js'
import { registerCertToolsApiRoutes } from '../../../tools/tool-cert-suite-shared/server/cert-tools-api.js'

export const securityService = defineServiceModule({
  id: 'security-service',
  name: 'Security Service',
  version: '1.0.0',
  kind: 'domain',
  summary: 'Security scoring, DNS security, SSL, headers, and certificate APIs.',
  capabilities: ['security-api', 'ssl-api', 'http-security-api', 'cert-api'],
  routePrefixes: [
    '/api/security',
    '/api/ssl',
    '/api/http-headers',
    '/api/cert-tools',
  ],
  async register(app) {
    registerSecurityApiRoutes(app)
    registerSecurityDomainScoreApiRoutes(app)
    registerDnssecVerifyApiRoutes(app)
    registerSecurityDnsDdosApiRoutes(app)
    registerSecurityDomainHijackApiRoutes(app)
    registerSslCertApiRoutes(app)
    registerHttpHeadersApiRoutes(app)
    registerCertToolsApiRoutes(app)
  },
})
