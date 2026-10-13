import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string;
  sub: string;
  icon: LucideIcon;
  accent?: 'emerald' | 'red' | 'amber' | 'blue';
}

const accentMap = {
  emerald: 'text-emerald-400',
  red: 'text-red-400',
  amber: 'text-amber-400',
  blue: 'text-blue-400',
};

export default function StatCard({ label, value, sub, icon: Icon, accent = 'emerald' }: StatCardProps) {
  return (
    <div className="rounded-xl border border-emerald-900/40 bg-[#0b140e]/80 p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-semibold tracking-wide text-gray-400 flex items-center gap-1.5">
          <span className={`h-1.5 w-1.5 rounded-full bg-current ${accentMap[accent]}`} />
          {label.toUpperCase()}
        </span>
        <Icon size={15} className={accentMap[accent]} />
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-xs text-gray-500 mt-1">{sub}</p>
    </div>
  );
}
