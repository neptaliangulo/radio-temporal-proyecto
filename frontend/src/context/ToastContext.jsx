import { createContext, useContext, useState, useCallback } from 'react';

const ToastCtx = createContext(null);
export const useToast = () => useContext(ToastCtx);

export function ToastProvider({ children }) {
  const [msg, setMsg] = useState('');
  const [show, setShow] = useState(false);

  const toast = useCallback((m, ms = 2500) => {
    setMsg(m);
    setShow(true);
    clearTimeout(window.__rtToastTimer);
    window.__rtToastTimer = setTimeout(() => setShow(false), ms);
  }, []);

  return (
    <ToastCtx.Provider value={toast}>
      {children}
      <div className={`toast ${show ? 'show' : ''}`}>{msg}</div>
    </ToastCtx.Provider>
  );
}
