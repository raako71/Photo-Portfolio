import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

interface Album {
  url: string;
  name: string;
}

function Home() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showIntro, setShowIntro] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAlbumCovers();
  }, []);

  useEffect(() => {
    if (showIntro) {
      const timer = setTimeout(() => setShowIntro(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showIntro]);

  const fetchAlbumCovers = async () => {
    try {
      // Dynamically import all images from public/images directory
      const imageModules = import.meta.glob('/public/images/*/*', {
        eager: false
      });
      
      const albumMap = new Map<string, string[]>();
      
      // Parse the paths to extract album names and images
      for (const path of Object.keys(imageModules)) {
        const match = path.match(/\/public\/images\/([^/]+)\/(.+)$/);
        if (match) {
          const [, albumName, fileName] = match;
          if (!albumMap.has(albumName)) {
            albumMap.set(albumName, []);
          }
          albumMap.get(albumName)!.push(fileName);
        }
      }
      
      // Sort albums and get first image from each
      const albumList: Album[] = [];
      const sortedAlbumNames = Array.from(albumMap.keys()).sort();
      
      for (const albumName of sortedAlbumNames) {
        const images = albumMap.get(albumName) || [];
        images.sort();
        if (images.length > 0) {
          albumList.push({
            url: `/images/${albumName}/${images[0]}`,
            name: albumName
          });
        }
      }
      
      console.log('Dynamically loaded albums:', albumList);
      setAlbums(albumList);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching albums:', error);
      setLoading(false);
    }
  };

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % albums.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + albums.length) % albums.length);
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
      {showIntro && (
        <div className="intro-overlay">
          <h1 className="intro-text">Photo Portfolio</h1>
        </div>
      )}
      <div className={`slider-container ${showIntro ? 'hidden' : 'visible'}`} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
        <img
          src={albums[currentIndex].url}
          alt={albums[currentIndex].name}
          className="slider-image"
        />
        <div className="album-name" onClick={handleAlbumClick}>
          {albums[currentIndex].name}
        </div>
        <button className="arrow left-arrow" onClick={prevImage}>‹</button>
        <button className="arrow right-arrow" onClick={nextImage}>›</button>
      </div>
    </>
  );
}

export default Home;