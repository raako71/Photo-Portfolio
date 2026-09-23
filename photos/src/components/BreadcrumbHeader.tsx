import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { confirmClearPwaCacheAndReload } from '../utils/pwa';

interface BreadcrumbHeaderProps {
  albumName?: string;
  isFullscreen?: boolean;
}

/**
 * Home is a normal React Router link (no gesture hijacking).
 * Hidden force-reload: long-press the header bar background (~2.5s),
 * not the Home/album links themselves.
 */
function BreadcrumbHeader({ albumName, isFullscreen = false }: BreadcrumbHeaderProps) {
  const displayAlbumName = albumName?.replace(/^1/, '');
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearPressTimer = () => {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
  };

  const onHeaderPointerDown = (e: React.PointerEvent) => {
    // Never intercept taps on actual links
    if ((e.target as HTMLElement).closest('a')) return;

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
      </nav>
    </header>
  );
}

export default BreadcrumbHeader;
