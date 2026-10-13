import { useState } from 'react';
import { Plus, Receipt, Trash2, Printer } from 'lucide-react';
import StatCard from '../../components/StatCard';
import { bills as initialBills, rooms } from '../../data/mockData';
import type { Bill, BillItem } from '../../types';

function emptyItem(): BillItem {
  return { description: '', qty: 1, rate: 0 };
}

export default function BillingTab() {
  const [bills, setBills] = useState<Bill[]>(initialBills);
  const [showForm, setShowForm] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [room, setRoom] = useState(rooms[0]?.number ?? '');
  const [items, setItems] = useState<BillItem[]>([emptyItem()]);

  const totalRevenue = bills.reduce(
    (sum, b) => sum + b.items.reduce((s, it) => s + it.qty * it.rate, 0),
    0
  );
  const pending = bills.filter((b) => b.status === 'Pending').length;

  const updateItem = (idx: number, patch: Partial<BillItem>) => {
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
  };

  const addItem = () => setItems((prev) => [...prev, emptyItem()]);
  const removeItem = (idx: number) => setItems((prev) => prev.filter((_, i) => i !== idx));

  const generateBill = () => {
    if (!guestName.trim() || items.every((i) => !i.description.trim())) return;
    const newBill: Bill = {
      id: `b${bills.length + 1}`,
      guestName,
      room,
      checkIn: '13/10/2026',
      checkOut: '13/10/2026',
      items: items.filter((i) => i.description.trim()),
      status: 'Pending',
      createdAt: '13/10/2026',
    };
    setBills((prev) => [newBill, ...prev]);
    setGuestName('');
    setItems([emptyItem()]);
    setShowForm(false);
  };

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard label="Total Billed" value={`₹${totalRevenue.toLocaleString('en-IN')}`} sub="All generated bills" icon={Receipt} />
        <StatCard label="Pending Payments" value={String(pending)} sub="Awaiting checkout settlement" icon={Receipt} accent="amber" />
        <StatCard label="Bills Generated" value={String(bills.length)} sub="This season" icon={Receipt} accent="blue" />
      </div>

      <div className="flex justify-end mb-4">
        <button
          onClick={() => setShowForm((s) => !s)}
          className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-sm px-4 py-2 rounded-lg transition"
        >
          <Plus size={14} /> {showForm ? 'Close' : 'Generate New Bill'}
        </button>
      </div>

      {showForm && (
        <div className="glass-card rounded-3xl p-4 mb-6 animate-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            <div>
              <label className="block text-[11px] text-gray-400 mb-1">Guest Name</label>
              <input
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="e.g. Rahul Verma"
                className="w-full rounded-lg bg-[#0f1c15] border border-emerald-900/50 px-3 py-2 text-sm text-gray-100 placeholder:text-gray-500 outline-none focus:border-emerald-500/60"
              />
            </div>
            <div>
              <label className="block text-[11px] text-gray-400 mb-1">Room</label>
              <select
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                className="w-full rounded-lg bg-[#0f1c15] border border-emerald-900/50 px-3 py-2 text-sm text-gray-100 outline-none focus:border-emerald-500/60"
              >
                {rooms.map((r) => (
                  <option key={r.number} value={r.number}>
                    {r.number} — {r.type}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <p className="text-[11px] text-gray-400 mb-2">Bill Items</p>
          <div className="space-y-2 mb-3">
            {items.map((item, idx) => (
              <div key={idx} className="grid grid-cols-[1fr_60px_80px_28px] gap-2 items-center">
                <input
                  value={item.description}
                  onChange={(e) => updateItem(idx, { description: e.target.value })}
                  placeholder="Description e.g. Deluxe Room x2 nights"
                  className="rounded-lg bg-[#0f1c15] border border-emerald-900/50 px-3 py-2 text-xs text-gray-100 placeholder:text-gray-500 outline-none focus:border-emerald-500/60"
                />
                <input
                  type="number"
                  value={item.qty}
                  onChange={(e) => updateItem(idx, { qty: Number(e.target.value) })}
                  className="rounded-lg bg-[#0f1c15] border border-emerald-900/50 px-2 py-2 text-xs text-gray-100 outline-none focus:border-emerald-500/60"
                />
                <input
                  type="number"
                  value={item.rate}
                  onChange={(e) => updateItem(idx, { rate: Number(e.target.value) })}
                  placeholder="₹ rate"
                  className="rounded-lg bg-[#0f1c15] border border-emerald-900/50 px-2 py-2 text-xs text-gray-100 placeholder:text-gray-500 outline-none focus:border-emerald-500/60"
                />
                <button onClick={() => removeItem(idx)} className="text-gray-500 hover:text-red-400">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between">
            <button onClick={addItem} className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
              <Plus size={12} /> Add item
            </button>
            <button
              onClick={generateBill}
              className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-sm px-4 py-2 rounded-lg transition"
            >
              Generate Bill
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {bills.map((bill) => {
          const total = bill.items.reduce((s, it) => s + it.qty * it.rate, 0);
          return (
            <div key={bill.id} className="glass-card rounded-3xl p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-sm font-semibold text-white">{bill.guestName}</p>
                  <p className="text-[11px] text-gray-500">
                    Room {bill.room} · {bill.checkIn} – {bill.checkOut}
                  </p>
                </div>
                <span
                  className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${
                    bill.status === 'Paid'
                      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-700/30'
                      : 'bg-amber-500/15 text-amber-300 border-amber-700/30'
                  }`}
                >
                  {bill.status}
                </span>
              </div>

              <div className="space-y-1.5 mb-3 pb-3 border-b border-emerald-900/30">
                {bill.items.map((it, i) => (
                  <div key={i} className="flex items-center justify-between text-xs text-gray-400">
                    <span>
                      {it.description} {it.qty > 1 && <span className="text-gray-600">× {it.qty}</span>}
                    </span>
                    <span className="text-gray-300">₹{(it.qty * it.rate).toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-white">
                  Total: ₹{total.toLocaleString('en-IN')}
                </span>
                <button className="flex items-center gap-1.5 text-xs text-emerald-400 border border-emerald-700/40 rounded-full px-3 py-1.5 hover:bg-emerald-500/10 transition">
                  <Printer size={12} /> Print
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
