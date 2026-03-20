import React, { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'

function ipToNum(ip: string): number {
  return ip.split('.').reduce((acc, oct) => (acc << 8) + parseInt(oct), 0) >>> 0
}

function numToIp(num: number): string {
  return [
    (num >>> 24) & 0xff,
    (num >>> 16) & 0xff,
    (num >>> 8) & 0xff,
    num & 0xff,
  ].join('.')
}

function calcPool(network: string, mask: number, startOffset: number, endOffset: number) {
  const networkNum = ipToNum(network) & (~((1 << (32 - mask)) - 1) >>> 0)
  const total = Math.pow(2, 32 - mask)
  const networkAddr = networkNum
  const broadcastAddr = networkNum + total - 1
  const firstHost = networkNum + 1
  const lastHost = broadcastAddr - 1
  const poolStart = Math.max(firstHost, networkNum + startOffset)
  const poolEnd = Math.min(lastHost, networkNum + endOffset)
  const poolSize = poolEnd >= poolStart ? poolEnd - poolStart + 1 : 0
  return {
    networkAddr: numToIp(networkAddr),
    broadcastAddr: numToIp(broadcastAddr),
    firstHost: numToIp(firstHost),
    lastHost: numToIp(lastHost),
    poolStart: numToIp(poolStart),
    poolEnd: numToIp(poolEnd),
    poolSize,
    total: total - 2,
    utilization: total > 2 ? Math.round((poolSize / (total - 2)) * 100) : 0,
  }
}

export function DhcpPoolCalc() {
  const { t } = useTranslation('toolDhcpPoolCalc')
  const [cidr, setCidr] = useState('192.168.1.0/24')
  const [startOffset, setStartOffset] = useState(100)
  const [endOffset, setEndOffset] = useState(200)
  const [result, setResult] = useState<ReturnType<typeof calcPool> | null>(null)
  const [error, setError] = useState('')

  const calculate = useCallback(() => {
    setError('')
    try {
      const [network, maskStr] = cidr.trim().split('/')
      const mask = parseInt(maskStr)
      if (!network || isNaN(mask) || mask < 1 || mask > 30) throw new Error('无效的 CIDR')
      const octets = network.split('.')
      if (octets.length !== 4 || octets.some(o => isNaN(parseInt(o)) || parseInt(o) > 255)) throw new Error('无效的 IP 地址')
      const total = Math.pow(2, 32 - mask)
      if (startOffset < 1 || endOffset >= total - 1 || startOffset > endOffset) throw new Error('偏移量超出范围')
      setResult(calcPool(network, mask, startOffset, endOffset))
    } catch (e: any) {
      setError(e.message)
    }
  }, [cidr, startOffset, endOffset])

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">DHCP 地址池计算器</h1>
      <p className="text-gray-500 dark:text-gray-400">输入网段和地址池范围，自动计算可用 IP 数量</p>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">网段 (CIDR)</label>
          <input
            type="text"
            value={cidr}
            onChange={e => setCidr(e.target.value)}
            placeholder="192.168.1.0/24"
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">起始偏移量</label>
            <input
              type="number"
              value={startOffset}
              onChange={e => setStartOffset(parseInt(e.target.value))}
              min={1}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">结束偏移量</label>
            <input
              type="number"
              value={endOffset}
              onChange={e => setEndOffset(parseInt(e.target.value))}
              min={1}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button
          onClick={calculate}
          className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
        >
          计算
        </button>
      </div>

      {result && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 space-y-3">
          <h2 className="font-semibold text-gray-900 dark:text-gray-100">计算结果</h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {[
              ['网络地址', result.networkAddr],
              ['广播地址', result.broadcastAddr],
              ['首个主机', result.firstHost],
              ['最后主机', result.lastHost],
              ['地址池起始', result.poolStart],
              ['地址池结束', result.poolEnd],
            ].map(([label, val]) => (
              <div key={label} className="flex justify-between bg-gray-50 dark:bg-gray-700/50 rounded-lg px-3 py-2">
                <span className="text-gray-500 dark:text-gray-400">{label}</span>
                <span className="font-mono font-medium text-gray-900 dark:text-gray-100">{val}</span>
              </div>
            ))}
          </div>
          <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg px-4 py-3 flex items-center justify-between">
            <span className="text-indigo-700 dark:text-indigo-300 font-medium">可分配 IP 数量</span>
            <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{result.poolSize}</span>
          </div>
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-500 rounded-full transition-all"
              style={{ width: `${result.utilization}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 text-right">地址池占子网 {result.utilization}%（子网可用 {result.total} 个）</p>
        </div>
      )}
    </div>
  )
}
