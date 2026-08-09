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

export function genMacConfig(url: string, payloadUuid: string = crypto.randomUUID(), profileUuid: string = crypto.randomUUID()): string {
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">',
    '<plist version="1.0">',
    '<dict>',
    '\t<key>PayloadContent</key>',
    '\t<array>',
    '\t\t<dict>',
    '\t\t\t<key>DNSSettings</key>',
    '\t\t\t<dict>',
    '\t\t\t\t<key>DNSProtocol</key>',
    '\t\t\t\t<string>HTTPS</string>',
    '\t\t\t\t<key>ServerURL</key>',
    `\t\t\t\t<string>${url}</string>`,
    '\t\t\t</dict>',
    '\t\t\t<key>PayloadDescription</key>',
    '\t\t\t<string>Configures DNS over HTTPS</string>',
    '\t\t\t<key>PayloadDisplayName</key>',
    '\t\t\t<string>DNS over HTTPS</string>',
    '\t\t\t<key>PayloadIdentifier</key>',
    `\t\t\t<string>com.apple.dnsSettings.managed.${payloadUuid}</string>`,
    '\t\t\t<key>PayloadType</key>',
    '\t\t\t<string>com.apple.dnsSettings.managed</string>',
    '\t\t\t<key>PayloadUUID</key>',
    `\t\t\t<string>${payloadUuid}</string>`,
    '\t\t\t<key>PayloadVersion</key>',
    '\t\t\t<integer>1</integer>',
    '\t\t</dict>',
    '\t</array>',
    '\t<key>PayloadDisplayName</key>',
    '\t<string>DNS over HTTPS</string>',
    '\t<key>PayloadIdentifier</key>',
    `\t<string>com.toolbox.dnsoverhttps.${profileUuid}</string>`,
    '\t<key>PayloadType</key>',
    '\t<string>Configuration</string>',
    '\t<key>PayloadUUID</key>',
    `\t<string>${profileUuid}</string>`,
    '\t<key>PayloadVersion</key>',
    '\t<integer>1</integer>',
    '</dict>',
    '</plist>',
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
