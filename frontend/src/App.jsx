import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import MiniPlayer from './components/MiniPlayer.jsx';
import FullPlayer from './components/FullPlayer.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Upload from './pages/Upload.jsx';
import Profile from './pages/Profile.jsx';
import PublicProfile from './pages/PublicProfile.jsx';
import Settings from './pages/Settings.jsx';
import Search from './pages/Search.jsx';
import LikedSongs from './pages/LikedSongs.jsx';
import Feed from './pages/Feed.jsx';
import SongPage from './pages/Song.jsx';
import NotFound from './pages/NotFound.jsx';

export default function App() {
  const location = useLocation();
  const hideChromeOn = ['/login', '/register'];
  const hideChrome   = hideChromeOn.includes(location.pathname);

  return (
    <>
      <Routes>
        <Route path="/"          element={<Home />} />
        <Route path="/login"     element={<Login />} />
        <Route path="/register"  element={<Register />} />
        <Route path="/upload"    element={<ProtectedRoute><Upload /></ProtectedRoute>} />
        <Route path="/profile"   element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/u/:id"     element={<PublicProfile />} />
        <Route path="/settings"  element={<Settings />} />
        <Route path="/search"    element={<Search />} />
        <Route path="/liked"     element={<ProtectedRoute><LikedSongs /></ProtectedRoute>} />
        <Route path="/feed"      element={<ProtectedRoute><Feed /></ProtectedRoute>} />
        <Route path="/song/:id"  element={<SongPage />} />
        <Route path="*"          element={<NotFound />} />
      </Routes>

      {!hideChrome && (
        <>
          <MiniPlayer />
          <FullPlayer />
          <Navbar />
        </>
      )}
    </>
  );
}
