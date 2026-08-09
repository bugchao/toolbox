import type { LinuxVariant } from './types'

export function genMacScript(ips: string[]): string {
  const service = 'Wi-Fi'
  return `networksetup -setdnsservers "${service}" ${ips.join(' ')}`
}

export function genLinuxScript(ips: string[], variant: LinuxVariant): string {
  if (variant === 'nmcli') {
    return `nmcli connection modify "$(nmcli -t -f NAME connection show --active | head -1)" ipv4.dns "${ips.join(' ')}"\nnmcli connection up "$(nmcli -t -f NAME connection show --active | head -1)"`
  }
  if (variant === 'netplan') {
    const nameservers = ips.map((ip) => `          - ${ip}`).join('\n')
    return `network:\n  version: 2\n  ethernets:\n    eth0:\n      nameservers:\n        addresses:\n${nameservers}`
  }
  return ips.map((ip) => `nameserver ${ip}`).join('\n')
}

export function genWindowsScript(ips: string[]): string {
  if (ips.length === 0) return ''
  const [primary, ...rest] = ips
  const netsh = [
    `netsh interface ip set dns name="Ethernet" static ${primary}`,
    ...rest.map((ip, i) => `netsh interface ip add dns name="Ethernet" ${ip} index=${i + 2}`),
  ].join('\n')
  return netsh
}
