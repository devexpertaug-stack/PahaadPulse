import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Mountain, ChevronDown, LogOut, Settings, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import { HOTEL_NAME } from '../data/mockData';
import PhotoCredit from './PhotoCredit';

const navItems = [
  { to: '/app/overview', label: 'Overview' },
  { to: '/app/reviews', label: 'Reviews' },
  { to: '/app/scraper', label: 'Scraper' },
  { to: '/app/insights', label: 'Insights' },
  { to: '/app/reputation', label: 'Reputation' },
  { to: '/app/hotelos', label: 'Hotel OS' },
];

export default function Layout() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const isOverview = pathname === '/app/overview';

  return (
    <div className="leaf-bg px-3 py-4 sm:px-6 sm:py-8 lg:px-10 lg:py-10">
      <div className="glass-shell mx-auto max-w-[1280px] rounded-[28px] px-5 py-5 sm:rounded-[40px] sm:px-8 sm:py-7 lg:px-10">
        {/* ───────── Top bar ───────── */}
        <header className="flex items-center justify-between gap-4">
          <button
            onClick={() => navigate('/app/overview')}
            className="flex shrink-0 items-center gap-3 text-white"
            aria-label="PahaadPulse home"
          >
            <Mountain size={30} strokeWidth={1.5} />
            <span className="hidden font-display text-[15px] font-light tracking-[0.12em] xl:block">
              Pahaad<span className="text-white/60">Pulse</span>
            </span>
          </button>

          <nav className="glass-pill hidden items-center gap-1 rounded-full p-[5px] lg:flex">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `rounded-full px-4 py-[9px] text-[14px] tracking-[0.01em] transition xl:px-[22px] ${
                    isActive
                      ? 'bg-white/[0.17] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]'
                      : 'text-white/75 hover:bg-white/[0.07] hover:text-white'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="relative flex shrink-0 items-center gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-[#d9b48a] to-[#8a6a4a] font-display text-[15px] font-light text-[#1b1208] ring-2 ring-white/25">
                A
              </div>
              <div className="hidden text-left leading-tight sm:block">
                <p className="text-[14px] text-white">Ashutosh Chand</p>
                <p className="text-[11px] text-white/60">Hotel Owner · Admin</p>
              </div>
            </div>
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="glass-btn h-11 w-11"
              aria-label="Account menu"
              aria-expanded={menuOpen}
            >
              <Settings size={17} strokeWidth={1.6} />
            </button>
            {menuOpen && (
              <div className="glass-dark animate-fade-in absolute right-0 top-14 z-40 w-44 overflow-hidden rounded-2xl">
                <button
                  onClick={() => navigate('/')}
                  className="flex w-full items-center gap-2 px-4 py-3 text-sm text-white/85 hover:bg-white/10"
                >
                  <LogOut size={14} /> Sign out
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Mobile nav */}
        <nav className="scrollbar-none mt-4 flex items-center gap-1 overflow-x-auto lg:hidden">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `whitespace-nowrap rounded-full px-4 py-2 text-[13px] transition ${
                  isActive ? 'bg-white/[0.17] text-white' : 'glass-pill text-white/75'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Property bar (hidden on the Overview landing, like the reference) */}
        {!isOverview && (
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <button className="glass-pill flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] text-white/90 transition hover:bg-white/10">
                {HOTEL_NAME}
                <ChevronDown size={13} className="text-white/50" />
              </button>
              <div className="glass-pill flex items-center gap-2 rounded-full px-3.5 py-2 text-[12px] text-white/75">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-300" />
                Live Monitor: Booking.com · Google · TripAdvisor
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-[12px] text-white/60">
              <TrendingUp size={13} className="text-white/70" />
              Reputation <span className="font-medium text-white">3.57 / 5.0</span>
            </div>
          </div>
        )}

        <main className={isOverview ? 'mt-7 sm:mt-9' : 'mt-6'}>
          <Outlet />
        </main>
      </div>

      <PhotoCredit className="mx-auto mt-4 max-w-[1280px]" />
    </div>
  );
}
