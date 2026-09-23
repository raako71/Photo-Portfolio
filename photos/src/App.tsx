import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Home from './components/Home';
import Album from './components/Album';
import PullToUpdateIndicator from './components/PullToUpdateIndicator';
import { usePwaOfflinePrefetch } from './hooks/usePwaOfflinePrefetch';
import { usePullToForceUpdate } from './hooks/usePullToForceUpdate';

function AppRoutes() {
  const location = useLocation();
  const isHome = location.pathname === '/';

  // Pull-to-reload only on the Home screen (not on album / fullscreen)
  const { pullDistance, armed, offline } = usePullToForceUpdate(isHome);

  return (
    <>
      {isHome && (
        <PullToUpdateIndicator pullDistance={pullDistance} armed={armed} offline={offline} />
      )}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/:albumName" element={<Album />} />
      </Routes>
    </>
  );
}

function App() {
  // Installed PWA only: background-cache every photo for offline use
  usePwaOfflinePrefetch();

  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
