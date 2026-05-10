import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { useT } from '../i18n.js';
import { Icon } from '../components/icons.jsx';
import SongList from '../components/SongList.jsx';

export default function Search() {
  const t = useT();
  const [q, setQ]           = useState('');
  const [songs, setSongs]   = useState([]);
  const [users, setUsers]   = useState([]);
  const [loading, setL]     = useState(false);

  useEffect(() => {
    if (q.trim().length < 2) { setSongs([]); setUsers([]); return; }
    const handle = setTimeout(async () => {
      setL(true);
      try {
        const [s, u] = await Promise.all([
          api.getSongs({ q: q.trim(), limit: 30 }),
          api.searchUsers(q.trim())
        ]);
        setSongs(s); setUsers(u);
      } catch { /* ignore */ }
      finally { setL(false); }
    }, 300);
    return () => clearTimeout(handle);
  }, [q]);

  return (
    <main className="page">
      <div className="page-header">
        <div className="page-title">{t('search.title')}</div>
      </div>

      <div className="search-wrap" style={{ maxWidth: 'none', marginBottom: 16 }}>
        <Icon.Search />
        <input
          type="text"
          placeholder={t('search.placeholder')}
          value={q}
          onChange={e => setQ(e.target.value)}
          autoFocus
        />
      </div>

      {loading && <div className="spinner" />}

      {!loading && q.trim().length >= 2 && songs.length === 0 && users.length === 0 && (
        <div className="empty"><Icon.Search /><p>{t('search.no_results')}</p></div>
      )}

      {!loading && q.trim().length < 2 && (
        <div className="empty"><Icon.Search /><p>{t('search.empty')}</p></div>
      )}

      {users.length > 0 && (
        <>
          <div className="section-title" style={{ marginTop: 12 }}>{t('search.users')}</div>
          <div className="song-list">
            {users.map(u => (
              <Link key={u._id} to={`/u/${u._id}`} className="song-card">
                <img
                  src={u.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${u.username}&backgroundColor=1DB954`}
                  alt=""
                  style={{ borderRadius: '50%' }}
                />
                <div className="song-info">
                  <div className="song-title">{u.username}</div>
                  {u.bio && <div className="song-sub">{u.bio}</div>}
                </div>
              </Link>
            ))}
          </div>
        </>
      )}

      {songs.length > 0 && (
        <>
          <div className="section-title" style={{ marginTop: 16 }}>{t('search.songs')}</div>
          <SongList songs={songs} />
        </>
      )}
    </main>
  );
}
