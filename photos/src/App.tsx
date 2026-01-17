import { HashRouter, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import Album from './components/Album';
import './App.css';

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/:albumName" element={<Album />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
