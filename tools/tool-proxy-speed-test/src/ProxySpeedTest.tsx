import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './ProxySpeedTest.css';
import { I18N_NAMESPACE } from './namespace';

export { I18N_NAMESPACE };

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
  const { t } = useTranslation(I18N_NAMESPACE);
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
      alert(t('alertMissingFields'));
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
      result.error = error instanceof Error ? error.message : t('testFailedDefault');
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
        <h1>{t('title')}</h1>
        <p>{t('description')}</p>
      </div>

      <div className="add-proxy-section">
        <h2>{t('addProxyHeading')}</h2>
        <div className="proxy-form">
          <input
            type="text"
            placeholder={t('proxyNamePlaceholder')}
            value={newProxy.name}
            onChange={e => setNewProxy({ ...newProxy, name: e.target.value })}
          />
          <input
            type="text"
            placeholder={t('proxyHostPlaceholder')}
            value={newProxy.host}
            onChange={e => setNewProxy({ ...newProxy, host: e.target.value })}
          />
          <input
            type="text"
            placeholder={t('proxyPortPlaceholder')}
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
          <button onClick={addProxy}>{t('addButton')}</button>
        </div>

        <div className="import-section">
          <h3>{t('importHeading')}</h3>
          <textarea
            placeholder={t('importPlaceholder')}
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
          <h2>{t('proxyListHeading', { count: proxies.length })}</h2>
          <div className="actions">
            <button
              onClick={testAllProxies}
              disabled={isTestingAll || proxies.length === 0}
            >
              {isTestingAll ? t('testingAll') : t('testAll')}
            </button>
            {testResults.length > 0 && (
              <button onClick={exportResults}>{t('exportResults')}</button>
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
                      {result.status === 'testing' && <span className="status">{t('statusTesting')}</span>}
                      {result.status === 'success' && (
                        <div className="success-result">
                          <span className="latency">{t('latencyLabel', { value: result.latency })}</span>
                          <span className="speed">{t('speedLabel', { value: result.speed?.toFixed(2) })}</span>
                        </div>
                      )}
                      {result.status === 'failed' && (
                        <span className="error">{t('failedLabel', { message: result.error })}</span>
                      )}
                    </>
                  )}
                </div>

                <div className="proxy-actions">
                  <button
                    onClick={() => testProxy(proxy)}
                    disabled={result?.status === 'testing'}
                  >
                    {t('testButton')}
                  </button>
                  <button onClick={() => removeProxy(proxy.id)}>{t('deleteButton')}</button>
                </div>
              </div>
            );
          })}
        </div>

        {proxies.length === 0 && (
          <div className="empty-state">
            <p>{t('emptyState')}</p>
          </div>
        )}
      </div>

      <div className="info-section">
        <h3>{t('noticeHeading')}</h3>
        <ul>
          <li>{t('noticeItem1')}</li>
          <li>{t('noticeItem2')}</li>
          <li>{t('noticeItem3')}</li>
          <li>{t('noticeItem4')}</li>
        </ul>
      </div>
    </div>
  );
};

export default ProxySpeedTest;
