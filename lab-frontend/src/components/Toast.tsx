import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { CheckCircle2, Info, LoaderCircle, X, XCircle } from 'lucide-react';

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
      <style>{'@keyframes toast-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }'}</style>
      <div style={{ position: 'fixed', right: 20, bottom: 20, zIndex: 9999 }}>
        {toasts.map((t) => (
          <div key={t.id} role={t.type === 'error' ? 'alert' : 'status'} aria-live="polite" style={{
            position: 'relative',
            marginBottom: 8,
            minWidth: 330,
            maxWidth: 410,
            padding: '14px 14px 15px',
            borderRadius: 10,
            color: '#172033',
            background: '#ffffff',
            border: '1px solid #e7ebf0',
            boxShadow: '0 8px 24px rgba(15, 23, 42, 0.16)',
            fontSize: 13,
            lineHeight: 1.45
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 11 }}>
              <span style={{ color: t.type === 'error' ? '#d92d20' : t.type === 'success' ? '#07883f' : t.type === 'pending' ? '#b54708' : '#1769aa', marginTop: 1, display: 'inline-flex' }}>
                {t.type === 'error' ? <XCircle size={21} /> : t.type === 'success' ? <CheckCircle2 size={21} /> : t.type === 'pending' ? <LoaderCircle size={21} style={{ animation: 'toast-spin 0.9s linear infinite' }} /> : <Info size={21} />}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}><strong style={{ display: 'block', marginBottom: 2, fontSize: 14, color: '#172033' }}>{t.type === 'error' ? 'Action failed' : t.type === 'success' ? 'Action completed' : t.type === 'pending' ? 'Please wait' : t.type === 'warn' ? 'Attention' : 'Information'}</strong><span style={{ color: '#5b6678' }}>{t.message}</span></div>
              {t.type !== 'pending' && <button type="button" onClick={() => dismiss(t.id)} aria-label="Dismiss notification" style={{ border: 0, background: 'transparent', color: '#8490a3', cursor: 'pointer', padding: 2, lineHeight: 1 }}><X size={16} /></button>}
            </div>
            {t.type !== 'pending' && <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 3, borderRadius: '0 0 10px 10px', background: t.type === 'error' ? '#d92d20' : t.type === 'success' ? '#07883f' : '#1769aa' }} />}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export default ToastProvider;
