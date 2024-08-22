import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

export default defineConfig({
  build: {
      chunkSizeWarningLimit: 1600
  },
  define: {
    'process.env': {
      REACT_APP_DEV_BASE_URL: process.env.REACT_APP_DEV_BASE_URL,
    }
  },
  plugins: [
    react(),
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5301',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
