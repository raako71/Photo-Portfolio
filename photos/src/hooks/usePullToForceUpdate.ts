import { useEffect, useRef, useState } from 'react';
import { confirmClearPwaCacheAndReload, isOnline } from '../utils/pwa';

const PULL_THRESHOLD = 90; // px of downward drag to arm the force-update
const MAX_PULL = 140;

/**
 * Pull-down (overscroll) gesture → confirm force cache clear + reload.
 * Only active when `enabled` is true (intended for Home only).
 * Only works when online. Works on touch (tablet) and mouse (desktop).
 * Only activates when the page is already scrolled to the top.
 */
export function usePullToForceUpdate(enabled = true) {
  const [pullDistance, setPullDistance] = useState(0);
  const [armed, setArmed] = useState(false);
  const [offline, setOffline] = useState(false);

  const startY = useRef(0);
  const tracking = useRef(false);
  const armedRef = useRef(false);
  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;

  useEffect(() => {
    // Reset visual state when disabled (e.g. navigated to album)
    if (!enabled) {
      tracking.current = false;
      armedRef.current = false;
      setPullDistance(0);
      setArmed(false);
      setOffline(false);
    }
  }, [enabled]);

  useEffect(() => {
    const atTop = () =>
      (window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0) <= 2;

    const onStart = (clientY: number) => {
      if (!enabledRef.current) return;
      if (!atTop()) return;
      startY.current = clientY;
      tracking.current = true;
      armedRef.current = false;
      setArmed(false);
      setOffline(false);
      setPullDistance(0);
    };

    const onMove = (clientY: number, e: Event) => {
      if (!enabledRef.current || !tracking.current) return;

      const delta = clientY - startY.current;
      if (delta <= 0) {
        setPullDistance(0);
        setArmed(false);
        armedRef.current = false;
        setOffline(false);
        return;
      }

      if (!atTop()) {
        tracking.current = false;
        setPullDistance(0);
        setArmed(false);
        armedRef.current = false;
        setOffline(false);
        return;
      }

      const distance = Math.min(delta * 0.55, MAX_PULL);
      setPullDistance(distance);

      const online = isOnline();
      setOffline(!online);

      const isArmed = online && distance >= PULL_THRESHOLD;
      armedRef.current = isArmed;
      setArmed(isArmed);

      if (delta > 8) {
        e.preventDefault();
      }
    };

    const onEnd = () => {
      if (!tracking.current) return;
      tracking.current = false;

      if (enabledRef.current && armedRef.current && isOnline()) {
        setPullDistance(0);
        setArmed(false);
        armedRef.current = false;
        setOffline(false);
        window.setTimeout(() => confirmClearPwaCacheAndReload(), 50);
        return;
      }

      setPullDistance(0);
      setArmed(false);
      armedRef.current = false;
      setOffline(false);
    };

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      onStart(e.touches[0].clientY);
    };
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      onMove(e.touches[0].clientY, e);
    };
    const onTouchEnd = () => onEnd();
    const onTouchCancel = () => onEnd();

    const onMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return;
      onStart(e.clientY);
    };
    const onMouseMove = (e: MouseEvent) => onMove(e.clientY, e);
    const onMouseUp = () => onEnd();

    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd);
    window.addEventListener('touchcancel', onTouchCancel);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    return () => {
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('touchcancel', onTouchCancel);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  return { pullDistance, armed, offline };
}
