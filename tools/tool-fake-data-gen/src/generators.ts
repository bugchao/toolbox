// 字段类型 + 生成器 + 数据池
// 全部基于 crypto.getRandomValues 的均匀随机；数据为常见样本人工整理

export type FieldType =
  // ID
  | 'id_seq' | 'id_uuid' | 'id_short'
  // person
  | 'name_zh' | 'name_en' | 'email' | 'phone_cn' | 'gender' | 'age' | 'birthday'
  // address
  | 'province_cn' | 'city_cn' | 'address_cn' | 'zipcode_cn'
  // company
  | 'company' | 'jobTitle' | 'department'
  // web
  | 'url' | 'ipv4' | 'userAgent'
  // finance
  | 'bankCard' | 'amount' | 'currency'
  // numeric
  | 'integer' | 'float' | 'boolean'
  // text
  | 'word' | 'sentence' | 'paragraph' | 'colorHex'
  // time
  | 'date_past' | 'date_future' | 'timestamp'
  // custom
  | 'enum' | 'static'

export interface FieldTypeMeta {
  id: FieldType
  zh: string
  en: string
  group: 'id' | 'person' | 'address' | 'company' | 'web' | 'finance' | 'numeric' | 'text' | 'time' | 'custom'
}

export const FIELD_TYPES: FieldTypeMeta[] = [
  // ID
  { id: 'id_seq', zh: '自增 ID', en: 'Auto increment', group: 'id' },
  { id: 'id_uuid', zh: 'UUID', en: 'UUID v4', group: 'id' },
  { id: 'id_short', zh: '短 ID', en: 'Short ID (8 chars)', group: 'id' },
  // person
  { id: 'name_zh', zh: '姓名（中文）', en: 'Name (zh)', group: 'person' },
  { id: 'name_en', zh: '姓名（英文）', en: 'Name (en)', group: 'person' },
  { id: 'email', zh: '邮箱', en: 'Email', group: 'person' },
  { id: 'phone_cn', zh: '手机号（中国）', en: 'Phone (CN)', group: 'person' },
  { id: 'gender', zh: '性别', en: 'Gender', group: 'person' },
  { id: 'age', zh: '年龄', en: 'Age', group: 'person' },
  { id: 'birthday', zh: '生日', en: 'Birthday', group: 'person' },
  // address
  { id: 'province_cn', zh: '省份（中国）', en: 'Province (CN)', group: 'address' },
  { id: 'city_cn', zh: '城市（中国）', en: 'City (CN)', group: 'address' },
  { id: 'address_cn', zh: '地址（中国）', en: 'Address (CN)', group: 'address' },
  { id: 'zipcode_cn', zh: '邮政编码', en: 'Postal code (CN)', group: 'address' },
  // company
  { id: 'company', zh: '公司名', en: 'Company name', group: 'company' },
  { id: 'jobTitle', zh: '职位', en: 'Job title', group: 'company' },
  { id: 'department', zh: '部门', en: 'Department', group: 'company' },
  // web
  { id: 'url', zh: '网址', en: 'URL', group: 'web' },
  { id: 'ipv4', zh: 'IPv4 地址', en: 'IPv4 address', group: 'web' },
  { id: 'userAgent', zh: 'User-Agent', en: 'User-Agent', group: 'web' },
  // finance
  { id: 'bankCard', zh: '银行卡号', en: 'Bank card (fake)', group: 'finance' },
  { id: 'amount', zh: '金额', en: 'Amount', group: 'finance' },
  { id: 'currency', zh: '货币代码', en: 'Currency code', group: 'finance' },
  // numeric
  { id: 'integer', zh: '整数', en: 'Integer', group: 'numeric' },
  { id: 'float', zh: '浮点数', en: 'Float', group: 'numeric' },
  { id: 'boolean', zh: '布尔', en: 'Boolean', group: 'numeric' },
  // text
  { id: 'word', zh: '单词', en: 'Word', group: 'text' },
  { id: 'sentence', zh: '句子', en: 'Sentence', group: 'text' },
  { id: 'paragraph', zh: '段落', en: 'Paragraph', group: 'text' },
  { id: 'colorHex', zh: '颜色 (hex)', en: 'Color (hex)', group: 'text' },
  // time
  { id: 'date_past', zh: '过去日期', en: 'Past date', group: 'time' },
  { id: 'date_future', zh: '未来日期', en: 'Future date', group: 'time' },
  { id: 'timestamp', zh: '时间戳', en: 'Timestamp', group: 'time' },
  // custom
  { id: 'enum', zh: '枚举（自选）', en: 'Enum (custom)', group: 'custom' },
  { id: 'static', zh: '固定值', en: 'Static value', group: 'custom' },
]

export interface FieldConfig {
  min?: number
  max?: number
  precision?: number
  /** for date_past / date_future: 时间范围天数 */
  days?: number
  /** for enum: 候选项数组 */
  options?: string[]
  /** for static: 固定值 */
  value?: string
}

// ── 数据池 ──────────────────────────────────────────────
const FAMILY_NAMES_ZH = [
  '王', '李', '张', '刘', '陈', '杨', '黄', '赵', '吴', '周',
  '徐', '孙', '马', '朱', '胡', '郭', '何', '高', '林', '罗',
  '郑', '梁', '谢', '宋', '唐', '许', '韩', '冯', '邓', '曹',
  '彭', '曾', '萧', '田', '董', '袁', '潘', '蒋', '蔡', '余',
]
const GIVEN_NAMES_ZH = [
  '伟', '芳', '娜', '敏', '静', '丽', '强', '磊', '军', '洋',
  '勇', '艳', '杰', '娟', '涛', '明', '超', '秀英', '霞', '平',
  '刚', '桂英', '欣怡', '梓涵', '雨涵', '浩然', '宇航', '俊杰', '雨萱', '诗涵',
  '欣然', '思远', '思源', '梓豪', '梓萱', '梓宁', '一鸣', '思齐', '紫嫣', '泽宇',
]
const FIRST_NAMES_EN = [
  'James', 'Mary', 'Robert', 'Patricia', 'John', 'Jennifer', 'Michael', 'Linda',
  'David', 'Elizabeth', 'William', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica',
  'Thomas', 'Karen', 'Charles', 'Sarah', 'Daniel', 'Lisa', 'Matthew', 'Nancy',
  'Anthony', 'Sandra', 'Mark', 'Betty', 'Donald', 'Helen',
]
const LAST_NAMES_EN = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Wilson', 'Anderson', 'Taylor', 'Thomas', 'Moore', 'Jackson',
  'Martin', 'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark',
  'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young', 'Allen',
]
const PROVINCES_CN = [
  '北京', '上海', '天津', '重庆', '河北', '山西', '辽宁', '吉林', '黑龙江', '江苏',
  '浙江', '安徽', '福建', '江西', '山东', '河南', '湖北', '湖南', '广东', '海南',
  '四川', '贵州', '云南', '陕西', '甘肃', '青海', '台湾', '广西', '西藏', '宁夏',
  '新疆', '内蒙古', '香港', '澳门',
]
const CITIES_CN = [
  '北京', '上海', '广州', '深圳', '杭州', '南京', '苏州', '武汉', '成都', '重庆',
  '西安', '青岛', '天津', '宁波', '厦门', '长沙', '郑州', '济南', '合肥', '福州',
  '无锡', '佛山', '东莞', '昆明', '大连', '沈阳', '南宁', '昆山', '泉州', '南昌',
]
const STREET_SUFFIXES_CN = ['路', '街', '大道', '巷', '弄', '里']
const STREET_NAMES_CN = [
  '中山', '人民', '解放', '建设', '光明', '幸福', '和平', '友谊', '胜利', '复兴',
  '南京', '北京', '长安', '永康', '永福', '永安', '德胜', '文化', '科技', '环湖',
]
const COMPANY_PREFIX = [
  '中信', '中国', '华夏', '泰康', '万达', '复星', '美团', '阿里', '腾讯', '字节',
  '京东', '小米', '华为', '海尔', '联想', '蚂蚁', '滴滴', '快手', '比亚迪', '宁德',
]
const COMPANY_SUFFIX = ['科技', '集团', '控股', '股份', '实业', '电子', '数据', '咨询', '互娱', '生物']
const COMPANY_FORM = ['有限公司', '股份有限公司', '合伙企业', '研究所']
const JOB_TITLES = [
  '产品经理', '前端工程师', '后端工程师', '架构师', '设计师', 'UI 设计师', 'UX 设计师',
  '数据分析师', '算法工程师', '运营经理', '市场经理', '销售总监', '客户经理', '财务经理',
  '人力资源经理', 'CEO', 'CTO', 'COO', '产品总监', '研发总监',
]
const DEPARTMENTS = [
  '研发部', '产品部', '设计部', '运营部', '市场部', '销售部', '财务部', '人力资源部',
  '客户成功部', '法务部', '行政部', '技术中台', '增长团队', '战略部',
]
const EMAIL_DOMAINS = [
  'gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'icloud.com',
  'qq.com', '163.com', '126.com', 'sina.com', 'foxmail.com',
]
const URL_HOSTS = [
  'example.com', 'demo.io', 'sample.org', 'test.net', 'mock.dev',
  'foo.bar', 'lipsum.co', 'placeholder.io', 'fake-api.com',
]
const URL_PATHS = ['/api/v1', '/users', '/products', '/orders', '/profile', '/dashboard', '/docs', '/blog']
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Firefox/121.0',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko)',
  'Mozilla/5.0 (Linux; Android 13; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0',
]
const CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'CNY', 'AUD', 'CAD', 'CHF', 'HKD', 'SGD']
const GENDERS_ZH = ['男', '女']
const GENDERS_EN = ['Male', 'Female']
const LOREM_WORDS = (
  'lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor ' +
  'incididunt ut labore et dolore magna aliqua enim ad minim veniam quis nostrud ' +
  'exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat duis aute ' +
  'irure dolor in reprehenderit voluptate velit esse cillum eu fugiat nulla pariatur'
).split(' ')
const MOBILE_PREFIXES = [
  '130', '131', '132', '133', '134', '135', '136', '137', '138', '139',
  '150', '151', '152', '155', '156', '157', '158', '159',
  '170', '173', '176', '177', '178', '180', '181', '182', '183', '184',
  '185', '186', '187', '188', '189', '199',
]

// ── 工具函数 ──────────────────────────────────────────────
function randInt(max: number): number {
  if (max <= 0) return 0
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const bound = Math.floor(0xffffffff / max) * max
    const buf = new Uint32Array(1)
    let n: number
    do {
      crypto.getRandomValues(buf)
      n = buf[0]
    } while (n >= bound)
    return n % max
  }
  return Math.floor(Math.random() * max)
}
function pick<T>(arr: T[]): T {
  return arr[randInt(arr.length)]
}
function intBetween(min: number, max: number): number {
  if (max <= min) return min
  return min + randInt(max - min + 1)
}
function floatBetween(min: number, max: number, precision = 2): number {
  const span = max - min
  const v = min + (randInt(1_000_000_000) / 1_000_000_000) * span
  const f = Math.pow(10, precision)
  return Math.round(v * f) / f
}
function fmtDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// ── UUID v4 ──
function uuidV4(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  // fallback
  const bytes = new Uint8Array(16)
  if (typeof crypto !== 'undefined') crypto.getRandomValues(bytes)
  else for (let i = 0; i < 16; i++) bytes[i] = Math.floor(Math.random() * 256)
  bytes[6] = (bytes[6] & 0x0f) | 0x40
  bytes[8] = (bytes[8] & 0x3f) | 0x80
  const h = (n: number) => n.toString(16).padStart(2, '0')
  return (
    h(bytes[0]) + h(bytes[1]) + h(bytes[2]) + h(bytes[3]) + '-' +
    h(bytes[4]) + h(bytes[5]) + '-' +
    h(bytes[6]) + h(bytes[7]) + '-' +
    h(bytes[8]) + h(bytes[9]) + '-' +
    h(bytes[10]) + h(bytes[11]) + h(bytes[12]) + h(bytes[13]) + h(bytes[14]) + h(bytes[15])
  )
}

function shortId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let s = ''
  for (let i = 0; i < 8; i++) s += chars[randInt(chars.length)]
  return s
}

// ── Generators ──────────────────────────────────────────
export interface GenContext {
  rowIndex: number
  /** for id_seq per-field counters keyed by field id */
  seq: Record<string, number>
}

export function generateValue(
  type: FieldType,
  config: FieldConfig | undefined,
  ctx: GenContext,
  fieldId: string,
): unknown {
  const cfg = config ?? {}
  switch (type) {
    case 'id_seq': {
      const k = `seq:${fieldId}`
      ctx.seq[k] = (ctx.seq[k] ?? (cfg.min ?? 1) - 1) + 1
      return ctx.seq[k]
    }
    case 'id_uuid':
      return uuidV4()
    case 'id_short':
      return shortId()
    case 'name_zh':
      return pick(FAMILY_NAMES_ZH) + pick(GIVEN_NAMES_ZH)
    case 'name_en':
      return `${pick(FIRST_NAMES_EN)} ${pick(LAST_NAMES_EN)}`
    case 'email': {
      const local = (pick(FIRST_NAMES_EN) + '.' + pick(LAST_NAMES_EN)).toLowerCase()
      return `${local}${randInt(1000)}@${pick(EMAIL_DOMAINS)}`
    }
    case 'phone_cn': {
      const prefix = pick(MOBILE_PREFIXES)
      let rest = ''
      for (let i = 0; i < 8; i++) rest += String(randInt(10))
      return prefix + rest
    }
    case 'gender':
      return Math.random() < 0.5 ? pick(GENDERS_ZH) : pick(GENDERS_EN)
    case 'age':
      return intBetween(cfg.min ?? 18, cfg.max ?? 70)
    case 'birthday': {
      const now = new Date()
      const year = now.getFullYear() - intBetween(cfg.min ?? 18, cfg.max ?? 70)
      const month = intBetween(1, 12)
      const maxDay = new Date(year, month, 0).getDate()
      const day = intBetween(1, maxDay)
      return fmtDate(new Date(year, month - 1, day))
    }
    case 'province_cn':
      return pick(PROVINCES_CN)
    case 'city_cn':
      return pick(CITIES_CN)
    case 'address_cn': {
      const province = pick(PROVINCES_CN)
      const city = pick(CITIES_CN)
      const street = pick(STREET_NAMES_CN) + pick(STREET_SUFFIXES_CN)
      const num = intBetween(1, 999)
      return `${province}${city}${street}${num}号`
    }
    case 'zipcode_cn': {
      let z = ''
      for (let i = 0; i < 6; i++) z += String(randInt(10))
      return z
    }
    case 'company': {
      const p = pick(COMPANY_PREFIX) + pick(COMPANY_SUFFIX)
      return p + pick(COMPANY_FORM)
    }
    case 'jobTitle':
      return pick(JOB_TITLES)
    case 'department':
      return pick(DEPARTMENTS)
    case 'url': {
      const proto = Math.random() < 0.5 ? 'https' : 'http'
      return `${proto}://${pick(URL_HOSTS)}${pick(URL_PATHS)}`
    }
    case 'ipv4':
      return `${intBetween(1, 223)}.${intBetween(0, 255)}.${intBetween(0, 255)}.${intBetween(1, 254)}`
    case 'userAgent':
      return pick(USER_AGENTS)
    case 'bankCard': {
      // 16 位伪造卡号，开头用 622848（建行）等常见 BIN 之一
      const bins = ['622848', '622700', '621700', '622588', '622666']
      let n = pick(bins)
      for (let i = 0; i < 10; i++) n += String(randInt(10))
      return n
    }
    case 'amount':
      return floatBetween(cfg.min ?? 0, cfg.max ?? 10000, cfg.precision ?? 2)
    case 'currency':
      return pick(CURRENCIES)
    case 'integer':
      return intBetween(cfg.min ?? 0, cfg.max ?? 100)
    case 'float':
      return floatBetween(cfg.min ?? 0, cfg.max ?? 1, cfg.precision ?? 2)
    case 'boolean':
      return randInt(2) === 0
    case 'word':
      return pick(LOREM_WORDS)
    case 'sentence': {
      const len = intBetween(5, 12)
      const ws: string[] = []
      for (let i = 0; i < len; i++) ws.push(pick(LOREM_WORDS))
      return ws.join(' ').replace(/^./, (c) => c.toUpperCase()) + '.'
    }
    case 'paragraph': {
      const ns = intBetween(3, 6)
      const out: string[] = []
      for (let i = 0; i < ns; i++) {
        const len = intBetween(5, 12)
        const ws: string[] = []
        for (let j = 0; j < len; j++) ws.push(pick(LOREM_WORDS))
        out.push(ws.join(' ').replace(/^./, (c) => c.toUpperCase()) + '.')
      }
      return out.join(' ')
    }
    case 'colorHex': {
      let h = '#'
      const chars = '0123456789ABCDEF'
      for (let i = 0; i < 6; i++) h += chars[randInt(16)]
      return h
    }
    case 'date_past': {
      const days = cfg.days ?? 365
      const offset = randInt(days)
      const d = new Date()
      d.setDate(d.getDate() - offset)
      return fmtDate(d)
    }
    case 'date_future': {
      const days = cfg.days ?? 365
      const offset = randInt(days) + 1
      const d = new Date()
      d.setDate(d.getDate() + offset)
      return fmtDate(d)
    }
    case 'timestamp':
      return Date.now() - randInt(cfg.days ?? 365) * 24 * 3600 * 1000
    case 'enum': {
      const opts = cfg.options && cfg.options.length > 0 ? cfg.options : ['A', 'B', 'C']
      return pick(opts)
    }
    case 'static':
      return cfg.value ?? ''
  }
}

// ── 输出格式 ──────────────────────────────────────────────
export interface SchemaField {
  id: string
  name: string
  type: FieldType
  config?: FieldConfig
}

export type OutputFormat = 'json' | 'csv' | 'sql' | 'ts'

export function generateRows(fields: SchemaField[], count: number): Record<string, unknown>[] {
  const ctx: GenContext = { rowIndex: 0, seq: {} }
  const rows: Record<string, unknown>[] = []
  for (let i = 0; i < count; i++) {
    ctx.rowIndex = i
    const row: Record<string, unknown> = {}
    for (const f of fields) {
      row[f.name] = generateValue(f.type, f.config, ctx, f.id)
    }
    rows.push(row)
  }
  return rows
}

function escapeCsv(v: unknown): string {
  const s = String(v ?? '')
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}

function escapeSql(v: unknown): string {
  if (v === null || v === undefined) return 'NULL'
  if (typeof v === 'number') return String(v)
  if (typeof v === 'boolean') return v ? '1' : '0'
  return "'" + String(v).replace(/'/g, "''") + "'"
}

function tsTypeOf(field: SchemaField): string {
  switch (field.type) {
    case 'id_seq':
    case 'age':
    case 'integer':
    case 'amount':
    case 'float':
    case 'timestamp':
      return 'number'
    case 'boolean':
      return 'boolean'
    default:
      return 'string'
  }
}

export function formatOutput(
  rows: Record<string, unknown>[],
  fields: SchemaField[],
  format: OutputFormat,
  tableName = 'table_name',
): string {
  if (format === 'json') {
    return JSON.stringify(rows, null, 2)
  }
  if (format === 'csv') {
    const headers = fields.map((f) => f.name).join(',')
    const lines = rows.map((r) => fields.map((f) => escapeCsv(r[f.name])).join(','))
    return [headers, ...lines].join('\n')
  }
  if (format === 'sql') {
    const cols = fields.map((f) => f.name).join(', ')
    return rows
      .map(
        (r) =>
          `INSERT INTO ${tableName} (${cols}) VALUES (${fields.map((f) => escapeSql(r[f.name])).join(', ')});`,
      )
      .join('\n')
  }
  // ts
  const typeStr = fields.map((f) => `${f.name}: ${tsTypeOf(f)}`).join('; ')
  return `export const data: Array<{ ${typeStr} }> = ${JSON.stringify(rows, null, 2)}`
}

// ── 预设模板 ──────────────────────────────────────────────
export interface Preset {
  id: string
  zh: string
  en: string
  fields: Omit<SchemaField, 'id'>[]
}

export const PRESETS: Preset[] = [
  {
    id: 'user',
    zh: '用户',
    en: 'User',
    fields: [
      { name: 'id', type: 'id_seq' },
      { name: 'name', type: 'name_zh' },
      { name: 'email', type: 'email' },
      { name: 'phone', type: 'phone_cn' },
      { name: 'age', type: 'age' },
      { name: 'gender', type: 'gender' },
      { name: 'city', type: 'city_cn' },
      { name: 'createdAt', type: 'date_past' },
    ],
  },
  {
    id: 'order',
    zh: '订单',
    en: 'Order',
    fields: [
      { name: 'orderId', type: 'id_uuid' },
      { name: 'userId', type: 'id_short' },
      { name: 'amount', type: 'amount', config: { min: 10, max: 5000, precision: 2 } },
      { name: 'currency', type: 'currency' },
      { name: 'status', type: 'enum', config: { options: ['pending', 'paid', 'shipped', 'completed', 'cancelled'] } },
      { name: 'createdAt', type: 'date_past' },
    ],
  },
  {
    id: 'product',
    zh: '产品',
    en: 'Product',
    fields: [
      { name: 'id', type: 'id_seq' },
      { name: 'name', type: 'word' },
      { name: 'price', type: 'amount', config: { min: 1, max: 999, precision: 2 } },
      { name: 'stock', type: 'integer', config: { min: 0, max: 1000 } },
      { name: 'category', type: 'enum', config: { options: ['electronics', 'clothing', 'food', 'books', 'toys'] } },
      { name: 'inStock', type: 'boolean' },
    ],
  },
  {
    id: 'employee',
    zh: '员工',
    en: 'Employee',
    fields: [
      { name: 'id', type: 'id_seq' },
      { name: 'fullName', type: 'name_en' },
      { name: 'email', type: 'email' },
      { name: 'department', type: 'department' },
      { name: 'jobTitle', type: 'jobTitle' },
      { name: 'salary', type: 'amount', config: { min: 5000, max: 30000, precision: 2 } },
      { name: 'hireDate', type: 'date_past' },
    ],
  },
]
