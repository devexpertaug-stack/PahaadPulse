interface SwitchProps {
  on: boolean;
  onChange: (next: boolean) => void;
  label: string;
  disabled?: boolean;
}

export default function Switch({ on, onChange, label, disabled }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!on)}
      className={`relative h-[26px] w-[46px] shrink-0 rounded-full border transition disabled:cursor-not-allowed disabled:opacity-40 ${
        on ? 'border-white/30 bg-white/35' : 'border-white/10 bg-black/30'
      }`}
    >
      <span
        className={`absolute top-[2px] h-[20px] w-[20px] rounded-full bg-white shadow transition-all duration-200 ${
          on ? 'left-[22px]' : 'left-[2px] opacity-70'
        }`}
      />
    </button>
  );
}
