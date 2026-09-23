import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import BreadcrumbHeader from './BreadcrumbHeader';

const SWIPE_CLOSE_THRESHOLD = 80; // px vertical swipe to close fullscreen

function Album() {
  const { albumName } = useParams<{ albumName: string }>();
  const [images, setImages] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);

  const touchStartY = useRef<number | null>(null);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    if (albumName) {
      fetchAlbumImages(albumName);
    }
  }, [albumName]);

  const fetchAlbumImages = async (name: string) => {
    try {
      const response = await fetch('/albums-manifest.json');
      const manifest = await response.json();

      const albumImages = manifest[name] || [];
      setImages(albumImages);
      setLoading(false);
    } catch (error) {
      console.error('Error loading album:', error);
      setLoading(false);
    }
  };

  const closeOverlay = () => setIsOverlayOpen(false);

  const onOverlayTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    touchStartY.current = e.touches[0].clientY;
    touchStartX.current = e.touches[0].clientX;
  };

  const onOverlayTouchEnd = (e: React.TouchEvent) => {
    if (touchStartY.current == null || touchStartX.current == null) return;
    if (e.changedTouches.length !== 1) {
      touchStartY.current = null;
      touchStartX.current = null;
      return;
    }

    const endY = e.changedTouches[0].clientY;
    const endX = e.changedTouches[0].clientX;
    const deltaY = endY - touchStartY.current;
    const deltaX = endX - touchStartX.current;

    touchStartY.current = null;
    touchStartX.current = null;

    // Prefer vertical swipe: close when mostly vertical and past threshold
    if (Math.abs(deltaY) >= SWIPE_CLOSE_THRESHOLD && Math.abs(deltaY) > Math.abs(deltaX)) {
      closeOverlay();
    }
  };

  if (loading) {
    return <div className="loading">Loading album...</div>;
  }

  if (images.length === 0) {
    return <div className="error">No images found in this album</div>;
  }

  return (
    <div className="album-container">
      <BreadcrumbHeader albumName={albumName} />

      <div className="image-viewer">
        <img
          src={`/images/${albumName}/web/${images[selectedIndex]}`}
          alt={images[selectedIndex]}
          className="main-image"
          onClick={() => setIsOverlayOpen(true)}
          style={{ cursor: 'pointer' }}
        />
      </div>

      {isOverlayOpen && (
        <div
          className="image-overlay"
          onClick={closeOverlay}
          onTouchStart={onOverlayTouchStart}
          onTouchEnd={onOverlayTouchEnd}
        >
          <BreadcrumbHeader albumName={albumName} isFullscreen />
          <img
            src={`/images/${albumName}/web/${images[selectedIndex]}`}
            alt={images[selectedIndex]}
            className="overlay-image"
            onClick={(e) => e.stopPropagation()}
            draggable={false}
          />
        </div>
      )}

      <div className="scroll-indicator">▼</div>

      <div className="thumbnails">
        {images.map((imgName, index) => (
          <img
            key={index}
            src={`/images/${albumName}/thumbs/${imgName}`}
            alt={imgName}
            className={`thumbnail ${index === selectedIndex ? 'active' : ''}`}
            onClick={() => setSelectedIndex(index)}
            title={imgName}
          />
        ))}
      </div>
    </div>
  );
}

export default Album;
