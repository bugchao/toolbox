import net from 'net';
import dns from 'dns';
import { promisify } from 'util';

const resolve4 = promisify(dns.resolve4);

const COMMON_SERVICES = {
  21: 'FTP', 22: 'SSH', 23: 'Telnet', 25: 'SMTP', 53: 'DNS',
  80: 'HTTP', 110: 'POP3', 143: 'IMAP', 443: 'HTTPS', 465: 'SMTPS',
  587: 'SMTP Submission', 993: 'IMAPS', 995: 'POP3S',
  1433: 'MSSQL', 1521: 'Oracle', 3306: 'MySQL', 3389: 'RDP',
  5432: 'PostgreSQL', 5672: 'RabbitMQ', 6379: 'Redis',
  8080: 'HTTP Alt', 8443: 'HTTPS Alt', 9200: 'Elasticsearch',
  27017: 'MongoDB', 27018: 'MongoDB', 28017: 'MongoDB HTTP',
};

/**
 * 检测单个 TCP 端口
 */
function checkPort(host, port, timeout = 3000) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const socket = new net.Socket();

    socket.setTimeout(timeout);

    socket.on('connect', () => {
      const responseTime = Date.now() - startTime;
      socket.destroy();
      resolve({
        port,
        open: true,
        responseTime,
        service: COMMON_SERVICES[port],
      });
    });

    socket.on('timeout', () => {
      socket.destroy();
      resolve({ port, open: false, service: COMMON_SERVICES[port] });
    });

    socket.on('error', () => {
      resolve({ port, open: false, service: COMMON_SERVICES[port] });
    });

    socket.connect(port, host);
  });
}

/**
 * 批量检测 TCP 端口
 */
export async function checkTcpPorts(host, ports) {
  if (!host) throw new Error('Host is required');
  if (!ports || ports.length === 0) throw new Error('Ports are required');
  if (ports.length > 20) throw new Error('最多同时检测 20 个端口');

  const cleanHost = host.trim().replace(/^https?:\/\//, '').split('/')[0];

  // 尝试解析 IP
  let resolvedIp;
  try {
    const ips = await resolve4(cleanHost);
    resolvedIp = ips[0];
  } catch {
    // 可能已经是 IP，忽略解析错误
  }

  // 并行检测所有端口
  const results = await Promise.all(
    ports.map(port => checkPort(resolvedIp || cleanHost, port))
  );

  // 按端口号排序
  results.sort((a, b) => a.port - b.port);

  return {
    host: cleanHost,
    resolvedIp,
    results,
    timestamp: new Date().toISOString(),
  };
}
