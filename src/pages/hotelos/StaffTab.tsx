import { useState } from 'react';
import { Award, ChevronDown, GraduationCap, Minus, Star, ThumbsDown, TrendingDown, TrendingUp, Users } from 'lucide-react';
import Card from '../../components/ui/Card';
import Stat, { StatGrid } from '../../components/ui/Stat';
import Badge from '../../components/ui/Badge';
import Avatar from '../../components/ui/Avatar';
import Sparkline from '../../components/ui/Sparkline';
import { sentimentTone, toneHex } from '../../components/ui/tones';
import type { Tone } from '../../components/ui/tones';
import { useApp } from '../../store/AppStore';
import { staffStatus } from '../../lib/metrics';
import { uid } from '../../lib/format';
import type { StaffMember, StaffStatus } from '../../types';

const statusTone: Record<StaffStatus, Tone> = { 'Top Performer': 'emerald', Average: 'amber', 'Needs Coaching': 'rose' };
const scoreTone = (n: number): Tone => (n >= 85 ? 'emerald' : n >= 65 ? 'amber' : 'rose');

function StaffRow({ s, rank, index }: { s: StaffMember; rank: number; index: number }) {
  const { state, dispatch, say } = useApp();
  const [open, setOpen] = useState(false);
  const status = staffStatus(s.performanceScore);
  const assigned = state.complaints.filter((c) => c.assigneeId === s.id && c.status !== 'resolved').length;
  const tone = scoreTone(s.performanceScore);

  const toggleCoaching = () => {
    dispatch({ type: 'staff/coaching', id: s.id });
    if (s.coaching) {
      say(`${s.name} removed from the coaching list`);
      return;
    }
    const title = `Coaching session — ${s.name}`;
    if (!state.tasks.some((t) => t.title === title && !t.done)) {
      dispatch({
        type: 'task/add',
        task: { id: uid('t'), title, priority: 'Medium', department: s.department, source: 'manual' },
      });
    }
    say(`${s.name} flagged for coaching — session added to Hotel OS tasks`, { label: 'View tasks', to: '/app/hotelos' });
  };

  const toggleStar = () => {
    dispatch({ type: 'staff/star', id: s.id });
    say(s.starOfWeek ? 'Star of the week cleared' : `${s.name} is this week’s star`);
  };

  return (
    <li className="p-4 sm:p-5" data-testid="staff-row">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
        <span className="w-6 shrink-0 text-center font-display text-[15px] font-light text-white/45">{rank}</span>
        <Avatar initials={s.initials} index={index} size={44} />
        <div className="min-w-[150px] flex-1">
          <p className="flex flex-wrap items-center gap-2 text-[15px] text-white">
            {s.name}
            {s.starOfWeek && (
              <Badge tone="amber">
                <Star size={11} className="fill-current" /> Star of the week
              </Badge>
            )}
            {s.coaching && (
              <Badge tone="sky">
                <GraduationCap size={11} /> Coaching
              </Badge>
            )}
          </p>
          <p className="text-[12.5px] text-white/55">
            {s.role} · {s.department}
          </p>
        </div>

        <div className="flex w-[150px] items-center gap-2.5" title={`Score ${s.performanceScore}/100`}>
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-black/35">
            <div className="h-full rounded-full" style={{ width: `${s.performanceScore}%`, background: toneHex[tone] }} />
          </div>
          <span className="w-7 text-right font-display text-[15px] tabular-nums text-white">{s.performanceScore}</span>
          {s.trend === 'up' && <TrendingUp size={14} className="text-emerald-200" aria-label="Trending up" />}
          {s.trend === 'down' && <TrendingDown size={14} className="text-rose-200" aria-label="Trending down" />}
          {s.trend === 'flat' && <Minus size={14} className="text-white/45" aria-label="Flat" />}
        </div>

        <div className="hidden md:block" title="Weekly score, last 7 weeks">
          <Sparkline values={s.weekly} color={toneHex[tone]} min={40} max={100} />
        </div>

        <div className="flex items-center gap-4 text-[12.5px] tabular-nums">
          <span className="text-white/65" title="Tasks completed">
            {s.tasksCompleted} <span className="text-white/40">tasks</span>
          </span>
          <span className="text-emerald-200" title="Positive guest mentions">
            +{s.positiveMentions}
          </span>
          <span className={s.complaintsAgainst ? 'text-rose-200' : 'text-white/35'} title="Complaints against">
            {s.complaintsAgainst || '—'}
          </span>
        </div>

        <Badge tone={statusTone[status]}>{status}</Badge>
        <button
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-label={`${open ? 'Hide' : 'Show'} details for ${s.name}`}
          className="glass-btn h-9 w-9"
        >
          <ChevronDown size={16} className={`transition ${open ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {open && (
        <div className="animate-fade-in mt-4 rounded-2xl border border-white/10 bg-black/15 p-4 sm:ml-10">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-[12.5px] text-white/60">
              {assigned} open complaint{assigned === 1 ? '' : 's'} assigned · weekly scores {s.weekly.join(' → ')}
            </p>
            <div className="flex flex-wrap gap-2">
              <button onClick={toggleStar} aria-pressed={!!s.starOfWeek} className="btn-glass btn-sm">
                <Star size={13} className={s.starOfWeek ? 'fill-amber-200 text-amber-200' : ''} />
                {s.starOfWeek ? 'Star of the week' : 'Make star of the week'}
              </button>
              <button onClick={toggleCoaching} aria-pressed={!!s.coaching} className={`btn-glass btn-sm ${s.coaching ? '!bg-sky-300/25' : ''}`}>
                <GraduationCap size={13} />
                {s.coaching ? 'Flagged for coaching' : 'Flag for coaching'}
              </button>
            </div>
          </div>
          <p className="mb-2 text-[11.5px] uppercase tracking-[0.14em] text-white/50">What guests said</p>
          <ul className="space-y-2">
            {s.feedback.map((f, i) => (
              <li key={i} className="flex items-start gap-3 rounded-xl bg-white/[0.05] px-3.5 py-2.5">
                <Badge tone={sentimentTone[f.sentiment]} className="mt-0.5 capitalize">
                  {f.sentiment}
                </Badge>
                <div className="min-w-0">
                  <p className="text-[13px] leading-relaxed text-white/85">“{f.text}”</p>
                  <p className="mt-0.5 text-[11.5px] text-white/45">{f.source}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </li>
  );
}

export default function StaffTab() {
  const { state, staffSum } = useApp();
  const ranked = [...state.staff].sort((a, b) => b.performanceScore - a.performanceScore);
  const flagged = state.staff.filter((s) => s.coaching).length;
  const departments = new Set(state.staff.map((s) => s.department)).size;

  return (
    <div>
      <StatGrid>
        <Stat label="Avg performance" value={`${staffSum.avg} / 100`} sub="Across all departments" icon={TrendingUp} />
        <Stat label="Top performers" value={String(staffSum.top)} sub="Score 85 and above" icon={Award} />
        <Stat label="Needs coaching" value={String(staffSum.coaching)} sub={flagged ? `${flagged} flagged for a session` : 'Score below 65'} icon={ThumbsDown} alert={staffSum.coaching > 0} />
        <Stat label="Staff tracked" value={String(state.staff.length)} sub={`${departments} departments`} icon={Users} />
      </StatGrid>

      <Card flush className="overflow-hidden">
        <ul className="divide-y divide-white/10" data-testid="staff-list">
          {ranked.map((s, i) => (
            <StaffRow key={s.id} s={s} rank={i + 1} index={state.staff.indexOf(s)} />
          ))}
        </ul>
      </Card>
      <p className="mt-3 px-1 text-[12px] text-white/45">
        Scores combine task completion with guest feedback from reviews and WhatsApp. Open a row to see what guests said.
      </p>
    </div>
  );
}
