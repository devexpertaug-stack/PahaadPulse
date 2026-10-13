import { Check, X } from 'lucide-react';

interface XCToggleProps {
  on: boolean;
  onChange: (next: boolean) => void;
  label: string;
}

/** ✕ / ✓ pill switch from the reference. The lighter knob slides under the active icon. */
export default function XCToggle({ on, onChange, label }: XCToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => onChange(!on)}
      className="relative h-[46px] w-[104px] shrink-0 rounded-full border border-white/10 bg-black/30 shadow-[inset_0_2px_6px_rgba(0,0,0,0.35)] transition"
    >
      <span
        className={`absolute top-[3px] h-[38px] w-[50px] rounded-full bg-white/25 shadow-[inset_0_1px_0_rgba(255,255,255,0.25)] transition-all duration-300 ${
          on ? 'left-[48px]' : 'left-[3px]'
        }`}
      />
      <span className="absolute inset-0 grid grid-cols-2 place-items-center">
        <X size={16} strokeWidth={1.8} className={on ? 'text-white/55' : 'text-white'} />
        <Check size={17} strokeWidth={1.8} className={on ? 'text-white' : 'text-white/55'} />
      </span>
    </button>
  );
}
