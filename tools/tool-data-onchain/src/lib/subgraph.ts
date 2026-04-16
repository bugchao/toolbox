/**
 * The Graph GraphQL 查询封装。
 *
 * 链上事件通过 subgraph 索引后，可以用 GraphQL 从 The Graph 读取。
 * 这里提供：
 *   - `querySubgraph`：通用 POST GraphQL 请求
 *   - `GET_RECENT_LOGS`：读取最近 N 条 DataLogged 事件
 *   - `GET_LOGS_BY_TOPIC`：按 topic 过滤
 */

export interface SubgraphLog {
  id: string
  topic: string
  author: string
  timestamp: string
  payload: string
  tx: string
  block: string
}

export interface SubgraphResponse<T> {
  data?: T
  errors?: Array<{ message: string }>
}

export async function querySubgraph<T = unknown>(
  endpoint: string,
  query: string,
  variables: Record<string, unknown> = {}
): Promise<T> {
  if (!endpoint) throw new Error('请先填写 subgraph endpoint')
  const resp = await fetch(endpoint, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  })
  if (!resp.ok) {
    throw new Error(`subgraph HTTP ${resp.status}`)
  }
  const json = (await resp.json()) as SubgraphResponse<T>
  if (json.errors && json.errors.length > 0) {
    throw new Error(json.errors.map((e) => e.message).join('\n'))
  }
  if (!json.data) throw new Error('subgraph 返回空 data')
  return json.data
}

export const GET_RECENT_LOGS = /* GraphQL */ `
  query RecentLogs($first: Int!) {
    dataLoggeds(first: $first, orderBy: timestamp, orderDirection: desc) {
      id
      topic
      author
      timestamp
      payload
      tx: transactionHash
      block: blockNumber
    }
  }
`

export const GET_LOGS_BY_TOPIC = /* GraphQL */ `
  query LogsByTopic($topic: Bytes!, $first: Int!) {
    dataLoggeds(
      first: $first
      where: { topic: $topic }
      orderBy: timestamp
      orderDirection: desc
    ) {
      id
      topic
      author
      timestamp
      payload
      tx: transactionHash
      block: blockNumber
    }
  }
`

export interface RecentLogsResult {
  dataLoggeds: SubgraphLog[]
}
