import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)
const WHOIS_BIN = process.env.WHOIS_BIN || 'whois'

function firstMatch(text, patterns) {
  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match?.[1]) return match[1].trim()
  }

  return ''
}

function collectMatches(text, patterns) {
  const values = new Set()
  for (const pattern of patterns) {
    for (const match of text.matchAll(pattern)) {
      if (match[1]) values.add(match[1].trim())
    }
  }

  return Array.from(values)
}

function looksLikeIp(query) {
  return /^(\d{1,3}\.){3}\d{1,3}$/.test(query) || /^[a-f0-9:]+$/i.test(query)
}

function parseWhois(text, query) {
  const isIp = looksLikeIp(query)

  if (isIp) {
    return {
      queryType: 'ip',
      organization:
        firstMatch(text, [/OrgName:\s*(.+)$/im, /org-name:\s*(.+)$/im, /netname:\s*(.+)$/im]) || '',
      country: firstMatch(text, [/Country:\s*(.+)$/im, /country:\s*(.+)$/im]) || '',
      cidr: firstMatch(text, [/CIDR:\s*(.+)$/im, /route:\s*(.+)$/im]) || '',
      handle: firstMatch(text, [/NetHandle:\s*(.+)$/im, /nic-hdl:\s*(.+)$/im]) || '',
      abuseEmail: firstMatch(text, [/OrgAbuseEmail:\s*(.+)$/im, /abuse-mailbox:\s*(.+)$/im]) || '',
      nameservers: [],
      statuses: collectMatches(text, [/status:\s*(.+)$/gim]),
    }
  }

  return {
    queryType: 'domain',
    registrar: firstMatch(text, [/Registrar:\s*(.+)$/im, /Sponsoring Registrar:\s*(.+)$/im]),
    registrant: firstMatch(text, [/Registrant Organization:\s*(.+)$/im, /org:\s*(.+)$/im]),
    country: firstMatch(text, [/Registrant Country:\s*(.+)$/im, /country:\s*(.+)$/im]),
    creationDate: firstMatch(text, [/Creation Date:\s*(.+)$/im, /Created On:\s*(.+)$/im, /created:\s*(.+)$/im]),
    expirationDate: firstMatch(text, [/Registry Expiry Date:\s*(.+)$/im, /Expiration Date:\s*(.+)$/im, /paid-till:\s*(.+)$/im]),
    updatedDate: firstMatch(text, [/Updated Date:\s*(.+)$/im, /Last Updated On:\s*(.+)$/im, /changed:\s*(.+)$/im]),
    nameservers: collectMatches(text, [/Name Server:\s*(.+)$/gim, /nserver:\s*(.+)$/gim]),
    statuses: collectMatches(text, [/Domain Status:\s*(.+)$/gim, /status:\s*(.+)$/gim]),
  }
}

export async function lookupWhois(query) {
  const normalized = String(query || '').trim().toLowerCase()
  if (!normalized) throw new Error('Query is required')

  try {
    const { stdout, stderr } = await execFileAsync(WHOIS_BIN, [normalized], {
      timeout: 15000,
      maxBuffer: 4 * 1024 * 1024,
    })

    const rawText = [stdout, stderr].filter(Boolean).join('\n').trim()
    if (!rawText) throw new Error('WHOIS returned no data')

    return {
      query: normalized,
      source: 'whois',
      parsed: parseWhois(rawText, normalized),
      rawText,
      timestamp: new Date().toISOString(),
    }
  } catch (error) {
    throw new Error(error.message || 'WHOIS lookup failed')
  }
}
