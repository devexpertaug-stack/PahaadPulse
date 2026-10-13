import { useNavigate } from 'react-router-dom';
import { useApp } from '../../store/AppStore';

export default function Toast() {
  const { toast, dismissToast } = useApp();
  const navigate = useNavigate();
  if (!toast) return null;
  return (
    <div
      key={toast.id}
      role="status"
      aria-live="polite"
      className="glass-dark animate-fade-in no-print fixed bottom-6 left-1/2 z-[60] flex max-w-[92vw] -translate-x-1/2 items-center gap-4 rounded-full px-5 py-3 text-[13.5px] text-white shadow-2xl"
    >
      <span>{toast.msg}</span>
      {toast.action && (
        <button
          onClick={() => {
            dismissToast();
            navigate(toast.action!.to);
          }}
          className="shrink-0 rounded-full bg-white/20 px-3 py-1 text-[12px] hover:bg-white/30"
        >
          {toast.action.label}
        </button>
      )}
    </div>
  );
}
