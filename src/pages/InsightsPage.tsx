import { useState } from 'react';
import { Sparkles, Plus } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { issueClusters as initialClusters } from '../data/mockData';
import type { IssueCluster, Sentiment } from '../types';

const barColor: Record<Sentiment, string> = {
  positive: 'bg-emerald-500',
  neutral: 'bg-amber-500',
  negative: 'bg-red-500',
};

export default function InsightsPage() {
  const [clusters, setClusters] = useState<IssueCluster[]>(initialClusters);
  const [text, setText] = useState('');
  const [analysing, setAnalysing] = useState(false);
  const [result, setResult] = useState<{ sentiment: Sentiment; cluster: string; impact: string } | null>(null);

  const maxVolume = Math.max(...clusters.map((c) => c.volume));

  const analyse = () => {
    if (!text.trim()) return;
    setAnalysing(true);
    setResult(null);
    setTimeout(() => {
      const lower = text.toLowerCase();
      let sentiment: Sentiment = 'neutral';
      if (/great|love|amazing|incredible|warm|friendly|clean|beautiful/.test(lower)) sentiment = 'positive';
      if (/cold|broken|rude|dirty|slow|bad|terrible|worst|no hot water|leak/.test(lower)) sentiment = 'negative';

      let cluster = 'General Guest Experience';
      if (/water|heater|geyser|solar/.test(lower)) cluster = 'Hot Water & Solar Heating';
      else if (/wifi|internet|network/.test(lower)) cluster = 'Wi-Fi Speed in Valley';
      else if (/food|thali|breakfast|tea/.test(lower)) cluster = 'Local Organic Food & Pahadi Tea';
      else if (/staff|guide|service/.test(lower)) cluster = 'Warm Staff & Local Guides';
      else if (/view|mountain|mist|quiet|silence/.test(lower)) cluster = 'Misty Mountain View & Quietness';

      const impact = sentiment === 'negative' ? 'High — may affect booking conversion' : sentiment === 'positive' ? 'Positive — reinforces brand strength' : 'Low — monitor trend';

      setResult({ sentiment, cluster, impact });
      setClusters((prev) =>
        prev.map((c) => (c.label === cluster ? { ...c, volume: c.volume + 1 } : c))
      );
      setAnalysing(false);
    }, 1100);
  };

  return (
    <div>
      <PageHeader
        title="Issue Clusters & AI Insights"
        subtitle="Recurring themes auto-grouped by Gemini across all scraped reviews"
      />

      <div className="glass-card rounded-3xl p-4 mb-6">
        <p className="flex items-center gap-1.5 text-sm font-semibold text-white mb-3">
          <Sparkles size={15} className="text-emerald-400" /> Analyse a New Review with AI
        </p>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste a guest review here. Gemini will detect sentiment, issue cluster, category & impact, then add it to your intelligence feed..."
          rows={3}
          className="w-full rounded-lg bg-[#0f1c15] border border-emerald-900/50 px-3.5 py-2.5 text-sm text-gray-100 placeholder:text-gray-500 outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/30 transition resize-none"
        />
        <div className="flex justify-end mt-3">
          <button
            onClick={analyse}
            disabled={analysing || !text.trim()}
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black font-semibold text-sm px-4 py-2 rounded-lg transition"
          >
            <Plus size={14} />
            {analysing ? 'Analysing...' : 'Analyse & Categorise'}
          </button>
        </div>

        {result && (
          <div className="mt-4 pt-4 border-t border-emerald-900/30 grid grid-cols-1 sm:grid-cols-3 gap-3 animate-fade-in">
            <div className="rounded-lg bg-white/5 p-3">
              <p className="text-[10px] text-gray-500 uppercase mb-1">Sentiment</p>
              <p className={`text-sm font-semibold capitalize ${
                result.sentiment === 'positive' ? 'text-emerald-400' : result.sentiment === 'negative' ? 'text-red-400' : 'text-amber-400'
              }`}>
                {result.sentiment}
              </p>
            </div>
            <div className="rounded-lg bg-white/5 p-3">
              <p className="text-[10px] text-gray-500 uppercase mb-1">Issue Cluster</p>
              <p className="text-sm font-semibold text-white">{result.cluster}</p>
            </div>
            <div className="rounded-lg bg-white/5 p-3">
              <p className="text-[10px] text-gray-500 uppercase mb-1">Business Impact</p>
              <p className="text-sm font-semibold text-white">{result.impact}</p>
            </div>
          </div>
        )}
      </div>

      <div className="glass-card rounded-3xl p-5">
        <p className="text-sm font-semibold text-white mb-5">Top Issue Clusters by Volume</p>
        <div className="space-y-4">
          {clusters
            .slice()
            .sort((a, b) => b.volume - a.volume)
            .map((c) => (
              <div key={c.label}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm text-gray-300">{c.label}</span>
                  <span className="text-xs text-gray-500">{c.volume}</span>
                </div>
                <div className="h-2.5 rounded-full bg-black/40 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${barColor[c.sentiment]} transition-all duration-500`}
                    style={{ width: `${(c.volume / maxVolume) * 100}%` }}
                  />
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
