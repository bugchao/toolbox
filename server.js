import { startApiGateway } from './apps/api-gateway/src/main.js'

startApiGateway().catch((error) => {
  console.error('[server] failed to start api gateway:', error)
  process.exitCode = 1
})
