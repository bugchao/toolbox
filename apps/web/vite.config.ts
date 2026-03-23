import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { createDomainSuiteApiMiddleware } from '../../tools/tool-domain-suite/server/domain-suite-api.js'
import { createIpOpsApiMiddleware } from '../../tools/tool-ip-ops-suite/server/ip-ops-api.js'
import { createSecurityApiMiddleware } from '../../tools/tool-security-suite/server/security-api.js'
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
      if (dir.startsWith('tool-')) {
        const toolPath = path.join(toolsDir, dir)
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

const toolAliases = scanToolAliases()
console.log(`[vite] Auto-scanned ${Object.keys(toolAliases)} tool aliases`)

// https://vitejs.dev/config/
export default defineConfig({
  base,
  plugins: [
    react(),
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
      // 自动扫描的工具包 alias
      ...toolAliases,
    },
  },
  optimizeDeps: {
    exclude: [
      '@toolbox/tool-resume',
      '@toolbox/tool-pdf',
      '@toolbox/tool-qrcode',
      '@toolbox/tool-json',
      '@toolbox/tool-github-info',
      '@toolbox/tool-ip-query',
      '@toolbox/tool-ip-asn',
      '@toolbox/tool-dns-trace',
      '@toolbox/tool-dns-propagation',
      '@toolbox/tool-ppt-generator',
      '@toolbox/tool-dns-global-check',
      '@toolbox/tool-dnssec-check',
      '@toolbox/tool-dns-performance',
      '@toolbox/tool-dns-ttl',
      '@toolbox/tool-security-suite',
      '@toolbox/tool-dns-soa',
      '@toolbox/tool-dns-diagnose',
      '@toolbox/tool-dns-pollution-check',
      '@toolbox/tool-dns-hijack-check',
      '@toolbox/tool-dns-cache-check',
      '@toolbox/tool-dns-loop-check',
      '@toolbox/tool-dns-ns',
      '@toolbox/tool-dns-cname-chain',
      '@toolbox/tool-dns-nxdomain',
      '@toolbox/tool-domain-mx',
      '@toolbox/tool-http-headers',
      '@toolbox/tool-ssl-cert',
      '@toolbox/tool-http-status',
      '@toolbox/tool-tcp-port',
      '@toolbox/tool-ping',
      '@toolbox/tool-dns-latency',
      '@toolbox/tool-dns-authoritative',
      '@toolbox/tool-dns-recursive',
      '@toolbox/tool-dns-path-viz',
      '@toolbox/tool-dns-tunnel',
      '@toolbox/tool-domain-txt',
      '@toolbox/tool-domain-suite',
      '@toolbox/tool-ip-ops-suite',
      '@toolbox/tool-ipam-suite',
      '@toolbox/tool-subnet-suite',
      '@toolbox/tool-dhcp-pool-calc',
      '@toolbox/tool-dhcp-option',
      '@toolbox/tool-dhcp-mac-binding',
      '@toolbox/tool-dhcp-config-gen',
      '@toolbox/tool-traceroute',
      '@toolbox/tool-dhcp-utilization',
      '@toolbox/tool-dhcp-conflict',
      '@toolbox/tool-gslb-weight-calc',
      '@toolbox/tool-web-availability',
      '@toolbox/tool-security-domain-score',
      '@toolbox/tool-gslb-failover-sim',
      '@toolbox/tool-gslb-geo-sim',
      '@toolbox/tool-security-dnssec-verify',
      '@toolbox/tool-security-dns-ddos',
      '@toolbox/tool-cdn-check',
      '@toolbox/tool-dhcp-discover-sim',
      '@toolbox/tool-ipam-subnet-util',
      '@toolbox/tool-gslb-health-sim',
      '@toolbox/tool-gslb-latency-sim',
      '@toolbox/tool-server-latency',
      '@toolbox/tool-dhcp-lease-analysis',
      '@toolbox/tool-ipam-visualize',
      '@toolbox/tool-gslb-policy-sim',
      '@toolbox/tool-gslb-rule-validate',
      '@toolbox/tool-api-availability',
      '@toolbox/tool-gslb-isp-sim',
      '@toolbox/tool-gslb-traffic-predict',
      '@toolbox/tool-gslb-hit-predict',
      '@toolbox/tool-ipam-reclaim',
      '@toolbox/tool-security-domain-hijack',
      '@toolbox/tool-dhcp-log-analysis',
      '@toolbox/tool-dhcp-scan',
      '@toolbox/tool-ipam-changelog',
      '@toolbox/tool-ipam-scan',
      '@toolbox/tool-pomodoro',
      '@toolbox/tool-habit-tracker',
      '@toolbox/tool-salary-calc',
      '@toolbox/tool-currency-converter',
      '@toolbox/tool-jwt-decoder',
      '@toolbox/tool-expense-tracker',
      '@toolbox/tool-subscription-manager',
      '@toolbox/tool-calorie-calc',
      '@toolbox/tool-random-menu',
      '@toolbox/tool-curl-to-fetch',
      '@toolbox/tool-installment-calc',
      '@toolbox/tool-okr-planner',
      '@toolbox/tool-travel-checklist',
      '@toolbox/tool-travel-budget',
      '@toolbox/tool-split-bill',
      '@toolbox/tool-timezone-calc',
      '@toolbox/tool-distance-calc',
      '@toolbox/tool-packing-list',
      '@toolbox/tool-recipe-finder',
      '@toolbox/tool-study-timer',
      '@toolbox/tool-todo-list',
      '@toolbox/storage',
    ],
  },
})
