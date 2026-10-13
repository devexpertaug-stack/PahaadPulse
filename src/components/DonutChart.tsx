import { PieChart, Pie, Cell } from 'recharts';

interface Segment {
  name: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  data: Segment[];
  centerValue: string;
  centerLabel: string;
  size?: number;
}

export default function DonutChart({ data, centerValue, centerLabel, size = 150 }: DonutChartProps) {
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <PieChart width={size} height={size}>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={size * 0.32}
          outerRadius={size * 0.48}
          paddingAngle={2}
          stroke="none"
        >
          {data.map((seg, idx) => (
            <Cell key={idx} fill={seg.color} />
          ))}
        </Pie>
      </PieChart>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-xl font-bold text-white">{centerValue}</span>
        <span className="text-[9px] text-gray-500 uppercase tracking-wide">{centerLabel}</span>
      </div>
    </div>
  );
}
