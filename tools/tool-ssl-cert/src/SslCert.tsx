import React, { useState } from 'react';
import { PageHero, Button, Input, Card } from '@toolbox/ui-kit';
import { ShieldCheck, Loader2, AlertCircle, CheckCircle, XCircle, Clock, Lock } from 'lucide-react';

interface CertInfo {
  subject: { CN?: string; O?: string; C?: string };
  issuer: { CN?: string; O?: string; C?: string };
  validFrom: string;
  validTo: string;
  daysRemaining: number;
  expired: boolean;
  selfSigned: boolean;
  san: string[];
  fingerprint: string;
  protocol: string;
  cipher: string;
  chain: Array<{ subject: string; issuer: string; validTo: string }>;
}

interface CertResult {
  domain: string;
  port: number;
  valid: boolean;
  certInfo: CertInfo;
  timestamp: string;
  warnings: string[];
}

export default function SslCert() {
  const [domain, setDomain] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CertResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleQuery = async () => {
    const input = domain.trim().replace(/^https?:\/\//, '').split('/')[0];
    if (!input) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('/api/ssl/cert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: input }),
      });

      const raw = await res.text();
      let data: CertResult | { error?: string } | null = null;

      try {
        data = raw ? JSON.parse(raw) : null;
      } catch {
        throw new Error('服务返回了非 JSON 响应，请检查接口是否可用');
      }

      if (!res.ok) {
        throw new Error((data && 'error' in data && data.error) || '请求失败');
      }

      if (!data || !('certInfo' in data)) {
        throw new Error('服务返回了空响应，请稍后重试');
      }

      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : '请求失败');
    } finally {
      setLoading(false);
    }
  };

  const getDaysColor = (days: number, expired: boolean) => {
    if (expired) return 'text-red-600 dark:text-red-400';
    if (days <= 7) return 'text-red-600 dark:text-red-400';
    if (days <= 30) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-green-600 dark:text-green-400';
  };

  const getDaysBg = (days: number, expired: boolean) => {
    if (expired) return 'bg-red-50 dark:bg-red-900/20';
    if (days <= 7) return 'bg-red-50 dark:bg-red-900/20';
    if (days <= 30) return 'bg-yellow-50 dark:bg-yellow-900/20';
    return 'bg-green-50 dark:bg-green-900/20';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <PageHero icon={Lock} title="SSL 证书检测" description="检测网站 SSL/TLS 证书的有效期、颁发机构和证书链" />

        <Card className="max-w-4xl mx-auto mt-8 p-6">
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="输入域名，例如：example.com"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleQuery()}
              className="flex-1"
              disabled={loading}
            />
            <Button onClick={handleQuery} disabled={loading || !domain.trim()} className="min-w-[100px]">
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
              {/* 证书状态 */}
              <div className={`flex items-center gap-3 p-4 rounded-lg ${getDaysBg(result.certInfo.daysRemaining, result.certInfo.expired)}`}>
                {result.certInfo.expired ? (
                  <XCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
                ) : result.certInfo.daysRemaining <= 30 ? (
                  <AlertCircle className="w-6 h-6 text-yellow-500 flex-shrink-0" />
                ) : (
                  <ShieldCheck className="w-6 h-6 text-green-500 flex-shrink-0" />
                )}
                <div>
                  <p className={`font-semibold ${getDaysColor(result.certInfo.daysRemaining, result.certInfo.expired)}`}>
                    {result.certInfo.expired ? '证书已过期' :
                      result.certInfo.daysRemaining <= 7 ? `证书即将过期（剩余 ${result.certInfo.daysRemaining} 天！）` :
                      result.certInfo.daysRemaining <= 30 ? `证书即将过期（剩余 ${result.certInfo.daysRemaining} 天）` :
                      `证书有效（剩余 ${result.certInfo.daysRemaining} 天）`}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                    {new Date(result.certInfo.validFrom).toLocaleDateString()} → {new Date(result.certInfo.validTo).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* 警告 */}
              {result.warnings.length > 0 && (
                <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg space-y-1">
                  {result.warnings.map((w, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-yellow-700 dark:text-yellow-300">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      {w}
                    </div>
                  ))}
                </div>
              )}

              {/* 证书详情 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="p-4 bg-gray-50 dark:bg-gray-800">
                  <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">证书主体</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="text-gray-500">CN：</span><span className="font-mono">{result.certInfo.subject.CN || '-'}</span></div>
                    <div><span className="text-gray-500">O：</span><span className="font-mono">{result.certInfo.subject.O || '-'}</span></div>
                    <div><span className="text-gray-500">C：</span><span className="font-mono">{result.certInfo.subject.C || '-'}</span></div>
                  </div>
                </Card>
                <Card className="p-4 bg-gray-50 dark:bg-gray-800">
                  <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">颁发机构</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="text-gray-500">CN：</span><span className="font-mono">{result.certInfo.issuer.CN || '-'}</span></div>
                    <div><span className="text-gray-500">O：</span><span className="font-mono">{result.certInfo.issuer.O || '-'}</span></div>
                    <div><span className="text-gray-500">自签名：</span><span className={result.certInfo.selfSigned ? 'text-yellow-600' : 'text-green-600'}>{result.certInfo.selfSigned ? '是' : '否'}</span></div>
                  </div>
                </Card>
              </div>

              {/* TLS 信息 */}
              <Card className="p-4 bg-gray-50 dark:bg-gray-800">
                <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">TLS 信息</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-gray-500">协议：</span><span className="font-mono font-medium">{result.certInfo.protocol}</span></div>
                  <div><span className="text-gray-500">加密套件：</span><span className="font-mono text-xs">{result.certInfo.cipher}</span></div>
                  <div className="col-span-2"><span className="text-gray-500">指纹：</span><span className="font-mono text-xs break-all">{result.certInfo.fingerprint}</span></div>
                </div>
              </Card>

              {/* SAN */}
              {result.certInfo.san.length > 0 && (
                <Card className="p-4 bg-gray-50 dark:bg-gray-800">
                  <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">域名覆盖（SAN）</h4>
                  <div className="flex flex-wrap gap-2">
                    {result.certInfo.san.map((s, i) => (
                      <span key={i} className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-mono rounded">{s}</span>
                    ))}
                  </div>
                </Card>
              )}

              {/* 证书链 */}
              {result.certInfo.chain.length > 0 && (
                <Card className="p-4 bg-gray-50 dark:bg-gray-800">
                  <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">证书链</h4>
                  <div className="space-y-2">
                    {result.certInfo.chain.map((cert, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm">
                        <span className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs text-gray-600 dark:text-gray-400 flex-shrink-0">#{i + 1}</span>
                        <div>
                          <span className="font-mono">{cert.subject}</span>
                          <span className="text-gray-400 mx-2">←</span>
                          <span className="font-mono text-gray-500">{cert.issuer}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          )}
        </Card>

        <div className="max-w-4xl mx-auto mt-6 p-5 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <h4 className="font-semibold mb-2 text-green-900 dark:text-green-100">SSL 证书说明</h4>
          <ul className="space-y-1 text-sm text-green-800 dark:text-green-200">
            <li>• 证书剩余 30 天以内建议尽快续期，7 天内为紧急状态</li>
            <li>• 自签名证书不受浏览器信任，正式环境请使用 CA 颁发的证书</li>
            <li>• TLS 1.2 及以上版本才被认为是安全的，避免使用 SSLv3/TLS 1.0/1.1</li>
            <li>• SAN（Subject Alternative Name）字段列出了证书覆盖的所有域名</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
