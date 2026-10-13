import { analyseCached, TOPIC_KEYS } from '../lib/analysis';
import { pad } from '../lib/format';
import {
  CHANNELS,
  INCOMING_SAMPLES,
  seedArrivals,
  seedBills,
  seedComplaints,
  seedReviews,
  seedRooms,
  seedStaff,
  seedTasks,
} from '../data/seed';
import type {
  Arrival,
  Bill,
  ChannelKey,
  ChannelState,
  ComplaintStatus,
  OperationalTask,
  Review,
  Room,
  RoomStatus,
  StaffMember,
  TopicKey,
  WhatsAppComplaint,
} from '../types';

export interface AppState {
  reviews: Review[];
  complaints: WhatsAppComplaint[];
  staff: StaffMember[];
  rooms: Room[];
  arrivals: Arrival[];
  tasks: OperationalTask[];
  bills: Bill[];
  channels: Record<ChannelKey, ChannelState>;
  /** how many discovery-pool reviews of each channel have been imported so far */
  scrapeCursor: Record<ChannelKey, number>;
  /** API credits used this billing cycle */
  credits: number;
  optimiseCredits: boolean;
  /** topic → number of negative review mentions at the moment its fix task was completed */
  resolved: Partial<Record<TopicKey, number>>;
  autoEscalate: boolean;
  weeklyReport: boolean;
  /** next index into INCOMING_SAMPLES for the "simulate message" button */
  nextIncoming: number;
  invoiceSeq: number;
}

export const CREDIT_LIMIT = 500;

const channelMap = <T,>(f: (k: ChannelKey) => T) =>
  Object.fromEntries(CHANNELS.map((k) => [k, f(k)])) as Record<ChannelKey, T>;

export function initialState(): AppState {
  return {
    reviews: structuredClone(seedReviews),
    complaints: structuredClone(seedComplaints),
    staff: structuredClone(seedStaff),
    rooms: structuredClone(seedRooms),
    arrivals: structuredClone(seedArrivals),
    tasks: structuredClone(seedTasks),
    bills: structuredClone(seedBills),
    channels: channelMap(() => ({ connected: true, enabled: true, lastSync: '13/10/2026, 9:00 AM' })),
    scrapeCursor: channelMap(() => 0),
    credits: 118,
    optimiseCredits: true,
    resolved: {},
    autoEscalate: true,
    weeklyReport: true,
    nextIncoming: 0,
    invoiceSeq: seedBills.length + 1,
  };
}

/** number of reviews that mention each topic negatively */
export function negativeReviewCounts(reviews: Review[]): Record<TopicKey, number> {
  const out = Object.fromEntries(TOPIC_KEYS.map((k) => [k, 0])) as Record<TopicKey, number>;
  for (const r of reviews) {
    for (const h of analyseCached(r.text).hits) if (h.polarity === 'negative') out[h.topic] += 1;
  }
  return out;
}

export const invoiceNo = (seq: number) => `INV-2610-${pad(Math.floor(seq / 100))}${pad(seq % 100)}`;

export type PrefKey = 'autoEscalate' | 'weeklyReport' | 'optimiseCredits';

export type Action =
  | { type: 'reset' }
  | { type: 'review/add'; review: Review }
  | { type: 'review/reply'; id: string; text: string }
  | { type: 'review/post'; id: string }
  | { type: 'task/add'; task: OperationalTask }
  | { type: 'task/toggle'; id: string }
  | { type: 'task/remove'; id: string }
  | { type: 'complaint/add'; complaint: WhatsAppComplaint }
  | { type: 'complaint/status'; id: string; status: ComplaintStatus }
  | { type: 'complaint/assign'; id: string; staffId?: string }
  | { type: 'complaint/consumeSample' }
  | { type: 'staff/coaching'; id: string }
  | { type: 'staff/star'; id: string }
  | { type: 'room/set'; number: string; status: RoomStatus; guest?: string; task?: OperationalTask }
  | { type: 'arrival/checkin'; id: string; room: string }
  | { type: 'bill/add'; bill: Omit<Bill, 'invoiceNo'> }
  | { type: 'bill/paid'; id: string }
  | { type: 'channel/connect'; key: ChannelKey; on: boolean }
  | { type: 'channel/enable'; key: ChannelKey; on: boolean }
  | {
      type: 'scrape/done';
      reviews: Review[];
      cursors: Partial<Record<ChannelKey, number>>;
      credits: number;
      stamp: string;
      keys: ChannelKey[];
    }
  | { type: 'pref'; key: PrefKey; value: boolean };

export function reducer(state: AppState, a: Action): AppState {
  switch (a.type) {
    case 'reset':
      return initialState();

    /* ───────── reviews ───────── */
    case 'review/add':
      return { ...state, reviews: [a.review, ...state.reviews] };
    case 'review/reply':
      return {
        ...state,
        reviews: state.reviews.map((r) => (r.id === a.id ? { ...r, aiReply: a.text, replied: false } : r)),
      };
    case 'review/post':
      return { ...state, reviews: state.reviews.map((r) => (r.id === a.id ? { ...r, replied: true } : r)) };

    /* ───────── tasks ───────── */
    case 'task/add':
      return { ...state, tasks: [a.task, ...state.tasks] };
    case 'task/remove':
      return { ...state, tasks: state.tasks.filter((t) => t.id !== a.id) };
    case 'task/toggle': {
      const task = state.tasks.find((t) => t.id === a.id);
      if (!task) return state;
      const done = !task.done;
      const next: AppState = {
        ...state,
        tasks: state.tasks.map((t) => (t.id === a.id ? { ...t, done } : t)),
      };
      if (task.source === 'insight' && task.refId) {
        const topic = task.refId as TopicKey;
        const resolved = { ...state.resolved };
        if (done) resolved[topic] = negativeReviewCounts(state.reviews)[topic] ?? 0;
        else delete resolved[topic];
        next.resolved = resolved;
      }
      if (task.source === 'room' && done && task.refId) {
        next.rooms = state.rooms.map((r) =>
          r.number === task.refId && (r.status === 'Cleaning' || r.status === 'Maintenance')
            ? { ...r, status: 'Ready' }
            : r,
        );
      }
      if (task.source === 'complaint' && done && task.refId) {
        next.complaints = state.complaints.map((c) => (c.id === task.refId ? { ...c, status: 'resolved' } : c));
      }
      return next;
    }

    /* ───────── complaints ───────── */
    case 'complaint/add':
      return { ...state, complaints: [a.complaint, ...state.complaints] };
    case 'complaint/consumeSample':
      return { ...state, nextIncoming: (state.nextIncoming + 1) % INCOMING_SAMPLES.length };
    case 'complaint/status':
      return {
        ...state,
        complaints: state.complaints.map((c) => (c.id === a.id ? { ...c, status: a.status } : c)),
        // resolving a complaint closes the Hotel OS task that was raised from it
        tasks:
          a.status === 'resolved'
            ? state.tasks.map((t) => (t.source === 'complaint' && t.refId === a.id ? { ...t, done: true } : t))
            : state.tasks,
      };
    case 'complaint/assign':
      return {
        ...state,
        complaints: state.complaints.map((c) =>
          c.id === a.id
            ? { ...c, assigneeId: a.staffId, status: c.status === 'open' && a.staffId ? 'in_progress' : c.status }
            : c,
        ),
      };

    /* ───────── staff ───────── */
    case 'staff/coaching':
      return { ...state, staff: state.staff.map((s) => (s.id === a.id ? { ...s, coaching: !s.coaching } : s)) };
    case 'staff/star':
      return {
        ...state,
        staff: state.staff.map((s) => ({ ...s, starOfWeek: s.id === a.id ? !s.starOfWeek : false })),
      };

    /* ───────── rooms & arrivals ───────── */
    case 'room/set': {
      const rooms = state.rooms.map((r) =>
        r.number === a.number
          ? { ...r, status: a.status, guest: a.status === 'Occupied' ? a.guest?.trim() || 'Walk-in guest' : undefined }
          : r,
      );
      const duplicate =
        a.task && state.tasks.some((t) => !t.done && t.source === 'room' && t.refId === a.task!.refId);
      return { ...state, rooms, tasks: a.task && !duplicate ? [a.task, ...state.tasks] : state.tasks };
    }
    case 'arrival/checkin': {
      const arrival = state.arrivals.find((x) => x.id === a.id);
      if (!arrival || arrival.checkedIn) return state;
      return {
        ...state,
        arrivals: state.arrivals.map((x) => (x.id === a.id ? { ...x, checkedIn: true, room: a.room } : x)),
        rooms: state.rooms.map((r) => (r.number === a.room ? { ...r, status: 'Occupied', guest: arrival.guest } : r)),
      };
    }

    /* ───────── billing ───────── */
    case 'bill/add':
      return {
        ...state,
        bills: [{ ...a.bill, invoiceNo: invoiceNo(state.invoiceSeq) }, ...state.bills],
        invoiceSeq: state.invoiceSeq + 1,
      };
    case 'bill/paid':
      return { ...state, bills: state.bills.map((b) => (b.id === a.id ? { ...b, status: 'Paid' } : b)) };

    /* ───────── scraper ───────── */
    case 'channel/connect':
      return {
        ...state,
        channels: {
          ...state.channels,
          [a.key]: { ...state.channels[a.key], connected: a.on, enabled: a.on },
        },
      };
    case 'channel/enable':
      return {
        ...state,
        channels: { ...state.channels, [a.key]: { ...state.channels[a.key], enabled: a.on } },
      };
    case 'scrape/done': {
      const channels = { ...state.channels };
      for (const k of a.keys) channels[k] = { ...channels[k], lastSync: a.stamp };
      return {
        ...state,
        reviews: [...a.reviews, ...state.reviews],
        scrapeCursor: { ...state.scrapeCursor, ...a.cursors },
        credits: state.credits + a.credits,
        channels,
      };
    }

    case 'pref':
      return { ...state, [a.key]: a.value };
  }
}
