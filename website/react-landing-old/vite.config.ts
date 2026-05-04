import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 4005,
    strictPort: true,
    proxy: {
      '/api/admin': {
        target: 'http://127.0.0.1:3008',
        changeOrigin: true
      },
      '/api/auth': {
        target: 'http://127.0.0.1:3007',
        changeOrigin: true
      },
      '/api/feed': {
        target: 'http://127.0.0.1:3006',
        changeOrigin: true
      },
      '/api/xp': {
        target: 'http://127.0.0.1:3005',
        changeOrigin: true
      },
      '/api': {
        target: 'http://127.0.0.1:3003',
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});