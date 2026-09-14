import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

type Toast = { id: string; type: 'info' | 'success' | 'error' | 'warn' | 'pending'; message: string };

type ToastApi = { show: (t: Omit<Toast, 'id'>) => string; update: (id: string, t: Partial<Omit<Toast, 'id'>>) => void; dismiss: (id: string) => void };
const ToastContext = createContext<ToastApi | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const show = useCallback((t: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).slice(2, 9);
    setToasts((s) => [...s, { id, ...t }]);
    return id;
  }, []);
  const update = useCallback((id: string, t: Partial<Omit<Toast, 'id'>>) => setToasts((s) => s.map((toast) => toast.id === id ? { ...toast, ...t } : toast)), []);
  const dismiss = useCallback((id: string) => setToasts((s) => s.filter((toast) => toast.id !== id)), []);

  useEffect(() => {
    const timers = toasts.filter((t) => t.type !== 'pending').map((t) =>
      window.setTimeout(() => {
        setToasts((s) => s.filter((x) => x.id !== t.id));
      }, 4000),
    );
    return () => timers.forEach((id) => window.clearTimeout(id));
  }, [toasts]);

  return (
    <ToastContext.Provider value={{ show, update, dismiss }}>
      {children}
      <div style={{ position: 'fixed', right: 20, bottom: 20, zIndex: 9999 }}>
        {toasts.map((t) => (
          <div key={t.id} role={t.type === 'error' ? 'alert' : 'status'} aria-live="polite" style={{
            marginBottom: 8,
            minWidth: 310,
            maxWidth: 380,
            padding: '13px 16px',
            borderRadius: 12,
            color: '#172033',
            background: '#ffffff',
            border: '1px solid #e5eaf1',
            borderLeft: `4px solid ${t.type === 'error' ? '#dc2626' : t.type === 'success' ? '#059669' : t.type === 'pending' ? '#d97706' : t.type === 'warn' ? '#ca8a04' : '#2563eb'}`,
            boxShadow: '0 12px 30px rgba(15, 23, 42, 0.12)',
            fontSize: 13,
            lineHeight: 1.45
          }}><strong style={{ display: 'block', marginBottom: 3 }}>{t.type === 'error' ? 'Failed' : t.type === 'success' ? 'Success' : t.type === 'pending' ? 'Pending' : t.type === 'warn' ? 'Warning' : 'Info'}</strong><span>{t.message}</span></div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export default ToastProvider;
