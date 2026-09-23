import { useEffect } from 'react';
import { isInstalledPwa, PWA_PREFETCH_SESSION_KEY } from '../utils/isPwa';
import { prefetchAllImages } from '../utils/prefetch';

export type PwaPrefetchDetail =
  | { status: 'start' }
  | { status: 'progress'; done: number; total: number }
  | { status: 'done' }
  | { status: 'error'; message: string };

export const PWA_PREFETCH_EVENT = 'pwa-prefetch';

function emit(detail: PwaPrefetchDetail) {
  window.dispatchEvent(new CustomEvent(PWA_PREFETCH_EVENT, { detail }));
}

/**
 * When the app is opened as an installed PWA, automatically download all
 * photos into the service-worker cache for offline use. Runs once per session
 * (until force-reload clears the session flag).
 */
export function usePwaOfflinePrefetch() {
  useEffect(() => {
    if (!isInstalledPwa()) return;

    try {
      if (sessionStorage.getItem(PWA_PREFETCH_SESSION_KEY) === '1') return;
    } catch {
      /* private mode etc. — still try to prefetch */
    }

    let cancelled = false;

    const run = async () => {
      emit({ status: 'start' });
      try {
        await prefetchAllImages((progress) => {
          if (!cancelled) {
            emit({ status: 'progress', done: progress.done, total: progress.total });
          }
        });
        if (cancelled) return;
        try {
          sessionStorage.setItem(PWA_PREFETCH_SESSION_KEY, '1');
        } catch {
          /* ignore */
        }
        emit({ status: 'done' });
      } catch (err) {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : 'Prefetch failed';
        console.error(message);
        emit({ status: 'error', message });
      }
    };

    // Let the first paint / album covers start first
    const timer = window.setTimeout(() => {
      void run();
    }, 1500);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, []);
}
