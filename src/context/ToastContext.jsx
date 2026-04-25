import { createContext, useContext, useState, useCallback, useRef } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toast, setToast] = useState({ text: '', type: '', visible: false });
  const timer = useRef(null);

  const show = useCallback((text, type = '') => {
    clearTimeout(timer.current);
    setToast({ text, type, visible: true });
    timer.current = setTimeout(() => setToast(t => ({ ...t, visible: false })), 2400);
  }, []);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div className="toast-container">
        <div className={`toast ${toast.visible ? 'show' : ''} ${toast.type}`}>{toast.text}</div>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be inside ToastProvider');
  return ctx;
}
