import { createContext, useCallback, useContext, useState } from 'react';
import Toast from '../components/ui/Toast.jsx';

/**
 * Systeme de notifications "toast" du back office.
 * Usage : const { showToast } = useToast(); showToast('Paramètres sauvegardés');
 */
const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null); // { message } | null

  const showToast = useCallback((message) => {
    setToast({ message });
    window.clearTimeout(showToast._t);
    showToast._t = window.setTimeout(() => setToast(null), 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && <Toast message={toast.message} onClose={() => setToast(null)} />}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast doit être utilisé dans un <ToastProvider>');
  return ctx;
}
