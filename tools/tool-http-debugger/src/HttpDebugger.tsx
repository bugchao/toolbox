import React, { useState } from 'react';

interface Header {
  key: string;
  value: string;
}

interface Response {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: any;
  time: number;
}

export default function HttpDebugger() {
  const [method, setMethod] = useState('GET');
  const [url, setUrl] = useState('');
  const [headers, setHeaders] = useState<Header[]>([{ key: '', value: '' }]);
  const [body, setBody] = useState('');
  const [response, setResponse] = useState<Response | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addHeader = () => {
    setHeaders([...headers, { key: '', value: '' }]);
  };

  const updateHeader = (index: number, field: 'key' | 'value', value: string) => {
    const newHeaders = [...headers];
    newHeaders[index][field] = value;
    setHeaders(newHeaders);
  };

  const removeHeader = (index: number) => {
    setHeaders(headers.filter((_, i) => i !== index));
  };

  const sendRequest = async () => {
    if (!url.trim()) {
      alert('请输入 URL');
      return;
    }

    setLoading(true);
    setError(null);
    setResponse(null);

    const startTime = Date.now();

    try {
      const requestHeaders: Record<string, string> = {};
      headers.forEach(h => {
        if (h.key.trim() && h.value.trim()) {
          requestHeaders[h.key] = h.value;
        }
      });

      const options: RequestInit = {
        method,
        headers: requestHeaders,
      };

      if (method !== 'GET' && method !== 'HEAD' && body.trim()) {
        options.body = body;
      }

      const res = await fetch(url, options);
      const endTime = Date.now();

      const responseHeaders: Record<string, string> = {};
      res.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      let data;
      const contentType = res.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        data = await res.json();
      } else {
        data = await res.text();
      }

      setResponse({
        status: res.status,
        statusText: res.statusText,
        headers: responseHeaders,
        data,
        time: endTime - startTime,
      });
    } catch (err: any) {
      setError(err.message || '请求失败');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return 'text-green-600 bg-green-50';
    if (status >= 300 && status < 400) return 'text-blue-600 bg-blue-50';
    if (status >= 400 && status < 500) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">🔧 HTTP 请求调试器</h1>
          <p className="text-gray-600">在线发送 HTTP 请求，调试 API 接口</p>
        </div>

        {/* 请求配置 */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">请求配置</h2>

          {/* 方法和 URL */}
          <div className="flex gap-2 mb-4">
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            >
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="PATCH">PATCH</option>
              <option value="DELETE">DELETE</option>
              <option value="HEAD">HEAD</option>
              <option value="OPTIONS">OPTIONS</option>
            </select>

            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://api.example.com/endpoint"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />

            <button
              onClick={sendRequest}
              disabled={loading}
              className="px-8 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-semibold hover:from-cyan-600 hover:to-blue-600 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? '发送中...' : '发送'}
            </button>
          </div>

          {/* Headers */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">请求头 (Headers)</label>
              <button
                onClick={addHeader}
                className="text-sm text-cyan-600 hover:text-cyan-700 font-medium"
              >
                + 添加
              </button>
            </div>

            <div className="space-y-2">
              {headers.map((header, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={header.key}
                    onChange={(e) => updateHeader(index, 'key', e.target.value)}
                    placeholder="Key"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  />
                  <input
                    type="text"
                    value={header.value}
                    onChange={(e) => updateHeader(index, 'value', e.target.value)}
                    placeholder="Value"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  />
                  {headers.length > 1 && (
                    <button
                      onClick={() => removeHeader(index)}
                      className="px-3 text-red-500 hover:text-red-700"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Body */}
          {method !== 'GET' && method !== 'HEAD' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                请求体 (Body)
              </label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder='{"key": "value"}'
                rows={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none"
              />
            </div>
          )}
        </div>

        {/* 错误信息 */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-2 text-red-700">
              <span className="text-xl">⚠️</span>
              <span className="font-medium">请求失败</span>
            </div>
            <div className="mt-2 text-sm text-red-600">{error}</div>
          </div>
        )}

        {/* 响应结果 */}
        {response && (
          <div className="space-y-4">
            {/* 状态信息 */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-lg font-semibold mb-4">响应状态</h2>
              <div className="flex items-center gap-4">
                <div className={`px-4 py-2 rounded-lg font-semibold ${getStatusColor(response.status)}`}>
                  {response.status} {response.statusText}
                </div>
                <div className="text-sm text-gray-600">
                  耗时: <span className="font-semibold">{response.time}ms</span>
                </div>
              </div>
            </div>

            {/* 响应头 */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-lg font-semibold mb-4">响应头 (Response Headers)</h2>
              <div className="bg-gray-50 rounded-lg p-4 font-mono text-sm overflow-x-auto">
                {Object.entries(response.headers).map(([key, value]) => (
                  <div key={key} className="mb-1">
                    <span className="text-cyan-600">{key}:</span>{' '}
                    <span className="text-gray-700">{String(value)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 响应体 */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-lg font-semibold mb-4">响应体 (Response Body)</h2>
              <div className="bg-gray-50 rounded-lg p-4 font-mono text-sm overflow-x-auto">
                <pre className="whitespace-pre-wrap break-words">
                  {typeof response.data === 'string'
                    ? response.data
                    : JSON.stringify(response.data, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* 使用提示 */}
        <div className="mt-6 bg-cyan-50 border border-cyan-200 rounded-lg p-4">
          <h3 className="font-semibold text-cyan-800 mb-2">💡 使用提示</h3>
          <ul className="text-sm text-cyan-700 space-y-1">
            <li>• 支持常见的 HTTP 方法：GET、POST、PUT、PATCH、DELETE 等</li>
            <li>• 可以自定义请求头，例如 Authorization、Content-Type 等</li>
            <li>• POST/PUT/PATCH 请求可以添加请求体（JSON 或其他格式）</li>
            <li>• 注意：受浏览器 CORS 策略限制，部分跨域请求可能失败</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
