import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  PageHero,
  Button,
  Input,
  TextArea,
  Card,
  ParticlesBackground,
  NoticeCard,
} from '@toolbox/ui-kit'
import {
  Database,
  Wallet,
  Copy,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Lock,
  Unlock,
  ArrowRight,
  ArrowLeft,
  FileCode,
  Layers,
  Radio,
  LayoutGrid,
  RefreshCw,
  Network,
} from 'lucide-react'
import {
  Contract,
  getAddress,
  getBytes,
  hexlify,
  isAddress,
  keccak256,
  toUtf8Bytes,
  toUtf8String,
} from 'ethers'

import CodeBlock from './components/CodeBlock'
import {
  DATA_VAULT_ABI,
  DATA_LOGGER_ABI,
  DEFAULT_CONTRACTS,
  SEPOLIA_CHAIN_ID,
  SEPOLIA_CHAIN_ID_DEC,
  readContracts,
  writeContracts,
  type Contracts,
} from './lib/contracts'
import {
  connectAccount,
  getChainIdHex,
  getInjectedProvider,
  hasMetaMask,
  makeReadContract,
  makeWalletProvider,
  switchToSepolia,
  type RpcConfig,
  type RpcProviderKind,
} from './lib/eth'
import { decrypt, encrypt, isDxncEnvelope } from './lib/cipher'
import {
  GET_LOGS_BY_TOPIC,
  GET_RECENT_LOGS,
  querySubgraph,
  type RecentLogsResult,
  type SubgraphLog,
} from './lib/subgraph'
import {
  SOURCE_DATA_LOGGER_SOL,
  SOURCE_DATA_VAULT_SOL,
  SOURCE_DEPLOY_README,
  SOURCE_DEPLOY_SCRIPT,
  SOURCE_GRAPHQL_QUERY_EXAMPLE,
  SOURCE_HARDHAT_CONFIG,
  SOURCE_SUBGRAPH_MAPPING,
  SOURCE_SUBGRAPH_README,
  SOURCE_SUBGRAPH_SCHEMA,
  SOURCE_SUBGRAPH_YAML,
} from './lib/sources'

type TabId = 'overview' | 'storage' | 'logs' | 'cipher' | 'contracts'

const RPC_STORAGE_KEY = 'toolbox:tool-data-onchain:rpc'
const SUBGRAPH_STORAGE_KEY = 'toolbox:tool-data-onchain:subgraph'

interface RpcState {
  kind: RpcProviderKind
  urls: {
    infura: string
    alchemy: string
    custom: string
  }
}

const DEFAULT_RPC: RpcState = {
  kind: 'wallet',
  urls: { infura: '', alchemy: '', custom: 'https://rpc.sepolia.org' },
}

function readRpcState(): RpcState {
  if (typeof window === 'undefined') return { ...DEFAULT_RPC }
  try {
    const raw = window.localStorage.getItem(RPC_STORAGE_KEY)
    if (!raw) return { ...DEFAULT_RPC }
    const v = JSON.parse(raw)
    return {
      kind: (v.kind as RpcProviderKind) || 'wallet',
      urls: {
        infura: v.urls?.infura ?? '',
        alchemy: v.urls?.alchemy ?? '',
        custom: v.urls?.custom ?? 'https://rpc.sepolia.org',
      },
    }
  } catch {
    return { ...DEFAULT_RPC }
  }
}

function writeRpcState(v: RpcState): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(RPC_STORAGE_KEY, JSON.stringify(v))
  } catch {
    // ignore
  }
}

function shortAddr(addr: string | null | undefined, left = 6, right = 4): string {
  if (!addr) return '—'
  if (addr.length <= left + right + 2) return addr
  return `${addr.slice(0, left)}…${addr.slice(-right)}`
}

function ensureBytes32FromString(s: string): string {
  return keccak256(toUtf8Bytes(s))
}

function isValidAddressOrEmpty(v: string): boolean {
  return v === '' || isAddress(v)
}

function decodeBytesAsText(hex: string): string {
  try {
    if (!hex || hex === '0x') return ''
    const bytes = getBytes(hex)
    return toUtf8String(bytes)
  } catch {
    return ''
  }
}

function etherscanTx(hash: string): string {
  return `https://sepolia.etherscan.io/tx/${hash}`
}

function etherscanAddr(addr: string): string {
  return `https://sepolia.etherscan.io/address/${addr}`
}

const TAB_DEFS: Array<{ id: TabId; icon: React.ComponentType<{ className?: string }> }> = [
  { id: 'overview', icon: LayoutGrid },
  { id: 'storage', icon: Layers },
  { id: 'logs', icon: Radio },
  { id: 'cipher', icon: Lock },
  { id: 'contracts', icon: FileCode },
]

const DataOnchain: React.FC = () => {
  const { t } = useTranslation('toolDataOnchain')

  // ---------- tabs ----------
  const [tab, setTab] = useState<TabId>('overview')

  // ---------- wallet ----------
  const [account, setAccount] = useState<string | null>(null)
  const [chainId, setChainId] = useState<string | null>(null)
  const [connecting, setConnecting] = useState(false)
  const [walletError, setWalletError] = useState<string | null>(null)
  const metamaskInstalled = useMemo(() => hasMetaMask(), [])

  const refreshChainId = useCallback(async () => {
    try {
      const c = await getChainIdHex()
      setChainId(c)
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => {
    const p = getInjectedProvider()
    if (!p) return
    let cancelled = false
    ;(async () => {
      try {
        const accounts = (await p.request({ method: 'eth_accounts' })) as string[]
        if (!cancelled && accounts && accounts.length) setAccount(accounts[0])
      } catch {
        // ignore
      }
      await refreshChainId()
    })()
    const onAccounts = (...args: unknown[]) => {
      const accounts = (args[0] as string[] | undefined) ?? []
      setAccount(accounts[0] ?? null)
    }
    const onChain = (...args: unknown[]) => {
      const cid = args[0] as string | undefined
      setChainId(cid ?? null)
    }
    p.on?.('accountsChanged', onAccounts)
    p.on?.('chainChanged', onChain)
    return () => {
      cancelled = true
      p.removeListener?.('accountsChanged', onAccounts)
      p.removeListener?.('chainChanged', onChain)
    }
  }, [refreshChainId])

  const handleConnect = useCallback(async () => {
    setWalletError(null)
    setConnecting(true)
    try {
      const a = await connectAccount()
      setAccount(a)
      await refreshChainId()
    } catch (e: unknown) {
      setWalletError((e as Error).message)
    } finally {
      setConnecting(false)
    }
  }, [refreshChainId])

  const handleSwitchSepolia = useCallback(async () => {
    setWalletError(null)
    try {
      await switchToSepolia()
      await refreshChainId()
    } catch (e: unknown) {
      setWalletError((e as Error).message)
    }
  }, [refreshChainId])

  const isSepolia = chainId?.toLowerCase() === SEPOLIA_CHAIN_ID

  // ---------- contracts & RPC ----------
  const [contracts, setContracts] = useState<Contracts>(() => readContracts())
  const [contractsDraft, setContractsDraft] = useState<Contracts>(() => readContracts())
  const [contractsSaved, setContractsSaved] = useState(false)

  const handleSaveContracts = () => {
    if (!isValidAddressOrEmpty(contractsDraft.dataVault) || !isValidAddressOrEmpty(contractsDraft.dataLogger)) {
      return
    }
    const next: Contracts = {
      dataVault: contractsDraft.dataVault
        ? getAddress(contractsDraft.dataVault)
        : DEFAULT_CONTRACTS.dataVault,
      dataLogger: contractsDraft.dataLogger
        ? getAddress(contractsDraft.dataLogger)
        : DEFAULT_CONTRACTS.dataLogger,
    }
    setContracts(next)
    setContractsDraft(next)
    writeContracts(next)
    setContractsSaved(true)
    setTimeout(() => setContractsSaved(false), 1500)
  }

  const [rpc, setRpc] = useState<RpcState>(() => readRpcState())

  const updateRpc = (patch: Partial<RpcState> | ((prev: RpcState) => RpcState)) => {
    setRpc((prev) => {
      const next = typeof patch === 'function' ? patch(prev) : { ...prev, ...patch }
      writeRpcState(next)
      return next
    })
  }

  const effectiveRpcConfig: RpcConfig = useMemo(() => {
    if (rpc.kind === 'wallet') return { kind: 'wallet' }
    const url = rpc.kind === 'infura' ? rpc.urls.infura : rpc.kind === 'alchemy' ? rpc.urls.alchemy : rpc.urls.custom
    return { kind: rpc.kind, url }
  }, [rpc])

  // ---------- tab renderer ----------
  const tabBtnBase = 'inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium border transition-all cursor-pointer'
  const activeCls = 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-transparent shadow-lg shadow-indigo-500/30'
  const idleCls = 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-indigo-400'

  return (
    <div className="relative min-h-[60vh]">
      <ParticlesBackground preset="minimal" className="absolute inset-0" />
      <div className="relative z-10 space-y-6">
        <PageHero title={t('title')} description={t('description')} icon={Database} />

        <div className="max-w-5xl mx-auto px-4 space-y-5">
          <WalletBar
            account={account}
            chainId={chainId}
            isSepolia={!!isSepolia}
            connecting={connecting}
            installed={metamaskInstalled}
            error={walletError}
            onConnect={handleConnect}
            onSwitchSepolia={handleSwitchSepolia}
            t={t}
          />

          <div className="flex flex-wrap gap-2">
            {TAB_DEFS.map(({ id, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={`${tabBtnBase} ${tab === id ? activeCls : idleCls}`}
              >
                <Icon className="w-4 h-4" />
                {t(`tabs.${id}`)}
              </button>
            ))}
          </div>

          {tab === 'overview' && <OverviewPanel t={t} />}

          {tab === 'storage' && (
            <StoragePanel
              t={t}
              contracts={contracts}
              contractsDraft={contractsDraft}
              setContractsDraft={setContractsDraft}
              onSaveContracts={handleSaveContracts}
              contractsSaved={contractsSaved}
              rpc={rpc}
              onRpcChange={updateRpc}
              effectiveRpcConfig={effectiveRpcConfig}
              account={account}
              isSepolia={!!isSepolia}
            />
          )}

          {tab === 'logs' && (
            <EventLogPanel
              t={t}
              contracts={contracts}
              contractsDraft={contractsDraft}
              setContractsDraft={setContractsDraft}
              onSaveContracts={handleSaveContracts}
              contractsSaved={contractsSaved}
              account={account}
              isSepolia={!!isSepolia}
            />
          )}

          {tab === 'cipher' && <CipherPanel t={t} />}

          {tab === 'contracts' && <ContractsPanel t={t} />}
        </div>
      </div>
    </div>
  )
}

export default DataOnchain

// =========================================================
// Wallet Bar
// =========================================================

interface WalletBarProps {
  account: string | null
  chainId: string | null
  isSepolia: boolean
  connecting: boolean
  installed: boolean
  error: string | null
  onConnect: () => void
  onSwitchSepolia: () => void
  t: ReturnType<typeof useTranslation>['t']
}

const WalletBar: React.FC<WalletBarProps> = ({
  account,
  chainId,
  isSepolia,
  connecting,
  installed,
  error,
  onConnect,
  onSwitchSepolia,
  t,
}) => {
  const [copied, setCopied] = useState(false)
  const onCopy = () => {
    if (!account) return
    try {
      navigator.clipboard?.writeText(account)
      setCopied(true)
      setTimeout(() => setCopied(false), 1200)
    } catch {
      // ignore
    }
  }

  return (
    <Card padded={false}>
      <div className="p-4 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center">
            <Wallet className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
              MetaMask · Sepolia Testnet
            </div>
            {account ? (
              <div className="text-sm font-mono text-gray-900 dark:text-gray-100 break-all">
                {shortAddr(account, 10, 6)}
              </div>
            ) : (
              <div className="text-sm text-gray-600 dark:text-gray-300">
                {installed ? t('wallet.notConnected') : t('wallet.notInstalled')}
              </div>
            )}
            {chainId && (
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {t('wallet.chainId')}: {chainId} · {parseInt(chainId, 16)}{' '}
                {!isSepolia && (
                  <span className="ml-1 text-amber-600 dark:text-amber-400 inline-flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    {t('wallet.wrongNetwork')}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {!installed ? (
            <a
              href="https://metamask.io/download/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gray-900 text-white hover:bg-gray-700 text-sm font-medium"
            >
              {t('wallet.install')}
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          ) : account ? (
            <>
              <button
                type="button"
                onClick={onCopy}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white/70 dark:bg-gray-800/60 hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
                {copied ? t('wallet.copied') : t('wallet.account')}
              </button>
              {!isSepolia && (
                <Button onClick={onSwitchSepolia} variant="primary" size="sm">
                  <Network className="w-4 h-4" />
                  {t('wallet.switchToSepolia')}
                </Button>
              )}
            </>
          ) : (
            <Button onClick={onConnect} disabled={connecting} variant="primary">
              {connecting ? (
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
      {error && (
        <div className="border-t border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-4 py-2 text-sm text-red-700 dark:text-red-300 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span className="break-words">{error}</span>
        </div>
      )}
    </Card>
  )
}

// =========================================================
// Overview Panel
// =========================================================

const OverviewPanel: React.FC<{ t: ReturnType<typeof useTranslation>['t'] }> = ({ t }) => {
  return (
    <div className="space-y-4">
      <NoticeCard tone="info" icon={Database} title={t('overview.intro')} />

      <div className="grid md:grid-cols-3 gap-4">
        <ApproachCard
          title={t('overview.approach1Title')}
          body={t('overview.approach1Body')}
          tone="indigo"
          icon={<Layers className="w-4 h-4" />}
        />
        <ApproachCard
          title={t('overview.approach2Title')}
          body={t('overview.approach2Body')}
          tone="emerald"
          icon={<Radio className="w-4 h-4" />}
        />
        <ApproachCard
          title={t('overview.approach3Title')}
          body={t('overview.approach3Body')}
          tone="rose"
          icon={<Lock className="w-4 h-4" />}
        />
      </div>

      <Card>
        <div className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">
          {t('overview.testnetLinks')}
        </div>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-2">
          <LinkItem href="https://sepolia.etherscan.io/" label={t('overview.etherscan')} />
          <LinkItem href="https://sepoliafaucet.com/" label={t('overview.faucet')} />
          <LinkItem href="https://hardhat.org/" label={t('overview.hardhat')} />
          <LinkItem href="https://thegraph.com/studio/" label={t('overview.thegraph')} />
          <LinkItem href="https://www.infura.io/" label={t('overview.infura')} />
          <LinkItem href="https://www.alchemy.com/" label={t('overview.alchemy')} />
        </div>
      </Card>
    </div>
  )
}

const ApproachCard: React.FC<{
  title: string
  body: string
  tone: 'indigo' | 'emerald' | 'rose'
  icon: React.ReactNode
}> = ({ title, body, tone, icon }) => {
  const toneMap = {
    indigo:
      'from-indigo-500/10 to-purple-500/10 border-indigo-200 dark:border-indigo-900/60 text-indigo-700 dark:text-indigo-200',
    emerald:
      'from-emerald-500/10 to-teal-500/10 border-emerald-200 dark:border-emerald-900/60 text-emerald-700 dark:text-emerald-200',
    rose:
      'from-rose-500/10 to-pink-500/10 border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-200',
  }
  return (
    <div
      className={`rounded-xl border bg-gradient-to-br p-4 ${toneMap[tone]}`}
    >
      <div className="flex items-center gap-2 font-semibold text-sm">
        {icon}
        <span>{title}</span>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-gray-700 dark:text-gray-200">{body}</p>
    </div>
  )
}

const LinkItem: React.FC<{ href: string; label: string }> = ({ href, label }) => (
  <a
    href={href}
    target="_blank"
    rel="noreferrer"
    className="flex items-center justify-between px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-gray-800/50 hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-300 text-sm font-medium transition-colors"
  >
    <span>{label}</span>
    <ExternalLink className="w-3.5 h-3.5 opacity-70" />
  </a>
)

// =========================================================
// Contract Addresses editor (shared by Storage / Logs)
// =========================================================

interface ContractsEditorProps {
  t: ReturnType<typeof useTranslation>['t']
  contractsDraft: Contracts
  setContractsDraft: (c: Contracts) => void
  onSave: () => void
  saved: boolean
  which: 'vault' | 'logger'
  addressInEffect: string
}

const ContractsEditor: React.FC<ContractsEditorProps> = ({
  t,
  contractsDraft,
  setContractsDraft,
  onSave,
  saved,
  which,
  addressInEffect,
}) => {
  const val = which === 'vault' ? contractsDraft.dataVault : contractsDraft.dataLogger
  const onChange = (v: string) => {
    setContractsDraft(
      which === 'vault'
        ? { ...contractsDraft, dataVault: v }
        : { ...contractsDraft, dataLogger: v }
    )
  }
  const valid = val === '' || isAddress(val)
  const hasEffective =
    addressInEffect && addressInEffect !== DEFAULT_CONTRACTS.dataVault && isAddress(addressInEffect)

  return (
    <Card>
      <div className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">
        {t('contractsConfig.title')}
      </div>
      <div className="text-xs text-gray-500 dark:text-gray-400 mb-3">
        {t('contractsConfig.description')}
      </div>
      <div className="space-y-2">
        <label className="block text-xs text-gray-600 dark:text-gray-300">
          {which === 'vault' ? t('contractsConfig.vault') : t('contractsConfig.logger')}
        </label>
        <Input
          value={val}
          onChange={(e) => onChange(e.target.value.trim())}
          placeholder="0x..."
          className={`font-mono text-sm ${!valid ? 'border-red-400' : ''}`}
        />
        <div className="flex items-center gap-2 flex-wrap">
          <Button onClick={onSave} size="sm" disabled={!valid}>
            {saved ? t('contractsConfig.saved') : t('contractsConfig.save')}
          </Button>
          {hasEffective && (
            <a
              href={etherscanAddr(addressInEffect)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white/70 dark:bg-gray-800/60 hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              {t('contractsConfig.openOnEtherscan')}
            </a>
          )}
          {!valid && (
            <span className="text-xs text-red-600 dark:text-red-400">
              {t('contractsConfig.invalidAddress')}
            </span>
          )}
        </div>
      </div>
    </Card>
  )
}

// =========================================================
// RPC selector
// =========================================================

interface RpcSelectorProps {
  t: ReturnType<typeof useTranslation>['t']
  rpc: RpcState
  onRpcChange: (patch: Partial<RpcState> | ((p: RpcState) => RpcState)) => void
}

const RpcSelector: React.FC<RpcSelectorProps> = ({ t, rpc, onRpcChange }) => {
  const kinds: RpcProviderKind[] = ['wallet', 'infura', 'alchemy', 'custom']
  const activeUrlField = rpc.kind === 'wallet' ? null : rpc.kind

  return (
    <Card>
      <div className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">
        {t('rpc.title')}
      </div>
      <div className="flex gap-2 flex-wrap">
        {kinds.map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => onRpcChange({ kind: k })}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              rpc.kind === k
                ? 'bg-indigo-600 text-white border-transparent'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-indigo-400'
            }`}
          >
            {t(`rpc.kind.${k}`)}
          </button>
        ))}
      </div>
      {activeUrlField && (
        <div className="mt-3 space-y-1">
          <label className="block text-xs text-gray-600 dark:text-gray-300">
            {t(`rpc.url${capitalize(activeUrlField)}` as 'rpc.urlInfura')}
          </label>
          <Input
            value={rpc.urls[activeUrlField]}
            onChange={(e) =>
              onRpcChange((prev) => ({
                ...prev,
                urls: { ...prev.urls, [activeUrlField]: e.target.value.trim() },
              }))
            }
            placeholder={t(`rpc.urlPlaceholder${capitalize(activeUrlField)}` as 'rpc.urlPlaceholderInfura')}
            className="font-mono text-xs"
          />
        </div>
      )}
    </Card>
  )
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

// =========================================================
// Storage Panel - DataVault
// =========================================================

interface StoragePanelProps {
  t: ReturnType<typeof useTranslation>['t']
  contracts: Contracts
  contractsDraft: Contracts
  setContractsDraft: (c: Contracts) => void
  onSaveContracts: () => void
  contractsSaved: boolean
  rpc: RpcState
  onRpcChange: (patch: Partial<RpcState> | ((p: RpcState) => RpcState)) => void
  effectiveRpcConfig: RpcConfig
  account: string | null
  isSepolia: boolean
}

const StoragePanel: React.FC<StoragePanelProps> = ({
  t,
  contracts,
  contractsDraft,
  setContractsDraft,
  onSaveContracts,
  contractsSaved,
  rpc,
  onRpcChange,
  effectiveRpcConfig,
  account,
  isSepolia,
}) => {
  const [keyInput, setKeyInput] = useState('')
  const [valueInput, setValueInput] = useState('')
  const [encryptOnWrite, setEncryptOnWrite] = useState(false)
  const [writePassword, setWritePassword] = useState('')
  const [writing, setWriting] = useState(false)
  const [writeError, setWriteError] = useState<string | null>(null)
  const [txHash, setTxHash] = useState<string | null>(null)

  const [readKey, setReadKey] = useState('')
  const [reading, setReading] = useState(false)
  const [readError, setReadError] = useState<string | null>(null)
  const [readResult, setReadResult] = useState<{
    author: string
    updatedAt: number
    raw: string
    text: string
  } | null>(null)
  const [decryptPassword, setDecryptPassword] = useState('')
  const [decrypted, setDecrypted] = useState<string | null>(null)
  const [decryptError, setDecryptError] = useState<string | null>(null)

  const hasVault = isAddress(contracts.dataVault) && contracts.dataVault !== DEFAULT_CONTRACTS.dataVault

  const handleWrite = async () => {
    setWriteError(null)
    setTxHash(null)
    if (!hasVault) {
      setWriteError(t('storage.needVaultAddress'))
      return
    }
    if (!keyInput.trim() || !valueInput) {
      setWriteError(t('errors.emptyField'))
      return
    }
    if (!account) {
      setWriteError(t('errors.noWallet'))
      return
    }
    if (!isSepolia) {
      setWriteError(t('errors.notSepolia'))
      return
    }
    setWriting(true)
    try {
      const key = ensureBytes32FromString(keyInput.trim())
      let valueHex: string
      if (encryptOnWrite) {
        if (!writePassword) throw new Error(t('errors.emptyField'))
        valueHex = await encrypt(valueInput, writePassword)
      } else {
        valueHex = hexlify(toUtf8Bytes(valueInput))
      }
      const browserProvider = await makeWalletProvider()
      const signer = await browserProvider.getSigner()
      const contract = new Contract(contracts.dataVault, DATA_VAULT_ABI, signer)
      const tx = await contract.setEntry(key, valueHex)
      setTxHash(tx.hash)
      await tx.wait()
    } catch (e: unknown) {
      const err = e as { code?: number | string; message?: string }
      if (err?.code === 4001 || err?.code === 'ACTION_REJECTED') {
        setWriteError(t('errors.userRejected'))
      } else {
        setWriteError(err?.message || t('errors.generic'))
      }
    } finally {
      setWriting(false)
    }
  }

  const handleRead = async () => {
    setReadError(null)
    setReadResult(null)
    setDecrypted(null)
    setDecryptError(null)
    if (!hasVault) {
      setReadError(t('storage.needVaultAddress'))
      return
    }
    if (!readKey.trim()) {
      setReadError(t('errors.emptyField'))
      return
    }
    setReading(true)
    try {
      const key = ensureBytes32FromString(readKey.trim())
      const contract = makeReadContract(contracts.dataVault, DATA_VAULT_ABI, effectiveRpcConfig)
      const [author, updatedAt, value] = (await contract.getEntry(key)) as [
        string,
        bigint,
        string,
      ]
      const raw = value
      const text = decodeBytesAsText(raw)
      setReadResult({
        author,
        updatedAt: Number(updatedAt),
        raw,
        text,
      })
    } catch (e: unknown) {
      setReadError((e as Error).message)
    } finally {
      setReading(false)
    }
  }

  const handleDecrypt = async () => {
    setDecryptError(null)
    if (!readResult) return
    try {
      const pt = await decrypt(readResult.raw, decryptPassword)
      setDecrypted(pt)
    } catch (e: unknown) {
      setDecryptError((e as Error).message)
    }
  }

  return (
    <div className="space-y-4">
      <ContractsEditor
        t={t}
        contractsDraft={contractsDraft}
        setContractsDraft={setContractsDraft}
        onSave={onSaveContracts}
        saved={contractsSaved}
        which="vault"
        addressInEffect={contracts.dataVault}
      />

      <RpcSelector t={t} rpc={rpc} onRpcChange={onRpcChange} />

      <div className="grid md:grid-cols-2 gap-4">
        {/* Write */}
        <Card>
          <div className="flex items-center gap-2 mb-3">
            <Layers className="w-4 h-4 text-indigo-500" />
            <div className="text-sm font-semibold text-gray-700 dark:text-gray-200">
              {t('storage.sectionWrite')}
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">
                {t('storage.keyLabel')}
              </label>
              <Input
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                placeholder={t('storage.keyPlaceholder')}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">
                {t('storage.valueLabel')}
              </label>
              <TextArea
                value={valueInput}
                onChange={(e) => setValueInput(e.target.value)}
                placeholder={t('storage.valuePlaceholder')}
                rows={3}
              />
            </div>
            <label className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-200">
              <input
                type="checkbox"
                checked={encryptOnWrite}
                onChange={(e) => setEncryptOnWrite(e.target.checked)}
              />
              {t('storage.encryptBeforeWrite')}
            </label>
            {encryptOnWrite && (
              <Input
                type="password"
                value={writePassword}
                onChange={(e) => setWritePassword(e.target.value)}
                placeholder={t('storage.password')}
              />
            )}
            <Button
              onClick={handleWrite}
              disabled={writing || !account || !isSepolia}
              className="w-full"
            >
              {writing ? (
                <span className="inline-flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t('storage.writing')}
                </span>
              ) : (
                t('storage.write')
              )}
            </Button>
            {writeError && (
              <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-2.5 text-xs text-red-700 dark:text-red-300 flex items-start gap-2">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span className="break-words">{writeError}</span>
              </div>
            )}
            {txHash && (
              <TxResultBar t={t} hash={txHash} confirmed={!writing} />
            )}
          </div>
        </Card>

        {/* Read */}
        <Card>
          <div className="flex items-center gap-2 mb-3">
            <Unlock className="w-4 h-4 text-emerald-500" />
            <div className="text-sm font-semibold text-gray-700 dark:text-gray-200">
              {t('storage.sectionRead')}
            </div>
          </div>
          <div className="space-y-3">
            <Input
              value={readKey}
              onChange={(e) => setReadKey(e.target.value)}
              placeholder={t('storage.keyPlaceholder')}
            />
            <Button onClick={handleRead} disabled={reading} className="w-full" variant="secondary">
              {reading ? (
                <span className="inline-flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t('storage.reading')}
                </span>
              ) : (
                <span className="inline-flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4" />
                  {t('storage.readBtn')}
                </span>
              )}
            </Button>
            {readError && (
              <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-2.5 text-xs text-red-700 dark:text-red-300 flex items-start gap-2">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span className="break-words">{readError}</span>
              </div>
            )}
            {readResult && (
              <div className="rounded-lg border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/50 dark:bg-emerald-900/10 p-3 space-y-2 text-xs">
                <div>
                  <span className="text-gray-500">{t('storage.resultAuthor')}:</span>{' '}
                  <span className="font-mono break-all">{readResult.author}</span>
                </div>
                <div>
                  <span className="text-gray-500">{t('storage.resultUpdatedAt')}:</span>{' '}
                  <span className="font-mono">
                    {readResult.updatedAt
                      ? new Date(readResult.updatedAt * 1000).toLocaleString()
                      : '—'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">{t('storage.resultRaw')}:</span>
                  <div className="font-mono break-all text-[11px] mt-0.5">{readResult.raw}</div>
                </div>
                <div>
                  <span className="text-gray-500">{t('storage.resultDecoded')}:</span>
                  <div className="font-mono break-all text-[11px] mt-0.5">
                    {readResult.text || <em className="text-gray-400">—</em>}
                  </div>
                </div>

                {isDxncEnvelope(readResult.raw) && (
                  <div className="mt-2 pt-2 border-t border-emerald-200 dark:border-emerald-900/40 space-y-2">
                    <div className="text-gray-600 dark:text-gray-300">
                      <Lock className="w-3 h-3 inline mr-1" />
                      {t('storage.tryDecrypt')}
                    </div>
                    <Input
                      type="password"
                      value={decryptPassword}
                      onChange={(e) => setDecryptPassword(e.target.value)}
                      placeholder={t('storage.password')}
                    />
                    <Button onClick={handleDecrypt} size="sm">
                      {t('storage.decrypt')}
                    </Button>
                    {decryptError && (
                      <div className="text-red-600 dark:text-red-400">{decryptError}</div>
                    )}
                    {decrypted && (
                      <div className="rounded border border-emerald-300 dark:border-emerald-800 bg-white/70 dark:bg-gray-900/50 p-2">
                        <div className="text-gray-500 mb-1">{t('storage.decrypted')}:</div>
                        <div className="font-mono break-all text-[11px]">{decrypted}</div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}

// =========================================================
// Tx result bar
// =========================================================

const TxResultBar: React.FC<{
  t: ReturnType<typeof useTranslation>['t']
  hash: string
  confirmed: boolean
}> = ({ t, hash, confirmed }) => {
  return (
    <div className="rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-3 text-xs space-y-1">
      <div className="flex items-center gap-1.5 text-green-700 dark:text-green-300 font-semibold">
        <CheckCircle2 className="w-4 h-4" />
        {confirmed ? t('storage.txConfirmed') : t('storage.txSubmitted')}
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <code className="font-mono break-all">{shortAddr(hash, 10, 8)}</code>
        <a
          href={etherscanTx(hash)}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline ml-auto"
        >
          {t('storage.viewTx')}
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  )
}

// =========================================================
// Event Log Panel - DataLogger + The Graph
// =========================================================

interface EventLogPanelProps {
  t: ReturnType<typeof useTranslation>['t']
  contracts: Contracts
  contractsDraft: Contracts
  setContractsDraft: (c: Contracts) => void
  onSaveContracts: () => void
  contractsSaved: boolean
  account: string | null
  isSepolia: boolean
}

const EventLogPanel: React.FC<EventLogPanelProps> = ({
  t,
  contracts,
  contractsDraft,
  setContractsDraft,
  onSaveContracts,
  contractsSaved,
  account,
  isSepolia,
}) => {
  const [topicInput, setTopicInput] = useState('')
  const [payloadInput, setPayloadInput] = useState('')
  const [encryptOnWrite, setEncryptOnWrite] = useState(false)
  const [writePassword, setWritePassword] = useState('')
  const [useTagged, setUseTagged] = useState(false)
  const [tagInput, setTagInput] = useState('')
  const [writing, setWriting] = useState(false)
  const [writeError, setWriteError] = useState<string | null>(null)
  const [txHash, setTxHash] = useState<string | null>(null)

  const [subgraphEndpoint, setSubgraphEndpoint] = useState<string>(() => {
    if (typeof window === 'undefined') return ''
    return window.localStorage.getItem(SUBGRAPH_STORAGE_KEY) ?? ''
  })
  const [filterTopic, setFilterTopic] = useState('')
  const [count, setCount] = useState(20)
  const [querying, setQuerying] = useState(false)
  const [queryError, setQueryError] = useState<string | null>(null)
  const [logs, setLogs] = useState<SubgraphLog[]>([])

  const [decryptPassword, setDecryptPassword] = useState('')
  const [decryptResults, setDecryptResults] = useState<Record<string, string>>({})
  const [decrypting, setDecrypting] = useState(false)

  const hasLogger =
    isAddress(contracts.dataLogger) && contracts.dataLogger !== DEFAULT_CONTRACTS.dataLogger

  const persistSubgraph = (v: string) => {
    setSubgraphEndpoint(v)
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(SUBGRAPH_STORAGE_KEY, v)
      } catch {
        // ignore
      }
    }
  }

  const handleWrite = async () => {
    setWriteError(null)
    setTxHash(null)
    if (!hasLogger) {
      setWriteError(t('storage.needVaultAddress'))
      return
    }
    if (!topicInput.trim() || !payloadInput) {
      setWriteError(t('errors.emptyField'))
      return
    }
    if (!account) {
      setWriteError(t('errors.noWallet'))
      return
    }
    if (!isSepolia) {
      setWriteError(t('errors.notSepolia'))
      return
    }
    setWriting(true)
    try {
      const topic = ensureBytes32FromString(topicInput.trim())
      let payload: string
      if (encryptOnWrite) {
        if (!writePassword) throw new Error(t('errors.emptyField'))
        payload = await encrypt(payloadInput, writePassword)
      } else {
        payload = hexlify(toUtf8Bytes(payloadInput))
      }
      const provider = await makeWalletProvider()
      const signer = await provider.getSigner()
      const contract = new Contract(contracts.dataLogger, DATA_LOGGER_ABI, signer)
      const tx = useTagged
        ? await contract.logTagged(topic, tagInput, payload)
        : await contract.log(topic, payload)
      setTxHash(tx.hash)
      await tx.wait()
    } catch (e: unknown) {
      const err = e as { code?: number | string; message?: string }
      if (err?.code === 4001 || err?.code === 'ACTION_REJECTED') {
        setWriteError(t('errors.userRejected'))
      } else {
        setWriteError(err?.message || t('errors.generic'))
      }
    } finally {
      setWriting(false)
    }
  }

  const handleQuery = async () => {
    setQueryError(null)
    setLogs([])
    setDecryptResults({})
    if (!subgraphEndpoint) {
      setQueryError(t('errors.emptyField'))
      return
    }
    setQuerying(true)
    try {
      if (filterTopic.trim()) {
        const topic = ensureBytes32FromString(filterTopic.trim())
        const data = await querySubgraph<RecentLogsResult>(
          subgraphEndpoint,
          GET_LOGS_BY_TOPIC,
          { topic, first: count }
        )
        setLogs(data.dataLoggeds || [])
      } else {
        const data = await querySubgraph<RecentLogsResult>(
          subgraphEndpoint,
          GET_RECENT_LOGS,
          { first: count }
        )
        setLogs(data.dataLoggeds || [])
      }
    } catch (e: unknown) {
      setQueryError((e as Error).message)
    } finally {
      setQuerying(false)
    }
  }

  const handleBatchDecrypt = async () => {
    if (!decryptPassword) return
    setDecrypting(true)
    const next: Record<string, string> = {}
    for (const l of logs) {
      if (isDxncEnvelope(l.payload)) {
        try {
          next[l.id] = await decrypt(l.payload, decryptPassword)
        } catch {
          next[l.id] = '✗'
        }
      } else {
        next[l.id] = decodeBytesAsText(l.payload) || '(plain)'
      }
    }
    setDecryptResults(next)
    setDecrypting(false)
  }

  return (
    <div className="space-y-4">
      <ContractsEditor
        t={t}
        contractsDraft={contractsDraft}
        setContractsDraft={setContractsDraft}
        onSave={onSaveContracts}
        saved={contractsSaved}
        which="logger"
        addressInEffect={contracts.dataLogger}
      />

      <div className="grid md:grid-cols-2 gap-4">
        {/* Write */}
        <Card>
          <div className="flex items-center gap-2 mb-3">
            <Radio className="w-4 h-4 text-indigo-500" />
            <div className="text-sm font-semibold text-gray-700 dark:text-gray-200">
              {t('logs.sectionWrite')}
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">
                {t('logs.topicLabel')}
              </label>
              <Input
                value={topicInput}
                onChange={(e) => setTopicInput(e.target.value)}
                placeholder={t('logs.topicPlaceholder')}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">
                {t('logs.payloadLabel')}
              </label>
              <TextArea
                value={payloadInput}
                onChange={(e) => setPayloadInput(e.target.value)}
                placeholder={t('logs.payloadPlaceholder')}
                rows={3}
              />
            </div>
            <label className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-200">
              <input
                type="checkbox"
                checked={encryptOnWrite}
                onChange={(e) => setEncryptOnWrite(e.target.checked)}
              />
              {t('logs.encryptBeforeWrite')}
            </label>
            {encryptOnWrite && (
              <Input
                type="password"
                value={writePassword}
                onChange={(e) => setWritePassword(e.target.value)}
                placeholder={t('logs.password')}
              />
            )}
            <label className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-200">
              <input
                type="checkbox"
                checked={useTagged}
                onChange={(e) => setUseTagged(e.target.checked)}
              />
              {t('logs.useLogTagged')}
            </label>
            {useTagged && (
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder={t('logs.tagLabel')}
              />
            )}
            <Button
              onClick={handleWrite}
              disabled={writing || !account || !isSepolia}
              className="w-full"
            >
              {writing ? (
                <span className="inline-flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t('logs.writing')}
                </span>
              ) : (
                t('logs.write')
              )}
            </Button>
            {writeError && (
              <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-2.5 text-xs text-red-700 dark:text-red-300 flex items-start gap-2">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span className="break-words">{writeError}</span>
              </div>
            )}
            {txHash && <TxResultBar t={t} hash={txHash} confirmed={!writing} />}
          </div>
        </Card>

        {/* Read via The Graph */}
        <Card>
          <div className="flex items-center gap-2 mb-3">
            <Network className="w-4 h-4 text-emerald-500" />
            <div className="text-sm font-semibold text-gray-700 dark:text-gray-200">
              {t('logs.sectionRead')}
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">
                {t('logs.subgraphEndpoint')}
              </label>
              <Input
                value={subgraphEndpoint}
                onChange={(e) => persistSubgraph(e.target.value.trim())}
                placeholder={t('logs.subgraphPlaceholder')}
                className="font-mono text-xs"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">
                  {t('logs.filterByTopic')}
                </label>
                <Input
                  value={filterTopic}
                  onChange={(e) => setFilterTopic(e.target.value)}
                  placeholder={t('logs.topicPlaceholder')}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">
                  {t('logs.count')}
                </label>
                <Input
                  type="number"
                  value={String(count)}
                  onChange={(e) => setCount(Math.max(1, Math.min(200, Number(e.target.value) || 20)))}
                />
              </div>
            </div>
            <Button
              onClick={handleQuery}
              disabled={querying}
              className="w-full"
              variant="secondary"
            >
              {querying ? (
                <span className="inline-flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t('logs.subgraphFetching')}
                </span>
              ) : (
                t('logs.subgraphFetch')
              )}
            </Button>
            {queryError && (
              <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-2.5 text-xs text-red-700 dark:text-red-300 flex items-start gap-2">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span className="break-words">{queryError}</span>
              </div>
            )}
            {logs.length > 0 && (
              <div className="flex items-center gap-2">
                <Input
                  type="password"
                  value={decryptPassword}
                  onChange={(e) => setDecryptPassword(e.target.value)}
                  placeholder={t('logs.tryDecrypt')}
                />
                <Button onClick={handleBatchDecrypt} size="sm" disabled={decrypting}>
                  <Lock className="w-3.5 h-3.5" />
                </Button>
              </div>
            )}
            {logs.length === 0 && !querying && !queryError && (
              <div className="text-xs text-gray-500 dark:text-gray-400">{t('logs.empty')}</div>
            )}
          </div>
        </Card>
      </div>

      {logs.length > 0 && (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                  <th className="py-2 pr-3">{t('logs.columnTopic')}</th>
                  <th className="py-2 pr-3">{t('logs.columnAuthor')}</th>
                  <th className="py-2 pr-3">{t('logs.columnTime')}</th>
                  <th className="py-2 pr-3">{t('logs.columnPayload')}</th>
                  <th className="py-2 pr-3">{t('logs.columnTx')}</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((l) => {
                  const decoded =
                    decryptResults[l.id] ??
                    (isDxncEnvelope(l.payload) ? '(DXNC)' : decodeBytesAsText(l.payload) || '—')
                  return (
                    <tr
                      key={l.id}
                      className="border-b border-gray-100 dark:border-gray-800 align-top"
                    >
                      <td className="py-2 pr-3 font-mono break-all max-w-[160px]">
                        {shortAddr(l.topic, 10, 8)}
                      </td>
                      <td className="py-2 pr-3 font-mono break-all max-w-[160px]">
                        {shortAddr(l.author, 6, 4)}
                      </td>
                      <td className="py-2 pr-3 whitespace-nowrap">
                        {new Date(Number(l.timestamp) * 1000).toLocaleString()}
                      </td>
                      <td className="py-2 pr-3 break-all max-w-[240px]">{decoded}</td>
                      <td className="py-2 pr-3">
                        <a
                          href={etherscanTx(l.tx)}
                          target="_blank"
                          rel="noreferrer"
                          className="text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1"
                        >
                          {shortAddr(l.tx, 6, 4)}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}

// =========================================================
// Cipher Panel - standalone DXNC encrypt/decrypt playground
// =========================================================

const CipherPanel: React.FC<{ t: ReturnType<typeof useTranslation>['t'] }> = ({ t }) => {
  const [plaintext, setPlaintext] = useState('')
  const [password, setPassword] = useState('')
  const [ciphertext, setCiphertext] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState<'enc' | 'dec' | null>(null)
  const [copied, setCopied] = useState<'pt' | 'ct' | null>(null)

  const handleEncrypt = async () => {
    setError(null)
    setBusy('enc')
    try {
      const hex = await encrypt(plaintext, password)
      setCiphertext(hex)
    } catch (e: unknown) {
      setError((e as Error).message)
    } finally {
      setBusy(null)
    }
  }

  const handleDecrypt = async () => {
    setError(null)
    setBusy('dec')
    try {
      const pt = await decrypt(ciphertext, password)
      setPlaintext(pt)
    } catch (e: unknown) {
      setError((e as Error).message)
    } finally {
      setBusy(null)
    }
  }

  const handleCopy = (which: 'pt' | 'ct') => {
    const text = which === 'pt' ? plaintext : ciphertext
    try {
      navigator.clipboard?.writeText(text)
      setCopied(which)
      setTimeout(() => setCopied(null), 1200)
    } catch {
      // ignore
    }
  }

  return (
    <div className="space-y-4">
      <NoticeCard tone="warning" icon={AlertTriangle} title={t('cipher.warning')} />
      <Card>
        <div className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1 flex items-center gap-2">
          <Lock className="w-4 h-4" />
          {t('cipher.title')}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400 mb-3">{t('cipher.intro')}</div>
        <div className="grid md:grid-cols-2 gap-4 items-stretch">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs text-gray-600 dark:text-gray-300">
                {t('cipher.plaintext')}
              </label>
              <button
                type="button"
                className="text-[11px] text-gray-500 hover:text-indigo-500"
                onClick={() => handleCopy('pt')}
              >
                <Copy className="w-3 h-3 inline" />{' '}
                {copied === 'pt' ? t('cipher.copied') : t('cipher.copy')}
              </button>
            </div>
            <TextArea
              value={plaintext}
              onChange={(e) => setPlaintext(e.target.value)}
              placeholder={t('cipher.plaintextPlaceholder')}
              rows={6}
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs text-gray-600 dark:text-gray-300">
                {t('cipher.ciphertext')}
              </label>
              <button
                type="button"
                className="text-[11px] text-gray-500 hover:text-indigo-500"
                onClick={() => handleCopy('ct')}
              >
                <Copy className="w-3 h-3 inline" />{' '}
                {copied === 'ct' ? t('cipher.copied') : t('cipher.copy')}
              </button>
            </div>
            <TextArea
              value={ciphertext}
              onChange={(e) => setCiphertext(e.target.value.trim())}
              placeholder={t('cipher.ciphertextPlaceholder')}
              rows={6}
              className="font-mono text-xs"
            />
          </div>
        </div>
        <div className="mt-3 grid md:grid-cols-2 gap-3 items-center">
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t('cipher.passwordPlaceholder')}
          />
          <div className="flex items-center gap-2 justify-end">
            <Button onClick={handleEncrypt} disabled={busy !== null || !password}>
              {busy === 'enc' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  {t('cipher.encrypt')}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
            <Button onClick={handleDecrypt} disabled={busy !== null || !password} variant="secondary">
              {busy === 'dec' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <ArrowLeft className="w-4 h-4" />
                  {t('cipher.decrypt')}
                </>
              )}
            </Button>
          </div>
        </div>
        {error && (
          <div className="mt-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-2.5 text-xs text-red-700 dark:text-red-300 flex items-start gap-2">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <span className="break-words">
              {t('cipher.error')}: {error}
            </span>
          </div>
        )}
      </Card>
    </div>
  )
}

// =========================================================
// Contracts Panel - source code & deployment docs
// =========================================================

const ContractsPanel: React.FC<{ t: ReturnType<typeof useTranslation>['t'] }> = ({ t }) => {
  const copyLabel = t('contracts.copy')
  const copiedLabel = t('contracts.copied')

  return (
    <div className="space-y-4">
      <NoticeCard tone="info" icon={FileCode} title={t('contracts.intro')} />
      <CodeBlock
        title={t('contracts.dataVault')}
        code={SOURCE_DATA_VAULT_SOL}
        language="solidity"
        copyLabel={copyLabel}
        copiedLabel={copiedLabel}
      />
      <CodeBlock
        title={t('contracts.dataLogger')}
        code={SOURCE_DATA_LOGGER_SOL}
        language="solidity"
        copyLabel={copyLabel}
        copiedLabel={copiedLabel}
      />
      <div className="grid md:grid-cols-2 gap-4">
        <CodeBlock
          title={t('contracts.hardhatConfig')}
          code={SOURCE_HARDHAT_CONFIG}
          language="ts"
          copyLabel={copyLabel}
          copiedLabel={copiedLabel}
        />
        <CodeBlock
          title={t('contracts.deployScript')}
          code={SOURCE_DEPLOY_SCRIPT}
          language="ts"
          copyLabel={copyLabel}
          copiedLabel={copiedLabel}
        />
      </div>
      <CodeBlock
        title={t('contracts.deployReadme')}
        code={SOURCE_DEPLOY_README}
        language="md"
        copyLabel={copyLabel}
        copiedLabel={copiedLabel}
      />
      <div className="grid md:grid-cols-2 gap-4">
        <CodeBlock
          title={t('contracts.subgraphYaml')}
          code={SOURCE_SUBGRAPH_YAML}
          language="yaml"
          copyLabel={copyLabel}
          copiedLabel={copiedLabel}
        />
        <CodeBlock
          title={t('contracts.subgraphSchema')}
          code={SOURCE_SUBGRAPH_SCHEMA}
          language="graphql"
          copyLabel={copyLabel}
          copiedLabel={copiedLabel}
        />
      </div>
      <CodeBlock
        title={t('contracts.subgraphMapping')}
        code={SOURCE_SUBGRAPH_MAPPING}
        language="ts"
        copyLabel={copyLabel}
        copiedLabel={copiedLabel}
      />
      <CodeBlock
        title={t('contracts.subgraphReadme')}
        code={SOURCE_SUBGRAPH_README}
        language="md"
        copyLabel={copyLabel}
        copiedLabel={copiedLabel}
      />
      <CodeBlock
        title={t('contracts.graphqlExample')}
        code={SOURCE_GRAPHQL_QUERY_EXAMPLE}
        language="graphql"
        copyLabel={copyLabel}
        copiedLabel={copiedLabel}
      />
      <div className="text-[11px] text-gray-500 dark:text-gray-400">
        Sepolia Chain ID: {SEPOLIA_CHAIN_ID_DEC} · {SEPOLIA_CHAIN_ID}
      </div>
    </div>
  )
}
