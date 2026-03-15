export type RiskLevel = 'info' | 'low' | 'medium' | 'high' | 'critical'

export interface Finding {
  title: string
  description: string
  level: RiskLevel
  source?: string
}

export interface DimensionScore {
  name: string
  score: number
}

export interface IpRiskResult {
  target: string
  score: number
  level: RiskLevel
  summary: string
  dimensions: DimensionScore[]
  findings: Finding[]
  context: {
    version: string | null
    city: string | null
    region: string | null
    country: string | null
    countryCode: string | null
    timezone: string | null
    org: string | null
    asn: string | null
    ptrRecords: string[]
    abuseContacts: string[]
    rdapHandle: string | null
    networkName: string | null
    reputation: {
      name: string
      status: 'listed' | 'clear' | 'unavailable'
      codes: string[]
      description: string
    }
  }
}

export interface DomainBlacklistResult {
  target: string
  score: number
  level: RiskLevel
  summary: string
  dimensions: DimensionScore[]
  findings: Finding[]
  blacklists: Array<{
    name: string
    zone: string
    status: 'listed' | 'clear' | 'unavailable'
    codes: string[]
    description: string
  }>
  profile: {
    registrar: string | null
    createdDate: string | null
    ageDays: number | null
    spfRecords: string[]
    dmarcRecords: string[]
    addresses: {
      a: string[]
      aaaa: string[]
    }
  }
}

export interface PortScanResult {
  target: string
  score: number
  level: RiskLevel
  summary: string
  dimensions: DimensionScore[]
  findings: Finding[]
  counts: {
    total: number
    open: number
    closed: number
    filtered: number
  }
  resolvedAddresses: Array<{
    address: string
    family: number
  }>
  results: Array<{
    port: number
    status: 'open' | 'closed' | 'filtered'
    errorCode: string | null
    service: string
    severity: RiskLevel
    reason: string
    latencyMs: number
    banner: string | null
  }>
}

export interface DnsVulnResult {
  target: string
  score: number
  level: RiskLevel
  summary: string
  dimensions: DimensionScore[]
  findings: Finding[]
  records: {
    a: string[]
    aaaa: string[]
    ns: string[]
    mx: Array<{ exchange: string; priority: number }>
    txt: string[]
    caa: Array<{ issue?: string; issuerCritical?: boolean; tag?: string; value?: string }>
    soa: {
      nsname?: string
      hostmaster?: string
      serial?: number
      refresh?: number
      retry?: number
      expire?: number
      minttl?: number
    } | null
    spfRecords: string[]
    dmarc: string[]
    dnssecEnabled: boolean
    wildcardEnabled: boolean
    nsAddressChecks: Array<{
      server: string
      addresses: {
        a: string[]
        aaaa: string[]
      }
    }>
  }
}

export interface SecurityReportResult {
  score: number
  level: RiskLevel
  summary: string
  derivedIp: string | null
  dimensions: DimensionScore[]
  findings: Finding[]
  sections: {
    ip: IpRiskResult | null
    blacklist: DomainBlacklistResult | null
    dns: DnsVulnResult | null
    ports: PortScanResult | null
  }
}
