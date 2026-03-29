import React, { useState } from 'react';
import { Send, Plus, Trash2, Copy, Check, Download, History, Clock } from 'lucide-react';

interface Header {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
}

interface RequestHistory {
  id: string;
  method: string;
  url: string;
  headers: Header[];
  body: string;
  timestamp: number;
  response?: {
    status: number;
    statusText: string;
    data: any;
    time: number;
  };
}

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';
type BodyType = 'none' | 'json' | 'form-data' | 'x-www-form-urlencoded' | 'raw';

const PostmanLite: React.FC = () => {
  const [method, setMethod] = useState<HttpMethod>('GET');
  const [url, setUrl] = useState('https://api.github.com/users/octocat');
  const [headers, setHeaders] = useState<Header[]>([
    { id: '1', key: 'Content-Type', value: 'application/json', enabled: true },
  ]);
  const [bodyType, setBodyType] = useState<BodyType>('none');
  const [body, setBody] = useState('{}');
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [responseTime, setResponseTime] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'response' | 'history'>('response');
  const [history, setHistory] = useState<RequestHistory[]>([]);
  const [copied, setCopied] = useState(false);

  const methods: HttpMethod[] = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'];

  const methodColors: Record<HttpMethod, string> = {
    GET: 'text-green-600 bg-green-50 border-green-200',
    POST: 'text-blue-600 bg-blue-50 border-blue-200',
    PUT: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    DELETE: 'text-red-600 bg-red-50 border-red-200',
    PATCH: 'text-purple-600 bg-purple-50 border-purple-200',
    HEAD: 'text-gray-600 bg-gray-50 border-gray-200',
    OPTIONS: 'text-gray-600 bg-gray-50 border-gray-200',
  };

  const addHeader = () => {
    setHeaders([...headers, { id: Date.now().toString(), key: '', value: '', enabled: true }]);
  };

  const updateHeader = (id: string, field: 'key' | 'value' | 'enabled', value: any) => {
    setHeaders(headers.map(h => h.id === id ? { ...h, [field]: value } : h));
  };

  const removeHeader = (id: string) => {
    setHeaders(headers.filter(h => h.id !== id));
  };

  const sendRequest = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);
    setResponseTime(null);

    const startTime = performance.now();

    try {
      const headersObj: Record<string, string> = {};
      headers.filter(h => h.enabled && h.key).forEach(h => {
        headersObj[h.key] = h.value;
      });

      const options: RequestInit = {
        method,
        headers: headersObj,
      };

      if (['POST', 'PUT', 'PATCH'].includes(method) && bodyType !== 'none' && body) {
        if (bodyType === 'json') {
          // Validate JSON
          JSON.parse(body);
          options.body = body;
        } else if (bodyType === 'raw') {
          options.body = body;
        } else if (bodyType === 'form-data') {
          const formData = new FormData();
          const lines = body.split('\n');
          lines.forEach(line => {
            const [key, value] = line.split('=');
            if (key && value) {
              formData.append(key.trim(), value.trim());
            }
          });
          options.body = formData;
          delete headersObj['Content-Type']; // Let browser set it
        } else if (bodyType === 'x-www-form-urlencoded') {
          headersObj['Content-Type'] = 'application/x-www-form-urlencoded';
          options.body = body;
        }
      }

      const response = await fetch(url, options);
      const endTime = performance.now();
      const time = Math.round(endTime - startTime);
      setResponseTime(time);

      const contentType = response.headers.get('content-type');
      let data;
      
      if (contentType?.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      const result = {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        data,
      };

      setResponse(result);

      // Add to history
      const historyItem: RequestHistory = {
        id: Date.now().toString(),
        method,
        url,
        headers: [...headers],
        body: bodyType !== 'none' ? body : '',
        timestamp: Date.now(),
        response: {
          status: response.status,
          statusText: response.statusText,
          data,
          time,
        },
      };
      setHistory(prev => [historyItem, ...prev.slice(0, 19)]);

    } catch (err: any) {
      setError(err.message || 'Failed to send request');
      const endTime = performance.now();
      setResponseTime(Math.round(endTime - startTime));
    } finally {
      setLoading(false);
    }
  };

  const copyResponse = () => {
    if (response) {
      navigator.clipboard.writeText(JSON.stringify(response, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const downloadResponse = () => {
    if (response) {
      const blob = new Blob([JSON.stringify(response, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `response-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const loadHistoryItem = (item: RequestHistory) => {
    setMethod(item.method as HttpMethod);
    setUrl(item.url);
    setHeaders(item.headers);
    setBody(item.body);
    if (item.response) {
      setResponse({
        status: item.response.status,
        statusText: item.response.statusText,
        data: item.response.data,
      });
      setResponseTime(item.response.time);
    }
    setActiveTab('response');
  };

  const clearHistory = () => {
    setHistory([]);
  };

  const formatJSON = () => {
    try {
      const parsed = JSON.parse(body);
      setBody(JSON.stringify(parsed, null, 2));
    } catch {
      // Invalid JSON, do nothing
    }
  };

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return 'text-green-600 bg-green-50';
    if (status >= 300 && status < 400) return 'text-yellow-600 bg-yellow-50';
    if (status >= 400 && status < 500) return 'text-red-600 bg-red-50';
    if (status >= 500) return 'text-purple-600 bg-purple-50';
    return 'text-gray-600 bg-gray-50';
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Postman Lite</h1>
        <p className="text-gray-600">轻量级 API 测试工具，支持 HTTP 请求、自定义 Headers、Body、查看响应</p>
      </div>

      {/* Request Bar */}
      <div className="bg-white rounded-lg shadow p-4 mb-4">
        <div className="flex gap-2">
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value as HttpMethod)}
            className={`px-4 py-2 rounded-lg border-2 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 ${methodColors[method]}`}
          >
            {methods.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="https://api.example.com/endpoint"
          />
          
          <button
            onClick={sendRequest}
            disabled={loading}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
          >
            <Send className="w-4 h-4" />
            {loading ? 'Sending...' : 'Send'}
          </button>
        </div>

        {responseTime !== null && (
          <div className="mt-2 text-sm text-gray-500 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Response time: {responseTime}ms
          </div>
        )}
      </div>

      {/* Headers */}
      <div className="bg-white rounded-lg shadow p-4 mb-4">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-semibold">Headers</h2>
          <button
            onClick={addHeader}
            className="text-sm text-blue-500 hover:underline flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            Add Header
          </button>
        </div>
        
        <div className="space-y-2">
          {headers.map(header => (
            <div key={header.id} className="flex gap-2 items-center">
              <input
                type="checkbox"
                checked={header.enabled}
                onChange={(e) => updateHeader(header.id, 'enabled', e.target.checked)}
                className="w-4 h-4"
              />
              <input
                type="text"
                value={header.key}
                onChange={(e) => updateHeader(header.id, 'key', e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Key"
              />
              <input
                type="text"
                value={header.value}
                onChange={(e) => updateHeader(header.id, 'value', e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Value"
              />
              <button
                onClick={() => removeHeader(header.id)}
                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Body */}
      {['POST', 'PUT', 'PATCH'].includes(method) && (
        <div className="bg-white rounded-lg shadow p-4 mb-4">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold">Body</h2>
            <div className="flex gap-2 items-center">
              <select
                value={bodyType}
                onChange={(e) => setBodyType(e.target.value as BodyType)}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
              >
                <option value="none">none</option>
                <option value="json">JSON</option>
                <option value="raw">Raw</option>
                <option value="form-data">Form Data</option>
                <option value="x-www-form-urlencoded">x-www-form-urlencoded</option>
              </select>
              {bodyType === 'json' && (
                <button
                  onClick={formatJSON}
                  className="text-sm text-blue-500 hover:underline"
                >
                  Format
                </button>
              )}
            </div>
          </div>
          
          {bodyType !== 'none' && (
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm h-32 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder={bodyType === 'json' ? '{\n  "key": "value"\n}' : bodyType === 'form-data' ? 'key1=value1\nkey2=value2' : 'Enter body content...'}
            />
          )}
        </div>
      )}

      {/* Response / History Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b">
          <div className="flex gap-4 px-4">
            <button
              onClick={() => setActiveTab('response')}
              className={`py-3 px-2 border-b-2 transition ${
                activeTab === 'response'
                  ? 'border-blue-500 text-blue-500'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Response
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`py-3 px-2 border-b-2 transition ${
                activeTab === 'history'
                  ? 'border-blue-500 text-blue-500'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              History ({history.length})
            </button>
          </div>
        </div>

        <div className="p-4">
          {/* Response Tab */}
          {activeTab === 'response' && (
            <div>
              {response && (
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${getStatusColor(response.status)}`}>
                      {response.status} {response.statusText}
                    </span>
                    {responseTime !== null && (
                      <span className="text-sm text-gray-500">{responseTime}ms</span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={copyResponse}
                      className="text-sm text-blue-500 hover:underline flex items-center gap-1"
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      {copied ? '已复制' : '复制'}
                    </button>
                    <button
                      onClick={downloadResponse}
                      className="text-sm text-blue-500 hover:underline flex items-center gap-1"
                    >
                      <Download className="w-4 h-4" />
                      下载
                    </button>
                  </div>
                </div>
              )}
              
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                  <strong>Error:</strong> {error}
                </div>
              )}
              
              {loading && (
                <div className="text-center py-8 text-gray-500">
                  <div className="animate-spin inline-block w-6 h-6 border-2 border-current border-t-transparent rounded-full mr-2"></div>
                  Waiting for response...
                </div>
              )}
              
              {response && !loading && (
                <pre className="bg-gray-50 p-4 rounded-lg overflow-auto max-h-96 text-sm font-mono">
                  {typeof response.data === 'string' 
                    ? response.data 
                    : JSON.stringify(response.data, null, 2)}
                </pre>
              )}
              
              {!response && !loading && !error && (
                <div className="text-center py-8 text-gray-400">
                  Send a request to see the response
                </div>
              )}
            </div>
          )}

          {/* History Tab */}
          {activeTab === 'history' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold">Request History</h3>
                {history.length > 0 && (
                  <button
                    onClick={clearHistory}
                    className="text-sm text-red-500 hover:underline flex items-center gap-1"
                  >
                    <Trash2 className="w-4 h-4" />
                    清空
                  </button>
                )}
              </div>
              
              {history.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  No request history yet
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-auto">
                  {history.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => loadHistoryItem(item)}
                      className="border rounded-lg p-3 hover:bg-gray-50 cursor-pointer transition"
                    >
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${methodColors[item.method as HttpMethod]}`}>
                          {item.method}
                        </span>
                        <span className="flex-1 font-mono text-sm truncate">{item.url}</span>
                        {item.response && (
                          <span className={`px-2 py-1 rounded text-xs font-bold ${getStatusColor(item.response.status)}`}>
                            {item.response.status}
                          </span>
                        )}
                        <span className="text-xs text-gray-400">{item.response?.time}ms</span>
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {new Date(item.timestamp).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Quick Start Guide */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-800 mb-2">💡 使用指南</h3>
        <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
          <li>选择 HTTP 方法（GET, POST, PUT, DELETE 等）</li>
          <li>输入 API 端点 URL</li>
          <li>可选：添加自定义 Headers（如 Authorization, Content-Type）</li>
          <li>对于 POST/PUT/PATCH 请求，可在 Body 中输入数据（支持 JSON, Form Data 等）</li>
          <li>点击 Send 发送请求</li>
          <li>查看响应状态码、响应时间和响应内容</li>
          <li>历史记录自动保存，点击可重新加载请求</li>
        </ol>
      </div>
    </div>
  );
};

export default PostmanLite;
