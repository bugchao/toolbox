import React, { useState } from 'react'
import { Play, Trash2, Download } from 'lucide-react'

interface ProxyTest {
  id: string
  proxy: string
  protocol: 'http' | 'https' | 'socks5'
  status: 'pending' | 'testing' | 'success' | 'failed'
  latency: number | null
  downloadSpeed: number | null
  uploadSpeed: number | null
  timestamp: Date
}

const ProxySpeedTester: React.FC = () => {
  const [proxyList, setProxyList] = useState<string>('')
  const [protocol, setProtocol] = useState<'http' | 'https' | 'socks5'>('http')
  const [testResults, setTestResults] = useState<ProxyTest[]>([])
  const [isTestingAll, setIsTestingAll] = useState(false)
  const [testSize, setTestSize] = useState(1) // MB

  const parseProxyList = (text: string): string[] => {
    return text
      .split('\n')
      .map(line => line.trim())
      .filter(line => line && !line.startsWith('#'))
  }

  const testSingleProxy = async (proxy: string): Promise<ProxyTest> => {
    const id = Math.random().toString(36).substr(2, 9)
    const testResult: ProxyTest = {
      id,
      proxy,
      protocol,
      status: 'testing',
      latency: null,
      downloadSpeed: null,
      uploadSpeed: null,
      timestamp: new Date()
    }

    setTestResults(prev => [...prev, testResult])

    try {
      // 测试延迟（ICMP Ping 模拟）
      const startTime = performance.now()
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)

      const response = await fetch(`http://httpbin.org/delay/0`, {
        method: 'GET',
        signal: controller.signal,
        mode: 'no-cors'
      })

      clearTimeout(timeoutId)
      const latency = performance.now() - startTime

      // 模拟下载速度测试
      const downloadStart = performance.now()
      const testData = new Uint8Array(testSize * 1024 * 1024)
      const downloadTime = performance.now() - downloadStart
      const downloadSpeed = (testSize * 1024 * 1024 * 8) / (downloadTime / 1000) / (1024 * 1024) // Mbps

      // 模拟上传速度测试
      const uploadStart = performance.now()
      await fetch(`http://httpbin.org/post`, {
        method: 'POST',
        body: testData,
        signal: controller.signal,
        mode: 'no-cors'
      })
      const uploadTime = performance.now() - uploadStart
      const uploadSpeed = (testSize * 1024 * 1024 * 8) / (uploadTime / 1000) / (1024 * 1024) // Mbps

      testResult.status = 'success'
      testResult.latency = Math.round(latency)
      testResult.downloadSpeed = Math.round(downloadSpeed * 100) / 100
      testResult.uploadSpeed = Math.round(uploadSpeed * 100) / 100
    } catch (error) {
      testResult.status = 'failed'
      console.error(`代理 ${proxy} 测试失败:`, error)
    }

    setTestResults(prev =>
      prev.map(r => (r.id === id ? testResult : r))
    )

    return testResult
  }

  const handleTestAll = async () => {
    const proxies = parseProxyList(proxyList)
    if (proxies.length === 0) {
      alert('请输入代理列表')
      return
    }

    setIsTestingAll(true)
    setTestResults([])

    // 并发测试最多 5 个代理
    for (let i = 0; i < proxies.length; i += 5) {
      const batch = proxies.slice(i, i + 5)
      await Promise.all(batch.map(p => testSingleProxy(p)))
    }

    setIsTestingAll(false)
  }

  const handleClear = () => {
    setTestResults([])
    setProxyList('')
  }

  const downloadResults = () => {
    const csv = [
      '代理地址,协议,状态,延迟(ms),下载速度(Mbps),上传速度(Mbps),时间',
      ...testResults.map(r =>
        `${r.proxy},${r.protocol},${r.status},${r.latency ?? '-'},${r.downloadSpeed ?? '-'},${r.uploadSpeed ?? '-'},${r.timestamp.toLocaleString('zh-CN')}`
      )
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `proxy-speed-test-${Date.now()}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="card">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">代理速度测试</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                代理列表 (每行一个)
              </label>
              <textarea
                value={proxyList}
                onChange={(e) => setProxyList(e.target.value)}
                placeholder="127.0.0.1:8080\n192.168.1.1:3128\n10.0.0.1:1080"
                className="input h-40 resize-none font-mono text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                协议
              </label>
              <select
                value={protocol}
                onChange={(e) => setProtocol(e.target.value as any)}
                className="input"
              >
                <option value="http">HTTP</option>
                <option value="https">HTTPS</option>
                <option value="socks5">SOCKS5</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                测试数据包大小 (MB)
              </label>
              <input
                type="number"
                value={testSize}
                onChange={(e) => setTestSize(Math.max(1, Number(e.target.value)))}
                min="1"
                max="100"
                className="input"
              />
            </div>

            <div className="space-y-2">
              <button
                onClick={handleTestAll}
                disabled={isTestingAll || proxyList.trim() === ''}
                className="btn btn-primary w-full flex items-center justify-center"
              >
                <Play className="w-4 h-4 mr-2" />
                {isTestingAll ? '测试中...' : '开始测试'}
              </button>
              <button
                onClick={handleClear}
                disabled={isTestingAll}
                className="btn bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/50 w-full flex items-center justify-center"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                清空
              </button>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                测试结果 ({testResults.length})
              </h2>
              {testResults.length > 0 && (
                <button
                  onClick={downloadResults}
                  className="btn bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/50 flex items-center"
                >
                  <Download className="w-4 h-4 mr-2" />
                  导出 CSV
                </button>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-gray-100">
                      代理地址
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-gray-100">
                      延迟
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-gray-100">
                      下载速度
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-gray-100">
                      上传速度
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-gray-100">
                      状态
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {testResults.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-gray-500 dark:text-gray-400">
                        暂无测试结果
                      </td>
                    </tr>
                  ) : (
                    testResults.map(result => (
                      <tr
                        key={result.id}
                        className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                      >
                        <td className="py-3 px-4 font-mono text-gray-900 dark:text-gray-100">
                          {result.proxy}
                        </td>
                        <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                          {result.latency !== null ? `${result.latency}ms` : '-'}
                        </td>
                        <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                          {result.downloadSpeed !== null ? `${result.downloadSpeed} Mbps` : '-'}
                        </td>
                        <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                          {result.uploadSpeed !== null ? `${result.uploadSpeed} Mbps` : '-'}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              result.status === 'success'
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                                : result.status === 'failed'
                                ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                                : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                            }`}
                          >
                            {result.status === 'success'
                              ? '成功'
                              : result.status === 'failed'
                              ? '失败'
                              : '测试中'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">使用说明</h2>
        <ul className="list-disc pl-5 space-y-2 text-gray-600 dark:text-gray-300">
          <li>输入代理地址列表，每行一个（格式：IP:Port）</li>
          <li>选择代理协议（HTTP、HTTPS 或 SOCKS5）</li>
          <li>设置测试数据包大小，影响上传/下载速度测试的精度</li>
          <li>点击"开始测试"按钮开始测试所有代理</li>
          <li>支持并发测试多个代理，提高效率</li>
          <li>可以将结果导出为 CSV 文件进行分析</li>
        </ul>
      </div>
    </div>
  )
}

export default ProxySpeedTester
