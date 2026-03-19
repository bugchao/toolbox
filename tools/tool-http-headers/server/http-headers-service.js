import https from 'https';
import http from 'http';
import { URL } from 'url';

const SECURITY_HEADER_KEYS = [
  'strict-transport-security',
  'content-security-policy',
  'x-frame-options',
  'x-content-type-options',
  'x-xss-protection',
  'referrer-policy',
  'permissions-policy',
];

/**
 * 计算安全评分
 */
function calcSecurityScore(headers) {
  const present = SECURITY_HEADER_KEYS.filter(k =>
    Object.keys(headers).some(h => h.toLowerCase() === k)
  );
  return Math.round((present.length / SECURITY_HEADER_KEYS.length) * 100);
}

/**
 * 发起 HTTP 请求并获取响应头
 */
function fetchHeaders(targetUrl, maxRedirects = 5) {
  return new Promise((resolve, reject) => {
    const redirectChain = [];
    let redirectCount = 0;

    function doRequest(url) {
      let parsed;
      try {
        parsed = new URL(url);
      } catch (e) {
        return reject(new Error('无效的 URL'));
      }

      const isHttps = parsed.protocol === 'https:';
      const lib = isHttps ? https : http;
      const startTime = Date.now();

      const options = {
        hostname: parsed.hostname,
        port: parsed.port || (isHttps ? 443 : 80),
        path: parsed.pathname + parsed.search,
        method: 'HEAD',
        timeout: 8000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; Toolbox-HeaderChecker/1.0)'
        },
        rejectUnauthorized: false,
      };

      const req = lib.request(options, (res) => {
        const responseTime = Date.now() - startTime;
        const statusCode = res.statusCode;
        const headers = res.headers;

        // 处理重定向
        if ([301, 302, 303, 307, 308].includes(statusCode) && headers.location) {
          if (redirectCount >= maxRedirects) {
            return reject(new Error('重定向次数过多'));
          }
          redirectChain.push(url);
          redirectCount++;
          const nextUrl = headers.location.startsWith('http')
            ? headers.location
            : `${parsed.protocol}//${parsed.host}${headers.location}`;
          return doRequest(nextUrl);
        }

        redirectChain.push(url);

        resolve({
          url,
          statusCode,
          statusText: getStatusText(statusCode),
          responseTime,
          headers,
          redirectChain: redirectChain.length > 1 ? redirectChain : undefined,
          securityScore: calcSecurityScore(headers),
          timestamp: new Date().toISOString(),
        });
      });

      req.on('timeout', () => {
        req.destroy();
        reject(new Error('请求超时'));
      });

      req.on('error', (err) => {
        reject(new Error(`请求失败: ${err.message}`));
      });

      req.end();
    }

    doRequest(targetUrl);
  });
}

function getStatusText(code) {
  const map = {
    200: 'OK', 201: 'Created', 204: 'No Content',
    301: 'Moved Permanently', 302: 'Found', 304: 'Not Modified',
    400: 'Bad Request', 401: 'Unauthorized', 403: 'Forbidden',
    404: 'Not Found', 405: 'Method Not Allowed',
    500: 'Internal Server Error', 502: 'Bad Gateway', 503: 'Service Unavailable',
  };
  return map[code] || 'Unknown';
}

export async function getHttpHeaders(url) {
  if (!url || typeof url !== 'string') throw new Error('URL is required');

  const raw = await fetchHeaders(url);

  // 整理 headers 为数组格式
  const headers = Object.entries(raw.headers).map(([name, value]) => ({
    name,
    value: Array.isArray(value) ? value.join(', ') : value,
  }));

  return {
    ...raw,
    headers,
  };
}
