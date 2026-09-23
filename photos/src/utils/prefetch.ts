type Manifest = Record<string, string[]>;

export type PrefetchProgress = {
  done: number;
  total: number;
};

async function loadManifest(): Promise<Manifest> {
  const response = await fetch('/albums-manifest.json');
  if (!response.ok) {
    throw new Error('Failed to load albums-manifest.json');
  }
  return response.json();
}

function urlsForAlbum(albumName: string, files: string[]): string[] {
  const urls: string[] = [];
  for (const file of files) {
    urls.push(`/images/${albumName}/thumbs/${file}`);
    urls.push(`/images/${albumName}/home/${file}`);
    urls.push(`/images/${albumName}/web/${file}`);
  }
  return urls;
}

/**
 * Fetch URLs with limited concurrency so the SW CacheFirst strategy
 * can store them for offline use without flooding the network.
 */
async function prefetchUrls(
  urls: string[],
  onProgress?: (progress: PrefetchProgress) => void,
  concurrency = 4
): Promise<void> {
  const total = urls.length;
  let done = 0;
  let index = 0;

  onProgress?.({ done: 0, total });

  if (total === 0) return;

  const worker = async () => {
    while (index < urls.length) {
      const url = urls[index++];
      try {
        // fetch (not Image) so the service worker can cache the response
        await fetch(url, { credentials: 'same-origin', cache: 'default' });
      } catch {
        // continue; offline gaps are acceptable
      }
      done += 1;
      onProgress?.({ done, total });
    }
  };

  const workers = Array.from({ length: Math.min(concurrency, total) }, () => worker());
  await Promise.all(workers);
}

/** Prefetch every size of every photo in the portfolio. */
export async function prefetchAllImages(
  onProgress?: (progress: PrefetchProgress) => void
): Promise<void> {
  const manifest = await loadManifest();
  const urls: string[] = [];

  for (const [albumName, files] of Object.entries(manifest)) {
    urls.push(...urlsForAlbum(albumName, files || []));
  }

  await prefetchUrls(urls, onProgress);
}

/** Prefetch every size for one album. */
export async function prefetchAlbumImages(
  albumName: string,
  onProgress?: (progress: PrefetchProgress) => void
): Promise<void> {
  const manifest = await loadManifest();
  const files = manifest[albumName] || [];
  await prefetchUrls(urlsForAlbum(albumName, files), onProgress);
}
