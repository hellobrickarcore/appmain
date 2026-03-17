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
          target: 'http://127.0.0.1:3003',
          changeOrigin: true,
          secure: false
        },
        '/api/dataset': {
          target: 'http://127.0.0.1:3004',
          changeOrigin: true,
          secure: false
        },
        '/api/xp': {
          target: 'http://127.0.0.1:3005',
          changeOrigin: true,
          secure: false
        },
        '/api/auth': {
          target: 'http://127.0.0.1:3007',
          changeOrigin: true,
          secure: false
        },
        '/api/user': {
          target: 'http://127.0.0.1:3007',
          changeOrigin: true,
          secure: false
        },
        '/api/feed': {
          target: 'http://127.0.0.1:3006',
          changeOrigin: true,
          secure: false
        },
        '/api/notifications': {
          target: 'http://127.0.0.1:3007',
          changeOrigin: true,
          secure: false
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
