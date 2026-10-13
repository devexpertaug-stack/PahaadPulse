import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

interface StatProps {
  label: string;
  value: ReactNode;
  sub?: string;
  icon?: LucideIcon;
  /** soft highlight on the tile (used for alerts) */
  alert?: boolean;
}

/** Frosted stat tile, matching the Overview tiles. */
export default function Stat({ label, value, sub, icon: Icon, alert }: StatProps) {
  return (
    <div
      className={`glass-tile flex min-h-[118px] min-w-0 flex-col justify-between rounded-[26px] p-5 ${
        alert ? 'ring-1 ring-rose-200/40' : ''
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="truncate text-[13.5px] text-white/85">{label}</p>
        {Icon && <Icon size={16} strokeWidth={1.6} className="shrink-0 text-white/70" />}
      </div>
      <div>
        <p className="font-display text-[30px] font-light leading-[1.1] text-white">{value}</p>
        {sub && <p className="mt-1 truncate text-[12px] text-white/65">{sub}</p>}
      </div>
    </div>
  );
}

export function StatGrid({ children, cols = 4 }: { children: ReactNode; cols?: 3 | 4 }) {
  return (
    <div
      className={`mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 ${cols === 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3'}`}
    >
      {children}
    </div>
  );
}
