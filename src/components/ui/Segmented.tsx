interface Option<T extends string> {
  key: T;
  label: string;
  count?: number;
}

interface SegmentedProps<T extends string> {
  value: T;
  onChange: (v: T) => void;
  options: Option<T>[];
  label: string;
}

/** Row of pill filters, same look as the Overview department filter. */
export default function Segmented<T extends string>({ value, onChange, options, label }: SegmentedProps<T>) {
  return (
    <div role="group" aria-label={label} className="scrollbar-none -mx-1 flex min-w-0 items-center gap-1 overflow-x-auto px-1 py-0.5">
      {options.map((o) => (
        <button
          key={o.key}
          type="button"
          onClick={() => onChange(o.key)}
          aria-pressed={value === o.key}
          className={`whitespace-nowrap rounded-full px-4 py-2 text-[13.5px] transition ${
            value === o.key
              ? 'bg-white/[0.2] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.22)]'
              : 'text-white/75 hover:bg-white/10 hover:text-white'
          }`}
        >
          {o.label}
          {o.count !== undefined && <span className="ml-1.5 text-[11.5px] text-white/50">{o.count}</span>}
        </button>
      ))}
    </div>
  );
}
