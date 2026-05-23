#!/usr/bin/env tsx
/**
 * Manifest 与配置一致性校验
 *
 * 规则（任何一条不通过 → exit 1）：
 *  1. nav.tools.<nameKey> 在 zh.json 与 en.json 中均存在（针对带 i18nNamespace 的 a-*.ts 条目）
 *  2. 路径唯一：a-*.ts 与所有 tool.manifest.ts 之间的 path 不重复
 *  3. namespace 唯一：a-*.ts 的 i18nNamespace 与所有 manifest 的 namespace 不重复
 *  4. tool.manifest.ts 必填字段齐全（id / path / namespace / categoryKey / icon / meta.zh / meta.en / loadComponent / loadMessages）
 *  5. manifest.loadMessages 引用的 JSON 文件实际存在
 *  6. 工具 src 文件不含未解决的 git merge 冲突 markers
 *
 * 警告（不阻塞，但打印）：
 *  - 残留的 legacy manifest.ts（应迁移到 tool.manifest.ts）
 *  - categoryKey 不在已知集合（提示新增分类前先在 i18n 加 label）
 *
 * 用法：pnpm validate:manifests
 */

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const rootDir = resolve(__dirname, '..')
const configDir = join(rootDir, 'apps/web/src/config')
const toolsDir = join(rootDir, 'tools')
const shellZhPath = join(rootDir, 'apps/web/src/locales/zh.json')
const shellEnPath = join(rootDir, 'apps/web/src/locales/en.json')

const KNOWN_CATEGORIES = new Set([
  'ai',
  'blockchain',
  'dev',
  'dns',
  'domain',
  'ip',
  'ipam',
  'learn',
  'life',
  'network',
  'qrcode',
  'query',
  'news',
  'security',
  'travel',
  'utils',
])

type Violation = { rule: string; file: string; message: string }
type Warning = { rule: string; file: string; message: string }

const violations: Violation[] = []
const warnings: Warning[] = []

function rel(p: string): string {
  return relative(rootDir, p) || p
}

function read(p: string): string {
  return readFileSync(p, 'utf8')
}

function readJsonSafe(p: string): unknown {
  try {
    return JSON.parse(read(p))
  } catch (err) {
    violations.push({ rule: 'json-parse', file: rel(p), message: `Failed to parse JSON: ${(err as Error).message}` })
    return null
  }
}

function lazyRecord(obj: unknown, key: string): Record<string, unknown> | null {
  if (typeof obj !== 'object' || obj === null) return null
  const value = (obj as Record<string, unknown>)[key]
  if (typeof value !== 'object' || value === null) return null
  return value as Record<string, unknown>
}

// ------------------------------------------------------------
// 收集 a-*.ts 中的工具条目
// ------------------------------------------------------------
type StaticEntry = {
  file: string
  path: string
  nameKey: string | null
  i18nNamespace: string | null
  categoryKey: string | null
}

function collectStaticEntries(): StaticEntry[] {
  const files = readdirSync(configDir).filter((f) => /^a-.*-tools\.ts$/.test(f))
  const entries: StaticEntry[] = []

  for (const file of files) {
    const filePath = join(configDir, file)
    const source = read(filePath)

    // 匹配单条目对象（path: '...' 是必填）
    for (const match of source.matchAll(/\{[^{}]*\bpath:\s*'([^']+)'[^{}]*\}/gms)) {
      const obj = match[0]
      const path = obj.match(/\bpath:\s*'([^']+)'/)?.[1]
      if (!path) continue
      entries.push({
        file: rel(filePath),
        path,
        nameKey: obj.match(/\bnameKey:\s*'([^']+)'/)?.[1] ?? null,
        i18nNamespace: obj.match(/\bi18nNamespace:\s*'([^']+)'/)?.[1] ?? null,
        categoryKey: obj.match(/\bcategoryKey:\s*'([^']+)'/)?.[1] ?? null,
      })
    }
  }
  return entries
}

// ------------------------------------------------------------
// 收集 tool.manifest.ts 信息
// ------------------------------------------------------------
type ManifestEntry = {
  file: string
  dir: string
  pkg: string
  id: string | null
  path: string | null
  namespace: string | null
  categoryKey: string | null
  hasIcon: boolean
  metaZhTitle: string | null
  metaEnTitle: string | null
  loadComponentPath: string | null
  loadMessagesZhPath: string | null
  loadMessagesEnPath: string | null
}

function parseManifest(filePath: string, dir: string): ManifestEntry {
  const src = read(filePath)
  return {
    file: rel(filePath),
    dir,
    pkg: dir.split('/').pop() ?? '',
    id: src.match(/\bid:\s*'([^']+)'/)?.[1] ?? null,
    path: src.match(/\bpath:\s*'([^']+)'/)?.[1] ?? null,
    namespace: src.match(/\bnamespace:\s*'([^']+)'/)?.[1] ?? null,
    categoryKey: src.match(/\bcategoryKey:\s*'([^']+)'/)?.[1] ?? null,
    hasIcon: /\bicon:\s*[A-Z][a-zA-Z0-9]+/.test(src),
    metaZhTitle:
      src.match(/zh:\s*\{[^{}]*?title:\s*['"]([^'"]+)['"]/)?.[1] ?? null,
    metaEnTitle:
      src.match(/en:\s*\{[^{}]*?title:\s*['"]([^'"]+)['"]/)?.[1] ?? null,
    loadComponentPath:
      src.match(/loadComponent:\s*\(\s*\)\s*=>\s*import\(\s*['"]([^'"]+)['"]/)?.[1] ?? null,
    loadMessagesZhPath:
      src.match(/loadMessages:\s*\{[^{}]*?\bzh:\s*\(\s*\)\s*=>\s*import\(\s*['"]([^'"]+)['"]/s)?.[1] ?? null,
    loadMessagesEnPath:
      src.match(/loadMessages:\s*\{[^{}]*?\ben:\s*\(\s*\)\s*=>\s*import\(\s*['"]([^'"]+)['"]/s)?.[1] ?? null,
  }
}

function collectManifests(): ManifestEntry[] {
  const dirs = readdirSync(toolsDir).filter((d) => statSync(join(toolsDir, d)).isDirectory())
  const out: ManifestEntry[] = []
  for (const d of dirs) {
    const dir = join(toolsDir, d)
    const filePath = join(dir, 'tool.manifest.ts')
    if (!existsSync(filePath)) continue
    out.push(parseManifest(filePath, dir))
  }
  return out
}

// ------------------------------------------------------------
// 规则 1：nav.tools.<nameKey> 在 zh / en 中均存在
// ------------------------------------------------------------
function checkRule1NavTitles(staticEntries: StaticEntry[]): void {
  const zh = readJsonSafe(shellZhPath)
  const en = readJsonSafe(shellEnPath)
  if (!zh || !en) return

  const zhTools = lazyRecord(lazyRecord(zh, 'nav') ?? {}, 'tools') ?? {}
  const enTools = lazyRecord(lazyRecord(en, 'nav') ?? {}, 'tools') ?? {}

  for (const e of staticEntries) {
    if (!e.i18nNamespace) continue // 仅要求带 namespace 的条目（这些是有详细 i18n 的工具）
    if (!e.nameKey || !e.nameKey.startsWith('tools.')) continue
    const key = e.nameKey.slice('tools.'.length)
    if (!(key in zhTools)) {
      violations.push({
        rule: 'R1-nav-title-zh',
        file: e.file,
        message: `路径 ${e.path} (nameKey="${e.nameKey}") 在 nav.tools.${key} 缺中文翻译`,
      })
    }
    if (!(key in enTools)) {
      violations.push({
        rule: 'R1-nav-title-en',
        file: e.file,
        message: `路径 ${e.path} (nameKey="${e.nameKey}") 在 nav.tools.${key} 缺英文翻译`,
      })
    }
  }
}

// ------------------------------------------------------------
// 规则 2 / 3：path 与 namespace 唯一
// ------------------------------------------------------------
function checkRule2And3Uniqueness(staticEntries: StaticEntry[], manifests: ManifestEntry[]): void {
  const pathSeen = new Map<string, string[]>()
  const nsSeen = new Map<string, string[]>()

  for (const e of staticEntries) {
    if (e.path) {
      const arr = pathSeen.get(e.path) ?? []
      arr.push(e.file)
      pathSeen.set(e.path, arr)
    }
    if (e.i18nNamespace) {
      const arr = nsSeen.get(e.i18nNamespace) ?? []
      arr.push(e.file)
      nsSeen.set(e.i18nNamespace, arr)
    }
  }
  for (const m of manifests) {
    if (m.path) {
      const arr = pathSeen.get(m.path) ?? []
      arr.push(m.file)
      pathSeen.set(m.path, arr)
    }
    if (m.namespace) {
      const arr = nsSeen.get(m.namespace) ?? []
      arr.push(m.file)
      nsSeen.set(m.namespace, arr)
    }
  }

  for (const [p, files] of pathSeen) {
    if (files.length > 1) {
      violations.push({
        rule: 'R2-path-unique',
        file: files.join(', '),
        message: `路径 "${p}" 在多处声明：${files.length} 次`,
      })
    }
  }
  for (const [ns, files] of nsSeen) {
    if (files.length > 1) {
      violations.push({
        rule: 'R3-namespace-unique',
        file: files.join(', '),
        message: `namespace "${ns}" 在多处声明：${files.length} 次`,
      })
    }
  }
}

// ------------------------------------------------------------
// 规则 4：tool.manifest.ts 必填字段
// ------------------------------------------------------------
function checkRule4ManifestFields(manifests: ManifestEntry[]): void {
  for (const m of manifests) {
    const missing: string[] = []
    if (!m.id) missing.push('id')
    if (!m.path) missing.push('path')
    if (!m.namespace) missing.push('namespace')
    if (!m.categoryKey) missing.push('categoryKey')
    if (!m.hasIcon) missing.push('icon')
    if (!m.metaZhTitle) missing.push('meta.zh.title')
    if (!m.metaEnTitle) missing.push('meta.en.title')
    if (!m.loadComponentPath) missing.push('loadComponent')
    if (!m.loadMessagesZhPath) missing.push('loadMessages.zh')
    if (!m.loadMessagesEnPath) missing.push('loadMessages.en')
    if (missing.length > 0) {
      violations.push({
        rule: 'R4-manifest-fields',
        file: m.file,
        message: `manifest 缺必填字段：${missing.join(', ')}`,
      })
    }

    if (m.categoryKey && !KNOWN_CATEGORIES.has(m.categoryKey)) {
      warnings.push({
        rule: 'category-unknown',
        file: m.file,
        message: `categoryKey="${m.categoryKey}" 不在已知集合 [${[...KNOWN_CATEGORIES].sort().join(', ')}]，需要先在 apps/web/src/locales/{zh,en}.json 加 category_${m.categoryKey} label`,
      })
    }
  }
}

// ------------------------------------------------------------
// 规则 5：loadMessages 引用的 JSON 文件存在
// ------------------------------------------------------------
function checkRule5LoadMessagesExist(manifests: ManifestEntry[]): void {
  for (const m of manifests) {
    for (const [lang, p] of [
      ['zh', m.loadMessagesZhPath],
      ['en', m.loadMessagesEnPath],
    ] as const) {
      if (!p) continue
      const resolved = p.startsWith('./')
        ? join(m.dir, p)
        : p.startsWith('../')
          ? join(m.dir, p)
          : null
      if (!resolved) {
        warnings.push({
          rule: 'R5-loadMessages-non-relative',
          file: m.file,
          message: `loadMessages.${lang} 路径不是相对路径，跳过文件存在性检查："${p}"`,
        })
        continue
      }
      if (!existsSync(resolved)) {
        violations.push({
          rule: 'R5-loadMessages-missing',
          file: m.file,
          message: `loadMessages.${lang} 引用的文件不存在："${p}" → ${rel(resolved)}`,
        })
      }
    }
  }
}

// ------------------------------------------------------------
// 规则 6：工具 src 文件不含 git merge conflict markers
// ------------------------------------------------------------
function checkRule6NoConflictMarkers(): void {
  const dirs = readdirSync(toolsDir).filter((d) => statSync(join(toolsDir, d)).isDirectory())
  for (const d of dirs) {
    const srcDir = join(toolsDir, d, 'src')
    if (!existsSync(srcDir)) continue
    walkAndCheck(srcDir)
  }
}

function walkAndCheck(dir: string): void {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue
    const full = join(dir, entry.name)
    if (entry.isDirectory()) {
      walkAndCheck(full)
      continue
    }
    if (!/\.(ts|tsx|js|jsx|json|css)$/.test(entry.name)) continue
    const content = read(full)
    if (/^<{7} HEAD/m.test(content) || /^={7}\s*$/m.test(content) || /^>{7} /m.test(content)) {
      violations.push({
        rule: 'R6-conflict-marker',
        file: rel(full),
        message: '文件含未解决的 git merge 冲突 markers (<<<<<<< / ======= / >>>>>>>)',
      })
    }
  }
}

// ------------------------------------------------------------
// 检查 legacy manifest.ts（警告）
// ------------------------------------------------------------
function checkLegacyManifests(): void {
  const dirs = readdirSync(toolsDir).filter((d) => statSync(join(toolsDir, d)).isDirectory())
  for (const d of dirs) {
    const legacy = join(toolsDir, d, 'manifest.ts')
    const canonical = join(toolsDir, d, 'tool.manifest.ts')
    if (existsSync(legacy)) {
      warnings.push({
        rule: 'legacy-manifest',
        file: rel(legacy),
        message: existsSync(canonical)
          ? '存在 legacy manifest.ts（与 canonical tool.manifest.ts 共存，应删除 legacy）'
          : 'Vite 不会扫描 manifest.ts，需迁移到 tool.manifest.ts（用 defineToolManifest）',
      })
    }
  }
}

// ------------------------------------------------------------
// 主入口
// ------------------------------------------------------------
function main(): void {
  const staticEntries = collectStaticEntries()
  const manifests = collectManifests()

  checkRule1NavTitles(staticEntries)
  checkRule2And3Uniqueness(staticEntries, manifests)
  checkRule4ManifestFields(manifests)
  checkRule5LoadMessagesExist(manifests)
  checkRule6NoConflictMarkers()
  checkLegacyManifests()

  // 汇总
  const ruleCounts = new Map<string, number>()
  for (const v of violations) {
    ruleCounts.set(v.rule, (ruleCounts.get(v.rule) ?? 0) + 1)
  }

  console.log('=== Manifest 校验报告 ===')
  console.log(`配置条目（a-*.ts）: ${staticEntries.length}`)
  console.log(`Canonical manifests: ${manifests.length}`)
  console.log('')

  if (violations.length === 0) {
    console.log('✅ 所有规则通过')
  } else {
    console.log(`❌ ${violations.length} 处违规：`)
    const grouped = new Map<string, Violation[]>()
    for (const v of violations) {
      const arr = grouped.get(v.rule) ?? []
      arr.push(v)
      grouped.set(v.rule, arr)
    }
    for (const [rule, arr] of [...grouped.entries()].sort()) {
      console.log(`\n  [${rule}] ${arr.length} 处:`)
      for (const v of arr.slice(0, 20)) {
        console.log(`    - ${v.file}: ${v.message}`)
      }
      if (arr.length > 20) console.log(`    ... +${arr.length - 20} more`)
    }
  }

  if (warnings.length > 0) {
    console.log(`\n⚠️  ${warnings.length} 条警告（不阻塞）：`)
    const grouped = new Map<string, Warning[]>()
    for (const w of warnings) {
      const arr = grouped.get(w.rule) ?? []
      arr.push(w)
      grouped.set(w.rule, arr)
    }
    for (const [rule, arr] of [...grouped.entries()].sort()) {
      console.log(`\n  [${rule}] ${arr.length} 处:`)
      for (const w of arr.slice(0, 20)) {
        console.log(`    - ${w.file}: ${w.message}`)
      }
      if (arr.length > 20) console.log(`    ... +${arr.length - 20} more`)
    }
  }

  process.exit(violations.length > 0 ? 1 : 0)
}

main()
