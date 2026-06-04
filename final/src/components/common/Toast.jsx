import { useState, createContext, useContext, useCallback } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success', duration = 3500) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration);
  }, []);

  const remove = (id) => setToasts(prev => prev.filter(t => t.id !== id));

  return (
    <ToastContext.Provider value={addToast}>
      {children}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast toast-${t.type}`}>
            {t.type === 'success' && <i className="fi fi-sr-check-circle" />}
            {t.type === 'error'   && <i className="fi fi-rr-cross" />}
            {t.type === 'warning' && <i className="fi fi-rr-exclamation" />}
            {t.type === 'info'    && <i className="fi fi-rr-info" />}
            <span style={{ flex: 1 }}>{t.message}</span>
            <button className="toast-close" onClick={() => remove(t.id)}><i className="fi fi-rr-cross fi-xs" /></button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
