/**
 * WiFi 二维码字符串构造与转义（纯逻辑，无副作用）
 *
 * 标准格式：WIFI:T:<WPA|WEP|nopass>;S:<ssid>;P:<password>;H:<true>;;
 * 其中 S/P 字段中的特殊字符 `\ ; , : "` 需用反斜杠转义。
 */

export type WifiAuth = 'WPA' | 'WEP' | 'nopass'

export interface WifiConfig {
  /** 网络名称 */
  ssid: string
  /** 密码（nopass 时忽略） */
  password?: string
  /** 加密方式 */
  auth: WifiAuth
  /** 是否为隐藏网络 */
  hidden?: boolean
}

/**
 * 对 SSID / 密码中的特殊字符做反斜杠转义。
 * 需要转义的字符：反斜杠、分号、逗号、冒号、双引号。
 * 反斜杠本身由字符类一并处理，正则只匹配一次即可正确加前缀。
 */
export function escapeWifiValue(value: string): string {
  return value.replace(/([\\;,:"])/g, '\\$1')
}

/**
 * 根据配置生成符合 WiFi 二维码标准的字符串。
 * - nopass 时不输出 P 字段
 * - 仅当 hidden 为 true 时输出 H:true 字段
 */
export function buildWifiString(config: WifiConfig): string {
  const { ssid, password = '', auth, hidden = false } = config

  const parts: string[] = [`WIFI:T:${auth}`, `S:${escapeWifiValue(ssid)}`]

  if (auth !== 'nopass') {
    parts.push(`P:${escapeWifiValue(password)}`)
  }

  if (hidden) {
    parts.push('H:true')
  }

  return `${parts.join(';')};;`
}
