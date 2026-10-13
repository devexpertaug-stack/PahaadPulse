import { useMemo } from 'react';
import { Bar, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Star, ThumbsDown, ThumbsUp, TrendingUp } from 'lucide-react';
import PageHero from '../components/ui/PageHero';
import Card from '../components/ui/Card';
import Stat, { StatGrid } from '../components/ui/Stat';
import DonutChart from '../components/DonutChart';
import { sourceTone, toneHex } from '../components/ui/tones';
import { useApp } from '../store/AppStore';
import { TOPICS, TOPIC_KEYS } from '../lib/analysis';
import { channelCounts, weeklyMomentum } from '../lib/metrics';

function TopicBars({ kind }: { kind: 'positive' | 'negative' }) {
  const { risk } = useApp();
  const rows = TOPIC_KEYS.map((k) => ({ key: k, n: risk.topics[k][kind] }))
    .filter((r) => r.n > 0)
    .sort((a, b) => b.n - a.n)
    .slice(0, 5);
  const max = Math.max(1, ...rows.map((r) => r.n));
  const color = kind === 'positive' ? toneHex.emerald : toneHex.rose;
  if (rows.length === 0) return <p className="py-4 text-[13px] text-white/55">Nothing here yet.</p>;
  return (
    <ul className="space-y-3.5">
      {rows.map((r) => (
        <li key={r.key}>
          <div className="mb-1.5 flex items-baseline justify-between text-[13.5px]">
            <span className="text-white/85">{TOPICS[r.key].short}</span>
            <span className="tabular-nums text-white/60">{r.n}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-black/35">
            <div className="h-full rounded-full opacity-90 transition-all duration-500" style={{ width: `${(r.n / max) * 100}%`, background: color }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

export default function ReputationPage() {
  const { state, rep } = useApp();
  const channels = useMemo(() => channelCounts(state.reviews), [state.reviews]);
  const momentum = useMemo(() => weeklyMomentum(state.reviews, 8), [state.reviews]);
  const maxChannel = Math.max(1, ...channels.map((c) => c.count));

  const promoters = state.reviews.filter((r) => r.rating === 5).length;
  const detractors = state.reviews.filter((r) => r.rating <= 3).length;
  const pct = (n: number) => (rep.count ? Math.round((n / rep.count) * 100) : 0);

  const sentimentData = [
    { name: 'Positive', value: rep.positive, color: toneHex.emerald },
    { name: 'Neutral', value: rep.neutral, color: toneHex.amber },
    { name: 'Negative', value: rep.negative, color: toneHex.rose },
  ];

  const tick = { fill: 'rgba(255,255,255,0.55)', fontSize: 11.5 };

  return (
    <div className="animate-fade-in">
      <PageHero
        title="Reputation & NPS"
        subtitle="How guests feel about you overall, which channels carry your name, and how it is trending week by week."
      />

      <StatGrid>
        <Stat label="Reputation index" value={`${rep.avg.toFixed(2)} / 5`} sub={`${rep.count} reviews`} icon={TrendingUp} />
        <Stat label="Star-NPS" value={`${rep.nps > 0 ? '+' : ''}${rep.nps}`} sub="5★ share minus 3★ and below" icon={Star} />
        <Stat label="Promoters (5★)" value={`${pct(promoters)}%`} sub={`${promoters} guests`} icon={ThumbsUp} />
        <Stat label="Detractors (≤3★)" value={`${pct(detractors)}%`} sub={`${detractors} guests`} icon={ThumbsDown} alert={pct(detractors) > 40} />
      </StatGrid>

      <div className="mb-5 grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card eyebrow="Sentiment distribution" className="flex flex-col items-center">
          <DonutChart data={sentimentData} centerValue={`${rep.positivePct}%`} centerLabel="Positive" />
          <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[12px] text-white/70">
            {sentimentData.map((d) => (
              <span key={d.name} className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full" style={{ background: d.color }} /> {d.name} {d.value}
              </span>
            ))}
          </div>
        </Card>

        <Card eyebrow="Reviews by channel">
          <ul className="space-y-4">
            {channels.map((c) => (
              <li key={c.name}>
                <div className="mb-1.5 flex items-baseline justify-between text-[13.5px]">
                  <span className="text-white/85">{c.name}</span>
                  <span className="tabular-nums text-white/60">
                    {c.count} · {c.avg.toFixed(1)}★
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-black/35">
                  <div
                    className="h-full rounded-full opacity-90 transition-all duration-500"
                    style={{ width: `${(c.count / maxChannel) * 100}%`, background: toneHex[sourceTone[c.name] ?? 'slate'] }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </Card>

        <Card eyebrow="Net reputation index" className="flex flex-col justify-center text-center">
          <p className="font-display text-[56px] font-light leading-none text-white">{rep.avg.toFixed(2)}</p>
          <p className="mb-6 mt-2 text-[12.5px] text-white/60">out of 5.0 across {rep.count} reviews</p>
          <div className="relative mx-2 h-2 rounded-full bg-gradient-to-r from-rose-300/70 via-amber-200/70 to-emerald-300/70">
            <div
              className="absolute -top-1.5 h-5 w-1.5 -translate-x-1/2 rounded-full bg-white shadow-lg transition-all duration-500"
              style={{ left: `${(rep.avg / 5) * 100}%` }}
              aria-hidden
            />
          </div>
          <div className="mx-2 mt-2 flex justify-between text-[11px] text-white/45">
            <span>1</span>
            <span>5</span>
          </div>
        </Card>
      </div>

      <Card eyebrow="Last 8 weeks" title="Review momentum & reputation trend" className="mb-5">
        <div className="h-[280px] w-full" data-testid="momentum-chart">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={momentum} margin={{ top: 10, right: 6, left: -18, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.08)" />
              <XAxis dataKey="label" tick={tick} axisLine={false} tickLine={false} />
              <YAxis yAxisId="left" allowDecimals={false} tick={tick} axisLine={false} tickLine={false} />
              <YAxis yAxisId="right" orientation="right" domain={[1, 5]} tick={tick} axisLine={false} tickLine={false} />
              <Tooltip
                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                contentStyle={{
                  background: 'rgba(18,28,22,0.94)',
                  border: '1px solid rgba(255,255,255,0.14)',
                  borderRadius: 14,
                  fontSize: 12.5,
                }}
                labelStyle={{ color: 'rgba(255,255,255,0.7)' }}
                itemStyle={{ color: '#fff' }}
                labelFormatter={(l) => `Week of ${l}`}
              />
              <Bar yAxisId="left" dataKey="reviews" name="New reviews" fill="rgba(255,255,255,0.28)" radius={[8, 8, 0, 0]} maxBarSize={34} />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="index"
                name="Reputation index"
                stroke={toneHex.emerald}
                strokeWidth={2.2}
                dot={{ r: 3.5, fill: toneHex.emerald, strokeWidth: 0 }}
                connectNulls
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-[12px] text-white/65">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-3 rounded-sm bg-white/30" /> New reviews per week
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-0.5 w-4 rounded" style={{ background: toneHex.emerald }} /> Running reputation index
          </span>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <Card eyebrow="Guests keep praising" title="Strengths">
          <TopicBars kind="positive" />
        </Card>
        <Card eyebrow="Guests keep raising" title="Pain points">
          <TopicBars kind="negative" />
        </Card>
      </div>
    </div>
  );
}
