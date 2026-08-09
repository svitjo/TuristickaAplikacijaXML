import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const ToastContext = createContext(null);

let toastId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const pushToast = useCallback((type, message, timeout = 4200) => {
    if (!message) return;
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, type, message }]);
    window.setTimeout(() => removeToast(id), timeout);
  }, [removeToast]);

  const value = useMemo(() => ({
    notifySuccess: (message) => pushToast('success', message),
    notifyError: (message) => pushToast('error', message),
    notifyInfo: (message) => pushToast('info', message),
  }), [pushToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-stack" aria-live="polite" aria-atomic="true">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast toast-${toast.type}`}>
            <span>{toast.message}</span>
            <button type="button" className="toast-close" onClick={() => removeToast(toast.id)} aria-label="Zatvori">
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    return {
      notifySuccess: () => {},
      notifyError: () => {},
      notifyInfo: () => {},
    };
  }
  return ctx;
}
