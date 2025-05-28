// client/vite.config.ts - Update this file to add proxy configuration
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    define: {
      // Expose env variables to your client code
      'process.env.VITE_API_URL': JSON.stringify(env.VITE_API_URL),
    },
    // Add a proxy to forward API requests to your backend server (only in development)
    server: {
      proxy: {
        '/api': {
          target: env.VITE_API_URL || 'http://localhost:5001',
          changeOrigin: true,
          secure: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
    build: {
      outDir: 'dist',
      sourcemap: true,
      // Ensure proper error handling
      rollupOptions: {
        onwarn(warning, warn) {
          if (warning.code === 'UNUSED_EXTERNAL_IMPORT') return;
          warn(warning);
        },
      },
    },
  };
});