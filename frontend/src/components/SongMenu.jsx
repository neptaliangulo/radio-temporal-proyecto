import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { api } from '../api.js';
import { Icon } from './icons.jsx';

export default function SongMenu({ song, onEdit }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const { user, isAuth } = useAuth();
  const toast = useToast();

  // Cerrar al hacer click fuera
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const ownerId = song.uploadedBy?._id || song.uploadedBy;
  const isOwner = user && ownerId && String(ownerId) === String(user.id);

  const copyLink = (e) => {
    e.stopPropagation();
    const url = `${window.location.origin}/song/${song._id}`;
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(url).then(() => toast('Enlace copiado'));
    } else {
      // Fallback navegadores antiguos
      const ta = document.createElement('textarea');
      ta.value = url; document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); toast('Enlace copiado'); } catch { toast('No se pudo copiar'); }
      document.body.removeChild(ta);
    }
    setOpen(false);
  };

  const report = async (e) => {
    e.stopPropagation();
    if (!isAuth) { toast('Inicia sesion para denunciar'); setOpen(false); return; }
    const reason = prompt('Motivo de la denuncia (mín. 3 caracteres):');
    if (!reason || !reason.trim()) { setOpen(false); return; }
    try {
      const r = await api.reportSong(song._id, reason.trim());
      toast(r.message || 'Reporte enviado');
    } catch (err) { toast(err.message); }
    setOpen(false);
  };

  const edit = (e) => {
    e.stopPropagation();
    onEdit?.(song);
    setOpen(false);
  };

  return (
    <div className="song-menu-wrap" ref={ref}>
      <button
        className="song-menu-trigger"
        onClick={(e) => { e.stopPropagation(); setOpen(o => !o); }}
        title="Mas opciones"
      >
        <span>⋯</span>
      </button>
      {open && (
        <div className="song-menu-dropdown" onClick={(e) => e.stopPropagation()}>
          {isOwner && onEdit && (
            <button className="song-menu-item" onClick={edit}>
              <Icon.Edit /> Editar
            </button>
          )}
          <button className="song-menu-item" onClick={copyLink}>
            <Icon.Send /> Copiar enlace
          </button>
          <button className="song-menu-item danger" onClick={report}>
            <span className="report-icon">⚠</span> Denunciar
          </button>
        </div>
      )}
    </div>
  );
}
