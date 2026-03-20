import dns from 'dns'
import { promisify } from 'util'

const DNS_SERVERS = [
  { name: 'Google', ip: '8.8.8.8' },
  { name: 'Cloudflare', ip: '1.1.1.1' },
  { name: 'Ali', ip: '223.5.5.5' },
  { name: 'Tencent', ip: '119.29.29.29' },
  { name: 'Baidu', ip: '180.76.76.76' },
  { name: '114DNS', ip: '114.114.114.114' },
]

async function queryWithServer(domain, server, type = 'A') {
  return new Promise((resolve) => {
    const start = Date.now()
    const resolver = new dns.Resolver()
    resolver.setServers([server.ip])
    const method = type === 'A' ? resolver.resolve4 : type === 'AAAA' ? resolver.resolve6 : resolver.resolve
    const fn = promisify(method.bind(resolver))
    fn(domain)
      .then((records) => {
        resolve({
          server: server.name,
          ip: server.ip,
          latency: Date.now() - start,
          status: 'ok',
          records: Array.isArray(records) ? records.slice(0, 3) : [],
        })
      })
      .catch((err) => {
        resolve({
          server: server.name,
          ip: server.ip,
          latency: Date.now() - start,
          status: 'error',
          error: err.code || err.message,
          records: [],
        })
      })
  })
}

export async function analyzeDnsLatency(domain, type = 'A') {
  const results = await Promise.all(
    DNS_SERVERS.map((server) => queryWithServer(domain, server, type))
  )
  const successful = results.filter((r) => r.status === 'ok')
  const avg = successful.length
    ? Math.round(successful.reduce((s, r) => s + r.latency, 0) / successful.length)
    : null
  const min = successful.length ? Math.min(...successful.map((r) => r.latency)) : null
  const max = successful.length ? Math.max(...successful.map((r) => r.latency)) : null
  return { domain, type, results, stats: { avg, min, max, total: results.length, success: successful.length } }
}
