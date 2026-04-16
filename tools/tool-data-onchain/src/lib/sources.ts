/**
 * 合约 / Hardhat / subgraph 源码常量。
 *
 * 这些字符串会直接展示在 "合约与部署" Tab 中，方便使用者：
 *   - 将 .sol 源码复制到自己的 Hardhat 工程
 *   - 用 Hardhat 部署到 Sepolia
 *   - 在 sepolia.etherscan.io 上传源码做开源验证
 *   - 创建 subgraph 并用 The Graph 索引事件
 */

export const SOURCE_DATA_VAULT_SOL = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title DataVault - 直接存储模式
/// @notice 使用 mapping 存储密文或公开数据。
///         读取可通过 ethers.js / Infura / Alchemy 等 JSON-RPC 直接拿到当前值。
contract DataVault {
    struct Entry {
        address author;
        uint256 updatedAt;
        bytes value;
    }

    mapping(bytes32 => Entry) private _entries;
    bytes32[] private _keys;
    mapping(bytes32 => bool) private _known;

    event EntryUpdated(
        bytes32 indexed key,
        address indexed author,
        uint256 updatedAt
    );

    /// @notice 写入 / 更新一个条目。
    /// @param key   业务侧的键，建议用 keccak256(namespace || id) 保证不冲突
    /// @param value 原文或密文 (bytes)，对 16+ / 敏感内容请先用 DXNC 信封加密
    function setEntry(bytes32 key, bytes calldata value) external {
        _entries[key] = Entry({
            author: msg.sender,
            updatedAt: block.timestamp,
            value: value
        });
        if (!_known[key]) {
            _known[key] = true;
            _keys.push(key);
        }
        emit EntryUpdated(key, msg.sender, block.timestamp);
    }

    function getEntry(bytes32 key)
        external
        view
        returns (address author, uint256 updatedAt, bytes memory value)
    {
        Entry memory e = _entries[key];
        return (e.author, e.updatedAt, e.value);
    }

    function totalKeys() external view returns (uint256) {
        return _keys.length;
    }

    function keyAt(uint256 i) external view returns (bytes32) {
        return _keys[i];
    }
}
`

export const SOURCE_DATA_LOGGER_SOL = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title DataLogger - 日志事件模式
/// @notice 只通过事件记录数据，不写 storage，Gas 显著更低。
///         读取路径：The Graph 索引 -> GraphQL 查询。
contract DataLogger {
    event DataLogged(
        bytes32 indexed topic,
        address indexed author,
        uint256 timestamp,
        bytes payload
    );

    event DataTagged(
        bytes32 indexed topic,
        address indexed author,
        string tag
    );

    function log(bytes32 topic, bytes calldata payload) external {
        emit DataLogged(topic, msg.sender, block.timestamp, payload);
    }

    function logTagged(
        bytes32 topic,
        string calldata tag,
        bytes calldata payload
    ) external {
        emit DataTagged(topic, msg.sender, tag);
        emit DataLogged(topic, msg.sender, block.timestamp, payload);
    }
}
`

export const SOURCE_HARDHAT_CONFIG = `// hardhat.config.ts
import { HardhatUserConfig } from 'hardhat/config'
import '@nomicfoundation/hardhat-toolbox'
import '@nomicfoundation/hardhat-verify'
import * as dotenv from 'dotenv'
dotenv.config()

const SEPOLIA_RPC = process.env.SEPOLIA_RPC_URL || 'https://rpc.sepolia.org'
const PRIVATE_KEY = process.env.PRIVATE_KEY || ''
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || ''

const config: HardhatUserConfig = {
  solidity: {
    version: '0.8.24',
    settings: { optimizer: { enabled: true, runs: 200 } },
  },
  networks: {
    sepolia: {
      url: SEPOLIA_RPC,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      chainId: 11155111,
    },
  },
  etherscan: { apiKey: { sepolia: ETHERSCAN_API_KEY } },
}

export default config
`

export const SOURCE_DEPLOY_SCRIPT = `// scripts/deploy.ts
import { ethers, run } from 'hardhat'

async function main() {
  const [deployer] = await ethers.getSigners()
  console.log('deployer:', deployer.address)

  const Vault = await ethers.getContractFactory('DataVault')
  const vault = await Vault.deploy()
  await vault.waitForDeployment()
  const vaultAddr = await vault.getAddress()
  console.log('DataVault  @', vaultAddr)

  const Logger = await ethers.getContractFactory('DataLogger')
  const logger = await Logger.deploy()
  await logger.waitForDeployment()
  const loggerAddr = await logger.getAddress()
  console.log('DataLogger @', loggerAddr)

  // 等待几个区块再上传源码做开源验证
  await new Promise((r) => setTimeout(r, 30_000))

  try {
    await run('verify:verify', { address: vaultAddr, constructorArguments: [] })
    await run('verify:verify', { address: loggerAddr, constructorArguments: [] })
  } catch (e) {
    console.warn('verify failed (可稍后手动 verify):', (e as Error).message)
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
`

export const SOURCE_DEPLOY_README = `# 使用 Hardhat 部署到 Sepolia 并在 Etherscan 开源

## 1. 初始化工程
\`\`\`bash
mkdir data-onchain-contracts && cd data-onchain-contracts
npm init -y
npm i -D hardhat @nomicfoundation/hardhat-toolbox @nomicfoundation/hardhat-verify typescript ts-node dotenv
npx hardhat init  # 选 TypeScript project
\`\`\`

## 2. 放入合约
- 将 \`DataVault.sol\` / \`DataLogger.sol\` 放入 \`contracts/\`
- 将上面的 \`hardhat.config.ts\` 覆盖同名文件
- 将上面的 \`scripts/deploy.ts\` 放入 \`scripts/\`

## 3. 配置 .env
\`\`\`env
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/<YOUR_INFURA_KEY>
# 或 https://eth-sepolia.g.alchemy.com/v2/<YOUR_ALCHEMY_KEY>
PRIVATE_KEY=0x<你的测试钱包私钥>
ETHERSCAN_API_KEY=<etherscan_api_key>
\`\`\`

## 4. 领水 & 部署
- Sepolia 水龙头: https://sepoliafaucet.com / https://www.alchemy.com/faucets/ethereum-sepolia
\`\`\`bash
npx hardhat compile
npx hardhat run scripts/deploy.ts --network sepolia
\`\`\`
输出中会打印 \`DataVault\` / \`DataLogger\` 的 Sepolia 地址，并自动上传源码到 Etherscan。

## 5. 开源 & 验证
访问 https://sepolia.etherscan.io/address/<合约地址>，"Contract" 页签应该已经出现绿色对号和源码。
`

export const SOURCE_SUBGRAPH_YAML = `# subgraph.yaml
specVersion: 1.2.0
schema:
  file: ./schema.graphql
dataSources:
  - kind: ethereum
    name: DataLogger
    network: sepolia
    source:
      address: "0xYOUR_DATA_LOGGER_ADDRESS"
      abi: DataLogger
      startBlock: 0
    mapping:
      kind: ethereum/events
      apiVersion: 0.0.9
      language: wasm/assemblyscript
      entities:
        - DataLogged
        - DataTagged
      abis:
        - name: DataLogger
          file: ./abis/DataLogger.json
      eventHandlers:
        - event: DataLogged(indexed bytes32,indexed address,uint256,bytes)
          handler: handleDataLogged
        - event: DataTagged(indexed bytes32,indexed address,string)
          handler: handleDataTagged
      file: ./src/data-logger.ts
`

export const SOURCE_SUBGRAPH_SCHEMA = `# schema.graphql
type DataLogged @entity(immutable: true) {
  id: Bytes!
  topic: Bytes!
  author: Bytes!
  timestamp: BigInt!
  payload: Bytes!
  transactionHash: Bytes!
  blockNumber: BigInt!
}

type DataTagged @entity(immutable: true) {
  id: Bytes!
  topic: Bytes!
  author: Bytes!
  tag: String!
  transactionHash: Bytes!
  blockNumber: BigInt!
}
`

export const SOURCE_SUBGRAPH_MAPPING = `// src/data-logger.ts
import {
  DataLogged as DataLoggedEvent,
  DataTagged as DataTaggedEvent,
} from '../generated/DataLogger/DataLogger'
import { DataLogged, DataTagged } from '../generated/schema'

export function handleDataLogged(event: DataLoggedEvent): void {
  const id = event.transaction.hash.concatI32(event.logIndex.toI32())
  const e = new DataLogged(id)
  e.topic = event.params.topic
  e.author = event.params.author
  e.timestamp = event.params.timestamp
  e.payload = event.params.payload
  e.transactionHash = event.transaction.hash
  e.blockNumber = event.block.number
  e.save()
}

export function handleDataTagged(event: DataTaggedEvent): void {
  const id = event.transaction.hash.concatI32(event.logIndex.toI32())
  const e = new DataTagged(id)
  e.topic = event.params.topic
  e.author = event.params.author
  e.tag = event.params.tag
  e.transactionHash = event.transaction.hash
  e.blockNumber = event.block.number
  e.save()
}
`

export const SOURCE_SUBGRAPH_README = `# 用 The Graph 索引 DataLogger 事件

## 1. 安装 CLI
\`\`\`bash
npm i -g @graphprotocol/graph-cli
\`\`\`

## 2. 初始化 subgraph
\`\`\`bash
graph init \\
  --product hosted-service \\
  --from-contract 0xYOUR_DATA_LOGGER_ADDRESS \\
  --network sepolia \\
  --contract-name DataLogger \\
  <你的 GitHub 用户名>/data-onchain-logger
\`\`\`

## 3. 覆盖关键文件
把上面的 \`subgraph.yaml\` / \`schema.graphql\` / \`src/data-logger.ts\` 覆盖进工程，
并把 Hardhat 编译出来的 \`artifacts/contracts/DataLogger.sol/DataLogger.json\`
复制到 \`abis/DataLogger.json\`。

## 4. 部署到 The Graph Studio
\`\`\`bash
graph auth --studio <DEPLOY_KEY>
graph codegen && graph build
graph deploy --studio data-onchain-logger
\`\`\`

## 5. 查询示例
前端把 endpoint (例：https://api.studio.thegraph.com/query/<id>/data-onchain-logger/version/latest)
填入本工具 "事件日志 / The Graph" 面板即可。
`

export const SOURCE_GRAPHQL_QUERY_EXAMPLE = `query RecentLogs($first: Int!) {
  dataLoggeds(first: $first, orderBy: timestamp, orderDirection: desc) {
    id
    topic
    author
    timestamp
    payload
    transactionHash
    blockNumber
  }
}
`
