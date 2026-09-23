import { Link } from 'react-router-dom';

interface BreadcrumbHeaderProps {
  albumName?: string;
  isFullscreen?: boolean;
}

function BreadcrumbHeader({ albumName, isFullscreen = false }: BreadcrumbHeaderProps) {
  const displayAlbumName = albumName?.replace(/^1/, '');

  return (
    <header className={`breadcrumb-header ${isFullscreen ? 'fullscreen-header' : ''}`}>
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