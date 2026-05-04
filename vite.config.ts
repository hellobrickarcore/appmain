import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import basicSsl from '@vitejs/plugin-basic-ssl';
import fs from 'fs';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env vars from .env.local and .env files
  const env = loadEnv(mode, process.cwd(), '');

  return {
    base: './',
    plugins: [react()],
    optimizeDeps: {
      include: ['react', 'react-dom', 'react-router-dom']
    },
    server: {
      port: 5173,
      host: '0.0.0.0', // Listen on all network interfaces
      strictPort: false,
      allowedHosts: true, // Allow any host (including local IP) to connect
      cors: true, // Enable CORS for tunnel access
      hmr: true, // Let Vite detect the HMR settings automatically for the tunnel
      // Central proxy for all backend services to enable mobile access via relative paths
      proxy: {
        '/api/detect': {
          target: process.env.VITE_DETECTION_API_URL?.replace('/api/detect', '') || 'http://127.0.0.1:3001',
          changeOrigin: true,
          secure: false
        },
        '/api/dataset': {
          target: 'https://hellobrick.netlify.app',
          changeOrigin: true,
          secure: true
        },
        '/api/xp': {
          target: 'https://hellobrick.netlify.app',
          changeOrigin: true,
          secure: true
        },
        '/api/auth': {
          target: 'https://hellobrick.netlify.app',
          changeOrigin: true,
          secure: true
        },
        '/api/user': {
          target: 'https://hellobrick.netlify.app',
          changeOrigin: true,
          secure: true
        },
        '/api/feed': {
          target: 'https://hellobrick.netlify.app',
          changeOrigin: true,
          secure: true
        },
        '/api/notifications': {
          target: 'https://hellobrick.netlify.app',
          changeOrigin: true,
          secure: true
        }
      }

    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: false,
      chunkSizeWarningLimit: 2000,
      rollupOptions: {
        output: {
          manualChunks: undefined // Let Vite handle it naturally
        }
      }
    }
  };
});
