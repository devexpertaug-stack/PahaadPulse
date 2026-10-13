import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Building2, Phone, Users, Receipt } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import OccupancyTab from './hotelos/OccupancyTab';
import ComplaintsTab from './hotelos/ComplaintsTab';
import StaffTab from './hotelos/StaffTab';
import BillingTab from './hotelos/BillingTab';

type Tab = 'occupancy' | 'complaints' | 'staff' | 'billing';

const tabs: { key: Tab; label: string; icon: typeof Building2; subtitle: string }[] = [
  { key: 'occupancy', label: 'Occupancy', icon: Building2, subtitle: 'Live operations snapshot' },
  { key: 'complaints', label: 'WhatsApp Complaints', icon: Phone, subtitle: 'In-room call & chat complaint triage' },
  { key: 'staff', label: 'Staff Performance', icon: Users, subtitle: 'Who is excelling, who needs coaching' },
  { key: 'billing', label: 'Billing', icon: Receipt, subtitle: 'Generate and track guest bills' },
];

export default function HotelOSPage() {
  const [params] = useSearchParams();
  const requested = params.get('tab');
  const [tab, setTab] = useState<Tab>(
    tabs.some((t) => t.key === requested) ? (requested as Tab) : 'occupancy',
  );
  const active = tabs.find((t) => t.key === tab)!;

  return (
    <div>
      <PageHeader title="Hotel OS & Occupancy" subtitle={`PahaadPulse Eco Resort – Auli — ${active.subtitle}`} />

      <div className="glass-pill mb-6 flex w-fit max-w-full items-center gap-1 overflow-x-auto rounded-full p-1 scrollbar-none">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition ${
              tab === t.key ? 'bg-white/[0.17] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]' : 'text-white/75 hover:text-white hover:bg-white/[0.07]'
            }`}
          >
            <t.icon size={14} />
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'occupancy' && <OccupancyTab />}
      {tab === 'complaints' && <ComplaintsTab />}
      {tab === 'staff' && <StaffTab />}
      {tab === 'billing' && <BillingTab />}
    </div>
  );
}
