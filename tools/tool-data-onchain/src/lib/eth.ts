/**
 * 以太坊 Provider 封装。
 *
 * 同时支持三种读数据方式：
 *   1. 直接用浏览器钱包 (MetaMask) 注入的 provider（也用于签名发交易）
 *   2. 通过 Infura RPC 读取（eth_call / getLogs 等）
 *   3. 通过 Alchemy RPC 读取
 *
 * 写数据必须通过钱包签名，读数据可以用任一 provider。
 */

import { BrowserProvider, JsonRpcProvider, Contract, type Eip1193Provider } from 'ethers'
import { SEPOLIA_CHAIN_ID } from './contracts'

export type RpcProviderKind = 'wallet' | 'infura' | 'alchemy' | 'custom'

export interface RpcConfig {
  kind: RpcProviderKind
  /** Infura / Alchemy / 自定义 RPC 的完整 URL */
  url?: string
}

declare global {
  interface Window {
    ethereum?: Eip1193Provider & {
      isMetaMask?: boolean
      on?: (event: string, handler: (...args: unknown[]) => void) => void
      removeListener?: (event: string, handler: (...args: unknown[]) => void) => void
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>
    }
  }
}

export function getInjectedProvider() {
  if (typeof window === 'undefined') return null
  return window.ethereum ?? null
}

export function hasMetaMask(): boolean {
  const p = getInjectedProvider()
  return !!p && !!p.isMetaMask
}

/** 创建只读 Provider：infura / alchemy / custom，或浏览器钱包（默认兜底） */
export function makeReadProvider(cfg: RpcConfig): BrowserProvider | JsonRpcProvider {
  if (cfg.kind === 'wallet') {
    const injected = getInjectedProvider()
    if (!injected) throw new Error('未检测到 MetaMask / 注入式钱包')
    return new BrowserProvider(injected)
  }
  if (!cfg.url) throw new Error('请先填写 RPC URL')
  return new JsonRpcProvider(cfg.url)
}

/** 创建用于发交易的 BrowserProvider（强制走钱包） */
export async function makeWalletProvider(): Promise<BrowserProvider> {
  const injected = getInjectedProvider()
  if (!injected) throw new Error('未检测到 MetaMask / 注入式钱包')
  return new BrowserProvider(injected)
}

/** 连接账号；返回 checksum 地址 */
export async function connectAccount(): Promise<string> {
  const injected = getInjectedProvider()
  if (!injected) throw new Error('未检测到 MetaMask')
  const accounts = (await injected.request({ method: 'eth_requestAccounts' })) as string[]
  if (!accounts || accounts.length === 0) throw new Error('未返回账户')
  return accounts[0]
}

/** 读当前链 ID，返回 '0x...' 十六进制 */
export async function getChainIdHex(): Promise<string> {
  const injected = getInjectedProvider()
  if (!injected) throw new Error('未检测到 MetaMask')
  return (await injected.request({ method: 'eth_chainId' })) as string
}

/** 尝试切换到 Sepolia；没有则引导添加 */
export async function switchToSepolia(): Promise<void> {
  const injected = getInjectedProvider()
  if (!injected) throw new Error('未检测到 MetaMask')
  try {
    await injected.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: SEPOLIA_CHAIN_ID }],
    })
  } catch (e: unknown) {
    const err = e as { code?: number }
    if (err?.code === 4902) {
      await injected.request({
        method: 'wallet_addEthereumChain',
        params: [
          {
            chainId: SEPOLIA_CHAIN_ID,
            chainName: 'Sepolia Testnet',
            nativeCurrency: { name: 'Sepolia ETH', symbol: 'SEP', decimals: 18 },
            rpcUrls: ['https://rpc.sepolia.org'],
            blockExplorerUrls: ['https://sepolia.etherscan.io'],
          },
        ],
      })
    } else {
      throw e
    }
  }
}

/** 常用：构造只读 Contract 实例 */
export function makeReadContract(
  address: string,
  abi: readonly string[],
  cfg: RpcConfig
): Contract {
  const provider = makeReadProvider(cfg)
  return new Contract(address, abi as unknown as string[], provider)
}

export { Contract, BrowserProvider, JsonRpcProvider }
