import fs from 'node:fs'
import path from 'node:path'
import { exec } from 'node:child_process'
import { defineServiceModule } from '@toolbox/service-core'

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

export const contentService = defineServiceModule({
  id: 'content-service',
  name: 'Content Service',
  version: '1.0.0',
  kind: 'domain',
  summary: 'Content aggregation and feed-style APIs.',
  capabilities: ['news-api'],
  routePrefixes: ['/api/news'],
  async register(app, context) {
    const { rootDir } = context

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
  },
})
