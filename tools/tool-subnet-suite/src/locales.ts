type LocaleShape = Record<string, unknown>

function makeLocale(title: string, description: string, notes: string[]): LocaleShape {
  return {
    title,
    description,
    tabs: { query: 'Query', history: 'History' },
    actions: { submit: 'Calculate', submitting: 'Calculating' },
    history: { title: 'History', empty: 'No saved calculations yet.' },
    fields: {
      cidr: 'CIDR',
      count: 'Subnet count',
      prefixOrMask: 'Prefix or mask',
      requests: 'Host requests',
    },
    placeholders: {
      cidr: '192.168.10.0/24',
      count: '4',
      prefixOrMask: '24 or 255.255.255.0',
      requests: 'Office,120\nServers,60\nIoT,28',
    },
    result: { empty: 'Run a calculation to see the result.', updated: 'Updated', notes: 'Usage notes' },
    notes,
  }
}

function makeLocaleZh(title: string, description: string, notes: string[]): LocaleShape {
  return {
    title,
    description,
    tabs: { query: '查询', history: '历史' },
    actions: { submit: '开始计算', submitting: '计算中' },
    history: { title: '历史记录', empty: '还没有保存的计算。' },
    fields: {
      cidr: 'CIDR',
      count: '子网数量',
      prefixOrMask: '前缀或掩码',
      requests: '主机需求',
    },
    placeholders: {
      cidr: '192.168.10.0/24',
      count: '4',
      prefixOrMask: '24 或 255.255.255.0',
      requests: '办公区,120\n服务器,60\n物联网,28',
    },
    result: { empty: '先执行一次计算。', updated: '更新时间', notes: '使用说明' },
    notes,
  }
}

export const subnetEn = {
  toolCidrCalculator: makeLocale('CIDR Calculator', 'Parse an IPv4 CIDR block into mask, network, range, and capacity.', ['Use canonical CIDR input such as 10.0.0.0/24.']),
  toolSubnetDivide: makeLocale('Subnet Divider', 'Split a parent network into an equal number of child subnets.', ['If the count is not a power of two, the tool rounds up to the next valid split.']),
  toolSubnetNetworkAddr: makeLocale('Network Address Calculator', 'Extract the canonical network address from a CIDR input.', ['The network address is the first address in the block.']),
  toolSubnetBroadcast: makeLocale('Broadcast Address Calculator', 'Compute the broadcast address for an IPv4 CIDR block.', ['Broadcast is only meaningful for IPv4 broadcast domains.']),
  toolSubnetMask: makeLocale('Subnet Mask Converter', 'Convert between prefix length and dotted-decimal subnet mask.', ['Only contiguous subnet masks are valid.']),
  toolIpRange: makeLocale('IP Range Calculator', 'Compute the usable host range for a CIDR block.', ['For /31 and /32, all addresses are returned as usable endpoints.']),
  toolSubnetCapacity: makeLocale('Subnet Capacity Calculator', 'Show total, usable, and reserved addresses for an IPv4 CIDR block.', ['Usable capacity excludes network and broadcast on prefixes shorter than /31.']),
  toolIpv6Cidr: makeLocale('IPv6 CIDR Calculator', 'Inspect an IPv6 prefix, host bits, and rough allocation size.', ['IPv6 capacity is shown exactly for small ranges and as 2^N for large ranges.']),
  toolVlsm: makeLocale('VLSM Planner', 'Allocate variable-length subnets from a parent block based on host demand.', ['Enter one request per line in the format name,hosts.']),
  toolNetworkPlanner: makeLocale('Network Planner', 'Generate an allocation plan and copy-ready summary from a parent network and host demands.', ['The planner reuses the VLSM engine and adds a plain-text output summary.']),
} as const

export const subnetZh = {
  toolCidrCalculator: makeLocaleZh('CIDR 计算器', '解析 IPv4 CIDR，输出掩码、网络号、范围与容量。', ['请使用标准 CIDR 输入，如 10.0.0.0/24。']),
  toolSubnetDivide: makeLocaleZh('子网划分工具', '把父网段按等分方式切成多个子网。', ['如果数量不是 2 的幂，工具会自动向上取整到可用切分数量。']),
  toolSubnetNetworkAddr: makeLocaleZh('网络地址计算', '从 CIDR 输入中提取标准网络号。', ['网络地址是该网段中的第一个地址。']),
  toolSubnetBroadcast: makeLocaleZh('广播地址计算', '计算 IPv4 网段的广播地址。', ['广播地址仅适用于 IPv4 广播域。']),
  toolSubnetMask: makeLocaleZh('子网掩码转换', '在前缀长度与点分十进制掩码之间互相换算。', ['只有连续掩码才是合法子网掩码。']),
  toolIpRange: makeLocaleZh('IP 范围计算', '计算 CIDR 的可用主机起止范围。', ['对于 /31 与 /32，会直接返回边界地址本身。']),
  toolSubnetCapacity: makeLocaleZh('子网容量计算', '显示 CIDR 的总地址数、可用地址数与保留地址数。', ['短于 /31 的网段会扣除网络号和广播地址。']),
  toolIpv6Cidr: makeLocaleZh('IPv6 CIDR 计算', '查看 IPv6 前缀的 host bits、容量级别与常见用途。', ['大范围容量会以 2^N 的形式展示。']),
  toolVlsm: makeLocaleZh('VLSM 子网规划', '根据主机需求从父网段里做可变长子网切分。', ['每行一个需求，格式为 名称,主机数。']),
  toolNetworkPlanner: makeLocaleZh('网络规划生成器', '根据父网段和主机需求生成可复制的规划摘要。', ['底层复用 VLSM 引擎，并额外输出文本规划结果。']),
} as const
