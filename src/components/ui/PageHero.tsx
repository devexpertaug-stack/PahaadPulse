import type { ReactNode } from 'react';

interface PageHeroProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

/** Page heading in the same light Lexend style as the Overview hero. */
export default function PageHero({ title, subtitle, actions }: PageHeroProps) {
  return (
    <div className="mb-7 flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
      <div className="min-w-0">
        <h1 className="font-display text-[34px] font-light leading-[1.12] tracking-[0.04em] text-white sm:text-[44px]">
          {title}
        </h1>
        {subtitle && <p className="mt-2 max-w-[640px] text-[14.5px] leading-relaxed text-white/70">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2.5">{actions}</div>}
    </div>
  );
}
