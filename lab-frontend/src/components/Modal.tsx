import React from 'react';
import { X } from 'lucide-react';

type Props = {
  children: React.ReactNode;
  onClose?: () => void;
  title?: string;
  description?: string;
  onConfirm?: () => void | Promise<void>;
  confirmText?: string;
  cancelText?: string;
  isDangerous?: boolean;
};

export default function Modal({ children, onClose, title, description, onConfirm, confirmText = 'Confirm', cancelText = 'Cancel', isDangerous = false }: Props) {
  const [loading, setLoading] = React.useState(false);
  const titleId = React.useId();

  React.useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !loading) onClose?.();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [loading, onClose]);

  const handleConfirm = async () => {
    if (!onConfirm || loading) return;
    setLoading(true);
    try { await onConfirm(); } finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby={title ? titleId : undefined} onMouseDown={(event) => { if (event.target === event.currentTarget && !loading) onClose?.(); }}>
      <div className="modal-panel" onMouseDown={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-heading">
            {title && <h2 id={titleId}>{title}</h2>}
            {description && <p>{description}</p>}
          </div>
          {onClose && <button type="button" className="modal-close" onClick={onClose} disabled={loading} aria-label="Close dialog"><X size={19} /></button>}
        </div>
        <div className="modal-body">{children}</div>
        {onConfirm && <div className="modal-footer">
          <button type="button" className="modal-cancel" onClick={onClose} disabled={loading}>{cancelText}</button>
          <button type="button" className={`modal-confirm ${isDangerous ? 'danger' : ''}`} onClick={handleConfirm} disabled={loading}>{loading ? 'Please wait…' : confirmText}</button>
        </div>}
      </div>
      <style>{`
        .modal-overlay{position:fixed;inset:0;z-index:1000;display:grid;place-items:center;padding:20px;background:rgba(15,23,42,.56);backdrop-filter:blur(10px);animation:modal-fade .18s ease}
        .modal-panel{width:min(560px,calc(100vw - 32px));max-height:min(760px,calc(100vh - 32px));display:flex;flex-direction:column;overflow:hidden;background:var(--panel-bg,#fff);border:1px solid var(--border,#e2e8f0);border-radius:24px;box-shadow:0 32px 100px rgba(15,23,42,.25);animation:modal-rise .2s ease}
        .modal-header{display:flex;justify-content:space-between;gap:18px;padding:20px 22px;border-bottom:1px solid var(--border,#e2e8f0);background:var(--panel-bg,#fff)}
        .modal-heading h2{margin:0;color:var(--text-bold);font-size:1.15rem;letter-spacing:-.02em}.modal-heading p{margin:5px 0 0;color:var(--text);font-size:.75rem;line-height:1.55}
        .modal-close{width:36px;height:36px;flex:0 0 36px;display:grid;place-items:center;border:1px solid var(--border);background:transparent;color:var(--text);border-radius:11px;cursor:pointer}.modal-close:hover{background:var(--primary-light)}.modal-close:disabled{opacity:.5;cursor:not-allowed}
        .modal-body{padding:22px;overflow:auto}.modal-footer{display:flex;justify-content:flex-end;gap:10px;padding:16px 22px;border-top:1px solid var(--border);background:var(--surface,#f8fafc)}
        .modal-cancel,.modal-confirm{min-height:40px;padding:0 15px;border-radius:10px;font-size:.74rem;font-weight:800;cursor:pointer}.modal-cancel{border:1px solid var(--border);background:var(--panel-bg);color:var(--text-bold)}.modal-confirm{border:1px solid var(--primary);background:var(--primary);color:#fff}.modal-confirm.danger{background:var(--danger,#dc2626);border-color:var(--danger,#dc2626)}button:disabled{cursor:not-allowed;opacity:.65}
        @keyframes modal-fade{from{opacity:0}to{opacity:1}}@keyframes modal-rise{from{opacity:0;transform:translateY(10px) scale(.985)}to{opacity:1;transform:none}}
        @media(max-width:560px){.modal-overlay{padding:10px;align-items:end}.modal-panel{width:100%;max-height:calc(100vh - 20px);border-radius:22px}.modal-body{padding:18px}.modal-footer{padding:14px 18px}.modal-cancel,.modal-confirm{flex:1}}
      `}</style>
    </div>
  );
}
