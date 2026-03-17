type LocaleShape = Record<string, unknown>

function en(title: string, description: string, notes: string[]): LocaleShape {
  return {
    title,
    description,
    tabs: { query: 'Query', history: 'History' },
    actions: { submit: 'Run', submitting: 'Running', detect: 'Detect now' },
    fields: { ip: 'IP address' },
    placeholders: { ip: '8.8.8.8' },
    history: { title: 'History', empty: 'No saved queries yet.' },
    result: { empty: 'Run a query to view the result.', updated: 'Updated', overview: 'Overview', details: 'Details', notes: 'Usage notes' },
    notes,
  }
}

function zh(title: string, description: string, notes: string[]): LocaleShape {
  return {
    title,
    description,
    tabs: { query: '查询', history: '历史' },
    actions: { submit: '开始查询', submitting: '查询中', detect: '立即检测' },
    fields: { ip: 'IP 地址' },
    placeholders: { ip: '8.8.8.8' },
    history: { title: '历史记录', empty: '还没有保存的查询。' },
    result: { empty: '先执行一次查询。', updated: '更新时间', overview: '概览', details: '详情', notes: '使用说明' },
    notes,
  }
}

export const ipOpsEn = {
  toolIpGeo: en('IP Geolocation', 'Look up public geolocation, timezone, and network metadata for an IP.', [
    'Public geolocation depends on third-party datasets and is approximate.',
    'Private or reserved addresses are reported as non-routable.',
  ]),
  toolIpPtr: en('IP PTR Lookup', 'Resolve reverse DNS hostnames for an IP address.', [
    'PTR records are optional and often used on mail or infrastructure IPs.',
    'Missing PTR does not always indicate a problem for generic web traffic.',
  ]),
  toolIpV4ToV6: en('IPv4 to IPv6', 'Convert an IPv4 address into IPv6-compatible representations.', [
    'IPv4-mapped IPv6 is commonly used by dual-stack software stacks.',
    '6to4 is historical but still useful for calculation and troubleshooting.',
  ]),
  toolIpBinaryHex: en('IP Binary/Hex Converter', 'Convert IPv4 into dotted binary and hexadecimal forms.', [
    'Binary and hex views are useful when debugging ACLs and low-level networking.',
  ]),
  toolIpClass: en('IP Classification', 'Identify whether an address is public, private, reserved, loopback, and more.', [
    'The tool recognises both IPv4 and basic IPv6 scope classes.',
  ]),
  toolIpPublic: en('Public IP Lookup', 'Detect the current egress public IP by querying public IP reflectors.', [
    'Results reflect the server-side network path in deployed mode.',
  ]),
  toolIpCdnCheck: en('IP CDN Detection', 'Estimate whether an IP belongs to a CDN or edge network using host and network signals.', [
    'This is a heuristic signal, not an authoritative provider confirmation.',
  ]),
  toolIpBlacklist: en('IP Blacklist Check', 'Query common DNSBL providers for IPv4 blacklist presence.', [
    'DNSBL coverage is strongest for mail-related abuse reputation.',
  ]),
} as const

export const ipOpsZh = {
  toolIpGeo: zh('IP 地理位置查询', '查询公网 IP 的地理位置、时区与网络归属信息。', [
    '公网地理位置依赖第三方数据库，结果为近似值。',
    '私网或保留地址会直接标记为不可路由。',
  ]),
  toolIpPtr: zh('IP 反向解析（PTR）', '查询 IP 的反向 DNS 主机名记录。', [
    'PTR 常见于邮件、基础设施和托管服务 IP。',
    '缺少 PTR 不一定意味着普通 Web 流量异常。',
  ]),
  toolIpV4ToV6: zh('IPv4 转 IPv6', '将 IPv4 地址换算为常见 IPv6 表示形式。', [
    'IPv4-mapped IPv6 常见于双栈应用和代理实现。',
    '6to4 已偏历史化，但对换算和排障仍有参考意义。',
  ]),
  toolIpBinaryHex: zh('IP Binary/Hex 转换', '把 IPv4 地址换算为点分二进制和十六进制表示。', [
    'ACL、路由和底层网络排障常需要二进制或十六进制视图。',
  ]),
  toolIpClass: zh('IP 地址分类检测', '识别 IP 是公网、私网、保留、回环、多播等哪一类。', [
    '同时支持 IPv4 与基础 IPv6 范围分类。',
  ]),
  toolIpPublic: zh('公网 IP 查询', '通过公网反射服务检测当前出口 IP。', [
    '部署后结果反映的是服务所在网络出口，而不是浏览器本地出口。',
  ]),
  toolIpCdnCheck: zh('IP 是否 CDN', '基于主机名与网络组织信息估算目标 IP 是否属于 CDN/边缘网络。', [
    '这是启发式判断，不是供应商官方归属证明。',
  ]),
  toolIpBlacklist: zh('IP 黑名单检测', '查询常见 DNSBL 提供方，检测 IPv4 是否进入黑名单。', [
    'DNSBL 更偏向邮件与滥用信誉场景。',
  ]),
} as const
