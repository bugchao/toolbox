import React, { useState, useRef } from 'react';
import { Play, Book, History, Settings, Download, Trash2, Copy, Check } from 'lucide-react';

interface QueryHistory {
  id: string;
  query: string;
  variables: string;
  endpoint: string;
  timestamp: number;
  result?: any;
}

interface SchemaField {
  name: string;
  type: string;
  description?: string;
  args?: { name: string; type: string }[];
}

interface SchemaType {
  name: string;
  fields?: SchemaField[];
  description?: string;
}

const GraphQLPlayground: React.FC = () => {
  const [endpoint, setEndpoint] = useState('https://api.github.com/graphql');
  const [query, setQuery] = useState(`# Write your GraphQL query here
query {
  viewer {
    login
    name
    avatarUrl
  }
}`);
  const [variables, setVariables] = useState('{}');
  const [headers, setHeaders] = useState('{\n  "Authorization": "Bearer YOUR_TOKEN"\n}');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'result' | 'schema' | 'history'>('result');
  const [history, setHistory] = useState<QueryHistory[]>([]);
  const [schema, setSchema] = useState<SchemaType[]>([]);
  const [copied, setCopied] = useState(false);

  const executeQuery = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const parsedVariables = variables.trim() ? JSON.parse(variables) : {};
      const parsedHeaders = headers.trim() ? JSON.parse(headers) : {};

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...parsedHeaders,
        },
        body: JSON.stringify({
          query,
          variables: parsedVariables,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.errors?.[0]?.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      setResult(data);
      
      // Add to history
      const historyItem: QueryHistory = {
        id: Date.now().toString(),
        query,
        variables,
        endpoint,
        timestamp: Date.now(),
        result: data,
      };
      setHistory(prev => [historyItem, ...prev.slice(0, 19)]);

    } catch (err: any) {
      setError(err.message || 'Failed to execute query');
    } finally {
      setLoading(false);
    }
  };

  const introspectSchema = async () => {
    setLoading(true);
    setError(null);

    try {
      const parsedHeaders = headers.trim() ? JSON.parse(headers) : {};
      
      const introspectionQuery = `
        query IntrospectionQuery {
          __schema {
            types {
              name
              kind
              description
              fields {
                name
                description
                args {
                  name
                  type {
                    name
                    kind
                  }
                }
                type {
                  name
                  kind
                }
              }
            }
          }
        }
      `;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...parsedHeaders,
        },
        body: JSON.stringify({
          query: introspectionQuery,
        }),
      });

      const data = await response.json();

      if (data.data?.__schema?.types) {
        const filteredTypes = data.data.__schema.types
          .filter((t: any) => t.kind === 'OBJECT' && !t.name.startsWith('__'))
          .map((t: any) => ({
            name: t.name,
            description: t.description,
            fields: t.fields?.map((f: any) => ({
              name: f.name,
              type: f.type?.name || f.type?.kind,
              description: f.description,
              args: f.args?.map((a: any) => ({
                name: a.name,
                type: a.type?.name || a.type?.kind,
              })),
            })),
          }));
        setSchema(filteredTypes);
        setActiveTab('schema');
      }
    } catch (err: any) {
      setError('Failed to introspect schema: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyResult = () => {
    if (result) {
      navigator.clipboard.writeText(JSON.stringify(result, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const loadHistoryItem = (item: QueryHistory) => {
    setQuery(item.query);
    setVariables(item.variables);
    setEndpoint(item.endpoint);
    setResult(item.result);
  };

  const clearHistory = () => {
    setHistory([]);
  };

  const formatJSON = (text: string, setter: (val: string) => void) => {
    try {
      const parsed = JSON.parse(text);
      setter(JSON.stringify(parsed, null, 2));
    } catch {
      // Invalid JSON, do nothing
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">GraphQL Playground</h1>
        <p className="text-gray-600">GraphQL API 探索和测试工具，支持查询执行、Schema 内省、历史记录</p>
      </div>

      {/* Endpoint & Auth */}
      <div className="mb-4 bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">GraphQL Endpoint</label>
            <input
              type="url"
              value={endpoint}
              onChange={(e) => setEndpoint(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="https://api.example.com/graphql"
            />
          </div>
          <div className="flex items-end gap-2">
            <button
              onClick={introspectSchema}
              disabled={loading}
              className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition flex items-center gap-2 disabled:opacity-50"
            >
              <Book className="w-4 h-4" />
              获取 Schema
            </button>
            <button
              onClick={executeQuery}
              disabled={loading}
              className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition flex items-center gap-2 disabled:opacity-50"
            >
              <Play className="w-4 h-4" />
              {loading ? '执行中...' : '执行查询'}
            </button>
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium mb-1">Headers (JSON)</label>
          <textarea
            value={headers}
            onChange={(e) => setHeaders(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm h-20 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder='{"Authorization": "Bearer token"}'
          />
          <button
            onClick={() => formatJSON(headers, setHeaders)}
            className="mt-1 text-xs text-blue-500 hover:underline"
          >
            格式化 JSON
          </button>
        </div>
      </div>

      {/* Main Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        {/* Query Editor */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-semibold">Query</h2>
            <button
              onClick={() => formatJSON(query, setQuery)}
              className="text-xs text-blue-500 hover:underline"
            >
              格式化
            </button>
          </div>
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm h-64 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Write your GraphQL query..."
          />
        </div>

        {/* Variables Editor */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-semibold">Variables</h2>
            <button
              onClick={() => formatJSON(variables, setVariables)}
              className="text-xs text-blue-500 hover:underline"
            >
              格式化
            </button>
          </div>
          <textarea
            value={variables}
            onChange={(e) => setVariables(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm h-64 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder='{"key": "value"}'
          />
        </div>
      </div>

      {/* Result Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b">
          <div className="flex gap-4 px-4">
            <button
              onClick={() => setActiveTab('result')}
              className={`py-3 px-2 border-b-2 transition ${
                activeTab === 'result'
                  ? 'border-blue-500 text-blue-500'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Result
            </button>
            <button
              onClick={() => setActiveTab('schema')}
              className={`py-3 px-2 border-b-2 transition ${
                activeTab === 'schema'
                  ? 'border-blue-500 text-blue-500'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Schema
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
          {/* Result Tab */}
          {activeTab === 'result' && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold">Response</h3>
                <div className="flex gap-2">
                  {result && (
                    <button
                      onClick={copyResult}
                      className="text-sm text-blue-500 hover:underline flex items-center gap-1"
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      {copied ? '已复制' : '复制'}
                    </button>
                  )}
                </div>
              </div>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                  <strong>Error:</strong> {error}
                </div>
              )}
              {loading && (
                <div className="text-center py-8 text-gray-500">
                  <div className="animate-spin inline-block w-6 h-6 border-2 border-current border-t-transparent rounded-full mr-2"></div>
                  Executing query...
                </div>
              )}
              {result && !loading && (
                <pre className="bg-gray-50 p-4 rounded-lg overflow-auto max-h-96 text-sm font-mono">
                  {JSON.stringify(result, null, 2)}
                </pre>
              )}
              {!result && !loading && !error && (
                <div className="text-center py-8 text-gray-400">
                  Execute a query to see the result
                </div>
              )}
            </div>
          )}

          {/* Schema Tab */}
          {activeTab === 'schema' && (
            <div>
              <h3 className="font-semibold mb-4">Schema Types ({schema.length})</h3>
              {schema.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  Click "获取 Schema" to load the schema
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-auto">
                  {schema.map((type) => (
                    <div key={type.name} className="border rounded-lg p-4">
                      <h4 className="font-mono font-bold text-lg text-purple-600">{type.name}</h4>
                      {type.description && (
                        <p className="text-gray-600 text-sm mb-2">{type.description}</p>
                      )}
                      {type.fields && type.fields.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {type.fields.map((field) => (
                            <div key={field.name} className="pl-4 border-l-2 border-gray-200">
                              <div className="font-mono text-sm">
                                <span className="text-blue-600">{field.name}</span>
                                {field.args && field.args.length > 0 && (
                                  <span className="text-gray-500">
                                    ({field.args.map(a => `${a.name}: ${a.type}`).join(', ')})
                                  </span>
                                )}
                                <span className="text-gray-400">: </span>
                                <span className="text-green-600">{field.type}</span>
                              </div>
                              {field.description && (
                                <p className="text-gray-500 text-xs">{field.description}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* History Tab */}
          {activeTab === 'history' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold">Query History</h3>
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
                  No query history yet
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-auto">
                  {history.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => loadHistoryItem(item)}
                      className="border rounded-lg p-3 hover:bg-gray-50 cursor-pointer transition"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <pre className="text-xs font-mono text-gray-700 line-clamp-2">
                            {item.query}
                          </pre>
                          <div className="text-xs text-gray-400 mt-1">
                            {new Date(item.timestamp).toLocaleString()}
                          </div>
                        </div>
                        <div className="text-xs text-gray-400 ml-4">
                          {item.result?.data ? '✅' : item.result?.errors ? '❌' : '⏳'}
                        </div>
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
          <li>输入 GraphQL API 端点 URL（如 GitHub: https://api.github.com/graphql）</li>
          <li>在 Headers 中输入认证信息（如 Authorization: Bearer YOUR_TOKEN）</li>
          <li>在 Query 编辑器中编写 GraphQL 查询</li>
          <li>可选：在 Variables 中输入变量（JSON 格式）</li>
          <li>点击「执行查询」发送请求</li>
          <li>点击「获取 Schema」查看 API 支持的类型和字段</li>
          <li>历史记录会自动保存，点击可重新加载</li>
        </ol>
      </div>
    </div>
  );
};

export default GraphQLPlayground;
