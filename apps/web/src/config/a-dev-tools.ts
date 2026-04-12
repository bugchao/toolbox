// 开发工具配置 - Development Tools
// 包含：编解码/格式化/生成器/测试/GitHub 等工具

import type { ToolEntry } from './tools'
import {
  Code, FileJson, Braces, CalendarClock, ExternalLink, Shuffle, Calendar,
  LockKeyhole, Binary, Terminal, Dices, SplitSquareHorizontal, RefreshCw,
  FileCode, Wand2, KeyRound, ArrowRightLeft, Github, FileSearch, GitGraph,
  Send,   Calculator, AlignLeft, Lock, Hash, Coins
} from 'lucide-react'

export const DEV_TOOLS: ToolEntry[] = [
  // 基础开发工具（12 个）
  { path: '/json', nameKey: 'tools.json', icon: FileJson, categoryKey: 'dev', keywords: ['json'], i18nNamespace: 'toolJson' },
  { path: '/format-converter', nameKey: 'tools.format_converter', icon: Braces, categoryKey: 'dev', keywords: ['yaml', 'xml', '格式转换'] },
  { path: '/base64', nameKey: 'tools.base64', icon: Code, categoryKey: 'dev', keywords: ['base64'] },
  { path: '/timestamp', nameKey: 'tools.timestamp', icon: CalendarClock, categoryKey: 'dev', keywords: ['时间戳'] },
  { path: '/url', nameKey: 'tools.url', icon: ExternalLink, categoryKey: 'dev', keywords: ['url', '编解码'] },
  { path: '/regex', nameKey: 'tools.regex', icon: Shuffle, categoryKey: 'dev', keywords: ['正则'] },
  { path: '/cron', nameKey: 'tools.cron', icon: Calendar, categoryKey: 'dev', keywords: ['cron'] },
  { path: '/password', nameKey: 'tools.password', icon: LockKeyhole, categoryKey: 'dev', keywords: ['密码'] },
  { path: '/hash', nameKey: 'tools.hash', icon: Binary, categoryKey: 'dev', keywords: ['hash', 'md5', 'sha'] },
  { path: '/code', nameKey: 'tools.code', icon: Terminal, categoryKey: 'dev', keywords: ['代码', '格式化'] },
  { path: '/uuid', nameKey: 'tools.uuid', icon: Dices, categoryKey: 'dev', keywords: ['uuid'] },
  { path: '/text-comparator', nameKey: 'tools.text_comparator', icon: SplitSquareHorizontal, categoryKey: 'dev', keywords: ['文本对比', 'diff'] },
  { path: '/ascii-art', nameKey: 'tools.ascii_art', icon: Wand2, categoryKey: 'dev', keywords: ['ascii', '字符画', '文本图像'] },
  { path: '/morse-code', nameKey: 'tools.morse_code', icon: Code, categoryKey: 'dev', keywords: ['摩斯', '编码', '解码'] },
  { path: '/password-strength', nameKey: 'tools.password_strength', icon: LockKeyhole, categoryKey: 'dev', keywords: ['密码', '强度', '安全'] },
  { path: '/word-count', nameKey: 'tools.word_count', icon: AlignLeft, categoryKey: 'dev', keywords: ['字数', '文本', '统计'] },

  // 今日新增开发工具（5 个）
  { path: '/graphql-playground', nameKey: 'tools.graphql_playground', icon: GitGraph, categoryKey: 'dev', keywords: ['graphql', 'api', '测试', 'schema'], i18nNamespace: 'toolGraphqlPlayground' },
  { path: '/graphql-builder', nameKey: 'tools.graphql_builder', icon: GitGraph, categoryKey: 'dev', keywords: ['graphql', 'schema', 'query', 'builder'] },
  { path: '/postman-lite', nameKey: 'tools.postman_lite', icon: Send, categoryKey: 'dev', keywords: ['http', 'api', '测试', '请求'], i18nNamespace: 'toolPostmanLite' },
  { path: '/rapid-tables', nameKey: 'tools.rapid_tables', icon: Calculator, categoryKey: 'dev', keywords: ['计算器', '数学', '单位转换'], i18nNamespace: 'toolRapidTables' },
  { path: '/text-cipher', nameKey: 'tools.text_cipher', icon: Lock, categoryKey: 'dev', keywords: ['加密', '解密', '编码'], i18nNamespace: 'toolTextCipher' },
  { path: '/text-stats', nameKey: 'tools.text_stats', icon: AlignLeft, categoryKey: 'dev', keywords: ['文本', '统计', '字数'], i18nNamespace: 'toolTextStats' },

  // GitHub 工具（2 个）
  { path: '/github-info', nameKey: 'tools.github_info', icon: FileSearch, categoryKey: 'dev', keywords: ['github', 'token', 'repo', 'user'], i18nNamespace: 'toolGithubInfo', mode: 'server' },
  { path: '/github-repo', nameKey: 'tools.github_repo', icon: Github, categoryKey: 'dev', keywords: ['github', 'repo', 'star', 'fork'], i18nNamespace: 'toolGithubRepo' },
  { path: '/github-user', nameKey: 'tools.github_user', icon: Github, categoryKey: 'dev', keywords: ['github', 'user', '贡献', '分析'], i18nNamespace: 'toolGithubUser' },

  // 其他开发工具
  { path: '/jwt-decoder', nameKey: 'tools.jwt_decoder', icon: KeyRound, categoryKey: 'dev', keywords: ['jwt', 'token', '解析', '解码'], i18nNamespace: 'toolJwtDecoder' },
  { path: '/curl-to-fetch', nameKey: 'tools.curl_to_fetch', icon: ArrowRightLeft, categoryKey: 'dev', keywords: ['curl', 'fetch', 'http', '转换'], i18nNamespace: 'toolCurlToFetch' },
  { path: '/base-converter', nameKey: 'tools.base_converter', icon: Hash, categoryKey: 'dev', keywords: ['进制', '二进制', '十六进制', 'base'], i18nNamespace: 'toolBaseConverter' },
  { path: '/project-scaffold', nameKey: 'tools.project_scaffold', icon: FileCode, categoryKey: 'dev', keywords: ['项目结构', '脚手架', 'scaffold', '目录树'], i18nNamespace: 'toolProjectScaffold' },
  { path: '/http-debugger', nameKey: 'tools.http_debugger', icon: Wand2, categoryKey: 'dev', keywords: ['HTTP', 'API', '调试', 'request'], i18nNamespace: 'toolHttpDebugger' },
  { path: '/ai-token-cost', nameKey: 'tools.ai_token_cost', icon: Coins, categoryKey: 'dev', keywords: ['token', 'LLM', '定价', '成本', 'OpenAI'] },
]
