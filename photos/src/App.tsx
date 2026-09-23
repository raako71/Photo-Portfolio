import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import Album from './components/Album';
import PullToUpdateIndicator from './components/PullToUpdateIndicator';
import { usePwaOfflinePrefetch } from './hooks/usePwaOfflinePrefetch';
import { usePullToForceUpdate } from './hooks/usePullToForceUpdate';

function App() {
  // Installed PWA only: background-cache every photo for offline use
  usePwaOfflinePrefetch();

  // Pull down from top of window → force cache clear + reload
  const { pullDistance, armed } = usePullToForceUpdate();

  return (
    <BrowserRouter>
      <PullToUpdateIndicator pullDistance={pullDistance} armed={armed} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/:albumName" element={<Album />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
