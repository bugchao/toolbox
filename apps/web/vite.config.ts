import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const root = path.resolve(__dirname, '../..')

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    // 开发/构建均从源码解析，无需先 pnpm run build ui-kit 即可使用新导出
    alias: {
      '@toolbox/ui-kit': path.join(root, 'packages/ui-kit/src/index.ts'),
    },
  },
  server: {
    port: 3000,
    host: false,
    fs: { allow: [root] },
  },
  optimizeDeps: {
    exclude: ['@toolbox/tool-resume', '@toolbox/tool-pdf', '@toolbox/tool-qrcode']
  },
  build: {
    outDir: 'dist'
  }
})
