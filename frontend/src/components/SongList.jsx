import { Icon } from './icons.jsx';
import { usePlayer } from '../context/PlayerContext.jsx';
import SongMenu from './SongMenu.jsx';

export default function SongList({
  songs,
  onCardClick,
  showDelete = false,
  onDelete,
  onEdit,
  emptyMsg = 'Sin canciones'
}) {
  const { playList, setFullOpen, current } = usePlayer();

  if (!songs?.length) {
    return (
      <div className="empty">
        <Icon.Music />
        <p>{emptyMsg}</p>
      </div>
    );
  }

  const handleClick = (i) => {
    if (onCardClick) return onCardClick(songs, i);
    playList(songs, i);
    setFullOpen(true);
  };

  return (
    <div className="song-list">
      {songs.map((s, i) => {
        const cover = s.coverUrl
          || `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(s.title)}`;
        const isPlayingThis = current?._id === s._id;
        return (
          <div
            key={s._id || i}
            className={`song-card ${isPlayingThis ? 'playing' : ''}`}
            onClick={() => handleClick(i)}
          >
            <img src={cover} alt={s.title} loading="lazy" />
            <div className="song-info">
              <div className="song-title">{s.title}</div>
              <div className="song-sub">{s.artist} · {s.year}</div>
            </div>
            <div className="song-card-actions">
              <div className={`song-likes ${s.likedByMe ? 'liked' : ''}`}>
                <Icon.Heart />
                {s.likesCount ?? 0}
              </div>
              {isPlayingThis && (
                <div className="now-playing-icon" title="Reproduciendo">
                  <Icon.Music />
                </div>
              )}
              {showDelete && (
                <button
                  className="btn-delete-song"
                  onClick={(e) => { e.stopPropagation(); onDelete?.(s); }}
                  title="Eliminar"
                >
                  <Icon.Trash />
                </button>
              )}
              <SongMenu song={s} onEdit={onEdit} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
