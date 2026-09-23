import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import Album from './components/Album';
import { usePwaOfflinePrefetch } from './hooks/usePwaOfflinePrefetch';

function App() {
  // Installed PWA only: background-cache every photo for offline use
  usePwaOfflinePrefetch();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/:albumName" element={<Album />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
