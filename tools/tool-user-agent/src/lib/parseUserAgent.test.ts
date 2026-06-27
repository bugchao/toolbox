import { describe, it, expect } from 'vitest'
import { parseUserAgent } from './parseUserAgent'

describe('parseUserAgent - browsers', () => {
  it('detects Chrome on Windows (Blink)', () => {
    const ua =
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    const r = parseUserAgent(ua)
    expect(r.browser.name).toBe('Chrome')
    expect(r.browser.version).toBe('120.0.0.0')
    expect(r.engine.name).toBe('Blink')
    expect(r.os.name).toBe('Windows')
    expect(r.os.version).toBe('10')
    expect(r.device.type).toBe('desktop')
    expect(r.cpu.architecture).toBe('amd64')
    expect(r.isBot).toBe(false)
  })

  it('detects Edge (Chromium) and does NOT misclassify as Chrome', () => {
    const ua =
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.2210.91'
    const r = parseUserAgent(ua)
    expect(r.browser.name).toBe('Microsoft Edge')
    expect(r.browser.version).toBe('120.0.2210.91')
    expect(r.engine.name).toBe('Blink')
    expect(r.os.name).toBe('Windows')
  })

  it('detects legacy Edge (EdgeHTML)', () => {
    const ua =
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36 Edge/16.16299'
    const r = parseUserAgent(ua)
    expect(r.browser.name).toBe('Microsoft Edge (Legacy)')
    expect(r.engine.name).toBe('EdgeHTML')
  })

  it('detects Firefox on Linux (Gecko)', () => {
    const ua = 'Mozilla/5.0 (X11; Linux x86_64; rv:121.0) Gecko/20100101 Firefox/121.0'
    const r = parseUserAgent(ua)
    expect(r.browser.name).toBe('Firefox')
    expect(r.browser.version).toBe('121.0')
    expect(r.engine.name).toBe('Gecko')
    expect(r.engine.version).toBe('121.0')
    expect(r.os.name).toBe('Linux')
    expect(r.device.type).toBe('desktop')
  })

  it('detects Safari on macOS (WebKit) and not Chrome', () => {
    const ua =
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15'
    const r = parseUserAgent(ua)
    expect(r.browser.name).toBe('Safari')
    expect(r.browser.version).toBe('17.1')
    expect(r.engine.name).toBe('WebKit')
    expect(r.os.name).toBe('macOS')
    expect(r.os.version).toBe('10.15.7')
    expect(r.device.type).toBe('desktop')
  })

  it('detects Opera (OPR) as Opera not Chrome', () => {
    const ua =
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36 OPR/105.0.0.0'
    const r = parseUserAgent(ua)
    expect(r.browser.name).toBe('Opera')
    expect(r.browser.version).toBe('105.0.0.0')
    expect(r.engine.name).toBe('Blink')
  })

  it('detects Samsung Internet as Samsung not Chrome', () => {
    const ua =
      'Mozilla/5.0 (Linux; Android 13; SM-S908B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/23.0 Chrome/115.0.0.0 Mobile Safari/537.36'
    const r = parseUserAgent(ua)
    expect(r.browser.name).toBe('Samsung Internet')
    expect(r.browser.version).toBe('23.0')
    expect(r.engine.name).toBe('Blink')
    expect(r.os.name).toBe('Android')
    expect(r.device.type).toBe('mobile')
  })

  it('detects Internet Explorer 11 (Trident)', () => {
    const ua = 'Mozilla/5.0 (Windows NT 10.0; WOW64; Trident/7.0; rv:11.0) like Gecko'
    const r = parseUserAgent(ua)
    expect(r.browser.name).toBe('Internet Explorer')
    expect(r.browser.version).toBe('11.0')
    expect(r.engine.name).toBe('Trident')
  })
})

describe('parseUserAgent - operating systems & devices', () => {
  it('detects iOS Safari on iPhone (mobile, WebKit)', () => {
    const ua =
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1'
    const r = parseUserAgent(ua)
    expect(r.browser.name).toBe('Safari')
    expect(r.engine.name).toBe('WebKit')
    expect(r.os.name).toBe('iOS')
    expect(r.os.version).toBe('17.1')
    expect(r.device.type).toBe('mobile')
  })

  it('detects iOS Chrome (CriOS) reported as Chrome on WebKit', () => {
    const ua =
      'Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/115.0.5790.130 Mobile/15E148 Safari/604.1'
    const r = parseUserAgent(ua)
    expect(r.browser.name).toBe('Chrome')
    expect(r.browser.version).toBe('115.0.5790.130')
    expect(r.engine.name).toBe('WebKit')
    expect(r.os.name).toBe('iOS')
    expect(r.device.type).toBe('mobile')
  })

  it('detects iPad as tablet (iPadOS)', () => {
    const ua =
      'Mozilla/5.0 (iPad; CPU OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1'
    const r = parseUserAgent(ua)
    expect(r.os.name).toBe('iPadOS')
    expect(r.os.version).toBe('16.6')
    expect(r.device.type).toBe('tablet')
  })

  it('detects Android Chrome as mobile', () => {
    const ua =
      'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36'
    const r = parseUserAgent(ua)
    expect(r.browser.name).toBe('Chrome')
    expect(r.os.name).toBe('Android')
    expect(r.os.version).toBe('14')
    expect(r.device.type).toBe('mobile')
  })

  it('detects Android tablet (no Mobile token)', () => {
    const ua =
      'Mozilla/5.0 (Linux; Android 13; SM-X700) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    const r = parseUserAgent(ua)
    expect(r.os.name).toBe('Android')
    expect(r.device.type).toBe('tablet')
  })

  it('detects ChromeOS', () => {
    const ua =
      'Mozilla/5.0 (X11; CrOS x86_64 14541.0.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    const r = parseUserAgent(ua)
    expect(r.os.name).toBe('Chrome OS')
    expect(r.browser.name).toBe('Chrome')
    expect(r.device.type).toBe('desktop')
  })

  it('maps Windows 8.1 NT version', () => {
    const ua =
      'Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    const r = parseUserAgent(ua)
    expect(r.os.name).toBe('Windows')
    expect(r.os.version).toBe('8.1')
  })

  it('detects arm64 cpu architecture', () => {
    const ua =
      'Mozilla/5.0 (X11; Linux aarch64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    const r = parseUserAgent(ua)
    expect(r.cpu.architecture).toBe('arm64')
  })
})

describe('parseUserAgent - bots', () => {
  it('detects Googlebot', () => {
    const ua =
      'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'
    const r = parseUserAgent(ua)
    expect(r.isBot).toBe(true)
    expect(r.botName).toBe('Googlebot')
    expect(r.device.type).toBe('bot')
  })

  it('detects bingbot', () => {
    const ua =
      'Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)'
    const r = parseUserAgent(ua)
    expect(r.isBot).toBe(true)
    expect(r.botName).toBe('bingbot')
    expect(r.device.type).toBe('bot')
  })

  it('detects curl as bot/tool', () => {
    const r = parseUserAgent('curl/8.4.0')
    expect(r.isBot).toBe(true)
    expect(r.botName).toBe('curl')
  })

  it('flags unknown crawler via generic keyword', () => {
    const r = parseUserAgent('Mozilla/5.0 (compatible; SomeRandom crawler/1.0; +http://example.com)')
    expect(r.isBot).toBe(true)
    expect(r.botName).toBe('')
  })

  it('does not flag a normal browser as bot', () => {
    const ua =
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    expect(parseUserAgent(ua).isBot).toBe(false)
  })
})

describe('parseUserAgent - edge cases & tokens', () => {
  it('returns not recognized for empty input', () => {
    const r = parseUserAgent('')
    expect(r.recognized).toBe(false)
    expect(r.products).toEqual([])
  })

  it('returns not recognized for gibberish', () => {
    const r = parseUserAgent('hello world this is not a ua')
    expect(r.recognized).toBe(false)
  })

  it('extracts product tokens and comments', () => {
    const ua =
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    const r = parseUserAgent(ua)
    expect(r.products).toEqual([
      { name: 'Mozilla', version: '5.0' },
      { name: 'AppleWebKit', version: '537.36' },
      { name: 'Chrome', version: '120.0.0.0' },
      { name: 'Safari', version: '537.36' },
    ])
    expect(r.comments).toContain('Windows NT 10.0')
    expect(r.comments).toContain('Win64')
    expect(r.comments).toContain('x64')
  })

  it('preserves raw input', () => {
    expect(parseUserAgent('  abc  ').raw).toBe('  abc  ')
  })
})
