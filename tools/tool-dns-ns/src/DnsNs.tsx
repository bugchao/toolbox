import React, { useState } from 'react';
import { PageHero, Button, Input, Card } from '@toolbox/ui-kit';
import { useTranslation } from 'react-i18next';
import { Server, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

interface NsRecord {
  nameserver: string;
  ip?: string[];
  status: 'success' | 'error';
  responseTime?: number;
}

interface QueryResult {
  domain: string;
  nsRecords: NsRecord[];
  timestamp: string;
  error?: string;
}

export default function DnsNs() {
  const { t } = useTranslation();
  const [domain, setDomain] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<QueryResult | null>(null);

  const handleQuery = async () => {
    if (!domain.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/dns/ns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: domain.trim() })
      });

      const data = await response.json();
      
      if (!response.ok) {
        setResult({
          domain: domain.trim(),
          nsRecords: [],
          timestamp: new Date().toISOString(),
          error: data.error || 'Query failed'
        });
      } else {
        setResult(data);
      }
    } catch (error) {
      setResult({
        domain: domain.trim(),
        nsRecords: [],
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Network error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleQuery();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <PageHero
          icon={Server}
          title="NS 服务器查询"
          description="查询域名的权威 NS 记录，获取名称服务器列表及其 IP 地址"
        />

        <Card className="max-w-4xl mx-auto mt-8 p-6">
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="输入域名，例如：example.com"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1"
                disabled={loading}
              />
              <Button
                onClick={handleQuery}
                disabled={loading || !domain.trim()}
                className="min-w-[100px]"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    查询中
                  </>
                ) : (
                  '查询'
                )}
              </Button>
            </div>

            {result && (
              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between pb-4 border-b">
                  <h3 className="text-lg font-semibold">查询结果</h3>
                  <span className="text-sm text-gray-500">
                    {new Date(result.timestamp).toLocaleString()}
                  </span>
                </div>

                {result.error ? (
                  <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-red-700 dark:text-red-400">查询失败</p>
                      <p className="text-sm text-red-600 dark:text-red-300 mt-1">{result.error}</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      域名：<span className="font-mono font-medium text-gray-900 dark:text-gray-100">{result.domain}</span>
                    </div>

                    {result.nsRecords.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        未找到 NS 记录
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {result.nsRecords.map((ns, index) => (
                          <div
                            key={index}
                            className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  {ns.status === 'success' ? (
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                  ) : (
                                    <AlertCircle className="w-4 h-4 text-red-500" />
                                  )}
                                  <span className="font-mono font-medium text-gray-900 dark:text-gray-100">
                                    {ns.nameserver}
                                  </span>
                                </div>
                                
                                {ns.ip && ns.ip.length > 0 && (
                                  <div className="ml-6 space-y-1">
                                    {ns.ip.map((ip, ipIndex) => (
                                      <div key={ipIndex} className="text-sm text-gray-600 dark:text-gray-400">
                                        <span className="font-mono">{ip}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                              
                              {ns.responseTime !== undefined && (
                                <span className="text-xs text-gray-500 ml-4">
                                  {ns.responseTime}ms
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </Card>

        <div className="max-w-4xl mx-auto mt-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h4 className="font-semibold mb-3 text-blue-900 dark:text-blue-100">关于 NS 记录</h4>
          <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
            <li>• NS（Name Server）记录指定域名的权威名称服务器</li>
            <li>• 权威 NS 负责该域名的 DNS 解析</li>
            <li>• 通常一个域名会配置多个 NS 记录以实现冗余</li>
            <li>• NS 记录的 IP 地址通过 A/AAAA 记录查询获得</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
