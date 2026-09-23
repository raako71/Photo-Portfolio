# Photo Portfolio (PWA)

React + Vite photo portfolio with offline-first PWA support.

**Live:** https://photos.raako.net/

App source lives in the `photos/` subdirectory.

## Features

- Progressive Web App (installable on tablet / phone / desktop)
- Photos under `/images/` use **CacheFirst** (long-lived offline cache)
- `albums-manifest.json` and page navigations use **NetworkFirst** (new albums / app shell update without wiping photo cache)
- **Home** is a normal in-app link (no special handlers)
- **Hidden force-reload** (clear all caches + reload):
  - Long-press the **header bar background** (not the Home/album text) for ~2.5 seconds
  - Confirm the dialog

## Development

```bash
cd photos
npm install
npm run generate-thumbnails
npm run dev
```

Service worker is disabled in dev.

## Production build

```bash
cd photos
npm install
npm run generate-thumbnails
npm run build
# copy photos/dist → web root (e.g. /var/www/photos)
```

## Nginx

See [`deploy/nginx-photos.raako.net.conf`](deploy/nginx-photos.raako.net.conf).

- `index.html`, `sw.js`, `manifest.webmanifest` → `no-cache`
- `/images/` and `/assets/` → long-lived cache

## Force update on tablet

Long-press empty space on the top header bar → confirm → caches cleared and app reloads.

Normal **Home** taps only navigate; they do not clear cache.
