import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'favicon.svg', 
        'favicon.ico', 
        'robots.txt', 
        'apple-touch-icon.png',
        'android-chrome-192x192.png',
        'android-chrome-512x512.png',
        'favicon-16x16.png',
        'favicon-32x32.png'
      ],
      workbox: {
        clientsClaim: true,
        skipWaiting: true
      },
      injectRegister: 'auto',
      devOptions: {
        enabled: true
      },
      manifest: {
        name: 'Expense Tracker',
        short_name: 'Expense Tracker',
        description: 'An app to track your expenses',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'favicon.ico',
            sizes: '64x64 32x32 24x24 16x16',
            type: 'image/x-icon'
          },
          {
            src: 'android-chrome-192x192.png',
            type: 'image/png',
            sizes: '192x192'
          },
          {
            src: 'android-chrome-512x512.png',
            type: 'image/png',
            sizes: '512x512'
          },
          {
            src: 'apple-touch-icon.png',
            type: 'image/png',
            sizes: '180x180'
          },
          {
            src: 'favicon-16x16.png',
            type: 'image/png',
            sizes: '16x16'
          },
          {
            src: 'favicon-32x32.png',
            type: 'image/png',
            sizes: '32x32'
          }
        ]
      }
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
