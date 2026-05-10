import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { api } from '../api.js';
import { useAuth } from './AuthContext.jsx';

const PlayerCtx = createContext(null);
export const usePlayer = () => useContext(PlayerCtx);

export function PlayerProvider({ children }) {
  const audioRef = useRef(null);
  if (!audioRef.current) audioRef.current = new Audio();
  const audio = audioRef.current;

  const [queue, setQueue]         = useState([]);
  const [originalQueue, setOQ]    = useState([]); // sin shuffle
  const [index, setIndex]         = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress]   = useState(0); // 0..1
  const [duration, setDuration]   = useState(0);
  const [elapsed, setElapsed]     = useState(0);
  const [shuffle, setShuffle]     = useState(false);
  const [loop, setLoop]           = useState(localStorage.getItem('rt_loop') !== 'false');
  const [autoplay, setAutoplay]   = useState(localStorage.getItem('rt_autoplay') !== 'false');
  const [fullOpen, setFullOpen]   = useState(false);
  const [volume, setVolume]       = useState(() => {
    const v = parseFloat(localStorage.getItem('rt_volume'));
    return isNaN(v) ? 1 : Math.max(0, Math.min(1, v));
  });
  const [muted, setMuted]         = useState(localStorage.getItem('rt_muted') === 'true');
  const { isAuth } = useAuth();

  // Aplicar volumen y mute al elemento audio + persistir
  useEffect(() => {
    audio.volume = volume;
    localStorage.setItem('rt_volume', String(volume));
  }, [volume]);
  useEffect(() => {
    audio.muted = muted;
    localStorage.setItem('rt_muted', String(muted));
  }, [muted]);

  const toggleMute = useCallback(() => setMuted(m => !m), []);

  const current = queue[index] || null;

  // ── Cargar y reproducir cuando cambia la cancion ──
  useEffect(() => {
    if (!current) return;
    audio.src = current.audioUrl;
    if (autoplay || isPlaying) {
      audio.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }
    document.title = `${current.title} — Radio Temporal`;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current?._id]);

  // ── Listeners del audio ──
  useEffect(() => {
    const onTime = () => {
      setElapsed(audio.currentTime);
      setDuration(audio.duration || 0);
      if (audio.duration) setProgress(audio.currentTime / audio.duration);
    };
    const onEnd  = () => next();
    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('loadedmetadata', onTime);
    audio.addEventListener('ended', onEnd);
    return () => {
      audio.removeEventListener('timeupdate', onTime);
      audio.removeEventListener('loadedmetadata', onTime);
      audio.removeEventListener('ended', onEnd);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queue, index, loop, shuffle]);

  // Persistir prefs
  useEffect(() => { localStorage.setItem('rt_loop', loop); }, [loop]);
  useEffect(() => { localStorage.setItem('rt_autoplay', autoplay); }, [autoplay]);

  const playList = useCallback((songs, startIndex = 0) => {
    if (!songs?.length) return;
    setOQ(songs);
    if (shuffle) {
      const rest = songs.filter((_, i) => i !== startIndex);
      const shuffled = [songs[startIndex], ...rest.sort(() => Math.random() - 0.5)];
      setQueue(shuffled);
      setIndex(0);
    } else {
      setQueue(songs);
      setIndex(startIndex);
    }
    setIsPlaying(true);
  }, [shuffle]);

  const togglePlay = useCallback(() => {
    if (!current) return;
    if (audio.paused) {
      audio.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  }, [current]);

  const next = useCallback(() => {
    if (!queue.length) return;
    if (index < queue.length - 1) setIndex(i => i + 1);
    else if (loop) setIndex(0);
    else { audio.pause(); setIsPlaying(false); }
  }, [queue, index, loop]);

  const prev = useCallback(() => {
    if (audio.currentTime > 2) {
      audio.currentTime = 0;
    } else {
      setIndex(i => (i > 0 ? i - 1 : queue.length - 1));
    }
  }, [queue]);

  const seek = useCallback((pct) => {
    if (audio.duration) audio.currentTime = pct * audio.duration;
  }, []);

  const toggleShuffle = useCallback(() => {
    setShuffle(s => {
      const ns = !s;
      if (ns && queue.length > 1) {
        const cur = queue[index];
        const rest = queue.filter((_, i) => i !== index);
        const shuffled = [cur, ...rest.sort(() => Math.random() - 0.5)];
        setQueue(shuffled);
        setIndex(0);
      } else if (!ns && originalQueue.length) {
        const cur = queue[index];
        const newIdx = originalQueue.findIndex(x => x._id === cur?._id);
        setQueue(originalQueue);
        setIndex(newIdx === -1 ? 0 : newIdx);
      }
      return ns;
    });
  }, [queue, index, originalQueue]);

  const toggleLike = useCallback(async () => {
    if (!current || !isAuth) return null;
    const data = await api.likeSong(current._id);
    setQueue(q => q.map((s, i) =>
      i === index ? { ...s, likedByMe: data.likedByMe, likesCount: data.likes } : s
    ));
    return data;
  }, [current, index, isAuth]);

  const value = {
    queue, current, index, isPlaying,
    progress, duration, elapsed,
    shuffle, loop, autoplay,
    volume, muted, setVolume, toggleMute,
    fullOpen, setFullOpen,
    playList, togglePlay, next, prev, seek,
    toggleShuffle, toggleLike,
    setLoop, setAutoplay
  };

  return <PlayerCtx.Provider value={value}>{children}</PlayerCtx.Provider>;
}
