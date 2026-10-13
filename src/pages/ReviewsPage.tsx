import { useState } from 'react';
import { MessageSquare, Smile, AlertTriangle, TrendingUp, Sparkles, Star, BadgeCheck } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import DonutChart from '../components/DonutChart';
import RingGauge from '../components/RingGauge';
import { reviews as initialReviews } from '../data/mockData';
import type { Review, Sentiment } from '../types';

const sentimentStyle: Record<Sentiment, string> = {
  positive: 'text-emerald-400 bg-emerald-500/10 border-emerald-700/30',
  neutral: 'text-amber-400 bg-amber-500/10 border-amber-700/30',
  negative: 'text-red-400 bg-red-500/10 border-red-700/30',
};

const sourceStyle: Record<string, string> = {
  'Booking.com': 'bg-blue-500/15 text-blue-300 border-blue-700/30',
  Google: 'bg-red-500/15 text-red-300 border-red-700/30',
  TripAdvisor: 'bg-emerald-500/15 text-emerald-300 border-emerald-700/30',
  Goibibo: 'bg-orange-500/15 text-orange-300 border-orange-700/30',
  Manual: 'bg-gray-500/15 text-gray-300 border-gray-700/30',
};

function ReviewCard({ review }: { review: Review }) {
  const [showReply, setShowReply] = useState(!!review.aiReply);
  const [reply, setReply] = useState(review.aiReply);
  const [regenerating, setRegenerating] = useState(false);

  const regenerate = () => {
    setRegenerating(true);
    setTimeout(() => {
      setReply(
        `Thank you for taking the time to share your feedback about your stay at ${review.roomType ?? 'our resort'}. We truly value your observations and are already working with our team to address the concerns you raised. We hope to welcome you back soon for an even better Himalayan experience.\n\nWarm regards,\nTeam PahaadPulse`
      );
      setShowReply(true);
      setRegenerating(false);
    }, 900);
  };

  return (
    <div className="rounded-xl border border-emerald-900/40 bg-[#0b140e]/80 p-4 flex flex-col animate-fade-in">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${sourceStyle[review.source]}`}>
            {review.source}
          </span>
          {review.verified && (
            <span className="flex items-center gap-1 text-[10px] text-emerald-400">
              <BadgeCheck size={11} /> Verified stay
            </span>
          )}
        </div>
        <div className="flex items-center gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              size={12}
              className={i < review.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-700'}
            />
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between mb-1.5">
        <p className="text-sm font-semibold text-white">{review.guestName}</p>
        <p className="text-[11px] text-gray-500">{review.date}</p>
      </div>
      {review.roomType && <p className="text-[11px] text-gray-500 mb-1.5">{review.roomType}</p>}

      <p className="text-sm text-gray-300 leading-relaxed mb-3">{review.text}</p>

      <div className="flex items-center gap-1.5 flex-wrap mb-3">
        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border capitalize ${sentimentStyle[review.sentiment]}`}>
          {review.sentiment}
        </span>
        {review.tags.map((tag) => (
          <span key={tag} className="text-[10px] text-gray-500 bg-white/5 px-2 py-0.5 rounded-full">
            {tag}
          </span>
        ))}
      </div>

      {showReply && reply && (
        <div className="rounded-lg bg-emerald-500/5 border border-emerald-700/30 p-3 mb-3">
          <p className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400 mb-1.5">
            <Sparkles size={12} /> AI DRAFTED REPLY
          </p>
          <p className="text-xs text-gray-300 leading-relaxed whitespace-pre-line">{reply}</p>
        </div>
      )}

      <div className="mt-auto flex justify-end">
        <button
          onClick={regenerate}
          disabled={regenerating}
          className="flex items-center gap-1.5 text-xs font-medium text-emerald-400 border border-emerald-700/40 rounded-full px-3 py-1.5 hover:bg-emerald-500/10 transition disabled:opacity-60"
        >
          <Sparkles size={12} className={regenerating ? 'animate-pulse' : ''} />
          {regenerating ? 'Generating...' : showReply ? 'Regenerate reply' : 'AI Response'}
        </button>
      </div>
    </div>
  );
}

export default function ReviewsPage() {
  const [reviews] = useState<Review[]>(initialReviews);

  const total = reviews.length;
  const positive = reviews.filter((r) => r.sentiment === 'positive').length;
  const neutral = reviews.filter((r) => r.sentiment === 'neutral').length;
  const negative = reviews.filter((r) => r.sentiment === 'negative').length;
  const positivePct = Math.round((positive / total) * 1000) / 10;
  const avgRating = (reviews.reduce((s, r) => s + r.rating, 0) / total).toFixed(2);
  const highPriority = reviews.filter((r) => r.sentiment === 'negative').length + 1;

  const sourceCounts = reviews.reduce<Record<string, number>>((acc, r) => {
    acc[r.source] = (acc[r.source] || 0) + 1;
    return acc;
  }, {});

  const sentimentData = [
    { name: 'Positive', value: positive, color: '#34d399' },
    { name: 'Neutral', value: neutral, color: '#fbbf24' },
    { name: 'Negative', value: negative, color: '#f87171' },
  ];

  const channelColors: Record<string, string> = {
    'Booking.com': '#60a5fa',
    Google: '#f87171',
    TripAdvisor: '#34d399',
    Manual: '#9ca3af',
    Goibibo: '#fb923c',
  };
  const channelData = Object.entries(sourceCounts).map(([name, value]) => ({
    name,
    value,
    color: channelColors[name] ?? '#9ca3af',
  }));

  return (
    <div>
      <PageHeader
        title="Review Intelligence"
        subtitle="AI-categorised guest reviews scraped across channels for your Himalayan eco-stays"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Reputation Index" value={`${avgRating} / 5`} sub="Across all channels" icon={TrendingUp} />
        <StatCard label="Total Scraped Reviews" value={String(total)} sub="Booking · Google · TripAdvisor" icon={MessageSquare} accent="blue" />
        <StatCard label="Positive Sentiment" value={`${positivePct}%`} sub="Eco-satisfaction score" icon={Smile} />
        <StatCard label="High Priority Alerts" value={`${highPriority} Active`} sub="Needs attention" icon={AlertTriangle} accent="red" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="rounded-xl border border-emerald-900/40 bg-[#0b140e]/80 p-4 flex flex-col items-center">
          <p className="self-start text-[11px] font-semibold tracking-wide text-gray-400 mb-3">SENTIMENT MIX</p>
          <DonutChart data={sentimentData} centerValue={`${positivePct}%`} centerLabel="Positive" />
          <div className="flex items-center gap-3 mt-3 text-[11px] text-gray-400">
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-400" /> Positive</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-400" /> Neutral</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-400" /> Negative</span>
          </div>
        </div>

        <div className="rounded-xl border border-emerald-900/40 bg-[#0b140e]/80 p-4 flex flex-col items-center">
          <p className="self-start text-[11px] font-semibold tracking-wide text-gray-400 mb-3">REPUTATION GAUGE</p>
          <RingGauge value={(Number(avgRating) / 5) * 100} display={avgRating} sublabel="out of 5.0" />
          <p className="text-[11px] text-gray-500 mt-2">Net index across {total} reviews</p>
        </div>

        <div className="rounded-xl border border-emerald-900/40 bg-[#0b140e]/80 p-4 flex flex-col items-center">
          <p className="self-start text-[11px] font-semibold tracking-wide text-gray-400 mb-3">REVIEWS BY CHANNEL</p>
          <DonutChart data={channelData} centerValue={String(total)} centerLabel="Total" />
          <div className="flex items-center gap-2 mt-3 text-[10px] text-gray-400 flex-wrap justify-center">
            {channelData.map((c) => (
              <span key={c.name} className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full" style={{ background: c.color }} /> {c.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>
    </div>
  );
}
