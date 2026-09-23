# Photo Portfolio (PWA)

React + Vite photo portfolio with offline-first PWA support.

**Live:** https://photos.raako.net/

App source lives in the `photos/` subdirectory.

## Features

- Progressive Web App (installable on tablet / phone / desktop)
- **Infinite-style caching** of photo assets via service worker (`CacheFirst`, ~10 year max age + high entry limit)
- Network-first for `albums-manifest.json` so new albums appear after a force update
- **Hidden force-reload** to clear cache and pull fresh images / app code:
  - **Long-press** the "Home" breadcrumb (~2.5 seconds), or
  - **Click "Home" 5 times quickly**
  - Confirm the dialog → caches + service workers are cleared → page reloads

## Development

```bash
cd photos
npm install
npm run generate-thumbnails   # process sources/images → public/images + manifest
npm run dev
```

Service worker is disabled in dev (`devOptions.enabled: false`).

## Production build

```bash
cd photos
npm install
npm run generate-thumbnails
npm run build
# output in photos/dist – copy to your web root (e.g. /var/www/photos)
```

## Nginx

See [`deploy/nginx-photos.raako.net.conf`](deploy/nginx-photos.raako.net.conf) for a ready-to-use config.

Key points:
- `index.html`, `sw.js`, `manifest.webmanifest` → `Cache-Control: no-cache` (required for updates)
- `/images/` and hashed `/assets/` → long-lived `immutable` cache
- SPA `try_files` fallback to `index.html`

## Icons

Currently uses `public/camera.png`. For best install experience on iOS/Android, replace with proper 192×192 and 512×512 PNG icons and update the `icons` array in `vite.config.ts`.

## Force update on tablet

1. Open the installed PWA (or the site).
2. Long-press **Home** in the top breadcrumb, or tap Home five times quickly.
3. Confirm → cache is wiped and the app reloads with the latest build + images.
