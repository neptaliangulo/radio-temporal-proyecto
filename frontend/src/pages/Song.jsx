import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { usePlayer } from '../context/PlayerContext.jsx';
import { Icon } from '../components/icons.jsx';
import { COUNTRY_NAMES } from '../countries.js';
import SongMenu from '../components/SongMenu.jsx';
import EditSongModal from '../components/EditSongModal.jsx';

export default function Song() {
  const { id }  = useParams();
  const navigate = useNavigate();
  const toast    = useToast();
  const { isAuth } = useAuth();
  const { playList, setFullOpen, current, isPlaying } = usePlayer();

  const [song, setSong]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEdit]   = useState(false);

  const load = () => {
    setLoading(true);
    api.getSong(id)
      .then(setSong)
      .catch(e => toast(e.message))
      .finally(() => setLoading(false));
  };
  useEffect(load, [id]);

  if (loading) return <div className="spinner" />;
  if (!song)
    return <div className="empty"><Icon.Music /><p>Cancion no encontrada</p></div>;

  const cover = song.coverUrl
    || `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(song.title)}`;
  const country = COUNTRY_NAMES[song.country] || song.country;
  const isPlayingThis = current?._id === song._id && isPlaying;

  const play  = () => { playList([song], 0); setFullOpen(true); };
  const share = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: song.title, text: `${song.title} — ${song.artist}`, url })
        .catch(() => {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => toast('Enlace copiado'));
    } else {
      toast(url);
    }
  };

  const like = async () => {
    if (!isAuth) { toast('Inicia sesion para dar like'); return; }
    try {
      const r = await api.likeSong(song._id);
      setSong(s => ({ ...s, likedByMe: r.likedByMe, likesCount: r.likes }));
    } catch (e) { toast(e.message); }
  };

  return (
    <main className="page">
      <button className="back-btn" onClick={() => navigate(-1)} style={{ paddingLeft: 0 }}>
        <Icon.Left /> Volver
      </button>

      <div style={{ textAlign: 'center', padding: '24px 0' }}>
        <img
          src={cover}
          alt={song.title}
          style={{
            width: 'min(280px, 70vw)',
            height: 'min(280px, 70vw)',
            borderRadius: 12,
            objectFit: 'cover',
            boxShadow: '0 24px 64px rgba(0,0,0,.6)'
          }}
        />
      </div>

      <h1 style={{ textAlign: 'center', fontSize: 28, fontWeight: 800, marginBottom: 6 }}>
        {song.title}
      </h1>
      <p style={{ textAlign: 'center', color: 'var(--text2)', fontSize: 16, marginBottom: 4 }}>
        {song.artist}
      </p>
      <p style={{ textAlign: 'center', color: 'var(--accent)', fontSize: 14, marginBottom: 8 }}>
        {song.year} · {country}
      </p>
      {song.uploadedBy?._id && (
        <p style={{ textAlign: 'center', color: 'var(--text2)', fontSize: 13, marginBottom: 24 }}>
          Subida por <Link to={`/u/${song.uploadedBy._id}`} style={{ textDecoration: 'underline' }}>
            @{song.uploadedBy.username}
          </Link>
        </p>
      )}

      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 16 }}>
        <button className="btn-primary" onClick={play}
                style={{ width: 'auto', padding: '12px 32px', margin: 0,
                         display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          {isPlayingThis ? <><Icon.Pause /> Reproduciendo</> : <><Icon.Play /> Reproducir</>}
        </button>
        <button className="btn-primary" onClick={share}
                style={{ width: 'auto', padding: '12px 24px', margin: 0,
                         background: 'var(--bg4)', color: 'var(--text)',
                         display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <Icon.Send /> Compartir
        </button>
        <button className={`btn-like ${song.likedByMe ? 'liked' : ''}`} onClick={like}
                style={{ background: 'var(--bg4)', borderRadius: 999, padding: '12px 20px' }}>
          <Icon.Heart /> {song.likesCount ?? 0}
        </button>
        <SongMenu song={song} onEdit={() => setEdit(true)} />
      </div>

      {editOpen && (
        <EditSongModal
          song={song}
          onClose={() => setEdit(false)}
          onSaved={(updated) => setSong(updated)}
        />
      )}
    </main>
  );
}
