import { describe, it, expect } from 'vitest'
import { buildWifiString, escapeWifiValue } from './wifiQr'

describe('escapeWifiValue', () => {
  it('escapes the special characters \\ ; , : "', () => {
    expect(escapeWifiValue('a\\b;c,d:e"f')).toBe('a\\\\b\\;c\\,d\\:e\\"f')
  })

  it('leaves plain values untouched', () => {
    expect(escapeWifiValue('MyHome WiFi')).toBe('MyHome WiFi')
  })
})

describe('buildWifiString', () => {
  it('builds a standard WPA string with password', () => {
    expect(buildWifiString({ ssid: 'Home', password: 'p@ss', auth: 'WPA' })).toBe(
      'WIFI:T:WPA;S:Home;P:p@ss;;'
    )
  })

  it('omits the P field for nopass networks', () => {
    expect(buildWifiString({ ssid: 'Cafe', password: 'ignored', auth: 'nopass' })).toBe(
      'WIFI:T:nopass;S:Cafe;;'
    )
  })

  it('adds H:true only for hidden networks', () => {
    expect(buildWifiString({ ssid: 'Secret', password: 'pw', auth: 'WPA', hidden: true })).toBe(
      'WIFI:T:WPA;S:Secret;P:pw;H:true;;'
    )
    expect(buildWifiString({ ssid: 'Secret', password: 'pw', auth: 'WPA', hidden: false })).toBe(
      'WIFI:T:WPA;S:Secret;P:pw;;'
    )
  })

  it('escapes special characters inside ssid and password', () => {
    expect(buildWifiString({ ssid: 'My;Net', password: 'a,b:c', auth: 'WEP' })).toBe(
      'WIFI:T:WEP;S:My\\;Net;P:a\\,b\\:c;;'
    )
  })
})
