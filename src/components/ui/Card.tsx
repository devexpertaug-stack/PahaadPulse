import type { ReactNode } from 'react';

interface CardProps {
  title?: string;
  eyebrow?: string;
  right?: ReactNode;
  children: ReactNode;
  className?: string;
  /** remove inner padding (for lists that bleed to the card edge) */
  flush?: boolean;
}

export default function Card({ title, eyebrow, right, children, className = '', flush }: CardProps) {
  return (
    <section className={`glass-dark min-w-0 rounded-[28px] sm:rounded-[32px] ${flush ? '' : 'p-5 sm:p-6'} ${className}`}>
      {(title || eyebrow || right) && (
        <header className={`flex flex-wrap items-start justify-between gap-x-4 gap-y-3 ${flush ? 'px-5 pt-5 sm:px-6 sm:pt-6' : ''} mb-4`}>
          <div className="min-w-0">
            {eyebrow && <p className="text-[11.5px] uppercase tracking-[0.14em] text-white/55">{eyebrow}</p>}
            {title && <h2 className="font-display text-[18px] font-light tracking-[0.02em] text-white">{title}</h2>}
          </div>
          {right && <div className="min-w-0 max-w-full">{right}</div>}
        </header>
      )}
      {children}
    </section>
  );
}
