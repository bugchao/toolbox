import { defineServiceModule } from '@toolbox/service-core'
import { registerRemoteShellApiRoutes } from '../../../tools/tool-remote-shell/server/remote-shell-api.js'
import { attachRemoteShellWebSocket } from '../../../tools/tool-remote-shell/server/ws-gateway.js'

export const remoteShellService = defineServiceModule({
  id: 'remote-shell-service',
  name: 'Remote Shell Service',
  version: '1.0.0',
  kind: 'domain',
  summary: 'WebSocket SSH terminal gateway. Set REMOTE_SHELL_TOKEN to require an access passphrase.',
  capabilities: ['remote-shell-ws'],
  routePrefixes: ['/api/remote-shell'],

  async register(app) {
    registerRemoteShellApiRoutes(app)
  },

  // WebSocket 需要 http.Server 而不是 Express app，所以单独开一个钩子，
  // 由 main.js 在 listen() 之后调用。未启用时返回 null，不装监听器。
  attachUpgrade(server) {
    return attachRemoteShellWebSocket(server)
  },
})
