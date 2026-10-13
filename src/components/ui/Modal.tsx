import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
  /** extra classes for the panel (e.g. width) */
  className?: string;
  /** render without the glass chrome (used for the printable invoice) */
  bare?: boolean;
}

export default function Modal({ title, onClose, children, className = 'max-w-[480px]', bare }: ModalProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex overflow-y-auto bg-black/55 p-4 backdrop-blur-sm"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`animate-fade-in m-auto w-full ${className} ${bare ? '' : 'glass-shell rounded-[28px] p-5 sm:p-6'}`}
      >
        {!bare && (
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="font-display text-[20px] font-light tracking-[0.02em] text-white">{title}</h2>
            <button onClick={onClose} className="glass-btn h-10 w-10" aria-label="Close">
              <X size={16} />
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
