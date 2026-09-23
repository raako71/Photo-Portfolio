import { PWA_PREFETCH_SESSION_KEY } from './isPwa';

/**
 * Force-clear PWA caches + unregister service workers, then hard-reload.
 * Use this when you want the tablet to pull fresh images / a new build.
 */
export async function clearPwaCacheAndReload(): Promise<void> {
  try {
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map((r) => r.unregister()));
    }

    if ('caches' in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => caches.delete(key)));
    }

    // Allow offline prefetch to run again after a force clear
    try {
      sessionStorage.removeItem(PWA_PREFETCH_SESSION_KEY);
    } catch {
      /* ignore */
    }
  } catch (err) {
    console.error('Failed to clear PWA cache:', err);
  }

  window.location.reload();
}

export function isOnline(): boolean {
  return typeof navigator !== 'undefined' ? navigator.onLine !== false : true;
}

export function confirmClearPwaCacheAndReload(): void {
  if (!isOnline()) {
    window.alert(
      'No network connection.\n\nForce update needs the internet so new photos and app updates can be downloaded.'
    );
    return;
  }

  const ok = window.confirm(
    'Force update?\n\nThis clears the offline cache and reloads so new photos / app updates are downloaded.\n\nContinue?'
  );
  if (ok) {
    void clearPwaCacheAndReload();
  }
}
