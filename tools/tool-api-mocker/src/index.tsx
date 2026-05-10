import React, { useState } from 'react';

interface MockEndpoint {
  id: string;
  method: string;
  path: string;
  response: string;
  statusCode: number;
  delay: number;
}

const APIMocker: React.FC = () => {
  const [endpoints, setEndpoints] = useState<MockEndpoint[]>([]);
  const [method, setMethod] = useState('GET');
  const [path, setPath] = useState('');
  const [response, setResponse] = useState('');
  const [statusCode, setStatusCode] = useState(200);
  const [delay, setDelay] = useState(0);

  const templates = [
    {
      name: '用户列表',
      method: 'GET',
      path: '/api/users',
      response: JSON.stringify({
        users: [
          { id: 1, name: '张三', email: 'zhangsan@example.com' },
          { id: 2, name: '李四', email: 'lisi@example.com' }
        ]
      }, null, 2),
      statusCode: 200
    },
    {
      name: '创建成功',
      method: 'POST',
      path: '/api/users',
      response: JSON.stringify({
        success: true,
        message: '创建成功',
        data: { id: 3, name: '新用户' }
      }, null, 2),
      statusCode: 201
    },
    {
      name: '错误响应',
      method: 'GET',
      path: '/api/error',
      response: JSON.stringify({
        error: 'Not Found',
        message: '资源不存在'
      }, null, 2),
      statusCode: 404
    }
  ];

  const addEndpoint = () => {
    if (!path || !response) return;
    
    const endpoint: MockEndpoint = {
      id: Date.now().toString(),
      method,
      path,
      response,
      statusCode,
      delay
    };
    
    setEndpoints([...endpoints, endpoint]);
    setPath('');
    setResponse('');
  };

  const deleteEndpoint = (id: string) => {
    setEndpoints(endpoints.filter(e => e.id !== id));
  };

  const loadTemplate = (template: typeof templates[0]) => {
    setMethod(template.method);
    setPath(template.path);
    setResponse(template.response);
    setStatusCode(template.statusCode);
  };

  const formatJSON = () => {
    try {
      const parsed = JSON.parse(response);
      setResponse(JSON.stringify(parsed, null, 2));
    } catch (e) {
      alert('JSON 格式错误');
    }
  };

  const copyEndpoint = (endpoint: MockEndpoint) => {
    const text = `${endpoint.method} ${endpoint.path}\nStatus: ${endpoint.statusCode}\n\n${endpoint.response}`;
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold mb-6">🔌 API 响应模拟器</h1>
        
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">创建 Mock 接口</h2>
            
            <div className="flex gap-2">
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="px-4 py-2 border rounded-lg"
              >
                <option>GET</option>
                <option>POST</option>
                <option>PUT</option>
                <option>DELETE</option>
                <option>PATCH</option>
              </select>
              <input
                type="text"
                value={path}
                onChange={(e) => setPath(e.target.value)}
                placeholder="/api/endpoint"
                className="flex-1 px-4 py-2 border rounded-lg font-mono"
              />
            </div>

            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-sm mb-1">状态码</label>
                <input
                  type="number"
                  value={statusCode}
                  onChange={(e) => setStatusCode(parseInt(e.target.value))}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm mb-1">延迟(ms)</label>
                <input
                  type="number"
                  value={delay}
                  onChange={(e) => setDelay(parseInt(e.target.value))}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm mb-1">响应内容</label>
              <textarea
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                placeholder='{"message": "Hello"}'
                className="w-full h-48 p-4 border rounded-lg font-mono text-sm"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={formatJSON}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
              >
                格式化 JSON
              </button>
              <button
                onClick={addEndpoint}
                className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
              >
                添加接口
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">快速模板</label>
              <div className="space-y-2">
                {templates.map((t, i) => (
                  <button
                    key={i}
                    onClick={() => loadTemplate(t)}
                    className="w-full px-4 py-2 bg-blue-50 hover:bg-blue-100 rounded-lg text-left text-sm"
                  >
                    {t.name} - {t.method} {t.path}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Mock 接口列表</h2>
            <div className="space-y-3">
              {endpoints.map(endpoint => (
                <div key={endpoint.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        endpoint.method === 'GET' ? 'bg-green-100 text-green-800' :
                        endpoint.method === 'POST' ? 'bg-blue-100 text-blue-800' :
                        endpoint.method === 'PUT' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {endpoint.method}
                      </span>
                      <span className="ml-2 font-mono text-sm">{endpoint.path}</span>
                    </div>
                    <button
                      onClick={() => deleteEndpoint(endpoint.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      删除
                    </button>
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    状态码: {endpoint.statusCode} | 延迟: {endpoint.delay}ms
                  </div>
                  <pre className="bg-gray-50 p-2 rounded text-xs overflow-x-auto">
                    {endpoint.response}
                  </pre>
                  <button
                    onClick={() => copyEndpoint(endpoint)}
                    className="mt-2 text-sm text-blue-500 hover:text-blue-700"
                  >
                    复制
                  </button>
                </div>
              ))}
            </div>
            {endpoints.length === 0 && (
              <div className="text-center text-gray-400 py-12">
                还没有 Mock 接口，创建一个开始吧！
              </div>
            )}
          </div>
        </div>

        <div className="p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold mb-2">💡 使用说明</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• 快速创建 Mock API 接口用于前端开发</li>
            <li>• 支持自定义状态码和响应延迟</li>
            <li>• 使用模板快速生成常见响应</li>
            <li>• 适合前后端分离开发场景</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default APIMocker;
