import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Icon } from './icons.jsx';
import { useT } from '../i18n.js';

export default function Navbar() {
  const { user } = useAuth();
  const t = useT();

  return (
    <nav className="navbar">
      <NavLink to="/" end className={({ isActive }) => 'nav-item' + (isActive ? ' active' : '')}>
        <Icon.Home /> {t('nav.home')}
      </NavLink>
      <NavLink to="/search" className={({ isActive }) => 'nav-item' + (isActive ? ' active' : '')}>
        <Icon.Search /> {t('nav.search')}
      </NavLink>
      <NavLink to="/upload" className={({ isActive }) => 'nav-item' + (isActive ? ' active' : '')}>
        <Icon.Upload /> {t('nav.upload')}
      </NavLink>
      <NavLink to="/profile" className={({ isActive }) => 'nav-item' + (isActive ? ' active' : '')}>
        {user?.avatar
          ? <img className="nav-avatar" src={user.avatar} alt="avatar" />
          : <Icon.User />}
        {t('nav.profile')}
      </NavLink>
      <NavLink to="/settings" className={({ isActive }) => 'nav-item' + (isActive ? ' active' : '')}>
        <Icon.Settings /> {t('nav.settings')}
      </NavLink>
    </nav>
  );
}
