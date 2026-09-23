import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { confirmClearPwaCacheAndReload } from '../utils/pwa';
import { PWA_PREFETCH_EVENT, type PwaPrefetchDetail } from '../hooks/usePwaOfflinePrefetch';

interface BreadcrumbHeaderProps {
  albumName?: string;
  isFullscreen?: boolean;
}

/**
 * Home crumb shows the site host (photos.raako.net) and links to "/".
 * Offline cache status shows here while the installed PWA prefetches images.
 * Hidden force-reload: long-press the header bar background (~2.5s).
 */
function BreadcrumbHeader({ albumName, isFullscreen = false }: BreadcrumbHeaderProps) {
  const displayAlbumName = albumName?.replace(/^1/, '');
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [prefetchLabel, setPrefetchLabel] = useState('');
  const homeLabel =
    typeof window !== 'undefined' && window.location?.host
      ? window.location.host
      : 'photos.raako.net';

  useEffect(() => {
    const onPrefetch = (event: Event) => {
      const detail = (event as CustomEvent<PwaPrefetchDetail>).detail;
      if (!detail) return;

      if (detail.status === 'start') {
        setPrefetchLabel('Caching offline…');
      } else if (detail.status === 'progress') {
        setPrefetchLabel(
          detail.total === 0 ? 'Caching offline…' : `Caching ${detail.done}/${detail.total}`
        );
      } else if (detail.status === 'done') {
        setPrefetchLabel('Offline ready');
        window.setTimeout(() => setPrefetchLabel(''), 2500);
      } else if (detail.status === 'error') {
        setPrefetchLabel('Cache failed');
        window.setTimeout(() => setPrefetchLabel(''), 4000);
      }
    };

    window.addEventListener(PWA_PREFETCH_EVENT, onPrefetch);
    return () => window.removeEventListener(PWA_PREFETCH_EVENT, onPrefetch);
  }, []);

  const clearPressTimer = () => {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
  };

  const onHeaderPointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('a, button')) return;

    clearPressTimer();
    pressTimer.current = setTimeout(() => {
      pressTimer.current = null;
      confirmClearPwaCacheAndReload();
    }, 2500);
  };

  return (
    <header
      className={`breadcrumb-header ${isFullscreen ? 'fullscreen-header' : ''}`}
      onPointerDown={onHeaderPointerDown}
      onPointerUp={clearPressTimer}
      onPointerLeave={clearPressTimer}
      onPointerCancel={clearPressTimer}
    >
      <nav aria-label="Breadcrumb">
        <Link to="/" title="Home">
          Home ({homeLabel})
        </Link>
        {albumName && (
          <>
            <span aria-hidden="true">&gt;</span>
            <Link to={`/${albumName}`}>{displayAlbumName}</Link>
          </>
        )}
        {isFullscreen && (
          <>
            <span aria-hidden="true">&gt;</span>
            <span aria-current="page">Fullscreen</span>
          </>
        )}

        {!isFullscreen && prefetchLabel && (
          <>
            <span className="breadcrumb-sep" aria-hidden="true">
              ·
            </span>
            <span className="prefetch-status" aria-live="polite">
              {prefetchLabel}
            </span>
          </>
        )}
      </nav>
    </header>
  );
}

export default BreadcrumbHeader;
