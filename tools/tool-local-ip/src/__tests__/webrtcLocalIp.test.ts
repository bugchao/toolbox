import { describe, it, expect } from 'vitest'
import { extractIpFromCandidate } from '../lib/webrtcLocalIp'

describe('extractIpFromCandidate', () => {
  it('extracts a dotted-quad IPv4 from a normal host candidate', () => {
    const candidate = 'candidate:842163049 1 udp 1677729535 192.168.1.5 51621 typ host generation 0 ufrag abcd network-id 1'
    expect(extractIpFromCandidate(candidate)).toEqual({ kind: 'ipv4', ip: '192.168.1.5' })
  })

  it('detects Chrome mDNS-obfuscated candidates (xxxx.local host)', () => {
    const candidate = 'candidate:1467250027 1 udp 2122260223 5d4a7f3e-2b1c-4c3d-9e8f-1a2b3c4d5e6f.local 54321 typ host generation 0 ufrag abcd network-id 1'
    expect(extractIpFromCandidate(candidate)).toEqual({ kind: 'mdns' })
  })

  it('returns none for a candidate with no useful address (srflx with missing field / garbage)', () => {
    expect(extractIpFromCandidate('candidate:1 1 udp')).toEqual({ kind: 'none' })
  })

  it('returns none for null/undefined/empty candidate strings', () => {
    expect(extractIpFromCandidate(null)).toEqual({ kind: 'none' })
    expect(extractIpFromCandidate(undefined)).toEqual({ kind: 'none' })
    expect(extractIpFromCandidate('')).toEqual({ kind: 'none' })
  })

  it('extracts IPv4 from a relay/srflx candidate too (same field position)', () => {
    const candidate = 'candidate:3348993900 1 udp 41885439 203.0.113.10 3478 typ srflx raddr 0.0.0.0 rport 0 generation 0'
    expect(extractIpFromCandidate(candidate)).toEqual({ kind: 'ipv4', ip: '203.0.113.10' })
  })
})
