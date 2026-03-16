import React, { useState } from 'react';
import { PageHero, Button, Input, Card } from '@toolbox/ui-kit';
import { useTranslation } from 'react-i18next';
import { Link2, AlertCircle, CheckCircle, Loader2, ArrowRight } from 'lucide-react';

interface CnameRecord {
  domain: string;
  cname: string;
  ttl?: number;
  responseTime?: number;
}

interface QueryResult {
  domain: string;
  chain: CnameRecord[];
  finalTarget?: string;
  hasLoop: boolean;
  timestamp: string;
  error?: string;
}

export default function DnsCnameChain() {
  const { t } = useTranslation();
  const [domain, setDomain] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<QueryResult | null>(null);

  const handleQuery = async () => {
    if (!domain.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/dns/cname-chain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: domain.trim() })
      });

      const data = await response.json();
      
      if (!response.ok) {
        setResult({
          domain: domain.trim(),
          chain: [],
          hasLoop: false,
          timestamp: new Date().toISOString(),
          error: data.error || 'Query failed'
        });
      } else {
        setResult(data);
      }
    } catch (error) {
      setResult({
        domain: domain.trim(),
        chain: [],
        hasLoop: false,
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
          icon={Link2}
          title="CNAME 链检测"
          description="追踪域名的 CNAME 解析链，检测循环引用和解析路径"
        />

        <Card className="max-w-4xl mx-auto mt-8 p-6">
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="输入域名，例如：www.example.com"
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
                      起始域名：<span className="font-mono font-medium text-gray-900 dark:text-gray-100">{result.domain}</span>
                    </div>

                    {result.hasLoop && (
                      <div className="flex items-start gap-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                        <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-yellow-700 dark:text-yellow-400">检测到循环引用</p>
                          <p className="text-sm text-yellow-600 dark:text-yellow-300 mt-1">
                            CNAME 链中存在循环，这会导致 DNS 解析失败
                          </p>
                        </div>
                      </div>
                    )}

                    {result.chain.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        该域名没有 CNAME 记录
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <h4 className="font-medium text-gray-700 dark:text-gray-300">CNAME 解析链：</h4>
                        {result.chain.map((record, index) => (
                          <div key={index} className="flex items-center gap-3">
                            <div className="flex-1 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-mono text-sm font-medium text-gray-900 dark:text-gray-100">
                                  {record.domain}
                                </span>
                                {record.responseTime !== undefined && (
                                  <span className="text-xs text-gray-500">
                                    {record.responseTime}ms
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                <ArrowRight className="w-4 h-4" />
                                <span className="font-mono">{record.cname}</span>
                                {record.ttl !== undefined && (
                                  <span className="text-xs text-gray-500 ml-auto">
                                    TTL: {record.ttl}s
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                        
                        {result.finalTarget && (
                          <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
                            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                            <div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">最终目标：</p>
                              <p className="font-mono font-medium text-gray-900 dark:text-gray-100">
                                {result.finalTarget}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </Card>

        <div className="max-w-4xl mx-auto mt-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h4 className="font-semibold mb-3 text-blue-900 dark:text-blue-100">关于 CNAME 链</h4>
          <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
            <li>• CNAME 记录用于将一个域名指向另一个域名</li>
            <li>• 过长的 CNAME 链会增加 DNS 解析时间</li>
            <li>• 循环引用会导致 DNS 解析失败</li>
            <li>• 建议 CNAME 链长度不超过 3-4 层</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
