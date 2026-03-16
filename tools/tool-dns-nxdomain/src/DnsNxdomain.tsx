import React, { useState } from 'react';
import { PageHero, Button, Input, Card } from '@toolbox/ui-kit';
import { useTranslation } from 'react-i18next';
import { AlertCircle, CheckCircle, Loader2, XCircle } from 'lucide-react';

interface QueryResult {
  domain: string;
  exists: boolean;
  nxdomain: boolean;
  errorCode?: string;
  errorMessage?: string;
  responseTime?: number;
  timestamp: string;
  dnsServers?: string[];
  suggestions?: string[];
}

export default function DnsNxdomain() {
  const { t } = useTranslation();
  const [domain, setDomain] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<QueryResult | null>(null);

  const handleQuery = async () => {
    if (!domain.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/dns/nxdomain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: domain.trim() })
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        domain: domain.trim(),
        exists: false,
        nxdomain: true,
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <PageHero
          icon={XCircle}
          title="域名 NXDOMAIN 检测"
          description="检测域名是否存在，分析 NXDOMAIN 响应和可能的原因"
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
                    检测中
                  </>
                ) : (
                  '检测'
                )}
              </Button>
            </div>

            {result && (
              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between pb-4 border-b">
                  <h3 className="text-lg font-semibold">检测结果</h3>
                  <span className="text-sm text-gray-500">
                    {new Date(result.timestamp).toLocaleString()}
                  </span>
                </div>

                <div className="text-sm text-gray-600 dark:text-gray-400">
                  域名：<span className="font-mono font-medium text-gray-900 dark:text-gray-100">{result.domain}</span>
                </div>

                {result.exists ? (
                  <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-green-700 dark:text-green-400">域名存在</p>
                      <p className="text-sm text-green-600 dark:text-green-300 mt-1">
                        该域名可以正常解析
                      </p>
                      {result.responseTime !== undefined && (
                        <p className="text-xs text-green-500 mt-1">
                          响应时间: {result.responseTime}ms
                        </p>
                      )}
                    </div>
                  </div>
                ) : result.nxdomain ? (
                  <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-red-700 dark:text-red-400">NXDOMAIN - 域名不存在</p>
                      <p className="text-sm text-red-600 dark:text-red-300 mt-1">
                        该域名未注册或 DNS 记录不存在
                      </p>
                      {result.errorCode && (
                        <p className="text-xs text-red-500 mt-1">
                          错误代码: {result.errorCode}
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-yellow-700 dark:text-yellow-400">查询失败</p>
                      {result.errorMessage && (
                        <p className="text-sm text-yellow-600 dark:text-yellow-300 mt-1">
                          {result.errorMessage}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {result.dnsServers && result.dnsServers.length > 0 && (
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">查询的 DNS 服务器：</h4>
                    <div className="space-y-1">
                      {result.dnsServers.map((server, index) => (
                        <div key={index} className="text-sm font-mono text-gray-600 dark:text-gray-400">
                          {server}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {result.suggestions && result.suggestions.length > 0 && (
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <h4 className="font-medium text-blue-700 dark:text-blue-300 mb-2">可能的原因：</h4>
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

        <div className="max-w-4xl mx-auto mt-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h4 className="font-semibold mb-3 text-blue-900 dark:text-blue-100">关于 NXDOMAIN</h4>
          <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
            <li>• NXDOMAIN 表示"Non-Existent Domain"（域名不存在）</li>
            <li>• 可能原因：域名未注册、DNS 记录未配置、域名拼写错误</li>
            <li>• DNS 服务器返回 NXDOMAIN 响应码表示该域名不存在</li>
            <li>• 某些 DNS 服务器可能会劫持 NXDOMAIN 响应</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
