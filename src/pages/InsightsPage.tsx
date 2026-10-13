import { useMemo, useState } from 'react';
import { Check, ChevronDown, ClipboardList, IndianRupee, Plus, RotateCcw, Sparkles, Undo2 } from 'lucide-react';
import PageHero from '../components/ui/PageHero';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Stat, { StatGrid } from '../components/ui/Stat';
import { sentimentTone, toneHex } from '../components/ui/tones';
import { useApp } from '../store/AppStore';
import { useActions } from '../store/useActions';
import { analyseCached, ratingFromSentiment, TOPICS, TOPIC_KEYS } from '../lib/analysis';
import type { Analysis } from '../lib/analysis';
import { fmtINR } from '../lib/format';
import type { OperationalTask, TopicKey } from '../types';

const GROUP_ORDER = ['Heating', 'Wi-Fi', 'Service'] as const;

function topicTask(tasks: OperationalTask[], topic: TopicKey) {
  return tasks.find((t) => t.source === 'insight' && t.refId === topic);
}

function ActionControl({ topic, compact }: { topic: TopicKey; compact?: boolean }) {
  const { state, dispatch } = useApp();
  const { raiseInsightTask } = useActions();
  const task = topicTask(state.tasks, topic);

  if (task?.done) {
    return (
      <div className="flex items-center gap-2">
        <Badge tone="emerald">
          <Check size={12} /> Resolved
        </Badge>
        <button onClick={() => dispatch({ type: 'task/toggle', id: task.id })} className="btn-glass btn-sm" aria-label={`Reopen ${TOPICS[topic].short}`}>
          <Undo2 size={13} /> {compact ? '' : 'Reopen'}
        </button>
      </div>
    );
  }
  if (task) {
    return (
      <div className="flex items-center gap-2">
        <Badge tone="amber">On task list</Badge>
        <button onClick={() => dispatch({ type: 'task/toggle', id: task.id })} className="btn-primary btn-sm" aria-label={`Mark ${TOPICS[topic].short} done`}>
          <Check size={13} /> Mark done
        </button>
      </div>
    );
  }
  return (
    <button onClick={() => raiseInsightTask(topic)} className="btn-glass btn-sm" aria-label={`Create task for ${TOPICS[topic].short}`}>
      <ClipboardList size={13} /> Create task
    </button>
  );
}

function Analyser() {
  const { say } = useApp();
  const { addReview, raiseInsightTask } = useActions();
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ text: string; a: Analysis } | null>(null);
  const [added, setAdded] = useState(false);

  const run = () => {
    const t = text.trim();
    if (!t) return;
    setBusy(true);
    setResult(null);
    setAdded(false);
    setTimeout(() => {
      setResult({ text: t, a: analyseCached(t) });
      setBusy(false);
    }, 650);
  };

  const a = result?.a;
  const impactText = !a
    ? ''
    : a.impact > 0
      ? `High — about ₹${fmtINR(a.impact)} of future bookings at risk`
      : a.sentiment === 'positive'
        ? 'Positive — reinforces your brand'
        : 'Low — keep an eye on the trend';

  const addToFeed = () => {
    if (!result || !a) return;
    const review = addReview({ guest: 'Analyser entry', source: 'Manual', rating: ratingFromSentiment(a.sentiment), text: result.text });
    setAdded(true);
    setText('');
    say(`Added to the review feed ${review.tags.length ? `(${review.tags.join(' ')})` : ''}`, {
      label: 'Open reviews',
      to: '/app/reviews',
    });
  };

  return (
    <Card eyebrow="Try it" title="Analyse a new review">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste a guest review. It is read for sentiment, issue clusters, the team that should act, and what it could cost you…"
        rows={3}
        aria-label="Review text to analyse"
        className="field resize-none"
      />
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {[
            'The geyser stopped working and the wifi was very slow, but the staff were lovely.',
            'Absolutely magical views, delicious pahadi food and a very warm host.',
          ].map((s) => (
            <button key={s} onClick={() => setText(s)} className="rounded-full bg-white/[0.08] px-3 py-1 text-[12px] text-white/70 transition hover:bg-white/15 hover:text-white">
              Try: “{s.slice(0, 34)}…”
            </button>
          ))}
        </div>
        <button onClick={run} disabled={busy || !text.trim()} className="btn-primary">
          <Sparkles size={15} className={busy ? 'animate-pulse' : ''} />
          {busy ? 'Analysing…' : 'Analyse & categorise'}
        </button>
      </div>

      {result && a && (
        <div className="animate-fade-in mt-5 border-t border-white/10 pt-5" data-testid="analysis-result">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="glass-tile rounded-2xl p-4">
              <p className="mb-1 text-[11.5px] uppercase tracking-[0.12em] text-white/60">Sentiment</p>
              <Badge tone={sentimentTone[a.sentiment]} className="capitalize">
                {a.sentiment}
              </Badge>
            </div>
            <div className="glass-tile rounded-2xl p-4 sm:col-span-1 lg:col-span-1">
              <p className="mb-1.5 text-[11.5px] uppercase tracking-[0.12em] text-white/60">Issue clusters</p>
              {a.hits.length ? (
                <div className="flex flex-wrap gap-1.5">
                  {a.hits.map((h) => (
                    <Badge key={h.topic} tone={h.polarity === 'positive' ? 'emerald' : 'rose'}>
                      {TOPICS[h.topic].short}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-[13.5px] text-white/80">General guest experience</p>
              )}
            </div>
            <div className="glass-tile rounded-2xl p-4">
              <p className="mb-1 text-[11.5px] uppercase tracking-[0.12em] text-white/60">Route to</p>
              <p className="text-[14px] text-white">{a.department}</p>
              <p className="text-[12px] text-white/60">{a.priority} priority</p>
            </div>
            <div className="glass-tile rounded-2xl p-4">
              <p className="mb-1 text-[11.5px] uppercase tracking-[0.12em] text-white/60">Business impact</p>
              <p className="text-[13.5px] leading-snug text-white">{impactText}</p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap justify-end gap-2">
            {a.primary && a.primary.polarity === 'negative' && (
              <button onClick={() => raiseInsightTask(a.primary!.topic)} className="btn-glass btn-sm">
                <ClipboardList size={13} /> Create “{TOPICS[a.primary.topic].short}” task
              </button>
            )}
            <button onClick={addToFeed} disabled={added} className="btn-primary btn-sm">
              {added ? <Check size={13} /> : <Plus size={13} />}
              {added ? 'Added to feed' : 'Add to review feed'}
            </button>
          </div>
        </div>
      )}
    </Card>
  );
}

export default function InsightsPage() {
  const { state, risk, rep } = useApp();
  const [open, setOpen] = useState<TopicKey | null>('heating');

  const clusters = useMemo(
    () => TOPIC_KEYS.map((k) => risk.topics[k]).filter((t) => t.mentions > 0).sort((a, b) => b.mentions - a.mentions),
    [risk],
  );
  const maxMentions = Math.max(1, ...clusters.map((c) => c.mentions));
  const priorities = useMemo(
    () =>
      TOPIC_KEYS.map((k) => risk.topics[k])
        .filter((t) => t.risk > 0 || topicTask(state.tasks, t.key))
        .sort((a, b) => b.risk - a.risk)
        .slice(0, 4),
    [risk, state.tasks],
  );
  const heatingShare = risk.total ? Math.round((risk.byGroup.Heating / risk.total) * 100) : 0;
  const openActions = state.tasks.filter((t) => t.source === 'insight' && !t.done).length;

  return (
    <div className="animate-fade-in">
      <PageHero
        title="Issue Clusters & Insights"
        subtitle="Recurring themes found across every review and WhatsApp message — with what each one costs you and what to do about it."
      />

      <StatGrid>
        <Stat label="Revenue at risk" value={`₹${fmtINR(risk.total)}`} sub="Open issues, reviews + complaints" icon={IndianRupee} alert={risk.total > 0} />
        <Stat label="Issue clusters" value={String(clusters.length)} sub={`From ${rep.count} reviews`} icon={Sparkles} />
        <Stat
          label="Top driver"
          value={priorities[0] ? TOPICS[priorities[0].key].short : '—'}
          sub={priorities[0] ? `₹${fmtINR(priorities[0].risk)} at risk` : 'Nothing at risk'}
        />
        <Stat label="Actions in progress" value={String(openActions)} sub="Tracked in Hotel OS" icon={ClipboardList} />
      </StatGrid>

      <div className="mb-5 grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <Card eyebrow="Where revenue is leaking" title="Revenue at risk by cause">
          <div className="space-y-4" data-testid="risk-breakdown">
            {GROUP_ORDER.map((g) => {
              const v = risk.byGroup[g];
              const pct = risk.total ? (v / risk.total) * 100 : 0;
              return (
                <div key={g}>
                  <div className="mb-1.5 flex items-baseline justify-between text-[14px]">
                    <span className="text-white/85">{g}</span>
                    <span className="tabular-nums text-white">
                      ₹{fmtINR(v)} <span className="text-[12px] text-white/50">{Math.round(pct)}%</span>
                    </span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-black/35">
                    <div className="h-full rounded-full bg-white/55 transition-all duration-500" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
          <p className="mt-5 text-[12.5px] leading-relaxed text-white/60">
            {risk.total > 0
              ? `Heating and hot water alone account for ${heatingShare}% of what is at risk. Each unresolved negative mention counts; finishing the fix task clears it.`
              : 'No open issues are costing you bookings right now.'}
          </p>
        </Card>

        <Card eyebrow="Recommended" title="Fix these first">
          {priorities.length === 0 ? (
            <p className="py-6 text-center text-[13.5px] text-white/60">Nothing urgent — every issue is resolved.</p>
          ) : (
            <ul className="space-y-3">
              {priorities.map((t) => (
                <li key={t.key} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/15 p-4">
                  <div className="min-w-0">
                    <p className="text-[14px] text-white">{TOPICS[t.key].action}</p>
                    <p className="mt-0.5 text-[12px] text-white/60">
                      {TOPICS[t.key].department} · {t.risk > 0 ? `₹${fmtINR(t.risk)} at risk` : 'risk cleared'}
                    </p>
                  </div>
                  <ActionControl topic={t.key} />
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Card eyebrow="Volume by theme" title="Top issue clusters" className="mb-5">
        <ul className="divide-y divide-white/10" data-testid="clusters">
          {clusters.map((c) => {
            const meta = TOPICS[c.key];
            const isOpen = open === c.key;
            const quotes = c.reviews
              .filter((r) => analyseCached(r.text).hits.find((h) => h.topic === c.key)?.polarity === (c.negative > 0 ? 'negative' : 'positive'))
              .slice(0, 3);
            return (
              <li key={c.key} className="py-1">
                <button
                  onClick={() => setOpen(isOpen ? null : c.key)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center gap-4 rounded-2xl px-1 py-3 text-left transition hover:bg-white/[0.04]"
                >
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex items-baseline justify-between gap-3">
                      <span className="truncate text-[14.5px] text-white">{meta.label}</span>
                      <span className="shrink-0 text-[12.5px] tabular-nums text-white/60">
                        {c.mentions} mention{c.mentions === 1 ? '' : 's'}
                      </span>
                    </div>
                    <div className="flex h-2.5 overflow-hidden rounded-full bg-black/35" style={{ width: `${(c.mentions / maxMentions) * 100}%`, minWidth: '14%' }}>
                      <div style={{ width: `${(c.positive / c.mentions) * 100}%`, background: toneHex.emerald }} className="h-full opacity-90" />
                      <div style={{ width: `${(c.negative / c.mentions) * 100}%`, background: toneHex.rose }} className="h-full opacity-90" />
                    </div>
                  </div>
                  <div className="hidden shrink-0 items-center gap-2 sm:flex">
                    <Badge tone="emerald">{c.positive} positive</Badge>
                    <Badge tone={c.negative ? 'rose' : 'slate'}>{c.negative} negative</Badge>
                  </div>
                  <ChevronDown size={16} className={`shrink-0 text-white/50 transition ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                {isOpen && (
                  <div className="animate-fade-in mb-2 ml-1 mr-1 rounded-2xl border border-white/10 bg-black/15 p-4">
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                      <p className="text-[13px] text-white/75">
                        {c.openNegative > 0 ? (
                          <>
                            <span className="text-white">{c.openNegative} open complaint{c.openNegative === 1 ? '' : 's'}</span> ·{' '}
                            {c.risk > 0 ? `₹${fmtINR(c.risk)} at risk` : ''}
                          </>
                        ) : c.negative > 0 ? (
                          'Resolved — complaints cleared by a completed action'
                        ) : (
                          'A strength — guests keep praising this'
                        )}
                      </p>
                      {c.negative > 0 && <ActionControl topic={c.key} />}
                    </div>
                    <ul className="space-y-2">
                      {quotes.map((r) => (
                        <li key={r.id} className="rounded-xl bg-white/[0.05] px-3.5 py-2.5 text-[13px] leading-relaxed text-white/80">
                          “{r.text}”
                          <span className="mt-1 block text-[11.5px] text-white/50">
                            {r.guestName} · {r.source} · {r.rating}★
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
        {risk.total === 0 && (
          <p className="mt-2 flex items-center gap-2 text-[12.5px] text-emerald-100/80">
            <RotateCcw size={12} /> All caught up — new negative reviews will reopen their clusters.
          </p>
        )}
      </Card>

      <Analyser />
    </div>
  );
}
