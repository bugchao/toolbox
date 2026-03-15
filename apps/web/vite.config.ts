import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const root = path.resolve(__dirname, '../..')

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
  },
  resolve: {
    // 开发/构建均从源码解析，避免 workspace 未正确 link 时解析失败
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
    },
  },
  server: {
    port: 3000,
    host: false,
    fs: { allow: [root] },
  },
  optimizeDeps: {
    exclude: ['@toolbox/tool-resume', '@toolbox/tool-pdf', '@toolbox/tool-qrcode', '@toolbox/tool-json', '@toolbox/tool-ip-query', '@toolbox/tool-ip-asn', '@toolbox/tool-dns-trace', '@toolbox/tool-dns-propagation', '@toolbox/tool-ppt-generator', '@toolbox/tool-dns-global-check', '@toolbox/tool-dnssec-check', '@toolbox/tool-dns-performance', '@toolbox/tool-dns-ttl']
  },
  build: {
    outDir: 'dist'
  }
})
