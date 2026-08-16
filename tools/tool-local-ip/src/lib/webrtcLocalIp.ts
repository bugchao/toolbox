/**
 * SDP ICE candidate 解析：从 candidate 字符串中提取局域网 IPv4 地址，
 * 并识别 Chrome mDNS 混淆（真实 IP 被替换为 xxxx.local 主机名）的情况。
 * 抽成纯函数以便脱离真实 RTCPeerConnection 单测。
 */

const IPV4_RE = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/

export type CandidateIpResult =
  | { kind: 'ipv4'; ip: string }
  | { kind: 'mdns' }
  | { kind: 'none' }

/**
 * candidate 字段格式（RFC 5245）：
 * "candidate:<foundation> <component> <transport> <priority> <address> <port> typ <type> ..."
 * address 是第 5 个空格分隔字段（下标 4）。
 */
export function extractIpFromCandidate(candidate: string | null | undefined): CandidateIpResult {
  if (!candidate) return { kind: 'none' }
  const address = candidate.trim().split(/\s+/)[4]
  if (!address) return { kind: 'none' }
  if (IPV4_RE.test(address)) return { kind: 'ipv4', ip: address }
  if (address.endsWith('.local')) return { kind: 'mdns' }
  return { kind: 'none' }
}

export interface LocalIpDetectionResult {
  ips: string[]
  mdnsBlocked: boolean
}

/**
 * 通过 WebRTC STUN trick 探测局域网 IP。
 * ponytail: 固定用公共 STUN server + 5s 超时兜底，不做多 STUN 竞速，够用即可。
 */
export function detectLocalIps(timeoutMs = 5000): Promise<LocalIpDetectionResult> {
  return new Promise((resolve) => {
    const ips = new Set<string>()
    let mdnsBlocked = false
    let done = false

    const pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] })

    const finish = () => {
      if (done) return
      done = true
      clearTimeout(timer)
      pc.onicecandidate = null
      pc.close()
      resolve({ ips: Array.from(ips), mdnsBlocked })
    }

    const timer = setTimeout(finish, timeoutMs)

    pc.onicecandidate = (event) => {
      if (!event.candidate) {
        // 空 candidate 表示 ICE 收集完成
        finish()
        return
      }
      const result = extractIpFromCandidate(event.candidate.candidate)
      if (result.kind === 'ipv4') ips.add(result.ip)
      else if (result.kind === 'mdns') mdnsBlocked = true
    }

    pc.createDataChannel('local-ip-probe')
    pc.createOffer()
      .then((offer) => pc.setLocalDescription(offer))
      .catch(() => finish())
  })
}
