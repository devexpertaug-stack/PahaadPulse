import { analyseCached, TOPICS, TOPIC_KEYS } from './analysis';
import type { RiskGroup } from './analysis';
import { addDays, DEMO_TODAY, fmtShort, parseDMY, startOfWeek } from './format';
import { negativeReviewCounts } from '../store/state';
import type { AppState } from '../store/state';
import { seedBills } from '../data/seed';
import type {
  Bill,
  ChannelKey,
  Review,
  Sentiment,
  StaffMember,
  StaffStatus,
  TopicKey,
} from '../types';

/* ───────────────────────────── reputation ───────────────────────────── */

export interface Reputation {
  count: number;
  avg: number;
  positive: number;
  neutral: number;
  negative: number;
  positivePct: number;
  /** star-NPS: % 5★ (promoters) minus % 3★-and-below (detractors) */
  nps: number;
  /** negative reviews that still wait for a posted reply */
  alerts: number;
  needsReply: number;
}

export function reputation(reviews: Review[]): Reputation {
  const count = reviews.length;
  const by = (s: Sentiment) => reviews.filter((r) => r.sentiment === s).length;
  const positive = by('positive');
  const neutral = by('neutral');
  const negative = by('negative');
  const avg = count ? reviews.reduce((s, r) => s + r.rating, 0) / count : 0;
  const promoters = reviews.filter((r) => r.rating === 5).length;
  const detractors = reviews.filter((r) => r.rating <= 3).length;
  return {
    count,
    avg,
    positive,
    neutral,
    negative,
    positivePct: count ? Math.round((positive / count) * 1000) / 10 : 0,
    nps: count ? Math.round(((promoters - detractors) / count) * 100) : 0,
    alerts: reviews.filter((r) => r.sentiment === 'negative' && !r.replied).length,
    needsReply: reviews.filter((r) => r.sentiment !== 'positive' && !r.replied).length,
  };
}

export function channelCounts(reviews: Review[]): Array<{ name: string; count: number; avg: number }> {
  const map = new Map<string, { count: number; sum: number }>();
  for (const r of reviews) {
    const e = map.get(r.source) ?? { count: 0, sum: 0 };
    e.count += 1;
    e.sum += r.rating;
    map.set(r.source, e);
  }
  return [...map.entries()]
    .map(([name, e]) => ({ name, count: e.count, avg: e.sum / e.count }))
    .sort((a, b) => b.count - a.count);
}

export interface WeekPoint {
  label: string;
  reviews: number;
  /** average rating of reviews that landed in this week (null when none) */
  weekAvg: number | null;
  /** running reputation index at the end of this week */
  index: number | null;
}

/** last `weeks` weeks (Mon–Sun) up to the demo "today" */
export function weeklyMomentum(reviews: Review[], weeks = 8): WeekPoint[] {
  const thisMonday = startOfWeek(DEMO_TODAY);
  const dated = reviews.map((r) => ({ r, d: parseDMY(r.date) }));
  const out: WeekPoint[] = [];
  for (let i = weeks - 1; i >= 0; i--) {
    const start = addDays(thisMonday, -7 * i);
    const end = addDays(start, 7);
    const inWeek = dated.filter(({ d }) => d >= start && d < end);
    const upTo = dated.filter(({ d }) => d < end);
    out.push({
      label: fmtShort(start),
      reviews: inWeek.length,
      weekAvg: inWeek.length ? +(inWeek.reduce((s, x) => s + x.r.rating, 0) / inWeek.length).toFixed(2) : null,
      index: upTo.length ? +(upTo.reduce((s, x) => s + x.r.rating, 0) / upTo.length).toFixed(2) : null,
    });
  }
  return out;
}

/* ─────────────────────────────── topics ─────────────────────────────── */

export interface TopicStat {
  key: TopicKey;
  positive: number;
  negative: number;
  mentions: number;
  /** negative mentions still counting towards revenue at risk */
  openNegative: number;
  reviewRisk: number;
  complaintRisk: number;
  risk: number;
  /** 'positive' when praise outweighs complaints */
  tone: Sentiment;
  /** reviews mentioning the topic, newest first */
  reviews: Review[];
}

export interface RiskSummary {
  topics: Record<TopicKey, TopicStat>;
  byGroup: Record<RiskGroup, number>;
  total: number;
}

export function riskSummary(state: Pick<AppState, 'reviews' | 'complaints' | 'resolved'>): RiskSummary {
  const neg = negativeReviewCounts(state.reviews);
  const topics = {} as Record<TopicKey, TopicStat>;

  for (const k of TOPIC_KEYS) {
    topics[k] = {
      key: k,
      positive: 0,
      negative: 0,
      mentions: 0,
      openNegative: 0,
      reviewRisk: 0,
      complaintRisk: 0,
      risk: 0,
      tone: 'neutral',
      reviews: [],
    };
  }

  const sorted = [...state.reviews].sort((a, b) => +parseDMY(b.date) - +parseDMY(a.date));
  for (const r of sorted) {
    for (const h of analyseCached(r.text).hits) {
      const t = topics[h.topic];
      t.mentions += 1;
      if (h.polarity === 'positive') t.positive += 1;
      else t.negative += 1;
      t.reviews.push(r);
    }
  }

  for (const k of TOPIC_KEYS) {
    const t = topics[k];
    const baseline = state.resolved[k] ?? 0;
    t.openNegative = Math.max(0, neg[k] - baseline);
    t.reviewRisk = t.openNegative * TOPICS[k].risk;
    t.tone = t.negative > t.positive ? 'negative' : t.positive > t.negative ? 'positive' : 'neutral';
  }

  // unresolved WhatsApp complaints count too, so the figure reacts to the live queue
  for (const c of state.complaints) {
    if (c.status === 'resolved' || c.category === 'positive') continue;
    for (const h of analyseCached(c.message).hits) {
      if (h.polarity === 'negative') topics[h.topic].complaintRisk += TOPICS[h.topic].risk;
    }
  }

  const byGroup: Record<RiskGroup, number> = { Heating: 0, 'Wi-Fi': 0, Service: 0 };
  let total = 0;
  for (const k of TOPIC_KEYS) {
    const t = topics[k];
    t.risk = t.reviewRisk + t.complaintRisk;
    byGroup[TOPICS[k].group] += t.risk;
    total += t.risk;
  }
  return { topics, byGroup, total };
}

/* ─────────────────────────────── hotel ops ─────────────────────────────── */

export function occupancy(state: Pick<AppState, 'rooms'>) {
  const total = state.rooms.length;
  const occupied = state.rooms.filter((r) => r.status === 'Occupied').length;
  const ready = state.rooms.filter((r) => r.status === 'Ready').length;
  return { total, occupied, ready, pct: total ? Math.round((occupied / total) * 100) : 0 };
}

export const staffStatus = (score: number): StaffStatus =>
  score >= 85 ? 'Top Performer' : score < 65 ? 'Needs Coaching' : 'Average';

export function staffSummary(staff: StaffMember[]) {
  const avg = staff.length ? Math.round(staff.reduce((s, m) => s + m.performanceScore, 0) / staff.length) : 0;
  return {
    avg,
    top: staff.filter((s) => staffStatus(s.performanceScore) === 'Top Performer').length,
    coaching: staff.filter((s) => staffStatus(s.performanceScore) === 'Needs Coaching').length,
  };
}

/* ─────────────────────────────── billing ─────────────────────────────── */

export const billSubtotal = (b: Pick<Bill, 'items'>) => b.items.reduce((s, it) => s + it.qty * it.rate, 0);
export const billGst = (b: Pick<Bill, 'items' | 'gstRate'>) => Math.round((billSubtotal(b) * b.gstRate) / 100);
export const billTotal = (b: Pick<Bill, 'items' | 'gstRate'>) => billSubtotal(b) + billGst(b);

/** month-to-date revenue shown at the seed state; paid invoices raised in the app are added on top */
const MTD_AT_SEED = 940520;
const SEED_PAID = seedBills.filter((b) => b.status === 'Paid').reduce((s, b) => s + billTotal(b), 0);

export const monthlyRevenue = (bills: Bill[]) =>
  MTD_AT_SEED - SEED_PAID + bills.filter((b) => b.status === 'Paid').reduce((s, b) => s + billTotal(b), 0);

export const channelLabel: Record<ChannelKey, string> = {
  'Booking.com': 'Booking.com',
  Google: 'Google Reviews',
  TripAdvisor: 'TripAdvisor',
  Goibibo: 'Goibibo',
};
