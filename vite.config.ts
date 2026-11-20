import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import cesium from 'vite-plugin-cesium';

export default defineConfig({
  // Drop the plugin's index.html tags: they put the 5.7 MB Cesium.js on every page.
  // HimalayanMapPage loads it when the 3D view is opened instead.
  plugins: [react(), { ...cesium(), transformIndexHtml: undefined }],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'mapbox': ['mapbox-gl']
        }
      }
    },
    chunkSizeWarningLimit: 2000
  },
  optimizeDeps: {
    include: ['mapbox-gl', 'react', 'react-dom', 'framer-motion']
  }
});
