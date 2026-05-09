import React, { useState } from 'react';
import './ApiMock.css';

interface MockTemplate {
  name: string;
  description: string;
  data: any;
}

const MOCK_TEMPLATES: MockTemplate[] = [
  {
    name: '用户列表',
    description: '用户信息列表',
    data: {
      code: 200,
      message: 'success',
      data: [
        { id: 1, name: '张三', email: 'zhangsan@example.com', age: 28 },
        { id: 2, name: '李四', email: 'lisi@example.com', age: 32 },
        { id: 3, name: '王五', email: 'wangwu@example.com', age: 25 },
      ],
    },
  },
  {
    name: '用户详情',
    description: '单个用户详细信息',
    data: {
      code: 200,
      message: 'success',
      data: {
        id: 1,
        name: '张三',
        email: 'zhangsan@example.com',
        phone: '13800138000',
        avatar: 'https://via.placeholder.com/150',
        createdAt: '2024-01-01T00:00:00Z',
      },
    },
  },
  {
    name: '分页数据',
    description: '带分页的数据列表',
    data: {
      code: 200,
      message: 'success',
      data: {
        list: [
          { id: 1, title: '文章标题1', content: '文章内容...' },
          { id: 2, title: '文章标题2', content: '文章内容...' },
        ],
        pagination: {
          page: 1,
          pageSize: 10,
          total: 100,
          totalPages: 10,
        },
      },
    },
  },
  {
    name: '错误响应',
    description: '错误信息响应',
    data: {
      code: 400,
      message: '参数错误',
      error: {
        field: 'email',
        message: '邮箱格式不正确',
      },
    },
  },
  {
    name: '登录响应',
    description: '登录成功响应',
    data: {
      code: 200,
      message: 'success',
      data: {
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        user: {
          id: 1,
          name: '张三',
          email: 'zhangsan@example.com',
        },
        expiresIn: 3600,
      },
    },
  },
  {
    name: '商品列表',
    description: '电商商品列表',
    data: {
      code: 200,
      message: 'success',
      data: [
        {
          id: 1,
          name: 'iPhone 15 Pro',
          price: 7999,
          stock: 100,
          category: '手机',
          image: 'https://via.placeholder.com/300',
        },
        {
          id: 2,
          name: 'MacBook Pro',
          price: 12999,
          stock: 50,
          category: '电脑',
          image: 'https://via.placeholder.com/300',
        },
      ],
    },
  },
];

export const ApiMock: React.FC = () => {
  const [mockData, setMockData] = useState<string>(JSON.stringify(MOCK_TEMPLATES[0].data, null, 2));
  const [statusCode, setStatusCode] = useState<number>(200);
  const [delay, setDelay] = useState<number>(0);
  const [headers, setHeaders] = useState<string>('Content-Type: application/json');
  const [mockUrl, setMockUrl] = useState<string>('');

  const loadTemplate = (template: MockTemplate) => {
    setMockData(JSON.stringify(template.data, null, 2));
    setStatusCode(template.data.code || 200);
  };

  const generateMockUrl = () => {
    const blob = new Blob([mockData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    setMockUrl(url);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('已复制到剪贴板');
  };

  const formatJson = () => {
    try {
      const parsed = JSON.parse(mockData);
      setMockData(JSON.stringify(parsed, null, 2));
    } catch (error) {
      alert('JSON 格式错误');
    }
  };

  const minifyJson = () => {
    try {
      const parsed = JSON.parse(mockData);
      setMockData(JSON.stringify(parsed));
    } catch (error) {
      alert('JSON 格式错误');
    }
  };

  const generateCurlCommand = () => {
    const headersArray = headers.split('\n').filter(h => h.trim());
    const headerFlags = headersArray.map(h => `-H "${h.trim()}"`).join(' ');
    
    return `curl -X GET "http://localhost:3000/api/mock" \\
  ${headerFlags} \\
  -w "\\nHTTP Status: %{http_code}\\n"`;
  };

  return (
    <div className="api-mock">
      <div className="tool-header">
        <h1>🎭 API 响应模拟器</h1>
        <p>快速生成和测试 Mock API 响应数据</p>
      </div>

      <div className="main-section">
        <div className="editor-section">
          <div className="config-panel">
            <h3>响应配置</h3>
            <div className="config-grid">
              <div className="config-item">
                <label>HTTP 状态码</label>
                <select value={statusCode} onChange={e => setStatusCode(Number(e.target.value))}>
                  <option value="200">200 OK</option>
                  <option value="201">201 Created</option>
                  <option value="204">204 No Content</option>
                  <option value="400">400 Bad Request</option>
                  <option value="401">401 Unauthorized</option>
                  <option value="403">403 Forbidden</option>
                  <option value="404">404 Not Found</option>
                  <option value="500">500 Internal Server Error</option>
                  <option value="502">502 Bad Gateway</option>
                  <option value="503">503 Service Unavailable</option>
                </select>
              </div>

              <div className="config-item">
                <label>延迟（毫秒）</label>
                <input
                  type="number"
                  value={delay}
                  onChange={e => setDelay(Number(e.target.value))}
                  min="0"
                  step="100"
                />
              </div>
            </div>

            <div className="config-item full-width">
              <label>响应头（每行一个）</label>
              <textarea
                value={headers}
                onChange={e => setHeaders(e.target.value)}
                rows={3}
                placeholder="Content-Type: application/json&#10;Access-Control-Allow-Origin: *"
              />
            </div>
          </div>

          <div className="json-editor">
            <div className="editor-header">
              <h3>响应数据（JSON）</h3>
              <div className="editor-actions">
                <button onClick={formatJson}>格式化</button>
                <button onClick={minifyJson}>压缩</button>
                <button onClick={() => copyToClipboard(mockData)}>复制</button>
              </div>
            </div>
            <textarea
              value={mockData}
              onChange={e => setMockData(e.target.value)}
              placeholder="输入 JSON 数据..."
              spellCheck={false}
            />
          </div>

          <div className="preview-section">
            <h3>预览</h3>
            <div className="preview-info">
              <div className="info-item">
                <span className="label">状态码:</span>
                <span className={`status-badge status-${Math.floor(statusCode / 100)}xx`}>
                  {statusCode}
                </span>
              </div>
              {delay > 0 && (
                <div className="info-item">
                  <span className="label">延迟:</span>
                  <span>{delay}ms</span>
                </div>
              )}
            </div>
            <div className="preview-content">
              <pre>{mockData}</pre>
            </div>
          </div>

          <div className="curl-section">
            <h3>cURL 命令示例</h3>
            <div className="curl-command">
              <pre>{generateCurlCommand()}</pre>
              <button onClick={() => copyToClipboard(generateCurlCommand())}>复制</button>
            </div>
          </div>
        </div>

        <div className="templates-section">
          <h3>快速模板</h3>
          <div className="templates-list">
            {MOCK_TEMPLATES.map((template, index) => (
              <div
                key={index}
                className="template-item"
                onClick={() => loadTemplate(template)}
              >
                <div className="template-name">{template.name}</div>
                <div className="template-description">{template.description}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="info-section">
        <h3>💡 使用说明</h3>
        <ul>
          <li>选择或自定义 JSON 响应数据</li>
          <li>配置 HTTP 状态码和响应头</li>
          <li>设置延迟模拟网络延迟</li>
          <li>使用快速模板快速开始</li>
          <li>复制 cURL 命令进行测试</li>
        </ul>
      </div>
    </div>
  );
};

export default ApiMock;
