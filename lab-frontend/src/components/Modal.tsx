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
  const dialogRef = React.useRef<HTMLDivElement>(null);
  const previouslyFocused = React.useRef<HTMLElement | null>(null);
  const titleId = React.useId();
  const descriptionId = React.useId();

  React.useEffect(() => {
    previouslyFocused.current = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.setTimeout(() => dialogRef.current?.querySelector<HTMLElement>('button, input, select, textarea, [tabindex]:not([tabindex="-1"])')?.focus(), 0);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !loading) onClose?.();
      if (event.key === 'Tab' && dialogRef.current) {
        const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>('button, input, select, textarea, [href], [tabindex]:not([tabindex="-1"])')).filter((element) => !element.hasAttribute('disabled'));
        if (!focusable.length) return;
        const first = focusable[0]; const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
      previouslyFocused.current?.focus();
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
        ref={dialogRef}
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


    </div>
  );
}
