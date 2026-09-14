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
    if (!toasts.length) return;
    const timers = toasts.map((t) =>
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
          <div key={t.id} style={{
            marginBottom: 8,
            minWidth: 260,
            padding: '10px 12px',
            borderRadius: 8,
            color: 'white',
            background: t.type === 'error' ? 'rgba(220,38,38,0.95)' : t.type === 'success' ? 'rgba(16,185,129,0.95)' : t.type === 'pending' ? 'rgba(245,158,11,0.95)' : 'rgba(45,55,72,0.95)',
            boxShadow: '0 6px 20px rgba(2,6,23,0.2)'
          }}><strong style={{ display: 'block', marginBottom: 3 }}>{t.type === 'error' ? 'Failed' : t.type === 'success' ? 'Success' : t.type === 'pending' ? 'Pending' : t.type === 'warn' ? 'Warning' : 'Info'}</strong><span>{t.message}</span></div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export default ToastProvider;
