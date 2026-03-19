import React, { useState } from 'react';
import { PageHero, Button, Input, Card } from '@toolbox/ui-kit';
import { Radio, Loader2, AlertCircle, CheckCircle, XCircle, Clock } from 'lucide-react';

interface PingRecord {
  seq: number;
  responseTime?: number;
  timeout: boolean;
}

interface PingResult {
  host: string;
  resolvedIp?: string;
  records: PingRecord[];
  sent: number;
  received: number;
  lost: number;
  lossRate: number;
  minTime?: number;
  maxTime?: number;
  avgTime?: number;
  reachable: boolean;
  timestamp: string;
}

export default function Ping() {
  const [host, setHost] = useState('');
  const [count, setCount] = useState('4');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PingResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handlePing = async () => {
    const h = host.trim();
    if (!h) return;
    const c = Math.min(Math.max(parseInt(count) || 4, 1), 10);

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('/api/ping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ host: h, count: c }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : '请求失败');
    } finally {
      setLoading(false);
    }
  };

  const getLossColor = (rate: number) => {
    if (rate === 0) return 'text-green-600 dark:text-green-400';
    if (rate < 50) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getLatencyColor = (ms?: number) => {
    if (!ms) return 'text-gray-400';
    if (ms < 50) return 'text-green-600 dark:text-green-400';
    if (ms < 150) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getLatencyBar = (ms?: number, max?: number) => {
    if (!ms || !max) return 0;
    return Math.min((ms / max) * 100, 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <PageHero icon={Radio} title="Ping 测试" description="通过 TCP 方式检测主机可达性和网络延迟" />

        <Card className="max-w-3xl mx-auto mt-8 p-6">
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="输入主机名或 IP，例如：example.com 或 8.8.8.8"
                value={host}
                onChange={(e) => setHost(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handlePing()}
                className="flex-1"
                disabled={loading}
              />
              <select
                value={count}
                onChange={(e) => setCount(e.target.value)}
                disabled={loading}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm"
              >
                {[1, 2, 3, 4, 5, 8, 10].map(n => (
                  <option key={n} value={n}>Ping {n}次</option>
                ))}
              </select>
              <Button onClick={handlePing} disabled={loading || !host.trim()} className="min-w-[90px]">
                {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />测试中</> : 'Ping'}
              </Button>
            </div>
          </div>

          {error && (
            <div className="mt-4 flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600 dark:text-red-300">{error}</p>
            </div>
          )}

          {result && (
            <div className="mt-6 space-y-4">
              {/* 主机信息 */}
              <div className="flex items-center gap-3 pb-4 border-b">
                {result.reachable
                  ? <CheckCircle className="w-6 h-6 text-green-500" />
                  : <XCircle className="w-6 h-6 text-red-500" />}
                <div>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">{result.host}</span>
                  {result.resolvedIp && (
                    <span className="ml-2 text-sm text-gray-500 font-mono">({result.resolvedIp})</span>
                  )}
                  <p className={`text-sm font-medium mt-0.5 ${result.reachable ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {result.reachable ? '主机可达' : '主机不可达'}
                  </p>
                </div>
              </div>

              {/* 统计 */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Card className="p-3 text-center bg-gray-50 dark:bg-gray-800">
                  <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{result.sent}</div>
                  <div className="text-xs text-gray-500 mt-1">已发送</div>
                </Card>
                <Card className="p-3 text-center bg-green-50 dark:bg-green-900/20">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">{result.received}</div>
                  <div className="text-xs text-green-600 dark:text-green-400 mt-1">已接收</div>
                </Card>
                <Card className="p-3 text-center bg-red-50 dark:bg-red-900/20">
                  <div className={`text-2xl font-bold ${getLossColor(result.lossRate)}`}>{result.lost}</div>
                  <div className={`text-xs mt-1 ${getLossColor(result.lossRate)}`}>丢包 {result.lossRate}%</div>
                </Card>
                <Card className="p-3 text-center bg-blue-50 dark:bg-blue-900/20">
                  <div className={`text-2xl font-bold ${getLatencyColor(result.avgTime)}`}>
                    {result.avgTime ? `${result.avgTime}ms` : '-'}
                  </div>
                  <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">平均延迟</div>
                </Card>
              </div>

              {/* 延迟统计 */}
              {result.received > 0 && (
                <Card className="p-4 bg-gray-50 dark:bg-gray-800">
                  <div className="grid grid-cols-3 gap-4 text-center text-sm">
                    <div>
                      <div className={`font-bold text-lg ${getLatencyColor(result.minTime)}`}>{result.minTime}ms</div>
                      <div className="text-gray-500 text-xs mt-1">最小延迟</div>
                    </div>
                    <div>
                      <div className={`font-bold text-lg ${getLatencyColor(result.avgTime)}`}>{result.avgTime}ms</div>
                      <div className="text-gray-500 text-xs mt-1">平均延迟</div>
                    </div>
                    <div>
                      <div className={`font-bold text-lg ${getLatencyColor(result.maxTime)}`}>{result.maxTime}ms</div>
                      <div className="text-gray-500 text-xs mt-1">最大延迟</div>
                    </div>
                  </div>
                </Card>
              )}

              {/* 逐次结果 */}
              <div className="space-y-2">
                <h4 className="font-medium text-gray-700 dark:text-gray-300 text-sm">逐次结果</h4>
                {result.records.map((record) => (
                  <div key={record.seq} className="flex items-center gap-3">
                    <span className="text-xs text-gray-400 w-10 text-right">#{record.seq}</span>
                    {record.timeout ? (
                      <>
                        <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                        <span className="text-sm text-red-500">超时</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <div className="flex-1 flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                (record.responseTime || 0) < 50 ? 'bg-green-500' :
                                (record.responseTime || 0) < 150 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${getLatencyBar(record.responseTime, result.maxTime)}%` }}
                            />
                          </div>
                          <span className={`text-sm font-mono w-16 text-right ${getLatencyColor(record.responseTime)}`}>
                            {record.responseTime}ms
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>

        <div className="max-w-3xl mx-auto mt-6 p-5 bg-teal-50 dark:bg-teal-900/20 rounded-lg">
          <h4 className="font-semibold mb-2 text-teal-900 dark:text-teal-100">关于 Ping 测试</h4>
          <ul className="space-y-1 text-sm text-teal-800 dark:text-teal-200">
            <li>• 本工具通过 TCP 连接（端口 80/443）模拟 Ping，适用于无 ICMP 权限的环境</li>
            <li>• 延迟 &lt;50ms 为优秀，50-150ms 为良好，&gt;150ms 需关注</li>
            <li>• 丢包率 &gt;5% 表示网络质量较差</li>
            <li>• 防火墙可能过滤请求导致误报，结果仅供参考</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
