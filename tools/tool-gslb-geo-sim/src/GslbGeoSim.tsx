import React, { useState } from 'react'
import { MapPin, Globe } from 'lucide-react'

interface GeoRule {
  id: string
  region: string
  isp: string
  resolvedNode: string
  latency: number
  policy: 'nearest' | 'weighted' | 'failover'
}

interface DnsNode {
  id: string
  name: string
  ip: string
  region: string
  color: string
}

const NODES: DnsNode[] = [
  { id: 'sh', name: '上海节点', ip: '1.2.3.10', region: 'cn-east', color: '#6366f1' },
  { id: 'bj', name: '北京节点', ip: '1.2.3.20', region: 'cn-north', color: '#3b82f6' },
  { id: 'gz', name: '广州节点', ip: '1.2.3.30', region: 'cn-south', color: '#10b981' },
  { id: 'hk', name: '香港节点', ip: '1.2.3.40', region: 'hk', color: '#f59e0b' },
  { id: 'sg', name: '新加坡节点', ip: '1.2.3.50', region: 'sea', color: '#ec4899' },
  { id: 'us', name: '美国节点', ip: '1.2.3.60', region: 'us', color: '#8b5cf6' },
]

const GEO_RULES: GeoRule[] = [
  { id: '1', region: '华东（上海/江苏/浙江）', isp: '全部', resolvedNode: 'sh', latency: 8, policy: 'nearest' },
  { id: '2', region: '华北（北京/河北/山东）', isp: '全部', resolvedNode: 'bj', latency: 12, policy: 'nearest' },
  { id: '3', region: '华南（广东/广西/福建）', isp: '全部', resolvedNode: 'gz', latency: 10, policy: 'nearest' },
  { id: '4', region: '港澳台', isp: '全部', resolvedNode: 'hk', latency: 15, policy: 'nearest' },
  { id: '5', region: '东南亚', isp: '全部', resolvedNode: 'sg', latency: 35, policy: 'nearest' },
  { id: '6', region: '北美/欧洲', isp: '全部', resolvedNode: 'us', latency: 120, policy: 'nearest' },
  { id: '7', region: '中国移动（全国）', isp: '移动', resolvedNode: 'sh', latency: 15, policy: 'weighted' },
  { id: '8', region: '中国联通（全国）', isp: '联通', resolvedNode: 'bj', latency: 18, policy: 'weighted' },
  { id: '9', region: '中国电信（全国）', isp: '电信', resolvedNode: 'gz', latency: 20, policy: 'weighted' },
]

export function GslbGeoSim() {
  const [selectedRegion, setSelectedRegion] = useState('')
  const [selectedIsp, setSelectedIsp] = useState('全部')
  const [simResult, setSimResult] = useState<GeoRule | null>(null)

  const simulate = () => {
    const match = GEO_RULES.find(r =>
      (r.region.includes(selectedRegion) || selectedRegion === '') &&
      (r.isp === selectedIsp || selectedIsp === '全部' && r.isp === '全部')
    )
    setSimResult(match || null)
  }

  const getNode = (id: string) => NODES.find(n => n.id === id)

  const getPolicyLabel = (p: string) =>
    p === 'nearest' ? '就近解析' : p === 'weighted' ? '权重分配' : '故障切换'

  const getLatencyColor = (ms: number) =>
    ms < 20 ? 'text-green-500' : ms < 50 ? 'text-yellow-500' : ms < 100 ? 'text-orange-500' : 'text-red-500'

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">GEO 解析模拟</h1>
      <p className="text-gray-500 dark:text-gray-400">模拟不同地区/运营商的 DNS 解析结果，预测 GSLB 地理调度策略效果</p>

      {/* 节点分布 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">节点分布</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {NODES.map(node => (
            <div key={node.id} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-700/50">
              <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: node.color }} />
              <div className="min-w-0">
                <div className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{node.name}</div>
                <div className="text-xs font-mono text-gray-400">{node.ip}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 解析模拟 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 space-y-4">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">解析模拟</h2>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">访问地区</label>
            <select value={selectedRegion} onChange={e => setSelectedRegion(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="">-- 选择地区 --</option>
              <option value="华东">华东（上海/江苏/浙江）</option>
              <option value="华北">华北（北京/河北/山东）</option>
              <option value="华南">华南（广东/广西/福建）</option>
              <option value="港澳台">港澳台</option>
              <option value="东南亚">东南亚</option>
              <option value="北美">北美/欧洲</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">运营商</label>
            <select value={selectedIsp} onChange={e => setSelectedIsp(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="全部">全部运营商</option>
              <option value="移动">中国移动</option>
              <option value="联通">中国联通</option>
              <option value="电信">中国电信</option>
            </select>
          </div>
        </div>
        <button onClick={simulate}
          className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
          <Globe className="w-4 h-4" /> 模拟解析
        </button>

        {simResult && (() => {
          const node = getNode(simResult.resolvedNode)
          return node ? (
            <div className="rounded-xl border-2 p-4 space-y-3" style={{ borderColor: node.color + '60' }}>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" style={{ color: node.color }} />
                <span className="font-semibold text-gray-900 dark:text-gray-100">解析结果</span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  ['目标节点', node.name],
                  ['解析 IP', node.ip],
                  ['调度策略', getPolicyLabel(simResult.policy)],
                  ['预计延迟', simResult.latency + 'ms'],
                ].map(([k, v]) => (
                  <div key={k} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg px-3 py-2">
                    <div className="text-xs text-gray-500">{k}</div>
                    <div className={`font-medium mt-0.5 ${k === '预计延迟' ? getLatencyColor(simResult.latency) : 'text-gray-900 dark:text-gray-100'}`}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : null
        })()}
      </div>

      {/* 解析规则表 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">完整解析规则表</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">地区/运营商</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">解析节点</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">策略</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">延迟</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {GEO_RULES.map(rule => {
                const node = getNode(rule.resolvedNode)
                return node ? (
                  <tr key={rule.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <td className="px-4 py-2.5 text-gray-700 dark:text-gray-300">{rule.region}</td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: node.color }} />
                        <span className="text-gray-800 dark:text-gray-200">{node.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-gray-500">{getPolicyLabel(rule.policy)}</td>
                    <td className={`px-4 py-2.5 text-right font-mono font-medium ${getLatencyColor(rule.latency)}`}>{rule.latency}ms</td>
                  </tr>
                ) : null
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
