import { exec } from 'child_process'
import dns from 'dns'
import { promisify } from 'util'

const execAsync = promisify(exec)
const resolve4 = promisify(dns.resolve4)

async function resolveHost(target) {
  try {
    const ips = await resolve4(target)
    return ips[0] || target
  } catch {
    return target
  }
}

function parseTracerouteOutput(output) {
  const hops = []
  const lines = output.split('\n').filter(l => l.trim())

  for (const line of lines) {
    // 匹配格式: " 1  192.168.1.1 (192.168.1.1)  1.234 ms  1.100 ms  0.987 ms"
    const hopMatch = line.match(/^\s*(\d+)\s+/)
    if (!hopMatch) continue

    const hop = parseInt(hopMatch[1])
    if (hop < 1 || hop > 64) continue

    // 超时行: " 5  * * *"
    if (line.match(/\*\s*\*\s*\*/)) {
      hops.push({ hop, ip: null, hostname: null, rtt1: null, rtt2: null, rtt3: null, status: 'timeout' })
      continue
    }

    // 解析 IP
    const ipMatch = line.match(/(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/)
    const hostnameMatch = line.match(/([a-zA-Z][a-zA-Z0-9.-]+)\s*\(/)
    const rtts = [...line.matchAll(/([\d.]+)\s*ms/g)].map(m => parseFloat(m[1]))

    hops.push({
      hop,
      ip: ipMatch ? ipMatch[1] : null,
      hostname: hostnameMatch ? hostnameMatch[1] : null,
      rtt1: rtts[0] ?? null,
      rtt2: rtts[1] ?? null,
      rtt3: rtts[2] ?? null,
      status: 'success',
    })
  }
  return hops
}

export async function runTraceroute(target) {
  const start = Date.now()

  // 安全校验
  if (!/^[a-zA-Z0-9._-]+$/.test(target)) {
    throw new Error('无效的目标地址')
  }

  const resolvedIp = await resolveHost(target)

  try {
    // macOS/Linux: traceroute; Windows: tracert
    const cmd = process.platform === 'win32'
      ? `tracert -h 30 -w 1000 ${target}`
      : `traceroute -m 30 -w 2 -q 3 ${target}`

    const { stdout } = await execAsync(cmd, { timeout: 60000 })
    const hops = parseTracerouteOutput(stdout)
    const lastHop = hops[hops.length - 1]
    const completed = lastHop?.ip === resolvedIp || lastHop?.ip === target

    return {
      target,
      resolvedIp,
      hops,
      completed,
      totalMs: Date.now() - start,
    }
  } catch (e) {
    if (e.stdout) {
      const hops = parseTracerouteOutput(e.stdout)
      return { target, resolvedIp, hops, completed: false, totalMs: Date.now() - start }
    }
    throw new Error(`Traceroute 执行失败: ${e.message}`)
  }
}
