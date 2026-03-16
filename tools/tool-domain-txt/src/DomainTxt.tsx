import React, { useState } from 'react';
import { PageHero, Button, Input, Card } from '@toolbox/ui-kit';
import { useTranslation } from 'react-i18next';
import { FileText, CheckCircle, Loader2, AlertCircle, Shield, Mail, Key } from 'lucide-react';

interface TxtRecord {
  value: string;
  type?: 'SPF' | 'DKIM' | 'DMARC' | 'VERIFICATION' | 'OTHER';
  valid?: boolean;
  issues?: string[];
}

interface QueryResult {
  domain: string;
  txtRecords: TxtRecord[];
  hasTxt: boolean;
  errorMessage?: string;
  timestamp: string;
  summary?: {
    total: number;
    spf: number;
    dkim: number;
    dmarc: number;
    verification: number;
    other: number;
  };
}

export default function DomainTxt() {
  const { t } = useTranslation();
  const [domain, setDomain] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<QueryResult | null>(null);

  const handleQuery = async () => {
    if (!domain.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/domain/txt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: domain.trim() })
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        domain: domain.trim(),
        txtRecords: [],
        hasTxt: false,
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

  const getTypeIcon = (type?: string) => {
    switch (type) {
      case 'SPF':
        return <Shield className="w-4 h-4" />;
      case 'DKIM':
        return <Key className="w-4 h-4" />;
      case 'DMARC':
        return <Mail className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type?: string) => {
    switch (type) {
      case 'SPF':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
      case 'DKIM':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
      case 'DMARC':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300';
      case 'VERIFICATION':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <PageHero
          icon={FileText}
          title="TXT 记录解析"
          description="查询域名的 TXT 记录，识别 SPF、DKIM、DMARC 等配置"
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
                ) : result.hasTxt && result.txtRecords.length > 0 ? (
                  <div className="space-y-4">
                    {result.summary && (
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                            {result.summary.total}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">总记录</div>
                        </div>
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
                          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                            {result.summary.spf}
                          </div>
                          <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">SPF</div>
                        </div>
                        <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
                          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                            {result.summary.dkim}
                          </div>
                          <div className="text-xs text-green-600 dark:text-green-400 mt-1">DKIM</div>
                        </div>
                        <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-center">
                          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                            {result.summary.dmarc}
                          </div>
                          <div className="text-xs text-purple-600 dark:text-purple-400 mt-1">DMARC</div>
                        </div>
                        <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg text-center">
                          <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                            {result.summary.verification}
                          </div>
                          <div className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">验证</div>
                        </div>
                      </div>
                    )}

                    <div className="space-y-3">
                      {result.txtRecords.map((record, index) => (
                        <Card key={index} className="p-4 bg-gray-50 dark:bg-gray-800">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-1 rounded text-xs font-medium flex items-center gap-1 ${getTypeColor(record.type)}`}>
                                {getTypeIcon(record.type)}
                                {record.type || 'OTHER'}
                              </span>
                              {record.valid !== undefined && (
                                <span className={`text-xs ${record.valid ? 'text-green-500' : 'text-red-500'}`}>
                                  {record.valid ? '✓ 有效' : '✗ 无效'}
                                </span>
                              )}
                            </div>

                            <div className="p-3 bg-white dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700">
                              <pre className="text-xs font-mono text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-all">
                                {record.value}
                              </pre>
                            </div>

                            {record.issues && record.issues.length > 0 && (
                              <div className="pl-4 border-l-2 border-red-300 dark:border-red-700">
                                <p className="text-xs font-medium text-red-600 dark:text-red-400 mb-1">问题：</p>
                                <ul className="space-y-1">
                                  {record.issues.map((issue, issueIndex) => (
                                    <li key={issueIndex} className="text-xs text-red-500">
                                      • {issue}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-yellow-700 dark:text-yellow-400">未找到 TXT 记录</p>
                      <p className="text-sm text-yellow-600 dark:text-yellow-300 mt-1">
                        该域名没有配置 TXT 记录
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>

        <div className="max-w-4xl mx-auto mt-8 p-6 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <h4 className="font-semibold mb-3 text-green-900 dark:text-green-100">关于 TXT 记录</h4>
          <ul className="space-y-2 text-sm text-green-800 dark:text-green-200">
            <li>• TXT 记录用于存储文本信息，常用于域名验证和邮件安全</li>
            <li>• SPF 记录：指定允许发送邮件的服务器，防止邮件伪造</li>
            <li>• DKIM 记录：邮件数字签名，验证邮件来源</li>
            <li>• DMARC 记录：邮件认证策略，基于 SPF 和 DKIM</li>
            <li>• 验证记录：用于域名所有权验证（Google、Microsoft 等）</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
