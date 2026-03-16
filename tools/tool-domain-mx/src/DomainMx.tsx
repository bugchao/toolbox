import React, { useState } from 'react';
import { PageHero, Button, Input, Card } from '@toolbox/ui-kit';
import { useTranslation } from 'react-i18next';
import { Mail, CheckCircle, Loader2, AlertCircle, ArrowRight } from 'lucide-react';

interface MxRecord {
  exchange: string;
  priority: number;
  ips?: string[];
  responseTime?: number;
  reachable?: boolean;
}

interface QueryResult {
  domain: string;
  mxRecords: MxRecord[];
  hasMx: boolean;
  errorMessage?: string;
  timestamp: string;
  suggestions?: string[];
}

export default function DomainMx() {
  const { t } = useTranslation();
  const [domain, setDomain] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<QueryResult | null>(null);

  const handleQuery = async () => {
    if (!domain.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/domain/mx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: domain.trim() })
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        domain: domain.trim(),
        mxRecords: [],
        hasMx: false,
        errorMessage: error instanceof Error ? error.message : 'Network error',
        timestamp: new Date().toISOString()
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <PageHero
          icon={Mail}
          title="MX 记录检测"
          description="查询域名的邮件交换记录，检测邮件服务器配置"
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

                <div className="text-sm text-gray-600 dark:text-gray-400">
                  域名：<span className="font-mono font-medium text-gray-900 dark:text-gray-100">{result.domain}</span>
                </div>

                {result.errorMessage ? (
                  <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-red-700 dark:text-red-400">查询失败</p>
                      <p className="text-sm text-red-600 dark:text-red-300 mt-1">
                        {result.errorMessage}
                      </p>
                    </div>
                  </div>
                ) : result.hasMx && result.mxRecords.length > 0 ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-medium">找到 {result.mxRecords.length} 条 MX 记录</span>
                    </div>

                    {result.mxRecords.map((mx, index) => (
                      <Card key={index} className="p-4 bg-gray-50 dark:bg-gray-800">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded text-sm font-medium">
                                优先级 {mx.priority}
                              </span>
                              <ArrowRight className="w-4 h-4 text-gray-400" />
                              <span className="font-mono font-medium text-gray-900 dark:text-gray-100">
                                {mx.exchange}
                              </span>
                            </div>
                            {mx.responseTime !== undefined && (
                              <span className="text-xs text-gray-500">
                                {mx.responseTime}ms
                              </span>
                            )}
                          </div>

                          {mx.ips && mx.ips.length > 0 && (
                            <div className="pl-4 border-l-2 border-purple-200 dark:border-purple-700">
                              <p className="text-xs text-gray-500 mb-1">IP 地址：</p>
                              <div className="space-y-1">
                                {mx.ips.map((ip, ipIndex) => (
                                  <div key={ipIndex} className="flex items-center gap-2">
                                    <span className="font-mono text-sm text-gray-700 dark:text-gray-300">
                                      {ip}
                                    </span>
                                    {mx.reachable !== undefined && (
                                      <span className={`text-xs ${mx.reachable ? 'text-green-500' : 'text-red-500'}`}>
                                        {mx.reachable ? '✓ 可达' : '✗ 不可达'}
                                      </span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-start gap-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-yellow-700 dark:text-yellow-400">未找到 MX 记录</p>
                      <p className="text-sm text-yellow-600 dark:text-yellow-300 mt-1">
                        该域名没有配置邮件交换记录
                      </p>
                    </div>
                  </div>
                )}

                {result.suggestions && result.suggestions.length > 0 && (
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <h4 className="font-medium text-blue-700 dark:text-blue-300 mb-2">配置建议：</h4>
                    <ul className="space-y-1">
                      {result.suggestions.map((suggestion, index) => (
                        <li key={index} className="text-sm text-blue-600 dark:text-blue-400">
                          • {suggestion}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>

        <div className="max-w-4xl mx-auto mt-8 p-6 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
          <h4 className="font-semibold mb-3 text-purple-900 dark:text-purple-100">关于 MX 记录</h4>
          <ul className="space-y-2 text-sm text-purple-800 dark:text-purple-200">
            <li>• MX 记录指定接收邮件的邮件服务器</li>
            <li>• 优先级数字越小，优先级越高</li>
            <li>• 建议配置多个 MX 记录实现冗余</li>
            <li>• MX 记录必须指向域名，不能直接指向 IP</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
