import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Banknote, Check, FileText, Hourglass, Plus, Printer, Receipt, Trash2, X } from 'lucide-react';
import Card from '../../components/ui/Card';
import Stat, { StatGrid } from '../../components/ui/Stat';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import Empty from '../../components/ui/Empty';
import { useApp } from '../../store/AppStore';
import { invoiceNo } from '../../store/state';
import { HOTEL_NAME, QUICK_ITEMS, RATES } from '../../data/seed';
import { addDays, DEMO_TODAY, fmtDMY, fmtINR, uid } from '../../lib/format';
import { billGst, billSubtotal, billTotal } from '../../lib/metrics';
import type { Bill, BillItem } from '../../types';

const GST_RATES = [5, 12, 18];
/** room tariffs above ₹7,500 a night attract 18% GST, otherwise 12% (demo defaults) */
const defaultGst = (rate: number) => (rate > 7500 ? 18 : 12);

const inr = (n: number) => `₹${fmtINR(n)}`;

function InvoiceModal({ bill, onClose }: { bill: Bill; onClose: () => void }) {
  const { dispatch, say } = useApp();
  const subtotal = billSubtotal(bill);
  const gst = billGst(bill);

  return (
    <Modal title={`Invoice ${bill.invoiceNo}`} onClose={onClose} bare className="max-w-[660px]">
      <div className="print-area rounded-[24px] bg-[#f6f4ee] p-6 text-[#1b2a22] shadow-2xl sm:p-9" data-testid="invoice">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="font-display text-[22px] font-light tracking-[0.04em]">
              Pahaad<span className="text-[#1b2a22]/55">Pulse</span>
            </p>
            <p className="mt-1 text-[12.5px] text-[#1b2a22]/70">{HOTEL_NAME}</p>
            <p className="text-[12.5px] text-[#1b2a22]/70">Auli, Joshimath, Uttarakhand · GSTIN 05ABCDE1234F1Z5 (demo)</p>
          </div>
          <div className="text-right">
            <p className="text-[11px] uppercase tracking-[0.18em] text-[#1b2a22]/55">Tax invoice</p>
            <p className="font-display text-[18px] font-light">{bill.invoiceNo}</p>
            <p className="text-[12.5px] text-[#1b2a22]/70">{bill.createdAt}</p>
          </div>
        </div>

        <div className="my-6 grid grid-cols-2 gap-4 border-y border-[#1b2a22]/15 py-4 text-[13px]">
          <div>
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#1b2a22]/55">Billed to</p>
            <p className="mt-1 text-[15px]">{bill.guestName}</p>
            <p className="text-[#1b2a22]/70">Room {bill.room}</p>
          </div>
          <div className="text-right">
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#1b2a22]/55">Stay</p>
            <p className="mt-1">
              {bill.checkIn} → {bill.checkOut}
            </p>
            <p className={bill.status === 'Paid' ? 'text-emerald-700' : 'text-amber-700'}>{bill.status === 'Paid' ? 'Paid in full' : 'Payment pending'}</p>
          </div>
        </div>

        <table className="w-full text-left text-[13px]">
          <thead>
            <tr className="border-b border-[#1b2a22]/15 text-[11px] uppercase tracking-[0.12em] text-[#1b2a22]/55">
              <th className="pb-2 font-normal">Description</th>
              <th className="pb-2 text-right font-normal">Qty</th>
              <th className="pb-2 text-right font-normal">Rate</th>
              <th className="pb-2 text-right font-normal">Amount</th>
            </tr>
          </thead>
          <tbody>
            {bill.items.map((it, i) => (
              <tr key={i} className="border-b border-[#1b2a22]/10">
                <td className="py-2 pr-2">{it.description}</td>
                <td className="py-2 text-right tabular-nums">{it.qty}</td>
                <td className="py-2 text-right tabular-nums">{inr(it.rate)}</td>
                <td className="py-2 text-right tabular-nums">{inr(it.qty * it.rate)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <dl className="ml-auto mt-5 w-full max-w-[260px] space-y-1.5 text-[13px]">
          <div className="flex justify-between">
            <dt className="text-[#1b2a22]/70">Subtotal</dt>
            <dd className="tabular-nums">{inr(subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-[#1b2a22]/70">GST ({bill.gstRate}%)</dt>
            <dd className="tabular-nums">{inr(gst)}</dd>
          </div>
          <div className="flex justify-between border-t border-[#1b2a22]/25 pt-2 text-[16px]">
            <dt>Total</dt>
            <dd className="font-medium tabular-nums">{inr(subtotal + gst)}</dd>
          </div>
        </dl>

        <p className="mt-8 text-center text-[12px] text-[#1b2a22]/55">Thank you for staying with us in the hills. This is a demo invoice.</p>
      </div>

      <div className="no-print mt-3 flex flex-wrap justify-end gap-2">
        {bill.status === 'Pending' && (
          <button
            onClick={() => {
              dispatch({ type: 'bill/paid', id: bill.id });
              say(`${bill.invoiceNo} marked as paid`);
            }}
            className="btn-glass"
          >
            <Check size={15} /> Mark paid
          </button>
        )}
        <button onClick={() => window.print()} className="btn-primary">
          <Printer size={15} /> Print
        </button>
        <button onClick={onClose} className="btn-glass">
          <X size={15} /> Close
        </button>
      </div>
    </Modal>
  );
}

export default function BillingTab() {
  const { state, dispatch, say } = useApp();
  const [params, setParams] = useSearchParams();
  const preset = params.get('room');

  const [showForm, setShowForm] = useState(!!preset);
  const [roomNo, setRoomNo] = useState(preset ?? state.rooms.find((r) => r.status === 'Occupied')?.number ?? state.rooms[0]?.number ?? '');
  const [guest, setGuest] = useState(() => state.rooms.find((r) => r.number === preset)?.guest ?? '');
  const [nights, setNights] = useState(1);
  const [includeRoom, setIncludeRoom] = useState(true);
  const [extra, setExtra] = useState<BillItem[]>([]);
  const [gstRate, setGstRate] = useState(() => {
    const r = state.rooms.find((x) => x.number === preset);
    return r ? defaultGst(RATES[r.type] ?? 0) : 12;
  });
  const [viewId, setViewId] = useState<string | null>(null);

  const room = state.rooms.find((r) => r.number === roomNo);
  const roomItem: BillItem | null =
    includeRoom && room
      ? { description: `${room.type} — ${nights} night${nights === 1 ? '' : 's'}`, qty: nights, rate: RATES[room.type] ?? 0 }
      : null;
  const items = [...(roomItem ? [roomItem] : []), ...extra.filter((i) => i.description.trim())];
  const draft = { items, gstRate };
  const subtotal = billSubtotal(draft);
  const gstAmount = billGst(draft);
  const total = billTotal(draft);
  const canSubmit = guest.trim().length > 0 && items.length > 0 && subtotal > 0;

  const totalBilled = state.bills.reduce((s, b) => s + billTotal(b), 0);
  const collected = state.bills.filter((b) => b.status === 'Paid').reduce((s, b) => s + billTotal(b), 0);
  const pendingBills = state.bills.filter((b) => b.status === 'Pending');
  const pendingAmount = pendingBills.reduce((s, b) => s + billTotal(b), 0);

  const pickRoom = (number: string) => {
    setRoomNo(number);
    const r = state.rooms.find((x) => x.number === number);
    if (r?.guest) setGuest(r.guest);
    if (r) setGstRate(defaultGst(RATES[r.type] ?? 0));
  };

  const addQuick = (description: string, rate: number) =>
    setExtra((prev) => {
      const at = prev.findIndex((i) => i.description === description);
      if (at === -1) return [...prev, { description, qty: 1, rate }];
      return prev.map((i, idx) => (idx === at ? { ...i, qty: i.qty + 1 } : i));
    });

  const patchExtra = (idx: number, patch: Partial<BillItem>) =>
    setExtra((prev) => prev.map((it, i) => (i === idx ? { ...it, ...patch } : it)));

  const closeForm = () => {
    setShowForm(false);
    if (params.has('room')) {
      const next = new URLSearchParams(params);
      next.delete('room');
      setParams(next, { replace: true });
    }
  };

  const generate = () => {
    if (!canSubmit) return;
    const id = uid('b');
    const no = invoiceNo(state.invoiceSeq);
    dispatch({
      type: 'bill/add',
      bill: {
        id,
        guestName: guest.trim(),
        room: roomNo,
        checkIn: fmtDMY(addDays(DEMO_TODAY, -nights)),
        checkOut: fmtDMY(DEMO_TODAY),
        items,
        gstRate,
        status: 'Pending',
        createdAt: fmtDMY(DEMO_TODAY),
      },
    });
    say(`Invoice ${no} generated · ${inr(total)}`);
    setViewId(id);
    setExtra([]);
    setNights(1);
    setIncludeRoom(true);
    closeForm();
  };

  const viewing = state.bills.find((b) => b.id === viewId) ?? null;

  return (
    <div>
      <StatGrid>
        <Stat label="Total billed" value={inr(totalBilled)} sub="All invoices incl. GST" icon={Receipt} />
        <Stat label="Collected" value={inr(collected)} sub={`${state.bills.length - pendingBills.length} paid invoices`} icon={Banknote} />
        <Stat label="Pending payments" value={inr(pendingAmount)} sub={`${pendingBills.length} awaiting settlement`} icon={Hourglass} alert={pendingBills.length > 0} />
        <Stat label="Invoices" value={String(state.bills.length)} sub="This season" icon={FileText} />
      </StatGrid>

      <div className="mb-4 flex justify-end">
        <button onClick={() => (showForm ? closeForm() : setShowForm(true))} className="btn-primary" aria-expanded={showForm}>
          {showForm ? <X size={15} /> : <Plus size={15} />}
          {showForm ? 'Close' : 'New invoice'}
        </button>
      </div>

      {showForm && (
        <Card title="New invoice" eyebrow={invoiceNo(state.invoiceSeq)} className="animate-fade-in mb-5">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[1.2fr_1.2fr_0.6fr_0.6fr]">
            <div>
              <label className="field-label" htmlFor="bl-room">
                Room
              </label>
              <select id="bl-room" className="field" value={roomNo} onChange={(e) => pickRoom(e.target.value)}>
                {[...state.rooms]
                  .sort((a, b) => Number(b.status === 'Occupied') - Number(a.status === 'Occupied'))
                  .map((r) => (
                    <option key={r.number} value={r.number}>
                      {r.number} — {r.guest ?? `${r.type} (vacant)`}
                    </option>
                  ))}
              </select>
            </div>
            <div>
              <label className="field-label" htmlFor="bl-guest">
                Guest name
              </label>
              <input id="bl-guest" className="field" value={guest} onChange={(e) => setGuest(e.target.value)} placeholder="e.g. Rahul Verma" />
            </div>
            <div>
              <label className="field-label" htmlFor="bl-nights">
                Nights
              </label>
              <input
                id="bl-nights"
                type="number"
                min={1}
                max={30}
                className="field"
                value={nights}
                onChange={(e) => setNights(Math.min(30, Math.max(1, Math.round(Number(e.target.value)) || 1)))}
              />
            </div>
            <div>
              <label className="field-label" htmlFor="bl-gst">
                GST
              </label>
              <select id="bl-gst" className="field" value={gstRate} onChange={(e) => setGstRate(Number(e.target.value))}>
                {GST_RATES.map((g) => (
                  <option key={g} value={g}>
                    {g}%
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between gap-3">
            <p className="text-[12.5px] text-white/70">Line items</p>
            <label className="flex cursor-pointer items-center gap-2 text-[12.5px] text-white/70">
              <input type="checkbox" checked={includeRoom} onChange={(e) => setIncludeRoom(e.target.checked)} className="h-4 w-4 accent-white" />
              Include room charge
            </label>
          </div>

          <div className="mt-2 space-y-2">
            {roomItem && (
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-2xl border border-white/10 bg-black/15 px-4 py-2.5 text-[13.5px] text-white/85">
                <span className="truncate">{roomItem.description}</span>
                <span className="tabular-nums text-white/70">
                  {roomItem.qty} × {inr(roomItem.rate)} = {inr(roomItem.qty * roomItem.rate)}
                </span>
              </div>
            )}
            {extra.map((it, idx) => (
              <div key={idx} className="grid grid-cols-[minmax(0,1fr)_64px_92px_36px] items-center gap-2">
                <input className="field !py-2 text-[13px]" aria-label="Item description" value={it.description} onChange={(e) => patchExtra(idx, { description: e.target.value })} placeholder="Description" />
                <input className="field !px-2 !py-2 text-center text-[13px]" aria-label="Quantity" type="number" min={1} value={it.qty} onChange={(e) => patchExtra(idx, { qty: Math.max(1, Math.round(Number(e.target.value)) || 1) })} />
                <input className="field !px-2 !py-2 text-[13px]" aria-label="Rate" type="number" min={0} value={it.rate} onChange={(e) => patchExtra(idx, { rate: Math.max(0, Number(e.target.value) || 0) })} placeholder="₹ rate" />
                <button onClick={() => setExtra((p) => p.filter((_, i) => i !== idx))} className="flex h-9 w-9 items-center justify-center rounded-full text-white/45 transition hover:bg-white/10 hover:text-rose-200" aria-label="Remove item">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-[12px] text-white/50">Quick add</span>
            {QUICK_ITEMS.map((q) => (
              <button key={q.description} onClick={() => addQuick(q.description, q.rate)} className="rounded-full bg-white/[0.08] px-3 py-1 text-[12px] text-white/75 transition hover:bg-white/[0.16] hover:text-white">
                + {q.description} · {inr(q.rate)}
              </button>
            ))}
            <button onClick={() => setExtra((p) => [...p, { description: '', qty: 1, rate: 0 }])} className="rounded-full border border-white/25 px-3 py-1 text-[12px] text-white/80 transition hover:bg-white/10">
              + Custom line
            </button>
          </div>

          <div className="mt-6 flex flex-wrap items-end justify-between gap-4 border-t border-white/10 pt-5">
            <dl className="grid grid-cols-3 gap-x-8 gap-y-1 text-[13px]" data-testid="bill-summary">
              <dt className="text-white/60">Subtotal</dt>
              <dt className="text-white/60">GST ({gstRate}%)</dt>
              <dt className="text-white/60">Total</dt>
              <dd className="tabular-nums text-white">{inr(subtotal)}</dd>
              <dd className="tabular-nums text-white">{inr(gstAmount)}</dd>
              <dd className="font-display text-[20px] font-light tabular-nums text-white">{inr(total)}</dd>
            </dl>
            <button onClick={generate} disabled={!canSubmit} className="btn-primary">
              <Receipt size={15} /> Generate invoice
            </button>
          </div>
        </Card>
      )}

      {state.bills.length === 0 ? (
        <Empty>No invoices yet — create the first one.</Empty>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2" data-testid="bill-list">
          {state.bills.map((b) => (
            <article key={b.id} className="glass-card flex min-w-0 flex-col rounded-[28px] p-5" data-testid="bill-card">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-display text-[17px] font-light text-white">{b.guestName}</p>
                  <p className="text-[12px] text-white/55">
                    {b.invoiceNo} · Room {b.room} · {b.checkIn} – {b.checkOut}
                  </p>
                </div>
                <Badge tone={b.status === 'Paid' ? 'emerald' : 'amber'}>{b.status}</Badge>
              </div>

              <ul className="mb-3 space-y-1.5 border-b border-white/10 pb-3">
                {b.items.slice(0, 3).map((it, i) => (
                  <li key={i} className="flex items-center justify-between gap-3 text-[13px] text-white/70">
                    <span className="truncate">
                      {it.description} {it.qty > 1 && <span className="text-white/40">× {it.qty}</span>}
                    </span>
                    <span className="shrink-0 tabular-nums text-white/85">{inr(it.qty * it.rate)}</span>
                  </li>
                ))}
                {b.items.length > 3 && <li className="text-[12px] text-white/45">+ {b.items.length - 3} more</li>}
                <li className="flex justify-between pt-1 text-[12px] text-white/50">
                  <span>GST {b.gstRate}%</span>
                  <span className="tabular-nums">{inr(billGst(b))}</span>
                </li>
              </ul>

              <div className="mt-auto flex flex-wrap items-center justify-between gap-2">
                <span className="font-display text-[20px] font-light tabular-nums text-white">{inr(billTotal(b))}</span>
                <div className="flex gap-2">
                  {b.status === 'Pending' && (
                    <button
                      onClick={() => {
                        dispatch({ type: 'bill/paid', id: b.id });
                        say(`${b.invoiceNo} marked as paid`);
                      }}
                      className="btn-glass btn-sm"
                    >
                      <Check size={13} /> Mark paid
                    </button>
                  )}
                  <button onClick={() => setViewId(b.id)} className="btn-primary btn-sm" aria-label={`View invoice ${b.invoiceNo}`}>
                    <Printer size={13} /> View / print
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {viewing && <InvoiceModal bill={viewing} onClose={() => setViewId(null)} />}
    </div>
  );
}
