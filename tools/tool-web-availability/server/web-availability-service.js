import https from 'https'
import http from 'http'
import { URL } from 'url'

function checkUrl(rawUrl) {
  return new Promise((resolve) => {
    const start = Date.now()
    let url
    try {
      url = new URL(rawUrl.startsWith('http') ? rawUrl : 'https://' + rawUrl)
    } catch {
      return resolve({ url: rawUrl, status: null, statusText: '无效 URL', responseTimeMs: null, available: false, error: '无效 URL' })
    }

    const lib = url.protocol === 'https:' ? https : http
    const req = lib.request(url.toString(), {
      method: 'HEAD',
      timeout: 10000,
      headers: { 'User-Agent': 'Toolbox-Availability-Checker/1.0' },
    }, (res) => {
      const responseTimeMs = Date.now() - start
      const status = res.statusCode
      const available = status < 500
      const redirectUrl = [301, 302, 303, 307, 308].includes(status) ? res.headers.location : undefined
      resolve({
        url: rawUrl,
        status,
        statusText: res.statusMessage || '',
        responseTimeMs,
        available,
        redirectUrl,
      })
    })
    req.on('error', (e) => resolve({
      url: rawUrl, status: null, statusText: e.message, responseTimeMs: Date.now() - start,
      available: false, error: e.message,
    }))
    req.on('timeout', () => {
      req.destroy()
      resolve({ url: rawUrl, status: null, statusText: '请求超时', responseTimeMs: 10000, available: false, error: '请求超时' })
    })
    req.end()
  })
}

export async function checkAvailability(urls) {
  if (!Array.isArray(urls) || urls.length === 0) throw new Error('urls 不能为空')
  if (urls.length > 20) throw new Error('最多支持 20 个 URL')
  const results = await Promise.all(urls.map(checkUrl))
  return { results }
}
