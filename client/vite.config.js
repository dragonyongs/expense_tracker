import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        clientsClaim: true,
        skipWaiting: true
      },
      injectRegister: 'auto',
      devOptions: {
        enabled: true
      },
    })
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
