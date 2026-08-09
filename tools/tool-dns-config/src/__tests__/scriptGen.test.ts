import { describe, it, expect } from 'vitest'
import { genMacScript, genLinuxScript, genWindowsScript } from '../lib/scriptGen'

describe('genMacScript', () => {
  it('includes all IPs space-separated after networksetup -setdnsservers', () => {
    const script = genMacScript(['1.1.1.1', '1.0.0.1'])
    expect(script).toContain('networksetup -setdnsservers')
    expect(script).toContain('1.1.1.1 1.0.0.1')
  })

  it('handles a single IP', () => {
    expect(genMacScript(['8.8.8.8'])).toContain('8.8.8.8')
  })
})

describe('genLinuxScript', () => {
  it('nmcli variant sets ipv4.dns with all IPs', () => {
    const script = genLinuxScript(['9.9.9.9', '149.112.112.112'], 'nmcli')
    expect(script).toContain('nmcli connection modify')
    expect(script).toContain('9.9.9.9 149.112.112.112')
  })

  it('netplan variant produces one YAML list item per IP', () => {
    const script = genLinuxScript(['1.1.1.1', '1.0.0.1'], 'netplan')
    expect(script).toContain('nameservers:')
    expect(script).toContain('- 1.1.1.1')
    expect(script).toContain('- 1.0.0.1')
  })

  it('resolv-conf variant produces one nameserver line per IP', () => {
    const script = genLinuxScript(['8.8.8.8', '8.8.4.4'], 'resolv-conf')
    expect(script).toBe('nameserver 8.8.8.8\nnameserver 8.8.4.4')
  })
})

describe('genWindowsScript', () => {
  it('sets the first IP as primary via netsh set dns', () => {
    const script = genWindowsScript(['223.5.5.5', '223.6.6.6'])
    expect(script).toContain('netsh interface ip set dns name="Ethernet" static 223.5.5.5')
    expect(script).toContain('netsh interface ip add dns name="Ethernet" 223.6.6.6 index=2')
  })

  it('returns empty string for no IPs', () => {
    expect(genWindowsScript([])).toBe('')
  })

  it('handles a single IP with no add lines', () => {
    const script = genWindowsScript(['114.114.114.114'])
    expect(script).toBe('netsh interface ip set dns name="Ethernet" static 114.114.114.114')
  })
})
