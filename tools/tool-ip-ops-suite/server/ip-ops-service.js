import dns from 'node:dns/promises'

const DNSBL_PROVIDERS = [
  { name: 'Spamhaus ZEN', zone: 'zen.spamhaus.org' },
  { name: 'SpamCop', zone: 'bl.spamcop.net' },
  { name: 'Barracuda', zone: 'b.barracudacentral.org' },
  { name: 'SORBS DUHL', zone: 'dul.dnsbl.sorbs.net' },
]

const CDN_KEYWORDS = [
  'cloudflare', 'akamai', 'fastly', 'cloudfront', 'edgecast', 'cdn77', 'gcore',
  'bunny', 'cachefly', 'imperva', 'incapsula', 'stackpath', 'azure', 'amazon',
  'vercel', 'netlify', 'edge', 'cdn',
]

function isIPv4(ip) {
  return /^(25[0-5]|2[0-4]\d|1?\d?\d)(\.(25[0-5]|2[0-4]\d|1?\d?\d)){3}$/.test(String(ip ?? '').trim())
}

function isIPv6(ip) {
  return /^[0-9a-f:]+$/i.test(String(ip ?? '').trim()) && String(ip).includes(':')
}

function assertIp(ip) {
  const normalized = String(ip ?? '').trim()
  if (!normalized || (!isIPv4(normalized) && !isIPv6(normalized))) {
    throw new Error('Invalid IP address')
  }
  return normalized
}

function ipv4ToInt(ip) {
  return ip.split('.').reduce((acc, octet) => (acc << 8) + Number(octet), 0) >>> 0
}

function classifyIp(ip) {
  if (isIPv4(ip)) {
    const value = ipv4ToInt(ip)
    const tests = [
      ['unspecified', 'Unspecified', 0x00000000, 0xff000000],
      ['private', 'Private', 0x0a000000, 0xff000000],
      ['private', 'Private', 0xac100000, 0xfff00000],
      ['private', 'Private', 0xc0a80000, 0xffff0000],
      ['loopback', 'Loopback', 0x7f000000, 0xff000000],
      ['link-local', 'Link local', 0xa9fe0000, 0xffff0000],
      ['cgnat', 'Carrier-grade NAT', 0x64400000, 0xffc00000],
      ['documentation', 'Documentation', 0xc0000200, 0xffffff00],
      ['documentation', 'Documentation', 0xc6336400, 0xffffff00],
      ['documentation', 'Documentation', 0xcb007100, 0xffffff00],
      ['benchmark', 'Benchmark', 0xc6120000, 0xfffe0000],
      ['multicast', 'Multicast', 0xe0000000, 0xf0000000],
      ['reserved', 'Reserved', 0xf0000000, 0xf0000000],
    ]

    for (const [code, label, base, mask] of tests) {
      if ((value & mask) === base) return { code, label, public: code === 'public' }
    }

    return { code: 'public', label: 'Public', public: true }
  }

  const lower = ip.toLowerCase()
  if (lower === '::') return { code: 'unspecified', label: 'Unspecified', public: false }
  if (lower === '::1') return { code: 'loopback', label: 'Loopback', public: false }
  if (lower.startsWith('fc') || lower.startsWith('fd')) return { code: 'unique-local', label: 'Unique local', public: false }
  if (lower.startsWith('fe8') || lower.startsWith('fe9') || lower.startsWith('fea') || lower.startsWith('feb')) {
    return { code: 'link-local', label: 'Link local', public: false }
  }
  if (lower.startsWith('ff')) return { code: 'multicast', label: 'Multicast', public: false }
  if (lower.startsWith('2001:db8')) return { code: 'documentation', label: 'Documentation', public: false }
  return { code: 'public', label: 'Public', public: true }
}

async function fetchJsonWithTimeout(url) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 4500)
  try {
    const response = await fetch(url, { signal: controller.signal, headers: { accept: 'application/json' } })
    if (!response.ok) throw new Error(`Upstream ${response.status}`)
    return await response.json()
  } finally {
    clearTimeout(timer)
  }
}

async function lookupIpGeoFromIpWho(normalized) {
  const data = await fetchJsonWithTimeout(`https://ipwho.is/${encodeURIComponent(normalized)}`)
  if (data.success === false) throw new Error(data.message || 'Geo lookup failed')

  return {
    ip: normalized,
    timestamp: new Date().toISOString(),
    bogon: Boolean(data.bogon),
    country: data.country,
    region: data.region,
    city: data.city,
    continent: data.continent,
    latitude: data.latitude,
    longitude: data.longitude,
    timezone: data.timezone?.id || data.timezone,
    postal: data.postal,
    connection: data.connection ?? null,
  }
}

async function lookupIpGeoFromIpApi(normalized) {
  const data = await fetchJsonWithTimeout(`http://ip-api.com/json/${encodeURIComponent(normalized)}`)
  if (data.status !== 'success') throw new Error(data.message || 'Geo lookup failed')

  return {
    ip: normalized,
    timestamp: new Date().toISOString(),
    bogon: false,
    country: data.country,
    region: data.regionName || data.region,
    city: data.city,
    continent: data.continent || null,
    latitude: data.lat,
    longitude: data.lon,
    timezone: data.timezone,
    postal: data.zip,
    connection: {
      isp: data.isp,
      org: data.org,
      asn: data.as,
    },
  }
}

export async function lookupIpGeo(ip) {
  const normalized = assertIp(ip)
  const classification = classifyIp(normalized)

  if (!classification.public) {
    return {
      ip: normalized,
      timestamp: new Date().toISOString(),
      bogon: true,
      classification,
      message: 'Local, reserved, or non-routable address. Public geolocation is not applicable.',
    }
  }

  let lastError = null
  const providers = [lookupIpGeoFromIpWho, lookupIpGeoFromIpApi]

  for (const provider of providers) {
    try {
      const payload = await provider(normalized)
      return {
        ...payload,
        classification,
      }
    } catch (error) {
      lastError = error
    }
  }

  throw new Error(lastError?.message || 'Geo lookup failed')
}

export async function lookupIpPtr(ip) {
  const normalized = assertIp(ip)
  const hostnames = await dns.reverse(normalized).catch(() => [])
  return {
    ip: normalized,
    timestamp: new Date().toISOString(),
    hostnames,
    hasPtr: hostnames.length > 0,
  }
}

export async function lookupPublicIp() {
  const candidates = [
    { url: 'https://api64.ipify.org?format=json', parse: (data) => data.ip },
    { url: 'https://api.ipify.org?format=json', parse: (data) => data.ip },
    { url: 'https://ifconfig.co/json', parse: (data) => data.ip },
  ]

  let lastError = null
  for (const candidate of candidates) {
    try {
      const data = await fetchJsonWithTimeout(candidate.url)
      const ip = candidate.parse(data)
      if (ip) {
        return {
          ip,
          timestamp: new Date().toISOString(),
          classification: classifyIp(ip),
        }
      }
    } catch (error) {
      lastError = error
    }
  }

  throw new Error(lastError?.message || 'Public IP lookup failed')
}

export async function lookupIpCdn(ip) {
  const normalized = assertIp(ip)
  const classification = classifyIp(normalized)
  if (!classification.public) {
    return {
      ip: normalized,
      timestamp: new Date().toISOString(),
      classification,
      detected: false,
      confidence: 0,
      matches: [],
      reverse: [],
      org: null,
      isp: null,
    }
  }

  const [geo, reverse] = await Promise.all([
    safeGeo(normalized),
    dns.reverse(normalized).catch(() => []),
  ])

  const haystack = [geo?.connection?.org, geo?.connection?.isp, ...reverse].filter(Boolean).join(' ').toLowerCase()
  const matches = CDN_KEYWORDS.filter((keyword) => haystack.includes(keyword))
  const confidence = matches.length ? Math.min(95, 45 + matches.length * 18) : 12

  return {
    ip: normalized,
    timestamp: new Date().toISOString(),
    classification,
    detected: matches.length > 0,
    confidence,
    matches,
    reverse,
    org: geo?.connection?.org ?? null,
    isp: geo?.connection?.isp ?? null,
  }
}

async function safeGeo(ip) {
  try {
    return await lookupIpGeo(ip)
  } catch {
    return null
  }
}

export async function lookupIpBlacklist(ip) {
  const normalized = assertIp(ip)
  if (!isIPv4(normalized)) {
    return {
      ip: normalized,
      timestamp: new Date().toISOString(),
      supported: false,
      checks: [],
      listed: [],
      message: 'DNSBL lookups are implemented for IPv4 addresses only.',
    }
  }

  const reversed = normalized.split('.').reverse().join('.')
  const checks = await Promise.all(
    DNSBL_PROVIDERS.map(async (provider) => {
      const hostname = `${reversed}.${provider.zone}`
      try {
        const answers = await dns.resolve4(hostname)
        return { provider: provider.name, listed: answers.length > 0, answers }
      } catch {
        return { provider: provider.name, listed: false, answers: [] }
      }
    })
  )

  return {
    ip: normalized,
    timestamp: new Date().toISOString(),
    supported: true,
    checks,
    listed: checks.filter((item) => item.listed).map((item) => item.provider),
  }
}
