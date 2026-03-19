import https from 'https';
import http from 'http';
import { URL } from 'url';

const STATUS_TEXT = {
  200: 'OK', 201: 'Created', 204: 'No Content',
  301: 'Moved Permanently', 302: 'Found', 303: 'See Other',
  304: 'Not Modified', 307: 'Temporary Redirect', 308: 'Permanent Redirect',
  400: 'Bad Request', 401: 'Unauthorized', 403: 'Forbidden',
  404: 'Not Found', 405: 'Method Not Allowed', 408: 'Request Timeout',
  429: 'Too Many Requests', 500: 'Internal Server Error',
  502: 'Bad Gateway', 503: 'Service Unavailable', 504: 'Gateway Timeout',
};

const STATUS_TIPS = {
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

function getStatusCategory(code) {
  if (code < 200) return '1xx 信息';
  if (code < 300) return '2xx 成功';
  if (code < 400) return '3xx 重定向';
  if (code < 500) return '4xx 客户端错误';
  return '5xx 服务端错误';
}

function doRequest(url, redirectChain = [], maxRedirects = 10) {
  return new Promise((resolve, reject) => {
    let parsed;
    try { parsed = new URL(url); } catch { return reject(new Error('无效的 URL')); }

    const isHttps = parsed.protocol === 'https:';
    const lib = isHttps ? https : http;
    const startTime = Date.now();

    const options = {
      hostname: parsed.hostname,
      port: parsed.port || (isHttps ? 443 : 80),
      path: parsed.pathname + parsed.search,
      method: 'HEAD',
      timeout: 8000,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Toolbox-StatusChecker/1.0)' },
      rejectUnauthorized: false,
    };

    const req = lib.request(options, (res) => {
      const responseTime = Date.now() - startTime;
      const statusCode = res.statusCode;
      const step = { url, statusCode, statusText: STATUS_TEXT[statusCode] || 'Unknown' };
      redirectChain.push(step);

      if ([301, 302, 303, 307, 308].includes(statusCode) && res.headers.location) {
        if (redirectChain.length >= maxRedirects) {
          return reject(new Error('重定向次数过多'));
        }
        const next = res.headers.location.startsWith('http')
          ? res.headers.location
          : `${parsed.protocol}//${parsed.host}${res.headers.location}`;
        return doRequest(next, redirectChain, maxRedirects).then(resolve).catch(reject);
      }

      resolve({
        url: redirectChain[0].url,
        finalUrl: url,
        statusCode,
        statusText: STATUS_TEXT[statusCode] || 'Unknown',
        statusCategory: getStatusCategory(statusCode),
        responseTime,
        redirectChain,
        available: statusCode >= 200 && statusCode < 400,
        timestamp: new Date().toISOString(),
        tip: STATUS_TIPS[statusCode] || `HTTP ${statusCode} 响应`,
      });
    });

    req.on('timeout', () => { req.destroy(); reject(new Error('请求超时')); });
    req.on('error', (err) => reject(new Error(`连接失败: ${err.message}`)));
    req.end();
  });
}

export async function checkHttpStatus(url) {
  if (!url) throw new Error('URL is required');
  return doRequest(url);
}
