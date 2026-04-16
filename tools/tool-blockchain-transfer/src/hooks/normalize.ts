/** 错误码：组件侧可映射成本地化文案 */
export type TransferErrorCode =
  | 'wallet-not-installed'
  | 'wallet-not-connected'
  | 'empty-address'
  | 'invalid-address'
  | 'empty-amount'
  | 'invalid-amount'
  | 'amount-not-positive'
  | 'sol-rpc-forbidden'
  | 'sol-rpc-unreachable'

export class TransferError extends Error {
  code: TransferErrorCode
  constructor(code: TransferErrorCode, message?: string) {
    super(message ?? code)
    this.code = code
  }
}

/**
 * 清理用户输入中的噪音字符：
 * - 所有空白（空格/Tab/换行）
 * - 常见不可见字符：零宽空格/连接符/BOM
 * - 复制钱包地址时常见的 LRM/RLM 等方向控制符
 */
export function stripInvisible(input: string): string {
  if (!input) return ''
  return input
    .replace(/[\s\u00A0]+/g, '')
    .replace(/[\u200B-\u200F\uFEFF\u202A-\u202E\u2060]/g, '')
}

/** 规范化数值输入：全角数字/全角逗号/逗号作为小数点 → 标准小数 */
export function normalizeAmount(input: string): string {
  const cleaned = stripInvisible(input)
    // 全角数字转半角
    .replace(/[\uFF10-\uFF19]/g, (ch) =>
      String.fromCharCode(ch.charCodeAt(0) - 0xff10 + 0x30)
    )
    .replace(/[\uFF0E\u3002]/g, '.') // 全角句号/中文句号 → .
    .replace(/[\uFF0C\u3001]/g, '.') // 全角逗号/顿号 → .
    .replace(/,/g, '.') // 半角逗号 → .（处理欧式小数格式）
    .replace(/^\+/, '') // 去除前导 +
  return cleaned
}

/**
 * 校验并返回净化后的金额（十进制字符串）。
 * 支持 `0.5`, `.5`, `1`, `1.`（视为 1）。
 * 不支持科学计数法（MetaMask/Solana 都不接受）。
 */
export function sanitizeDecimalAmount(input: string): string {
  const s = normalizeAmount(input)
  if (!s) throw new TransferError('empty-amount')
  // 允许：整数、小数、.开头、以.结尾（将被视为整数）
  if (!/^\d*(\.\d*)?$/.test(s) || s === '.' || s === '') {
    throw new TransferError('invalid-amount')
  }
  const num = Number(s)
  if (!Number.isFinite(num) || num <= 0) {
    throw new TransferError('amount-not-positive')
  }
  return s
}

/** 以太坊地址校验：0x + 40 位 hex（大小写不敏感）。允许粘贴时夹杂空白。 */
export function sanitizeEthAddress(input: string): string {
  const raw = stripInvisible(input)
  if (!raw) throw new TransferError('empty-address')
  // 接受 0x/0X 前缀；缺省时补上 0x
  const withPrefix = /^0x/i.test(raw) ? '0x' + raw.slice(2) : '0x' + raw
  if (!/^0x[a-fA-F0-9]{40}$/.test(withPrefix)) {
    throw new TransferError('invalid-address')
  }
  return withPrefix
}

/** Solana 地址只做基本去噪，真正校验由 @solana/web3.js 的 PublicKey 构造函数负责 */
export function sanitizeSolAddress(input: string): string {
  const raw = stripInvisible(input)
  if (!raw) throw new TransferError('empty-address')
  return raw
}

/** 将十进制 ETH 字符串转换为十六进制 wei，返回 `0x...` */
export function ethDecimalToWeiHex(decimal: string): string {
  const [intPartRaw = '0', fracPartRaw = ''] = decimal.split('.')
  const intPart = intPartRaw === '' ? '0' : intPartRaw
  const fracPart = fracPartRaw.slice(0, 18)
  const fracPadded = (fracPart + '0'.repeat(18)).slice(0, 18)
  const combined = (intPart + fracPadded).replace(/^0+/, '') || '0'
  return '0x' + BigInt(combined).toString(16)
}
