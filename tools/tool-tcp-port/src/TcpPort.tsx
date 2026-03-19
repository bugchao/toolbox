import React, { useState } from 'react';
import { PageHero, Button, Input, Card } from '@toolbox/ui-kit';
import { Wifi, Loader2, AlertCircle, CheckCircle, XCircle, Plus, X } from 'lucide-react';

interface PortResult {
  port: number;
  open: boolean;
  responseTime?: number;
  service?: string;
  banner?: string;
}

interface TcpResult {
  host: string;
  resolvedIp?: string;
  results: PortResult[];
  timestamp: string;
}

const COMMON_PORTS = [
  { port: 21, service: 'FTP' },
  { port: 22, service: 'SSH' },
  { port: 23, service: 'Telnet' },
  { port: 25, service: 'SMTP' },
  { port: 53, service: 'DNS' },
  { port: 80, service: 'HTTP' },
  { port: 110, service: 'POP3' },
  { port: 143, service: 'IMAP' },
  { port: 443, service: 'HTTPS' },
  { port: 3306, service: 'MySQL' },
  { port: 3389, service: 'RDP' },
  { port: 5432, service: 'PostgreSQL' },
  { port: 6379, service: 'Redis' },
  { port: 8080, service: 'HTTP Alt' },
  { port: 8443, service: 'HTTPS Alt' },
  { port: 27017, service: 'MongoDB' },
];

export default function TcpPort() {
  const [host, setHost] = useState('');
  const [portsInput, setPortsInput] = useState('80,443,22,21');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TcpResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleQuery = async () => {
    const h = host.trim();
    if (!h) return;

    // 解析端口列表
    const ports = portsInput
      .split(/[,，\s]+/)
      .map(p => parseInt(p.trim()))
      .filter(p => !isNaN(p) && p > 0 && p <= 65535);

    if (ports.length === 0) {
      setError('请输入有效的端口号（1-65535）');
      return;
    }
    if (ports.length > 20) {
      setError('最多同时检测 20 个端口');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('/api/tcp/port-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ host: h, ports }),
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

  const addCommonPort = (port: number) => {
    const current = portsInput.split(/[,，\s]+/).map(p => p.trim()).filter(Boolean);
    if (!current.includes(String(port))) {
      setPortsInput([...current, String(port)].join(','));
    }
  };

  const openCount = result?.results.filter(r => r.open).length || 0;
  const closedCount = result?.results.filter(r => !r.open).length || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <PageHero icon={Wifi} title="TCP 端口检测" description="检测指定主机的 TCP 端口是否开放，支持批量检测" />

        <Card className="max-w-4xl mx-auto mt-8 p-6">
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="输入主机名或 IP，例如：example.com 或 192.168.1.1"
                value={host}
                onChange={(e) => setHost(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleQuery()}
                className="flex-1"
                disabled={loading}
              />
            </div>
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="端口号，多个用逗号分隔，例如：80,443,22"
                value={portsInput}
                onChange={(e) => setPortsInput(e.target.value)}
                className="flex-1"
                disabled={loading}
              />
              <Button onClick={handleQuery} disabled={loading || !host.trim()} className="min-w-[100px]">
                {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />检测中</> : '检测'}
              </Button>
            </div>

            {/* 常用端口快捷添加 */}
            <div>
              <p className="text-xs text-gray-500 mb-2">常用端口快速添加：</p>
              <div className="flex flex-wrap gap-1.5">
                {COMMON_PORTS.map(({ port, service }) => (
                  <button
                    key={port}
                    onClick={() => addCommonPort(port)}
                    className="px-2 py-1 text-xs rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                  >
                    {port} <span className="text-gray-400">{service}</span>
                  </button>
                ))}
              </div>
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
              <div className="flex items-center justify-between pb-4 border-b">
                <div>
                  <h3 className="font-semibold">{result.host}</h3>
                  {result.resolvedIp && (
                    <p className="text-sm text-gray-500 font-mono">{result.resolvedIp}</p>
                  )}
                </div>
                <div className="flex gap-3">
                  <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm font-medium">
                    ✓ 开放 {openCount}
                  </span>
                  <span className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-full text-sm font-medium">
                    ✗ 关闭 {closedCount}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {result.results.map((r) => (
                  <div
                    key={r.port}
                    className={`p-3 rounded-lg flex items-center gap-3 ${
                      r.open
                        ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                        : 'bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    {r.open
                      ? <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      : <XCircle className="w-5 h-5 text-gray-400 flex-shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-gray-900 dark:text-gray-100">{r.port}</span>
                        {r.service && (
                          <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">
                            {r.service}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-xs font-medium ${r.open ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`}>
                          {r.open ? '开放' : '关闭/过滤'}
                        </span>
                        {r.responseTime !== undefined && (
                          <span className="text-xs text-gray-400">{r.responseTime}ms</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>

        <div className="max-w-4xl mx-auto mt-6 p-5 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg">
          <h4 className="font-semibold mb-2 text-cyan-900 dark:text-cyan-100">使用说明</h4>
          <ul className="space-y-1 text-sm text-cyan-800 dark:text-cyan-200">
            <li>• 端口检测使用 TCP 握手方式，不会发送任何应用层数据</li>
            <li>• "关闭/过滤" 表示连接被拒绝或超时，可能是防火墙拦截</li>
            <li>• 最多同时检测 20 个端口，超时时间为 3 秒</li>
            <li>• 部分端口可能因网络策略被屏蔽，结果仅供参考</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
