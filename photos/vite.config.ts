import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['camera.png'],
      manifest: {
        name: 'Photo Portfolio',
        short_name: 'Photos',
        description: 'Photo portfolio by Harry Parkinson',
        theme_color: '#000000',
        background_color: '#000000',
        display: 'standalone',
        orientation: 'any',
        start_url: '/',
        scope: '/',
        icons: [
          {
            src: 'camera.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'camera.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        // App shell precache (not the large photo files)
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,json}'],
        globIgnores: ['**/images/**'],

        // SPA: any navigation falls back to index.html from the precache
        navigateFallback: 'index.html',
        navigateFallbackDenylist: [/^\/images\//, /^\/api\//],

        runtimeCaching: [
          {
            // Page navigations – prefer network so a hard open/reload gets a fresh shell
            urlPattern: ({ request }) => request.mode === 'navigate',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'pages',
              networkTimeoutSeconds: 3,
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // Photos – CacheFirst (offline / “infinite” until force clear)
            urlPattern: /\/images\/.*\.(?:png|jpg|jpeg|gif|webp|avif)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'photos-images-infinite',
              expiration: {
                maxEntries: 2000,
                maxAgeSeconds: 60 * 60 * 24 * 365 * 10,
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // Album list – network first so new albums show up without wiping image cache
            urlPattern: /\/albums-manifest\.json$/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'albums-manifest',
              networkTimeoutSeconds: 5,
              expiration: {
                maxEntries: 5,
                maxAgeSeconds: 60 * 60 * 24,
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'google-fonts-stylesheets' },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
})
