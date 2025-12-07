import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'mapbox': ['mapbox-gl'],
          'leaflet': ['leaflet', 'react-leaflet']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  },
  optimizeDeps: {
    include: ['mapbox-gl', 'react', 'react-dom', 'framer-motion', 'leaflet']
  }
})
