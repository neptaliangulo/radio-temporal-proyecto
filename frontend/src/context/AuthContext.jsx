import { createContext, useContext, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api.js';

const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

function readUser() {
  try { return JSON.parse(localStorage.getItem('rt_user') || 'null'); }
  catch { return null; }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readUser());
  const navigate = useNavigate();

  const login = useCallback(async (email, password) => {
    const data = await api.login(email, password);
    localStorage.setItem('rt_token', data.token);
    localStorage.setItem('rt_user',  JSON.stringify(data.user));
    setUser(data.user);
    return data;
  }, []);

  const register = useCallback(async (username, email, password) => {
    const data = await api.register(username, email, password);
    if (data.token) {
      localStorage.setItem('rt_token', data.token);
      localStorage.setItem('rt_user',  JSON.stringify(data.user));
      setUser(data.user);
    }
    return data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('rt_token');
    localStorage.removeItem('rt_user');
    setUser(null);
    navigate('/login');
  }, [navigate]);

  const updateUser = useCallback((patch) => {
    setUser(prev => {
      const next = { ...prev, ...patch };
      localStorage.setItem('rt_user', JSON.stringify(next));
      return next;
    });
  }, []);

  const isAuth = !!localStorage.getItem('rt_token');

  return (
    <AuthCtx.Provider value={{ user, isAuth, login, register, logout, updateUser }}>
      {children}
    </AuthCtx.Provider>
  );
}
