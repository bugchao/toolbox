export interface DnsProvider {
  id: string
  name: string
  ipv4: string[]
  ipv6?: string[]
  description: string
  doHUrl: string
  needsJsonAccept: boolean
}

export type LinuxVariant = 'nmcli' | 'netplan' | 'resolv-conf'

export interface LatencyResult {
  id: string
  name: string
  avg: number
  min: number
  max: number
  ok: boolean
}
