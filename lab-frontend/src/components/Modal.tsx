import React from 'react';

type Props = {
  children: React.ReactNode;
  onClose?: () => void;
  title?: string;
  onConfirm?: () => void | Promise<void>;
  confirmText?: string;
  cancelText?: string;
  isDangerous?: boolean;
};

export default function Modal({
  children,
  onClose,
  title,
  onConfirm,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDangerous = false,
}: Props) {
  const [loading, setLoading] = React.useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm?.();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal-panel">
        <div className="modal-header">
          {title ? <h3>{title}</h3> : null}
          <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <div className="modal-body">{children}</div>
        {onConfirm && (
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose} disabled={loading}>
              {cancelText}
            </button>
            <button
              className={`btn ${isDangerous ? 'btn-danger' : 'btn-primary'}`}
              onClick={handleConfirm}
              disabled={loading}
            >
              {loading ? 'Loading...' : confirmText}
            </button>
          </div>
        )}
      </div>

      <style>{`
        .modal-overlay {
          position: fixed;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(2,6,23,0.48);
          z-index: 400;
          padding: 20px;
        }
        .modal-panel {
          width: fit-content;
          max-width: calc(100vw - 40px);
          border-radius: 8px;
          overflow: hidden;
          background: linear-gradient(180deg, rgba(255,255,255,0.98), rgba(250,251,255,0.98));
          box-shadow: 0 40px 120px rgba(2,6,23,0.28);
          position: relative;
        }
        .modal-header { display:flex; align-items:center; justify-content:space-between; padding:12px 18px; border-bottom:1px solid rgba(0,0,0,0.04); }
        .modal-header h3 { margin: 0; }
        .modal-close { background:transparent; border:none; font-size:18px; cursor:pointer; padding:6px 8px; }
        .modal-body {
          padding: 18px;
          max-width: calc(100vw - 40px);
          max-height: calc(100vh - 96px);
          overflow: auto;
        }
        .modal-footer {
          display: flex;
          gap: 12px;
          padding: 12px 18px;
          border-top: 1px solid rgba(0,0,0,0.04);
          justify-content: flex-end;
        }
        .btn-danger { background: #dc2626; color: white; }
        @media (max-width: 640px) {
          .modal-overlay { padding: 12px; align-items: flex-start; }
          .modal-panel,
          .modal-body { max-width: calc(100vw - 24px); }
        }
      `}</style>
    </div>
  );
}
