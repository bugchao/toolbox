/**
 * 合约地址与 ABI。
 *
 * 这里默认给出可覆盖的地址：Sepolia 上部署的 DataVault / DataLogger。
 * 用户可以通过 UI 输入框覆盖为自己用 Hardhat 部署并在 Sepolia Etherscan 开源验证后的合约地址。
 */

export const SEPOLIA_CHAIN_ID = '0xaa36a7' // 11155111
export const SEPOLIA_CHAIN_ID_DEC = 11155111

export interface Contracts {
  dataVault: string
  dataLogger: string
}

const STORAGE_KEY = 'toolbox:tool-data-onchain:contracts'

/** 可覆盖的默认值：开发者可在部署后替换 */
export const DEFAULT_CONTRACTS: Contracts = {
  dataVault: '0x0000000000000000000000000000000000000000',
  dataLogger: '0x0000000000000000000000000000000000000000',
}

export function readContracts(): Contracts {
  if (typeof window === 'undefined') return { ...DEFAULT_CONTRACTS }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...DEFAULT_CONTRACTS }
    const v = JSON.parse(raw) as Partial<Contracts>
    return {
      dataVault: v.dataVault || DEFAULT_CONTRACTS.dataVault,
      dataLogger: v.dataLogger || DEFAULT_CONTRACTS.dataLogger,
    }
  } catch {
    return { ...DEFAULT_CONTRACTS }
  }
}

export function writeContracts(c: Contracts): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(c))
  } catch {
    // ignore
  }
}

/** DataVault ABI：仅包含前端需要调用的方法 */
export const DATA_VAULT_ABI = [
  'function setEntry(bytes32 key, bytes value) external',
  'function getEntry(bytes32 key) external view returns (address author, uint256 updatedAt, bytes value)',
  'function totalKeys() external view returns (uint256)',
  'function keyAt(uint256 i) external view returns (bytes32)',
  'event EntryUpdated(bytes32 indexed key, address indexed author, uint256 updatedAt)',
]

/** DataLogger ABI：事件日志合约 */
export const DATA_LOGGER_ABI = [
  'function log(bytes32 topic, bytes payload) external',
  'function logTagged(bytes32 topic, string tag, bytes payload) external',
  'event DataLogged(bytes32 indexed topic, address indexed author, uint256 timestamp, bytes payload)',
  'event DataTagged(bytes32 indexed topic, address indexed author, string tag)',
]
