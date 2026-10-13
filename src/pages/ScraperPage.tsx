import { useMemo, useRef, useState } from 'react';
import { CheckCircle2, Link2, Link2Off, Play, Zap } from 'lucide-react';
import PageHero from '../components/ui/PageHero';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Switch from '../components/ui/Switch';
import { sourceTone } from '../components/ui/tones';
import { useApp } from '../store/AppStore';
import { CREDIT_LIMIT } from '../store/state';
import { CHANNELS } from '../data/seed';
import { channelLabel } from '../lib/metrics';
import { planScrape } from '../lib/scrape';

const IDLE = '$ idle — press “Scrape web now” to start a sync…';

function lineClass(line: string) {
  if (line.startsWith('✓')) return 'text-emerald-200';
  if (line.startsWith('⚡')) return 'text-amber-200';
  if (line.startsWith('!')) return 'text-rose-200';
  if (line.startsWith('   +')) return 'text-emerald-100/70';
  if (line.startsWith('–')) return 'text-white/40';
  return 'text-white/80';
}

export default function ScraperPage() {
  const { state, dispatch, say } = useApp();
  const [running, setRunning] = useState(false);
  const [lines, setLines] = useState<string[]>([]);
  const consoleRef = useRef<HTMLDivElement>(null);

  const indexed = useMemo(() => {
    const m: Record<string, number> = {};
    for (const r of state.reviews) m[r.source] = (m[r.source] ?? 0) + 1;
    return m;
  }, [state.reviews]);

  const creditPct = Math.min(100, Math.round((state.credits / CREDIT_LIMIT) * 100));
  const active = CHANNELS.filter((c) => state.channels[c].connected && state.channels[c].enabled).length;

  const scrapeNow = () => {
    if (running) return;
    const plan = planScrape(state);
    setRunning(true);
    setLines([]);
    plan.lines.forEach((line, i) => {
      setTimeout(() => {
        setLines((prev) => [...prev, line]);
        consoleRef.current?.scrollTo({ top: consoleRef.current.scrollHeight });
        if (i === plan.lines.length - 1) {
          dispatch({
            type: 'scrape/done',
            reviews: plan.reviews,
            cursors: plan.cursors,
            credits: plan.credits,
            stamp: plan.stamp,
            keys: plan.keys,
          });
          setRunning(false);
          say(
            plan.reviews.length
              ? `${plan.reviews.length} new review${plan.reviews.length === 1 ? '' : 's'} indexed and categorised`
              : plan.keys.length
                ? 'Everything is already up to date'
                : 'No channels were synced',
            plan.reviews.length ? { label: 'Open reviews', to: '/app/reviews' } : undefined,
          );
        }
      }, (i + 1) * 320);
    });
  };

  return (
    <div className="animate-fade-in">
      <PageHero
        title="Web Scraper & Channels"
        subtitle="Pull fresh reviews from the booking channels you connect — with a credit optimiser so you only pay for what changed."
        actions={
          <button onClick={scrapeNow} disabled={running} className="btn-primary">
            <Play size={15} />
            {running ? 'Scraping…' : 'Scrape web now'}
          </button>
        }
      />

      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {CHANNELS.map((ch) => {
          const st = state.channels[ch];
          return (
            <div key={ch} className="glass-tile flex min-w-0 flex-col rounded-[26px] p-5" data-testid={`channel-${ch}`}>
              <div className="mb-4 flex items-center justify-between gap-2">
                <Badge tone={sourceTone[ch]}>{channelLabel[ch]}</Badge>
                <span
                  className={`flex items-center gap-1 text-[11.5px] ${st.connected ? 'text-emerald-100' : 'text-white/55'}`}
                >
                  {st.connected ? <CheckCircle2 size={13} /> : <Link2Off size={13} />}
                  {st.connected ? 'Connected' : 'Not connected'}
                </span>
              </div>
              <p className="font-display text-[34px] font-light leading-none text-white">{indexed[ch] ?? 0}</p>
              <p className="mt-1 text-[12px] text-white/65">reviews indexed</p>
              <p className="mt-3 text-[11.5px] text-white/50">
                {st.connected && st.lastSync ? `Last sync ${st.lastSync}` : 'Connect to start syncing'}
              </p>
              <div className="mt-4 flex items-center justify-between gap-2 border-t border-white/10 pt-4">
                <button
                  onClick={() => {
                    dispatch({ type: 'channel/connect', key: ch, on: !st.connected });
                    say(st.connected ? `${channelLabel[ch]} disconnected` : `${channelLabel[ch]} connected`);
                  }}
                  className="btn-glass btn-sm"
                >
                  {st.connected ? <Link2Off size={13} /> : <Link2 size={13} />}
                  {st.connected ? 'Disconnect' : 'Connect'}
                </button>
                <div className="flex items-center gap-2">
                  <span className="text-[11.5px] text-white/60">Sync</span>
                  <Switch
                    on={st.enabled}
                    disabled={!st.connected}
                    label={`Include ${channelLabel[ch]} in sync`}
                    onChange={(on) => dispatch({ type: 'channel/enable', key: ch, on })}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <Card title="Credit optimiser" eyebrow="API usage">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="flex items-center gap-1.5 text-[14px] text-white/90">
                <Zap size={14} className="text-amber-200" /> Optimise API credits
              </p>
              <p className="mt-1 text-[12.5px] leading-relaxed text-white/60">
                Caches unchanged reviews and skips duplicates, so each channel costs {state.optimiseCredits ? 8 : 20}{' '}
                credits per sync instead of {state.optimiseCredits ? 20 : 8}.
              </p>
            </div>
            <Switch
              on={state.optimiseCredits}
              label="Optimise API credits"
              onChange={(value) => dispatch({ type: 'pref', key: 'optimiseCredits', value })}
            />
          </div>

          <div className="mt-6">
            <div className="mb-2 flex items-baseline justify-between text-[13px]">
              <span className="text-white/75">Credits used this month</span>
              <span className="tabular-nums text-white">
                {state.credits} <span className="text-white/50">/ {CREDIT_LIMIT}</span>
              </span>
            </div>
            <div
              className="h-2.5 overflow-hidden rounded-full bg-black/35"
              role="progressbar"
              aria-valuenow={state.credits}
              aria-valuemin={0}
              aria-valuemax={CREDIT_LIMIT}
              aria-label="Credits used"
            >
              <div
                className={`h-full rounded-full transition-all duration-500 ${creditPct > 85 ? 'bg-rose-200/80' : 'bg-white/70'}`}
                style={{ width: `${creditPct}%` }}
              />
            </div>
            <p className="mt-3 text-[12px] text-white/55">
              {active} of {CHANNELS.length} channels will be included in the next sync.
            </p>
          </div>
        </Card>

        <Card title="Live scraper console" eyebrow="Sync log">
          <div
            ref={consoleRef}
            data-testid="console"
            className="h-64 overflow-y-auto rounded-2xl border border-white/10 bg-black/35 p-4 font-mono text-[12px] leading-relaxed"
          >
            {lines.length === 0 && <p className="text-white/45">{IDLE}</p>}
            {lines.map((line, i) => (
              <p key={i} className={`whitespace-pre-wrap break-words ${lineClass(line)}`}>
                {line}
              </p>
            ))}
            {running && <span className="cursor-blink text-emerald-200">▋</span>}
          </div>
        </Card>
      </div>
    </div>
  );
}
