import { defineServiceModule } from '@toolbox/service-core'
import { registerIpOpsApiRoutes } from '../../../tools/tool-ip-ops-suite/server/ip-ops-api.js'
import { registerPingApiRoutes } from '../../../tools/tool-ping/server/ping-api.js'
import { registerTcpPortApiRoutes } from '../../../tools/tool-tcp-port/server/tcp-port-api.js'
import { registerTracerouteApiRoutes } from '../../../tools/tool-traceroute/server/traceroute-api.js'
import { registerCdnCheckApiRoutes } from '../../../tools/tool-cdn-check/server/cdn-check-api.js'
import { registerServerLatencyApiRoutes } from '../../../tools/tool-server-latency/server/server-latency-api.js'
import { registerApiAvailabilityApiRoutes } from '../../../tools/tool-api-availability/server/api-availability-api.js'
import { registerWebAvailabilityApiRoutes } from '../../../tools/tool-web-availability/server/web-availability-api.js'

export const ipService = defineServiceModule({
  id: 'ip-service',
  name: 'IP Service',
  version: '1.0.0',
  kind: 'domain',
  capabilities: ['ip-api', 'network-diagnostics-api'],
  async register(app) {
    registerIpOpsApiRoutes(app)
    registerPingApiRoutes(app)
    registerTcpPortApiRoutes(app)
    registerTracerouteApiRoutes(app)
    registerCdnCheckApiRoutes(app)
    registerServerLatencyApiRoutes(app)
    registerApiAvailabilityApiRoutes(app)
    registerWebAvailabilityApiRoutes(app)
  },
})
