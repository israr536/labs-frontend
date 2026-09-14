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
    const timers = toasts.filter((t) => t.type !== 'pending').map((t) => window.setTimeout(() => dismiss(t.id), 3600));
    return () => timers.forEach((id) => window.clearTimeout(id));
  }, [toasts, dismiss]);

  return (
    <ToastContext.Provider value={{ show, update, dismiss }}>
      {children}
      <style>{`
        @keyframes toast-enter { from { opacity: 0; transform: translate(-50%, -14px) scale(.96); } to { opacity: 1; transform: translate(-50%, 0) scale(1); } }
        @keyframes toast-spin { to { transform: rotate(360deg); } }
        @keyframes toast-progress { from { transform: scaleX(1); } to { transform: scaleX(0); } }
      `}</style>
      <div style={{ position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)', zIndex: 99999, width: 'min(calc(100vw - 32px), 460px)', pointerEvents: 'none' }}>
        {toasts.map((t) => {
          const accent = t.type === 'success' ? '#16a34a' : t.type === 'error' ? '#dc2626' : t.type === 'warn' ? '#f59e0b' : '#2563eb';
          const Icon = t.type === 'success' ? CheckCircle2 : t.type === 'error' ? XCircle : t.type === 'pending' ? LoaderCircle : Info;
          const title = t.type === 'success' ? 'Done' : t.type === 'error' ? 'Something went wrong' : t.type === 'pending' ? 'Please wait' : t.type === 'warn' ? 'Attention' : 'Information';
          return (
            <div key={t.id} role={t.type === 'error' ? 'alert' : 'status'} aria-live="polite" style={{ pointerEvents: 'auto', marginBottom: 10, overflow: 'hidden', borderRadius: 16, background: 'rgba(255,255,255,.98)', border: '1px solid rgba(15,23,42,.07)', boxShadow: '0 14px 38px rgba(15,23,42,.16), 0 3px 10px rgba(15,23,42,.08)', backdropFilter: 'blur(12px)', animation: 'toast-enter .22s cubic-bezier(.2,.8,.2,1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 14px' }}>
                <span style={{ width: 34, height: 34, flex: '0 0 34px', display: 'grid', placeItems: 'center', borderRadius: 11, background: `${accent}12`, color: accent }}>
                  <Icon size={19} style={t.type === 'pending' ? { animation: 'toast-spin .75s linear infinite' } : undefined} />
                </span>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, lineHeight: 1.25, color: '#101828' }}>{title}</div>
                  <div style={{ marginTop: 3, fontSize: 12.5, lineHeight: 1.4, color: '#667085' }}>{t.message}</div>
                </div>
                {t.type !== 'pending' && <button type="button" onClick={() => dismiss(t.id)} aria-label="Dismiss notification" style={{ width: 28, height: 28, display: 'grid', placeItems: 'center', border: 0, borderRadius: 9, background: 'transparent', color: '#98a2b3', cursor: 'pointer' }}><X size={16} /></button>}
              </div>
              {t.type !== 'pending' && <div style={{ height: 3, background: `${accent}20` }}><div style={{ height: '100%', width: '100%', background: accent, transformOrigin: 'left', animation: 'toast-progress 3.6s linear forwards' }} /></div>}
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export default ToastProvider;
