import type {
  AllocationSimulation,
  CidrInfo,
  ConflictInputRow,
  ConflictResult,
  PlanRequest,
  PlannedSubnet,
} from './types'

const IPV4_REGEX =
  /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)$/

export function isValidIpv4(value: string) {
  return IPV4_REGEX.test(value.trim())
}

export function ipv4ToInt(ip: string) {
  if (!isValidIpv4(ip)) {
    throw new Error(`Invalid IPv4: ${ip}`)
  }
  return ip
    .split('.')
    .map(Number)
    .reduce((acc, part) => ((acc << 8) | part) >>> 0, 0)
}

export function intToIpv4(value: number) {
  return [
    (value >>> 24) & 255,
    (value >>> 16) & 255,
    (value >>> 8) & 255,
    value & 255,
  ].join('.')
}

export function prefixToMask(prefix: number) {
  const mask = prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0
  return intToIpv4(mask >>> 0)
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
    const size = 2 ** (32 - prefix)
    if (size >= needed) return prefix
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
    if (offset !== 0) {
      cursor = (cursor + (size - offset)) >>> 0
    }
    const end = cursor + size - 1
    if (end > base.endInt) {
      unallocated.push({
        id: request.id,
        name: request.name,
        hosts: request.hosts,
      })
      continue
    }
    const info = parseCidr(`${intToIpv4(cursor)}/${request.prefix}`)
    allocations.push({
      requestId: request.id,
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

  const usedAddresses = allocations.reduce((sum, item) => sum + 2 ** (32 - item.prefix), 0)

  return {
    base,
    allocations,
    unallocated,
    usedAddresses,
    remainingAddresses: Math.max(base.total - usedAddresses, 0),
  }
}

export function detectConflicts(rows: ConflictInputRow[]): ConflictResult[] {
  const valid = rows
    .filter((row) => row.cidr.trim())
    .map((row) => ({ row, info: parseCidr(row.cidr) }))

  const conflicts: ConflictResult[] = []

  for (let i = 0; i < valid.length; i += 1) {
    for (let j = i + 1; j < valid.length; j += 1) {
      const left = valid[i]
      const right = valid[j]
      const overlaps = !(left.info.endInt < right.info.startInt || right.info.endInt < left.info.startInt)
      if (!overlaps) continue

      let relation: ConflictResult['relation'] = 'overlap'
      if (left.info.startInt <= right.info.startInt && left.info.endInt >= right.info.endInt) {
        relation = 'contains'
      } else if (right.info.startInt <= left.info.startInt && right.info.endInt >= left.info.endInt) {
        relation = 'contained'
      }

      conflicts.push({
        left: left.row,
        right: right.row,
        relation,
      })
    }
  }

  return conflicts
}

export function simulateAllocation(cidr: string, requested: number, reservedInputs: string[]) {
  const info = parseCidr(cidr)
  const start = ipv4ToInt(info.firstUsable)
  const end = ipv4ToInt(info.lastUsable)
  const reservedSet = new Set(
    reservedInputs.filter(Boolean).map((item) => ipv4ToInt(item.trim()))
  )

  const allocations: string[] = []
  const skipped: string[] = []

  for (let cursor = start; cursor <= end; cursor += 1) {
    if (reservedSet.has(cursor)) {
      skipped.push(intToIpv4(cursor))
      continue
    }
    allocations.push(intToIpv4(cursor))
    if (allocations.length >= requested) break
  }

  let nextAvailable: string | null = null
  for (let cursor = start; cursor <= end; cursor += 1) {
    const ip = intToIpv4(cursor)
    if (!reservedSet.has(cursor) && !allocations.includes(ip)) {
      nextAvailable = ip
      break
    }
  }

  const availableCount = Math.max(info.usable - reservedSet.size, 0)

  const result: AllocationSimulation = {
    cidr: info.cidr,
    requested,
    allocations,
    skipped,
    exhausted: allocations.length < requested,
    nextAvailable,
    availableCount,
  }

  return { info, result }
}

export function summarizeUsage(usable: number, allocated: number, reserved: number) {
  const used = Math.max(allocated, 0) + Math.max(reserved, 0)
  const utilization = usable > 0 ? Math.min((used / usable) * 100, 100) : 0
  const free = Math.max(usable - used, 0)
  return { used, free, utilization }
}
