import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import PageHeader from '../components/PageHeader';
import DonutChart from '../components/DonutChart';
import { reviews } from '../data/mockData';

const momentum = [
  { date: '24/Aug', reviews: 2, rating: 3.6 },
  { date: '02/Sep', reviews: 3, rating: 3.4 },
  { date: '14/Sep', reviews: 5, rating: 4.1 },
  { date: '25/Sep', reviews: 4, rating: 3.8 },
  { date: '04/Oct', reviews: 6, rating: 3.9 },
  { date: '13/Oct', reviews: 8, rating: 4.3 },
];

export default function ReputationPage() {
  const total = reviews.length;
  const positive = reviews.filter((r) => r.sentiment === 'positive').length;
  const neutral = reviews.filter((r) => r.sentiment === 'neutral').length;
  const negative = reviews.filter((r) => r.sentiment === 'negative').length;
  const avgRating = (reviews.reduce((s, r) => s + r.rating, 0) / total).toFixed(2);

  const sourceCounts = reviews.reduce<Record<string, number>>((acc, r) => {
    acc[r.source] = (acc[r.source] || 0) + 1;
    return acc;
  }, {});
  const maxSource = Math.max(...Object.values(sourceCounts));

  const sentimentData = [
    { name: 'Positive', value: positive, color: '#34d399' },
    { name: 'Neutral', value: neutral, color: '#fbbf24' },
    { name: 'Negative', value: negative, color: '#f87171' },
  ];

  return (
    <div>
      <PageHeader
        title="Reputation & NPS Score"
        subtitle="Sentiment distribution, channel mix, and review momentum over time"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="glass-card rounded-3xl p-4 flex flex-col items-center">
          <p className="self-start text-[11px] font-semibold tracking-wide text-gray-400 mb-3">SENTIMENT DISTRIBUTION</p>
          <DonutChart data={sentimentData} centerValue="" centerLabel="" />
          <div className="flex items-center gap-3 mt-3 text-[11px] text-gray-400">
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-400" /> Positive</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-400" /> Neutral</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-400" /> Negative</span>
          </div>
        </div>

        <div className="glass-card rounded-3xl p-4">
          <p className="text-[11px] font-semibold tracking-wide text-gray-400 mb-4">REVIEWS BY CHANNEL</p>
          <div className="space-y-3.5">
            {Object.entries(sourceCounts).map(([name, count]) => (
              <div key={name}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-300">{name}</span>
                  <span className="text-xs text-gray-500">{count}</span>
                </div>
                <div className="h-2 rounded-full bg-black/40 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-emerald-500"
                    style={{ width: `${(count / maxSource) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card rounded-3xl p-4 flex flex-col items-center justify-center text-center">
          <p className="text-[11px] font-semibold tracking-wide text-gray-500 mb-3">NET REPUTATION INDEX</p>
          <p className="text-4xl font-bold text-emerald-400">{avgRating}</p>
          <p className="text-xs text-gray-500 mt-2 mb-4">out of 5.0 across {total} reviews</p>
          <div className="w-full h-2 rounded-full bg-gradient-to-r from-red-500 via-amber-400 to-emerald-500 relative">
            <div
              className="absolute -top-1 h-4 w-1.5 bg-white rounded-full shadow"
              style={{ left: `calc(${(Number(avgRating) / 5) * 100}% - 3px)` }}
            />
          </div>
        </div>
      </div>

      <div className="glass-card rounded-3xl p-5">
        <p className="text-sm font-semibold text-white mb-4">Review Momentum & Average Rating</p>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={momentum} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <XAxis dataKey="date" stroke="#4b5563" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis stroke="#4b5563" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ background: '#0d1a13', border: '1px solid #134e3a', borderRadius: 8, fontSize: 12 }}
              labelStyle={{ color: '#9ca3af' }}
            />
            <Line type="monotone" dataKey="reviews" stroke="#60a5fa" strokeWidth={2} dot={{ r: 3 }} name="Reviews" />
            <Line type="monotone" dataKey="rating" stroke="#34d399" strokeWidth={2} dot={{ r: 3 }} name="Avg Rating" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
