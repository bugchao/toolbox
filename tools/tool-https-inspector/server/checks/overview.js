import dns from 'dns/promises';

/** 纯函数：把 ip-api.com 的响应裁剪成报告需要的字段。 */
export function pickGeoFields(data) {
  if (!data || data.status !== 'success') return null;
  return {
    country: data.country || '',
    countryCode: data.countryCode || '',
    regionName: data.regionName || '',
    city: data.city || '',
    isp: data.isp || '',
  };
}

/** 概述：出口 IP + 地理位置（尽力而为，失败仅显示 IP）。 */
export async function checkOverview(host, port = 443, timeout = 8000) {
  try {
    const addresses = await dns.resolve4(host);
    const ip = addresses[0];
    if (!ip) return { ok: false, error: '无法解析 IP' };

    let geo = null;
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeout);
      const res = await fetch(`http://ip-api.com/json/${encodeURIComponent(ip)}`, { signal: controller.signal });
      clearTimeout(timer);
      geo = pickGeoFields(await res.json());
    } catch {
      geo = null; // 地理位置查询失败不阻塞概述
    }

    return { ok: true, ip, port, geo };
  } catch (err) {
    return { ok: false, error: err.message || '检测失败' };
  }
}
