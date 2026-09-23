import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import BreadcrumbHeader from './BreadcrumbHeader';

interface Album {
  url: string;
  name: string;
}

const getDisplayAlbumName = (albumName: string) => albumName.replace(/^1/, '');

function Home() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showIntro, setShowIntro] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Skip intro if navigating back from an album (not initial load) or if hash is present
    if (location.key !== 'default' || window.location.hash) {
      setShowIntro(false);
    }
    fetchAlbumCovers();
  }, []);

  useEffect(() => {
    if (showIntro) {
      const timer = setTimeout(() => setShowIntro(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showIntro]);

  // Check if a specific album is requested via hash
  useEffect(() => {
    if (albums.length > 0 && window.location.hash) {
      const requestedAlbum = decodeURIComponent(window.location.hash.slice(1));
      const albumIndex = albums.findIndex(album => album.name === requestedAlbum);
      if (albumIndex !== -1) {
        setCurrentIndex(albumIndex);
      }
    }
  }, [albums]);

  const fetchAlbumCovers = async () => {
    try {
      // Fetch the albums manifest
      const response = await fetch('/albums-manifest.json');
      const manifest = await response.json();

      // Sort albums and get first image from each, using the thumbnail-sized cover for the home screen
      const albumList: Album[] = [];
      const sortedAlbumNames = Object.keys(manifest).sort((firstAlbum, secondAlbum) => {
        const firstIsFeatured = firstAlbum.startsWith('1');
        const secondIsFeatured = secondAlbum.startsWith('1');

        if (firstIsFeatured !== secondIsFeatured) {
          return firstIsFeatured ? -1 : 1;
        }

        return firstAlbum.localeCompare(secondAlbum);
      });

      for (const albumName of sortedAlbumNames) {
        const images = manifest[albumName] || [];
        if (images.length > 0) {
          albumList.push({
            url: `/images/${albumName}/home/${images[0]}`,
            name: albumName
          });
        }
      }

      // Start every cover request immediately, but only gate the initial render
      // on the first active cover.
      const coverLoads = albumList.map((album) => new Promise<void>((resolve) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = () => resolve();
        img.src = album.url;
      }));

      if (coverLoads.length > 0) {
        await coverLoads[0];
      }

      console.log('Loaded albums from manifest:', albumList);
      setAlbums(albumList);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching albums:', error);
      setLoading(false);
    }
  };

  const nextImage = () => {
    setFadeOut(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % albums.length);
      setFadeOut(false);
    }, 250);
  };

  const prevImage = () => {
    setFadeOut(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + albums.length) % albums.length);
      setFadeOut(false);
    }, 250);
  };

  const handleAlbumClick = () => {
    const albumName = albums[currentIndex].name;
    navigate(`/${albumName}`);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowRight') nextImage();
    else if (e.key === 'ArrowLeft') prevImage();
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const touchStartX = e.touches[0].clientX;
    e.currentTarget.setAttribute('data-touch-start', touchStartX.toString());
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchStartX = parseFloat(e.currentTarget.getAttribute('data-touch-start') || '0');
    const touchEndX = e.changedTouches[0].clientX;
    const deltaX = touchEndX - touchStartX;

    if (deltaX > 50) prevImage();
    else if (deltaX < -50) nextImage();
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [albums.length]);

  if (loading) {
    return <div className="loading">Loading albums...</div>;
  }

  if (albums.length === 0) {
    return <div className="error">No albums found</div>;
  }

  return (
    <>
      <BreadcrumbHeader />
      {showIntro && (
        <div className="intro-overlay">
          <h1 className="intro-text">Photo Portfolio</h1>
        </div>
      )}
      <div className={`slider-container ${showIntro ? 'hidden' : 'visible'}`} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
        <div className="carousel-viewport">
          <div
            className={`carousel-track ${fadeOut ? 'fade-out' : 'fade-in'}`}
            style={{ '--carousel-index': currentIndex } as React.CSSProperties}
          >
            {albums.map((album, albumIndex) => {
              const isActive = albumIndex === currentIndex;
              const displayName = getDisplayAlbumName(album.name);

              return (
                <button
                  key={album.name}
                  className={`carousel-card ${isActive ? 'active' : ''}`}
                  onClick={() => isActive ? handleAlbumClick() : setCurrentIndex(albumIndex)}
                  aria-label={isActive ? `Open ${displayName}` : `Show ${displayName}`}
                >
                  <img
                    src={album.url}
                    alt={displayName}
                    loading="eager"
                    decoding="async"
                  />
                  {isActive && <span>{displayName}</span>}
                </button>
              );
            })}
          </div>
        </div>
        <button className="arrow left-arrow" onClick={prevImage}>‹</button>
        <button className="arrow right-arrow" onClick={nextImage}>›</button>
      </div>
    </>
  );
}

export default Home;