import React, { useState } from 'react';
import { PageHero, Button, Input, Card } from '@toolbox/ui-kit';
import { Activity, Loader2, AlertCircle, CheckCircle, XCircle, ArrowRight, Clock } from 'lucide-react';

interface RedirectStep {
  url: string;
  statusCode: number;
  statusText: string;
}

interface StatusResult {
  url: string;
  finalUrl: string;
  statusCode: number;
  statusText: string;
  statusCategory: string;
  responseTime: number;
  redirectChain: RedirectStep[];
  available: boolean;
  timestamp: string;
  tip: string;
}

const STATUS_TIPS: Record<number, string> = {
  200: '请求成功，服务正常运行',
  201: '资源创建成功',
  204: '请求成功，无响应内容',
  301: '永久重定向',
  302: '临时重定向',
  304: '资源未修改，使用缓存版本',
  400: '请求语法错误，服务器无法处理',
  401: '需要身份验证',
  403: '禁止访问，权限不足',
  404: '资源不存在',
  405: '请求方法不被允许',
  408: '请求超时',
  429: '请求过于频繁，触发限流',
  500: '服务器内部错误',
  502: '网关错误，上游服务器无响应',
  503: '服务暂时不可用',
  504: '网关超时',
};

export default function HttpStatus() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<StatusResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleQuery = async () => {
    const input = url.trim();
    if (!input) return;
    const target = input.startsWith('http') ? input : `https://${input}`;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('/api/http/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: target }),
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

  const getStatusColor = (code: number) => {
    if (code < 300) return 'text-green-600 dark:text-green-400';
    if (code < 400) return 'text-blue-600 dark:text-blue-400';
    if (code < 500) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getStatusBg = (code: number) => {
    if (code < 300) return 'bg-green-50 dark:bg-green-900/20';
    if (code < 400) return 'bg-blue-50 dark:bg-blue-900/20';
    if (code < 500) return 'bg-yellow-50 dark:bg-yellow-900/20';
    return 'bg-red-50 dark:bg-red-900/20';
  };

  const getStatusIcon = (code: number) => {
    if (code < 300) return <CheckCircle className="w-6 h-6 text-green-500" />;
    if (code < 400) return <ArrowRight className="w-6 h-6 text-blue-500" />;
    if (code < 500) return <AlertCircle className="w-6 h-6 text-yellow-500" />;
    return <XCircle className="w-6 h-6 text-red-500" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <PageHero icon={Activity} title="HTTP 状态检测" description="检测网站可用性、HTTP 状态码和重定向链" />

        <Card className="max-w-4xl mx-auto mt-8 p-6">
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="输入 URL，例如：example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleQuery()}
              className="flex-1"
              disabled={loading}
            />
            <Button onClick={handleQuery} disabled={loading || !url.trim()} className="min-w-[100px]">
              {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />检测中</> : '检测'}
            </Button>
          </div>

          {error && (
            <div className="mt-4 flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600 dark:text-red-300">{error}</p>
            </div>
          )}

          {result && (
            <div className="mt-6 space-y-4">
              {/* 主状态 */}
              <div className={`flex items-center gap-4 p-4 rounded-lg ${getStatusBg(result.statusCode)}`}>
                {getStatusIcon(result.statusCode)}
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className={`text-3xl font-bold font-mono ${getStatusColor(result.statusCode)}`}>
                      {result.statusCode}
                    </span>
                    <span className={`text-lg font-medium ${getStatusColor(result.statusCode)}`}>
                      {result.statusText}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{result.tip}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-gray-500 text-sm">
                    <Clock className="w-4 h-4" />
                    <span>{result.responseTime}ms</span>
                  </div>
                  <div className={`text-xs mt-1 ${result.available ? 'text-green-500' : 'text-red-500'}`}>
                    {result.available ? '● 可访问' : '● 不可访问'}
                  </div>
                </div>
              </div>

              {/* URL 信息 */}
              <Card className="p-4 bg-gray-50 dark:bg-gray-800">
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-500 mr-2">请求 URL：</span>
                    <span className="font-mono break-all">{result.url}</span>
                  </div>
                  {result.finalUrl !== result.url && (
                    <div>
                      <span className="text-gray-500 mr-2">最终 URL：</span>
                      <span className="font-mono break-all text-blue-600 dark:text-blue-400">{result.finalUrl}</span>
                    </div>
                  )}
                </div>
              </Card>

              {/* 重定向链 */}
              {result.redirectChain.length > 1 && (
                <Card className="p-4 bg-gray-50 dark:bg-gray-800">
                  <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">
                    重定向链（{result.redirectChain.length} 跳）
                  </h4>
                  <div className="space-y-2">
                    {result.redirectChain.map((step, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <span className={`px-2 py-0.5 rounded text-xs font-mono font-semibold flex-shrink-0 ${
                          step.statusCode < 300 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                          step.statusCode < 400 ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
                          'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                        }`}>
                          {step.statusCode}
                        </span>
                        <span className="font-mono text-sm break-all text-gray-700 dark:text-gray-300">{step.url}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* 状态码说明 */}
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">状态码分类</h4>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs text-center">
                  {['1xx 信息', '2xx 成功', '3xx 重定向', '4xx 客户端错误', '5xx 服务端错误'].map((label, i) => (
                    <div key={i} className={`p-2 rounded ${
                      result.statusCode >= (i + 1) * 100 && result.statusCode < (i + 2) * 100
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-semibold'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-500'
                    }`}>{label}</div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </Card>

        <div className="max-w-4xl mx-auto mt-6 p-5 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
          <h4 className="font-semibold mb-2 text-indigo-900 dark:text-indigo-100">常见 HTTP 状态码</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm text-indigo-800 dark:text-indigo-200">
            {Object.entries(STATUS_TIPS).map(([code, tip]) => (
              <div key={code}><span className="font-mono font-semibold">{code}</span> - {tip}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
