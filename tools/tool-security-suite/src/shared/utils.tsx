import type { DimensionScore, RiskLevel, SecurityReportResult } from './types'

type TranslateFn = (key: string, options?: Record<string, unknown>) => string

const DIMENSION_KEYS: Record<string, string> = {
  Reputation: 'reputation',
  Infrastructure: 'infrastructure',
  Registration: 'registration',
  Traceability: 'traceability',
  Blocklists: 'blocklists',
  'Mail Auth': 'mailAuth',
  Reachability: 'reachability',
  Exposure: 'exposure',
  'Critical Services': 'criticalServices',
  'Admin Surface': 'adminSurface',
  'Data Stores': 'dataStores',
  Delegation: 'delegation',
  Policy: 'policy',
  Integrity: 'integrity',
  'IP Risk': 'ipRisk',
  'Domain Blacklist': 'domainBlacklist',
  'DNS Vulnerability': 'dnsVulnerability',
  'Port Exposure': 'portExposure',
}

const SOURCE_KEYS: Record<string, string> = {
  'IP Risk': 'ip',
  'Domain Blacklist': 'blacklist',
  'DNS Vulnerability': 'dns',
  'Port Exposure': 'ports',
}

export function levelLabel(t: TranslateFn, level: RiskLevel) {
  return t(`levels.${level}`)
}

export function dimensionLabel(t: TranslateFn, name: string) {
  const key = DIMENSION_KEYS[name]
  return key ? t(`dimensions.${key}`) : name
}

export function reportSourceLabel(t: TranslateFn, source?: string) {
  if (!source) return ''
  const key = SOURCE_KEYS[source]
  return key ? t(`report.sections.${key}`) : source
}

export function statusLabel(
  t: TranslateFn,
  status: 'listed' | 'clear' | 'unavailable' | 'open' | 'closed' | 'filtered'
) {
  return t(`status.${status}`)
}

export function formatDate(value?: string | null, locale = 'zh-CN') {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date)
}

export function formatDimensionData(t: TranslateFn, dimensions: DimensionScore[]) {
  return dimensions.map((item) => ({
    ...item,
    label: dimensionLabel(t, item.name),
  }))
}

export function buildSecurityReportMarkdown(
  t: TranslateFn,
  result: SecurityReportResult,
  input: {
    domain: string
    ip: string
    portTarget: string
  }
) {
  const lines = [
    `# ${t('report.title')}`,
    '',
    `${t('report.generatedAt')}: ${new Date().toLocaleString()}`,
    `${t('report.overallScore')}: ${result.score}/100 (${levelLabel(t, result.level)})`,
    `${t('report.summary')}: ${result.summary}`,
    '',
    `## ${t('report.scope')}`,
    '',
    `- ${t('report.inputs.domain')}: ${input.domain || '—'}`,
    `- ${t('report.inputs.ip')}: ${input.ip || result.derivedIp || '—'}`,
    `- ${t('report.inputs.portTarget')}: ${input.portTarget || input.domain || input.ip || '—'}`,
    '',
    `## ${t('report.highlights')}`,
    '',
  ]

  for (const finding of result.findings) {
    lines.push(`- [${reportSourceLabel(t, finding.source)}] ${finding.title}: ${finding.description}`)
  }

  lines.push('', `## ${t('report.sectionsTitle')}`, '')

  const sectionEntries: Array<[string, { score: number; summary: string; level: RiskLevel } | null]> = [
    [t('report.sections.ip'), result.sections.ip],
    [t('report.sections.blacklist'), result.sections.blacklist],
    [t('report.sections.dns'), result.sections.dns],
    [t('report.sections.ports'), result.sections.ports],
  ]

  for (const [label, section] of sectionEntries) {
    if (!section) continue
    lines.push(`### ${label}`)
    lines.push('')
    lines.push(`- ${t('report.overallScore')}: ${section.score}/100 (${levelLabel(t, section.level)})`)
    lines.push(`- ${t('report.summary')}: ${section.summary}`)
    lines.push('')
  }

  return lines.join('\n')
}
