import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useT } from '../i18n.js';

export default function Login() {
  const t = useT();
  const { login, isAuth } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/';

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr]           = useState('');
  const [loading, setLoading]   = useState(false);

  if (isAuth) { navigate(from, { replace: true }); return null; }

  const submit = async (e) => {
    e.preventDefault();
    if (!email || !password) { setErr(t('auth.fill_all')); return; }
    setLoading(true); setErr('');
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (e) {
      setErr(e.message);
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-logo-wrap">
        <span className="auth-logo-icon">📻</span>
        <div className="auth-logo">Radio <span>Temporal</span></div>
      </div>
      <form className="auth-box" onSubmit={submit}>
        <h2>{t('auth.login')}</h2>
        {err && <div className="error-msg">{err}</div>}
        <div className="form-group">
          <label>{t('auth.email')}</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="tu@email.com" />
        </div>
        <div className="form-group">
          <label>{t('auth.password')}</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
        </div>
        <button className="btn-primary" disabled={loading}>
          {loading ? '...' : t('auth.login')}
        </button>
        <div className="auth-link" style={{ marginTop: 24 }}>
          {t('auth.no_account')} <Link to="/register">{t('auth.register')}</Link>
        </div>
      </form>
    </div>
  );
}
