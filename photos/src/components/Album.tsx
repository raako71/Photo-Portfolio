import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

function Album() {
  const { albumName } = useParams<{ albumName: string }>();
  const [images, setImages] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (albumName) {
      fetchAlbumImages(albumName);
    }
  }, [albumName]);

  const fetchAlbumImages = async (name: string) => {
    try {
      // Fetch the albums manifest
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

  if (loading) {
    return <div className="loading">Loading album...</div>;
  }

  if (images.length === 0) {
    return <div className="error">No images found in this album</div>;
  }

  return (
    <div className="album-container">
      <div className="header">
        <h2>{albumName}</h2>
      </div>
      
      <div className="image-viewer">
        <img
          src={`/images/${albumName}/${images[selectedIndex]}`}
          alt={images[selectedIndex]}
          className="main-image"
        />
      </div>

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

      <button 
        className="back-link-bottom"
        onClick={() => {
          window.location.href = `/#${albumName}`;
        }}
      >
        ← Back to Portfolio
      </button>
    </div>
  );
}

export default Album;