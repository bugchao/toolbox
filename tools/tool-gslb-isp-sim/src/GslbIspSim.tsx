import React, { useState } from 'react'
import { Radio } from 'lucide-react'

interface IspRule {
  isp: string
  ispLabel: string
  region: string
  node: string
  nodeIp: string
  latency: number
  reason: string
}

interface NodeInfo {
  id: string
  name: string
  ip: string
  color: string
}

const NODES: NodeInfo[] = [
  { id: 'sh1', name: '上海节点 SH1', ip: '1.2.3.10', color: '#6366f1' },
  { id: 'bj1', name: '北京节点 BJ1', ip: '1.2.3.20', color: '#3b82f6' },
  { id: 'gz1', name: '广州节点 GZ1', ip: '1.2.3.30', color: '#10b981' },
  { id: 'sg1', name: '新加坡 SG1', ip: '1.2.3.40', color: '#f59e0b' },
]

const ISP_RULES: IspRule[] = [
  { isp: 'mobile', ispLabel: '中国移动', region: '全国', node: 'sh1', nodeIp: '1.2.3.10', latency: 12, reason: '移动骨干网与上海节点直连，延迟最低' },
  { isp: 'unicom', ispLabel: '中国联通', region: '全国', node: 'bj1', nodeIp: '1.2.3.20', latency: 15, reason: '联通骨干网北京出口，BJ1 接入质量最佳' },
  { isp: 'telecom', ispLabel: '中国电信', region: '全国', node: 'gz1', nodeIp: '1.2.3.30', latency: 14, reason: '电信 163 网络广州枢纽，GZ1 线路质量好' },
  { isp: 'mobile-north', ispLabel: '移动（华北）', region: '华北', node: 'bj1', nodeIp: '1.2.3.20', latency: 8, reason: '华北移动用户就近访问北京节点' },
  { isp: 'telecom-east', ispLabel: '电信（华东）', region: '华东', node: 'sh1', nodeIp: '1.2.3.10', latency: 9, reason: '华东电信用户就近访问上海节点' },
  { isp: 'hk', ispLabel: '香港/境外', region: '香港', node: 'sg1', nodeIp: '1.2.3.40', latency: 28, reason: '境外用户路由至新加坡节点，国际出口质量更稳定' },
  { isp: 'edu', ispLabel: '中国教育网 (CERNET)', region: '全国', node: 'bj1', nodeIp: '1.2.3.20', latency: 18, reason: 'CERNET 与联通互联，北京节点互通质量较好' },
  { isp: 'default', ispLabel: '其他/未知', region: '默认', node: 'sh1', nodeIp: '1.2.3.10', latency: 25, reason: '未匹配运营商时使用默认节点（权重最高）' },
]

export function GslbIspSim() {
  const [selected, setSelected] = useState<IspRule | null>(null)
  const [custom, setCustom] = useState({ isp: '', region: '' })

  const simulate = (rule: IspRule) => setSelected(rule)

  const getNode = (id: string) => NODES.find(n => n.id === id)

  const getLatencyColor = (ms: number) =>
    ms < 20 ? 'text-green-500' : ms < 50 ? 'text-yellow-500' : 'text-orange-500'

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">运营商解析模拟</h1>
      <p className="text-gray-500 dark:text-gray-400">模拟不同运营商/线路的 DNS 解析结果，验证 ISP 分流策略效果</p>

      {/* 规则列表 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300">ISP 解析规则（点击模拟）</div>
        <div className="divide-y divide-gray-100 dark:divide-gray-700">
          {ISP_RULES.map(rule => {
            const node = getNode(rule.node)
            return (
              <button key={rule.isp} onClick={() => simulate(rule)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors ${
                  selected?.isp === rule.isp ? 'bg-indigo-50 dark:bg-indigo-900/10' : ''
                }`}>
                <Radio className="w-4 h-4 text-gray-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900 dark:text-gray-100">{rule.ispLabel}</span>
                    <span className="text-xs text-gray-400">{rule.region}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    {node && <div className="w-2 h-2 rounded-full" style={{ backgroundColor: node.color }} />}
                    <span className="text-xs text-gray-500">{node?.name} · {node?.ip}</span>
                  </div>
                </div>
                <span className={`text-sm font-mono font-medium ${getLatencyColor(rule.latency)}`}>{rule.latency}ms</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* 模拟结果 */}
      {selected && (() => {
        const node = getNode(selected.node)
        return node ? (
          <div className="rounded-xl border-2 border-indigo-200 dark:border-indigo-700 bg-indigo-50 dark:bg-indigo-900/10 p-5 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: node.color }} />
              <span className="font-semibold text-gray-900 dark:text-gray-100">解析结果</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                ['运营商/线路', selected.ispLabel],
                ['解析节点', node.name],
                ['返回 IP', node.ip],
                ['预计延迟', selected.latency + 'ms'],
              ].map(([k, v]) => (
                <div key={k} className="bg-white dark:bg-gray-700/50 rounded-lg px-3 py-2">
                  <div className="text-xs text-gray-500">{k}</div>
                  <div className={`font-medium mt-0.5 ${
                    k === '预计延迟' ? getLatencyColor(selected.latency) : 'text-gray-900 dark:text-gray-100'
                  }`}>{v}</div>
                </div>
              ))}
            </div>
            <div className="bg-white dark:bg-gray-700/50 rounded-lg px-3 py-2">
              <div className="text-xs text-gray-500 mb-1">调度原因</div>
              <div className="text-sm text-gray-700 dark:text-gray-300">{selected.reason}</div>
            </div>
          </div>
        ) : null
      })()}

      {/* 节点分布 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">节点分布统计</h2>
        <div className="space-y-2">
          {NODES.map(node => {
            const count = ISP_RULES.filter(r => r.node === node.id).length
            const pct = Math.round((count / ISP_RULES.length) * 100)
            return (
              <div key={node.id} className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: node.color }} />
                <span className="text-sm text-gray-700 dark:text-gray-300 w-32">{node.name}</span>
                <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: node.color }} />
                </div>
                <span className="text-xs text-gray-500 w-12 text-right">{count} 条规则</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
