/** True when running as an installed PWA (home-screen / standalone), not a normal browser tab. */
export function isInstalledPwa(): boolean {
  if (typeof window === 'undefined') return false;

  // Most browsers
  if (window.matchMedia('(display-mode: standalone)').matches) return true;
  if (window.matchMedia('(display-mode: fullscreen)').matches) return true;
  if (window.matchMedia('(display-mode: minimal-ui)').matches) return true;

  // iOS Safari
  const nav = navigator as Navigator & { standalone?: boolean };
  if (nav.standalone === true) return true;

  return false;
}

export const PWA_PREFETCH_SESSION_KEY = 'pwa-prefetch-done';
