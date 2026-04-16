#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

const rootDir = path.resolve(__dirname, '..')
const appPath = path.join(rootDir, 'apps/web/src/App.tsx')
const roadmapPath = path.join(rootDir, 'docs/TOOLS_ROADMAP.md')
const configDir = path.join(rootDir, 'apps/web/src/config')
const toolsDir = path.join(rootDir, 'tools')

function read(filePath) {
  return fs.readFileSync(filePath, 'utf8')
}

function relative(filePath) {
  return path.relative(rootDir, filePath) || filePath
}

function collectConfigEntries() {
  const files = fs
    .readdirSync(configDir)
    .filter((file) => /^a-.*-tools\.ts$/.test(file))
    .sort()

  const entries = []

  for (const file of files) {
    const filePath = path.join(configDir, file)
    const source = read(filePath)

    for (const match of source.matchAll(/\{[^{}]*path:\s*'([^']+)'[^{}]*\}/gms)) {
      const objectSource = match[0]
      const pathMatch = objectSource.match(/path:\s*'([^']+)'/)
      if (!pathMatch) continue

      const namespaceMatch = objectSource.match(/i18nNamespace:\s*'([^']+)'/)
      entries.push({
        file: relative(filePath),
        path: pathMatch[1],
        i18nNamespace: namespaceMatch ? namespaceMatch[1] : null,
      })
    }
  }

  return entries
}

function collectManifestEntries() {
  const toolDirs = fs
    .readdirSync(toolsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && entry.name.startsWith('tool-'))
    .map((entry) => path.join(toolsDir, entry.name, 'tool.manifest.ts'))
    .filter((filePath) => fs.existsSync(filePath))
    .sort()

  const entries = []

  for (const filePath of toolDirs) {
    const source = read(filePath)
    const pathMatch = source.match(/path:\s*'([^']+)'/)
    const namespaceMatch = source.match(/namespace:\s*'([^']+)'/)

    if (!pathMatch) continue

    entries.push({
      file: relative(filePath),
      path: pathMatch[1],
      namespace: namespaceMatch ? namespaceMatch[1] : null,
    })
  }

  return entries
}

function collectExplicitRoutes() {
  const source = read(appPath)
  return [...source.matchAll(/<Route\s+path="([^"]+)"/g)].map((match) => match[1])
}

function collectRoadmapDevelopedRows() {
  const source = read(roadmapPath)
  const start = source.indexOf('## 二、已开发工具（代码落位）')
  const end = source.indexOf('## 三、待开发 / 调研工具')

  if (start === -1 || end === -1 || end <= start) {
    return []
  }

  const section = source.slice(start, end)
  const rows = []

  for (const match of section.matchAll(/^\|\s*([^|]+?)\s*\|\s*`([^`]+)`\s*\|\s*`([^`]+)`/gm)) {
    rows.push({
      name: match[1].trim(),
      route: match[2].trim(),
      codeRef: match[3].trim(),
    })
  }

  return rows
}

function baseCodePath(codeRef) {
  return codeRef.split('→')[0].trim()
}

function existsRelative(targetPath) {
  return fs.existsSync(path.join(rootDir, targetPath))
}

function groupBy(items, keyFn) {
  const grouped = new Map()
  for (const item of items) {
    const key = keyFn(item)
    const list = grouped.get(key) || []
    list.push(item)
    grouped.set(key, list)
  }
  return grouped
}

const configEntries = collectConfigEntries()
const manifestEntries = collectManifestEntries()
const explicitRoutes = collectExplicitRoutes()
const roadmapRows = collectRoadmapDevelopedRows()

const manifestByPath = new Map(manifestEntries.map((entry) => [entry.path, entry]))
const explicitRouteSet = new Set(explicitRoutes)
const manifestRouteSet = new Set(manifestEntries.map((entry) => entry.path))
const allRouteSet = new Set([...explicitRouteSet, ...manifestRouteSet])

const errors = []
const warnings = []

for (const [routePath, entries] of groupBy(configEntries, (entry) => entry.path)) {
  if (entries.length > 1) {
    errors.push(
      `导航配置重复路径 ${routePath}: ${entries.map((entry) => entry.file).join(', ')}`
    )
  }
}

for (const [routePath, rows] of groupBy(roadmapRows, (row) => row.route)) {
  if (rows.length > 1) {
    errors.push(
      `TOOLS_ROADMAP 已开发清单存在重复路由 ${routePath}: ${rows
        .map((row) => `${row.name} -> ${row.codeRef}`)
        .join(' | ')}`
    )
  }
}

for (const entry of configEntries) {
  if (!allRouteSet.has(entry.path)) {
    errors.push(`导航配置未接入实际路由 ${entry.path} (${entry.file})`)
  }

  const manifest = manifestByPath.get(entry.path)
  if (manifest && entry.i18nNamespace && manifest.namespace && entry.i18nNamespace !== manifest.namespace) {
    errors.push(
      `导航配置与 manifest namespace 不一致 ${entry.path}: ${entry.i18nNamespace} != ${manifest.namespace}`
    )
  }
}

for (const row of roadmapRows) {
  const codePath = baseCodePath(row.codeRef)
  if (!existsRelative(codePath)) {
    errors.push(`TOOLS_ROADMAP 指向不存在的代码位置 ${row.route}: ${codePath}`)
  }

  if (!allRouteSet.has(row.route)) {
    errors.push(`TOOLS_ROADMAP 已开发路由未接入应用 ${row.route}`)
  }
}

const overlappedRoutes = [...manifestRouteSet].filter((routePath) => explicitRouteSet.has(routePath))
if (overlappedRoutes.length > 0) {
  warnings.push(
    `以下路由既在 App.tsx 手写声明，又会由 manifest 自动挂载: ${overlappedRoutes.join(', ')}`
  )
}

for (const entry of configEntries) {
  const manifest = manifestByPath.get(entry.path)
  if (manifest && !entry.i18nNamespace) {
    warnings.push(`manifest 工具缺少导航 i18nNamespace 配置 ${entry.path} (${entry.file})`)
  }
}

if (errors.length === 0 && warnings.length === 0) {
  console.log('✓ Tool consistency check passed')
  process.exit(0)
}

if (errors.length > 0) {
  console.log('Tool consistency errors:')
  for (const error of errors) {
    console.log(`- ${error}`)
  }
}

if (warnings.length > 0) {
  console.log(errors.length > 0 ? '\nTool consistency warnings:' : 'Tool consistency warnings:')
  for (const warning of warnings) {
    console.log(`- ${warning}`)
  }
}

process.exit(errors.length > 0 ? 1 : 0)
