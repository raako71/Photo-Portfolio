import { useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { confirmClearPwaCacheAndReload } from '../utils/pwa';

interface BreadcrumbHeaderProps {
  albumName?: string;
  isFullscreen?: boolean;
}

/**
 * Hidden force-reload: long-press (≈2.5 s) or rapid 5-tap the "Home" label.
 * Short taps always navigate home (works in installed PWA / tablet).
 */
function BreadcrumbHeader({ albumName, isFullscreen = false }: BreadcrumbHeaderProps) {
  const navigate = useNavigate();
  const displayAlbumName = albumName?.replace(/^1/, '');

  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressTriggered = useRef(false);
  const clickCount = useRef(0);
  const clickResetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearPressTimer = () => {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
  };

  const onPointerDown = () => {
    longPressTriggered.current = false;
    clearPressTimer();
    pressTimer.current = setTimeout(() => {
      longPressTriggered.current = true;
      pressTimer.current = null;
      confirmClearPwaCacheAndReload();
    }, 2500);
  };

  const onPointerEnd = () => {
    clearPressTimer();
  };

  const onHomeClick = (e: React.MouseEvent) => {
    // Always handle navigation ourselves so touch + long-press cannot block it
    e.preventDefault();

    // Long-press already fired the force-reload dialog — do not navigate
    if (longPressTriggered.current) {
      longPressTriggered.current = false;
      return;
    }

    // Rapid 5-tap fallback for force-reload
    clickCount.current += 1;
    if (clickResetTimer.current) clearTimeout(clickResetTimer.current);
    clickResetTimer.current = setTimeout(() => {
      clickCount.current = 0;
    }, 800);

    if (clickCount.current >= 5) {
      clickCount.current = 0;
      confirmClearPwaCacheAndReload();
      return;
    }

    navigate('/');
  };

  return (
    <header className={`breadcrumb-header ${isFullscreen ? 'fullscreen-header' : ''}`}>
      <nav aria-label="Breadcrumb">
        <a
          href="/"
          onClick={onHomeClick}
          onPointerDown={onPointerDown}
          onPointerUp={onPointerEnd}
          onPointerLeave={onPointerEnd}
          onPointerCancel={onPointerEnd}
          title="Long-press or 5× tap for force update"
        >
          Home
        </a>
        {albumName && (
          <>
            <span aria-hidden="true">></span>
            <Link to={`/${albumName}`}>{displayAlbumName}</Link>
          </>
        )}
        {isFullscreen && (
          <>
            <span aria-hidden="true">></span>
            <span aria-current="page">Fullscreen</span>
          </>
        )}
      </nav>
    </header>
  );
}

export default BreadcrumbHeader;
