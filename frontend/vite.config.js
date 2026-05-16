import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  define: {
    global: 'window',
  },
  server: {
    port: 3000,
    proxy: {
      '/api': 'http://127.0.0.1:8080',
      '/ws-chat': {
        target: 'http://127.0.0.1:8080',
        ws: true,
      },
    },
  },
})
