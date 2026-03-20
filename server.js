// 后端API服务器
import express from 'express'
import path from 'path'
import { exec } from 'child_process'
import fs from 'fs'
import { fileURLToPath } from 'url'
import { registerSecurityApiRoutes } from './tools/tool-security-suite/server/security-api.js'
import { registerDnsNsApiRoutes } from './tools/tool-dns-ns/server/dns-ns-api.js'
import { registerDnsCnameChainApiRoutes } from './tools/tool-dns-cname-chain/server/dns-cname-chain-api.js'
import { registerDnsNxdomainApiRoutes } from './tools/tool-dns-nxdomain/server/dns-nxdomain-api.js'
import { registerDomainSuiteApiRoutes } from './tools/tool-domain-suite/server/domain-suite-api.js'
import { registerDomainMxApiRoutes } from './tools/tool-domain-mx/server/domain-mx-api.js'
import { registerDomainTxtApiRoutes } from './tools/tool-domain-txt/server/domain-txt-api.js'
import { registerIpOpsApiRoutes } from './tools/tool-ip-ops-suite/server/ip-ops-api.js'
import { registerHttpHeadersApiRoutes } from './tools/tool-http-headers/server/http-headers-api.js'
import { registerSslCertApiRoutes } from './tools/tool-ssl-cert/server/ssl-cert-api.js'
import { registerHttpStatusApiRoutes } from './tools/tool-http-status/server/http-status-api.js'
import { registerTcpPortApiRoutes } from './tools/tool-tcp-port/server/tcp-port-api.js'
import { registerPingApiRoutes } from './tools/tool-ping/server/ping-api.js'
import { registerDnsLatencyApiRoutes } from './tools/tool-dns-latency/server/dns-latency-api.js'
import { registerDnsAuthoritativeApiRoutes } from './tools/tool-dns-authoritative/server/dns-authoritative-api.js'
import { registerDnsRecursiveApiRoutes } from './tools/tool-dns-recursive/server/dns-recursive-api.js'
import { registerDnsPathVizApiRoutes } from './tools/tool-dns-path-viz/server/dns-path-viz-api.js'
import { registerDnsTunnelApiRoutes } from './tools/tool-dns-tunnel/server/dns-tunnel-api.js'
import { registerTracerouteApiRoutes } from './tools/tool-traceroute/server/traceroute-api.js'
import { registerWebAvailabilityApiRoutes } from './tools/tool-web-availability/server/web-availability-api.js'
import { registerSecurityDomainScoreApiRoutes } from './tools/tool-security-domain-score/server/security-domain-score-api.js'
import { registerDnssecVerifyApiRoutes } from './tools/tool-security-dnssec-verify/server/dnssec-verify-api.js'
import { registerSecurityDnsDdosApiRoutes } from './tools/tool-security-dns-ddos/server/dns-ddos-api.js'
import { registerCdnCheckApiRoutes } from './tools/tool-cdn-check/server/cdn-check-api.js'
import { registerServerLatencyApiRoutes } from './tools/tool-server-latency/server/server-latency-api.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3000

// 解析JSON请求体
app.use(express.json())
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
registerIpOpsApiRoutes(app)

// 静态文件服务
app.use(express.static(path.join(__dirname, 'dist')))

// API路由（新闻爬虫已改为 TypeScript 实现，无 Python 依赖）
app.get('/api/news', (req, res) => {
  const crawlerPath = path.join(__dirname, 'crawler', 'news_crawler.ts')
  const outputPath = '/tmp/news.json'
  exec(`npx tsx "${crawlerPath}" --output ${outputPath}`, { cwd: __dirname }, (error, stdout, stderr) => {
    if (error) {
      console.error('爬虫执行错误:', error.message)
      try {
        const news = JSON.parse(fs.readFileSync(path.join(__dirname, 'public/news.json'), 'utf-8'))
        res.json(news)
      } catch (e) {
        res.json([])
      }
      return
    }
    try {
      const news = JSON.parse(fs.readFileSync(outputPath, 'utf-8'))
      res.json(news)
    } catch (e) {
      res.json([])
    }
  })
})

app.get('/api/zipcode', (req, res) => {
  const q = req.query.q || ''
  // 简单的邮编查询模拟
  if (/^\d{6}$/.test(q)) {
    // 邮编查询
    res.json({
      code: q,
      province: '北京市',
      city: '北京市',
      district: '海淀区',
      address: '北京市海淀区相关地址'
    })
  } else {
    // 地址查询
    res.json({
      code: '100080',
      province: '北京市',
      city: '北京市',
      district: '海淀区',
      address: q
    })
  }
})

// 所有其他请求返回React应用
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'))
})

app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`)
})
