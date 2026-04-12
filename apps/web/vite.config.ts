import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { createDomainSuiteApiMiddleware } from '../../tools/tool-domain-suite/server/domain-suite-api.js'
import { createIpOpsApiMiddleware } from '../../tools/tool-ip-ops-suite/server/ip-ops-api.js'
import { createSecurityApiMiddleware } from '../../tools/tool-security-suite/server/security-api.js'
import { createWhoisLookupApiMiddleware } from '../../tools/tool-whois-lookup/server/whois-lookup-api.js'
import { createCertToolsApiMiddleware } from '../../tools/tool-cert-suite-shared/server/cert-tools-api.js'
import { createSslCertApiMiddleware } from '../../tools/tool-ssl-cert/server/ssl-cert-api.js'
import fs from 'fs'

const root = path.resolve(__dirname, '../..')
const base = process.env.VITE_APP_BASE_PATH || '/'

// 自动扫描所有工具包，生成 alias
function scanToolAliases(): Record<string, string> {
  const toolsDir = path.join(root, 'tools')
  const aliases: Record<string, string> = {}

  try {
    const toolDirs = fs.readdirSync(toolsDir)
    for (const dir of toolDirs) {
      const toolPath = path.join(toolsDir, dir)
      if (fs.statSync(toolPath).isDirectory()) {
        const pkgPath = path.join(toolPath, 'package.json')
        try {
          const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'))
          if (pkg.name && pkg.name.startsWith('@toolbox/')) {
            aliases[pkg.name] = toolPath
          }
        } catch {
          // 忽略没有 package.json 的目录
        }
      }
    }
  } catch (e) {
    console.warn('[vite] Failed to scan tool aliases:', e)
  }

  return aliases
}

function toolManifestPlugin() {
  const VIRTUAL_ID = 'virtual:toolbox-manifests'
  const RESOLVED_ID = '\0virtual:toolbox-manifests'

  function getManifestFiles(): string[] {
    const toolsDir = path.join(root, 'tools')
    const files: string[] = []
    try {
      for (const dir of fs.readdirSync(toolsDir)) {
        const manifestPath = path.join(toolsDir, dir, 'tool.manifest.ts')
        if (fs.existsSync(manifestPath)) files.push(manifestPath)
      }
    } catch {}
    return files
  }

  return {
    name: 'toolbox-manifests',
    resolveId(id: string) {
      if (id === VIRTUAL_ID) return RESOLVED_ID
    },
    load(id: string) {
      if (id !== RESOLVED_ID) return
      const files = getManifestFiles()
      const imports = files.map((f, i) => `import m${i} from ${JSON.stringify(f)}`).join('\n')
      return `${imports}\nexport const allManifests = [${files.map((_, i) => `m${i}`).join(', ')}]\n`
    },
    configureServer(server: any) {
      server.watcher.add(path.join(root, 'tools'))
      server.watcher.on('add', (file: string) => {
        if (file.endsWith('tool.manifest.ts')) {
          const mod = server.moduleGraph.getModuleById(RESOLVED_ID)
          if (mod) server.moduleGraph.invalidateModule(mod)
          server.hot.send({ type: 'full-reload' })
        }
      })
    },
  }
}

const toolAliases = scanToolAliases()
console.log(`[vite] Auto-scanned ${Object.keys(toolAliases)} tool aliases`)

// https://vitejs.dev/config/
export default defineConfig({
  base,
  plugins: [
    react(),
    toolManifestPlugin(),
    {
      name: 'toolbox-security-api',
      configureServer(server) {
        server.middlewares.use(createSecurityApiMiddleware())
      },
    },
    {
      name: 'toolbox-domain-suite-api',
      configureServer(server) {
        server.middlewares.use(createDomainSuiteApiMiddleware())
      },
    },
    {
      name: 'toolbox-ip-ops-api',
      configureServer(server) {
        server.middlewares.use(createIpOpsApiMiddleware())
      },
    },
    {
      name: 'toolbox-whois-lookup-api',
      configureServer(server) {
        server.middlewares.use(createWhoisLookupApiMiddleware())
      },
    },
    {
      name: 'toolbox-cert-tools-api',
      configureServer(server) {
        server.middlewares.use(createCertToolsApiMiddleware())
      },
    },
    {
      name: 'toolbox-ssl-cert-api',
      configureServer(server) {
        server.middlewares.use(createSslCertApiMiddleware())
      },
    },
  ],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
  },
  resolve: {
    alias: {
      // 核心包
      '@toolbox/service-core': path.join(root, 'packages/service-core/src/index.js'),
      '@toolbox/legacy-tools-service': path.join(root, 'services/legacy-tools-service/src/index.js'),
      '@toolbox/i18n-runtime': path.join(root, 'packages/i18n-runtime/src/index.ts'),
      '@toolbox/tool-registry': path.join(root, 'packages/tool-registry/src/index.ts'),
      '@toolbox/ui-kit': path.join(root, 'packages/ui-kit/src/index.ts'),
      '@toolbox/storage': path.join(root, 'packages/storage/src/index.ts'),
      react: path.join(root, 'apps/web/node_modules/react'),
      'react-dom': path.join(root, 'apps/web/node_modules/react-dom'),
      'lucide-react': path.join(root, 'apps/web/node_modules/lucide-react'),
      'react-i18next': path.join(root, 'apps/web/node_modules/react-i18next'),
      '@toolbox/TimezoneConverter': path.join(root, 'tools/TimezoneConverter'),
      // 自动扫描的工具包 alias
      ...toolAliases,
    },
  },
  optimizeDeps: {
    exclude: [
      ...Object.keys(toolAliases),
      '@toolbox/storage',
    ],
  },
})
