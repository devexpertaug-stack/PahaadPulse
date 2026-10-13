import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BedDouble, CalendarCheck, Check, IndianRupee, LogIn, LogOut, Percent, Plus, Receipt, Trash2, Wrench } from 'lucide-react';
import Card from '../../components/ui/Card';
import Stat, { StatGrid } from '../../components/ui/Stat';
import Badge from '../../components/ui/Badge';
import Segmented from '../../components/ui/Segmented';
import Modal from '../../components/ui/Modal';
import Empty from '../../components/ui/Empty';
import { priorityTone, roomTone } from '../../components/ui/tones';
import { useApp } from '../../store/AppStore';
import { RATES } from '../../data/seed';
import { fmtINR, uid } from '../../lib/format';
import type { Department, OperationalTask, Room, RoomStatus, TaskPriority } from '../../types';

const DEPARTMENTS: Department[] = ['Housekeeping', 'Front Desk', 'Food & Beverage', 'Maintenance', 'Security'];
const SOURCE_LABEL: Record<string, string> = {
  review: 'from a review',
  complaint: 'from a complaint',
  insight: 'from insights',
  room: 'from rooms',
};

function RoomModal({ room, onClose }: { room: Room; onClose: () => void }) {
  const { dispatch, say } = useApp();
  const navigate = useNavigate();
  const [guest, setGuest] = useState('');

  const roomTask = (title: string, department: Department, priority: TaskPriority): OperationalTask => ({
    id: uid('t'),
    title,
    priority,
    department,
    source: 'room',
    refId: room.number,
  });

  const set = (status: RoomStatus, message: string, task?: OperationalTask) => {
    dispatch({ type: 'room/set', number: room.number, status, guest: status === 'Occupied' ? guest : undefined, task });
    say(message);
    onClose();
  };

  return (
    <Modal title={`Room ${room.number}`} onClose={onClose}>
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <Badge tone={roomTone[room.status]}>{room.status}</Badge>
        <span className="text-[13px] text-white/70">
          {room.type} · ₹{fmtINR(RATES[room.type] ?? 0)} / night
        </span>
      </div>
      {room.guest && <p className="mb-5 text-[14px] text-white/85">Guest: {room.guest}</p>}

      <div className="grid gap-2.5">
        {room.status === 'Occupied' && (
          <>
            <button
              onClick={() => {
                onClose();
                navigate(`/app/hotelos?tab=billing&room=${encodeURIComponent(room.number)}`);
              }}
              className="btn-glass justify-start"
            >
              <Receipt size={15} /> Generate bill for this stay
            </button>
            <button
              onClick={() =>
                set(
                  'Cleaning',
                  `Room ${room.number} checked out — cleaning task created`,
                  roomTask(`Deep-clean ${room.type} ${room.number} after checkout`, 'Housekeeping', 'Medium'),
                )
              }
              className="btn-primary justify-start"
            >
              <LogOut size={15} /> Check out guest
            </button>
          </>
        )}
        {room.status === 'Ready' && (
          <div className="rounded-2xl border border-white/10 bg-black/15 p-3.5">
            <label className="field-label" htmlFor="walkin">
              Walk-in guest name
            </label>
            <div className="flex gap-2">
              <input id="walkin" className="field" value={guest} onChange={(e) => setGuest(e.target.value)} placeholder="e.g. Aisha Khan" />
              <button
                disabled={!guest.trim()}
                onClick={() => set('Occupied', `${guest.trim()} checked into room ${room.number}`)}
                className="btn-primary"
              >
                <LogIn size={15} /> Check in
              </button>
            </div>
          </div>
        )}
        {room.status !== 'Ready' && (
          <button onClick={() => set('Ready', `Room ${room.number} is ready for arrival`)} className="btn-glass justify-start">
            <Check size={15} /> Mark ready
          </button>
        )}
        {room.status === 'Ready' && (
          <button
            onClick={() =>
              set('Cleaning', `Room ${room.number} sent for cleaning`, roomTask(`Clean ${room.type} ${room.number}`, 'Housekeeping', 'Low'))
            }
            className="btn-glass justify-start"
          >
            <BedDouble size={15} /> Send for cleaning
          </button>
        )}
        {(room.status === 'Ready' || room.status === 'Cleaning') && (
          <button
            onClick={() =>
              set(
                'Maintenance',
                `Room ${room.number} blocked for maintenance — task created`,
                roomTask(`Inspect and repair ${room.type} ${room.number}`, 'Maintenance', 'Medium'),
              )
            }
            className="btn-glass justify-start"
          >
            <Wrench size={15} /> Block for maintenance
          </button>
        )}
      </div>
    </Modal>
  );
}

function TaskRow({ task }: { task: OperationalTask }) {
  const { dispatch, say } = useApp();

  const toggle = () => {
    dispatch({ type: 'task/toggle', id: task.id });
    if (task.done) return;
    if (task.source === 'room') say(`Room ${task.refId} is ready again`);
    else if (task.source === 'complaint') say('Linked complaint marked resolved');
    else if (task.source === 'insight') say('Marked resolved — revenue at risk updated');
  };

  return (
    <li className="flex items-start gap-3 rounded-2xl border border-white/10 bg-black/15 p-3.5">
      <button
        onClick={toggle}
        role="checkbox"
        aria-checked={!!task.done}
        aria-label={`${task.done ? 'Reopen' : 'Complete'}: ${task.title}`}
        className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition ${
          task.done ? 'border-emerald-200/50 bg-emerald-300/25 text-emerald-100' : 'border-white/30 text-transparent hover:border-white/60 hover:text-white/40'
        }`}
      >
        <Check size={14} />
      </button>
      <div className="min-w-0 flex-1">
        <p className={`text-[14px] leading-snug ${task.done ? 'text-white/45 line-through' : 'text-white/90'}`}>{task.title}</p>
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          <Badge tone={priorityTone[task.priority]}>{task.priority}</Badge>
          <span className="text-[12px] text-white/55">{task.department}</span>
          {task.source && SOURCE_LABEL[task.source] && <span className="text-[12px] text-white/40">· {SOURCE_LABEL[task.source]}</span>}
        </div>
      </div>
      <button
        onClick={() => dispatch({ type: 'task/remove', id: task.id })}
        className="shrink-0 rounded-full p-1.5 text-white/40 transition hover:bg-white/10 hover:text-rose-200"
        aria-label={`Delete task: ${task.title}`}
      >
        <Trash2 size={14} />
      </button>
    </li>
  );
}

export default function OccupancyTab() {
  const { state, dispatch, say, occ, revenue } = useApp();
  const [filter, setFilter] = useState<'all' | RoomStatus>('all');
  const [selected, setSelected] = useState<string | null>(null);
  const [taskFilter, setTaskFilter] = useState<'open' | 'done' | 'all'>('open');
  const [title, setTitle] = useState('');
  const [dept, setDept] = useState<Department>('Housekeeping');
  const [priority, setPriority] = useState<TaskPriority>('Medium');

  const count = (s: RoomStatus) => state.rooms.filter((r) => r.status === s).length;
  const rooms = state.rooms.filter((r) => filter === 'all' || r.status === filter);
  const room = state.rooms.find((r) => r.number === selected) ?? null;

  const pendingArrivals = state.arrivals.filter((a) => !a.checkedIn).length;
  const tasks = state.tasks.filter((t) => (taskFilter === 'all' ? true : taskFilter === 'done' ? t.done : !t.done));
  const openTasks = state.tasks.filter((t) => !t.done).length;

  const checkIn = (id: string) => {
    const a = state.arrivals.find((x) => x.id === id);
    if (!a) return;
    const free = state.rooms.find((r) => r.type === a.roomType && r.status === 'Ready');
    if (!free) {
      say(`No ${a.roomType} is ready — finish cleaning or maintenance on one first`);
      return;
    }
    dispatch({ type: 'arrival/checkin', id, room: free.number });
    say(`${a.guest} checked into room ${free.number}`);
  };

  const addTask = () => {
    if (!title.trim()) return;
    dispatch({ type: 'task/add', task: { id: uid('t'), title: title.trim(), priority, department: dept, source: 'manual' } });
    setTitle('');
    say('Task added');
  };

  return (
    <div>
      <StatGrid>
        <Stat label="Occupancy" value={`${occ.pct}%`} sub="Peak winter season" icon={Percent} />
        <Stat label="Rooms occupied" value={`${occ.occupied} / ${occ.total}`} sub={`${occ.ready} ready for arrival`} icon={BedDouble} />
        <Stat label="Arrivals today" value={String(state.arrivals.length)} sub={`${pendingArrivals} pending check-in`} icon={CalendarCheck} />
        <Stat label="Revenue (MTD)" value={`₹${(revenue / 100000).toFixed(1)}L`} sub="+18% vs last month" icon={IndianRupee} />
      </StatGrid>

      <div className="mb-5 grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Card
          title="Room status board"
          eyebrow="Tap a room to manage it"
          right={
            <Segmented<'all' | RoomStatus>
              label="Filter rooms"
              value={filter}
              onChange={setFilter}
              options={[
                { key: 'all', label: 'All', count: state.rooms.length },
                { key: 'Occupied', label: 'Occupied', count: count('Occupied') },
                { key: 'Ready', label: 'Ready', count: count('Ready') },
                { key: 'Cleaning', label: 'Cleaning', count: count('Cleaning') },
                { key: 'Maintenance', label: 'Maint.', count: count('Maintenance') },
              ]}
            />
          }
        >
          {rooms.length === 0 ? (
            <Empty>No rooms with this status.</Empty>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4" data-testid="room-board">
              {rooms.map((r) => (
                <button
                  key={r.number}
                  onClick={() => setSelected(r.number)}
                  aria-label={`Room ${r.number}, ${r.status}`}
                  className="glass-card rounded-2xl p-3.5 text-left transition hover:bg-white/[0.08]"
                >
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <span className="font-display text-[16px] font-light text-white">{r.number}</span>
                    <Badge tone={roomTone[r.status]}>{r.status}</Badge>
                  </div>
                  <p className="truncate text-[12px] text-white/55">{r.type}</p>
                  <p className="mt-0.5 truncate text-[12.5px] text-white/80">{r.guest ?? '—'}</p>
                </button>
              ))}
            </div>
          )}
        </Card>

        <Card title="Today’s arrivals" eyebrow={`${state.arrivals.length - pendingArrivals} of ${state.arrivals.length} checked in`}>
          <ul className="space-y-2.5">
            {state.arrivals.map((a) => (
              <li key={a.id} className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/15 p-3">
                <div className="min-w-0">
                  <p className="truncate text-[14px] text-white">{a.guest}</p>
                  <p className="truncate text-[12px] text-white/55">
                    {a.roomType} · {a.nights}n · {a.pax} guests
                  </p>
                </div>
                {a.checkedIn ? (
                  <Badge tone="emerald">Room {a.room}</Badge>
                ) : (
                  <button onClick={() => checkIn(a.id)} className="btn-primary btn-sm" aria-label={`Check in ${a.guest}`}>
                    <LogIn size={13} /> Check in
                  </button>
                )}
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card
        title="Operational tasks"
        eyebrow={`${openTasks} open`}
        right={
          <Segmented<'open' | 'done' | 'all'>
            label="Filter tasks"
            value={taskFilter}
            onChange={setTaskFilter}
            options={[
              { key: 'open', label: 'Open' },
              { key: 'done', label: 'Done' },
              { key: 'all', label: 'All' },
            ]}
          />
        }
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            addTask();
          }}
          className="mb-4 grid grid-cols-1 gap-2.5 sm:grid-cols-[minmax(0,1fr)_auto_auto_auto]"
        >
          <input className="field" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Add a task, e.g. Restock firewood for bonfire" aria-label="New task" />
          <select className="field sm:w-auto" value={dept} onChange={(e) => setDept(e.target.value as Department)} aria-label="Department">
            {DEPARTMENTS.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
          <select className="field sm:w-auto" value={priority} onChange={(e) => setPriority(e.target.value as TaskPriority)} aria-label="Priority">
            {(['High', 'Medium', 'Low'] as const).map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
          <button type="submit" disabled={!title.trim()} className="btn-primary">
            <Plus size={15} /> Add
          </button>
        </form>

        {tasks.length === 0 ? (
          <Empty>{taskFilter === 'done' ? 'No completed tasks yet.' : 'All clear — no open tasks.'}</Empty>
        ) : (
          <ul className="grid grid-cols-1 gap-2.5 lg:grid-cols-2" data-testid="task-list">
            {tasks.map((t) => (
              <TaskRow key={t.id} task={t} />
            ))}
          </ul>
        )}
        <p className="mt-4 text-center text-[12px] text-white/45">
          Hotel OS raises tasks from reviews, complaints and insights — finishing them updates rooms, complaints and revenue at risk.
        </p>
      </Card>

      {room && <RoomModal room={room} onClose={() => setSelected(null)} />}
    </div>
  );
}
