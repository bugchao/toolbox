type LocaleShape = Record<string, unknown>

function createLocale(title: string, description: string, noteItems: string[]): LocaleShape {
  return {
    title,
    description,
    tabs: { query: 'Query', history: 'History' },
    actions: { submit: 'Analyze', submitting: 'Analyzing' },
    fields: { domain: 'Domain', selector: 'Selector' },
    placeholders: { domain: 'example.com', selector: 'default' },
    history: {
      title: 'History',
      empty: 'No saved queries yet.',
      restore: 'Restore',
      remove: 'Remove',
      clear: 'Clear history',
    },
    result: {
      empty: 'Run a query to view the report.',
      updated: 'Updated',
      overview: 'Overview',
      records: 'Records',
      suggestions: 'Suggestions',
      issues: 'Issues',
      notes: 'How to use it',
    },
    states: {
      present: 'Present',
      missing: 'Missing',
      detected: 'Detected',
      clear: 'Clear',
      valid: 'Valid',
      invalid: 'Needs attention',
      yes: 'Yes',
      no: 'No',
    },
    notes: noteItems,
  }
}

function createLocaleZh(title: string, description: string, noteItems: string[]): LocaleShape {
  return {
    title,
    description,
    tabs: { query: '查询', history: '历史' },
    actions: { submit: '开始检测', submitting: '检测中' },
    fields: { domain: '域名', selector: 'Selector' },
    placeholders: { domain: 'example.com', selector: 'default' },
    history: {
      title: '历史记录',
      empty: '还没有保存的查询。',
      restore: '恢复查询',
      remove: '删除',
      clear: '清空历史',
    },
    result: {
      empty: '先执行一次查询以查看结果。',
      updated: '更新时间',
      overview: '概览',
      records: '记录详情',
      suggestions: '优化建议',
      issues: '发现问题',
      notes: '使用说明',
    },
    states: {
      present: '已配置',
      missing: '未配置',
      detected: '已检测到',
      clear: '未发现',
      valid: '有效',
      invalid: '需处理',
      yes: '是',
      no: '否',
    },
    notes: noteItems,
  }
}

export const domainSuiteEn = {
  toolDomainSpf: createLocale('SPF Record Analyzer', 'Parse SPF policy, estimate lookup depth, and flag risky mail-authorisation patterns.', [
    'SPF should end with -all or ~all after the authorised sender sources.',
    'Keep DNS lookups under 10 to avoid SPF permerror.',
  ]),
  toolDomainDkim: createLocale('DKIM Verification Tool', 'Inspect a DKIM selector, parse tags, and flag weak or incomplete public-key records.', [
    'Enter both the base domain and the DKIM selector used by your mail platform.',
    '2048-bit keys are preferred for modern deployments.',
  ]),
  toolDomainDmarc: createLocale('DMARC Check', 'Read the DMARC policy, reporting tags, and enforcement level on the domain.', [
    'DMARC records live on _dmarc.<domain>.',
    'Start with monitoring, then move to quarantine or reject once aligned.',
  ]),
  toolDomainTtlAdvice: createLocale('Domain TTL Advice', 'Review address-record TTL values and get rollback-versus-cache-efficiency guidance.', [
    'Production web properties often use 300s to 3600s TTL values.',
    'Very large TTL values slow incident rollback and migration windows.',
  ]),
  toolDomainNsCheck: createLocale('Domain NS Configuration Check', 'Inspect nameserver redundancy, reachability, and provider concentration.', [
    'Authoritative DNS should publish at least two nameservers.',
    'Independent provider or network placement improves resilience.',
  ]),
  toolDomainSubdomainScan: createLocale('Subdomain Scan', 'Probe a curated wordlist for common subdomains and highlight likely exposures.', [
    'Wildcard DNS may cause synthetic matches in the result set.',
    'Use this as a quick discovery layer, not a full external attack-surface scan.',
  ]),
  toolDomainWildcard: createLocale('Wildcard DNS Detection', 'Probe random labels under the zone to determine whether wildcard DNS is enabled.', [
    'Wildcard DNS can hide real NXDOMAIN failures during troubleshooting.',
    'Mail and validation flows often benefit from explicit NXDOMAIN behavior.',
  ]),
  toolDomainHealthScore: createLocale('Domain Health Score', 'Combine mail authentication, nameserver hygiene, address records, and wildcard exposure into one score.', [
    'This is an operational health score, not a security certification.',
    'Improve the lowest-scoring dimension first to raise the aggregate score faster.',
  ]),
} as const

export const domainSuiteZh = {
  toolDomainSpf: createLocaleZh('SPF 记录解析', '解析 SPF 策略，估算 DNS lookup 深度，并标出高风险授权模式。', [
    '推荐以 -all 或 ~all 结尾，避免开放式发信授权。',
    'SPF 的 DNS 查询总数应控制在 10 次以内。',
  ]),
  toolDomainDkim: createLocaleZh('DKIM 验证工具', '检查 DKIM selector、解析标签，并识别弱密钥或不完整公钥记录。', [
    '需要填写基础域名和邮件平台使用的 selector。',
    '生产环境优先使用 2048-bit 密钥。',
  ]),
  toolDomainDmarc: createLocaleZh('DMARC 检测', '读取 DMARC 策略、报告地址与执行强度，判断邮件认证落地情况。', [
    'DMARC 记录位于 _dmarc.<domain>。',
    '先监控再逐步收紧到 quarantine 或 reject 更稳妥。',
  ]),
  toolDomainTtlAdvice: createLocaleZh('域名 TTL 优化建议', '检查地址记录 TTL 分布，并给出缓存效率与回滚速度之间的建议。', [
    '常见生产业务 TTL 在 300 到 3600 秒之间更平衡。',
    'TTL 过大时，故障切换和迁移生效会明显变慢。',
  ]),
  toolDomainNsCheck: createLocaleZh('域名 NS 配置检查', '检查权威 NS 冗余、可解析性与供应商集中度。', [
    '建议至少发布两台权威 NS。',
    '供应商或网络分散部署能提升韧性。',
  ]),
  toolDomainSubdomainScan: createLocaleZh('子域名扫描', '基于内置常见词表快速发现常用子域，并提示潜在暴露面。', [
    '若启用了泛解析，扫描结果可能包含伪命中。',
    '这是轻量发现工具，不替代完整外部攻击面梳理。',
  ]),
  toolDomainWildcard: createLocaleZh('Wildcard 解析检测', '对随机子域做探测，判断当前区域是否启用了泛解析。', [
    '泛解析会掩盖真实 NXDOMAIN，增加排障难度。',
    '邮件、校验和部分路由场景通常更适合显式 NXDOMAIN。',
  ]),
  toolDomainHealthScore: createLocaleZh('域名健康评分', '综合邮件认证、NS 韧性、地址记录与泛解析暴露面，输出域名健康分。', [
    '这是运维健康度，不等同于安全合规认证。',
    '优先修复最低分维度，整体分数提升最快。',
  ]),
} as const
