import React, { useState, useMemo } from 'react'
import { Search } from 'lucide-react'

const DHCP_OPTIONS = [
  { code: 1, name: 'Subnet Mask', desc: '子网掩码', example: '255.255.255.0' },
  { code: 3, name: 'Router', desc: '默认网关', example: '192.168.1.1' },
  { code: 6, name: 'Domain Name Server', desc: 'DNS 服务器地址', example: '8.8.8.8, 8.8.4.4' },
  { code: 12, name: 'Host Name', desc: '主机名', example: 'myhost' },
  { code: 15, name: 'Domain Name', desc: '域名', example: 'example.com' },
  { code: 28, name: 'Broadcast Address', desc: '广播地址', example: '192.168.1.255' },
  { code: 33, name: 'Static Route', desc: '静态路由', example: '10.0.0.0/24 via 192.168.1.1' },
  { code: 42, name: 'NTP Servers', desc: 'NTP 时间服务器', example: '192.168.1.10' },
  { code: 43, name: 'Vendor Specific', desc: '厂商特定信息', example: '(厂商自定义)' },
  { code: 44, name: 'NetBIOS Name Server', desc: 'WINS 服务器', example: '192.168.1.20' },
  { code: 46, name: 'NetBIOS Node Type', desc: 'NetBIOS 节点类型', example: '0x08 (H-node)' },
  { code: 50, name: 'Requested IP Address', desc: '客户端请求的 IP', example: '192.168.1.100' },
  { code: 51, name: 'IP Address Lease Time', desc: 'IP 租约时间（秒）', example: '86400 (1天)' },
  { code: 53, name: 'DHCP Message Type', desc: 'DHCP 消息类型', example: '1=Discover 2=Offer 3=Request 5=ACK' },
  { code: 54, name: 'Server Identifier', desc: 'DHCP 服务器标识', example: '192.168.1.1' },
  { code: 55, name: 'Parameter Request List', desc: '客户端请求参数列表', example: '1,3,6,15,28' },
  { code: 58, name: 'Renewal Time (T1)', desc: '续约时间 T1', example: '43200 (12小时)' },
  { code: 59, name: 'Rebinding Time (T2)', desc: '重绑定时间 T2', example: '75600 (21小时)' },
  { code: 60, name: 'Vendor Class Identifier', desc: '厂商类标识', example: 'MSFT 5.0' },
  { code: 61, name: 'Client Identifier', desc: '客户端唯一标识', example: 'MAC 地址' },
  { code: 66, name: 'TFTP Server Name', desc: 'TFTP 服务器名', example: '192.168.1.5' },
  { code: 67, name: 'Bootfile Name', desc: '引导文件名', example: 'pxelinux.0' },
  { code: 119, name: 'Domain Search', desc: '域搜索列表', example: 'example.com local' },
  { code: 121, name: 'Classless Static Route', desc: '无类静态路由（RFC 3442）', example: '10.0.0.0/8 via 192.168.1.1' },
  { code: 150, name: 'TFTP Server Address', desc: 'Cisco TFTP 服务器地址', example: '192.168.1.5' },
  { code: 252, name: 'WPAD', desc: 'Web 代理自动发现', example: 'http://wpad/wpad.dat' },
  { code: 255, name: 'End', desc: '选项结束标记', example: '(无)' },
]

export function DhcpOption() {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim()
    if (!q) return DHCP_OPTIONS
    return DHCP_OPTIONS.filter(
      o =>
        String(o.code).includes(q) ||
        o.name.toLowerCase().includes(q) ||
        o.desc.includes(q)
    )
  }, [query])

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">DHCP Option 查询</h1>
      <p className="text-gray-500 dark:text-gray-400">DHCP 选项编号含义速查，支持按编号、名称、描述搜索</p>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="搜索 Option 编号或名称..."
          className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-700/50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300 w-16">编号</th>
              <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300">名称</th>
              <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300">说明</th>
              <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300 hidden md:table-cell">示例值</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {filtered.map(opt => (
              <tr key={opt.code} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                <td className="px-4 py-3">
                  <span className="inline-flex items-center justify-center w-9 h-6 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded font-mono font-medium text-xs">
                    {opt.code}
                  </span>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-gray-800 dark:text-gray-200">{opt.name}</td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{opt.desc}</td>
                <td className="px-4 py-3 text-gray-500 dark:text-gray-500 font-mono text-xs hidden md:table-cell">{opt.example}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-400">未找到匹配的 Option</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-gray-400">共 {DHCP_OPTIONS.length} 个常用 Option，显示 {filtered.length} 个</p>
    </div>
  )
}
