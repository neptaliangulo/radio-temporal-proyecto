import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { useT } from '../i18n.js';
import { Icon } from '../components/icons.jsx';
import { COUNTRY_NAMES } from '../countries.js';
import { usePlayer } from '../context/PlayerContext.jsx';
import SongList from '../components/SongList.jsx';
import SongMenu from '../components/SongMenu.jsx';
import EditSongModal from '../components/EditSongModal.jsx';

export default function Profile() {
  const t = useT();
  const { logout, updateUser } = useAuth();
  const { playList, setFullOpen, current } = usePlayer();
  const toast = useToast();

  const [data, setData]     = useState(null);
  const [loading, setL]     = useState(true);
  const [editOpen, setEdit] = useState(false);
  const [bio, setBio]       = useState('');
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAP] = useState(null);
  const [saving, setSaving] = useState(false);

  // tab activo: songs | liked | followers | following
  const [tab, setTab] = useState('songs');
  const [editingSong, setEditingSong] = useState(null);

  // Cache de datos por tab
  const [liked, setLiked]         = useState(null);
  const [followers, setFollowers] = useState(null);
  const [following, setFollowing] = useState(null);
  const [tabLoading, setTabLoading] = useState(false);

  const load = () => {
    setL(true);
    api.getMyProfile()
      .then(d => {
        setData(d);
        setBio(d.user.bio || '');
        setAP(d.user.avatar || null);
      })
      .catch(e => toast(e.message))
      .finally(() => setL(false));
  };
  useEffect(() => { load(); }, []);

  // Cargar contenido del tab solo cuando cambia (lazy)
  useEffect(() => {
    if (tab === 'liked' && liked === null) {
      setTabLoading(true);
      api.myLiked().then(setLiked).catch(e => toast(e.message)).finally(() => setTabLoading(false));
    }
    if (tab === 'followers' && followers === null) {
      setTabLoading(true);
      api.myFollowers().then(setFollowers).catch(e => toast(e.message)).finally(() => setTabLoading(false));
    }
    if (tab === 'following' && following === null) {
      setTabLoading(true);
      api.myFollowing().then(setFollowing).catch(e => toast(e.message)).finally(() => setTabLoading(false));
    }
  }, [tab]);

  const onPickAvatar = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setAvatar(f);
    const r = new FileReader();
    r.onload = ev => setAP(ev.target.result);
    r.readAsDataURL(f);
  };

  const save = async () => {
    setSaving(true);
    const fd = new FormData();
    fd.append('bio', bio);
    if (avatar) fd.append('avatar', avatar);
    try {
      const res = await api.updateProfile(fd);
      updateUser({ avatar: res.user.avatar, username: res.user.username });
      toast(t('profile.saved'));
      setEdit(false);
      setAvatar(null);
      load();
    } catch (e) {
      toast(e.message);
    } finally {
      setSaving(false);
    }
  };

  const deleteSong = async (s) => {
    if (!confirm(t('common.confirm'))) return;
    try {
      await api.deleteSong(s._id);
      toast('Cancion eliminada');
      load();
    } catch (e) { toast(e.message); }
  };

  if (loading) return <div className="spinner" />;
  if (!data) return null;

  const user = data.user;
  const avatarUrl = user.avatar
    || `https://api.dicebear.com/7.x/initials/svg?seed=${user.username}&backgroundColor=1DB954`;

  return (
    <>
      <div className="profile-top">
        <div className="profile-avatar-wrap">
          <img className="profile-avatar" src={avatarUrl} alt="avatar" />
          <button className="btn-edit-profile" onClick={() => setEdit(true)} title={t('profile.edit')}>
            <Icon.Edit />
          </button>
        </div>
        <div className="profile-name">{user.username}</div>
        {user.bio && <div className="profile-bio">{user.bio}</div>}

        <div className="profile-stats">
          <button
            className={`stat ${tab === 'songs' ? 'stat-active' : ''}`}
            onClick={() => setTab('songs')}
          >
            <div className="stat-num">{data.songsCount}</div>
            <div className="stat-label">{t('profile.songs')}</div>
          </button>
          <button
            className={`stat ${tab === 'liked' ? 'stat-active' : ''}`}
            onClick={() => setTab('liked')}
          >
            <div className="stat-num">{data.totalLikes}</div>
            <div className="stat-label">{t('profile.likes')}</div>
          </button>
          <button
            className={`stat ${tab === 'followers' ? 'stat-active' : ''}`}
            onClick={() => setTab('followers')}
          >
            <div className="stat-num">{data.followersCount}</div>
            <div className="stat-label">{t('profile.followers')}</div>
          </button>
          <button
            className={`stat ${tab === 'following' ? 'stat-active' : ''}`}
            onClick={() => setTab('following')}
          >
            <div className="stat-num">{data.followingCount}</div>
            <div className="stat-label">Siguiendo</div>
          </button>
        </div>
      </div>

      <div className="profile-content">
        {/* Tabs como botones de pildora ademas de las stats */}
        <div className="tabs" style={{ marginBottom: 14 }}>
          <button className={`tab-btn ${tab === 'songs'     ? 'active' : ''}`} onClick={() => setTab('songs')}>
            {t('profile.published')}
          </button>
          <button className={`tab-btn ${tab === 'liked'     ? 'active' : ''}`} onClick={() => setTab('liked')}>
            {t('liked.title')}
          </button>
          <button className={`tab-btn ${tab === 'followers' ? 'active' : ''}`} onClick={() => setTab('followers')}>
            {t('profile.followers')}
          </button>
          <button className={`tab-btn ${tab === 'following' ? 'active' : ''}`} onClick={() => setTab('following')}>
            Siguiendo
          </button>
        </div>

        {/* TAB: Canciones publicadas */}
        {tab === 'songs' && (
          data.songs.length === 0 ? (
            <div className="empty">
              <Icon.Music />
              <p>{t('profile.empty')}</p>
              <Link to="/upload" className="btn-primary" style={{ display: 'inline-block', marginTop: 16, padding: '10px 24px' }}>
                {t('upload.publish')}
              </Link>
            </div>
          ) : (
            <div className="song-list">
              {data.songs.map((s, i) => {
                const cover = s.coverUrl || `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(s.title)}`;
                const isPlayingThis = current?._id === s._id;
                return (
                  <div
                    key={s._id}
                    className={`song-card ${isPlayingThis ? 'playing' : ''}`}
                    onClick={() => { playList(data.songs, i); setFullOpen(true); }}
                  >
                    <img src={cover} alt="" />
                    <div className="song-info">
                      <div className="song-title">{s.title}</div>
                      <div className="song-sub">{s.artist} · {s.year}</div>
                      <div className="song-sub">{COUNTRY_NAMES[s.country] || s.country}</div>
                    </div>
                    <div className="song-card-actions">
                      <div className={`song-likes ${s.likedByMe ? 'liked' : ''}`}>
                        <Icon.Heart />{s.likesCount ?? 0}
                      </div>
                      {isPlayingThis && (
                        <div className="now-playing-icon" title="Reproduciendo">
                          <Icon.Music />
                        </div>
                      )}
                      <button className="btn-delete-song" onClick={(e) => { e.stopPropagation(); deleteSong(s); }} title="Eliminar">
                        <Icon.Trash />
                      </button>
                      <SongMenu song={{ ...s, uploadedBy: user._id }} onEdit={() => setEditingSong(s)} />
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}

        {/* TAB: Canciones que me gustan */}
        {tab === 'liked' && (
          tabLoading
            ? <div className="spinner" />
            : <SongList
                songs={liked || []}
                emptyMsg={t('liked.empty')}
                onEdit={(s) => setEditingSong(s)}
              />
        )}

        {/* TAB: Seguidores */}
        {tab === 'followers' && (
          tabLoading
            ? <div className="spinner" />
            : <UserList users={followers || []} emptyMsg="Aun no tienes seguidores" />
        )}

        {/* TAB: Siguiendo */}
        {tab === 'following' && (
          tabLoading
            ? <div className="spinner" />
            : <UserList users={following || []} emptyMsg="No sigues a nadie todavia" />
        )}

        <button className="logout-btn" onClick={logout}>
          <Icon.Logout /> {t('profile.logout')}
        </button>
      </div>

      {/* Modal de edicion de cancion */}
      {editingSong && (
        <EditSongModal
          song={editingSong}
          onClose={() => setEditingSong(null)}
          onSaved={() => { setEditingSong(null); load(); }}
        />
      )}

      {/* Sheet de edicion de perfil */}
      <div className={`edit-overlay ${editOpen ? 'open' : ''}`} onClick={(e) => {
        if (e.target.classList.contains('edit-overlay')) setEdit(false);
      }}>
        <div className="edit-sheet">
          <h3>
            {t('profile.edit')}
            <button onClick={() => setEdit(false)}>{t('common.cancel')}</button>
          </h3>

          <div className="avatar-edit-wrap">
            <img src={avatarPreview || avatarUrl} alt="" />
            <label className="avatar-btn">
              Cambiar foto
              <input type="file" accept="image/*" onChange={onPickAvatar} />
            </label>
          </div>

          <div className="form-group">
            <label>{t('profile.bio')}</label>
            <textarea
              rows="3"
              value={bio}
              onChange={e => setBio(e.target.value)}
              maxLength="280"
              placeholder="Cuentanos algo sobre ti..."
              style={{ resize: 'none' }}
            />
          </div>

          <button className="save-btn" onClick={save} disabled={saving}>
            {saving ? '...' : t('profile.save')}
          </button>
        </div>
      </div>
    </>
  );
}

// Componente auxiliar para listar usuarios (seguidores / seguidos)
function UserList({ users, emptyMsg }) {
  if (!users.length) {
    return (
      <div className="empty">
        <Icon.User />
        <p>{emptyMsg}</p>
      </div>
    );
  }
  return (
    <div className="song-list">
      {users.map(u => {
        const avatar = u.avatar
          || `https://api.dicebear.com/7.x/initials/svg?seed=${u.username}&backgroundColor=1DB954`;
        return (
          <Link key={u._id} to={`/u/${u._id}`} className="song-card">
            <img src={avatar} alt="" style={{ borderRadius: '50%' }} />
            <div className="song-info">
              <div className="song-title">{u.username}</div>
              {u.bio && <div className="song-sub">{u.bio}</div>}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
