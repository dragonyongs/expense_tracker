import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { VitePWA } from 'vite-plugin-pwa';
// import fs from 'fs';
// import path from 'path';

export default defineConfig({
  build: {
    chunkSizeWarningLimit: 1600,
  },
  define: {
    'process.env': {
      REACT_APP_DEV_BASE_URL: process.env.VITE_DEV_BASE_URL,
    }
  },
  plugins: [
    react(),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.js',
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'StarRich Pay',
        short_name: 'StarRich Pay',
        description: '카드 지출 관리 웹앱',
        theme_color: '#0433ff',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-256x256.png',
            sizes: '256x256',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
      
    }),
  ],
  server: {
    // https: {
    //   key: fs.readFileSync(path.resolve(__dirname, 'certs/localhost-key.pem')),
    //   cert: fs.readFileSync(path.resolve(__dirname, 'certs/localhost-cert.pem')),
    // },
    proxy: {
      '/api': {
        target: 'http://localhost:5301',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
