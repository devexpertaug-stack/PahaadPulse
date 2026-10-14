import { useMemo, useState } from 'react';
import { Check, Crown, Sparkles } from 'lucide-react';
import PageHero from '../components/ui/PageHero';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { useApp } from '../store/AppStore';
import { fmtINR } from '../lib/format';

type PlanKey = 'quarterly' | 'yearly' | 'biennial';

interface Plan {
  key: PlanKey;
  name: string;
  price: number;
  months: number;
  tag?: string;
}

const PLANS: Plan[] = [
  { key: 'quarterly', name: 'Quarterly', price: 3999, months: 3 },
  { key: 'yearly', name: 'Yearly', price: 13999, months: 12, tag: 'Most popular' },
  { key: 'biennial', name: '2 Years', price: 27998, months: 24, tag: 'Best value' },
];

/** everything is included in every plan — the plans differ only by billing period */
const FEATURES = [
  'Multi-channel review intelligence & AI replies',
  'WhatsApp complaint triage & auto-routing',
  'Staff performance scoring & coaching',
  'Revenue-at-risk insights & recommended actions',
  'Full Hotel OS: occupancy, tasks & GST billing',
  'Web scraper with credit optimiser',
  'Priority support for your property',
];

export default function SubscriptionPage() {
  const { say } = useApp();
  const [selected, setSelected] = useState<PlanKey>('yearly');

  // the quarterly rate is the baseline; show the effective monthly cost + savings
  const baselineMonthly = PLANS[0].price / PLANS[0].months;
  const rows = useMemo(
    () =>
      PLANS.map((p) => {
        const perMonth = p.price / p.months;
        const fullPrice = baselineMonthly * p.months;
        const savePct = Math.round((1 - p.price / fullPrice) * 100);
        return { ...p, perMonth, savePct };
      }),
    [baselineMonthly],
  );

  const subscribe = (p: Plan) => say(`${p.name} plan selected · ₹${fmtINR(p.price)} (demo — no payment taken)`);

  return (
    <div className="animate-fade-in">
      <PageHero
        title="Subscription"
        subtitle="One simple plan with everything included — choose how often you want to be billed. Longer terms cost less per month."
      />

      <div className="mb-5 grid grid-cols-1 gap-5 md:grid-cols-3">
        {rows.map((p) => {
          const active = selected === p.key;
          return (
            <Card
              key={p.key}
              className={`relative flex flex-col transition ${active ? 'ring-2 ring-white/40' : ''}`}
            >
              {p.tag && (
                <span className="absolute right-5 top-5">
                  <Badge tone={p.key === 'yearly' ? 'emerald' : 'amber'}>
                    {p.key === 'yearly' ? <Crown size={11} /> : <Sparkles size={11} />} {p.tag}
                  </Badge>
                </span>
              )}
              <p className="font-display text-[17px] font-light tracking-[0.02em] text-white">{p.name}</p>
              <p className="mt-3 font-display text-[40px] font-light leading-none text-white">
                ₹{fmtINR(p.price)}
                <span className="ml-2 font-sans text-[14px] text-white/60">/ {p.months} mo</span>
              </p>
              <p className="mt-2 text-[13px] text-white/65">≈ ₹{fmtINR(p.perMonth)} per month</p>
              {p.savePct > 0 ? (
                <p className="mt-1 text-[13px] text-emerald-200">Save {p.savePct}% vs quarterly</p>
              ) : (
                <p className="mt-1 text-[13px] text-white/40">Billed every quarter</p>
              )}

              <button
                onClick={() => {
                  setSelected(p.key);
                  subscribe(p);
                }}
                className={`mt-6 ${active ? 'btn-primary' : 'btn-glass'} w-full justify-center`}
              >
                {active ? 'Selected' : 'Choose plan'}
              </button>
            </Card>
          );
        })}
      </div>

      <Card title="Everything included in every plan" eyebrow="Features">
        <ul className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
          {FEATURES.map((f) => (
            <li key={f} className="flex items-start gap-2.5 text-[14px] text-white/85">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-300/20 text-emerald-200">
                <Check size={13} strokeWidth={2.4} />
              </span>
              {f}
            </li>
          ))}
        </ul>
        <p className="mt-5 text-[12px] text-white/45">
          Prices in INR, inclusive of taxes. This is a demo — no payment is processed and no card is required.
        </p>
      </Card>
    </div>
  );
}
