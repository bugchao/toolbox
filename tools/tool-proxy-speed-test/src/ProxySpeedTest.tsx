import React, { useState } from 'react';
import './ProxySpeedTest.css';

interface ProxyConfig {
  id: string;
  name: string;
  host: string;
  port: string;
  type: 'http' | 'https' | 'socks5';
  username?: string;
  password?: string;
}

interface TestResult {
  id: string;
  name: string;
  status: 'pending' | 'testing' | 'success' | 'failed';
  latency?: number;
  speed?: number;
  error?: string;
}

export const ProxySpeedTest: React.FC = () => {
  const [proxies, setProxies] = useState<ProxyConfig[]>([]);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isTestingAll, setIsTestingAll] = useState(false);
  const [newProxy, setNewProxy] = useState<ProxyConfig>({
    id: '',
    name: '',
    host: '',
    port: '',
    type: 'http',
  });

  const addProxy = () => {
    if (!newProxy.name || !newProxy.host || !newProxy.port) {
      alert('请填写代理名称、主机和端口');
      return;
    }

    const proxy: ProxyConfig = {
      ...newProxy,
      id: Date.now().toString(),
    };

    setProxies([...proxies, proxy]);
    setNewProxy({
      id: '',
      name: '',
      host: '',
      port: '',
      type: 'http',
    });
  };

  const removeProxy = (id: string) => {
    setProxies(proxies.filter(p => p.id !== id));
    setTestResults(testResults.filter(r => r.id !== id));
  };

  const testProxy = async (proxy: ProxyConfig) => {
    const result: TestResult = {
      id: proxy.id,
      name: proxy.name,
      status: 'testing',
    };

    setTestResults(prev => {
      const filtered = prev.filter(r => r.id !== proxy.id);
      return [...filtered, result];
    });

    try {
      const startTime = Date.now();
      
      // 模拟代理测试（实际应用中需要后端支持）
      // 这里使用公开的测试API来模拟延迟测试
      const testUrl = 'https://www.google.com/generate_204';
      
      // 注意：浏览器环境无法直接测试代理，这里仅做演示
      // 实际应用需要后端服务支持
      const response = await fetch(testUrl, {
        method: 'HEAD',
        mode: 'no-cors',
      });

      const latency = Date.now() - startTime;

      // 模拟速度测试
      const speedTestStart = Date.now();
      const speedTestUrl = 'https://speed.cloudflare.com/__down?bytes=1000000';
      
      await fetch(speedTestUrl, {
        method: 'GET',
        mode: 'no-cors',
      });

      const speedTestTime = (Date.now() - speedTestStart) / 1000;
      const speed = (1000000 / 1024 / 1024) / speedTestTime; // MB/s

      result.status = 'success';
      result.latency = latency;
      result.speed = speed;
    } catch (error) {
      result.status = 'failed';
      result.error = error instanceof Error ? error.message : '测试失败';
    }

    setTestResults(prev => {
      const filtered = prev.filter(r => r.id !== proxy.id);
      return [...filtered, result];
    });
  };

  const testAllProxies = async () => {
    setIsTestingAll(true);
    
    for (const proxy of proxies) {
      await testProxy(proxy);
    }
    
    setIsTestingAll(false);
  };

  const importFromText = (text: string) => {
    // 支持多种格式导入
    // 格式1: name|host:port|type
    // 格式2: host:port
    const lines = text.split('\n').filter(line => line.trim());
    const imported: ProxyConfig[] = [];

    lines.forEach(line => {
      const parts = line.split('|');
      
      if (parts.length >= 2) {
        // 格式1
        const [name, hostPort, type] = parts;
        const [host, port] = hostPort.split(':');
        
        imported.push({
          id: Date.now().toString() + Math.random(),
          name: name.trim(),
          host: host.trim(),
          port: port.trim(),
          type: (type?.trim() as any) || 'http',
        });
      } else {
        // 格式2
        const [host, port] = line.split(':');
        if (host && port) {
          imported.push({
            id: Date.now().toString() + Math.random(),
            name: `${host}:${port}`,
            host: host.trim(),
            port: port.trim(),
            type: 'http',
          });
        }
      }
    });

    setProxies([...proxies, ...imported]);
  };

  const exportResults = () => {
    const results = testResults.map(r => {
      const proxy = proxies.find(p => p.id === r.id);
      return {
        name: r.name,
        host: proxy?.host,
        port: proxy?.port,
        type: proxy?.type,
        status: r.status,
        latency: r.latency,
        speed: r.speed,
        error: r.error,
      };
    });

    const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `proxy-test-results-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="proxy-speed-test">
      <div className="tool-header">
        <h1>🚀 代理速度测试</h1>
        <p>测试代理服务器的延迟和速度</p>
      </div>

      <div className="add-proxy-section">
        <h2>添加代理</h2>
        <div className="proxy-form">
          <input
            type="text"
            placeholder="代理名称"
            value={newProxy.name}
            onChange={e => setNewProxy({ ...newProxy, name: e.target.value })}
          />
          <input
            type="text"
            placeholder="主机地址"
            value={newProxy.host}
            onChange={e => setNewProxy({ ...newProxy, host: e.target.value })}
          />
          <input
            type="text"
            placeholder="端口"
            value={newProxy.port}
            onChange={e => setNewProxy({ ...newProxy, port: e.target.value })}
          />
          <select
            value={newProxy.type}
            onChange={e => setNewProxy({ ...newProxy, type: e.target.value as any })}
          >
            <option value="http">HTTP</option>
            <option value="https">HTTPS</option>
            <option value="socks5">SOCKS5</option>
          </select>
          <button onClick={addProxy}>添加</button>
        </div>

        <div className="import-section">
          <h3>批量导入</h3>
          <textarea
            placeholder="每行一个代理，格式：名称|主机:端口|类型 或 主机:端口"
            rows={5}
            onChange={e => {
              if (e.target.value.trim()) {
                importFromText(e.target.value);
                e.target.value = '';
              }
            }}
          />
        </div>
      </div>

      <div className="proxy-list-section">
        <div className="section-header">
          <h2>代理列表 ({proxies.length})</h2>
          <div className="actions">
            <button
              onClick={testAllProxies}
              disabled={isTestingAll || proxies.length === 0}
            >
              {isTestingAll ? '测试中...' : '测试全部'}
            </button>
            {testResults.length > 0 && (
              <button onClick={exportResults}>导出结果</button>
            )}
          </div>
        </div>

        <div className="proxy-list">
          {proxies.map(proxy => {
            const result = testResults.find(r => r.id === proxy.id);
            
            return (
              <div key={proxy.id} className={`proxy-item ${result?.status || ''}`}>
                <div className="proxy-info">
                  <div className="proxy-name">{proxy.name}</div>
                  <div className="proxy-details">
                    {proxy.type.toUpperCase()} - {proxy.host}:{proxy.port}
                  </div>
                </div>

                <div className="proxy-result">
                  {result && (
                    <>
                      {result.status === 'testing' && <span className="status">测试中...</span>}
                      {result.status === 'success' && (
                        <div className="success-result">
                          <span className="latency">延迟: {result.latency}ms</span>
                          <span className="speed">速度: {result.speed?.toFixed(2)} MB/s</span>
                        </div>
                      )}
                      {result.status === 'failed' && (
                        <span className="error">失败: {result.error}</span>
                      )}
                    </>
                  )}
                </div>

                <div className="proxy-actions">
                  <button
                    onClick={() => testProxy(proxy)}
                    disabled={result?.status === 'testing'}
                  >
                    测试
                  </button>
                  <button onClick={() => removeProxy(proxy.id)}>删除</button>
                </div>
              </div>
            );
          })}
        </div>

        {proxies.length === 0 && (
          <div className="empty-state">
            <p>暂无代理，请添加代理后开始测试</p>
          </div>
        )}
      </div>

      <div className="info-section">
        <h3>⚠️ 注意事项</h3>
        <ul>
          <li>浏览器环境无法直接测试代理，本工具仅作演示</li>
          <li>实际应用需要后端服务支持代理测试</li>
          <li>测试结果仅供参考，实际速度可能因网络环境而异</li>
          <li>建议使用专业的代理测试工具进行生产环境测试</li>
        </ul>
      </div>
    </div>
  );
};

export default ProxySpeedTest;
