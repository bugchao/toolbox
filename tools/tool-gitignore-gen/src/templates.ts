/**
 * .gitignore 模板数据
 *
 * 模板内容（忽略规则行）属于数据，不做 i18n；
 * 仅 UI 文案（分组名、按钮等）通过 i18n key 翻译。
 * `name` 为业界通用的专有名词（Node / Python ...），同时用作合并输出的注释头。
 */

/** 模板分组，用于 UI 筛选；标签文案通过 i18n key `groups.<key>` 翻译 */
export type TemplateGroup = 'language' | 'framework' | 'os' | 'editor' | 'misc'

export interface GitignoreTemplate {
  /** 稳定唯一 id */
  id: string
  /** 显示名 / 注释头（专有名词，不翻译） */
  name: string
  /** 所属分组 */
  group: TemplateGroup
  /** 忽略规则行（不翻译） */
  rules: string[]
}

export const TEMPLATE_GROUPS: TemplateGroup[] = [
  'language',
  'framework',
  'os',
  'editor',
  'misc',
]

export const TEMPLATES: GitignoreTemplate[] = [
  {
    id: 'node',
    name: 'Node',
    group: 'language',
    rules: [
      'node_modules/',
      'npm-debug.log*',
      'yarn-debug.log*',
      'yarn-error.log*',
      'pnpm-debug.log*',
      '.npm',
      '.pnpm-store/',
      '.yarn/cache',
      'dist/',
      'build/',
      'coverage/',
      '*.tsbuildinfo',
    ],
  },
  {
    id: 'python',
    name: 'Python',
    group: 'language',
    rules: [
      '__pycache__/',
      '*.py[cod]',
      '*$py.class',
      '*.egg-info/',
      '.eggs/',
      'build/',
      'dist/',
      '.Python',
      'env/',
      'venv/',
      '.venv/',
      '.pytest_cache/',
      '.mypy_cache/',
      '.coverage',
      'htmlcov/',
      '*.so',
    ],
  },
  {
    id: 'java',
    name: 'Java',
    group: 'language',
    rules: [
      '*.class',
      '*.log',
      '*.jar',
      '*.war',
      '*.ear',
      '*.nar',
      'target/',
      'build/',
      '.gradle/',
      'hs_err_pid*',
      '*.ctxt',
      'dependency-reduced-pom.xml',
    ],
  },
  {
    id: 'go',
    name: 'Go',
    group: 'language',
    rules: [
      '*.exe',
      '*.exe~',
      '*.dll',
      '*.so',
      '*.dylib',
      '*.test',
      '*.out',
      'go.work',
      'go.work.sum',
      'vendor/',
      'bin/',
    ],
  },
  {
    id: 'rust',
    name: 'Rust',
    group: 'language',
    rules: [
      '/target/',
      'target/',
      'Cargo.lock',
      '**/*.rs.bk',
      '*.pdb',
    ],
  },
  {
    id: 'vite',
    name: 'Vite',
    group: 'framework',
    rules: [
      'dist/',
      'dist-ssr/',
      '*.local',
      '.vite/',
      'node_modules/.vite/',
    ],
  },
  {
    id: 'nextjs',
    name: 'Next.js',
    group: 'framework',
    rules: [
      '.next/',
      'out/',
      'build/',
      'next-env.d.ts',
      '.vercel',
      '*.tsbuildinfo',
    ],
  },
  {
    id: 'macos',
    name: 'macOS',
    group: 'os',
    rules: [
      '.DS_Store',
      '.AppleDouble',
      '.LSOverride',
      'Icon\r',
      '._*',
      '.Spotlight-V100',
      '.Trashes',
      '.fseventsd',
      '.DocumentRevisions-V100',
      '.VolumeIcon.icns',
    ],
  },
  {
    id: 'windows',
    name: 'Windows',
    group: 'os',
    rules: [
      'Thumbs.db',
      'Thumbs.db:encryptable',
      'ehthumbs.db',
      'ehthumbs_vista.db',
      'Desktop.ini',
      '$RECYCLE.BIN/',
      '*.lnk',
      '*.cab',
      '*.msi',
      '*.stackdump',
    ],
  },
  {
    id: 'linux',
    name: 'Linux',
    group: 'os',
    rules: [
      '*~',
      '.fuse_hidden*',
      '.directory',
      '.Trash-*',
      '.nfs*',
    ],
  },
  {
    id: 'vscode',
    name: 'VSCode',
    group: 'editor',
    rules: [
      '.vscode/*',
      '!.vscode/settings.json',
      '!.vscode/tasks.json',
      '!.vscode/launch.json',
      '!.vscode/extensions.json',
      '*.code-workspace',
      '.history/',
    ],
  },
  {
    id: 'jetbrains',
    name: 'JetBrains',
    group: 'editor',
    rules: [
      '.idea/',
      '*.iml',
      '*.ipr',
      '*.iws',
      'out/',
      '.idea_modules/',
      'cmake-build-*/',
    ],
  },
  {
    id: 'logs',
    name: 'Logs',
    group: 'misc',
    rules: [
      'logs/',
      '*.log',
      'npm-debug.log*',
      'yarn-debug.log*',
      'yarn-error.log*',
      'lerna-debug.log*',
      '.pnpm-debug.log*',
    ],
  },
  {
    id: 'env',
    name: 'Environment',
    group: 'misc',
    rules: [
      '.env',
      '.env.local',
      '.env.development.local',
      '.env.test.local',
      '.env.production.local',
      '.env.*.local',
      '*.pem',
      '*.key',
    ],
  },
]

/**
 * 合并所选模板为 .gitignore 文本：
 * - 按模板顺序分组，每组加 `# ===== Name =====` 注释头
 * - 全局对重复规则行去重（保留首次出现的分组）
 */
export function buildGitignore(selectedIds: string[]): string {
  const selected = TEMPLATES.filter((tpl) => selectedIds.includes(tpl.id))
  const seen = new Set<string>()
  const blocks: string[] = []

  for (const tpl of selected) {
    const lines = tpl.rules.filter((rule) => {
      if (seen.has(rule)) return false
      seen.add(rule)
      return true
    })
    if (lines.length === 0) continue
    blocks.push([`# ===== ${tpl.name} =====`, ...lines].join('\n'))
  }

  return blocks.join('\n\n')
}
