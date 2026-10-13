interface SegmentRingProps {
  /** 0–100 */
  value: number;
  size?: number;
  segments?: number;
}

/**
 * Segmented progress ring (as in the reference): rounded dashes that fill
 * clockwise starting from the bottom of the circle.
 */
export default function SegmentRing({ value, size = 104, segments = 12 }: SegmentRingProps) {
  const stroke = 9;
  const r = size / 2 - stroke / 2 - 3;
  const c = size / 2;
  const slot = 360 / segments;
  const gapDeg = 10; // visible gap between dashes
  const capDeg = ((stroke / 2) / r) * (180 / Math.PI); // angle eaten by each round cap
  const segDeg = slot - gapDeg - 2 * capDeg; // path length so that caps + path = visible dash
  const startDeg = 90; // 6 o'clock in SVG space; increasing angle = clockwise

  const point = (deg: number) => {
    const rad = (deg * Math.PI) / 180;
    return { x: c + r * Math.cos(rad), y: c + r * Math.sin(rad) };
  };

  const filled = (value / 100) * segments;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
        {Array.from({ length: segments }).map((_, i) => {
          const a0 = startDeg + i * slot + gapDeg / 2 + capDeg;
          const a1 = a0 + segDeg;
          const p0 = point(a0);
          const p1 = point(a1);
          const coverage = Math.min(1, Math.max(0, filled - i));
          return (
            <g key={i}>
              <path
                d={`M ${p0.x} ${p0.y} A ${r} ${r} 0 0 1 ${p1.x} ${p1.y}`}
                fill="none"
                stroke="rgba(255,255,255,0.16)"
                strokeWidth={stroke}
                strokeLinecap="round"
              />
              {coverage > 0 && (
                <path
                  d={`M ${p0.x} ${p0.y} A ${r} ${r} 0 0 1 ${p1.x} ${p1.y}`}
                  fill="none"
                  stroke="rgba(255,255,255,0.95)"
                  strokeOpacity={0.35 + 0.65 * coverage}
                  strokeWidth={stroke}
                  strokeLinecap="round"
                />
              )}
            </g>
          );
        })}
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="font-display text-[26px] font-light leading-none text-white">
          {value}
          <span className="ml-0.5 inline-block align-top text-[10px] font-normal leading-none text-white/70 mt-1">%</span>
        </span>
      </div>
    </div>
  );
}
