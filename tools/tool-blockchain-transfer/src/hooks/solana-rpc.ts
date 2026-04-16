import type { SolanaCluster } from './usePhantom'

/**
 * 公共 RPC 端点清单。
 *
 * 注意：Solana 基金会的 `api.mainnet-beta.solana.com` 明确禁止 dApp 流量，
 * 浏览器端通常会返回 403 Access forbidden。所以主网我们默认用第三方公共端点,
 * 并允许用户在 UI 里自定义（Helius / QuickNode / Alchemy 等）。
 */
export const PUBLIC_SOL_RPCS: Record<SolanaCluster, string[]> = {
  'mainnet-beta': [
    'https://solana-rpc.publicnode.com',
    'https://solana.drpc.org',
    'https://rpc.ankr.com/solana',
    'https://api.mainnet-beta.solana.com', // 兜底，大概率 403
  ],
  devnet: [
    'https://api.devnet.solana.com',
    'https://rpc.ankr.com/solana_devnet',
  ],
  testnet: [
    'https://api.testnet.solana.com',
  ],
}

const RPC_STORAGE_KEY = 'toolbox:tool-blockchain-transfer:sol-rpc-overrides'

export type SolRpcOverrides = Partial<Record<SolanaCluster, string>>

export function readSolRpcOverrides(): SolRpcOverrides {
  if (typeof window === 'undefined') return {}
  try {
    const raw = window.localStorage.getItem(RPC_STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    if (parsed && typeof parsed === 'object') return parsed as SolRpcOverrides
  } catch {
    // ignore
  }
  return {}
}

export function writeSolRpcOverrides(overrides: SolRpcOverrides): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(RPC_STORAGE_KEY, JSON.stringify(overrides))
  } catch {
    // ignore
  }
}

/** 合并用户自定义端点（最高优先级） + 公共端点，去重后返回 */
export function resolveRpcEndpoints(
  cluster: SolanaCluster,
  overrides: SolRpcOverrides
): string[] {
  const list: string[] = []
  const custom = overrides[cluster]?.trim()
  if (custom) list.push(custom)
  for (const url of PUBLIC_SOL_RPCS[cluster] ?? []) {
    if (!list.includes(url)) list.push(url)
  }
  return list
}

/** 判断 Solana RPC 报错是否属于公共端点拒绝/限流（403/429/CORS 等） */
export function isRpcAccessError(err: unknown): boolean {
  const message = err instanceof Error ? err.message : String(err ?? '')
  return (
    /\b403\b/.test(message) ||
    /\b429\b/.test(message) ||
    /Access forbidden/i.test(message) ||
    /forbidden/i.test(message) ||
    /rate.?limit/i.test(message) ||
    /failed to fetch/i.test(message) ||
    /NetworkError/i.test(message)
  )
}
