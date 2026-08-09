import { describe, it, expect } from 'vitest'
import { genFirefoxConfig, genChromeEdgeConfig, genMacConfig, genWindowsConfig, genLinuxConfig } from '../lib/scriptGen'

const URL = 'https://cloudflare-dns.com/dns-query'

describe('genFirefoxConfig', () => {
  it('sets trr.mode=3 and trr.uri to the given URL', () => {
    const script = genFirefoxConfig(URL)
    expect(script).toContain('network.trr.mode = 3')
    expect(script).toContain(`network.trr.uri = "${URL}"`)
  })
})

describe('genChromeEdgeConfig', () => {
  it('includes the URL for the custom secure DNS field', () => {
    expect(genChromeEdgeConfig(URL)).toContain(URL)
  })
})

describe('genMacConfig', () => {
  it('produces a valid DNSSettings configuration profile for the given URL', () => {
    const script = genMacConfig(URL, 'uuid-payload', 'uuid-profile')
    expect(script).toContain('<key>DNSProtocol</key>')
    expect(script).toContain('<string>HTTPS</string>')
    expect(script).toContain('<key>ServerURL</key>')
    expect(script).toContain(`<string>${URL}</string>`)
    expect(script).toContain('com.apple.dnsSettings.managed')
  })

  it('uses distinct UUIDs for the payload and the enclosing profile', () => {
    const script = genMacConfig(URL, 'uuid-payload', 'uuid-profile')
    expect(script).toContain('uuid-payload')
    expect(script).toContain('uuid-profile')
  })

  it('generates fresh UUIDs by default so two profiles never collide', () => {
    const a = genMacConfig(URL)
    const b = genMacConfig(URL)
    expect(a).not.toBe(b)
  })

  it('applies system-wide scope, not just the current user', () => {
    const script = genMacConfig(URL)
    expect(script).toContain('<key>PayloadScope</key>')
    expect(script).toContain('<string>System</string>')
  })

  it('excludes captive.apple.com from on-demand DoH so captive portal login pages still work', () => {
    const script = genMacConfig(URL)
    expect(script).toContain('<key>OnDemandRules</key>')
    expect(script).toContain('NeverConnect')
    expect(script).toContain('captive.apple.com')
  })
})

describe('genWindowsConfig', () => {
  it('extracts the hostname for the encryption server and includes the full dohtemplate URL', () => {
    const script = genWindowsConfig(URL)
    expect(script).toContain('server=cloudflare-dns.com')
    expect(script).toContain(`dohtemplate=${URL}`)
    expect(script).toContain('netsh dns add global doh=yes')
  })

  it('falls back to a placeholder when the URL is unparsable', () => {
    const script = genWindowsConfig('not-a-url')
    expect(script).toContain('server=<server-ip>')
  })
})

describe('genLinuxConfig', () => {
  it('sets DNS= to the given URL under [Resolve]', () => {
    const script = genLinuxConfig(URL)
    expect(script).toContain('[Resolve]')
    expect(script).toContain(`DNS=${URL}`)
  })
})
