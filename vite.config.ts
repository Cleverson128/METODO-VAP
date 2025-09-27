// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { viteStaticCopy } from 'vite-plugin-static-copy'; // 1. Importe o novo plugin

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // ... (toda a sua configuração do PWA pode continuar a mesma)
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'robots.txt', 'apple-touch-icon.png', 'exercises/**/*'],
      manifest: {
        name: 'Método VAP',
        short_name: 'VAP',
        description: 'Portal educacional do Método VAP',
        start_url: '/',
        display: 'standalone',
        background_color: '#272525',
        theme_color: '#0AFF0F',
        icons: [
          {
            src: '/icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    }),
    // 2. Adicione a configuração do plugin de cópia
    viteStaticCopy({
      targets: [
        {
          src: 'public/exercises', // A pasta que você quer copiar
          dest: '.'             // O destino (a raiz da pasta 'dist')
        }
      ]
    })
  ]
});