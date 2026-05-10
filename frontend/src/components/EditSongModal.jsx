import { useState } from 'react';
import { api } from '../api.js';
import { COUNTRIES } from '../countries.js';
import { useToast } from '../context/ToastContext.jsx';
import { Icon } from './icons.jsx';

const CY = new Date().getFullYear();

export default function EditSongModal({ song, onClose, onSaved }) {
  const toast = useToast();
  const [title, setTitle]     = useState(song.title || '');
  const [artist, setArtist]   = useState(song.artist || '');
  const [year, setYear]       = useState(song.year || '');
  const [country, setCountry] = useState(song.country || '');
  const [cover, setCover]     = useState(null);
  const [coverPreview, setCP] = useState(song.coverUrl || null);
  const [saving, setSaving]   = useState(false);

  const onPickCover = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setCover(f);
    const r = new FileReader();
    r.onload = ev => setCP(ev.target.result);
    r.readAsDataURL(f);
  };

  const save = async () => {
    if (!title.trim() || !artist.trim() || !year || !country) {
      toast('Rellena todos los campos'); return;
    }
    const yNum = parseInt(year);
    if (isNaN(yNum) || yNum < 1900 || yNum > CY) {
      toast(`El ano debe estar entre 1900 y ${CY}`); return;
    }
    setSaving(true);
    const fd = new FormData();
    fd.append('title',   title.trim());
    fd.append('artist',  artist.trim());
    fd.append('year',    String(yNum));
    fd.append('country', country);
    if (cover) fd.append('cover', cover);
    try {
      const updated = await api.updateSong(song._id, fd);
      toast('Cancion actualizada');
      onSaved?.(updated);
      onClose();
    } catch (e) {
      toast(e.message);
      setSaving(false);
    }
  };

  return (
    <div className="edit-overlay open" onClick={(e) => {
      if (e.target.classList.contains('edit-overlay')) onClose();
    }}>
      <div className="edit-sheet">
        <h3>
          Editar cancion
          <button onClick={onClose}>Cancelar</button>
        </h3>

        <div className="avatar-edit-wrap">
          {coverPreview
            ? <img src={coverPreview} alt="" style={{ borderRadius: 8 }} />
            : <div style={{
                width: 72, height: 72, borderRadius: 8,
                background: 'var(--bg4)', display: 'flex',
                alignItems: 'center', justifyContent: 'center', color: 'var(--text3)'
              }}><Icon.Image /></div>}
          <label className="avatar-btn">
            Cambiar portada
            <input type="file" accept="image/*" onChange={onPickCover} />
          </label>
        </div>

        <div className="form-group">
          <label>Titulo</label>
          <input value={title} onChange={e => setTitle(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Artista</label>
          <input value={artist} onChange={e => setArtist(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Ano</label>
          <input type="number" min="1900" max={CY}
                 value={year} onChange={e => setYear(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Pais</label>
          <select value={country} onChange={e => setCountry(e.target.value)}>
            <option value="">— Selecciona —</option>
            {COUNTRIES.map(([code, name]) => (
              <option key={code} value={code}>{name}</option>
            ))}
          </select>
        </div>

        <button className="save-btn" onClick={save} disabled={saving}>
          {saving ? 'Guardando…' : 'Guardar cambios'}
        </button>
      </div>
    </div>
  );
}
