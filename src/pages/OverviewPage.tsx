import { useMemo, useState } from 'react';
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
import { avatarGradient } from '../components/ui/Avatar';
import { useApp } from '../store/AppStore';
import { fmtINR, ordinal } from '../lib/format';
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

/** Forecast of arrivals on other dates (today's number comes from the live arrivals list). */
const ARRIVALS_BY_WEEKDAY_SLOT = [5, 4, 6, 3, 8, 5, 7]; // index = day % 7
const TODAY = 13;

/* ───────────────────────────── helpers ───────────────────────────── */

const fmt = fmtINR;

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
  const { state, dispatch, say, rep, risk, occ, staffSum, revenue } = useApp();

  const [filter, setFilter] = useState<Filter>('All');
  const [day, setDay] = useState(TODAY);
  const [planKey, setPlanKey] = useState<(typeof plans)[number]['key']>('tent');
  const [driverKey, setDriverKey] = useState<'wifi' | 'service' | 'heating'>('heating');

  // where revenue is leaking, straight from the live review + complaint data
  const drivers = useMemo(
    () =>
      [
        { key: 'wifi', label: 'Wi-Fi', amount: risk.byGroup['Wi-Fi'] },
        { key: 'service', label: 'Service', amount: risk.byGroup.Service },
        { key: 'heating', label: 'Heating', amount: risk.byGroup.Heating },
      ] as const,
    [risk],
  );

  const activeFilter = filters.find((f) => f.key === filter)!;
  const plan = plans.find((p) => p.key === planKey)!;
  const driver = drivers.find((d) => d.key === driverKey)!;
  const maxDriver = Math.max(1, ...drivers.map((d) => d.amount));

  const scopedStaff = useMemo(
    () => state.staff.filter((s) => filter === 'All' || s.department === filter),
    [filter, state.staff],
  );
  const urgentCount = useMemo(
    () =>
      state.complaints.filter(
        (c) =>
          (filter === 'All' || c.department === filter) &&
          c.category === 'high_attention' &&
          c.status !== 'resolved',
      ).length,
    [filter, state.complaints],
  );
  const avgScore =
    filter === 'All'
      ? staffSum.avg
      : scopedStaff.length
        ? Math.round(scopedStaff.reduce((s, m) => s + m.performanceScore, 0) / scopedStaff.length)
        : 0;

  const arrivals = day === TODAY ? state.arrivals.length : ARRIVALS_BY_WEEKDAY_SLOT[day % 7];
  const estRevenue = arrivals * plan.rate;

  /** One-line AI insight for the current department filter, from live data. */
  const insight = (() => {
    if (filter === 'All') {
      if (risk.total === 0) return 'Nothing is costing you bookings right now — keep it up.';
      const [name, amount] = (Object.entries(risk.byGroup) as [string, number][]).sort((a, b) => b[1] - a[1])[0];
      return `${name} issues drive ${Math.round((amount / risk.total) * 100)}% of revenue at risk — fix those first to recover the most.`;
    }
    if (scopedStaff.length === 0) return 'No staff tracked in this department yet.';
    const best = [...scopedStaff].sort((a, b) => b.performanceScore - a.performanceScore)[0];
    const worst = [...scopedStaff].sort((a, b) => a.performanceScore - b.performanceScore)[0];
    const open = state.complaints.filter((c) => c.department === filter && c.status !== 'resolved').length;
    const tail = open ? ` ${open} open guest message${open === 1 ? '' : 's'} need attention.` : ' No open guest messages.';
    return best.id === worst.id
      ? `${filter} averages ${avgScore} — ${best.name} scores ${best.performanceScore}.${tail}`
      : `${filter} averages ${avgScore} — ${best.name} leads at ${best.performanceScore}, ${worst.name} trails at ${worst.performanceScore}.${tail}`;
  })();

  const exportReport = () => {
    const esc = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
    const rows = [
      ['Guest', 'Channel', 'Rating', 'Date', 'Sentiment', 'Tags', 'Review'],
      ...state.reviews.map((r) => [r.guestName, r.source, r.rating, r.date, r.sentiment, r.tags.join(' '), r.text]),
    ];
    const blob = new Blob([rows.map((r) => r.map(esc).join(',')).join('\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pahaadpulse-owner-report.csv';
    a.click();
    URL.revokeObjectURL(url);
    say(`Owner report downloaded · ${state.reviews.length} reviews`);
  };

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
          <SegmentRing value={occ.pct} />
        </div>

        <div className="grid flex-1 grid-cols-1 gap-6 sm:grid-cols-3 lg:gap-8 lg:pl-2">
          <BigStat label="Monthly revenue">
            {fmt(revenue)}
            <Sup>₹</Sup>
          </BigStat>
          <BigStat label="Reputation index">
            {rep.avg.toFixed(2)}
            <Unit>/ 5</Unit>
          </BigStat>
          <BigStat
            label="Revenue at risk"
            hint="Estimated from open high-attention complaints and negative reviews"
          >
            {fmt(risk.total)}
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
            onClick={exportReport}
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
                    className={`flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br sm:h-12 sm:w-12 ${avatarGradient(
                      state.staff.indexOf(s),
                    )} font-display text-[12px] font-normal text-white ring-2 ring-[#233229] sm:text-[13px]`}
                  >
                    {s.initials}
                  </div>
                ))}
              </div>
              <button
                onClick={() => navigate('/app/hotelos?tab=staff')}
                className="glass-btn -ml-1 h-11 w-11"
                aria-label="Add staff"
              >
                <Plus size={18} strokeWidth={1.6} />
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/app/hotelos')}
                className="glass-btn h-11 w-11"
                aria-label="Edit"
              >
                <Pencil size={16} strokeWidth={1.6} />
              </button>
              <button
                onClick={() => say(insight)}
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
            on={state.autoEscalate}
            onToggle={(next) => {
              dispatch({ type: 'pref', key: 'autoEscalate', value: next });
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
            on={state.weeklyReport}
            onToggle={(next) => {
              dispatch({ type: 'pref', key: 'weeklyReport', value: next });
              say(next ? 'Weekly staff report will be sent every Monday' : 'Weekly staff report turned off');
            }}
            toggleLabel="Weekly staff report"
            onEdit={() => navigate('/app/hotelos?tab=staff')}
          />
        </aside>
      </div>
    </div>
  );
}
