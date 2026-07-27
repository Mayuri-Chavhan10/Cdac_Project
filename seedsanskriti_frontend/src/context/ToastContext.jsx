import { createContext, useCallback, useMemo, useState } from 'react';

export const ToastContext = createContext(null);

let idCounter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message, variant = 'success', delay = 4000) => {
      const id = ++idCounter;
      setToasts((prev) => [...prev, { id, message, variant }]);
      if (delay > 0) {
        setTimeout(() => removeToast(id), delay);
      }
      return id;
    },
    [removeToast],
  );

  const value = useMemo(
    () => ({
      toasts,
      showToast,
      showSuccess: (msg) => showToast(msg, 'success'),
      showError: (msg) => showToast(msg, 'danger'),
      showInfo: (msg) => showToast(msg, 'info'),
      removeToast,
    }),
    [toasts, showToast, removeToast],
  );

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}
