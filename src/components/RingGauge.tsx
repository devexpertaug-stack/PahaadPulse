interface RingGaugeProps {
  value: number; // 0-100 percentage for the arc
  display: string;
  sublabel: string;
  color?: string;
  size?: number;
}

export default function RingGauge({ value, display, sublabel, color = '#ffffff', size = 140 }: RingGaugeProps) {
  const radius = size / 2 - 10;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(100, Math.max(0, value));
  const offset = circumference - (clamped / 100) * circumference;
  const center = size / 2;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="absolute inset-0 -rotate-90" aria-hidden>
        <circle cx={center} cy={center} r={radius} fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth={9} />
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={color}
          strokeOpacity={0.92}
          strokeWidth={9}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-[28px] font-light leading-none text-white">{display}</span>
        <span className="mt-1 px-2 text-center text-[10px] uppercase tracking-[0.14em] text-white/60">{sublabel}</span>
      </div>
    </div>
  );
}
