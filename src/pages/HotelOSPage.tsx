import { useSearchParams } from 'react-router-dom';
import { Building2, Phone, Receipt, Users } from 'lucide-react';
import PageHero from '../components/ui/PageHero';
import OccupancyTab from './hotelos/OccupancyTab';
import ComplaintsTab from './hotelos/ComplaintsTab';
import StaffTab from './hotelos/StaffTab';
import BillingTab from './hotelos/BillingTab';

type Tab = 'occupancy' | 'complaints' | 'staff' | 'billing';

const tabs: { key: Tab; label: string; icon: typeof Building2; subtitle: string }[] = [
  { key: 'occupancy', label: 'Occupancy', icon: Building2, subtitle: 'Rooms, arrivals and today’s tasks' },
  { key: 'complaints', label: 'WhatsApp complaints', icon: Phone, subtitle: 'In-room calls and chats, triaged automatically' },
  { key: 'staff', label: 'Staff performance', icon: Users, subtitle: 'Who is excelling and who needs coaching' },
  { key: 'billing', label: 'Billing', icon: Receipt, subtitle: 'Generate, print and track guest invoices' },
];

export default function HotelOSPage() {
  const [params, setParams] = useSearchParams();
  const requested = params.get('tab');
  const tab: Tab = tabs.some((t) => t.key === requested) ? (requested as Tab) : 'occupancy';
  const active = tabs.find((t) => t.key === tab)!;

  return (
    <div className="animate-fade-in">
      <PageHero title="Hotel OS" subtitle={active.subtitle} />

      <div className="glass-pill scrollbar-none mb-6 flex w-fit max-w-full items-center gap-1 overflow-x-auto rounded-full p-[5px]" role="tablist" aria-label="Hotel OS sections">
        {tabs.map((t) => (
          <button
            key={t.key}
            role="tab"
            aria-selected={tab === t.key}
            onClick={() => setParams({ tab: t.key }, { replace: true })}
            className={`flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-[9px] text-[13.5px] transition ${
              tab === t.key
                ? 'bg-white/[0.17] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]'
                : 'text-white/75 hover:bg-white/[0.07] hover:text-white'
            }`}
          >
            <t.icon size={15} strokeWidth={1.7} />
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
