import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mountain, Cloud, X } from 'lucide-react';

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
    navigate('/app/reviews');
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#070b09] flex items-center justify-center">
      {/* Mountain backdrop */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, #0b1a14 0%, #0a1510 35%, #091109 65%, #060a07 100%)',
          }}
        />
        {/* far mountains */}
        <svg
          className="absolute bottom-0 left-0 w-full opacity-70"
          viewBox="0 0 1200 420"
          preserveAspectRatio="none"
        >
          <polygon points="0,420 0,220 180,120 340,210 520,80 700,200 860,110 1040,230 1200,150 1200,420" fill="#102018" />
        </svg>
        {/* mid mountains */}
        <svg
          className="absolute bottom-0 left-0 w-full opacity-85"
          viewBox="0 0 1200 420"
          preserveAspectRatio="none"
        >
          <polygon points="0,420 0,300 150,190 300,280 480,160 650,270 820,180 980,290 1150,200 1200,250 1200,420" fill="#0c1811" />
        </svg>
        {/* near mountains */}
        <svg
          className="absolute bottom-0 left-0 w-full"
          viewBox="0 0 1200 420"
          preserveAspectRatio="none"
        >
          <polygon points="0,420 0,350 220,250 420,340 600,230 820,330 1000,260 1200,330 1200,420" fill="#070e0a" />
        </svg>
        {/* mist glow */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 60% 40% at 50% 70%, rgba(16,185,129,0.12) 0%, transparent 70%)',
          }}
        />
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Top status strip */}
      <div className="absolute top-4 left-4 flex items-center gap-2 rounded-full bg-black/40 border border-emerald-900/50 px-3 py-1.5 text-[11px] font-mono tracking-wide text-emerald-200/80 backdrop-blur-sm">
        <Cloud size={13} className="text-emerald-400" />
        <span>AULI · RISHIKESH</span>
        <span className="text-emerald-700">|</span>
        <span>14°C MIST</span>
        <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
        <span>HEAVY BOOKINGS · PEAK SEASON</span>
      </div>

      {/* Login card */}
      <div className="relative z-10 w-full max-w-md mx-4 rounded-2xl border border-emerald-900/40 bg-[#0b140e]/90 backdrop-blur-xl shadow-2xl p-8">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="h-12 w-12 rounded-xl bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center mb-4">
            <Mountain size={24} className="text-emerald-400" />
          </div>
          <h1 className="text-2xl font-bold">
            <span className="text-white">Pahaad</span>
            <span className="text-emerald-400">Pulse</span>
          </h1>
          <p className="text-sm text-gray-400 mt-2 max-w-xs">
            AI Review Intelligence for Uttarakhand eco-tourism hospitality
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-semibold tracking-wider text-gray-400 mb-1.5">
              EMAIL
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@resort.in"
              className="w-full rounded-lg bg-[#0f1c15] border border-emerald-900/50 px-3.5 py-2.5 text-sm text-gray-100 placeholder:text-gray-500 outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/30 transition"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold tracking-wider text-gray-400 mb-1.5">
              PASSWORD
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg bg-[#0f1c15] border border-emerald-900/50 px-3.5 py-2.5 text-sm text-gray-100 placeholder:text-gray-500 outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/30 transition pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-sm py-2.5 mt-2 transition shadow-lg shadow-emerald-500/20"
          >
            Enter Dashboard
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-emerald-900/40 text-center">
          <p className="text-[10px] tracking-widest text-gray-500 mb-2.5">QUICK DEMO ACCESS</p>
          <button
            onClick={fillDemo}
            className="rounded-full border border-emerald-700/50 text-emerald-300 text-xs px-4 py-1.5 hover:bg-emerald-500/10 transition"
          >
            Fill General Manager credentials
          </button>
        </div>
      </div>

      {showToast && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 rounded-full bg-[#0d1a13]/95 border border-emerald-800/50 shadow-xl px-4 py-2.5 backdrop-blur">
          <div className="h-4 w-4 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
          <span className="text-xs text-gray-300">
            This is the frontend only preview. Please explore the app while we are Spinning up Servers in the background.
          </span>
          <button
            onClick={() => setShowToast(false)}
            className="text-[11px] text-gray-400 hover:text-gray-200 rounded-full bg-white/5 px-2.5 py-1 ml-1"
          >
            Minimize
          </button>
          <button
            onClick={() => setShowToast(false)}
            className="text-gray-500 hover:text-gray-300"
          >
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
