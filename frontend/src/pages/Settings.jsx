import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { usePlayer } from '../context/PlayerContext.jsx';
import { useT, getLang, setLang } from '../i18n.js';
import { Icon } from '../components/icons.jsx';

export default function Settings() {
  const t = useT();
  const { user, isAuth, logout } = useAuth();
  const { autoplay, setAutoplay, loop, setLoop } = usePlayer();
  const toast = useToast();
  const [lang, setLangState] = useState(getLang());

  const changeLang = (l) => {
    setLang(l);
    setLangState(l);
    toast(l === 'es' ? 'Idioma guardado' : 'Language saved');
  };

  return (
    <main className="page">
      <div className="page-header">
        <div className="page-title">{t('settings.title')}</div>
        <div className="page-subtitle">{t('settings.subtitle')}</div>
      </div>

      <div className="settings-section-title">{t('settings.lang')}</div>
      <div className="settings-card">
        <h4><Icon.Home /> <span>{t('settings.lang')}</span></h4>
        <p>{t('settings.lang_desc')}</p>
        <div className="lang-options">
          <button className={`lang-btn ${lang === 'es' ? 'active' : ''}`} onClick={() => changeLang('es')}>🇪🇸 Espanol</button>
          <button className={`lang-btn ${lang === 'en' ? 'active' : ''}`} onClick={() => changeLang('en')}>🇬🇧 English</button>
        </div>
      </div>

      <div className="settings-section-title">{t('settings.playback')}</div>
      <div className="settings-list">
        <div className="settings-item">
          <div className="settings-item-left">
            <Icon.Play /> <span>{t('settings.autoplay')}</span>
          </div>
          <label className="toggle">
            <input type="checkbox" checked={autoplay} onChange={e => setAutoplay(e.target.checked)} />
            <span className="toggle-slider"></span>
          </label>
        </div>
        <div className="settings-item">
          <div className="settings-item-left">
            <Icon.Shuffle /> <span>{t('settings.loop')}</span>
          </div>
          <label className="toggle">
            <input type="checkbox" checked={loop} onChange={e => setLoop(e.target.checked)} />
            <span className="toggle-slider"></span>
          </label>
        </div>
      </div>

      <div className="settings-section-title">{t('settings.account')}</div>
      <div className="settings-list">
        {isAuth ? (
          <>
            <div className="settings-item" style={{ cursor: 'default' }}>
              <div className="settings-item-left"><Icon.User /> <span>{user?.username}</span></div>
              <div className="settings-item-right" style={{ color: 'var(--accent)', fontWeight: 700, fontSize: 12 }}>
                {t('settings.connected')}
              </div>
            </div>
            <Link to="/liked" className="settings-item">
              <div className="settings-item-left"><Icon.Heart /> <span>{t('liked.title')}</span></div>
              <div className="settings-item-right"><Icon.Right /></div>
            </Link>
            <Link to="/feed" className="settings-item">
              <div className="settings-item-left"><Icon.Music /> <span>{t('feed.title')}</span></div>
              <div className="settings-item-right"><Icon.Right /></div>
            </Link>
            <div className="settings-item" onClick={logout} style={{ color: '#ff6b6b' }}>
              <div className="settings-item-left"><Icon.Logout /> <span>{t('settings.logout')}</span></div>
            </div>
          </>
        ) : (
          <Link to="/login" className="settings-item">
            <div className="settings-item-left"><Icon.User /> <span>{t('settings.login')}</span></div>
            <div className="settings-item-right"><Icon.Right /></div>
          </Link>
        )}
      </div>

      <div className="settings-section-title">{t('settings.about')}</div>
      <div className="settings-card">
        <h4><Icon.Music /> <span>Radio Temporal</span></h4>
        <p>{t('settings.about_desc')}</p>
      </div>

      <div className="app-version">Radio Temporal · v1.0.0</div>
    </main>
  );
}
