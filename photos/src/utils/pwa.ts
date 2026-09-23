/**
 * Force-clear PWA caches + unregister service workers, then hard-reload.
 * Use this when you want the tablet to pull fresh images / a new build.
 */
export async function clearPwaCacheAndReload(): Promise<void> {
  try {
    // 1. Unregister every service worker for this origin
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map((r) => r.unregister()));
    }

    // 2. Delete every Cache Storage entry
    if ('caches' in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => caches.delete(key)));
    }
  } catch (err) {
    console.error('Failed to clear PWA cache:', err);
  }

  // 3. Hard reload (bypass any remaining HTTP cache where possible)
  window.location.reload();
}

/**
 * Ask the user then clear + reload. Safe to call from UI gestures.
 */
export function confirmClearPwaCacheAndReload(): void {
  const ok = window.confirm(
    'Force update?\n\nThis clears the offline cache and reloads so new photos / app updates are downloaded.\n\nContinue?'
  );
  if (ok) {
    void clearPwaCacheAndReload();
  }
}
