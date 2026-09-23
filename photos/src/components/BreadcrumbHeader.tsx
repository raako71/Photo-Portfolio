import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { confirmClearPwaCacheAndReload } from '../utils/pwa';
import { prefetchAlbumImages, prefetchAllImages } from '../utils/prefetch';

interface BreadcrumbHeaderProps {
  albumName?: string;
  isFullscreen?: boolean;
}

/**
 * Home is a normal React Router link.
 * "Load all" prefetches images into the PWA cache for offline use.
 * Hidden force-reload: long-press the header bar background (~2.5s).
 */
function BreadcrumbHeader({ albumName, isFullscreen = false }: BreadcrumbHeaderProps) {
  const displayAlbumName = albumName?.replace(/^1/, '');
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [loadingAll, setLoadingAll] = useState(false);
  const [progressLabel, setProgressLabel] = useState('');

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

  const handleLoadAll = async () => {
    if (loadingAll) return;

    setLoadingAll(true);
    setProgressLabel('Starting…');

    try {
      const onProgress = ({ done, total }: { done: number; total: number }) => {
        setProgressLabel(total === 0 ? 'Nothing to load' : `${done}/${total}`);
      };

      if (albumName) {
        await prefetchAlbumImages(albumName, onProgress);
      } else {
        await prefetchAllImages(onProgress);
      }

      setProgressLabel('Done');
      setTimeout(() => setProgressLabel(''), 2000);
    } catch (err) {
      console.error('Load all failed:', err);
      setProgressLabel('Failed');
      setTimeout(() => setProgressLabel(''), 3000);
    } finally {
      setLoadingAll(false);
    }
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
        <Link to="/">Home</Link>
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

        {!isFullscreen && (
          <>
            <span className="breadcrumb-sep" aria-hidden="true">
              ·
            </span>
            <button
              type="button"
              className="load-all-btn"
              onClick={handleLoadAll}
              disabled={loadingAll}
              title={albumName ? 'Download this album for offline use' : 'Download all photos for offline use'}
            >
              {loadingAll ? `Loading ${progressLabel}` : 'Load all'}
            </button>
          </>
        )}
      </nav>
    </header>
  );
}

export default BreadcrumbHeader;
