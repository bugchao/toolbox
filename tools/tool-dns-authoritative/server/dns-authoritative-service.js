import dns from 'dns'
import { promisify } from 'util'

const resolve4 = promisify(dns.resolve4)
const resolve6 = promisify(dns.resolve6)
const resolveNs = promisify(dns.resolveNs)
const resolveSoa = promisify(dns.resolveSoa)

const RESOLVERS = [
  { name: 'Google', ip: '8.8.8.8' },
  { name: 'Cloudflare', ip: '1.1.1.1' },
  { name: 'Ali', ip: '223.5.5.5' },
  { name: 'Tencent', ip: '119.29.29.29' },
]

async function queryNsFromResolver(domain, resolverIp) {
  return new Promise((resolve) => {
    const resolver = new dns.Resolver()
    resolver.setServers([resolverIp])
    const fn = promisify(resolver.resolveNs.bind(resolver))
    fn(domain)
      .then((ns) => resolve({ ok: true, ns }))
      .catch((err) => resolve({ ok: false, error: err.code || err.message }))
  })
}

async function queryAFromResolver(domain, resolverIp) {
  return new Promise((resolve) => {
    const resolver = new dns.Resolver()
    resolver.setServers([resolverIp])
    const fn = promisify(resolver.resolve4.bind(resolver))
    fn(domain)
      .then((records) => resolve({ ok: true, records }))
      .catch((err) => resolve({ ok: false, error: err.code || err.message }))
  })
}

export async function checkDnsAuthoritative(domain) {
  // 1. 获取 NS 记录
  let nsRecords = []
  try { nsRecords = await resolveNs(domain) } catch {}

  // 2. 从多个解析器获取 NS，检查一致性
  const resolverResults = await Promise.all(
    RESOLVERS.map(async (r) => {
      const res = await queryNsFromResolver(domain, r.ip)
      return { resolver: r.name, ip: r.ip, ...res }
    })
  )

  // 3. 检查 NS 一致性
  const nsSets = resolverResults.filter((r) => r.ok).map((r) => r.ns.sort().join(','))
  const isConsistent = new Set(nsSets).size <= 1

  // 4. 获取 SOA
  let soa = null
  try { soa = await resolveSoa(domain) } catch {}

  // 5. 解析每个 NS 服务器的 IP
  const nsDetails = await Promise.all(
    nsRecords.map(async (ns) => {
      let ips = []
      try { ips = await resolve4(ns) } catch {}
      return { ns, ips }
    })
  )

  return {
    domain,
    nsRecords,
    nsDetails,
    soa,
    resolverResults,
    isConsistent,
    summary: isConsistent
      ? `✅ NS 记录一致（${nsRecords.length} 个权威服务器）`
      : `⚠️ NS 记录不一致，可能存在传播延迟`,
  }
}
