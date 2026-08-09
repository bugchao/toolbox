import { describe, it, expect } from 'vitest'
import { genFirefoxConfig, genChromeEdgeConfig, genWindowsConfig, genLinuxConfig } from '../lib/scriptGen'

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
