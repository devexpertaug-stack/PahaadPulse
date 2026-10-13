import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BedDouble,
  Check,
  ConciergeBell,
  LayoutGrid,
  MessageCircle,
  Pencil,
  Plus,
  Settings,
  ShieldCheck,
  Sparkles,
  UtensilsCrossed,
  Upload,
  Users,
  Wrench,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import SegmentRing from '../components/overview/SegmentRing';
import XCToggle from '../components/overview/XCToggle';
import { staffMembers, whatsAppComplaints } from '../data/mockData';
import type { Department } from '../types';

/* ───────────────────────── static demo data ───────────────────────── */

type Filter = 'All' | Department;

const filters: { key: Filter; label: string; icon: LucideIcon }[] = [
  { key: 'All', label: 'All', icon: LayoutGrid },
  { key: 'Housekeeping', label: 'Housekeeping', icon: BedDouble },
  { key: 'Front Desk', label: 'Front Desk', icon: ConciergeBell },
  { key: 'Food & Beverage', label: 'F&B', icon: UtensilsCrossed },
  { key: 'Maintenance', label: 'Maintenance', icon: Wrench },
  { key: 'Security', label: 'Security', icon: ShieldCheck },
];

const plans = [
  { key: 'cottage', label: 'Valley Cottage', rate: 6500 },
  { key: 'suite', label: 'Pine Suite', rate: 8200 },
  { key: 'tent', label: 'Garden Tent', rate: 3800 },
] as const;

/** Where revenue is leaking this month (sums to ₹64,520 — the "Revenue at risk" figure). */
const drivers = [
  { key: 'wifi', label: 'Wi-Fi', amount: 14800 },
  { key: 'service', label: 'Service', amount: 18520 },
  { key: 'heating', label: 'Heating', amount: 31200 },
] as const;

const MONTHLY_REVENUE = 940520;
const REVENUE_AT_RISK = drivers.reduce((s, d) => s + d.amount, 0);
const OCCUPANCY = 82;

const ARRIVALS_BY_WEEKDAY_SLOT = [5, 4, 6, 3, 8, 5, 7]; // index = day % 7 → today (13th) = 7

const avatarGradients = [
  'from-[#ff9a3c] to-[#e8412c]',
  'from-[#5ec2ff] to-[#2b5fd9]',
  'from-[#ff7a45] to-[#c2381b]',
  'from-[#ffd23f] to-[#f29f05]',
  'from-[#f08fc0] to-[#a63d8a]',
  'from-[#7be0a5] to-[#1f9d63]',
  'from-[#b69cff] to-[#6a45d8]',
];

const insights: Record<Filter, string> = {
  All: `Heating & hot-water failures drive ${Math.round(
    (31200 / REVENUE_AT_RISK) * 100,
  )}% of revenue at risk — fix those first to recover the most.`,
  Housekeeping: 'Housekeeping averages 85 — Deepak Bisht leads at 94 with zero complaints.',
  'Front Desk': 'Ravi Chauhan scores 61 with 4 complaints; one guest reported unanswered calls tonight.',
  'Food & Beverage': 'The kitchen is the star: Kavita Negi scores 91 with 15 positive guest mentions.',
  Maintenance: 'Maintenance has the lowest score (52) and 6 complaints — geyser and heating are the repeat offenders.',
  Security: 'One high-attention call is open: a wasp nest near the room 202 balcony.',
};

/* ───────────────────────────── helpers ───────────────────────────── */

const fmt = (n: number) => n.toLocaleString('en-IN');

const ordinal = (n: number) => {
  if (n % 100 >= 11 && n % 100 <= 13) return 'th';
  return ['th', 'st', 'nd', 'rd'][n % 10 > 3 ? 0 : n % 10];
};

interface ToastState {
  msg: string;
  action?: { label: string; to: string };
}

/** Currency-style superscript, top-aligned to the digits (as the "$" in the reference). */
function Sup({ children }: { children: React.ReactNode }) {
  return (
    <span className="ml-1 inline-block align-top font-sans text-[0.4em] font-normal leading-none text-white/80 mt-[0.3em]">
      {children}
    </span>
  );
}

/** Small baseline unit after a number, e.g. "/ 5", "/ 100", "urgent". */
function Unit({ children }: { children: React.ReactNode }) {
  return <span className="ml-2 font-sans text-[0.34em] font-normal tracking-normal text-white/70">{children}</span>;
}

function BigStat({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div title={hint}>
      <p className="text-[15px] text-white/85">{label}</p>
      <p className="mt-1.5 font-display text-[36px] font-light leading-none tracking-[-0.01em] text-white xl:text-[42px]">
        {children}
      </p>
    </div>
  );
}

function Metric({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <p className="text-[14px] text-white/75">{label}</p>
      <p className="mt-2 truncate pb-1.5 font-display text-[30px] font-light leading-[1.15] text-white xl:text-[34px]">
        {children}
      </p>
    </div>
  );
}

interface SideCardProps {
  icon: LucideIcon;
  title: string;
  caption: string;
  value: string;
  unit?: string;
  on: boolean;
  onToggle: (next: boolean) => void;
  toggleLabel: string;
  onEdit: () => void;
}

function SideCard({ icon: Icon, title, caption, value, unit, on, onToggle, toggleLabel, onEdit }: SideCardProps) {
  return (
    <div className="glass-dark flex min-h-[220px] flex-col justify-between rounded-[32px] p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3.5">
          <span className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full bg-white/85 text-[#17231c]">
            <Icon size={22} strokeWidth={1.6} />
          </span>
          <h3 className="whitespace-pre-line font-display text-[17px] font-light leading-snug tracking-[0.02em] text-white">
            {title}
          </h3>
        </div>
        <button onClick={onEdit} className="glass-btn h-11 w-11" aria-label={`Edit ${toggleLabel}`}>
          <Pencil size={16} strokeWidth={1.6} />
        </button>
      </div>
      <div>
        <p className="text-[12.5px] text-white/70">{caption}</p>
        <div className="mt-2 flex items-end justify-between gap-3">
          <p className="font-display text-[50px] font-light leading-none text-white">
            {value}
            {unit && <Unit>{unit}</Unit>}
          </p>
          <XCToggle on={on} onChange={onToggle} label={toggleLabel} />
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────── page ─────────────────────────────── */

export default function OverviewPage() {
  const navigate = useNavigate();

  const [filter, setFilter] = useState<Filter>('All');
  const [day, setDay] = useState(13);
  const [planKey, setPlanKey] = useState<(typeof plans)[number]['key']>('tent');
  const [driverKey, setDriverKey] = useState<(typeof drivers)[number]['key']>('heating');
  const [escalate, setEscalate] = useState(true);
  const [weeklyReport, setWeeklyReport] = useState(true);
  const [toast, setToast] = useState<ToastState | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3600);
    return () => clearTimeout(t);
  }, [toast]);

  const say = (msg: string, action?: ToastState['action']) => setToast({ msg, action });

  const activeFilter = filters.find((f) => f.key === filter)!;
  const plan = plans.find((p) => p.key === planKey)!;
  const driver = drivers.find((d) => d.key === driverKey)!;
  const maxDriver = Math.max(...drivers.map((d) => d.amount));

  const scopedStaff = useMemo(
    () => staffMembers.filter((s) => filter === 'All' || s.department === filter),
    [filter],
  );
  const urgentCount = useMemo(
    () =>
      whatsAppComplaints.filter(
        (c) =>
          (filter === 'All' || c.department === filter) &&
          c.category === 'high_attention' &&
          c.status !== 'resolved',
      ).length,
    [filter],
  );
  const avgScore = scopedStaff.length
    ? Math.round(scopedStaff.reduce((s, m) => s + m.performanceScore, 0) / scopedStaff.length)
    : 0;

  const arrivals = ARRIVALS_BY_WEEKDAY_SLOT[day % 7];
  const estRevenue = arrivals * plan.rate;

  return (
    <div className="animate-fade-in">
      {/* ───────── Hero ───────── */}
      <section className="flex flex-col gap-8 lg:flex-row lg:items-center lg:gap-10">
        <div className="flex flex-wrap items-center gap-x-8 gap-y-5">
          <h1 className="font-display text-[42px] font-light leading-[1.1] tracking-[0.05em] text-white sm:text-[52px]">
            Resort
            <br />
            Overview
          </h1>
          <SegmentRing value={OCCUPANCY} />
        </div>

        <div className="grid flex-1 grid-cols-1 gap-6 sm:grid-cols-3 lg:gap-8 lg:pl-2">
          <BigStat label="Monthly revenue">
            {fmt(MONTHLY_REVENUE)}
            <Sup>₹</Sup>
          </BigStat>
          <BigStat label="Reputation index">
            3.57
            <Unit>/ 5</Unit>
          </BigStat>
          <BigStat
            label="Revenue at risk"
            hint="Estimated from open high-attention complaints and negative reviews"
          >
            {fmt(REVENUE_AT_RISK)}
            <Sup>₹</Sup>
          </BigStat>
        </div>
      </section>

      {/* ───────── Department filter ───────── */}
      <section className="mt-8 flex items-center justify-between gap-4 sm:mt-10">
        <div className="scrollbar-none -mx-1 flex min-w-0 items-center gap-1 overflow-x-auto px-1">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              aria-pressed={filter === f.key}
              className={`whitespace-nowrap rounded-full px-5 py-3 text-[15px] transition ${
                filter === f.key
                  ? 'bg-white/[0.2] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.22)]'
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
              }`}
            >
              {f.label}
            </button>
          ))}
          <button
            onClick={() => say('Custom departments are part of the full HotelOS app')}
            className="glass-btn ml-1 h-11 w-11"
            aria-label="Add department"
          >
            <Plus size={18} strokeWidth={1.6} />
          </button>
        </div>
        <div className="hidden items-center gap-3 sm:flex">
          <button
            onClick={() => say('Owner report exported (demo)')}
            className="glass-btn h-11 w-11"
            aria-label="Export report"
          >
            <Upload size={16} strokeWidth={1.6} />
          </button>
          <button
            onClick={() => say('Dashboard preferences are part of the full app')}
            className="glass-btn h-11 w-11"
            aria-label="Dashboard settings"
          >
            <Settings size={16} strokeWidth={1.6} />
          </button>
        </div>
      </section>

      {/* ───────── Main grid ───────── */}
      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
        <section className="glass-dark min-w-0 rounded-[32px] p-5 sm:rounded-[36px] sm:p-7">
          {/* Top row: department icon · staff avatars · actions */}
          <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-3">
            <span className="glass-btn hidden h-12 w-12 sm:inline-flex" title={activeFilter.label}>
              <activeFilter.icon size={20} strokeWidth={1.5} />
            </span>

            <div className="flex items-center">
              <div className="flex items-center -space-x-1.5 sm:-space-x-3">
                {scopedStaff.slice(0, 5).map((s) => (
                  <div
                    key={s.id}
                    title={`${s.name} · ${s.role} · score ${s.performanceScore}`}
                    className={`flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br sm:h-12 sm:w-12 ${
                      avatarGradients[staffMembers.indexOf(s) % avatarGradients.length]
                    } font-display text-[12px] font-normal text-white ring-2 ring-[#233229] sm:text-[13px]`}
                  >
                    {s.initials}
                  </div>
                ))}
              </div>
              <button
                onClick={() => say('Staff onboarding is part of the full HotelOS app')}
                className="glass-btn -ml-1 h-11 w-11"
                aria-label="Add staff"
              >
                <Plus size={18} strokeWidth={1.6} />
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => say('Editing is disabled in the demo')}
                className="glass-btn h-11 w-11"
                aria-label="Edit"
              >
                <Pencil size={16} strokeWidth={1.6} />
              </button>
              <button
                onClick={() => say(insights[filter])}
                className="glass-btn h-11 w-11"
                aria-label="AI insight"
                title="AI insight"
              >
                <Sparkles size={16} strokeWidth={1.6} />
              </button>
            </div>
          </div>

          {/* Decorative slider */}
          <div className="relative mx-auto mt-5 h-6 w-full max-w-[420px]" aria-hidden>
            <div className="absolute left-0 right-0 top-1/2 h-px -translate-y-1/2 bg-white/45" />
            <span className="absolute left-0 top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full bg-white/80 ring-4 ring-white/10" />
            <span className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/85 bg-[#2a3a31]" />
            <span className="absolute right-0 top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full bg-white/80 ring-4 ring-white/10" />
          </div>

          {/* Three frosted tiles */}
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
            {/* Calendar */}
            <div className="glass-tile flex min-h-[236px] flex-col rounded-[30px] p-5">
              <p className="text-[14px] text-white/85">Check-in date</p>
              <div className="mt-3 grid grid-cols-7 gap-y-1 text-center text-[12.5px]">
                {Array.from({ length: 30 }, (_, i) => i + 1).map((d) => (
                  <button
                    key={d}
                    onClick={() => setDay(d)}
                    aria-pressed={day === d}
                    className={`mx-auto aspect-square w-full max-w-[30px] rounded-full tabular-nums transition ${
                      day === d ? 'bg-white/35 text-white' : 'text-white/75 hover:bg-white/15'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Rate plan */}
            <div className="glass-tile flex min-h-[236px] flex-col rounded-[30px] p-5">
              <p className="text-[14px] text-white/85">Rate plan</p>
              <div className="mt-3 flex flex-wrap gap-2.5">
                {plans.map((p) => (
                  <button
                    key={p.key}
                    onClick={() => setPlanKey(p.key)}
                    data-active={planKey === p.key}
                    className="opt-pill px-4 py-1.5 text-[13px]"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
              <p className="mt-auto pt-4 font-display text-[44px] font-light leading-[1.1] text-white">
                {fmt(plan.rate)}
                <Sup>₹</Sup>
                <span className="ml-2 inline-block whitespace-nowrap font-sans text-[14px] text-white/80">/ night</span>
              </p>
            </div>

            {/* Loss drivers */}
            <div className="glass-tile flex min-h-[236px] flex-col rounded-[30px] p-5">
              <p className="text-[14px] text-white/85">Revenue at risk by cause</p>
              <div className="mt-3 grid flex-1 grid-cols-3 items-end gap-2.5">
                {drivers.map((d) => (
                  <div key={d.key} className="flex flex-col items-center gap-2">
                    <span className="text-[11px] tabular-nums text-white/85">{fmt(d.amount)}₹</span>
                    <div
                      style={{ height: Math.round(22 + (d.amount / maxDriver) * 86) }}
                      className={`w-full rounded-[14px] transition-all duration-500 ${
                        driverKey === d.key ? 'bg-white/45' : 'bg-white/[0.18]'
                      }`}
                    />
                    <button
                      onClick={() => setDriverKey(d.key)}
                      data-active={driverKey === d.key}
                      className="opt-pill w-full px-1 py-1.5 text-[12px]"
                    >
                      {d.label}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Summary row */}
          <div className="mt-6 grid grid-cols-2 items-end gap-x-6 gap-y-5 sm:grid-cols-[1fr_0.8fr_1.15fr_1.1fr_auto]">
            <Metric label="Check-in date">
              {day}
              <span className="ml-0.5 inline-block align-top font-sans text-[0.42em] leading-none text-white/80 mt-[0.3em]">{ordinal(day)}</span>
              <span className="ml-1.5 font-sans text-[0.45em] text-white/80">/ Oct</span>
            </Metric>
            <Metric label="Arrivals">{arrivals}</Metric>
            <Metric label="Est. revenue">
              {fmt(estRevenue)}
              <Sup>₹</Sup>
            </Metric>
            <Metric label="Loss driver">{driver.label}</Metric>
            <button
              onClick={() =>
                say(`Statement for ${day}${ordinal(day)} Oct generated · ₹${fmt(estRevenue)}`, {
                  label: 'Open billing',
                  to: '/app/hotelos?tab=billing',
                })
              }
              className="glass-btn col-span-2 h-12 w-12 justify-self-end sm:col-span-1"
              aria-label="Generate daily statement"
            >
              <Check size={19} strokeWidth={1.7} />
            </button>
          </div>
        </section>

        {/* ───────── Side cards ───────── */}
        <aside className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-1 lg:grid-rows-2">
          <SideCard
            icon={MessageCircle}
            title={'WhatsApp\nComplaints'}
            caption={filter === 'All' ? 'High attention · open now' : `${activeFilter.label} · high attention open`}
            value={String(urgentCount)}
            unit="urgent"
            on={escalate}
            onToggle={(next) => {
              setEscalate(next);
              say(
                next
                  ? 'Auto-escalation on: high-attention calls alert the GM instantly'
                  : 'Auto-escalation paused: high-attention calls stay in the queue',
              );
            }}
            toggleLabel="Auto-escalate complaints"
            onEdit={() => navigate('/app/hotelos?tab=complaints')}
          />
          <SideCard
            icon={Users}
            title={'Staff\nPerformance'}
            caption={filter === 'All' ? 'Average score · this week' : `${activeFilter.label} · average score`}
            value={String(avgScore)}
            unit="/ 100"
            on={weeklyReport}
            onToggle={(next) => {
              setWeeklyReport(next);
              say(next ? 'Weekly staff report will be sent every Monday' : 'Weekly staff report turned off');
            }}
            toggleLabel="Weekly staff report"
            onEdit={() => navigate('/app/hotelos?tab=staff')}
          />
        </aside>
      </div>

      {/* ───────── Toast ───────── */}
      {toast && (
        <div
          role="status"
          className="glass-dark animate-fade-in fixed bottom-6 left-1/2 z-50 flex max-w-[92vw] -translate-x-1/2 items-center gap-4 rounded-full px-5 py-3 text-[13.5px] text-white shadow-2xl"
        >
          <span>{toast.msg}</span>
          {toast.action && (
            <button
              onClick={() => navigate(toast.action!.to)}
              className="shrink-0 rounded-full bg-white/20 px-3 py-1 text-[12px] hover:bg-white/30"
            >
              {toast.action.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
