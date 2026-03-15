import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const root = path.resolve(__dirname, '../..')

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    // 开发/构建均从源码解析，避免 workspace 未正确 link 时解析失败
    alias: {
      '@toolbox/ui-kit': path.join(root, 'packages/ui-kit/src/index.ts'),
      '@toolbox/tool-json': path.join(root, 'tools/tool-json'),
    },
  },
  server: {
    port: 3000,
    host: false,
    fs: { allow: [root] },
  },
  optimizeDeps: {
    exclude: ['@toolbox/tool-resume', '@toolbox/tool-pdf', '@toolbox/tool-qrcode', '@toolbox/tool-json']
  },
  build: {
    outDir: 'dist'
  }
})
