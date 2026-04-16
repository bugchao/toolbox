import { useCallback, useEffect, useState } from 'react'
import {
  TransferError,
  sanitizeDecimalAmount,
  sanitizeSolAddress,
} from './normalize'
import {
  isRpcAccessError,
  resolveRpcEndpoints,
  type SolRpcOverrides,
} from './solana-rpc'

type SolanaProvider = {
  isPhantom?: boolean
  publicKey?: { toString: () => string } | null
  isConnected?: boolean
  connect: (opts?: { onlyIfTrusted?: boolean }) => Promise<{ publicKey: { toString: () => string } }>
  disconnect: () => Promise<void>
  signAndSendTransaction: (transaction: unknown) => Promise<{ signature: string }>
  on?: (event: string, handler: (...args: unknown[]) => void) => void
  removeListener?: (event: string, handler: (...args: unknown[]) => void) => void
}

declare global {
  interface Window {
    solana?: SolanaProvider
    phantom?: { solana?: SolanaProvider }
  }
}

export type SolanaCluster = 'mainnet-beta' | 'devnet' | 'testnet'

export interface UsePhantomResult {
  available: boolean
  account: string | null
  connecting: boolean
  error: string | null
  connect: () => Promise<void>
  disconnect: () => Promise<void>
  /** 重新打开 Phantom 授权弹窗（先断开再连接） */
  switchAccount: () => Promise<void>
  sendSol: (
    to: string,
    solAmount: string,
    cluster: SolanaCluster,
    rpcOverrides?: SolRpcOverrides
  ) => Promise<string>
  reset: () => void
}

function getProvider(): SolanaProvider | undefined {
  if (typeof window === 'undefined') return undefined
  return window.phantom?.solana ?? window.solana
}

export function usePhantom(): UsePhantomResult {
  const [provider, setProvider] = useState<SolanaProvider | undefined>(() => getProvider())
  const [account, setAccount] = useState<string | null>(null)
  const [connecting, setConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!provider) {
      const p = getProvider()
      if (p) setProvider(p)
    }
  }, [provider])

  useEffect(() => {
    if (!provider) return
    const onConnect = (...args: unknown[]) => {
      const pk = args[0] as { toString: () => string } | undefined
      if (pk) setAccount(pk.toString())
    }
    const onDisconnect = () => setAccount(null)

    provider
      .connect({ onlyIfTrusted: true })
      .then((res) => setAccount(res.publicKey.toString()))
      .catch(() => {})

    provider.on?.('connect', onConnect)
    provider.on?.('disconnect', onDisconnect)
    return () => {
      provider.removeListener?.('connect', onConnect)
      provider.removeListener?.('disconnect', onDisconnect)
    }
  }, [provider])

  const connect = useCallback(async () => {
    const p = provider ?? getProvider()
    if (!p) {
      setError('Phantom wallet is not installed')
      return
    }
    setConnecting(true)
    setError(null)
    try {
      const res = await p.connect()
      setAccount(res.publicKey.toString())
      if (!provider) setProvider(p)
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to connect'
      setError(msg)
    } finally {
      setConnecting(false)
    }
  }, [provider])

  const disconnect = useCallback(async () => {
    if (!provider) return
    try {
      await provider.disconnect()
      setAccount(null)
    } catch {
      // ignore
    }
  }, [provider])

  const switchAccount = useCallback(async () => {
    const p = provider ?? getProvider()
    if (!p) {
      setError('Phantom wallet is not installed')
      return
    }
    setError(null)
    try {
      try {
        await p.disconnect()
      } catch {
        // ignore
      }
      setAccount(null)
      const res = await p.connect()
      setAccount(res.publicKey.toString())
    } catch (e: unknown) {
      const err = e as { code?: number; message?: string } | undefined
      if (err?.code === 4001) return
      setError(err?.message ?? 'Failed to switch account')
    }
  }, [provider])

  const sendSol = useCallback(
    async (
      to: string,
      solAmount: string,
      cluster: SolanaCluster,
      rpcOverrides: SolRpcOverrides = {}
    ): Promise<string> => {
      const p = provider ?? getProvider()
      if (!p) throw new TransferError('wallet-not-installed')
      if (!account) throw new TransferError('wallet-not-connected')

      const cleanTo = sanitizeSolAddress(to)
      const cleanAmount = sanitizeDecimalAmount(solAmount)

      const web3 = await import('@solana/web3.js')
      let toPubkey: InstanceType<typeof web3.PublicKey>
      try {
        toPubkey = new web3.PublicKey(cleanTo)
      } catch {
        throw new TransferError('invalid-address')
      }
      const fromPubkey = new web3.PublicKey(account)
      const lamports = Math.round(Number(cleanAmount) * web3.LAMPORTS_PER_SOL)

      // 依次尝试可用 RPC 端点，第一个成功拿到 blockhash 的即作为连接
      const endpoints = resolveRpcEndpoints(cluster, rpcOverrides)
      const tried: Array<{ url: string; error: unknown }> = []
      let connection: InstanceType<typeof web3.Connection> | null = null
      let blockhash: string | null = null
      for (const url of endpoints) {
        try {
          const c = new web3.Connection(url, 'confirmed')
          const res = await c.getLatestBlockhash()
          connection = c
          blockhash = res.blockhash
          break
        } catch (e) {
          tried.push({ url, error: e })
          // 非访问类错误（例如网络中断但并非 403/429）也继续尝试下一个
          if (!isRpcAccessError(e)) {
            // continue
          }
        }
      }

      if (!connection || !blockhash) {
        const lastErr = tried[tried.length - 1]?.error
        const lastMsg = lastErr instanceof Error ? lastErr.message : String(lastErr ?? '')
        throw new TransferError(
          isRpcAccessError(lastErr) ? 'sol-rpc-forbidden' : 'sol-rpc-unreachable',
          lastMsg
        )
      }

      const tx = new web3.Transaction({ feePayer: fromPubkey, recentBlockhash: blockhash }).add(
        web3.SystemProgram.transfer({
          fromPubkey,
          toPubkey,
          lamports,
        })
      )

      try {
        const { signature } = await p.signAndSendTransaction(tx)
        return signature
      } catch (e) {
        if (isRpcAccessError(e)) {
          const msg = e instanceof Error ? e.message : String(e ?? '')
          throw new TransferError('sol-rpc-forbidden', msg)
        }
        throw e
      }
    },
    [provider, account]
  )

  const reset = useCallback(() => setError(null), [])

  return {
    available: Boolean(provider),
    account,
    connecting,
    error,
    connect,
    disconnect,
    switchAccount,
    sendSol,
    reset,
  }
}
