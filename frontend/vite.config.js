import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: undefined,
        format: 'es'
      }
    }
  },
  server: {
    headers: {
      'Content-Type': 'application/javascript'
    }
  },
  resolve: {
    alias: {
      '@': '/src'
    }
  }
})
