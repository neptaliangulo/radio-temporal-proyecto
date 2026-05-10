import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { useT } from '../i18n.js';
import { Icon } from '../components/icons.jsx';
import SongList from '../components/SongList.jsx';
import { useToast } from '../context/ToastContext.jsx';

export default function LikedSongs() {
  const t = useT();
  const toast = useToast();
  const [songs, setSongs] = useState([]);
  const [loading, setL]   = useState(true);

  useEffect(() => {
    api.myLiked()
      .then(setSongs)
      .catch(e => toast(e.message))
      .finally(() => setL(false));
  }, []);

  return (
    <main className="page">
      <div className="page-header">
        <div className="page-title">
          <Icon.Heart style={{ color: 'var(--accent)', width: 24, height: 24 }} />
          {t('liked.title')}
        </div>
      </div>
      {loading
        ? <div className="spinner" />
        : <SongList songs={songs} emptyMsg={t('liked.empty')} />
      }
    </main>
  );
}
