export function genFirefoxConfig(url: string): string {
  return [
    '// about:config',
    'network.trr.mode = 3',
    `network.trr.uri = "${url}"`,
  ].join('\n')
}

export function genChromeEdgeConfig(url: string): string {
  return [
    '设置 → 隐私设置和安全性 → 安全 → 使用安全 DNS → 自定义',
    url,
  ].join('\n')
}

export function genWindowsConfig(url: string): string {
  const host = safeHostname(url)
  return [
    `netsh dns add encryption server=${host || '<server-ip>'} dohtemplate=${url}`,
    `netsh dns add global doh=yes`,
  ].join('\n')
}

export function genLinuxConfig(url: string): string {
  return [
    '# /etc/systemd/resolved.conf (systemd v253+ 原生 DoH 支持)',
    '[Resolve]',
    `DNS=${url}`,
    'DNSOverTLS=opportunistic',
  ].join('\n')
}

function safeHostname(url: string): string {
  try {
    return new URL(url).hostname
  } catch {
    return ''
  }
}
