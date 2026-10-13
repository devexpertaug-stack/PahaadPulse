import { useState } from 'react';
import { Phone, MessageCircle, AlertTriangle, Smile, Minus } from 'lucide-react';
import StatCard from '../../components/StatCard';
import { whatsAppComplaints as initial } from '../../data/mockData';
import type { ComplaintCategory, ComplaintStatus, WhatsAppComplaint } from '../../types';

const categoryStyle: Record<ComplaintCategory, { label: string; cls: string; icon: typeof Smile }> = {
  positive: { label: 'Positive', cls: 'text-emerald-400 bg-emerald-500/10 border-emerald-700/30', icon: Smile },
  neutral: { label: 'Neutral', cls: 'text-amber-400 bg-amber-500/10 border-amber-700/30', icon: Minus },
  high_attention: { label: 'High Attention', cls: 'text-red-400 bg-red-500/10 border-red-700/30', icon: AlertTriangle },
};

const statusStyle: Record<ComplaintStatus, string> = {
  open: 'bg-red-500/15 text-red-300 border-red-700/30',
  in_progress: 'bg-amber-500/15 text-amber-300 border-amber-700/30',
  resolved: 'bg-emerald-500/15 text-emerald-300 border-emerald-700/30',
};

const statusLabel: Record<ComplaintStatus, string> = {
  open: 'Open',
  in_progress: 'In Progress',
  resolved: 'Resolved',
};

export default function ComplaintsTab() {
  const [complaints, setComplaints] = useState<WhatsAppComplaint[]>(initial);
  const [filter, setFilter] = useState<ComplaintCategory | 'all'>('all');

  const cycleStatus = (id: string) => {
    setComplaints((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const next: ComplaintStatus = c.status === 'open' ? 'in_progress' : c.status === 'in_progress' ? 'resolved' : 'open';
        return { ...c, status: next };
      })
    );
  };

  const highAttention = complaints.filter((c) => c.category === 'high_attention').length;
  const positive = complaints.filter((c) => c.category === 'positive').length;
  const open = complaints.filter((c) => c.status === 'open').length;

  const filtered = filter === 'all' ? complaints : complaints.filter((c) => c.category === filter);

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total WhatsApp Calls" value={String(complaints.length)} sub="Last 24 hours" icon={Phone} accent="blue" />
        <StatCard label="High Attention" value={String(highAttention)} sub="Needs urgent action" icon={AlertTriangle} accent="red" />
        <StatCard label="Positive Mentions" value={String(positive)} sub="Guest appreciation" icon={Smile} />
        <StatCard label="Open Tickets" value={String(open)} sub="Awaiting resolution" icon={MessageCircle} accent="amber" />
      </div>

      <div className="flex items-center gap-2 mb-4 flex-wrap">
        {(['all', 'high_attention', 'neutral', 'positive'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-xs font-medium px-3 py-1.5 rounded-full border transition ${
              filter === f
                ? 'bg-emerald-500 text-black border-emerald-500'
                : 'text-gray-300 border-emerald-900/40 bg-black/20 hover:border-emerald-700/50'
            }`}
          >
            {f === 'all' ? 'All' : categoryStyle[f].label}
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-emerald-900/40 bg-[#0b140e]/80 overflow-hidden">
        <div className="divide-y divide-emerald-900/30">
          {filtered.map((c) => {
            const Icon = categoryStyle[c.category].icon;
            return (
              <div key={c.id} className="p-4 flex items-start gap-3 hover:bg-white/[0.02] transition">
                <div className="h-9 w-9 rounded-full bg-emerald-600/15 border border-emerald-700/30 flex items-center justify-center shrink-0 mt-0.5">
                  {c.channel === 'WhatsApp Call' ? (
                    <Phone size={14} className="text-emerald-400" />
                  ) : (
                    <MessageCircle size={14} className="text-emerald-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                    <p className="text-sm font-semibold text-white">
                      {c.guestName} <span className="text-gray-500 font-normal">· Room {c.room}</span>
                    </p>
                    <span className="text-[11px] text-gray-500">{c.timestamp}</span>
                  </div>
                  <p className="text-sm text-gray-300 mb-2">{c.message}</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border ${categoryStyle[c.category].cls}`}>
                      <Icon size={10} /> {categoryStyle[c.category].label}
                    </span>
                    <span className="text-[10px] text-gray-500 bg-white/5 px-2 py-0.5 rounded-full">{c.department}</span>
                    <button
                      onClick={() => cycleStatus(c.id)}
                      className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${statusStyle[c.status]} hover:opacity-80 transition`}
                    >
                      {statusLabel[c.status]}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
