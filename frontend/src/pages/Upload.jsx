import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import { useToast } from '../context/ToastContext.jsx';
import { useT } from '../i18n.js';
import { COUNTRIES } from '../countries.js';
import { Icon } from '../components/icons.jsx';

const CURRENT_YEAR = new Date().getFullYear();

export default function Upload() {
  const t = useT();
  const navigate = useNavigate();
  const toast = useToast();

  const [title, setTitle]   = useState('');
  const [artist, setArtist] = useState('');
  const [year, setYear]     = useState('');
  const [country, setCountry] = useState('');
  const [audio, setAudio]   = useState(null);
  const [cover, setCover]   = useState(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    if (!title || !artist || !year || !country || !audio) {
      setErr('Rellena todos los campos y selecciona un audio');
      return;
    }
    const yNum = parseInt(year);
    if (yNum < 1900 || yNum > CURRENT_YEAR) {
      setErr(`El ano debe estar entre 1900 y ${CURRENT_YEAR}`);
      return;
    }
    setUploading(true);
    setProgress(0);
    const fd = new FormData();
    fd.append('title', title.trim());
    fd.append('artist', artist.trim());
    fd.append('year', year);
    fd.append('country', country);
    fd.append('audio', audio);
    if (cover) fd.append('cover', cover);

    try {
      await api.uploadSong(fd, p => setProgress(p));
      toast(t('upload.success'));
      setTimeout(() => navigate('/profile'), 800);
    } catch (e) {
      setErr(e.message);
      setUploading(false);
    }
  };

  return (
    <main className="page">
      <div className="page-header">
        <div className="page-title">{t('upload.title')}</div>
        <div className="page-subtitle">{t('upload.subtitle')}</div>
      </div>

      <form className="upload-form" onSubmit={submit}>
        <div>
          <span className="file-drop-label">{t('upload.audio')}</span>
          <label className="file-drop">
            <input
              type="file"
              accept="audio/*"
              onChange={e => setAudio(e.target.files[0])}
            />
            <Icon.Upload />
            <p>{audio?.name || 'Seleccionar archivo de audio'}</p>
            <small>MP3, WAV, FLAC · max 30MB</small>
          </label>
        </div>

        <div>
          <span className="file-drop-label">{t('upload.cover')}</span>
          <label className="file-drop">
            <input
              type="file"
              accept="image/*"
              onChange={e => setCover(e.target.files[0])}
            />
            <Icon.Image />
            <p>{cover?.name || 'Seleccionar imagen'}</p>
            <small>JPG, PNG</small>
          </label>
        </div>

        <div className="form-group">
          <label>{t('upload.song')}</label>
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Bohemian Rhapsody" />
        </div>

        <div className="form-group">
          <label>{t('upload.artist')}</label>
          <input value={artist} onChange={e => setArtist(e.target.value)} placeholder="Queen" />
        </div>

        <div className="form-group">
          <label>{t('upload.year')}</label>
          <input type="number" min="1900" max={CURRENT_YEAR} value={year} onChange={e => setYear(e.target.value)} placeholder="1975" />
        </div>

        <div className="form-group">
          <label>{t('upload.country')}</label>
          <select value={country} onChange={e => setCountry(e.target.value)}>
            <option value="">— Selecciona —</option>
            {COUNTRIES.map(([code, name]) => (
              <option key={code} value={code}>{name}</option>
            ))}
          </select>
        </div>

        {err && <div className="error-msg">{err}</div>}

        {uploading && (
          <div className="upload-progress">
            <div style={{ width: `${progress}%` }} />
          </div>
        )}

        <button className="btn-primary" disabled={uploading}>
          {uploading ? `${t('upload.uploading')} ${Math.round(progress)}%` : t('upload.publish')}
        </button>
      </form>
    </main>
  );
}
