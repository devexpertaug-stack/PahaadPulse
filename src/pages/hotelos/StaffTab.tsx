import { TrendingUp, TrendingDown, Minus, Award, ThumbsDown } from 'lucide-react';
import StatCard from '../../components/StatCard';
import { staffMembers } from '../../data/mockData';
import type { StaffStatus } from '../../types';

const statusStyle: Record<StaffStatus, string> = {
  'Top Performer': 'bg-emerald-500/15 text-emerald-300 border-emerald-700/30',
  Average: 'bg-amber-500/15 text-amber-300 border-amber-700/30',
  'Needs Coaching': 'bg-red-500/15 text-red-300 border-red-700/30',
};

const scoreColor = (score: number) => (score >= 80 ? '#34d399' : score >= 65 ? '#fbbf24' : '#f87171');

export default function StaffTab() {
  const topPerformers = staffMembers.filter((s) => s.status === 'Top Performer').length;
  const needsCoaching = staffMembers.filter((s) => s.status === 'Needs Coaching').length;
  const avgScore = Math.round(staffMembers.reduce((s, m) => s + m.performanceScore, 0) / staffMembers.length);

  const sorted = [...staffMembers].sort((a, b) => b.performanceScore - a.performanceScore);

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Avg Performance" value={`${avgScore}/100`} sub="Across all departments" icon={TrendingUp} />
        <StatCard label="Top Performers" value={String(topPerformers)} sub="Score above 85" icon={Award} />
        <StatCard label="Needs Coaching" value={String(needsCoaching)} sub="Score below 65" icon={ThumbsDown} accent="red" />
        <StatCard label="Total Staff Tracked" value={String(staffMembers.length)} sub="5 departments" icon={Minus} accent="blue" />
      </div>

      <div className="glass-card rounded-3xl overflow-hidden">
        <div className="hidden sm:grid grid-cols-[2fr_1fr_1.2fr_0.8fr_0.8fr_0.8fr_1fr] gap-2 px-4 py-3 border-b border-emerald-900/30 text-[11px] font-semibold text-gray-500 uppercase">
          <span>Staff</span>
          <span>Department</span>
          <span>Score</span>
          <span>Tasks</span>
          <span>Praised</span>
          <span>Flagged</span>
          <span>Status</span>
        </div>
        <div className="divide-y divide-emerald-900/30">
          {sorted.map((s) => (
            <div
              key={s.id}
              className="grid grid-cols-2 sm:grid-cols-[2fr_1fr_1.2fr_0.8fr_0.8fr_0.8fr_1fr] gap-2 px-4 py-3.5 items-center hover:bg-white/[0.02] transition"
            >
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-full bg-emerald-600/20 border border-emerald-700/30 flex items-center justify-center text-[11px] font-bold text-emerald-300 shrink-0">
                  {s.initials}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white truncate">{s.name}</p>
                  <p className="text-[11px] text-gray-500 truncate">{s.role}</p>
                </div>
              </div>
              <span className="text-xs text-gray-400 sm:block">{s.department}</span>
              <div className="flex items-center gap-2 col-span-2 sm:col-span-1">
                <div className="h-1.5 flex-1 max-w-[80px] rounded-full bg-black/40 overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${s.performanceScore}%`, background: scoreColor(s.performanceScore) }}
                  />
                </div>
                <span className="text-xs font-semibold text-white">{s.performanceScore}</span>
                {s.trend === 'up' && <TrendingUp size={12} className="text-emerald-400" />}
                {s.trend === 'down' && <TrendingDown size={12} className="text-red-400" />}
                {s.trend === 'flat' && <Minus size={12} className="text-gray-500" />}
              </div>
              <span className="text-xs text-gray-400">{s.tasksCompleted}</span>
              <span className="text-xs text-emerald-400">+{s.positiveMentions}</span>
              <span className="text-xs text-red-400">{s.complaintsAgainst > 0 ? s.complaintsAgainst : '—'}</span>
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border w-fit ${statusStyle[s.status]}`}>
                {s.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
