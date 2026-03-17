const IPV4_REGEX =
  /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)$/

export interface CidrInfo {
  cidr: string
  ip: string
  prefix: number
  mask: string
  network: string
  broadcast: string
  firstUsable: string
  lastUsable: string
  total: number
  usable: number
  startInt: number
  endInt: number
}

export interface PlanRequest {
  id: string
  name: string
  hosts: number
}

export interface PlannedSubnet {
  name: string
  requestedHosts: number
  capacity: number
  cidr: string
  network: string
  firstUsable: string
  lastUsable: string
  prefix: number
}

export function isValidIpv4(value: string) {
  return IPV4_REGEX.test(value.trim())
}

export function ipv4ToInt(ip: string) {
  if (!isValidIpv4(ip)) throw new Error(`Invalid IPv4: ${ip}`)
  return ip.split('.').map(Number).reduce((acc, part) => ((acc << 8) | part) >>> 0, 0)
}

export function intToIpv4(value: number) {
  return [(value >>> 24) & 255, (value >>> 16) & 255, (value >>> 8) & 255, value & 255].join('.')
}

export function prefixToMask(prefix: number) {
  const mask = prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0
  return intToIpv4(mask >>> 0)
}

export function maskToPrefix(mask: string) {
  if (!isValidIpv4(mask)) throw new Error('Invalid subnet mask')
  const binary = mask
    .split('.')
    .map((part) => Number(part).toString(2).padStart(8, '0'))
    .join('')
  if (!/^1*0*$/.test(binary)) throw new Error('Subnet mask is not contiguous')
  return binary.indexOf('0') === -1 ? 32 : binary.indexOf('0')
}

export function parseCidr(input: string): CidrInfo {
  const trimmed = input.trim()
  const [ip, prefixRaw] = trimmed.split('/')
  const prefix = Number(prefixRaw)
  if (!isValidIpv4(ip) || !Number.isInteger(prefix) || prefix < 0 || prefix > 32) {
    throw new Error(`Invalid CIDR: ${input}`)
  }

  const ipInt = ipv4ToInt(ip)
  const blockSize = 2 ** (32 - prefix)
  const mask = prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0
  const networkInt = ipInt & mask
  const broadcastInt = (networkInt + blockSize - 1) >>> 0
  const total = blockSize
  const usable = prefix >= 31 ? total : Math.max(total - 2, 0)
  const firstUsableInt = prefix >= 31 ? networkInt : networkInt + 1
  const lastUsableInt = prefix >= 31 ? broadcastInt : broadcastInt - 1

  return {
    cidr: `${intToIpv4(networkInt)}/${prefix}`,
    ip,
    prefix,
    mask: prefixToMask(prefix),
    network: intToIpv4(networkInt),
    broadcast: intToIpv4(broadcastInt),
    firstUsable: intToIpv4(firstUsableInt >>> 0),
    lastUsable: intToIpv4(lastUsableInt >>> 0),
    total,
    usable,
    startInt: networkInt >>> 0,
    endInt: broadcastInt >>> 0,
  }
}

export function getMinimalPrefixForHosts(hosts: number) {
  if (hosts <= 0) throw new Error('Hosts must be greater than 0')
  const needed = hosts <= 2 ? hosts : hosts + 2
  let prefix = 32
  while (prefix >= 0) {
    if (2 ** (32 - prefix) >= needed) return prefix
    prefix -= 1
  }
  return 0
}

export function planSubnets(baseCidr: string, requests: PlanRequest[]) {
  const base = parseCidr(baseCidr)
  const sorted = [...requests]
    .filter((item) => item.name.trim() && item.hosts > 0)
    .map((item) => ({ ...item, prefix: getMinimalPrefixForHosts(item.hosts) }))
    .sort((left, right) => left.prefix - right.prefix)

  let cursor = base.startInt
  const allocations: PlannedSubnet[] = []
  const unallocated: PlanRequest[] = []

  for (const request of sorted) {
    const size = 2 ** (32 - request.prefix)
    const offset = cursor % size
    if (offset !== 0) cursor = (cursor + (size - offset)) >>> 0
    const end = cursor + size - 1
    if (end > base.endInt) {
      unallocated.push(request)
      continue
    }
    const info = parseCidr(`${intToIpv4(cursor)}/${request.prefix}`)
    allocations.push({
      name: request.name,
      requestedHosts: request.hosts,
      capacity: info.usable,
      cidr: info.cidr,
      network: info.network,
      firstUsable: info.firstUsable,
      lastUsable: info.lastUsable,
      prefix: info.prefix,
    })
    cursor = (end + 1) >>> 0
  }

  return {
    base,
    allocations,
    unallocated,
    usedAddresses: allocations.reduce((sum, item) => sum + 2 ** (32 - item.prefix), 0),
  }
}

export function divideSubnet(baseCidr: string, count: number) {
  const base = parseCidr(baseCidr)
  if (!Number.isInteger(count) || count <= 1) throw new Error('Subnet count must be greater than 1')
  const neededBits = Math.ceil(Math.log2(count))
  const nextPrefix = base.prefix + neededBits
  if (nextPrefix > 32) throw new Error('Subnet count is too large for this network')
  const size = 2 ** (32 - nextPrefix)
  const actualCount = 2 ** neededBits
  return Array.from({ length: actualCount }, (_, index) => parseCidr(`${intToIpv4(base.startInt + index * size)}/${nextPrefix}`))
}

export function summarizeCapacity(cidr: string) {
  const info = parseCidr(cidr)
  return {
    cidr: info.cidr,
    total: info.total,
    usable: info.usable,
    reserved: Math.max(info.total - info.usable, 0),
  }
}

export function parseIpv6Cidr(input: string) {
  const trimmed = input.trim()
  const [address, prefixRaw] = trimmed.split('/')
  const prefix = Number(prefixRaw)
  if (!address || !address.includes(':') || !Number.isInteger(prefix) || prefix < 0 || prefix > 128) {
    throw new Error('Invalid IPv6 CIDR')
  }

  const hostBits = 128 - prefix
  const sizeText = hostBits > 52 ? `2^${hostBits}` : (2n ** BigInt(hostBits)).toString()
  const category =
    prefix <= 32 ? 'Global routing aggregate' :
    prefix <= 48 ? 'Site allocation block' :
    prefix <= 64 ? 'Subnet or LAN segment' :
    'Interface or point allocation'

  return {
    cidr: trimmed,
    address,
    prefix,
    hostBits,
    sizeText,
    category,
  }
}

export function buildPlannerReport(baseCidr: string, requests: PlanRequest[]) {
  const plan = planSubnets(baseCidr, requests)
  const lines = [
    `Network plan for ${plan.base.cidr}`,
    '',
    ...plan.allocations.map(
      (item) => `- ${item.name}: ${item.cidr} (${item.requestedHosts} requested, ${item.capacity} usable)`
    ),
  ]
  if (plan.unallocated.length) {
    lines.push('', 'Unallocated requests:')
    lines.push(...plan.unallocated.map((item) => `- ${item.name}: ${item.hosts} hosts`))
  }
  return {
    ...plan,
    report: lines.join('\n'),
  }
}
