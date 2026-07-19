import dns from 'dns/promises';

// CNAME / PTR 关键字 → CDN 厂商特征库
const CDN_SIGNATURES = [
  { vendor: 'Cloudflare', patterns: ['cloudflare'] },
  { vendor: 'Akamai', patterns: ['akamai', 'akamaiedge', 'akadns', 'edgekey', 'edgesuite'] },
  { vendor: 'Fastly', patterns: ['fastly'] },
  { vendor: 'Amazon CloudFront', patterns: ['cloudfront'] },
  { vendor: 'Google Cloud CDN', patterns: ['googleusercontent', 'ghs.google', 'gvt1'] },
  { vendor: 'Microsoft Azure CDN', patterns: ['azureedge', 'azurefd', 'msecnd'] },
  { vendor: '阿里云 CDN', patterns: ['alicdn', 'alikunlun', 'aliyuncs', 'kunlun'] },
  { vendor: '腾讯云 CDN', patterns: ['cdntip', 'dnsv1', 'tcdn', 'qcloud'] },
  { vendor: '百度云加速', patterns: ['bdydns', 'jomodns', 'yunjiasu'] },
  { vendor: '网宿 ChinaNetCenter', patterns: ['chinanetcenter', 'wscdns', 'lxdns'] },
  { vendor: 'CDNetworks', patterns: ['cdnetworks', 'cdngc', 'panthercdn'] },
];

/**
 * 纯函数：对照 CNAME 链与 PTR 记录匹配 CDN 特征。
 * @param {string[]} haystacks 待匹配的域名字符串（CNAME、PTR 等）
 */
export function matchCdn(haystacks) {
  const lower = haystacks.filter(Boolean).map((h) => h.toLowerCase());
  for (const { vendor, patterns } of CDN_SIGNATURES) {
    const hit = lower.find((h) => patterns.some((p) => h.includes(p)));
    if (hit) return { vendor, evidence: hit };
  }
  return null;
}

/** CDN 检测：解析 CNAME 链 + 出口 IP 的 PTR，对照特征库判断厂商。单一探测点。 */
export async function checkCdn(host, timeout = 8000) {
  try {
    const cnames = [];
    try {
      const chain = await dns.resolveCname(host);
      cnames.push(...chain);
    } catch {
      // 无 CNAME 是常态
    }

    let ips = [];
    try {
      ips = await dns.resolve4(host);
    } catch {
      ips = [];
    }

    const ptrs = [];
    for (const ip of ips.slice(0, 3)) {
      try {
        const names = await dns.reverse(ip);
        ptrs.push(...names);
      } catch {
        // 无 PTR 常见
      }
    }

    const match = matchCdn([...cnames, ...ptrs]);
    return {
      ok: true,
      usesCdn: Boolean(match),
      vendor: match?.vendor ?? null,
      evidence: match?.evidence ?? null,
      cnames,
      ips,
      note: 'singleVantagePoint',
    };
  } catch (err) {
    return { ok: false, error: err.message || '检测失败' };
  }
}
