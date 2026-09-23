import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PWA_PREFETCH_EVENT, type PwaPrefetchDetail } from '../hooks/usePwaOfflinePrefetch';

interface BreadcrumbHeaderProps {
  albumName?: string;
  isFullscreen?: boolean;
}

/**
 * Site host sits above the breadcrumbs; root crumb is "Home".
 * Offline cache status shows while the installed PWA prefetches images.
 * Force-update: pull down from the top of the window (online only).
 */
function BreadcrumbHeader({ albumName, isFullscreen = false }: BreadcrumbHeaderProps) {
  const displayAlbumName = albumName?.replace(/^1/, '');
  const [prefetchLabel, setPrefetchLabel] = useState('');
  const siteHost =
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

  return (
    <header className={`breadcrumb-header ${isFullscreen ? 'fullscreen-header' : ''}`}>
      {!isFullscreen && (
        <div className="site-host" aria-hidden="true">
          {siteHost}
        </div>
      )}
      <nav aria-label="Breadcrumb">
        <Link to="/" title="Home">
          Home
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
