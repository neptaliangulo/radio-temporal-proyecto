import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { useT } from '../i18n.js';
import { Icon } from '../components/icons.jsx';
import { COUNTRY_NAMES } from '../countries.js';
import { usePlayer } from '../context/PlayerContext.jsx';

export default function PublicProfile() {
  const t = useT();
  const { id }      = useParams();
  const navigate    = useNavigate();
  const { isAuth, user } = useAuth();
  const { playList, setFullOpen } = usePlayer();
  const toast = useToast();

  const [data, setData]       = useState(null);
  const [loading, setL]       = useState(true);
  const [following, setF]     = useState(false);
  const [followBusy, setFB]   = useState(false);

  // Si es mi perfil, redirigir
  useEffect(() => {
    if (user && id === user.id) navigate('/profile', { replace: true });
  }, [id, user, navigate]);

  useEffect(() => {
    setL(true);
    api.getUser(id)
      .then(d => { setData(d); setF(d.isFollowing); })
      .catch(e => toast(e.message))
      .finally(() => setL(false));
  }, [id]);

  const toggleFollow = async () => {
    if (!isAuth) { navigate('/login'); return; }
    setFB(true);
    try {
      const r = await api.followUser(id);
      setF(r.following);
      setData(d => ({ ...d, followersCount: r.followersCount }));
      toast(r.following ? 'Ahora sigues a este usuario' : 'Has dejado de seguir');
    } catch (e) { toast(e.message); }
    finally { setFB(false); }
  };

  if (loading) return <div className="spinner" />;
  if (!data)   return null;

  const u = data.user;
  const avatar = u.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${u.username}&backgroundColor=1DB954`;

  return (
    <>
      <button className="back-btn" onClick={() => navigate(-1)}>
        <Icon.Left /> Volver
      </button>

      <div className="profile-top">
        <div className="profile-avatar-wrap">
          <img className="profile-avatar" src={avatar} alt="" />
        </div>
        <div className="profile-name">{u.username}</div>
        {u.bio && <div className="profile-bio">{u.bio}</div>}

        {(!user || user.id !== id) && (
          <button
            className={`follow-btn ${following ? 'following' : ''}`}
            onClick={toggleFollow}
            disabled={followBusy}
          >
            {following ? t('profile.following') : t('profile.follow')}
          </button>
        )}

        <div className="profile-stats" style={{ marginTop: 16 }}>
          <div className="stat">
            <div className="stat-num">{data.songsCount}</div>
            <div className="stat-label">{t('profile.songs')}</div>
          </div>
          <div className="stat">
            <div className="stat-num">{data.followersCount}</div>
            <div className="stat-label">{t('profile.followers')}</div>
          </div>
          <div className="stat">
            <div className="stat-num">{data.totalLikes}</div>
            <div className="stat-label">{t('profile.likes')}</div>
          </div>
        </div>
      </div>

      <div className="profile-content">
        <div className="section-title">{t('profile.published')}</div>
        {data.songs.length === 0 ? (
          <div className="empty"><Icon.Music /><p>{t('profile.empty_other')}</p></div>
        ) : (
          <div className="song-list">
            {data.songs.map((s, i) => {
              const cover = s.coverUrl || `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(s.title)}`;
              return (
                <div key={s._id} className="song-card" onClick={() => { playList(data.songs, i); setFullOpen(true); }}>
                  <img src={cover} alt="" />
                  <div className="song-info">
                    <div className="song-title">{s.title}</div>
                    <div className="song-sub">{s.artist} · {s.year}</div>
                    <div className="song-sub">{COUNTRY_NAMES[s.country] || s.country}</div>
                  </div>
                  <div className={`song-likes ${s.likedByMe ? 'liked' : ''}`}>
                    <Icon.Heart />{s.likesCount ?? 0}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
