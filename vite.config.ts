import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import cesium from 'vite-plugin-cesium';

export default defineConfig({
  plugins: [react(), cesium()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'cesium': ['cesium'],
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'animation': ['framer-motion']
        }
      }
    },
    chunkSizeWarningLimit: 2000
  },
  optimizeDeps: {
    include: ['cesium', 'react', 'react-dom', 'framer-motion']
  }
});
