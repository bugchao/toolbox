import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { createSecurityApiMiddleware } from '../../tools/tool-security-suite/server/security-api.js'

const root = path.resolve(__dirname, '../..')

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'toolbox-security-api',
      configureServer(server) {
        server.middlewares.use(createSecurityApiMiddleware())
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
      '@toolbox/tool-security-suite': path.join(root, 'tools/tool-security-suite'),
    },
  },
  server: {
    port: 3000,
    host: false,
    fs: { allow: [root] },
  },
  optimizeDeps: {
    exclude: ['@toolbox/tool-resume', '@toolbox/tool-pdf', '@toolbox/tool-qrcode', '@toolbox/tool-json', '@toolbox/tool-ip-query', '@toolbox/tool-ip-asn', '@toolbox/tool-dns-trace', '@toolbox/tool-dns-propagation', '@toolbox/tool-ppt-generator', '@toolbox/tool-dns-global-check', '@toolbox/tool-dnssec-check', '@toolbox/tool-dns-performance', '@toolbox/tool-dns-ttl', '@toolbox/tool-security-suite', '@toolbox/tool-dns-soa', '@toolbox/tool-dns-diagnose', '@toolbox/tool-dns-pollution-check', '@toolbox/tool-dns-hijack-check', '@toolbox/tool-dns-cache-check', '@toolbox/tool-dns-loop-check']
  },
  build: {
    outDir: 'dist'
  }
})
