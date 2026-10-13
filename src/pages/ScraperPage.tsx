import { useState } from 'react';
import { Play, CheckCircle2, Zap } from 'lucide-react';
import PageHeader from '../components/PageHeader';

interface ScraperTarget {
  name: string;
  indexed: number;
  color: string;
}

const targets: ScraperTarget[] = [
  { name: 'Booking.com', indexed: 9, color: 'text-blue-300 border-blue-700/30 bg-blue-500/10' },
  { name: 'Google Reviews', indexed: 8, color: 'text-red-300 border-red-700/30 bg-red-500/10' },
  { name: 'TripAdvisor', indexed: 8, color: 'text-emerald-300 border-emerald-700/30 bg-emerald-500/10' },
];

export default function ScraperPage() {
  const [toggles, setToggles] = useState({ booking: true, google: true, tripadvisor: true, optimise: true });
  const [running, setRunning] = useState(false);
  const [lines, setLines] = useState<string[]>([]);

  const scrapeNow = () => {
    setRunning(true);
    setLines(['$ idle — press "Scrape Web Now" to start a sync...']);
    const steps = [
      '$ Connecting to Booking.com API...',
      '✓ Booking.com: authenticated, pulling latest reviews',
      '✓ Booking.com: 9 reviews indexed (0 new)',
      '$ Connecting to Google Reviews...',
      '✓ Google: fetched 8 reviews via Places API',
      '$ Connecting to TripAdvisor...',
      '✓ TripAdvisor: 8 reviews synced',
      '⚡ Credit optimiser: cached 62% of duplicate requests',
      '✓ Sync complete — 25 reviews indexed across 3 channels',
    ];
    steps.forEach((line, i) => {
      setTimeout(() => {
        setLines((prev) => [...prev, line]);
        if (i === steps.length - 1) setRunning(false);
      }, (i + 1) * 450);
    });
  };

  return (
    <div>
      <PageHeader
        title="Web Scraper & Channels"
        subtitle="Pull guest reviews from Booking.com, Google & TripAdvisor — credit optimised"
        action={
          <button
            onClick={scrapeNow}
            disabled={running}
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 text-black font-semibold text-sm px-4 py-2 rounded-lg transition"
          >
            <Play size={14} />
            {running ? 'Scraping...' : 'Scrape Web Now'}
          </button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {targets.map((t) => (
          <div key={t.name} className="rounded-xl border border-emerald-900/40 bg-[#0b140e]/80 p-4">
            <div className="flex items-center justify-between mb-3">
              <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${t.color}`}>{t.name}</span>
              <span className="flex items-center gap-1 text-[11px] text-emerald-400">
                <CheckCircle2 size={12} /> Connected
              </span>
            </div>
            <p className="text-2xl font-bold text-white">{t.indexed}</p>
            <p className="text-xs text-gray-500 mt-1">reviews indexed</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-xl border border-emerald-900/40 bg-[#0b140e]/80 p-4">
          <p className="text-sm font-semibold text-white mb-4">Scrape Targets</p>
          <div className="space-y-4">
            {[
              { key: 'booking' as const, label: 'Booking.com' },
              { key: 'google' as const, label: 'Google Reviews' },
              { key: 'tripadvisor' as const, label: 'TripAdvisor' },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between">
                <span className="text-sm text-gray-300">{item.label}</span>
                <button
                  onClick={() => setToggles((p) => ({ ...p, [item.key]: !p[item.key] }))}
                  className={`relative h-5 w-9 rounded-full transition ${
                    toggles[item.key] ? 'bg-emerald-500' : 'bg-gray-700'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition ${
                      toggles[item.key] ? 'left-4.5 translate-x-0.5' : 'left-0.5'
                    }`}
                  />
                </button>
              </div>
            ))}
            <div className="pt-3 border-t border-emerald-900/30">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300 flex items-center gap-1.5">
                  <Zap size={13} className="text-amber-400" /> Optimise API Credits
                </span>
                <button
                  onClick={() => setToggles((p) => ({ ...p, optimise: !p.optimise }))}
                  className={`relative h-5 w-9 rounded-full transition ${
                    toggles.optimise ? 'bg-amber-500' : 'bg-gray-700'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition ${
                      toggles.optimise ? 'left-4.5 translate-x-0.5' : 'left-0.5'
                    }`}
                  />
                </button>
              </div>
              <p className="text-[11px] text-gray-500 mt-1.5">
                Caching & dedupe on — up to 62% fewer credits used
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-emerald-900/40 bg-[#0b140e]/80 p-4">
          <p className="text-sm font-semibold text-white mb-3">Live Scraper Console</p>
          <div className="rounded-lg bg-black/60 border border-emerald-900/30 p-3 h-56 overflow-y-auto font-mono text-[11px] text-emerald-300 leading-relaxed">
            {lines.length === 0 && (
              <p className="text-gray-500">$ idle — press "Scrape Web Now" to start a sync...</p>
            )}
            {lines.map((line, i) => (
              <p key={i} className={line.startsWith('✓') ? 'text-emerald-400' : line.startsWith('⚡') ? 'text-amber-400' : 'text-gray-300'}>
                {line}
              </p>
            ))}
            {running && <span className="cursor-blink text-emerald-400">▋</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
