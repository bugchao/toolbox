#!/usr/bin/env node
/**
 * 创建新工具包脚手架：tools/tool-<name>/
 * 用法：node scripts/create-tool.cjs <name>  或  pnpm create:tool <name>
 * 例：pnpm create:tool dns-query  →  tools/tool-dns-query/
 */

const fs = require('fs')
const path = require('path')

const name = process.argv[2]
if (!name || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(name)) {
  console.error('用法: pnpm create:tool <name>')
  console.error('  name: 小写字母数字与横线，如 dns-query, cidr-calculator')
  process.exit(1)
}

const root = path.resolve(__dirname, '..')
const dir = path.join(root, 'tools', `tool-${name}`)
if (fs.existsSync(dir)) {
  console.error(`已存在: ${dir}`)
  process.exit(1)
}

// kebab-case -> PascalCase
const pascal = name
  .split('-')
  .map((s) => s.slice(0, 1).toUpperCase() + s.slice(1).toLowerCase())
  .join('')

const packageName = `@toolbox/tool-${name}`

const packageJson = {
  name: packageName,
  version: '1.0.0',
  type: 'module',
  main: 'src/index.tsx',
  types: 'src/index.tsx',
  scripts: {
    lint: 'eslint . --ext ts,tsx',
  },
  dependencies: {
    '@toolbox/ui-kit': 'workspace:*',
    'lucide-react': '^0.577.0',
    react: '^18.3.1',
    'react-dom': '^18.3.1',
  },
  peerDependencies: {
    react: '^18.0.0',
    'react-dom': '^18.0.0',
    'react-i18next': '^15.0.0',
  },
  devDependencies: {
    '@types/react': '^18.3.28',
    '@types/react-dom': '^18.3.7',
    'react-i18next': '^15.0.0',
    typescript: '^5.2.2',
  },
}

const indexTsx = `export { default } from './${pascal}'
`

const componentTsx = `import React from 'react'
import { PageHero, ParticlesBackground } from '@toolbox/ui-kit'

const ${pascal}: React.FC = () => {
  return (
    <div className="relative min-h-[60vh]">
      {/* 粒子背景，受应用层 BackgroundVisibilityProvider 全局开关控制 */}
      <ParticlesBackground preset="minimal" className="absolute inset-0" />
      <div className="relative z-10 space-y-6">
        <PageHero
          title="${pascal}"
          description="TODO: 从 TOOLS_ROADMAP 与 i18n 补充标题与描述"
        />
        {/* TODO: 实现工具内容 */}
      </div>
    </div>
  )
}

export default ${pascal}
`

fs.mkdirSync(path.join(dir, 'src'), { recursive: true })

fs.writeFileSync(
  path.join(dir, 'package.json'),
  JSON.stringify(packageJson, null, 2) + '\n',
  'utf8'
)
fs.writeFileSync(path.join(dir, 'src', 'index.tsx'), indexTsx, 'utf8')
fs.writeFileSync(path.join(dir, 'src', `${pascal}.tsx`), componentTsx, 'utf8')

console.log(`Created: tools/tool-${name}/`)
console.log('Next:')
console.log(`  1. pnpm install`)
console.log(`  2. apps/web: add "@toolbox/tool-${name}": "workspace:*" and route in App.tsx`)
console.log(`  3. apps/web/vite.config.ts: add '@toolbox/tool-${name}' to optimizeDeps.exclude`)
console.log(`  4. config/tools.ts, Layout, Home: register nav and card`)
console.log(`  5. See docs/TOOL_LANDING.md and docs/refactor-structure.md`)
process.exit(0)
