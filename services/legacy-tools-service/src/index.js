import fs from 'node:fs'
import path from 'node:path'
import { exec } from 'node:child_process'
import { defineServiceModule } from '@toolbox/service-core'
import { registerHttpStatusApiRoutes } from '../../../tools/tool-http-status/server/http-status-api.js'
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
    'store-api',
    'news-api',
    'zipcode-api',
    'whois-api',
    'cert-api',
    'http-status-api',
    'legacy-bridge-api',
  ],
  async register(app, context) {
    const { rootDir } = context

    registerHttpStatusApiRoutes(app)
    registerWhoisLookupApiRoutes(app)
    registerCertToolsApiRoutes(app)
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
