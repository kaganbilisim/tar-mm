import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'icon.svg'],
        manifest: {
          id: 'com.tarimcepte.app',
          name: 'Tarım Cepte AI - Çaylık & Fındık Üretici Takibi',
          short_name: 'Tarım Cepte',
          description: 'Karadeniz çay ve fındık üreticileri için hasat, tahsilat, alacak takibi, iş gücü pazarı ve yapay zeka ziraat asistanı.',
          theme_color: '#06140f',
          background_color: '#06140f',
          display: 'standalone',
          orientation: 'portrait',
          start_url: '/',
          scope: '/',
          categories: ['business', 'finance', 'productivity', 'utilities'],
          shortcuts: [
            {
              name: 'Hasat Ekle',
              short_name: 'Hasat',
              description: 'Yeni hasat teslimatı kaydet',
              url: '/?action=add-harvest',
              icons: [{ src: '/pwa-192x192.png', sizes: '192x192' }],
            },
            {
              name: 'Tarım Pazar Yeri',
              short_name: 'Pazar',
              description: 'İşçi, çavuş ve hasat ilanları',
              url: '/?tab=marketplace',
              icons: [{ src: '/pwa-192x192.png', sizes: '192x192' }],
            },
            {
              name: 'Tahsilat Takibi',
              short_name: 'Tahsilat',
              description: 'Vadeli bakiye ve ödemeler',
              url: '/?tab=receivables',
              icons: [{ src: '/pwa-192x192.png', sizes: '192x192' }],
            },
            {
              name: 'Bahçe ve Parsel Yönetimi',
              short_name: 'Bahçeler',
              description: 'Kayıtlı bahçeler ve GPS parselleri',
              url: '/?tab=other&sub=gardens',
              icons: [{ src: '/pwa-192x192.png', sizes: '192x192' }],
            },
          ],
          icons: [
            {
              src: '/pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-maskable-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        },
        devOptions: {
          enabled: false,
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
