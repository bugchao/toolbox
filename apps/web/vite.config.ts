import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { createDomainSuiteApiMiddleware } from '../../tools/tool-domain-suite/server/domain-suite-api.js'
import { createIpOpsApiMiddleware } from '../../tools/tool-ip-ops-suite/server/ip-ops-api.js'
import { createSecurityApiMiddleware } from '../../tools/tool-security-suite/server/security-api.js'

const root = path.resolve(__dirname, '../..')
const base = process.env.VITE_APP_BASE_PATH || '/'

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
      '@toolbox/ui-kit': path.join(root, 'packages/ui-kit/src/index.ts'),
      '@toolbox/tool-json': path.join(root, 'tools/tool-json'),
      '@toolbox/tool-weather': path.join(root, 'tools/tool-weather'),
      '@toolbox/tool-github-info': path.join(root, 'tools/tool-github-info'),
      '@toolbox/tool-ip-query': path.join(root, 'tools/tool-ip-query'),
      '@toolbox/tool-ip-asn': path.join(root, 'tools/tool-ip-asn'),
      '@toolbox/tool-dns-trace': path.join(root, 'tools/tool-dns-trace'),
      '@toolbox/tool-dns-propagation': path.join(root, 'tools/tool-dns-propagation'),
      '@toolbox/tool-ppt-generator': path.join(root, 'tools/tool-ppt-generator'),
      '@toolbox/tool-dns-global-check': path.join(root, 'tools/tool-dns-global-check'),
      '@toolbox/tool-dnssec-check': path.join(root, 'tools/tool-dnssec-check'),
      '@toolbox/tool-dns-performance': path.join(root, 'tools/tool-dns-performance'),
      '@toolbox/tool-dns-ttl': path.join(root, 'tools/tool-dns-ttl'),
      '@toolbox/tool-dns-soa': path.join(root, 'tools/tool-dns-soa'),
      '@toolbox/tool-dns-diagnose': path.join(root, 'tools/tool-dns-diagnose'),
      '@toolbox/tool-dns-pollution-check': path.join(root, 'tools/tool-dns-pollution-check'),
      '@toolbox/tool-dns-hijack-check': path.join(root, 'tools/tool-dns-hijack-check'),
      '@toolbox/tool-dns-cache-check': path.join(root, 'tools/tool-dns-cache-check'),
      '@toolbox/tool-dns-loop-check': path.join(root, 'tools/tool-dns-loop-check'),
      '@toolbox/tool-dns-ns': path.join(root, 'tools/tool-dns-ns'),
      '@toolbox/tool-dns-cname-chain': path.join(root, 'tools/tool-dns-cname-chain'),
      '@toolbox/tool-dns-nxdomain': path.join(root, 'tools/tool-dns-nxdomain'),
      '@toolbox/tool-domain-mx': path.join(root, 'tools/tool-domain-mx'),
      '@toolbox/tool-domain-txt': path.join(root, 'tools/tool-domain-txt'),
      '@toolbox/tool-http-headers': path.join(root, 'tools/tool-http-headers'),
      '@toolbox/tool-ssl-cert': path.join(root, 'tools/tool-ssl-cert'),
      '@toolbox/tool-http-status': path.join(root, 'tools/tool-http-status'),
      '@toolbox/tool-tcp-port': path.join(root, 'tools/tool-tcp-port'),
      '@toolbox/tool-ping': path.join(root, 'tools/tool-ping'),
      '@toolbox/tool-domain-suite': path.join(root, 'tools/tool-domain-suite'),
      '@toolbox/tool-ip-ops-suite': path.join(root, 'tools/tool-ip-ops-suite'),
      '@toolbox/tool-security-suite': path.join(root, 'tools/tool-security-suite'),
      '@toolbox/tool-ipam-suite': path.join(root, 'tools/tool-ipam-suite'),
      '@toolbox/tool-subnet-suite': path.join(root, 'tools/tool-subnet-suite'),
    },
  },
  server: {
    port: 3000,
    host: false,
    fs: { allow: [root] },
  },
  optimizeDeps: {
    exclude: ['@toolbox/tool-resume', '@toolbox/tool-pdf', '@toolbox/tool-qrcode', '@toolbox/tool-json', '@toolbox/tool-weather', '@toolbox/tool-github-info', '@toolbox/tool-ip-query', '@toolbox/tool-ip-asn', '@toolbox/tool-dns-trace', '@toolbox/tool-dns-propagation', '@toolbox/tool-ppt-generator', '@toolbox/tool-dns-global-check', '@toolbox/tool-dnssec-check', '@toolbox/tool-dns-performance', '@toolbox/tool-dns-ttl', '@toolbox/tool-security-suite', '@toolbox/tool-dns-soa', '@toolbox/tool-dns-diagnose', '@toolbox/tool-dns-pollution-check', '@toolbox/tool-dns-hijack-check', '@toolbox/tool-dns-cache-check', '@toolbox/tool-dns-loop-check', '@toolbox/tool-dns-ns', '@toolbox/tool-dns-cname-chain', '@toolbox/tool-dns-nxdomain', '@toolbox/tool-domain-mx', '@toolbox/tool-http-headers', '@toolbox/tool-ssl-cert', '@toolbox/tool-http-status', '@toolbox/tool-tcp-port', '@toolbox/tool-ping', '@toolbox/tool-domain-txt', '@toolbox/tool-domain-suite', '@toolbox/tool-ip-ops-suite', '@toolbox/tool-ipam-suite', '@toolbox/tool-subnet-suite']
  },
  build: {
    outDir: 'dist'
  }
})
