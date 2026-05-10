import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useT } from '../i18n.js';

export default function Register() {
  const t = useT();
  const { register, isAuth } = useAuth();
  const navigate = useNavigate();
  const [username, setU] = useState('');
  const [email, setE]    = useState('');
  const [password, setP] = useState('');
  const [err, setErr]    = useState('');
  const [loading, setL]  = useState(false);

  if (isAuth) { navigate('/', { replace: true }); return null; }

  const submit = async (e) => {
    e.preventDefault();
    if (!username || !email || !password) { setErr(t('auth.fill_all')); return; }
    if (password.length < 6) { setErr('La contrasena debe tener al menos 6 caracteres'); return; }
    setL(true); setErr('');
    try {
      await register(username, email, password);
      navigate('/', { replace: true });
    } catch (e) {
      setErr(e.message);
      setL(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-logo-wrap">
        <span className="auth-logo-icon">📻</span>
        <div className="auth-logo">Radio <span>Temporal</span></div>
      </div>
      <form className="auth-box" onSubmit={submit}>
        <h2>{t('auth.register')}</h2>
        {err && <div className="error-msg">{err}</div>}
        <div className="form-group">
          <label>{t('auth.username')}</label>
          <input type="text" value={username} onChange={e => setU(e.target.value)} placeholder="tunombre" />
        </div>
        <div className="form-group">
          <label>{t('auth.email')}</label>
          <input type="email" value={email} onChange={e => setE(e.target.value)} placeholder="tu@email.com" />
        </div>
        <div className="form-group">
          <label>{t('auth.password')}</label>
          <input type="password" value={password} onChange={e => setP(e.target.value)} placeholder="Minimo 6 caracteres" />
        </div>
        <button className="btn-primary" disabled={loading}>
          {loading ? '...' : t('auth.register')}
        </button>
        <div className="auth-link" style={{ marginTop: 24 }}>
          {t('auth.have_account')} <Link to="/login">{t('auth.login')}</Link>
        </div>
      </form>
    </div>
  );
}
