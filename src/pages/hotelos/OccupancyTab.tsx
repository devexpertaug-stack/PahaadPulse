import { Percent, BedDouble, CalendarCheck, IndianRupee } from 'lucide-react';
import StatCard from '../../components/StatCard';
import { rooms, operationalTasks } from '../../data/mockData';
import type { TaskPriority } from '../../types';

const roomStatusStyle: Record<string, string> = {
  Occupied: 'bg-blue-500/15 text-blue-300 border-blue-700/30',
  Ready: 'bg-emerald-500/15 text-emerald-300 border-emerald-700/30',
  Cleaning: 'bg-amber-500/15 text-amber-300 border-amber-700/30',
  Maintenance: 'bg-red-500/15 text-red-300 border-red-700/30',
};

const priorityStyle: Record<TaskPriority, string> = {
  High: 'bg-red-500/15 text-red-300 border-red-700/30',
  Medium: 'bg-amber-500/15 text-amber-300 border-amber-700/30',
  Low: 'bg-gray-500/15 text-gray-300 border-gray-700/30',
};

export default function OccupancyTab() {
  const occupied = rooms.filter((r) => r.status === 'Occupied').length;

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Occupancy" value="82%" sub="Peak winter season" icon={Percent} />
        <StatCard label="Rooms Occupied" value={`${occupied} / ${rooms.length + 16}`} sub="4 ready for arrival" icon={BedDouble} accent="blue" />
        <StatCard label="Arrivals Today" value="7" sub="3 pending check-in" icon={CalendarCheck} accent="amber" />
        <StatCard label="Revenue (MTD)" value="₹9.4L" sub="+18% vs last month" icon={IndianRupee} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 glass-card rounded-3xl p-4">
          <p className="text-sm font-semibold text-white mb-4">Room Status Board</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {rooms.map((room) => (
              <div key={room.number} className="rounded-lg border border-emerald-900/40 bg-black/20 p-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-semibold text-white">{room.number}</span>
                  <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full border ${roomStatusStyle[room.status]}`}>
                    {room.status}
                  </span>
                </div>
                <p className="text-[11px] text-gray-500">{room.type}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">{room.guest ?? '—'}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card rounded-3xl p-4">
          <p className="text-sm font-semibold text-white mb-4">Open Operational Tasks</p>
          <div className="space-y-3">
            {operationalTasks.map((task) => (
              <div key={task.id} className="rounded-lg bg-black/20 border border-emerald-900/30 p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full border ${priorityStyle[task.priority]}`}>
                    {task.priority.toUpperCase()}
                  </span>
                  <span className="text-[10px] text-gray-500">{task.department}</span>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed">{task.title}</p>
              </div>
            ))}
            <p className="text-[11px] text-gray-500 text-center pt-1">
              HotelOS auto-generates tasks from complaints and reviews
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
