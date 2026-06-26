import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Split vendor chunks using the rolldown-compatible function form
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('react-dom') || id.includes('react-router-dom')) {
            return 'react-vendor'
          }
          if (id.includes('react/')) {
            return 'react-vendor'
          }
          if (id.includes('react-syntax-highlighter') || id.includes('lucide-react')) {
            return 'ui-vendor'
          }
          if (id.includes('react-helmet-async')) {
            return 'helmet'
          }
        },
      },
    },
    cssMinify: true,
    chunkSizeWarningLimit: 1000,
  },
})
