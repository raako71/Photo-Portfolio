import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import './Album.css';

function Album() {
  const { albumName } = useParams<{ albumName: string }>();
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (albumName) {
      fetchAlbumImages(albumName);
    }
  }, [albumName]);

  const fetchAlbumImages = async (name: string) => {
    try {
      const response = await fetch(`/images/${name}/`);
      const html = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const links = doc.querySelectorAll('a');
      const imageList: string[] = [];

      for (const link of links) {
        let imgName = link.textContent?.trim() || '';
        // Extract file name by matching the extension and stopping before timestamp
        const match = imgName.match(/^(.+\.(jpg|jpeg|png|gif))/i);
        if (match) {
          imgName = match[1];
        } else {
          // Fallback: remove from first digit
          imgName = imgName.replace(/\d.*$/, '').trim();
        }
        if (imgName !== '..' && imgName !== '.' && imgName.match(/\.(jpg|jpeg|png|gif)$/i)) {
          imageList.push(imgName);
        }
      }

      // Sort alphabetically
      imageList.sort();
      setImages(imageList);
      setLoading(false);
    } catch (error) {
      console.error('Error loading album:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading album...</div>;
  }

  return (
    <div className="album-container">
      <Link to="/" className="back-link">← Back to Portfolio</Link>
      <h2>{albumName}</h2>
      <div className="thumbnails">
        {images.map((imgName, index) => (
          <img
            key={index}
            src={`/images/${albumName}/${imgName}`}
            alt={imgName}
            className="thumbnail"
            onClick={() => alert(`Clicked: ${imgName}`)}
          />
        ))}
      </div>
    </div>
  );
}

export default Album;