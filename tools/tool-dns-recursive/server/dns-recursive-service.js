import dns from 'dns'
import { promisify } from 'util'
import net from 'net'

// 检测某个 IP 是否是开放递归 DNS 服务器
async function checkOpenRecursive(ip, domain = 'google.com') {
  return new Promise((resolve) => {
    const start = Date.now()
    const resolver = new dns.Resolver()
    resolver.setServers([ip])
    const fn = promisify(resolver.resolve4.bind(resolver))
    fn(domain)
      .then((records) => {
        resolve({
          ip,
          isOpen: true,
          latency: Date.now() - start,
          records,
          status: 'open',
          risk: 'high',
          riskDesc: '开放递归：可被用于 DNS 放大攻击',
        })
      })
      .catch((err) => {
        resolve({
          ip,
          isOpen: false,
          latency: Date.now() - start,
          status: 'closed',
          error: err.code,
          risk: 'low',
          riskDesc: '非开放递归：安全',
        })
      })
  })
}

// 检测 TCP 53 端口是否开放
async function checkPort53(ip) {
  return new Promise((resolve) => {
    const socket = new net.Socket()
    socket.setTimeout(3000)
    socket.connect(53, ip, () => {
      socket.destroy()
      resolve(true)
    })
    socket.on('error', () => resolve(false))
    socket.on('timeout', () => { socket.destroy(); resolve(false) })
  })
}

export async function checkDnsRecursive(targets) {
  const results = await Promise.all(
    targets.map(async (ip) => {
      const [recursive, tcp] = await Promise.all([
        checkOpenRecursive(ip),
        checkPort53(ip),
      ])
      return { ...recursive, tcpPort53Open: tcp }
    })
  )
  const openCount = results.filter((r) => r.isOpen).length
  return {
    targets,
    results,
    summary: {
      total: results.length,
      open: openCount,
      closed: results.length - openCount,
      riskLevel: openCount > 0 ? 'high' : 'low',
    },
  }
}
