import { Resolver } from 'node:dns/promises'

const resolver = new Resolver()

const SUBDOMAIN_WORDS = [
  'www', 'mail', 'api', 'app', 'm', 'docs', 'blog', 'cdn', 'static', 'assets',
  'img', 'status', 'dev', 'test', 'stage', 'beta', 'admin', 'portal', 'auth',
  'login', 'vpn', 'ftp', 'smtp', 'imap', 'pop', 'ns1', 'ns2', 'mx', 'gateway',
  'support', 'download', 'shop', 'pay', 'edge', 'origin',
]

function assertDomain(domain) {
  const normalized = String(domain ?? '').trim().toLowerCase().replace(/\.$/, '')
  if (!normalized || !/^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/i.test(normalized)) {
    throw new Error('Invalid domain')
  }
  return normalized
}

function joinedTxt(records) {
  return records.map((parts) => (Array.isArray(parts) ? parts.join('') : String(parts)))
}

function unique(list) {
  return Array.from(new Set(list.filter(Boolean)))
}

function average(values) {
  if (!values.length) return 0
  return values.reduce((sum, value) => sum + value, 0) / values.length
}

function clamp(value, min = 0, max = 100) {
  return Math.min(max, Math.max(min, value))
}

function hostRoot(hostname) {
  const parts = hostname.toLowerCase().split('.').filter(Boolean)
  return parts.slice(-2).join('.')
}

function parseTagString(record) {
  return record.split(';').reduce((acc, item) => {
    const [key, ...rest] = item.trim().split('=')
    if (!key || rest.length === 0) return acc
    acc[key.trim().toLowerCase()] = rest.join('=').trim()
    return acc
  }, {})
}

async function safe(fn) {
  try {
    return await fn()
  } catch {
    return null
  }
}

async function resolveTxt(name) {
  const records = await safe(() => resolver.resolveTxt(name))
  return records ? joinedTxt(records) : []
}

async function resolveAWithTtl(name) {
  const records = await safe(() => resolver.resolve4(name, { ttl: true }))
  return Array.isArray(records) ? records : []
}

async function resolveAAAAWithTtl(name) {
  const records = await safe(() => resolver.resolve6(name, { ttl: true }))
  return Array.isArray(records) ? records : []
}

async function resolveA(name) {
  return (await safe(() => resolver.resolve4(name))) ?? []
}

async function resolveAAAA(name) {
  return (await safe(() => resolver.resolve6(name))) ?? []
}

async function resolveCname(name) {
  return (await safe(() => resolver.resolveCname(name))) ?? []
}

async function resolveNs(name) {
  return (await safe(() => resolver.resolveNs(name))) ?? []
}

async function resolveMx(name) {
  return (await safe(() => resolver.resolveMx(name))) ?? []
}

function scoreLevel(score) {
  if (score >= 85) return 'low'
  if (score >= 65) return 'info'
  if (score >= 45) return 'medium'
  return 'high'
}

export async function analyzeSpf(domain) {
  const normalized = assertDomain(domain)
  const txtRecords = await resolveTxt(normalized)
  const record = txtRecords.find((item) => item.toLowerCase().startsWith('v=spf1'))

  const issues = []
  const suggestions = []

  if (!record) {
    return {
      domain: normalized,
      timestamp: new Date().toISOString(),
      hasRecord: false,
      score: 10,
      level: 'high',
      issues: ['No SPF record found on the root domain.'],
      suggestions: ['Publish a single SPF record that ends with -all or ~all.'],
    }
  }

  const tokens = record.split(/\s+/).filter(Boolean)
  const includeTokens = tokens.filter((item) => item.startsWith('include:'))
  const lookupTokens = tokens.filter((item) => /^(?:include:|a(?::|$)|mx(?::|$)|ptr(?::|$)|exists:|redirect=)/i.test(item))
  const allToken = tokens.find((item) => /[?~+\-]all$/i.test(item) || item === 'all')
  const allMode = allToken ? (allToken[0] === '+' || allToken[0] === '-' || allToken[0] === '~' || allToken[0] === '?' ? allToken[0] : '+') : null

  if (!allToken) issues.push('SPF record has no terminal all mechanism.')
  if (allMode === '+') issues.push('Using +all allows any host to send mail and weakens protection.')
  if (lookupTokens.length > 10) issues.push(`Estimated DNS lookups exceed the SPF limit (${lookupTokens.length}/10).`)
  if (includeTokens.length >= 5) suggestions.push('Review nested include chains to reduce lookup latency and failure risk.')
  if (record.length > 255) suggestions.push('SPF content is long. Flattening or consolidation may improve reliability.')
  if (!record.includes('mx') && !record.includes('include:') && !record.includes('ip4:') && !record.includes('ip6:')) {
    issues.push('SPF policy does not declare any explicit sender sources.')
  }

  let score = 82
  score -= issues.length * 16
  if (allMode === '-') score += 8
  if (allMode === '~') score += 4
  if (lookupTokens.length <= 5) score += 4

  return {
    domain: normalized,
    timestamp: new Date().toISOString(),
    hasRecord: true,
    record,
    includes: includeTokens.map((item) => item.slice('include:'.length)),
    lookupCount: lookupTokens.length,
    allMechanism: allToken ?? null,
    score: clamp(score),
    level: scoreLevel(clamp(score)),
    issues,
    suggestions: unique(suggestions),
  }
}

export async function analyzeDkim(domain, selector) {
  const normalized = assertDomain(domain)
  const cleanSelector = String(selector ?? '').trim().toLowerCase()
  if (!cleanSelector) throw new Error('Selector is required')

  const fqdn = `${cleanSelector}._domainkey.${normalized}`
  const txtRecords = await resolveTxt(fqdn)
  const record = txtRecords.find((item) => item.toLowerCase().includes('v=dkim1') || item.toLowerCase().includes('p='))
  const issues = []
  const suggestions = []

  if (!record) {
    return {
      domain: normalized,
      selector: cleanSelector,
      fqdn,
      timestamp: new Date().toISOString(),
      hasRecord: false,
      score: 15,
      level: 'high',
      issues: ['No DKIM TXT record found for the selector.'],
      suggestions: ['Publish a DKIM public key under selector._domainkey.'],
    }
  }

  const tags = parseTagString(record)
  const publicKey = tags.p ?? ''
  const keyStrength = publicKey ? Math.round(publicKey.replace(/\s+/g, '').length * 6) : 0

  if ((tags.v ?? '').toUpperCase() !== 'DKIM1') issues.push('DKIM version tag is missing or invalid.')
  if (!publicKey) issues.push('DKIM public key is empty.')
  if (keyStrength > 0 && keyStrength < 1024) issues.push(`Public key appears weak (${keyStrength} bits estimated).`)
  if ((tags.t ?? '').includes('y')) suggestions.push('Selector is in testing mode (t=y). Review before production rollout.')
  if (!tags.h) suggestions.push('Declare acceptable hashing algorithms to tighten DKIM policy.')

  let score = 84
  score -= issues.length * 18
  if (keyStrength >= 2048) score += 6

  return {
    domain: normalized,
    selector: cleanSelector,
    fqdn,
    timestamp: new Date().toISOString(),
    hasRecord: true,
    record,
    tags,
    keyStrength,
    score: clamp(score),
    level: scoreLevel(clamp(score)),
    issues,
    suggestions: unique(suggestions),
  }
}

export async function analyzeDmarc(domain) {
  const normalized = assertDomain(domain)
  const fqdn = `_dmarc.${normalized}`
  const txtRecords = await resolveTxt(fqdn)
  const record = txtRecords.find((item) => item.toLowerCase().startsWith('v=dmarc1'))
  const issues = []
  const suggestions = []

  if (!record) {
    return {
      domain: normalized,
      fqdn,
      timestamp: new Date().toISOString(),
      hasRecord: false,
      score: 12,
      level: 'high',
      issues: ['No DMARC policy found.'],
      suggestions: ['Publish a DMARC policy at _dmarc.<domain>.'],
    }
  }

  const tags = parseTagString(record)
  const policy = (tags.p ?? '').toLowerCase()
  const pct = Number.parseInt(tags.pct ?? '100', 10)

  if (!['none', 'quarantine', 'reject'].includes(policy)) issues.push('DMARC p= policy is missing or invalid.')
  if (policy === 'none') suggestions.push('Policy is monitor-only. Consider quarantine or reject after validation.')
  if (!tags.rua) suggestions.push('Add an aggregate report mailbox with rua=')
  if (Number.isFinite(pct) && pct < 100) suggestions.push(`Only ${pct}% of traffic is covered. Increase pct once policy is stable.`)
  if (!tags.adkim) suggestions.push('Explicit adkim alignment improves policy clarity.')
  if (!tags.aspf) suggestions.push('Explicit aspf alignment improves policy clarity.')

  let score = 86
  score -= issues.length * 18
  if (policy === 'reject') score += 8
  if (policy === 'quarantine') score += 4
  if (policy === 'none') score -= 12

  return {
    domain: normalized,
    fqdn,
    timestamp: new Date().toISOString(),
    hasRecord: true,
    record,
    tags,
    policy,
    pct: Number.isFinite(pct) ? pct : 100,
    score: clamp(score),
    level: scoreLevel(clamp(score)),
    issues,
    suggestions: unique(suggestions),
  }
}

export async function analyzeTtlAdvice(domain) {
  const normalized = assertDomain(domain)
  const ipv4 = await resolveAWithTtl(normalized)
  const ipv6 = await resolveAAAAWithTtl(normalized)
  const addresses = [
    ...ipv4.map((item) => ({ type: 'A', value: item.address, ttl: item.ttl })),
    ...ipv6.map((item) => ({ type: 'AAAA', value: item.address, ttl: item.ttl })),
  ]

  if (!addresses.length) {
    return {
      domain: normalized,
      timestamp: new Date().toISOString(),
      hasData: false,
      score: 20,
      level: 'medium',
      issues: ['No A or AAAA records with TTL data were found.'],
      suggestions: ['Publish address records before evaluating TTL strategy.'],
      records: [],
    }
  }

  const ttls = addresses.map((item) => item.ttl)
  const min = Math.min(...ttls)
  const max = Math.max(...ttls)
  const avg = Math.round(average(ttls))
  const issues = []
  const suggestions = []

  if (min < 300) issues.push('TTL below 300s can increase query load and cache churn.')
  if (max > 86400) issues.push('TTL above 86400s slows rollback during incidents.')
  if (max - min > 1800) suggestions.push('TTL values vary across records. Align them to simplify operations.')
  if (avg >= 300 && avg <= 3600) suggestions.push('TTL is well suited for production services that need balanced agility and cache efficiency.')

  let score = 88
  score -= issues.length * 18
  if (avg >= 300 && avg <= 3600) score += 4

  return {
    domain: normalized,
    timestamp: new Date().toISOString(),
    hasData: true,
    records: addresses,
    ttlSummary: { min, max, avg },
    score: clamp(score),
    level: scoreLevel(clamp(score)),
    issues,
    suggestions: unique(suggestions),
  }
}

export async function analyzeNsCheck(domain) {
  const normalized = assertDomain(domain)
  const records = await resolveNs(normalized)
  const issues = []
  const suggestions = []

  if (!records.length) {
    return {
      domain: normalized,
      timestamp: new Date().toISOString(),
      records: [],
      score: 10,
      level: 'high',
      issues: ['No NS records found.'],
      suggestions: ['Publish at least two authoritative nameservers.'],
    }
  }

  const enriched = await Promise.all(
    records.map(async (host) => {
      const ipv4 = await resolveA(host)
      const ipv6 = await resolveAAAA(host)
      return { host, ipv4, ipv6, reachable: ipv4.length + ipv6.length > 0 }
    })
  )

  const providerRoots = unique(enriched.map((item) => hostRoot(item.host)))
  if (enriched.length < 2) issues.push('Fewer than two authoritative nameservers are published.')
  if (providerRoots.length < 2) suggestions.push('Nameservers appear concentrated under one provider namespace.')
  if (enriched.some((item) => !item.reachable)) issues.push('One or more nameserver hostnames do not currently resolve to IP addresses.')

  let score = 84
  score -= issues.length * 18
  if (enriched.length >= 2) score += 6
  if (providerRoots.length >= 2) score += 5

  return {
    domain: normalized,
    timestamp: new Date().toISOString(),
    records: enriched,
    diversityRoots: providerRoots,
    score: clamp(score),
    level: scoreLevel(clamp(score)),
    issues,
    suggestions: unique(suggestions),
  }
}

async function resolveWildcardProbe(hostname) {
  const a = await resolveA(hostname)
  const aaaa = await resolveAAAA(hostname)
  const cname = await resolveCname(hostname)
  const values = unique([...a, ...aaaa, ...cname])
  return {
    hostname,
    resolved: values.length > 0,
    values,
  }
}

export async function analyzeWildcard(domain) {
  const normalized = assertDomain(domain)
  const probes = await Promise.all(
    Array.from({ length: 3 }, (_, index) => resolveWildcardProbe(`${Math.random().toString(36).slice(2, 10)}-${index}.${normalized}`))
  )

  const signatures = probes.filter((item) => item.resolved).map((item) => item.values.sort().join('|'))
  const dominant = signatures.find((signature, _, list) => list.filter((item) => item === signature).length >= 2)
  const detected = Boolean(dominant)
  const issues = detected ? ['Random subdomains resolve consistently, indicating wildcard DNS.'] : []
  const suggestions = detected
    ? ['Verify wildcard behavior does not mask NXDOMAIN conditions needed by mail or app routing.']
    : ['No wildcard pattern detected across random probes.']

  const score = detected ? 44 : 88

  return {
    domain: normalized,
    timestamp: new Date().toISOString(),
    detected,
    signature: dominant ?? null,
    probes,
    score,
    level: scoreLevel(score),
    issues,
    suggestions,
  }
}

async function withConcurrency(items, limit, iteratee) {
  const results = []
  let cursor = 0

  async function worker() {
    while (cursor < items.length) {
      const index = cursor
      cursor += 1
      results[index] = await iteratee(items[index], index)
    }
  }

  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, () => worker()))
  return results
}

export async function analyzeSubdomainScan(domain) {
  const normalized = assertDomain(domain)
  const wildcard = await analyzeWildcard(normalized)
  const results = await withConcurrency(SUBDOMAIN_WORDS, 6, async (word) => {
    const hostname = `${word}.${normalized}`
    const a = await resolveA(hostname)
    const aaaa = await resolveAAAA(hostname)
    const cname = await resolveCname(hostname)
    const values = unique([...a, ...aaaa, ...cname])
    if (!values.length) return null
    const types = unique([
      a.length ? 'A' : '',
      aaaa.length ? 'AAAA' : '',
      cname.length ? 'CNAME' : '',
    ])
    return { label: word, hostname, types, values }
  })

  const found = results.filter(Boolean)
  const suggestions = []
  if (wildcard.detected) suggestions.push('Wildcard DNS is enabled, so discovered labels may include synthetic matches.')
  if (!found.length) suggestions.push('No common subdomains were discovered from the built-in wordlist.')
  if (found.length > 10) suggestions.push('Several exposed subdomains were found. Review unused hosts and shadow services.')

  const score = clamp(82 - found.length * 2 - (wildcard.detected ? 18 : 0))

  return {
    domain: normalized,
    timestamp: new Date().toISOString(),
    scannedCount: SUBDOMAIN_WORDS.length,
    wildcardSuspected: wildcard.detected,
    found,
    score,
    level: scoreLevel(score),
    issues: wildcard.detected ? wildcard.issues : [],
    suggestions,
  }
}

export async function analyzeHealth(domain) {
  const normalized = assertDomain(domain)
  const [spf, dmarc, ns, wildcard, mx, ipv4, ipv6] = await Promise.all([
    analyzeSpf(normalized),
    analyzeDmarc(normalized),
    analyzeNsCheck(normalized),
    analyzeWildcard(normalized),
    resolveMx(normalized),
    resolveA(normalized),
    resolveAAAA(normalized),
  ])

  const dimensions = [
    {
      key: 'mail-auth',
      label: 'Mail authentication',
      score: Math.round((spf.score + dmarc.score) / 2),
      summary: spf.hasRecord && dmarc.hasRecord ? 'SPF and DMARC are both present.' : 'One or more mail-auth records are missing.',
    },
    {
      key: 'ns',
      label: 'Nameserver resilience',
      score: ns.score,
      summary: ns.records.length >= 2 ? `${ns.records.length} nameservers published.` : 'Nameserver redundancy is weak.',
    },
    {
      key: 'addressing',
      label: 'Address records',
      score: ipv4.length + ipv6.length > 0 ? 88 : 30,
      summary: ipv4.length + ipv6.length > 0 ? `${ipv4.length} A and ${ipv6.length} AAAA records found.` : 'No A/AAAA records found.',
    },
    {
      key: 'wildcard',
      label: 'Wildcard exposure',
      score: wildcard.detected ? 42 : 90,
      summary: wildcard.detected ? 'Wildcard DNS resolves random labels.' : 'Random-label probes do not resolve.',
    },
    {
      key: 'mail-routing',
      label: 'Mail routing',
      score: mx.length ? 85 : 55,
      summary: mx.length ? `${mx.length} MX records found.` : 'No MX records published.',
    },
  ]

  const issues = unique([
    ...spf.issues,
    ...dmarc.issues,
    ...ns.issues,
    ...wildcard.issues,
    ...(ipv4.length + ipv6.length === 0 ? ['No A/AAAA records found.'] : []),
  ])
  const suggestions = unique([
    ...spf.suggestions,
    ...dmarc.suggestions,
    ...ns.suggestions,
    ...wildcard.suggestions,
    ...(mx.length ? [] : ['Publish MX records if the domain receives mail.']),
  ])
  const score = Math.round(average(dimensions.map((item) => item.score)))

  return {
    domain: normalized,
    timestamp: new Date().toISOString(),
    score,
    level: scoreLevel(score),
    dimensions,
    issues,
    suggestions,
  }
}
