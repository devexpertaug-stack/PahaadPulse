import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Mountain, MessageSquare, Globe, Sparkles, TrendingUp, Building2, ChevronDown, LogOut } from 'lucide-react';
import { useState } from 'react';
import { HOTEL_NAME } from '../data/mockData';

const navItems = [
  { to: '/app/reviews', label: 'Reviews', icon: MessageSquare },
  { to: '/app/scraper', label: 'Scraper', icon: Globe },
  { to: '/app/insights', label: 'Insights', icon: Sparkles },
  { to: '/app/reputation', label: 'Reputation', icon: TrendingUp },
  { to: '/app/hotelos', label: 'Hotel OS', icon: Building2 },
];

export default function Layout() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen leaf-bg text-gray-100">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-emerald-900/40 bg-[#070b09]/85 backdrop-blur-xl">
        <div className="max-w-[1400px] mx-auto px-5 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 shrink-0">
            <div className="h-7 w-7 rounded-md bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center">
              <Mountain size={16} className="text-emerald-400" />
            </div>
            <span className="font-bold text-base">
              <span className="text-white">Pahaad</span>
              <span className="text-emerald-400">Pulse</span>
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-1 bg-black/30 border border-emerald-900/40 rounded-full p-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium transition ${
                    isActive
                      ? 'bg-emerald-500 text-black'
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`
                }
              >
                <item.icon size={14} />
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="relative shrink-0">
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full hover:bg-white/5 transition"
            >
              <div className="h-7 w-7 rounded-full bg-emerald-600 flex items-center justify-center text-xs font-bold text-black">
                A
              </div>
              <div className="hidden sm:block text-left leading-tight">
                <p className="text-xs font-semibold text-white">Ashutosh Chand</p>
                <p className="text-[10px] text-gray-400">Admin</p>
              </div>
              <ChevronDown size={14} className="text-gray-400" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-44 rounded-lg border border-emerald-900/50 bg-[#0d1a13] shadow-xl overflow-hidden animate-fade-in">
                <button
                  onClick={() => navigate('/')}
                  className="w-full flex items-center gap-2 px-3.5 py-2.5 text-sm text-gray-300 hover:bg-white/5"
                >
                  <LogOut size={14} /> Sign out
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile nav */}
        <nav className="md:hidden flex items-center gap-1 overflow-x-auto scrollbar-none px-4 pb-2.5">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition ${
                  isActive ? 'bg-emerald-500 text-black' : 'text-gray-300 bg-black/30 border border-emerald-900/40'
                }`
              }
            >
              <item.icon size={12} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Hotel selector bar */}
        <div className="max-w-[1400px] mx-auto px-5 pb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <button className="flex items-center gap-1.5 text-sm font-medium text-gray-200 bg-black/30 border border-emerald-900/40 rounded-lg px-3 py-1.5 hover:border-emerald-700/50 transition">
              {HOTEL_NAME}
              <ChevronDown size={13} className="text-gray-500" />
            </button>
            <div className="flex items-center gap-1.5 text-xs text-emerald-300/90 bg-emerald-500/10 border border-emerald-700/30 rounded-full px-3 py-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live Monitor: Booking.com · Google · TripAdvisor
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <TrendingUp size={13} className="text-emerald-400" />
            Reputation <span className="text-white font-semibold">3.57 / 5.0</span>
          </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-5 py-6">
        <Outlet />
      </main>
    </div>
  );
}
