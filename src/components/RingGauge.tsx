interface RingGaugeProps {
  value: number; // 0-100 percentage for the arc
  display: string;
  sublabel: string;
  color?: string;
  size?: number;
}

export default function RingGauge({ value, display, sublabel, color = '#34d399', size = 140 }: RingGaugeProps) {
  const radius = size / 2 - 10;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  const center = size / 2;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90 absolute inset-0">
        <circle cx={center} cy={center} r={radius} fill="none" stroke="#132019" strokeWidth={10} />
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={10}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-white">{display}</span>
        <span className="text-[10px] text-gray-500 uppercase tracking-wide mt-0.5 text-center px-2">{sublabel}</span>
      </div>
    </div>
  );
}
