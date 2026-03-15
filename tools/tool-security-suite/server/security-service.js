import * as dns from 'node:dns/promises'
import net from 'node:net'

const SEVERITY_WEIGHTS = {
  low: 8,
  medium: 18,
  high: 32,
  critical: 52,
}

const HOSTING_PATTERNS = [
  /amazon/i,
  /aws/i,
  /azure/i,
  /cloud/i,
  /cloudflare/i,
  /digitalocean/i,
  /google/i,
  /gcp/i,
  /hetzner/i,
  /linode/i,
  /oracle/i,
  /ovh/i,
  /tencent/i,
  /aliyun/i,
  /huawei/i,
  /vultr/i,
  /colo/i,
  /hosting/i,
  /datacenter/i,
  /data center/i,
  /proxy/i,
  /vpn/i,
]

const RESIDENTIAL_PATTERNS = [
  /broadband/i,
  /telecom/i,
  /mobile/i,
  /wireless/i,
  /fiber/i,
  /residential/i,
  /comcast/i,
  /verizon/i,
  /at&t/i,
  /china telecom/i,
  /china mobile/i,
  /china unicom/i,
]

const PORT_CATALOG = {
  21: { service: 'FTP', severity: 'high', reason: 'File transfer service is frequently brute-forced and should rarely face the Internet.' },
  22: { service: 'SSH', severity: 'medium', reason: 'Administrative access should be tightly restricted and monitored.' },
  23: { service: 'Telnet', severity: 'critical', reason: 'Telnet is plaintext and should not be Internet-exposed.' },
  25: { service: 'SMTP', severity: 'medium', reason: 'Mail relays require careful anti-abuse and anti-open-relay controls.' },
  53: { service: 'DNS', severity: 'medium', reason: 'Open DNS services can be abused for reflection or data exfiltration.' },
  80: { service: 'HTTP', severity: 'low', reason: 'Public web services are expected, but still need hardening.' },
  110: { service: 'POP3', severity: 'high', reason: 'Legacy mail access ports are risky when exposed directly.' },
  111: { service: 'RPCbind', severity: 'critical', reason: 'RPC exposure significantly increases lateral movement risk.' },
  123: { service: 'NTP', severity: 'medium', reason: 'NTP should avoid unrestricted public exposure.' },
  135: { service: 'MS RPC', severity: 'critical', reason: 'Windows RPC exposure is a common attack path.' },
  139: { service: 'NetBIOS', severity: 'critical', reason: 'NetBIOS should not be reachable from untrusted networks.' },
  143: { service: 'IMAP', severity: 'high', reason: 'Legacy mail access needs encryption and strict access control.' },
  389: { service: 'LDAP', severity: 'high', reason: 'Directory services should usually stay inside trusted networks.' },
  443: { service: 'HTTPS', severity: 'low', reason: 'TLS-enabled web services are common, but still need secure config.' },
  445: { service: 'SMB', severity: 'critical', reason: 'SMB exposure is a major ransomware and lateral movement risk.' },
  465: { service: 'SMTPS', severity: 'medium', reason: 'Mail transport should still be restricted to intended peers.' },
  587: { service: 'SMTP Submission', severity: 'medium', reason: 'Submission services should require auth and rate controls.' },
  636: { service: 'LDAPS', severity: 'high', reason: 'Directory services are sensitive even with TLS.' },
  993: { service: 'IMAPS', severity: 'medium', reason: 'Mail access ports still expose authentication surface.' },
  995: { service: 'POP3S', severity: 'medium', reason: 'Encrypted POP still adds credential exposure surface.' },
  1433: { service: 'MSSQL', severity: 'high', reason: 'Database ports should not be broadly reachable.' },
  1521: { service: 'Oracle', severity: 'high', reason: 'Database listeners belong behind strict network controls.' },
  1883: { service: 'MQTT', severity: 'high', reason: 'Message brokers can leak telemetry and allow control-plane abuse.' },
  2375: { service: 'Docker API', severity: 'critical', reason: 'Unauthenticated Docker API exposure is full-host compromise risk.' },
  3306: { service: 'MySQL', severity: 'high', reason: 'Databases should not be Internet-exposed without strong controls.' },
  3389: { service: 'RDP', severity: 'critical', reason: 'Remote desktop is a high-value target and often brute-forced.' },
  5432: { service: 'PostgreSQL', severity: 'high', reason: 'Database exposure increases credential and data breach risk.' },
  5601: { service: 'Kibana', severity: 'high', reason: 'Operational consoles expose sensitive telemetry and control paths.' },
  5900: { service: 'VNC', severity: 'critical', reason: 'Remote desktop protocols should not be openly exposed.' },
  6379: { service: 'Redis', severity: 'critical', reason: 'Unauthenticated Redis exposure is widely exploited.' },
  8080: { service: 'HTTP Alt', severity: 'medium', reason: 'Alternate web ports often host admin interfaces or dev services.' },
  8443: { service: 'HTTPS Alt', severity: 'medium', reason: 'Alternate TLS ports often host privileged consoles.' },
  9200: { service: 'Elasticsearch', severity: 'critical', reason: 'Exposed search clusters can leak or destroy data.' },
  11211: { service: 'Memcached', severity: 'critical', reason: 'Memcached can leak data and be abused for reflection.' },
  27017: { service: 'MongoDB', severity: 'critical', reason: 'Internet-exposed MongoDB remains a common breach pattern.' },
}

export const PORT_PRESETS = {
  web: [80, 443, 8080, 8443, 3000, 5000, 8000, 9000],
  quick: [21, 22, 23, 25, 53, 80, 110, 143, 443, 445, 587, 993, 995, 3306, 3389, 5432, 6379, 8080, 8443, 9200],
  common: [21, 22, 23, 25, 53, 80, 110, 111, 123, 135, 139, 143, 389, 443, 445, 465, 587, 636, 993, 995, 1433, 1521, 1883, 2375, 3306, 3389, 5432, 5601, 5900, 6379, 8080, 8443, 9200, 11211, 27017],
}

function clamp(value, min = 0, max = 100) {
  return Math.min(max, Math.max(min, value))
}

function toArray(value) {
  if (Array.isArray(value)) return value
  if (value == null || value === '') return []
  return [value]
}

function normalizeText(value) {
  return String(value ?? '').trim()
}

function normalizeDomain(input) {
  const raw = normalizeText(input).toLowerCase()
  if (!raw) return ''
  const withoutProtocol = raw.replace(/^[a-z]+:\/\//, '')
  const base = withoutProtocol.split('/')[0].split('?')[0].split('#')[0]
  return base.replace(/\.$/, '')
}

function isValidDomain(domain) {
  return /^(?=.{1,253}$)(?!-)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/i.test(domain)
}

function isPrivateIPv4(ip) {
  const parts = ip.split('.').map(Number)
  return (
    parts[0] === 10 ||
    parts[0] === 127 ||
    (parts[0] === 169 && parts[1] === 254) ||
    (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) ||
    (parts[0] === 192 && parts[1] === 168)
  )
}

function isReservedIPv6(ip) {
  return ip === '::1' || ip.startsWith('fc') || ip.startsWith('fd') || ip.startsWith('fe80:')
}

function isPublicIp(ip) {
  const version = net.isIP(ip)
  if (!version) return false
  if (version === 4) return !isPrivateIPv4(ip)
  return !isReservedIPv6(ip.toLowerCase())
}

function getRiskLevel(score) {
  if (score >= 80) return 'critical'
  if (score >= 60) return 'high'
  if (score >= 35) return 'medium'
  if (score >= 15) return 'low'
  return 'info'
}

function getPortMeta(port) {
  return PORT_CATALOG[port] ?? {
    service: 'Unknown',
    severity: 'medium',
    reason: 'Unknown service exposure should still be reviewed for intended scope and access control.',
  }
}

function parseJsonSafe(text) {
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

async function safeFetchJson(url) {
  try {
    const response = await fetch(url, {
      headers: {
        accept: 'application/json',
        'user-agent': 'toolbox-security-suite/1.0',
      },
    })
    if (!response.ok) return null
    return await response.json()
  } catch {
    return null
  }
}

async function resolve4Safe(hostname) {
  try {
    return await dns.resolve4(hostname)
  } catch (error) {
    return { error: error.code ?? 'DNS_ERROR' }
  }
}

async function resolveTxtSafe(hostname) {
  try {
    const records = await dns.resolveTxt(hostname)
    return records.map((entry) => entry.join(''))
  } catch {
    return []
  }
}

async function resolveWithFallback(hostname) {
  const [a, aaaa] = await Promise.allSettled([dns.resolve4(hostname), dns.resolve6(hostname)])
  return {
    a: a.status === 'fulfilled' ? a.value : [],
    aaaa: aaaa.status === 'fulfilled' ? aaaa.value : [],
  }
}

function extractRdapAbuseContacts(rdap) {
  if (!rdap?.entities) return []
  const contacts = []
  for (const entity of rdap.entities) {
    const roles = entity.roles ?? []
    if (!roles.includes('abuse')) continue
    const vcardArray = entity.vcardArray?.[1] ?? []
    for (const row of vcardArray) {
      if (row[0] === 'email' && row[3]) contacts.push(row[3])
    }
  }
  return [...new Set(contacts)]
}

function extractRdapEventDate(rdap, eventActionCandidates) {
  const events = rdap?.events ?? []
  for (const event of events) {
    if (eventActionCandidates.includes(event.eventAction) && event.eventDate) {
      return event.eventDate
    }
  }
  return null
}

async function querySpamhausZen(ip) {
  if (net.isIP(ip) !== 4) {
    return {
      name: 'Spamhaus ZEN',
      status: 'unavailable',
      codes: [],
      description: 'IPv6 is not checked in this lightweight path.',
    }
  }

  const reversed = ip.split('.').reverse().join('.')
  const answers = await resolve4Safe(`${reversed}.zen.spamhaus.org`)
  if (Array.isArray(answers) && answers.length > 0) {
    if (answers.includes('127.255.255.254') || answers.includes('127.255.255.252')) {
      return {
        name: 'Spamhaus ZEN',
        status: 'unavailable',
        codes: answers,
        description: 'Resolver returned a policy response instead of a reputation verdict.',
      }
    }
    return {
      name: 'Spamhaus ZEN',
      status: 'listed',
      codes: answers,
      description: 'The IP appears on a Spamhaus DNSBL dataset.',
    }
  }
  return {
    name: 'Spamhaus ZEN',
    status: 'clear',
    codes: [],
    description: 'No listing was returned by Spamhaus ZEN.',
  }
}

async function queryDomainDnsbl(domain, zone, name) {
  const answers = await resolve4Safe(`${domain}.${zone}`)
  if (Array.isArray(answers) && answers.length > 0) {
    if (answers.includes('127.255.255.254') || answers.includes('127.255.255.252')) {
      return {
        name,
        zone,
        status: 'unavailable',
        codes: answers,
        description: 'Resolver policy response prevented a public verdict.',
      }
    }
    return {
      name,
      zone,
      status: 'listed',
      codes: answers,
      description: `${name} returned a positive DNSBL response.`,
    }
  }
  return {
    name,
    zone,
    status: 'clear',
    codes: [],
    description: `${name} did not return a listing.`,
  }
}

function summarizeFindings(findings, fallback) {
  if (!findings.length) return fallback
  return findings
    .slice(0, 3)
    .map((item) => item.title)
    .join('；')
}

function scoreFromFindings(findings, baseScore = 6) {
  return clamp(
    findings.reduce((total, item) => total + (SEVERITY_WEIGHTS[item.level] ?? 0), baseScore)
  )
}

function scoreDimension(score) {
  return clamp(Math.round(score))
}

function getProviderRisk(text) {
  if (!text) return { hosting: false, residential: false }
  return {
    hosting: HOSTING_PATTERNS.some((pattern) => pattern.test(text)),
    residential: RESIDENTIAL_PATTERNS.some((pattern) => pattern.test(text)),
  }
}

export async function getIpRiskScore(ip) {
  if (!net.isIP(ip)) {
    throw new Error('Invalid IP address')
  }

  const findings = []

  if (!isPublicIp(ip)) {
    findings.push({
      title: 'Non-public address range',
      description: 'Private, loopback, link-local, or reserved ranges should not be treated as Internet-facing targets.',
      level: 'critical',
    })
  }

  const [ipapi, rdap, ptrRecords, spamhaus] = await Promise.all([
    safeFetchJson(`https://ipapi.co/${encodeURIComponent(ip)}/json/`),
    safeFetchJson(`https://rdap.org/ip/${encodeURIComponent(ip)}`),
    dns.reverse(ip).catch(() => []),
    querySpamhausZen(ip),
  ])

  const orgText = [ipapi?.org, rdap?.name, rdap?.handle].filter(Boolean).join(' ')
  const providerFlags = getProviderRisk(orgText)
  const abuseContacts = extractRdapAbuseContacts(rdap)

  if (spamhaus.status === 'listed') {
    findings.push({
      title: 'Listed by Spamhaus ZEN',
      description: `Spamhaus returned ${spamhaus.codes.join(', ')} for this IP, which is a strong abuse signal.`,
      level: 'critical',
    })
  }

  if (providerFlags.hosting) {
    findings.push({
      title: 'Infrastructure appears to be hosting or proxy-oriented',
      description: 'Cloud, hosting, proxy, or data-center allocation increases the need for tighter abuse controls and monitoring.',
      level: 'medium',
    })
  }

  if (!ptrRecords.length) {
    findings.push({
      title: 'No reverse DNS observed',
      description: 'Missing PTR is not a verdict by itself, but it reduces traceability and often breaks mail hygiene.',
      level: 'low',
    })
  }

  if (!abuseContacts.length) {
    findings.push({
      title: 'RDAP abuse contact not exposed',
      description: 'Missing abuse contact details make escalation and ownership verification harder.',
      level: 'medium',
    })
  }

  if (providerFlags.residential && spamhaus.status !== 'listed') {
    findings.push({
      title: 'Network appears residential or mobile',
      description: 'Residential/mobile allocation usually implies less intentional public service exposure, which slightly reduces baseline risk.',
      level: 'low',
    })
  }

  const score = scoreFromFindings(findings, providerFlags.hosting ? 18 : 10)
  const level = getRiskLevel(score)
  const summary = summarizeFindings(findings, 'No strong abuse signals were found in the lightweight checks.')

  return {
    target: ip,
    score,
    level,
    summary,
    dimensions: [
      { name: 'Reputation', score: scoreDimension(spamhaus.status === 'listed' ? 94 : 18) },
      { name: 'Infrastructure', score: scoreDimension(providerFlags.hosting ? 64 : providerFlags.residential ? 22 : 38) },
      { name: 'Registration', score: scoreDimension(abuseContacts.length ? 20 : 58) },
      { name: 'Traceability', score: scoreDimension(ptrRecords.length ? 18 : 44) },
    ],
    findings,
    context: {
      version: ipapi?.version ?? null,
      city: ipapi?.city ?? null,
      region: ipapi?.region ?? null,
      country: ipapi?.country_name ?? null,
      countryCode: ipapi?.country_code ?? null,
      timezone: ipapi?.timezone ?? null,
      org: ipapi?.org ?? rdap?.name ?? null,
      asn: ipapi?.asn ?? null,
      ptrRecords,
      abuseContacts,
      rdapHandle: rdap?.handle ?? null,
      networkName: rdap?.name ?? null,
      reputation: spamhaus,
    },
  }
}

export async function getDomainBlacklistReport(domain) {
  const normalized = normalizeDomain(domain)
  if (!isValidDomain(normalized)) {
    throw new Error('Invalid domain')
  }

  const [spamhaus, surbl, rdap, txtRecords, dmarcRecords, addresses] = await Promise.all([
    queryDomainDnsbl(normalized, 'dbl.spamhaus.org', 'Spamhaus DBL'),
    queryDomainDnsbl(normalized, 'multi.surbl.org', 'SURBL multi'),
    safeFetchJson(`https://rdap.org/domain/${encodeURIComponent(normalized)}`),
    resolveTxtSafe(normalized),
    resolveTxtSafe(`_dmarc.${normalized}`),
    resolveWithFallback(normalized),
  ])

  const findings = []
  const listedCount = [spamhaus, surbl].filter((item) => item.status === 'listed').length
  const createdDate = extractRdapEventDate(rdap, ['registration', 'created'])
  const ageDays = createdDate ? Math.max(0, Math.round((Date.now() - new Date(createdDate).getTime()) / 86400000)) : null
  const spfRecords = txtRecords.filter((item) => /^v=spf1/i.test(item))

  if (spamhaus.status === 'listed') {
    findings.push({
      title: 'Listed by Spamhaus DBL',
      description: `Spamhaus DBL returned ${spamhaus.codes.join(', ')} for the queried domain.`,
      level: 'critical',
    })
  }

  if (surbl.status === 'listed') {
    findings.push({
      title: 'Listed by SURBL',
      description: `SURBL returned ${surbl.codes.join(', ')} for the queried domain.`,
      level: 'high',
    })
  }

  if (ageDays != null && ageDays <= 30) {
    findings.push({
      title: 'Recently registered domain',
      description: `Registration age is about ${ageDays} days, which warrants extra scrutiny for newly launched infrastructure.`,
      level: 'medium',
    })
  }

  if (!spfRecords.length) {
    findings.push({
      title: 'No SPF record detected',
      description: 'Missing SPF weakens sender reputation controls and makes spoofing easier.',
      level: 'medium',
    })
  }

  if (!dmarcRecords.length) {
    findings.push({
      title: 'No DMARC policy detected',
      description: 'Without DMARC, receivers get less guidance for rejecting spoofed mail.',
      level: 'medium',
    })
  }

  const score = scoreFromFindings(findings, listedCount > 0 ? 20 : 8)
  const level = getRiskLevel(score)

  return {
    target: normalized,
    score,
    level,
    summary: summarizeFindings(findings, 'No blacklist hits were returned by the selected public DNSBL sources.'),
    dimensions: [
      { name: 'Blocklists', score: scoreDimension(listedCount * 45 + 10) },
      { name: 'Registration', score: scoreDimension(ageDays == null ? 35 : ageDays <= 30 ? 68 : ageDays <= 180 ? 42 : 20) },
      { name: 'Mail Auth', score: scoreDimension((spfRecords.length ? 10 : 34) + (dmarcRecords.length ? 8 : 28)) },
      { name: 'Reachability', score: scoreDimension(addresses.a.length || addresses.aaaa.length ? 12 : 46) },
    ],
    findings,
    blacklists: [spamhaus, surbl],
    profile: {
      registrar: rdap?.entities?.find((entity) => (entity.roles ?? []).includes('registrar'))?.handle ?? null,
      createdDate,
      ageDays,
      spfRecords,
      dmarcRecords,
      addresses,
    },
  }
}

function createSocketScan(target, port, timeout) {
  return new Promise((resolve) => {
    const startedAt = Date.now()
    const socket = new net.Socket()
    let settled = false
    let banner = ''

    const finalize = (status, errorCode = null) => {
      if (settled) return
      settled = true
      socket.destroy()
      const meta = getPortMeta(port)
      resolve({
        port,
        status,
        errorCode,
        service: meta.service,
        severity: status === 'open' ? meta.severity : 'info',
        reason: meta.reason,
        latencyMs: Date.now() - startedAt,
        banner: banner.trim() || null,
      })
    }

    socket.setTimeout(timeout)
    socket.once('connect', () => {
      if ([80, 8080, 8000, 3000, 5000, 9000].includes(port)) {
        socket.write(`HEAD / HTTP/1.0\r\nHost: ${target}\r\nConnection: close\r\n\r\n`)
      }
      setTimeout(() => finalize('open'), 160)
    })
    socket.on('data', (chunk) => {
      if (!banner) banner = String(chunk).replace(/\s+/g, ' ').slice(0, 100)
    })
    socket.once('timeout', () => finalize('filtered', 'TIMEOUT'))
    socket.once('error', (error) => {
      if (error.code === 'ECONNREFUSED') finalize('closed', error.code)
      else finalize('filtered', error.code ?? 'ERROR')
    })
    socket.connect(port, target)
  })
}

function parsePorts(customPorts = [], preset = 'common') {
  const presetPorts = PORT_PRESETS[preset] ?? PORT_PRESETS.common
  const parsedCustom = toArray(customPorts)
    .flatMap((value) => String(value).split(','))
    .map((value) => Number(value.trim()))
    .filter((value) => Number.isInteger(value) && value > 0 && value <= 65535)

  return [...new Set([...presetPorts, ...parsedCustom])].slice(0, 64)
}

export async function getPortScanReport({ target, preset = 'common', ports = [], timeout = 1200 }) {
  const normalizedTarget = normalizeText(target)
  if (!normalizedTarget) throw new Error('Target is required')

  const portsToScan = parsePorts(ports, preset)
  const [resolvedAddresses, results] = await Promise.all([
    dns.lookup(normalizedTarget, { all: true }).catch(() => []),
    Promise.all(portsToScan.map((port) => createSocketScan(normalizedTarget, port, timeout))),
  ])

  const openPorts = results.filter((item) => item.status === 'open')
  const findings = openPorts
    .filter((item) => item.severity !== 'info')
    .sort((left, right) => (SEVERITY_WEIGHTS[right.severity] ?? 0) - (SEVERITY_WEIGHTS[left.severity] ?? 0))
    .slice(0, 8)
    .map((item) => ({
      title: `${item.service} on port ${item.port} is reachable`,
      description: item.reason,
      level: item.severity,
    }))

  if (!openPorts.length) {
    findings.push({
      title: 'No selected ports responded',
      description: 'Within the chosen preset and timeout, no port completed a TCP connection.',
      level: 'low',
    })
  }

  const score = clamp(
    openPorts.reduce((total, port) => total + (SEVERITY_WEIGHTS[port.severity] ?? 0) / 2, 6)
  )
  const level = getRiskLevel(score)

  return {
    target: normalizedTarget,
    score,
    level,
    summary: summarizeFindings(findings, 'No selected ports completed a TCP handshake.'),
    dimensions: [
      { name: 'Exposure', score: scoreDimension(openPorts.length * 12 + 10) },
      { name: 'Critical Services', score: scoreDimension(openPorts.filter((item) => item.severity === 'critical').length * 36) },
      { name: 'Admin Surface', score: scoreDimension(openPorts.filter((item) => [22, 23, 3389, 5900, 2375].includes(item.port)).length * 32) },
      { name: 'Data Stores', score: scoreDimension(openPorts.filter((item) => [3306, 5432, 6379, 9200, 27017].includes(item.port)).length * 34) },
    ],
    findings,
    counts: {
      total: results.length,
      open: openPorts.length,
      closed: results.filter((item) => item.status === 'closed').length,
      filtered: results.filter((item) => item.status === 'filtered').length,
    },
    resolvedAddresses,
    results,
  }
}

async function fetchGoogleDoh(name, type) {
  return safeFetchJson(`https://dns.google/resolve?name=${encodeURIComponent(name)}&type=${encodeURIComponent(type)}&do=true`)
}

export async function getDnsVulnerabilityReport(domain) {
  const normalized = normalizeDomain(domain)
  if (!isValidDomain(normalized)) {
    throw new Error('Invalid domain')
  }

  const [a, aaaa, ns, mx, txtRecords, caa, soa, dmarc, dnskey, wildcard, nsAddressChecks] = await Promise.all([
    dns.resolve4(normalized).catch(() => []),
    dns.resolve6(normalized).catch(() => []),
    dns.resolveNs(normalized).catch(() => []),
    dns.resolveMx(normalized).catch(() => []),
    resolveTxtSafe(normalized),
    dns.resolveCaa(normalized).catch(() => []),
    dns.resolveSoa(normalized).catch(() => null),
    resolveTxtSafe(`_dmarc.${normalized}`),
    fetchGoogleDoh(normalized, 'DNSKEY'),
    dns.resolve4(`toolbox-check-${Date.now()}.${normalized}`).catch(() => []),
    dns.resolveNs(normalized)
      .then((servers) => Promise.all(servers.map((server) => resolveWithFallback(server).then((addresses) => ({ server, addresses })))))
      .catch(() => []),
  ])

  const findings = []
  const spfRecords = txtRecords.filter((item) => /^v=spf1/i.test(item))
  const dnssecEnabled = Boolean(dnskey?.AD || (dnskey?.Answer?.length ?? 0) > 0)
  const wildcardEnabled = wildcard.length > 0
  const dmarcPolicy = dmarc.find((entry) => /^v=DMARC1/i.test(entry)) ?? ''

  if (ns.length < 2) {
    findings.push({
      title: 'Only one authoritative NS detected',
      description: 'Single-provider or single-host delegation reduces resilience and increases outage risk.',
      level: 'medium',
    })
  }

  if (!dnssecEnabled) {
    findings.push({
      title: 'DNSSEC not observed',
      description: 'No DNSKEY/AD evidence was returned by Google DoH, so spoofing resistance appears limited.',
      level: 'medium',
    })
  }

  if (!spfRecords.length) {
    findings.push({
      title: 'No SPF record detected',
      description: 'Mail spoofing protection is weaker without SPF.',
      level: 'medium',
    })
  }

  if (spfRecords.length > 1) {
    findings.push({
      title: 'Multiple SPF records detected',
      description: 'Multiple SPF records can invalidate policy evaluation and should be consolidated.',
      level: 'high',
    })
  }

  if (!dmarc.length) {
    findings.push({
      title: 'No DMARC policy detected',
      description: 'Receivers do not have explicit policy guidance for spoofed mail.',
      level: 'medium',
    })
  } else if (/p=none/i.test(dmarcPolicy)) {
    findings.push({
      title: 'DMARC is monitoring-only',
      description: 'A p=none policy gives visibility, but does not actively reject abuse.',
      level: 'low',
    })
  }

  if (!caa.length) {
    findings.push({
      title: 'No CAA record detected',
      description: 'Without CAA, any trusted CA may be able to issue certificates for the zone.',
      level: 'low',
    })
  }

  if (wildcardEnabled) {
    findings.push({
      title: 'Wildcard DNS response detected',
      description: 'Wildcard DNS can mask typos, shadow unused names, and widen abuse surface.',
      level: 'medium',
    })
  }

  const lameDelegation = nsAddressChecks.filter((entry) => !entry.addresses.a.length && !entry.addresses.aaaa.length)
  if (lameDelegation.length) {
    findings.push({
      title: 'One or more NS hostnames do not resolve cleanly',
      description: `Unresolved NS targets: ${lameDelegation.map((entry) => entry.server).join(', ')}.`,
      level: 'high',
    })
  }

  if (!a.length && !aaaa.length && !mx.length) {
    findings.push({
      title: 'No A, AAAA, or MX records detected',
      description: 'The zone does not currently expose primary service records.',
      level: 'medium',
    })
  }

  const score = scoreFromFindings(findings, 8)
  const level = getRiskLevel(score)

  return {
    target: normalized,
    score,
    level,
    summary: summarizeFindings(findings, 'Core DNS hygiene checks did not surface high-severity issues.'),
    dimensions: [
      { name: 'Delegation', score: scoreDimension(ns.length < 2 ? 56 : 18) },
      { name: 'Mail Auth', score: scoreDimension((spfRecords.length ? 12 : 32) + (dmarc.length ? /p=none/i.test(dmarcPolicy) ? 20 : 10 : 28)) },
      { name: 'Policy', score: scoreDimension(caa.length ? 12 : 30) },
      { name: 'Integrity', score: scoreDimension(dnssecEnabled ? 14 : 44) },
    ],
    findings,
    records: {
      a,
      aaaa,
      ns,
      mx,
      txt: txtRecords,
      caa,
      soa,
      spfRecords,
      dmarc,
      dnssecEnabled,
      wildcardEnabled,
      nsAddressChecks,
    },
  }
}

export async function getSecurityReport({ domain = '', ip = '', portTarget = '', preset = 'common', ports = [] }) {
  const normalizedDomain = normalizeDomain(domain)
  const normalizedIp = normalizeText(ip)
  const effectivePortTarget = normalizeText(portTarget) || normalizedDomain || normalizedIp

  let derivedIp = normalizedIp
  if (!derivedIp && normalizedDomain) {
    const addresses = await dns.resolve4(normalizedDomain).catch(() => [])
    derivedIp = addresses[0] ?? ''
  }

  const [ipSection, blacklistSection, dnsSection, portSection] = await Promise.all([
    derivedIp ? getIpRiskScore(derivedIp).catch(() => null) : Promise.resolve(null),
    normalizedDomain ? getDomainBlacklistReport(normalizedDomain).catch(() => null) : Promise.resolve(null),
    normalizedDomain ? getDnsVulnerabilityReport(normalizedDomain).catch(() => null) : Promise.resolve(null),
    effectivePortTarget ? getPortScanReport({ target: effectivePortTarget, preset, ports }).catch(() => null) : Promise.resolve(null),
  ])

  const availableSections = [
    ipSection ? { key: 'ip', title: 'IP Risk', ...ipSection } : null,
    blacklistSection ? { key: 'blacklist', title: 'Domain Blacklist', ...blacklistSection } : null,
    dnsSection ? { key: 'dns', title: 'DNS Vulnerability', ...dnsSection } : null,
    portSection ? { key: 'ports', title: 'Port Exposure', ...portSection } : null,
  ].filter(Boolean)

  if (!availableSections.length) {
    throw new Error('At least one domain, IP, or port scan target is required')
  }

  const score = Math.round(
    availableSections.reduce((total, section) => total + section.score, 0) / availableSections.length
  )
  const level = getRiskLevel(score)
  const findings = availableSections
    .flatMap((section) =>
      section.findings.map((item) => ({
        ...item,
        source: section.title,
      }))
    )
    .sort((left, right) => (SEVERITY_WEIGHTS[right.level] ?? 0) - (SEVERITY_WEIGHTS[left.level] ?? 0))
    .slice(0, 12)

  return {
    score,
    level,
    summary: summarizeFindings(findings, 'The report completed without producing any high-severity findings.'),
    derivedIp: derivedIp || null,
    sections: {
      ip: ipSection,
      blacklist: blacklistSection,
      dns: dnsSection,
      ports: portSection,
    },
    dimensions: availableSections.map((section) => ({
      name: section.title,
      score: section.score,
    })),
    findings,
  }
}
