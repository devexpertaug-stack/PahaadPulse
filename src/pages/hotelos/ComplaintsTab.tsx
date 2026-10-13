import { useMemo, useState } from 'react';
import { AlertTriangle, Check, ClipboardList, MessageCircle, Phone, Radio, Send, Smile, Minus } from 'lucide-react';
import Card from '../../components/ui/Card';
import Stat, { StatGrid } from '../../components/ui/Stat';
import Badge from '../../components/ui/Badge';
import Segmented from '../../components/ui/Segmented';
import Empty from '../../components/ui/Empty';
import { categoryLabel, categoryTone, statusLabel, statusTone, toneClass } from '../../components/ui/tones';
import { useApp } from '../../store/AppStore';
import { useActions } from '../../store/useActions';
import type { ComplaintCategory, ComplaintStatus, WhatsAppComplaint } from '../../types';

const CATEGORY_ICON = { positive: Smile, neutral: Minus, high_attention: AlertTriangle } as const;
const NEXT_STATUS: Record<ComplaintStatus, ComplaintStatus> = { open: 'in_progress', in_progress: 'resolved', resolved: 'open' };

function ComplaintRow({ c }: { c: WhatsAppComplaint }) {
  const { state, dispatch, say } = useApp();
  const { raiseComplaintTask } = useActions();
  const Icon = CATEGORY_ICON[c.category];
  const taskRaised = state.tasks.some((t) => t.source === 'complaint' && t.refId === c.id);
  // staff of the routed department first, then everyone else
  const staffOptions = useMemo(
    () => [...state.staff].sort((a, b) => Number(b.department === c.department) - Number(a.department === c.department)),
    [state.staff, c.department],
  );

  const advance = () => {
    const next = NEXT_STATUS[c.status];
    dispatch({ type: 'complaint/status', id: c.id, status: next });
    if (next === 'resolved') say(`Complaint from ${c.guestName} marked resolved`);
  };

  return (
    <li className="flex flex-col gap-3 p-4 transition hover:bg-white/[0.03] sm:flex-row sm:items-start sm:p-5" data-testid="complaint-row">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/10">
        {c.channel === 'WhatsApp Call' ? <Phone size={16} className="text-white/85" /> : <MessageCircle size={16} className="text-white/85" />}
      </div>
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex flex-wrap items-baseline justify-between gap-x-3">
          <p className="text-[14.5px] text-white">
            {c.guestName} <span className="text-white/50">· Room {c.room}</span>
          </p>
          <span className="text-[12px] text-white/50">{c.timestamp}</span>
        </div>
        <p className="mb-3 text-[14px] leading-relaxed text-white/80">{c.message}</p>
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={categoryTone[c.category]}>
            <Icon size={11} /> {categoryLabel[c.category]}
          </Badge>
          <Badge tone="slate">{c.department}</Badge>
          <button
            onClick={advance}
            className={`chip cursor-pointer transition hover:opacity-80 ${toneClass[statusTone[c.status]]}`}
            aria-label={`Status: ${statusLabel[c.status]}. Click to change`}
            title="Click to move to the next status"
          >
            {statusLabel[c.status]}
          </button>
          <label className="ml-auto flex items-center gap-2 text-[12px] text-white/55">
            Assigned to
            <select
              className="field !w-auto !rounded-full !py-1 !pl-3 !pr-2 !text-[12.5px]"
              value={c.assigneeId ?? ''}
              aria-label={`Assign complaint from ${c.guestName}`}
              onChange={(e) => {
                dispatch({ type: 'complaint/assign', id: c.id, staffId: e.target.value || undefined });
                const s = state.staff.find((x) => x.id === e.target.value);
                if (s) say(`Assigned to ${s.name}`);
              }}
            >
              <option value="">Unassigned</option>
              {staffOptions.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>
          <button onClick={() => raiseComplaintTask(c)} className="btn-glass btn-sm">
            {taskRaised ? <Check size={13} /> : <ClipboardList size={13} />}
            {taskRaised ? 'Task raised' : 'Create task'}
          </button>
        </div>
      </div>
    </li>
  );
}

export default function ComplaintsTab() {
  const { state } = useApp();
  const { logComplaint, simulateIncoming } = useActions();
  const [category, setCategory] = useState<'all' | ComplaintCategory>('all');
  const [status, setStatus] = useState<'all' | ComplaintStatus>('all');
  const [room, setRoom] = useState('');
  const [channel, setChannel] = useState<WhatsAppComplaint['channel']>('WhatsApp Text');
  const [message, setMessage] = useState('');

  const occupied = state.rooms.filter((r) => r.status === 'Occupied' && r.guest);
  const complaints = state.complaints;

  const count = (f: (c: WhatsAppComplaint) => boolean) => complaints.filter(f).length;
  const urgent = count((c) => c.category === 'high_attention' && c.status !== 'resolved');
  const positive = count((c) => c.category === 'positive');
  const open = count((c) => c.status === 'open');

  const filtered = complaints.filter(
    (c) => (category === 'all' || c.category === category) && (status === 'all' || c.status === status),
  );

  const submit = () => {
    const target = occupied.find((r) => r.number === room) ?? occupied[0];
    if (!message.trim() || !target) return;
    logComplaint({ guest: target.guest!, room: target.number, message, channel });
    setMessage('');
  };

  return (
    <div>
      <StatGrid>
        <Stat label="WhatsApp messages" value={String(complaints.length)} sub="Calls and chats today" icon={Phone} />
        <Stat label="High attention" value={String(urgent)} sub="Open and urgent" icon={AlertTriangle} alert={urgent > 0} />
        <Stat label="Positive mentions" value={String(positive)} sub="Guest appreciation" icon={Smile} />
        <Stat label="Open tickets" value={String(open)} sub="Waiting for an owner" icon={MessageCircle} />
      </StatGrid>

      <Card
        eyebrow="Triage"
        title="Log a guest message"
        className="mb-5"
        right={
          <button onClick={simulateIncoming} className="btn-glass btn-sm" aria-label="Simulate an incoming WhatsApp message">
            <Radio size={13} /> Simulate incoming
          </button>
        }
      >
        <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <div>
            <label className="field-label" htmlFor="cm-room">
              Room
            </label>
            <select id="cm-room" className="field" value={room || occupied[0]?.number || ''} onChange={(e) => setRoom(e.target.value)}>
              {occupied.map((r) => (
                <option key={r.number} value={r.number}>
                  {r.number} — {r.guest}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="field-label" htmlFor="cm-channel">
              Channel
            </label>
            <select id="cm-channel" className="field" value={channel} onChange={(e) => setChannel(e.target.value as WhatsAppComplaint['channel'])}>
              <option>WhatsApp Text</option>
              <option>WhatsApp Call</option>
            </select>
          </div>
        </div>
        <div className="mt-3">
          <label className="field-label" htmlFor="cm-msg">
            Message
          </label>
          <textarea
            id="cm-msg"
            className="field resize-none"
            rows={2}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="e.g. There is no hot water in the bathroom, please send someone immediately."
          />
        </div>
        <div className="mt-3 flex items-center justify-between gap-3">
          <p className="text-[12px] text-white/50">The message is classified, routed to a department and assigned automatically.</p>
          <button onClick={submit} disabled={!message.trim() || occupied.length === 0} className="btn-primary">
            <Send size={14} /> Classify & log
          </button>
        </div>
      </Card>

      <div className="mb-3 flex flex-col gap-1 lg:flex-row lg:items-center lg:justify-between">
        <Segmented<'all' | ComplaintCategory>
          label="Filter by category"
          value={category}
          onChange={setCategory}
          options={[
            { key: 'all', label: 'All', count: complaints.length },
            { key: 'high_attention', label: 'High attention', count: count((c) => c.category === 'high_attention') },
            { key: 'neutral', label: 'Neutral', count: count((c) => c.category === 'neutral') },
            { key: 'positive', label: 'Positive', count: positive },
          ]}
        />
        <Segmented<'all' | ComplaintStatus>
          label="Filter by status"
          value={status}
          onChange={setStatus}
          options={[
            { key: 'all', label: 'Any status' },
            { key: 'open', label: 'Open', count: open },
            { key: 'in_progress', label: 'In progress', count: count((c) => c.status === 'in_progress') },
            { key: 'resolved', label: 'Resolved', count: count((c) => c.status === 'resolved') },
          ]}
        />
      </div>

      <Card flush className="overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-5 sm:p-6">
            <Empty>No messages match these filters.</Empty>
          </div>
        ) : (
          <ul className="divide-y divide-white/10" data-testid="complaint-list">
            {filtered.map((c) => (
              <ComplaintRow key={c.id} c={c} />
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
