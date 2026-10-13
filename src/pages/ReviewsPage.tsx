import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  BadgeCheck,
  Check,
  ClipboardList,
  MessageSquare,
  Pencil,
  Plus,
  Search,
  Send,
  Smile,
  Sparkles,
  Star,
  TrendingUp,
} from 'lucide-react';
import PageHero from '../components/ui/PageHero';
import Card from '../components/ui/Card';
import Stat, { StatGrid } from '../components/ui/Stat';
import Badge from '../components/ui/Badge';
import Segmented from '../components/ui/Segmented';
import Modal from '../components/ui/Modal';
import Empty from '../components/ui/Empty';
import DonutChart from '../components/DonutChart';
import RingGauge from '../components/RingGauge';
import { sentimentTone, sourceTone, toneHex } from '../components/ui/tones';
import { useApp } from '../store/AppStore';
import { useActions } from '../store/useActions';
import { analyseCached, TOPICS } from '../lib/analysis';
import { channelCounts } from '../lib/metrics';
import { parseDMY } from '../lib/format';
import { draftReply } from '../lib/reply';
import type { Review, ReviewSource, Sentiment } from '../types';

const PAGE = 10;

type SentimentFilter = 'all' | Sentiment;
type SortKey = 'newest' | 'oldest' | 'lowest' | 'highest';

function Stars({ value }: { value: number }) {
  return (
    <span className="flex items-center gap-0.5" aria-label={`${value} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={13}
          strokeWidth={1.6}
          className={i < value ? 'fill-amber-200 text-amber-200' : 'text-white/25'}
        />
      ))}
    </span>
  );
}

function ReviewCard({ review }: { review: Review }) {
  const { state, dispatch, say } = useApp();
  const { raiseReviewTask } = useActions();
  const [busy, setBusy] = useState(false);
  const [variant, setVariant] = useState(0);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');

  const taskRaised = state.tasks.some((t) => t.source === 'review' && t.refId === review.id);
  const needsReply = review.sentiment === 'negative' && !review.replied;

  const generate = () => {
    setBusy(true);
    const next = review.aiReply ? variant + 1 : variant;
    setTimeout(() => {
      dispatch({ type: 'review/reply', id: review.id, text: draftReply(review, next) });
      setVariant(next);
      setBusy(false);
    }, 700);
  };

  const post = () => {
    dispatch({ type: 'review/post', id: review.id });
    say(`Reply posted to ${review.source === 'Manual' ? 'the guest' : review.source} (demo)`);
  };

  const saveEdit = () => {
    if (draft.trim()) dispatch({ type: 'review/reply', id: review.id, text: draft.trim() });
    setEditing(false);
  };

  return (
    <article className="glass-card animate-fade-in flex min-w-0 flex-col rounded-[28px] p-5" data-testid="review-card">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <Badge tone={sourceTone[review.source]}>{review.source}</Badge>
          {review.verified && (
            <span className="flex items-center gap-1 text-[11.5px] text-emerald-200/90">
              <BadgeCheck size={13} /> Verified stay
            </span>
          )}
        </div>
        <Stars value={review.rating} />
      </div>

      <div className="mb-1 flex items-baseline justify-between gap-3">
        <p className="truncate font-display text-[16px] font-light tracking-[0.01em] text-white">{review.guestName}</p>
        <p className="shrink-0 text-[12px] text-white/55">{review.date}</p>
      </div>
      {review.roomType && <p className="mb-1.5 text-[12px] text-white/55">{review.roomType}</p>}

      <p className="mb-3 text-[14px] leading-relaxed text-white/85">{review.text}</p>

      <div className="mb-3 flex flex-wrap items-center gap-1.5">
        <Badge tone={sentimentTone[review.sentiment]} className="capitalize">
          {review.sentiment}
        </Badge>
        {review.tags.map((tag) => (
          <span key={tag} className="rounded-full bg-white/[0.08] px-2.5 py-0.5 text-[11.5px] text-white/65">
            {tag}
          </span>
        ))}
        {needsReply && <Badge tone="rose">Needs reply</Badge>}
      </div>

      {review.aiReply && (
        <div className="mb-3 rounded-2xl border border-white/10 bg-black/20 p-3.5">
          <p className="mb-1.5 flex items-center gap-1.5 text-[11px] uppercase tracking-[0.14em] text-emerald-200/90">
            {review.replied ? (
              <>
                <Check size={12} /> Reply posted
              </>
            ) : (
              <>
                <Sparkles size={12} /> AI drafted reply
              </>
            )}
          </p>
          {editing ? (
            <>
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                rows={7}
                aria-label="Edit reply"
                className="field resize-y text-[13px] leading-relaxed"
              />
              <div className="mt-2 flex justify-end gap-2">
                <button onClick={() => setEditing(false)} className="btn-glass btn-sm">
                  Cancel
                </button>
                <button onClick={saveEdit} className="btn-primary btn-sm">
                  Save reply
                </button>
              </div>
            </>
          ) : (
            <p className="whitespace-pre-line text-[13px] leading-relaxed text-white/80">{review.aiReply}</p>
          )}
        </div>
      )}

      <div className="mt-auto flex flex-wrap justify-end gap-2">
        <button
          onClick={() => raiseReviewTask(review)}
          className="btn-glass btn-sm"
          aria-label={taskRaised ? 'Task already raised' : 'Raise Hotel OS task'}
        >
          {taskRaised ? <Check size={13} /> : <ClipboardList size={13} />}
          {taskRaised ? 'Task raised' : 'Raise task'}
        </button>
        {review.aiReply && !review.replied && !editing && (
          <button
            onClick={() => {
              setDraft(review.aiReply ?? '');
              setEditing(true);
            }}
            className="btn-glass btn-sm"
          >
            <Pencil size={13} /> Edit
          </button>
        )}
        {!review.replied && (
          <button onClick={generate} disabled={busy} className="btn-glass btn-sm">
            <Sparkles size={13} className={busy ? 'animate-pulse' : ''} />
            {busy ? 'Writing…' : review.aiReply ? 'Regenerate' : 'AI response'}
          </button>
        )}
        {review.aiReply && !review.replied && (
          <button onClick={post} className="btn-primary btn-sm">
            <Send size={13} /> Post reply
          </button>
        )}
      </div>
    </article>
  );
}

const SOURCES: ReviewSource[] = ['Booking.com', 'Google', 'TripAdvisor', 'Goibibo', 'Manual'];

function AddReviewModal({ onClose, onAdded }: { onClose: () => void; onAdded: () => void }) {
  const { say } = useApp();
  const { addReview } = useActions();
  const [guest, setGuest] = useState('');
  const [source, setSource] = useState<ReviewSource>('Manual');
  const [rating, setRating] = useState(4);
  const [text, setText] = useState('');

  const preview = useMemo(() => (text.trim() ? analyseCached(text) : null), [text]);

  const submit = () => {
    if (!text.trim()) return;
    const review = addReview({ guest, source, rating, text });
    onAdded();
    onClose();
    say(
      review.tags.length
        ? `Review added and categorised: ${review.tags.join(' ')}`
        : 'Review added — no specific topic detected',
    );
  };

  return (
    <Modal title="Add a review" onClose={onClose} className="max-w-[560px]">
      <div className="grid gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="field-label" htmlFor="rv-guest">
              Guest name
            </label>
            <input id="rv-guest" className="field" value={guest} onChange={(e) => setGuest(e.target.value)} placeholder="e.g. Rahul Verma" />
          </div>
          <div>
            <label className="field-label" htmlFor="rv-source">
              Channel
            </label>
            <select id="rv-source" className="field" value={source} onChange={(e) => setSource(e.target.value as ReviewSource)}>
              {SOURCES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <span className="field-label">Rating</span>
          <div className="flex items-center gap-1" role="radiogroup" aria-label="Rating">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                role="radio"
                aria-checked={rating === n}
                aria-label={`${n} star${n > 1 ? 's' : ''}`}
                onClick={() => setRating(n)}
                className="rounded-full p-1.5 transition hover:bg-white/10"
              >
                <Star size={22} strokeWidth={1.5} className={n <= rating ? 'fill-amber-200 text-amber-200' : 'text-white/30'} />
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="field-label" htmlFor="rv-text">
            Review text
          </label>
          <textarea
            id="rv-text"
            className="field resize-none"
            rows={4}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste or type what the guest wrote…"
          />
        </div>

        {preview && (
          <div className="rounded-2xl border border-white/10 bg-black/20 p-3.5 text-[13px] text-white/80">
            <p className="mb-2 text-[11px] uppercase tracking-[0.14em] text-white/50">Detected</p>
            {preview.hits.length ? (
              <div className="flex flex-wrap gap-1.5">
                {preview.hits.map((h) => (
                  <Badge key={h.topic} tone={h.polarity === 'positive' ? 'emerald' : 'rose'}>
                    {TOPICS[h.topic].short} · {h.polarity}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-white/60">No specific topic recognised yet.</p>
            )}
          </div>
        )}

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="btn-glass">
            Cancel
          </button>
          <button onClick={submit} disabled={!text.trim()} className="btn-primary">
            Add review
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default function ReviewsPage() {
  const { state, rep } = useApp();
  const reviews = state.reviews;

  const [sentiment, setSentiment] = useState<SentimentFilter>('all');
  const [source, setSource] = useState<string>('all');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<SortKey>('newest');
  const [needsReplyOnly, setNeedsReplyOnly] = useState(false);
  const [shown, setShown] = useState(PAGE);
  const [adding, setAdding] = useState(false);

  const channels = useMemo(() => channelCounts(reviews), [reviews]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = reviews.filter((r) => {
      if (sentiment !== 'all' && r.sentiment !== sentiment) return false;
      if (source !== 'all' && r.source !== source) return false;
      if (needsReplyOnly && (r.replied || r.sentiment === 'positive')) return false;
      if (q && !`${r.guestName} ${r.text} ${r.source} ${r.tags.join(' ')}`.toLowerCase().includes(q)) return false;
      return true;
    });
    const byDate = (r: Review) => +parseDMY(r.date);
    return [...list].sort((a, b) => {
      if (sort === 'oldest') return byDate(a) - byDate(b);
      if (sort === 'lowest') return a.rating - b.rating || byDate(b) - byDate(a);
      if (sort === 'highest') return b.rating - a.rating || byDate(b) - byDate(a);
      return byDate(b) - byDate(a);
    });
  }, [reviews, sentiment, source, query, sort, needsReplyOnly]);

  const resetFilters = () => {
    setSentiment('all');
    setSource('all');
    setQuery('');
    setNeedsReplyOnly(false);
    setSort('newest');
    setShown(PAGE);
  };

  const sentimentData = [
    { name: 'Positive', value: rep.positive, color: toneHex.emerald },
    { name: 'Neutral', value: rep.neutral, color: toneHex.amber },
    { name: 'Negative', value: rep.negative, color: toneHex.rose },
  ];
  const channelData = channels.map((c) => ({
    name: c.name,
    value: c.count,
    color: toneHex[sourceTone[c.name] ?? 'slate'],
  }));

  const visible = filtered.slice(0, shown);

  return (
    <div className="animate-fade-in">
      <PageHero
        title="Review Intelligence"
        subtitle="Guest reviews from every channel, read and sorted into topics, sentiment and the team that should act on them."
        actions={
          <button onClick={() => setAdding(true)} className="btn-primary">
            <Plus size={16} /> Add review
          </button>
        }
      />

      <StatGrid>
        <Stat label="Reputation index" value={`${rep.avg.toFixed(2)} / 5`} sub="Across all channels" icon={TrendingUp} />
        <Stat label="Total reviews" value={String(rep.count)} sub={`${channels.length} channels`} icon={MessageSquare} />
        <Stat label="Positive sentiment" value={`${rep.positivePct}%`} sub={`${rep.positive} happy guests`} icon={Smile} />
        <Stat
          label="High-priority alerts"
          value={`${rep.alerts} active`}
          sub={rep.alerts ? 'Negative reviews awaiting a reply' : 'All negative reviews answered'}
          icon={AlertTriangle}
          alert={rep.alerts > 0}
        />
      </StatGrid>

      <div className="mb-5 grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card eyebrow="Sentiment mix" className="flex flex-col items-center">
          <DonutChart data={sentimentData} centerValue={`${rep.positivePct}%`} centerLabel="Positive" />
          <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[12px] text-white/70">
            {sentimentData.map((d) => (
              <span key={d.name} className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full" style={{ background: d.color }} /> {d.name} {d.value}
              </span>
            ))}
          </div>
        </Card>
        <Card eyebrow="Reputation gauge" className="flex flex-col items-center">
          <RingGauge value={(rep.avg / 5) * 100} display={rep.avg.toFixed(2)} sublabel="out of 5.0" />
          <p className="mt-4 text-[12px] text-white/65">Net index across {rep.count} reviews</p>
        </Card>
        <Card eyebrow="Reviews by channel" className="flex flex-col items-center">
          <DonutChart data={channelData} centerValue={String(rep.count)} centerLabel="Total" />
          <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[12px] text-white/70">
            {channelData.map((c) => (
              <span key={c.name} className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full" style={{ background: c.color }} /> {c.name} {c.value}
              </span>
            ))}
          </div>
        </Card>
      </div>

      {/* ───────── Filters ───────── */}
      <Card className="mb-5">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[220px] flex-1">
            <Search size={15} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/50" />
            <input
              className="field pl-10"
              placeholder="Search guest, text or tag (e.g. #heating)"
              aria-label="Search reviews"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setShown(PAGE);
              }}
            />
          </div>
          <select
            className="field w-auto"
            aria-label="Sort reviews"
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="lowest">Lowest rating</option>
            <option value="highest">Highest rating</option>
          </select>
          <button
            onClick={() => {
              setNeedsReplyOnly((v) => !v);
              setShown(PAGE);
            }}
            aria-pressed={needsReplyOnly}
            className={`btn-glass ${needsReplyOnly ? '!bg-white/30' : ''}`}
          >
            Needs reply {rep.needsReply > 0 && <span className="text-white/60">{rep.needsReply}</span>}
          </button>
        </div>

        <div className="mt-3 flex flex-col gap-1 lg:flex-row lg:items-center lg:justify-between">
          <Segmented<SentimentFilter>
            label="Filter by sentiment"
            value={sentiment}
            onChange={(v) => {
              setSentiment(v);
              setShown(PAGE);
            }}
            options={[
              { key: 'all', label: 'All', count: rep.count },
              { key: 'positive', label: 'Positive', count: rep.positive },
              { key: 'neutral', label: 'Neutral', count: rep.neutral },
              { key: 'negative', label: 'Negative', count: rep.negative },
            ]}
          />
          <Segmented<string>
            label="Filter by channel"
            value={source}
            onChange={(v) => {
              setSource(v);
              setShown(PAGE);
            }}
            options={[
              { key: 'all', label: 'All channels' },
              ...channels.map((c) => ({ key: c.name, label: c.name, count: c.count })),
            ]}
          />
        </div>
      </Card>

      <p className="mb-3 px-1 text-[13px] text-white/60" aria-live="polite">
        Showing {visible.length} of {filtered.length} review{filtered.length === 1 ? '' : 's'}
        {filtered.length !== reviews.length && (
          <button onClick={resetFilters} className="ml-3 underline decoration-white/30 underline-offset-4 hover:text-white">
            Clear filters
          </button>
        )}
      </p>

      {filtered.length === 0 ? (
        <Empty>No reviews match these filters.</Empty>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {visible.map((r) => (
            <ReviewCard key={r.id} review={r} />
          ))}
        </div>
      )}

      {visible.length < filtered.length && (
        <div className="mt-5 flex justify-center">
          <button onClick={() => setShown((n) => n + PAGE)} className="btn-glass">
            Show {Math.min(PAGE, filtered.length - visible.length)} more
          </button>
        </div>
      )}

      {adding && <AddReviewModal onClose={() => setAdding(false)} onAdded={resetFilters} />}
    </div>
  );
}
