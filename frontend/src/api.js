// En desarrollo usa el proxy de Vite (/api → localhost:3001)
// En producción usa la variable de entorno con la URL real del backend
const API = import.meta.env.VITE_API_URL || '/api';

function token() { return localStorage.getItem('rt_token'); }
function authHeaders() {
  const t = token();
  return t ? { Authorization: `Bearer ${t}` } : {};
}

async function handle(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.message || `Error ${res.status}`);
    err.status = res.status;
    err.payload = data;
    throw err;
  }
  return data;
}

export const api = {
  // ── Auth ───────────────────────────────────────────────────
  register: (username, email, password) =>
    fetch(`${API}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password })
    }).then(handle),

  login: (email, password) =>
    fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    }).then(handle),

  // ── Canciones ──────────────────────────────────────────────
  getSongs: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return fetch(`${API}/songs${q ? '?' + q : ''}`, { headers: authHeaders() }).then(handle);
  },

  getSong: (id) =>
    fetch(`${API}/songs/${id}`, { headers: authHeaders() }).then(handle),

  getFeed: () =>
    fetch(`${API}/songs/feed`, { headers: authHeaders() }).then(handle),

  // Subida con progreso + timeout total (10 min) + watchdog (si no avanza
  // en 30 s, abortamos para no quedarnos colgados con la subida).
  uploadSong: (formData, onProgress) => new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${API}/songs`);
    const t = token();
    if (t) xhr.setRequestHeader('Authorization', `Bearer ${t}`);
    xhr.timeout = 10 * 60 * 1000; // 10 minutos como tope absoluto

    let lastProgress = Date.now();
    const watchdog = setInterval(() => {
      if (Date.now() - lastProgress > 30000) {
        clearInterval(watchdog);
        try { xhr.abort(); } catch {}
        reject(new Error('La subida se ha quedado sin avanzar. Revisa tu conexion.'));
      }
    }, 5000);

    xhr.upload.onprogress = (e) => {
      lastProgress = Date.now();
      if (e.lengthComputable && onProgress) onProgress((e.loaded / e.total) * 100);
    };
    xhr.onload = () => {
      clearInterval(watchdog);
      let data; try { data = JSON.parse(xhr.responseText); } catch { data = {}; }
      if (xhr.status >= 200 && xhr.status < 300) resolve(data);
      else reject(new Error(data.message || `Error ${xhr.status}`));
    };
    xhr.onerror   = () => { clearInterval(watchdog); reject(new Error('Error de red')); };
    xhr.ontimeout = () => { clearInterval(watchdog); reject(new Error('Tiempo de subida agotado')); };
    xhr.onabort   = () => { clearInterval(watchdog); };
    xhr.send(formData);
  }),

  updateSong: (id, formData) =>
    fetch(`${API}/songs/${id}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: formData
    }).then(handle),

  likeSong: (id) =>
    fetch(`${API}/songs/${id}/like`, {
      method: 'POST',
      headers: authHeaders()
    }).then(handle),

  // ── Comentarios ────────────────────────────────────────────
  getComments: (id) =>
    fetch(`${API}/songs/${id}/comments`).then(handle),

  postComment: (id, text) =>
    fetch(`${API}/songs/${id}/comments`, {
      method: 'POST',
      headers: { ...authHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    }).then(handle),

  postReply: (songId, text, parentId, replyTo) =>
    fetch(`${API}/songs/${songId}/comments`, {
      method: 'POST',
      headers: { ...authHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, parentId, replyTo })
    }).then(handle),

  likeComment: (songId, commentId) =>
    fetch(`${API}/songs/${songId}/comments/${commentId}/like`, {
      method: 'POST',
      headers: authHeaders()
    }).then(handle),

  deleteComment: (songId, commentId) =>
    fetch(`${API}/songs/${songId}/comments/${commentId}`, {
      method: 'DELETE',
      headers: authHeaders()
    }).then(handle),

  // ── Usuarios ───────────────────────────────────────────────
  getMyProfile: () =>
    fetch(`${API}/users/me`, { headers: authHeaders() }).then(handle),

  updateProfile: (formData) =>
    fetch(`${API}/users/me`, {
      method: 'PUT',
      headers: authHeaders(),
      body: formData
    }).then(handle),

  myLiked: () =>
    fetch(`${API}/users/me/liked`, { headers: authHeaders() }).then(handle),

  myFollowers: () =>
    fetch(`${API}/users/me/followers`, { headers: authHeaders() }).then(handle),

  myFollowing: () =>
    fetch(`${API}/users/me/following`, { headers: authHeaders() }).then(handle),

  deleteSong: (id) =>
    fetch(`${API}/users/me/songs/${id}`, {
      method: 'DELETE',
      headers: authHeaders()
    }).then(handle),

  searchUsers: (q) =>
    fetch(`${API}/users?q=${encodeURIComponent(q)}`).then(handle),

  getUser: (id) =>
    fetch(`${API}/users/${id}`, { headers: authHeaders() }).then(handle),

  followUser: (id) =>
    fetch(`${API}/users/${id}/follow`, {
      method: 'POST',
      headers: authHeaders()
    }).then(handle),

  // ── Reportes ───────────────────────────────────────────────
  reportSong: (songId, reason) =>
    fetch(`${API}/reports`, {
      method: 'POST',
      headers: { ...authHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'song', targetId: songId, reason })
    }).then(handle),

  reportComment: (commentId, reason) =>
    fetch(`${API}/reports`, {
      method: 'POST',
      headers: { ...authHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'comment', targetId: commentId, reason })
    }).then(handle)
};
