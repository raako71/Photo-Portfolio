import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { confirmClearPwaCacheAndReload } from '../utils/pwa';

interface BreadcrumbHeaderProps {
  albumName?: string;
  isFullscreen?: boolean;
}

/**
 * Hidden force-reload: long-press (≈2.5 s) or rapid 5-click the "Home" label.
 * Works on tablet (touch) and desktop (mouse).
 */
function BreadcrumbHeader({ albumName, isFullscreen = false }: BreadcrumbHeaderProps) {
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clickCount = useRef(0);
  const clickResetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearPressTimer = () => {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
  };

  const startPress = (e: React.MouseEvent | React.TouchEvent) => {
    // Don't block normal navigation on short taps
    clearPressTimer();
    pressTimer.current = setTimeout(() => {
      pressTimer.current = null;
      confirmClearPwaCacheAndReload();
    }, 2500);
  };

  const endPress = () => {
    clearPressTimer();
  };

  const handleHomeClick = (e: React.MouseEvent) => {
    // Rapid 5-click fallback (useful if long-press is awkward)
    clickCount.current += 1;
    if (clickResetTimer.current) clearTimeout(clickResetTimer.current);
    clickResetTimer.current = setTimeout(() => {
      clickCount.current = 0;
    }, 800);

    if (clickCount.current >= 5) {
      e.preventDefault();
      clickCount.current = 0;
      confirmClearPwaCacheAndReload();
    }
    // Normal single click still navigates via <Link>
  };

  return (
    <header className={`breadcrumb-header ${isFullscreen ? 'fullscreen-header' : ''}`}>
      <nav aria-label="Breadcrumb">
        <Link
          to="/"
          onClick={handleHomeClick}
          onMouseDown={startPress}
          onMouseUp={endPress}
          onMouseLeave={endPress}
          onTouchStart={startPress}
          onTouchEnd={endPress}
          onTouchCancel={endPress}
          title="Long-press or 5× click for force update"
        >
          Home
        </Link>
        {albumName && (
          <>
            <span aria-hidden="true">&gt;</span>
            <Link to={`/${albumName}`}>{albumName}</Link>
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
