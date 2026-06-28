/**
 * User-Agent 解析（纯正则实现，不依赖第三方库）
 *
 * 解析重点：
 * - 浏览器名称 / 版本，正确区分 Edge(Edg/) vs Chrome vs Safari 的相互包含关系
 * - 排版引擎：WebKit / Blink / Gecko / EdgeHTML / Trident / Presto
 * - 操作系统名称 / 版本
 * - 设备类型：desktop / mobile / tablet / bot
 * - CPU 架构（尽可能判断）
 * - 是否爬虫 / bot
 *
 * 说明：解析出的具体值（"Chrome"、"Windows" 等）是数据，不参与 i18n。
 */

export type DeviceType = 'desktop' | 'mobile' | 'tablet' | 'bot' | 'unknown'

export interface NameVersion {
  name: string
  version: string
}

export type ProductToken = NameVersion

export interface UserAgentResult {
  browser: NameVersion
  engine: NameVersion
  os: NameVersion
  device: { type: DeviceType }
  cpu: { architecture: string }
  isBot: boolean
  botName: string
  /** `Name/version` 形式的产品 token */
  products: ProductToken[]
  /** 括号注释内的分段（按 `;` 切） */
  comments: string[]
  /** 是否成功识别出至少一项（浏览器/引擎/系统/bot） */
  recognized: boolean
  raw: string
}

const UNKNOWN = ''

/** 已知 bot：按出现顺序匹配，返回友好名称 */
const BOT_SIGNATURES: Array<{ re: RegExp; name: string }> = [
  { re: /googlebot/i, name: 'Googlebot' },
  { re: /mediapartners-google/i, name: 'Mediapartners-Google' },
  { re: /adsbot-google/i, name: 'AdsBot-Google' },
  { re: /bingbot/i, name: 'bingbot' },
  { re: /bingpreview/i, name: 'BingPreview' },
  { re: /slurp/i, name: 'Yahoo! Slurp' },
  { re: /duckduckbot/i, name: 'DuckDuckBot' },
  { re: /baiduspider/i, name: 'Baiduspider' },
  { re: /yandex(bot)?/i, name: 'YandexBot' },
  { re: /sogou/i, name: 'Sogou' },
  { re: /exabot/i, name: 'Exabot' },
  { re: /facebookexternalhit/i, name: 'facebookexternalhit' },
  { re: /facebot/i, name: 'Facebot' },
  { re: /twitterbot/i, name: 'Twitterbot' },
  { re: /linkedinbot/i, name: 'LinkedInBot' },
  { re: /whatsapp/i, name: 'WhatsApp' },
  { re: /telegrambot/i, name: 'TelegramBot' },
  { re: /discordbot/i, name: 'Discordbot' },
  { re: /applebot/i, name: 'Applebot' },
  { re: /petalbot/i, name: 'PetalBot' },
  { re: /semrushbot/i, name: 'SemrushBot' },
  { re: /ahrefsbot/i, name: 'AhrefsBot' },
  { re: /mj12bot/i, name: 'MJ12bot' },
  { re: /dotbot/i, name: 'DotBot' },
  { re: /ia_archiver/i, name: 'ia_archiver' },
  { re: /pingdom/i, name: 'Pingdom' },
  { re: /uptimerobot/i, name: 'UptimeRobot' },
  { re: /headlesschrome/i, name: 'HeadlessChrome' },
  { re: /phantomjs/i, name: 'PhantomJS' },
  { re: /python-requests/i, name: 'python-requests' },
  { re: /\bcurl\//i, name: 'curl' },
  { re: /\bwget\//i, name: 'Wget' },
  { re: /\baxios\//i, name: 'axios' },
  { re: /okhttp/i, name: 'OkHttp' },
  { re: /go-http-client/i, name: 'Go-http-client' },
]

/** 通用 bot 关键字（用于判定 isBot，即使无具名签名） */
const GENERIC_BOT_RE =
  /\b(bot|crawler|spider|crawl|scraper|fetcher|monitor|preview)\b/i

function firstMatch(re: RegExp, ua: string): string {
  const m = ua.match(re)
  return m && m[1] ? m[1] : UNKNOWN
}

function detectBot(ua: string): { isBot: boolean; botName: string } {
  for (const sig of BOT_SIGNATURES) {
    if (sig.re.test(ua)) return { isBot: true, botName: sig.name }
  }
  if (GENERIC_BOT_RE.test(ua)) return { isBot: true, botName: UNKNOWN }
  return { isBot: false, botName: UNKNOWN }
}

function detectBrowser(ua: string): NameVersion {
  // 顺序很重要：先判定包含关系更窄的浏览器
  // 旧版 Edge (EdgeHTML)
  let v = firstMatch(/Edge\/([\d.]+)/, ua)
  if (v) return { name: 'Microsoft Edge (Legacy)', version: v }
  // 新版 Edge（Chromium）：桌面 Edg/、安卓 EdgA/、iOS EdgiOS/
  v =
    firstMatch(/Edg\/([\d.]+)/, ua) ||
    firstMatch(/EdgA\/([\d.]+)/, ua) ||
    firstMatch(/EdgiOS\/([\d.]+)/, ua)
  if (v) return { name: 'Microsoft Edge', version: v }
  // Opera
  v = firstMatch(/OPR\/([\d.]+)/, ua) || firstMatch(/OPiOS\/([\d.]+)/, ua)
  if (v) return { name: 'Opera', version: v }
  if (/\bOpera\b/.test(ua)) {
    v = firstMatch(/Version\/([\d.]+)/, ua) || firstMatch(/Opera[/ ]([\d.]+)/, ua)
    return { name: 'Opera', version: v }
  }
  // Samsung Internet
  v = firstMatch(/SamsungBrowser\/([\d.]+)/, ua)
  if (v) return { name: 'Samsung Internet', version: v }
  // Vivaldi / Brave / Yandex / UC / QQ / 360 等 Chromium 衍生
  v = firstMatch(/Vivaldi\/([\d.]+)/, ua)
  if (v) return { name: 'Vivaldi', version: v }
  v = firstMatch(/YaBrowser\/([\d.]+)/, ua)
  if (v) return { name: 'Yandex Browser', version: v }
  v = firstMatch(/UCBrowser\/([\d.]+)/, ua)
  if (v) return { name: 'UC Browser', version: v }
  v = firstMatch(/QQBrowser\/([\d.]+)/, ua)
  if (v) return { name: 'QQ Browser', version: v }
  // Firefox（桌面/安卓）与 iOS Firefox(FxiOS)
  v = firstMatch(/Firefox\/([\d.]+)/, ua) || firstMatch(/FxiOS\/([\d.]+)/, ua)
  if (v) return { name: 'Firefox', version: v }
  // IE 11（Trident，无 MSIE token）
  if (/Trident\//.test(ua)) {
    v = firstMatch(/rv:([\d.]+)/, ua) || firstMatch(/MSIE ([\d.]+)/, ua)
    return { name: 'Internet Explorer', version: v }
  }
  if (/MSIE /.test(ua)) {
    v = firstMatch(/MSIE ([\d.]+)/, ua)
    return { name: 'Internet Explorer', version: v }
  }
  // iOS Chrome (CriOS)
  v = firstMatch(/CriOS\/([\d.]+)/, ua)
  if (v) return { name: 'Chrome', version: v }
  // Chrome / Chromium（必须排在 Safari 之前，因为 Chrome UA 同时含 Safari token）
  v = firstMatch(/Chrome\/([\d.]+)/, ua) || firstMatch(/Chromium\/([\d.]+)/, ua)
  if (v) return { name: 'Chrome', version: v }
  // Safari（含 Version/x 且有 Safari token，且非 Chrome）
  if (/Safari\//.test(ua)) {
    v = firstMatch(/Version\/([\d.]+)/, ua)
    return { name: 'Safari', version: v }
  }
  // 旧 Mozilla 兜底
  return { name: UNKNOWN, version: UNKNOWN }
}

function detectEngine(ua: string, browserName: string, os: NameVersion): NameVersion {
  // Trident / EdgeHTML
  let v = firstMatch(/Trident\/([\d.]+)/, ua)
  if (v) return { name: 'Trident', version: v }
  v = firstMatch(/Edge\/([\d.]+)/, ua)
  if (v) return { name: 'EdgeHTML', version: v }
  // Presto（旧 Opera）
  v = firstMatch(/Presto\/([\d.]+)/, ua)
  if (v) return { name: 'Presto', version: v }
  // Gecko：真正的 Gecko 形如 "Gecko/20100101 Firefox/x"，"like Gecko" 是干扰项
  if (browserName === 'Firefox' && !/iPhone|iPad|iPod|FxiOS/.test(ua)) {
    v = firstMatch(/rv:([\d.]+)/, ua)
    return { name: 'Gecko', version: v }
  }
  // iOS 上所有浏览器都基于 WebKit（CriOS/FxiOS/EdgiOS/Safari）
  if (/iPhone|iPad|iPod|CriOS|FxiOS|EdgiOS|OPiOS/.test(ua) || os.name === 'iOS') {
    v = firstMatch(/AppleWebKit\/([\d.]+)/, ua)
    return { name: 'WebKit', version: v }
  }
  // Blink：Chromium 系（Chrome/Edge/Opera/Samsung 等，非 iOS）
  if (/Chrome\/|Chromium\/|Edg\/|EdgA\/|OPR\/|SamsungBrowser\//.test(ua)) {
    v = firstMatch(/Chrome\/([\d.]+)/, ua) || firstMatch(/Chromium\/([\d.]+)/, ua)
    return { name: 'Blink', version: v }
  }
  // WebKit（Safari on macOS 等）
  v = firstMatch(/AppleWebKit\/([\d.]+)/, ua)
  if (v) return { name: 'WebKit', version: v }
  // Gecko 兜底
  if (/Gecko\/\d/.test(ua)) {
    v = firstMatch(/rv:([\d.]+)/, ua)
    return { name: 'Gecko', version: v }
  }
  return { name: UNKNOWN, version: UNKNOWN }
}

function mapWindowsVersion(nt: string): string {
  const map: Record<string, string> = {
    '10.0': '10',
    '6.3': '8.1',
    '6.2': '8',
    '6.1': '7',
    '6.0': 'Vista',
    '5.2': 'XP x64',
    '5.1': 'XP',
    '5.0': '2000',
  }
  return map[nt] ?? nt
}

function detectOS(ua: string): NameVersion {
  // Windows
  let m = ua.match(/Windows NT ([\d.]+)/)
  if (m) return { name: 'Windows', version: mapWindowsVersion(m[1]) }
  if (/Windows Phone/.test(ua)) {
    return { name: 'Windows Phone', version: firstMatch(/Windows Phone(?: OS)? ([\d.]+)/, ua) }
  }
  if (/Windows/.test(ua)) return { name: 'Windows', version: UNKNOWN }
  // ChromeOS（在 Linux 之前）
  if (/CrOS/.test(ua)) {
    return { name: 'Chrome OS', version: firstMatch(/CrOS \S+ ([\d.]+)/, ua) }
  }
  // Android（在 Linux 之前）
  m = ua.match(/Android[ ]?([\d.]+)?/)
  if (m) return { name: 'Android', version: m[1] ?? UNKNOWN }
  // iOS / iPadOS
  if (/iPhone|iPod/.test(ua)) {
    return { name: 'iOS', version: firstMatch(/OS ([\d_]+)/, ua).replace(/_/g, '.') }
  }
  if (/iPad/.test(ua)) {
    return { name: 'iPadOS', version: firstMatch(/OS ([\d_]+)/, ua).replace(/_/g, '.') }
  }
  // macOS
  m = ua.match(/Mac OS X ([\d_]+)/)
  if (m) return { name: 'macOS', version: m[1].replace(/_/g, '.') }
  if (/Macintosh|Mac OS X/.test(ua)) return { name: 'macOS', version: UNKNOWN }
  // 其他类 Unix
  if (/Linux/.test(ua)) return { name: 'Linux', version: UNKNOWN }
  if (/FreeBSD/.test(ua)) return { name: 'FreeBSD', version: UNKNOWN }
  return { name: UNKNOWN, version: UNKNOWN }
}

function detectCPU(ua: string): string {
  if (/aarch64|arm64/i.test(ua)) return 'arm64'
  if (/Win64|x64|WOW64|x86_64|amd64/i.test(ua)) return 'amd64'
  if (/\barm\b|armv\d/i.test(ua)) return 'arm'
  if (/i686|i386|x86/i.test(ua)) return 'ia32'
  if (/ppc64/i.test(ua)) return 'ppc64'
  return UNKNOWN
}

function detectDevice(ua: string, os: NameVersion, isBot: boolean): DeviceType {
  if (isBot) return 'bot'
  // 平板
  if (/iPad/.test(ua)) return 'tablet'
  if (/Tablet|PlayBook|Kindle|Silk\//.test(ua)) return 'tablet'
  if (os.name === 'Android' && !/Mobile/.test(ua)) return 'tablet'
  // 手机
  if (/iPhone|iPod/.test(ua)) return 'mobile'
  if (/Mobile|Windows Phone|IEMobile|BlackBerry|BB10|Opera Mini/.test(ua)) return 'mobile'
  if (os.name === 'Android') return 'mobile'
  // 桌面
  if (['Windows', 'macOS', 'Linux', 'Chrome OS', 'FreeBSD'].includes(os.name)) {
    return 'desktop'
  }
  return 'unknown'
}

function extractProducts(ua: string): ProductToken[] {
  const out: ProductToken[] = []
  const re = /([A-Za-z][A-Za-z0-9._+-]*)\/([0-9][0-9A-Za-z._+-]*)/g
  let m: RegExpExecArray | null
  while ((m = re.exec(ua)) !== null) {
    out.push({ name: m[1], version: m[2] })
  }
  return out
}

function extractComments(ua: string): string[] {
  const out: string[] = []
  const re = /\(([^)]*)\)/g
  let m: RegExpExecArray | null
  while ((m = re.exec(ua)) !== null) {
    for (const part of m[1].split(';')) {
      const seg = part.trim()
      if (seg) out.push(seg)
    }
  }
  return out
}

export function parseUserAgent(input: string): UserAgentResult {
  const raw = typeof input === 'string' ? input : ''
  const ua = raw.trim()

  const empty: UserAgentResult = {
    browser: { name: UNKNOWN, version: UNKNOWN },
    engine: { name: UNKNOWN, version: UNKNOWN },
    os: { name: UNKNOWN, version: UNKNOWN },
    device: { type: 'unknown' },
    cpu: { architecture: UNKNOWN },
    isBot: false,
    botName: UNKNOWN,
    products: [],
    comments: [],
    recognized: false,
    raw,
  }

  if (!ua) return empty

  const { isBot, botName } = detectBot(ua)
  const os = detectOS(ua)
  const browser = detectBrowser(ua)
  const engine = detectEngine(ua, browser.name, os)
  const cpu = { architecture: detectCPU(ua) }
  const device = { type: detectDevice(ua, os, isBot) }
  const products = extractProducts(ua)
  const comments = extractComments(ua)

  const recognized =
    Boolean(browser.name) ||
    Boolean(engine.name) ||
    Boolean(os.name) ||
    isBot

  return {
    browser,
    engine,
    os,
    device,
    cpu,
    isBot,
    botName,
    products,
    comments,
    recognized,
    raw,
  }
}
