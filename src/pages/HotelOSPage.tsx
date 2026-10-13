import { useState } from 'react';
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
  const [tab, setTab] = useState<Tab>('occupancy');
  const active = tabs.find((t) => t.key === tab)!;

  return (
    <div>
      <PageHeader title="Hotel OS & Occupancy" subtitle={`PahaadPulse Eco Resort – Auli — ${active.subtitle}`} />

      <div className="flex items-center gap-1 bg-black/30 border border-emerald-900/40 rounded-full p-1 mb-6 w-fit overflow-x-auto scrollbar-none">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition ${
              tab === t.key ? 'bg-emerald-500 text-black' : 'text-gray-300 hover:text-white hover:bg-white/5'
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
