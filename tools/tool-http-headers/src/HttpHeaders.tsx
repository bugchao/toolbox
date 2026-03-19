import React, { useState } from 'react';
import { PageHero, Button, Input, Card } from '@toolbox/ui-kit';
import { useTranslation } from 'react-i18next';
import { Globe, Loader2, AlertCircle, CheckCircle, ShieldCheck, ShieldAlert, Info } from 'lucide-react';

interface HeaderItem {
  name: string;
  value: string;
  category: 'security' | 'cache' | 'content' | 'cors' | 'other';
  risk?: 'good' | 'warn' | 'bad';
  tip?: string;
}

interface HeaderResult {
  url: string;
  statusCode: number;
  statusText: string;
  responseTime: number;
  headers: HeaderItem[];
  redirectChain?: string[];
  securityScore: number;
  timestamp: string;
}

const SECURITY_HEADERS: Record<string, { tip: string; category: HeaderItem['category'] }> = {
  'strict-transport-security': { tip: 'HSTS：强制使用 HTTPS，防止降级攻击', category: 'security' },
  'content-security-policy': { tip: 'CSP：限制资源加载来源，防止 XSS 攻击', category: 'security' },
  'x-frame-options': { tip: '防止点击劫持（Clickjacking）攻击', category: 'security' },
  'x-content-type-options': { tip: '防止 MIME 类型嗅探攻击', category: 'security' },
  'x-xss-protection': { tip: '浏览器内置 XSS 过滤器（已被 CSP 替代）', category: 'security' },
  'referrer-policy': { tip: '控制 Referer 头信息的发送策略', category: 'security' },
  'permissions-policy': { tip: '控制浏览器功能权限（摄像头、麦克风等）', category: 'security' },
  'cache-control': { tip: '控制缓存策略', category: 'cache' },
  'etag': { tip: '资源版本标识，用于缓存验证', category: 'cache' },
  'last-modified': { tip: '资源最后修改时间', category: 'cache' },
  'content-type': { tip: '响应内容类型', category: 'content' },
  'content-encoding': { tip: '内容编码方式（gzip、br 等）', category: 'content' },
  'access-control-allow-origin': { tip: 'CORS 跨域资源共享策略', category: 'cors' },
};

function categorizeHeaders(rawHeaders: Record<string, string>): HeaderItem[] {
  return Object.entries(rawHeaders).map(([name, value]) => {
    const lowerName = name.toLowerCase();
    const known = SECURITY_HEADERS[lowerName];
    let risk: HeaderItem['risk'] = undefined;

    if (known?.category === 'security') {
      if (lowerName === 'x-frame-options' && !['deny', 'sameorigin'].includes(value.toLowerCase())) {
        risk = 'warn';
      } else if (lowerName === 'x-content-type-options' && value.toLowerCase() !== 'nosniff') {
        risk = 'warn';
      } else {
        risk = 'good';
      }
    }

    if (lowerName === 'access-control-allow-origin' && value === '*') {
      risk = 'warn';
    }

    return {
      name,
      value,
      category: known?.category || 'other',
      risk,
      tip: known?.tip,
    };
  });
}

export default function HttpHeaders() {
  const { t } = useTranslation();
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<HeaderResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const handleQuery = async () => {
    const input = url.trim();
    if (!input) return;
    const target = input.startsWith('http') ? input : `https://${input}`;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('/api/http/headers', {
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

  const categories = [
    { id: 'all', label: '全部' },
    { id: 'security', label: '🔐 安全' },
    { id: 'cache', label: '📦 缓存' },
    { id: 'content', label: '📄 内容' },
    { id: 'cors', label: '🌐 跨域' },
    { id: 'other', label: '其他' },
  ];

  const filteredHeaders = result?.headers.filter(
    (h) => activeCategory === 'all' || h.category === activeCategory
  ) || [];

  const securityHeaders = result?.headers.filter(h => h.category === 'security') || [];
  const missingSecurityHeaders = [
    'strict-transport-security', 'content-security-policy',
    'x-frame-options', 'x-content-type-options', 'referrer-policy'
  ].filter(h => !result?.headers.some(rh => rh.name.toLowerCase() === h));

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <PageHero icon={Globe} title="HTTP Header 检测" description="分析网站响应头，检测安全配置和缓存策略" />

        <Card className="max-w-5xl mx-auto mt-8 p-6">
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="输入 URL，例如：example.com 或 https://example.com"
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
            <div className="mt-6 space-y-5">
              {/* 基本信息 */}
              <div className="flex flex-wrap items-center gap-4 pb-4 border-b">
                <span className="font-mono text-sm text-gray-500 truncate max-w-xs">{result.url}</span>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  result.statusCode < 300 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                  result.statusCode < 400 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' :
                  'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                }`}>
                  {result.statusCode} {result.statusText}
                </span>
                <span className="text-sm text-gray-500">{result.responseTime}ms</span>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  result.securityScore >= 80 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                  result.securityScore >= 50 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' :
                  'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                }`}>
                  安全评分 {result.securityScore}/100
                </span>
              </div>

              {/* 重定向链 */}
              {result.redirectChain && result.redirectChain.length > 0 && (
                <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <p className="text-sm font-medium text-yellow-700 dark:text-yellow-300 mb-2">重定向链：</p>
                  <div className="space-y-1">
                    {result.redirectChain.map((u, i) => (
                      <div key={i} className="text-xs font-mono text-yellow-600 dark:text-yellow-400">
                        {i > 0 && <span className="mr-1">→</span>}{u}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 缺失的安全头 */}
              {missingSecurityHeaders.length > 0 && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <ShieldAlert className="w-4 h-4 text-red-500" />
                    <p className="text-sm font-medium text-red-700 dark:text-red-300">缺少安全响应头：</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {missingSecurityHeaders.map((h) => (
                      <span key={h} className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-mono rounded">
                        {h}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* 分类过滤 */}
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      activeCategory === cat.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {cat.label} {cat.id !== 'all' && `(${result.headers.filter(h => h.category === cat.id).length})`}
                  </button>
                ))}
              </div>

              {/* Headers 列表 */}
              <div className="space-y-2">
                {filteredHeaders.map((header, i) => (
                  <div key={i} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-start gap-2">
                      {header.risk === 'good' && <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />}
                      {header.risk === 'warn' && <AlertCircle className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />}
                      {header.risk === 'bad' && <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />}
                      {!header.risk && <Info className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-sm font-medium text-gray-800 dark:text-gray-200">{header.name}</span>
                        </div>
                        <p className="font-mono text-xs text-gray-600 dark:text-gray-400 mt-1 break-all">{header.value}</p>
                        {header.tip && <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">{header.tip}</p>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>

        <div className="max-w-5xl mx-auto mt-6 p-5 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h4 className="font-semibold mb-2 text-blue-900 dark:text-blue-100">关于 HTTP 响应头</h4>
          <ul className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
            <li>• 安全响应头可有效防止 XSS、点击劫持、CSRF 等常见 Web 攻击</li>
            <li>• HSTS 头强制客户端使用 HTTPS，防止降级攻击</li>
            <li>• CSP 头限制页面可加载的资源来源，是现代 Web 安全的重要组成</li>
            <li>• 缓存头直接影响网站性能和资源更新策略</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
