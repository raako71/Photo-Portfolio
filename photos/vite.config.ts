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
      registerType: 'prompt',
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
        // Precache the app shell (HTML/JS/CSS) generated at build time
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,json}'],
        // Do not precache large photo assets – they are handled at runtime
        globIgnores: ['**/images/**'],
        runtimeCaching: [
          {
            // Album covers, thumbs, web-sized photos – CacheFirst, never expire
            urlPattern: /\/images\/.*\.(?:png|jpg|jpeg|gif|webp|avif)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'photos-images-infinite',
              // No maxAgeSeconds = effectively infinite until manual clear or SW update
              expiration: {
                maxEntries: 2000,
                // 10 years – practical "infinite" while still allowing eventual cleanup
                maxAgeSeconds: 60 * 60 * 24 * 365 * 10,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            // Manifest that lists albums – prefer network so new albums appear after force-reload
            urlPattern: /\/albums-manifest\.json$/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'albums-manifest',
              networkTimeoutSeconds: 5,
              expiration: {
                maxEntries: 5,
                maxAgeSeconds: 60 * 60 * 24, // 1 day fallback
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            // Google Fonts (stylesheets)
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'google-fonts-stylesheets',
            },
          },
          {
            // Google Fonts (files)
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
        // Clean up old caches when a new SW activates
        cleanupOutdatedCaches: true,
        clientsClaim: true,
      },
      devOptions: {
        enabled: false, // keep SW off in dev for easier debugging
      },
    }),
  ],
})
