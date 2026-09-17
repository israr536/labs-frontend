import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { LoaderCircle } from 'lucide-react';

type Toast = { id: string; type: 'info' | 'success' | 'error' | 'warn' | 'pending'; message: string };
type ToastApi = { show: (t: Omit<Toast, 'id'>) => string; update: (id: string, t: Partial<Omit<Toast, 'id'>>) => void; dismiss: (id: string) => void };
const ToastContext = createContext<ToastApi | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [activeRequests, setActiveRequests] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onActivity = (event: Event) => {
      const count = Number((event as CustomEvent<{ active?: number }>).detail?.active ?? 0);
      setActiveRequests(Math.max(0, count));
    };
    window.addEventListener('lab:api-activity', onActivity);
    return () => window.removeEventListener('lab:api-activity', onActivity);
  }, []);

  useEffect(() => {
    if (activeRequests > 0) {
      const timer = window.setTimeout(() => setVisible(true), 120);
      return () => window.clearTimeout(timer);
    }
    setVisible(false);
  }, [activeRequests]);

  // Kept as a compatibility API so existing screens do not need functional changes.
  // Notifications are intentionally no longer rendered.
  const show = useCallback((_t: Omit<Toast, 'id'>) => '', []);
  const update = useCallback((_id: string, _t: Partial<Omit<Toast, 'id'>>) => {}, []);
  const dismiss = useCallback((_id: string) => {}, []);

  return (
    <ToastContext.Provider value={{ show, update, dismiss }}>
      {children}
      {visible && (
        <div
          role="status"
          aria-live="polite"
          aria-label="Loading"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            display: 'grid',
            placeItems: 'center',
            pointerEvents: 'none',
            background: 'rgba(255,255,255,.18)',
            backdropFilter: 'blur(1.5px)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 11,
              minWidth: 92,
              padding: '12px 16px',
              border: '1px solid rgba(15,23,42,.08)',
              borderRadius: 14,
              background: 'rgba(255,255,255,.98)',
              boxShadow: '0 8px 28px rgba(15,23,42,.14)',
            }}
          >
            <LoaderCircle size={22} strokeWidth={2.4} style={{ animation: 'lab-global-loader-spin .75s linear infinite' }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: '#344054' }}>Loading…</span>
          </div>
          <style>{`@keyframes lab-global-loader-spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}
    </ToastContext.Provider>
  );
}

export default ToastProvider;
