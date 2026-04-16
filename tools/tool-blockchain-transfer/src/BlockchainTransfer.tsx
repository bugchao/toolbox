import React, { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  PageHero,
  Button,
  Input,
  Card,
  ParticlesBackground,
} from '@toolbox/ui-kit'
import {
  Coins,
  Wallet,
  Send,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Loader2,
  Copy,
  LogOut,
  RefreshCw,
  Info,
  Settings2,
} from 'lucide-react'
import { useMetaMask, getChainName } from './hooks/useMetaMask'
import { usePhantom, type SolanaCluster } from './hooks/usePhantom'
import { TransferError, normalizeAmount, stripInvisible } from './hooks/normalize'
import {
  PUBLIC_SOL_RPCS,
  readSolRpcOverrides,
  writeSolRpcOverrides,
  type SolRpcOverrides,
} from './hooks/solana-rpc'

type Chain = 'eth' | 'sol'

const ETH_EXPLORERS: Record<string, string> = {
  '0x1': 'https://etherscan.io/tx/',
  '0x5': 'https://goerli.etherscan.io/tx/',
  '0xaa36a7': 'https://sepolia.etherscan.io/tx/',
  '0x89': 'https://polygonscan.com/tx/',
  '0x38': 'https://bscscan.com/tx/',
  '0xa4b1': 'https://arbiscan.io/tx/',
  '0xa': 'https://optimistic.etherscan.io/tx/',
  '0x2105': 'https://basescan.org/tx/',
}

function short(addr: string | null, left = 6, right = 4): string {
  if (!addr) return ''
  if (addr.length <= left + right + 2) return addr
  return `${addr.slice(0, left)}…${addr.slice(-right)}`
}

const BlockchainTransfer: React.FC = () => {
  const { t } = useTranslation('toolBlockchainTransfer')

  const [chain, setChain] = useState<Chain>('eth')
  const [to, setTo] = useState('')
  const [amount, setAmount] = useState('')
  const [sending, setSending] = useState(false)
  const [txHash, setTxHash] = useState<string | null>(null)
  const [sendError, setSendError] = useState<string | null>(null)
  const [solCluster, setSolCluster] = useState<SolanaCluster>('mainnet-beta')
  const [rpcOverrides, setRpcOverrides] = useState<SolRpcOverrides>(() => readSolRpcOverrides())
  const [showRpcEditor, setShowRpcEditor] = useState(false)

  const updateRpcOverride = (cluster: SolanaCluster, url: string) => {
    const next: SolRpcOverrides = { ...rpcOverrides }
    const trimmed = url.trim()
    if (trimmed) next[cluster] = trimmed
    else delete next[cluster]
    setRpcOverrides(next)
    writeSolRpcOverrides(next)
  }

  const metamask = useMetaMask()
  const phantom = usePhantom()

  const active = chain === 'eth' ? metamask : phantom
  const account = chain === 'eth' ? metamask.account : phantom.account
  const available = chain === 'eth' ? metamask.available : phantom.available

  const explorerUrl = useMemo(() => {
    if (!txHash) return null
    if (chain === 'eth') {
      const base = metamask.chainId ? ETH_EXPLORERS[metamask.chainId.toLowerCase()] : null
      return base ? `${base}${txHash}` : null
    }
    const cluster = solCluster === 'mainnet-beta' ? '' : `?cluster=${solCluster}`
    return `https://solscan.io/tx/${txHash}${cluster}`
  }, [txHash, chain, metamask.chainId, solCluster])

  const walletInstalled = available
  const walletUrl =
    chain === 'eth' ? 'https://metamask.io/download/' : 'https://phantom.app/download'
  const walletName = chain === 'eth' ? 'MetaMask' : 'Phantom'

  const handleConnect = async () => {
    setSendError(null)
    setTxHash(null)
    if (chain === 'eth') await metamask.connect()
    else await phantom.connect()
  }

  const handleDisconnect = async () => {
    setSendError(null)
    setTxHash(null)
    if (chain === 'eth') await metamask.disconnect()
    else await phantom.disconnect()
  }

  const handleSwitchAccount = async () => {
    setSendError(null)
    setTxHash(null)
    if (chain === 'eth') await metamask.switchAccount()
    else await phantom.switchAccount()
  }

  const handleSend = async () => {
    setSendError(null)
    setTxHash(null)
    if (!to.trim() || !amount.trim()) {
      setSendError(t('errors.missingFields'))
      return
    }
    setSending(true)
    try {
      const hash =
        chain === 'eth'
          ? await metamask.sendEth(to, amount)
          : await phantom.sendSol(to, amount, solCluster, rpcOverrides)
      setTxHash(hash)
    } catch (e: unknown) {
      if (e instanceof TransferError) {
        setSendError(t(`errors.code.${e.code}`))
        if (e.code === 'sol-rpc-forbidden' || e.code === 'sol-rpc-unreachable') {
          setShowRpcEditor(true)
        }
      } else {
        // 兼容钱包/网络层抛出的原始错误
        const err = e as { code?: number; message?: string } | undefined
        if (err?.code === 4001 || /user rejected|user denied/i.test(err?.message ?? '')) {
          setSendError(t('errors.userRejected'))
        } else {
          setSendError(err?.message || t('errors.sendFailed'))
        }
      }
    } finally {
      setSending(false)
    }
  }

  const handleCopy = (text: string) => {
    try {
      navigator.clipboard?.writeText(text)
    } catch {
      // ignore
    }
  }

  const chainTabBase =
    'flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold border transition-all cursor-pointer select-none'
  const ethActive =
    chain === 'eth'
      ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-transparent shadow-lg shadow-indigo-500/30'
      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-indigo-400'
  const solActive =
    chain === 'sol'
      ? 'bg-gradient-to-br from-fuchsia-500 to-sky-500 text-white border-transparent shadow-lg shadow-fuchsia-500/30'
      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-fuchsia-400'

  return (
    <div className="relative min-h-[60vh]">
      <ParticlesBackground preset="minimal" className="absolute inset-0" />
      <div className="relative z-10 space-y-6">
        <PageHero title={t('title')} description={t('description')} icon={Coins} />

        <div className="max-w-2xl mx-auto px-4 space-y-5">
          {/* Chain selector */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => {
                setChain('eth')
                setSendError(null)
                setTxHash(null)
              }}
              className={`${chainTabBase} ${ethActive}`}
            >
              <span className="text-lg">Ξ</span>
              <span>{t('chain.eth')}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setChain('sol')
                setSendError(null)
                setTxHash(null)
              }}
              className={`${chainTabBase} ${solActive}`}
            >
              <span className="text-lg">◎</span>
              <span>{t('chain.sol')}</span>
            </button>
          </div>

          {/* Chain ↔ wallet hint */}
          <div className="flex items-start gap-2 rounded-lg border border-indigo-100 dark:border-indigo-900/40 bg-indigo-50/70 dark:bg-indigo-900/20 p-3 text-xs text-indigo-900/80 dark:text-indigo-200/80">
            <Info className="w-4 h-4 mt-0.5 shrink-0" />
            <div>
              {t('hint.walletMapping')}
              {chain === 'eth' && metamask.available && !metamask.isRealMetaMask && (
                <div className="mt-1 text-amber-700 dark:text-amber-300">
                  {t('hint.notMetaMask')}
                </div>
              )}
            </div>
          </div>

          {/* Wallet card */}
          <Card padded={false} className="overflow-hidden">
            <div
              className={`relative p-5 ${
                chain === 'eth'
                  ? 'bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20'
                  : 'bg-gradient-to-r from-fuchsia-50 to-sky-50 dark:from-fuchsia-900/20 dark:to-sky-900/20'
              }`}
            >
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      chain === 'eth'
                        ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white'
                        : 'bg-gradient-to-br from-fuchsia-500 to-sky-500 text-white'
                    }`}
                  >
                    <Wallet className="w-6 h-6" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      <span>{walletName}</span>
                      <span className="text-gray-300 dark:text-gray-600">·</span>
                      <span>{chain === 'eth' ? 'Ethereum' : 'Solana'}</span>
                    </div>
                    {account ? (
                      <div className="mt-0.5">
                        <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                          {short(account, 10, 6)}
                        </div>
                        <div
                          className="mt-0.5 font-mono text-[11px] leading-relaxed text-gray-500 dark:text-gray-400 break-all select-all"
                          title={account}
                        >
                          {account}
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-600 dark:text-gray-300">
                        {walletInstalled
                          ? t('wallet.notConnected')
                          : t('wallet.notInstalled', { wallet: walletName })}
                      </div>
                    )}
                    {chain === 'eth' && metamask.chainId && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {t('wallet.network')}: {getChainName(metamask.chainId)}
                      </div>
                    )}
                    {chain === 'sol' && account && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {t('wallet.cluster')}: {solCluster}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  {!walletInstalled ? (
                    <a
                      href={walletUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gray-900 text-white hover:bg-gray-700 text-sm font-medium"
                    >
                      {t('wallet.install')}
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  ) : account ? (
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="inline-flex items-center gap-1 text-sm text-green-600 dark:text-green-400 font-medium">
                        <CheckCircle2 className="w-4 h-4" />
                        {t('wallet.connected')}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(account)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white/70 dark:bg-gray-800/60 hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        {t('wallet.copy')}
                      </button>
                      <button
                        type="button"
                        onClick={handleSwitchAccount}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white/70 dark:bg-gray-800/60 hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        {t('wallet.switchAccount')}
                      </button>
                      <button
                        type="button"
                        onClick={handleDisconnect}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white/70 dark:bg-gray-800/60 hover:bg-red-50 hover:text-red-600 hover:border-red-300 dark:hover:bg-red-900/20 dark:hover:text-red-400 dark:hover:border-red-800 transition-colors"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        {t('wallet.disconnect')}
                      </button>
                    </div>
                  ) : (
                    <Button
                      onClick={handleConnect}
                      disabled={active.connecting}
                      variant="primary"
                    >
                      {active.connecting ? (
                        <span className="inline-flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          {t('wallet.connecting')}
                        </span>
                      ) : (
                        t('wallet.connect')
                      )}
                    </Button>
                  )}
                </div>
              </div>
              {active.error && (
                <div className="mt-3 text-sm text-red-600 dark:text-red-400 flex items-start gap-1.5">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{active.error}</span>
                </div>
              )}
            </div>

            {/* Transfer form */}
            <div className="p-5 space-y-4">
              {chain === 'sol' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t('form.cluster')}
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowRpcEditor((v) => !v)}
                      className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-fuchsia-600 dark:text-gray-400 dark:hover:text-fuchsia-300"
                    >
                      <Settings2 className="w-3.5 h-3.5" />
                      {t('rpc.toggle')}
                      {rpcOverrides[solCluster] && (
                        <span className="ml-1 px-1.5 py-0.5 rounded-full bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-900/40 dark:text-fuchsia-200 text-[10px] font-semibold">
                          {t('rpc.custom')}
                        </span>
                      )}
                    </button>
                  </div>
                  <div className="flex gap-2">
                    {(['mainnet-beta', 'devnet', 'testnet'] as const).map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setSolCluster(c)}
                        className={`flex-1 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                          solCluster === c
                            ? 'bg-fuchsia-500 text-white border-transparent'
                            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-fuchsia-400'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                  {showRpcEditor && (
                    <div className="rounded-lg border border-fuchsia-200 dark:border-fuchsia-900/40 bg-fuchsia-50/60 dark:bg-fuchsia-900/10 p-3 space-y-2">
                      <div className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                        {t('rpc.description')}
                      </div>
                      <Input
                        value={rpcOverrides[solCluster] ?? ''}
                        onChange={(e) => updateRpcOverride(solCluster, e.target.value)}
                        placeholder={
                          solCluster === 'mainnet-beta'
                            ? 'https://mainnet.helius-rpc.com/?api-key=YOUR_KEY'
                            : PUBLIC_SOL_RPCS[solCluster][0]
                        }
                        className="font-mono text-xs"
                      />
                      <div className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
                        {t('rpc.defaults')}:{' '}
                        <code className="font-mono">
                          {PUBLIC_SOL_RPCS[solCluster].join(', ')}
                        </code>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  {t('form.to')}
                </label>
                <Input
                  value={to}
                  onChange={(e) => setTo(stripInvisible(e.target.value))}
                  onPaste={(e) => {
                    e.preventDefault()
                    const text = e.clipboardData.getData('text')
                    setTo(stripInvisible(text))
                  }}
                  placeholder={
                    chain === 'eth'
                      ? '0x71C7656EC7ab88b098defB751B7401B5f6d8976F'
                      : 'Phantom wallet address (Base58)'
                  }
                  className="font-mono text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  {t('form.amount', { symbol: chain === 'eth' ? 'ETH' : 'SOL' })}
                </label>
                <div className="relative">
                  <Input
                    value={amount}
                    onChange={(e) => setAmount(normalizeAmount(e.target.value))}
                    placeholder="0.01"
                    inputMode="decimal"
                    className="pr-16 font-mono"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-500 dark:text-gray-400">
                    {chain === 'eth' ? 'ETH' : 'SOL'}
                  </div>
                </div>
              </div>

              <Button
                onClick={handleSend}
                disabled={sending || !account}
                className="w-full"
                size="lg"
              >
                {sending ? (
                  <span className="inline-flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {t('form.sending')}
                  </span>
                ) : (
                  <span className="inline-flex items-center justify-center gap-2">
                    <Send className="w-5 h-5" />
                    {account ? t('form.send') : t('form.connectFirst')}
                  </span>
                )}
              </Button>

              {sendError && (
                <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 text-sm text-red-700 dark:text-red-300 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span className="break-words">{sendError}</span>
                </div>
              )}

              {txHash && (
                <div className="rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4 space-y-2">
                  <div className="flex items-center gap-2 text-green-700 dark:text-green-300 font-semibold">
                    <CheckCircle2 className="w-5 h-5" />
                    {t('result.success')}
                  </div>
                  <div className="flex items-center gap-2 flex-wrap text-sm">
                    <span className="text-gray-600 dark:text-gray-400">{t('result.txHash')}:</span>
                    <code className="font-mono text-gray-900 dark:text-gray-100 break-all">
                      {short(txHash, 10, 8)}
                    </code>
                    <button
                      type="button"
                      onClick={() => handleCopy(txHash)}
                      className="text-gray-500 hover:text-indigo-500"
                      aria-label="copy"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    {explorerUrl && (
                      <a
                        href={explorerUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline ml-auto"
                      >
                        {t('result.viewOnExplorer')}
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </Card>

          <div className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed text-center">
            {t('footer.note')}
          </div>
        </div>
      </div>
    </div>
  )
}

export default BlockchainTransfer
