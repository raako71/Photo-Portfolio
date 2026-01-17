import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function Album() {
  const { albumName } = useParams<{ albumName: string }>();
  const [images, setImages] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (albumName) {
      fetchAlbumImages(albumName);
    }
  }, [albumName]);

  const fetchAlbumImages = async (name: string) => {
    try {
      // Use import.meta.glob to get all images from the album
      const imageModules = import.meta.glob('/public/images/*/*', {
        eager: false
      });
      
      const albumImages: string[] = [];
      
      for (const path of Object.keys(imageModules)) {
        const match = path.match(/\/public\/images\/([^/]+)\/(.+)$/);
        if (match && match[1] === name && !path.includes('/thumbs/')) {
          albumImages.push(match[2]);
        }
      }
      
      albumImages.sort();
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
        <button 
          className="back-link"
          onClick={() => {
            window.location.href = `/#${albumName}`;
          }}
        >
          ← Back to Portfolio
        </button>
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
    </div>
  );
}

export default Album;