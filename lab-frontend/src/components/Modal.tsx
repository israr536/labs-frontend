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

export default function Modal({
  children,
  onClose,
  title,
  description,
  onConfirm,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDangerous = false,
}: Props) {
  const [loading, setLoading] = React.useState(false);
  const titleId = React.useId();
  const descriptionId = React.useId();

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
    try {
      await onConfirm();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="saas-modal-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !loading) onClose?.();
      }}
    >
      <div
        className="saas-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={description ? descriptionId : undefined}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="saas-modal-header">
          <div className="saas-modal-title-group">
            {title && <h2 id={titleId}>{title}</h2>}
            {description && <p id={descriptionId}>{description}</p>}
          </div>
          {onClose && (
            <button
              type="button"
              className="saas-modal-close"
              onClick={onClose}
              disabled={loading}
              aria-label="Close dialog"
            >
              <X size={18} strokeWidth={2} />
            </button>
          )}
        </header>

        <section className="saas-modal-content">{children}</section>

        {onConfirm && (
          <footer className="saas-modal-footer">
            <button type="button" className="saas-modal-cancel" onClick={onClose} disabled={loading}>
              {cancelText}
            </button>
            <button
              type="button"
              className={`saas-modal-confirm${isDangerous ? ' saas-modal-danger' : ''}`}
              onClick={handleConfirm}
              disabled={loading}
            >
              {loading ? 'Please wait…' : confirmText}
            </button>
          </footer>
        )}
      </div>

      <style>{`
        .saas-modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 2000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          background: rgba(15, 23, 42, 0.48);
          backdrop-filter: blur(7px);
          -webkit-backdrop-filter: blur(7px);
          animation: saas-modal-fade .16s ease-out;
        }

        .saas-modal {
          width: min(100%, 480px);
          max-height: min(720px, calc(100dvh - 48px));
          display: flex;
          flex-direction: column;
          overflow: hidden;
          border: 1px solid var(--saas-border, #e2e8f0);
          border-radius: 18px;
          background: var(--saas-surface, #fff);
          color: var(--saas-text, #0f172a);
          box-shadow: 0 24px 70px rgba(15, 23, 42, 0.20);
          animation: saas-modal-enter .18s ease-out;
        }

        .saas-modal-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
          padding: 20px 22px 17px;
          border-bottom: 1px solid var(--saas-border, #e2e8f0);
        }

        .saas-modal-title-group { min-width: 0; }
        .saas-modal-title-group h2 {
          margin: 0;
          font-size: 18px;
          line-height: 1.35;
          font-weight: 700;
          letter-spacing: -0.02em;
          color: var(--saas-text, #0f172a);
        }
        .saas-modal-title-group p {
          margin: 5px 0 0;
          font-size: 13px;
          line-height: 1.5;
          color: var(--saas-muted, #64748b);
        }

        .saas-modal-close {
          flex: 0 0 34px;
          width: 34px;
          height: 34px;
          display: grid;
          place-items: center;
          margin-top: -3px;
          border: 1px solid var(--saas-border, #e2e8f0);
          border-radius: 9px;
          background: transparent;
          color: var(--saas-muted, #64748b);
          cursor: pointer;
          transition: background .15s ease, color .15s ease, border-color .15s ease;
        }
        .saas-modal-close:hover {
          background: var(--saas-surface-muted, #f8fafc);
          color: var(--saas-text, #0f172a);
          border-color: var(--saas-border-strong, #cbd5e1);
        }

        .saas-modal-content {
          min-height: 0;
          overflow-y: auto;
          padding: 22px;
        }

        .saas-modal-content > *:first-child { margin-top: 0; }
        .saas-modal-content > *:last-child { margin-bottom: 0; }

        .saas-modal-footer {
          display: flex;
          justify-content: flex-end;
          align-items: center;
          gap: 9px;
          padding: 14px 22px;
          border-top: 1px solid var(--saas-border, #e2e8f0);
          background: var(--saas-surface-muted, #f8fafc);
        }

        .saas-modal-cancel,
        .saas-modal-confirm {
          min-height: 38px;
          padding: 0 14px;
          border-radius: 9px;
          font: inherit;
          font-size: 13px;
          font-weight: 650;
          cursor: pointer;
          transition: transform .12s ease, background .15s ease, border-color .15s ease;
        }
        .saas-modal-cancel {
          border: 1px solid var(--saas-border, #e2e8f0);
          background: var(--saas-surface, #fff);
          color: var(--saas-text, #334155);
        }
        .saas-modal-cancel:hover { background: var(--saas-surface-muted, #f8fafc); }
        .saas-modal-confirm {
          border: 1px solid var(--saas-primary, #2563eb);
          background: var(--saas-primary, #2563eb);
          color: #fff;
        }
        .saas-modal-confirm:hover { transform: translateY(-1px); }
        .saas-modal-danger { background: var(--saas-danger, #dc2626); border-color: var(--saas-danger, #dc2626); }
        .saas-modal-cancel:disabled,
        .saas-modal-confirm:disabled,
        .saas-modal-close:disabled { opacity: .55; cursor: not-allowed; transform: none; }

        @keyframes saas-modal-fade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes saas-modal-enter { from { opacity: 0; transform: translateY(7px) scale(.99); } to { opacity: 1; transform: none; } }

        @media (max-width: 560px) {
          .saas-modal-backdrop { align-items: flex-end; padding: 12px; }
          .saas-modal {
            width: 100%;
            max-height: calc(100dvh - 24px);
            border-radius: 16px;
          }
          .saas-modal-header { padding: 17px 18px 15px; }
          .saas-modal-content { padding: 18px; }
          .saas-modal-footer { padding: 13px 18px; }
          .saas-modal-footer > button { flex: 1; }
        }

        @media (prefers-reduced-motion: reduce) {
          .saas-modal-backdrop, .saas-modal { animation: none; }
        }
      `}</style>
    </div>
  );
}
