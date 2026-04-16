import { useCallback, useEffect, useState } from 'react'
import {
  TransferError,
  ethDecimalToWeiHex,
  sanitizeDecimalAmount,
  sanitizeEthAddress,
} from './normalize'

type EthereumProvider = {
  isMetaMask?: boolean
  isPhantom?: boolean
  providers?: EthereumProvider[]
  request: (args: { method: string; params?: unknown[] | object }) => Promise<unknown>
  on?: (event: string, handler: (...args: unknown[]) => void) => void
  removeListener?: (event: string, handler: (...args: unknown[]) => void) => void
}

declare global {
  interface Window {
    ethereum?: EthereumProvider
  }
}

/**
 * 当同时安装了 MetaMask、Phantom (其也注入 ETH provider)、Rabby 等，
 * window.ethereum 只会是其中一个。优先挑选真正的 MetaMask。
 */
function pickMetaMaskProvider(): EthereumProvider | undefined {
  if (typeof window === 'undefined') return undefined
  const eth = window.ethereum
  if (!eth) return undefined
  const providers = Array.isArray(eth.providers) ? eth.providers : [eth]
  const mm = providers.find((p) => p?.isMetaMask && !p?.isPhantom)
  return mm ?? eth
}

const CHAIN_NAMES: Record<string, string> = {
  '0x1': 'Ethereum Mainnet',
  '0x5': 'Goerli Testnet',
  '0xaa36a7': 'Sepolia Testnet',
  '0x89': 'Polygon',
  '0x38': 'BNB Smart Chain',
  '0xa4b1': 'Arbitrum One',
  '0xa': 'Optimism',
  '0x2105': 'Base',
}

export function getChainName(chainId: string | null): string {
  if (!chainId) return 'Unknown'
  return CHAIN_NAMES[chainId.toLowerCase()] ?? chainId
}

export interface UseMetaMaskResult {
  available: boolean
  isRealMetaMask: boolean
  account: string | null
  chainId: string | null
  connecting: boolean
  error: string | null
  connect: () => Promise<void>
  disconnect: () => Promise<void>
  /** 触发 MetaMask 账户选择器（同一钱包内切换账户） */
  switchAccount: () => Promise<void>
  sendEth: (to: string, ethAmount: string) => Promise<string>
  reset: () => void
}

export function useMetaMask(): UseMetaMaskResult {
  const provider = pickMetaMaskProvider()
  const available = Boolean(provider)
  const isRealMetaMask = Boolean(provider?.isMetaMask && !provider?.isPhantom)

  const [account, setAccount] = useState<string | null>(null)
  const [chainId, setChainId] = useState<string | null>(null)
  const [connecting, setConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!provider) return
    const handleAccounts = (...args: unknown[]) => {
      const accs = args[0] as string[] | undefined
      setAccount(accs && accs.length > 0 ? accs[0] : null)
    }
    const handleChain = (...args: unknown[]) => {
      setChainId(args[0] as string)
    }

    provider
      .request({ method: 'eth_accounts' })
      .then((res) => {
        const accs = res as string[]
        if (accs && accs.length > 0) setAccount(accs[0])
      })
      .catch(() => {})

    provider
      .request({ method: 'eth_chainId' })
      .then((res) => setChainId(res as string))
      .catch(() => {})

    provider.on?.('accountsChanged', handleAccounts)
    provider.on?.('chainChanged', handleChain)

    return () => {
      provider.removeListener?.('accountsChanged', handleAccounts)
      provider.removeListener?.('chainChanged', handleChain)
    }
  }, [provider])

  const connect = useCallback(async () => {
    if (!provider) {
      setError('MetaMask is not installed')
      return
    }
    setConnecting(true)
    setError(null)
    try {
      const accs = (await provider.request({ method: 'eth_requestAccounts' })) as string[]
      if (accs && accs.length > 0) setAccount(accs[0])
      const c = (await provider.request({ method: 'eth_chainId' })) as string
      setChainId(c)
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to connect'
      setError(msg)
    } finally {
      setConnecting(false)
    }
  }, [provider])

  const switchAccount = useCallback(async () => {
    if (!provider) {
      setError('MetaMask is not installed')
      return
    }
    setError(null)
    try {
      // wallet_requestPermissions 会弹出 MetaMask 的「选择账户」界面，
      // 即使当前已经授权了某个账户，也能重新挑选。
      const perms = (await provider.request({
        method: 'wallet_requestPermissions',
        params: [{ eth_accounts: {} }],
      })) as Array<{ caveats?: Array<{ type?: string; value?: string[] }> }>
      const caveat = perms?.[0]?.caveats?.find((c) => c?.type === 'restrictReturnedAccounts')
      const newAcc = caveat?.value?.[0]
      if (newAcc) {
        setAccount(newAcc)
      } else {
        const accs = (await provider.request({ method: 'eth_accounts' })) as string[]
        if (accs && accs.length > 0) setAccount(accs[0])
      }
    } catch (e: unknown) {
      const err = e as { code?: number; message?: string } | undefined
      if (err?.code === 4001) return // 用户取消，保持原状
      const msg = err?.message || 'Failed to switch account'
      setError(msg)
    }
  }, [provider])

  const disconnect = useCallback(async () => {
    setError(null)
    if (provider) {
      try {
        // EIP-2255: revoke eth_accounts so next connect will prompt again
        await provider.request({
          method: 'wallet_revokePermissions',
          params: [{ eth_accounts: {} }],
        })
      } catch {
        // Older MetaMask versions may not support wallet_revokePermissions.
        // In that case we just clear local state; user can still use MetaMask UI to disconnect.
      }
    }
    setAccount(null)
  }, [provider])

  const sendEth = useCallback(
    async (to: string, ethAmount: string): Promise<string> => {
      if (!provider) throw new TransferError('wallet-not-installed')
      if (!account) throw new TransferError('wallet-not-connected')

      const cleanTo = sanitizeEthAddress(to)
      const cleanAmount = sanitizeDecimalAmount(ethAmount)
      const valueHex = ethDecimalToWeiHex(cleanAmount)

      const txHash = (await provider.request({
        method: 'eth_sendTransaction',
        params: [
          {
            from: account,
            to: cleanTo,
            value: valueHex,
          },
        ],
      })) as string
      return txHash
    },
    [provider, account]
  )

  const reset = useCallback(() => {
    setError(null)
  }, [])

  return {
    available,
    isRealMetaMask,
    account,
    chainId,
    connecting,
    error,
    connect,
    disconnect,
    switchAccount,
    sendEth,
    reset,
  }
}
