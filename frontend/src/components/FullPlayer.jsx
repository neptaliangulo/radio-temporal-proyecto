import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { usePlayer } from '../context/PlayerContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { Icon } from './icons.jsx';
import { useT } from '../i18n.js';
import { api } from '../api.js';
import { COUNTRY_NAMES } from '../countries.js';
import './VolumeControl.css';

function fmt(s) {
  if (!s || isNaN(s)) return '0:00';
  const m  = Math.floor(s / 60);
  const ss = String(Math.floor(s % 60)).padStart(2, '0');
  return `${m}:${ss}`;
}

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60)   return 'ahora';
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
}

// ── Componente de un comentario (top-level o reply) ──────────────
function CommentItem({ comment, songId, onDelete, onLike, onReply, depth = 0 }) {
  const { user, isAuth } = useAuth();
  const toast = useToast();
  const [replyOpen, setReplyOpen]   = useState(false);
  const [replyText, setReplyText]   = useState('');
  const [showReplies, setShowReplies] = useState(true);
  const inputRef = useRef(null);

  const isOwn    = user && comment.user?._id === user.id;
  const avatar   = comment.user?.avatar
    || `https://api.dicebear.com/7.x/initials/svg?seed=${comment.user?.username || 'U'}`;

  const handleReplyOpen = () => {
    if (!isAuth) { toast('Inicia sesión para responder'); return; }
    setReplyOpen(r => !r);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleSendReply = async () => {
    const txt = replyText.trim();
    if (!txt) return;
    try {
      await onReply(comment._id, comment.user?.username, txt);
      setReplyText('');
      setReplyOpen(false);
      setShowReplies(true);
    } catch (e) { toast(e.message); }
  };

  return (
    <div className={`comment-thread ${depth > 0 ? 'comment-reply' : ''}`}>
      <div className="comment-item">
        <img className="comment-avatar" src={avatar} alt="" />
        <div className="comment-body">
          <div className="comment-meta">
            <span className="comment-user">
              {comment.user?._id
                ? <Link to={`/u/${comment.user._id}`}>{comment.user.username}</Link>
                : comment.user?.username || 'Usuario'}
            </span>
            <span className="comment-time">{timeAgo(comment.createdAt)}</span>
          </div>
          {comment.replyTo && (
            <span className="comment-replyto">@{comment.replyTo} </span>
          )}
          <div className="comment-text">{comment.text}</div>

          {/* Acciones inline */}
          <div className="comment-actions">
            <button
              className={`comment-like-btn ${comment.likedByMe ? 'liked' : ''}`}
              onClick={() => onLike(comment._id)}
            >
              <Icon.Heart />
              {comment.likesCount > 0 && <span>{comment.likesCount}</span>}
            </button>
            {depth === 0 && (
              <button className="comment-reply-btn" onClick={handleReplyOpen}>
                Responder
              </button>
            )}
            {isOwn ? (
              <button className="comment-delete" onClick={() => onDelete(comment._id, comment.parentId)}>
                <Icon.Trash />
              </button>
            ) : (
              <button className="comment-delete" onClick={async () => {
                const reason = prompt('Motivo de la denuncia:');
                if (!reason?.trim()) return;
                try { const r = await api.reportComment(comment._id, reason.trim()); toast(r.message || 'Reporte enviado'); }
                catch (e) { toast(e.message); }
              }}>⚠</button>
            )}
          </div>

          {/* Input de respuesta */}
          {replyOpen && (
            <div className="reply-input-row">
              <input
                ref={inputRef}
                type="text"
                placeholder={`Responder a @${comment.user?.username}…`}
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSendReply()}
              />
              <button onClick={handleSendReply}><Icon.Send /></button>
              <button className="cancel-reply" onClick={() => setReplyOpen(false)}>✕</button>
            </div>
          )}
        </div>
      </div>

      {/* Replies anidadas */}
      {comment.replies?.length > 0 && depth === 0 && (
        <div className="replies-wrap">
          <button className="toggle-replies" onClick={() => setShowReplies(v => !v)}>
            {showReplies
              ? `▲ Ocultar respuestas (${comment.replies.length})`
              : `▼ Ver respuestas (${comment.replies.length})`}
          </button>
          {showReplies && comment.replies.map(r => (
            <CommentItem
              key={r._id}
              comment={r}
              songId={songId}
              onDelete={onDelete}
              onLike={onLike}
              onReply={onReply}
              depth={1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Full Player principal ─────────────────────────────────────────
export default function FullPlayer() {
  const t = useT();
  const {
    current, isPlaying, progress, elapsed, duration,
    togglePlay, prev, next, seek, shuffle, toggleShuffle,
    fullOpen, setFullOpen, toggleLike,
    volume, muted, setVolume, toggleMute
  } = usePlayer();
  const { isAuth, user } = useAuth();
  const toast = useToast();

  const [comments, setComments] = useState([]);
  const [text, setText]         = useState('');
  const [loading, setLoading]   = useState(false);
  const [volumeOpen, setVolumeOpen] = useState(false);
  const clickTimer   = useRef(null);
  const volumeBoxRef = useRef(null);

  // Cerrar slider al hacer click fuera
  useEffect(() => {
    if (!volumeOpen) return;
    const handler = (e) => {
      if (volumeBoxRef.current && !volumeBoxRef.current.contains(e.target))
        setVolumeOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [volumeOpen]);

  const onVolumeClick = () => {
    if (clickTimer.current) return;
    clickTimer.current = setTimeout(() => { setVolumeOpen(v => !v); clickTimer.current = null; }, 220);
  };
  const onVolumeDoubleClick = () => {
    if (clickTimer.current) { clearTimeout(clickTimer.current); clickTimer.current = null; }
    toggleMute(); setVolumeOpen(false);
  };

  const VolumeIcon = muted || volume === 0 ? Icon.VolumeMute
    : (volume < 0.5 ? Icon.VolumeLow : Icon.VolumeHigh);
  const volumePct = muted ? 0 : Math.round(volume * 100);

  // Cargar comentarios
  useEffect(() => {
    if (!current?._id || !fullOpen) return;
    setLoading(true);
    api.getComments(current._id)
      .then(setComments)
      .catch(() => setComments([]))
      .finally(() => setLoading(false));
  }, [current?._id, fullOpen]);

  if (!current) return null;

  const cover   = current.coverUrl || `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(current.title)}`;
  const country = COUNTRY_NAMES[current.country] || current.country;

  const onLike = async () => {
    if (!isAuth) { toast(t('comments.login_required')); return; }
    try { await toggleLike(); } catch (e) { toast(e.message); }
  };

  // Enviar comentario top-level
  const onSendComment = async () => {
    if (!isAuth) { toast(t('comments.login_required')); return; }
    const txt = text.trim();
    if (!txt) return;
    try {
      const c = await api.postComment(current._id, txt);
      // Insertar al inicio con replies vacías, ordenar después
      setComments(cs => sortComments([{ ...c, replies: [] }, ...cs]));
      setText('');
    } catch (e) { toast(e.message); }
  };

  // Enviar reply
  const onReply = async (parentId, replyTo, txt) => {
    if (!isAuth) { toast(t('comments.login_required')); return; }
    const c = await api.postReply(current._id, txt, parentId, replyTo);
    setComments(cs => cs.map(top =>
      top._id === parentId
        ? { ...top, replies: [...(top.replies || []), c] }
        : top
    ));
  };

  // Eliminar comentario o reply
  const onDelete = async (commentId, parentId) => {
    if (!confirm(t('common.confirm'))) return;
    try {
      await api.deleteComment(current._id, commentId);
      if (parentId) {
        // Es una reply
        setComments(cs => cs.map(top =>
          top._id === String(parentId)
            ? { ...top, replies: top.replies.filter(r => r._id !== commentId) }
            : top
        ));
      } else {
        setComments(cs => cs.filter(c => c._id !== commentId));
      }
    } catch (e) { toast(e.message); }
  };

  // Like en comentario
  const onLikeComment = async (commentId) => {
    if (!isAuth) { toast(t('comments.login_required')); return; }
    try {
      const data = await api.likeComment(current._id, commentId);
      setComments(cs => updateCommentLike(cs, commentId, data));
    } catch (e) { toast(e.message); }
  };

  const onSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    seek((e.clientX - rect.left) / rect.width);
  };

  return (
    <div className={`full-player ${fullOpen ? 'open' : ''}`}>

      <div className="player-header">
        <button className="btn-close-player" onClick={() => setFullOpen(false)}>
          <Icon.Down />
        </button>
        <span>Reproduciendo</span>
      </div>

      <img className="full-cover" src={cover} alt="" />

      <div className="player-song-info">
        <div className="info">
          <div className="full-title">{current.title}</div>
          <div className="full-artist">
            {current.artist}
            {current.uploadedBy?._id && (
              <> · <Link to={`/u/${current.uploadedBy._id}`} onClick={() => setFullOpen(false)} style={{ textDecoration: 'underline' }}>
                @{current.uploadedBy.username}
              </Link></>
            )}
          </div>
          <div className="full-meta">{current.year} · {country}</div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div className="volume-wrap" ref={volumeBoxRef}>
            <button className="btn-volume" onClick={onVolumeClick} onDoubleClick={onVolumeDoubleClick}
              title="Click: volumen · Doble click: silenciar"
              style={{ color: muted ? 'var(--text3)' : 'var(--text2)' }}>
              <VolumeIcon />
            </button>
            {volumeOpen && (
              <div className="volume-slider-box">
                <span className="volume-pct">{volumePct}%</span>
                <input type="range" min="0" max="1" step="0.01" value={muted ? 0 : volume}
                  className="volume-slider"
                  onChange={(e) => {
                    const v = parseFloat(e.target.value);
                    setVolume(v);
                    if (muted && v > 0) toggleMute();
                  }} />
              </div>
            )}
          </div>
          <button className={`btn-like ${current.likedByMe ? 'liked' : ''}`} onClick={onLike}>
            <Icon.Heart /><span>{current.likesCount ?? 0}</span>
          </button>
        </div>
      </div>

      <div className="progress-wrap">
        <div className="progress-bar" onClick={onSeek}>
          <div className="progress-fill" style={{ width: `${progress * 100}%` }} />
        </div>
        <div className="time-row">
          <span>{fmt(elapsed)}</span><span>{fmt(duration)}</span>
        </div>
      </div>

      <div className="player-controls">
        <button className={`btn-shuffle ${shuffle ? 'active' : ''}`} onClick={toggleShuffle} title="Aleatorio">
          <Icon.Shuffle />
        </button>
        <button onClick={prev}><Icon.Prev /></button>
        <button className="btn-play-full" onClick={togglePlay}>
          {isPlaying ? <Icon.Pause /> : <Icon.Play />}
        </button>
        <button onClick={next}><Icon.Next /></button>
        <button style={{ visibility: 'hidden' }}><Icon.Shuffle /></button>
      </div>

      {/* ── Sección de comentarios ── */}
      <div className="comments-section">
        <h3>
          {t('comments.title')}
          {comments.length > 0 && <span className="comments-count">{comments.length}</span>}
        </h3>

        <div className="comment-input-row">
          <input
            type="text"
            placeholder={t('comments.placeholder')}
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && onSendComment()}
          />
          <button onClick={onSendComment}><Icon.Send /></button>
        </div>

        {loading
          ? <div className="spinner" />
          : comments.length === 0
            ? <p style={{ color: 'var(--text2)', fontSize: 13, padding: '8px 0' }}>{t('comments.empty')}</p>
            : comments.map(c => (
                <CommentItem
                  key={c._id}
                  comment={c}
                  songId={current._id}
                  onDelete={onDelete}
                  onLike={onLikeComment}
                  onReply={onReply}
                />
              ))
        }
      </div>
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────────
function sortComments(cs) {
  return [...cs].sort((a, b) =>
    (b.likesCount || 0) - (a.likesCount || 0) ||
    new Date(b.createdAt) - new Date(a.createdAt)
  );
}

function updateCommentLike(comments, commentId, data) {
  return sortComments(comments.map(c => {
    if (c._id === commentId)
      return { ...c, likesCount: data.likesCount, likedByMe: data.likedByMe };
    // Buscar también en replies
    if (c.replies?.length) {
      return {
        ...c,
        replies: c.replies.map(r =>
          r._id === commentId
            ? { ...r, likesCount: data.likesCount, likedByMe: data.likedByMe }
            : r
        )
      };
    }
    return c;
  }));
}
