import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: false,
    fs: { allow: [path.resolve(__dirname, '../..')] }
  },
  optimizeDeps: {
    exclude: ['@toolbox/tool-resume', '@toolbox/tool-pdf', '@toolbox/tool-qrcode']
  },
  build: {
    outDir: 'dist'
  }
})
