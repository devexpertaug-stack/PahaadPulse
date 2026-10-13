import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Cloud, Eye, EyeOff, Mountain, X } from 'lucide-react';
import SegmentRing from '../components/overview/SegmentRing';

const features = ['Review intelligence', 'WhatsApp complaints', 'Staff performance', 'Billing'];

const inputCls =
  'w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3.5 text-[15px] text-white outline-none transition focus:border-white/35 focus:bg-black/30 focus:ring-2 focus:ring-white/10';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showToast, setShowToast] = useState(true);
  const navigate = useNavigate();

  const fillDemo = () => {
    setEmail('gm@pahaadpulse.in');
    setPassword('auli@2026');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/app/overview');
  };

  return (
    <div className="leaf-bg flex flex-col justify-center px-3 py-4 sm:px-6 sm:py-8 lg:px-10">
      <div className="glass-shell mx-auto w-full max-w-[1120px] rounded-[28px] px-5 py-6 sm:rounded-[40px] sm:px-10 sm:py-8">
        {/* ───────── Top bar ───────── */}
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-white">
            <Mountain size={30} strokeWidth={1.5} />
            <span className="font-display text-[15px] font-light tracking-[0.12em]">
              Pahaad<span className="text-white/60">Pulse</span>
            </span>
          </div>
          <div className="glass-pill flex items-center gap-2 rounded-full px-4 py-2 text-[12px] text-white/80">
            <Cloud size={14} className="text-white/70" />
            <span>Auli · Rishikesh</span>
            <span className="text-white/30">|</span>
            <span>14°C mist</span>
            <span className="hidden items-center gap-2 sm:flex">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-300" />
              Heavy bookings · Peak season
            </span>
          </div>
        </header>

        {/* ───────── Body ───────── */}
        <div className="mt-9 grid items-center gap-10 sm:mt-12 lg:grid-cols-[minmax(0,1fr)_420px] lg:gap-14">
          {/* Hero */}
          <section>
            <h1 className="font-display text-[36px] font-light leading-[1.1] tracking-[0.05em] text-white sm:text-[50px] lg:text-[58px]">
              Hotel
              <br />
              Intelligence
            </h1>
            <p className="mt-5 max-w-md text-[16px] leading-relaxed text-white/75">
              AI review intelligence and HotelOS for Uttarakhand eco-tourism hospitality — see how your
              property is doing and where the loss is coming from.
            </p>

            <div className="mt-8 flex items-center gap-5">
              <SegmentRing value={82} />
              <div>
                <p className="text-[15px] text-white/85">Peak-season occupancy</p>
                <p className="mt-1 font-display text-[22px] font-light text-white">18 / 22 rooms</p>
              </div>
            </div>

            <ul className="mt-8 flex flex-wrap gap-2">
              {features.map((f) => (
                <li key={f} className="glass-pill rounded-full px-4 py-2 text-[13px] text-white/85">
                  {f}
                </li>
              ))}
            </ul>
          </section>

          {/* Sign-in card */}
          <section className="glass-dark rounded-[32px] p-6 sm:p-8">
            <h2 className="font-display text-[26px] font-light tracking-[0.02em] text-white">Welcome back</h2>
            <p className="mt-1.5 text-[14px] text-white/65">Sign in to your HotelOS dashboard</p>

            <form onSubmit={handleSubmit} className="mt-7 space-y-5">
              <div>
                <label htmlFor="email" className="mb-2 block text-[13px] text-white/75">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@resort.in"
                  className={inputCls}
                />
              </div>
              <div>
                <label htmlFor="password" className="mb-2 block text-[13px] text-white/75">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`${inputCls} pr-12`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/55 transition hover:text-white"
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-full bg-[#e8f0ea] py-3.5 text-[15px] font-medium text-[#10211a] shadow-lg shadow-black/20 transition hover:bg-white"
              >
                Enter Dashboard <ArrowRight size={16} />
              </button>
            </form>

            <div className="mt-7 border-t border-white/10 pt-5 text-center">
              <p className="mb-3 text-[12px] text-white/50">Quick demo access</p>
              <button
                type="button"
                onClick={fillDemo}
                className="opt-pill px-4 py-2 text-[13px]"
              >
                Fill General Manager credentials
              </button>
            </div>
          </section>
        </div>
      </div>


      {showToast && (
        <div
          role="status"
          className="glass-dark animate-fade-in fixed bottom-6 left-1/2 z-50 flex w-[calc(100vw-1.5rem)] max-w-[720px] -translate-x-1/2 items-center gap-3 rounded-full py-2.5 pl-4 pr-3 shadow-2xl"
        >
          <span className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-white/80 border-t-transparent" />
          <span className="flex-1 text-[12px] leading-snug text-white/85 sm:text-[13px]">
            This is the frontend only preview. Please explore the app while we are spinning up servers in the
            background.
          </span>
          <button
            onClick={() => setShowToast(false)}
            className="hidden shrink-0 rounded-full bg-white/15 px-3 py-1 text-[12px] text-white/85 hover:bg-white/25 sm:block"
          >
            Minimize
          </button>
          <button
            onClick={() => setShowToast(false)}
            aria-label="Dismiss"
            className="glass-btn h-8 w-8 shrink-0"
          >
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
