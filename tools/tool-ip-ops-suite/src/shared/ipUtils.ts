export function isIPv4(value: string) {
  return /^(25[0-5]|2[0-4]\d|1?\d?\d)(\.(25[0-5]|2[0-4]\d|1?\d?\d)){3}$/.test(value.trim())
}

export function isIPv6(value: string) {
  return /^[0-9a-f:]+$/i.test(value.trim()) && value.includes(':')
}

export function isIp(value: string) {
  return isIPv4(value) || isIPv6(value)
}

function ipv4ToInt(ip: string) {
  return ip.split('.').reduce((acc, octet) => (acc << 8) + Number(octet), 0) >>> 0
}

export function ipv4ToBinary(ip: string) {
  return ip.split('.').map((part) => Number(part).toString(2).padStart(8, '0')).join('.')
}

export function ipv4ToHex(ip: string) {
  return `0x${ip.split('.').map((part) => Number(part).toString(16).padStart(2, '0')).join('').toUpperCase()}`
}

export function ipv4ToMappedIpv6(ip: string) {
  return `::ffff:${ip}`
}

export function ipv4To6to4(ip: string) {
  const [a, b, c, d] = ip.split('.').map((part) => Number(part).toString(16).padStart(2, '0'))
  return `2002:${a}${b}:${c}${d}::`
}

export function classifyIp(ip: string) {
  if (isIPv4(ip)) {
    const firstOctet = Number(ip.split('.')[0])
    const value = ipv4ToInt(ip)
    let scope = 'Public'
    let code = 'public'

    if ((value & 0xff000000) === 0x0a000000 || (value & 0xfff00000) === 0xac100000 || (value & 0xffff0000) === 0xc0a80000) {
      scope = 'Private'
      code = 'private'
    } else if ((value & 0xff000000) === 0x7f000000) {
      scope = 'Loopback'
      code = 'loopback'
    } else if ((value & 0xffff0000) === 0xa9fe0000) {
      scope = 'Link local'
      code = 'link-local'
    } else if ((value & 0xf0000000) === 0xe0000000) {
      scope = 'Multicast'
      code = 'multicast'
    } else if ((value & 0xf0000000) === 0xf0000000) {
      scope = 'Reserved'
      code = 'reserved'
    } else if ((value & 0xffc00000) === 0x64400000) {
      scope = 'Carrier-grade NAT'
      code = 'cgnat'
    } else if (
      (value & 0xffffff00) === 0xc0000200 ||
      (value & 0xffffff00) === 0xc6336400 ||
      (value & 0xffffff00) === 0xcb007100
    ) {
      scope = 'Documentation'
      code = 'documentation'
    }

    const classful = firstOctet <= 127 ? 'A' : firstOctet <= 191 ? 'B' : firstOctet <= 223 ? 'C' : firstOctet <= 239 ? 'D' : 'E'
    return { version: 'IPv4', scope, code, classful }
  }

  if (isIPv6(ip)) {
    const lower = ip.toLowerCase()
    let scope = 'Public'
    let code = 'public'
    if (lower === '::') {
      scope = 'Unspecified'
      code = 'unspecified'
    } else if (lower === '::1') {
      scope = 'Loopback'
      code = 'loopback'
    } else if (lower.startsWith('fc') || lower.startsWith('fd')) {
      scope = 'Unique local'
      code = 'unique-local'
    } else if (lower.startsWith('fe8') || lower.startsWith('fe9') || lower.startsWith('fea') || lower.startsWith('feb')) {
      scope = 'Link local'
      code = 'link-local'
    } else if (lower.startsWith('ff')) {
      scope = 'Multicast'
      code = 'multicast'
    } else if (lower.startsWith('2001:db8')) {
      scope = 'Documentation'
      code = 'documentation'
    }

    return { version: 'IPv6', scope, code, classful: '—' }
  }

  throw new Error('Invalid IP address')
}
