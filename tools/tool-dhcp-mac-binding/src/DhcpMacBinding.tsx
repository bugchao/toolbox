import React, { useState, useCallback } from 'react'
import { Plus, Trash2, Copy, Check, Download } from 'lucide-react'

type FormatType = 'isc' | 'dnsmasq' | 'mikrotik'

interface Binding {
  id: string
  mac: string
  ip: string
  hostname: string
}

function normalizeMac(mac: string): string {
  const clean = mac.replace(/[^0-9a-fA-F]/g, '')
  if (clean.length !== 12) return mac
  return clean.match(/.{2}/g)!.join(':')
}

function generateConfig(bindings: Binding[], format: FormatType): string {
  const valid = bindings.filter(b => b.mac && b.ip)
  if (valid.length === 0) return ''

  if (format === 'isc') {
    return valid.map(b => {
      const mac = normalizeMac(b.mac)
      return `host ${b.hostname || b.ip.replace(/\./g, '-')} {\n  hardware ethernet ${mac};\n  fixed-address ${b.ip};\n}`
    }).join('\n\n')
  }

  if (format === 'dnsmasq') {
    return valid.map(b => {
      const mac = normalizeMac(b.mac)
      return `dhcp-host=${mac},${b.hostname ? b.hostname + ',' : ''}${b.ip}`
    }).join('\n')
  }

  if (format === 'mikrotik') {
    return valid.map(b => {
      const mac = normalizeMac(b.mac).toUpperCase()
      return `/ip dhcp-server lease add mac-address=${mac} address=${b.ip}${b.hostname ? ` comment=${b.hostname}` : ''}`
    }).join('\n')
  }

  return ''
}

export function DhcpMacBinding() {
  const [bindings, setBindings] = useState<Binding[]>([
    { id: '1', mac: '', ip: '', hostname: '' }
  ])
  const [format, setFormat] = useState<FormatType>('isc')
  const [copied, setCopied] = useState(false)

  const addRow = () => setBindings(prev => [...prev, { id: Date.now().toString(), mac: '', ip: '', hostname: '' }])
  const removeRow = (id: string) => setBindings(prev => prev.filter(b => b.id !== id))
  const updateRow = (id: string, field: keyof Binding, value: string) =>
    setBindings(prev => prev.map(b => b.id === id ? { ...b, [field]: value } : b))

  const config = generateConfig(bindings, format)

  const copy = useCallback(async () => {
    await navigator.clipboard.writeText(config)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [config])

  const download = useCallback(() => {
    const ext = format === 'dnsmasq' ? 'conf' : 'txt'
    const blob = new Blob([config], { type: 'text/plain' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `dhcp-bindings.${ext}`
    a.click()
  }, [config, format])

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">DHCP MAC 绑定生成</h1>
      <p className="text-gray-500 dark:text-gray-400">批量生成 ISC DHCP / dnsmasq / MikroTik 静态绑定配置</p>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 space-y-4">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">输出格式</span>
          {(['isc', 'dnsmasq', 'mikrotik'] as FormatType[]).map(f => (
            <button
              key={f}
              onClick={() => setFormat(f)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                format === f
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {f === 'isc' ? 'ISC DHCP' : f === 'dnsmasq' ? 'dnsmasq' : 'MikroTik'}
            </button>
          ))}
        </div>

        <div className="space-y-2">
          <div className="grid grid-cols-12 gap-2 text-xs font-medium text-gray-500 dark:text-gray-400 px-1">
            <span className="col-span-4">MAC 地址</span>
            <span className="col-span-3">IP 地址</span>
            <span className="col-span-4">主机名（可选）</span>
            <span className="col-span-1"></span>
          </div>
          {bindings.map(b => (
            <div key={b.id} className="grid grid-cols-12 gap-2">
              <input
                value={b.mac}
                onChange={e => updateRow(b.id, 'mac', e.target.value)}
                placeholder="AA:BB:CC:DD:EE:FF"
                className="col-span-4 px-2 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <input
                value={b.ip}
                onChange={e => updateRow(b.id, 'ip', e.target.value)}
                placeholder="192.168.1.100"
                className="col-span-3 px-2 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <input
                value={b.hostname}
                onChange={e => updateRow(b.id, 'hostname', e.target.value)}
                placeholder="my-device"
                className="col-span-4 px-2 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                onClick={() => removeRow(b.id)}
                disabled={bindings.length === 1}
                className="col-span-1 flex items-center justify-center text-gray-400 hover:text-red-500 disabled:opacity-30 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        <button
          onClick={addRow}
          className="flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
        >
          <Plus className="w-4 h-4" /> 添加一行
        </button>
      </div>

      {config && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900 dark:text-gray-100">生成配置</h2>
            <div className="flex gap-2">
              <button
                onClick={copy}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                {copied ? '已复制' : '复制'}
              </button>
              <button
                onClick={download}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
              >
                <Download className="w-4 h-4" /> 下载
              </button>
            </div>
          </div>
          <pre className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 text-xs font-mono text-gray-800 dark:text-gray-200 overflow-x-auto whitespace-pre-wrap">{config}</pre>
        </div>
      )}
    </div>
  )
}
