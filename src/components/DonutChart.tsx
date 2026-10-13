import { PieChart, Pie, Cell } from 'recharts';

export interface DonutSegment {
  name: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  data: DonutSegment[];
  centerValue: string;
  centerLabel: string;
  size?: number;
}

export default function DonutChart({ data, centerValue, centerLabel, size = 150 }: DonutChartProps) {
  const total = data.reduce((s, d) => s + d.value, 0);
  // an empty donut still renders a faint ring instead of nothing
  const shown = total > 0 ? data : [{ name: 'None', value: 1, color: 'rgba(255,255,255,0.14)' }];
  return (
    <div className="relative" style={{ width: size, height: size }} role="img" aria-label={`${centerLabel}: ${centerValue}`}>
      <PieChart width={size} height={size}>
        <Pie
          data={shown}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={size * 0.34}
          outerRadius={size * 0.48}
          paddingAngle={total > 0 && data.filter((d) => d.value > 0).length > 1 ? 3 : 0}
          cornerRadius={6}
          stroke="none"
          isAnimationActive={false}
        >
          {shown.map((seg, idx) => (
            <Cell key={idx} fill={seg.color} />
          ))}
        </Pie>
      </PieChart>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-[24px] font-light leading-none text-white">{centerValue}</span>
        {centerLabel && <span className="mt-1 text-[10px] uppercase tracking-[0.14em] text-white/60">{centerLabel}</span>}
      </div>
    </div>
  );
}
