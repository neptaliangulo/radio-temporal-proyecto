import { useEffect } from 'react';
import { usePlayer } from '../context/PlayerContext.jsx';
import { Icon } from './icons.jsx';

export default function MiniPlayer() {
  const { current, isPlaying, togglePlay, setFullOpen } = usePlayer();

  // Avisar al body de que hay reproductor activo (para CSS responsivo del home)
  useEffect(() => {
    if (current) document.body.classList.add('has-player');
    else document.body.classList.remove('has-player');
    return () => document.body.classList.remove('has-player');
  }, [current]);

  if (!current) return null;

  const cover = current.coverUrl
    || `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(current.title)}`;

  return (
    <div className="mini-player" onClick={(e) => {
      if (!e.target.closest('button')) setFullOpen(true);
    }}>
      <img className="mini-cover" src={cover} alt="" />
      <div className="mini-info">
        <div className="mini-title">{current.title}</div>
        <div className="mini-artist">
          {current.artist}{current.year ? ` · ${current.year}` : ''}
        </div>
      </div>
      <button className="btn-play-mini" onClick={(e) => { e.stopPropagation(); togglePlay(); }}>
        {isPlaying ? <Icon.Pause /> : <Icon.Play />}
      </button>
    </div>
  );
}
