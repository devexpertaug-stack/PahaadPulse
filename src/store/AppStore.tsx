import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useState } from 'react';
import type { Dispatch, ReactNode } from 'react';
import { initialState, reducer } from './state';
import type { Action, AppState } from './state';
import { monthlyRevenue, occupancy, reputation, riskSummary, staffSummary } from '../lib/metrics';

export interface ToastMsg {
  id: number;
  msg: string;
  action?: { label: string; to: string };
}

interface AppContext {
  state: AppState;
  dispatch: Dispatch<Action>;
  say: (msg: string, action?: ToastMsg['action']) => void;
  toast: ToastMsg | null;
  dismissToast: () => void;
  /* derived, so every page reads the same numbers */
  rep: ReturnType<typeof reputation>;
  risk: ReturnType<typeof riskSummary>;
  occ: ReturnType<typeof occupancy>;
  staffSum: ReturnType<typeof staffSummary>;
  revenue: number;
}

const Ctx = createContext<AppContext | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, initialState);
  const [toast, setToast] = useState<ToastMsg | null>(null);

  const say = useCallback((msg: string, action?: ToastMsg['action']) => {
    setToast({ id: Date.now() + Math.random(), msg, action });
  }, []);
  const dismissToast = useCallback(() => setToast(null), []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4200);
    return () => clearTimeout(t);
  }, [toast]);

  const rep = useMemo(() => reputation(state.reviews), [state.reviews]);
  const risk = useMemo(
    () => riskSummary({ reviews: state.reviews, complaints: state.complaints, resolved: state.resolved }),
    [state.reviews, state.complaints, state.resolved],
  );
  const occ = useMemo(() => occupancy({ rooms: state.rooms }), [state.rooms]);
  const staffSum = useMemo(() => staffSummary(state.staff), [state.staff]);
  const revenue = useMemo(() => monthlyRevenue(state.bills), [state.bills]);

  const value = useMemo<AppContext>(
    () => ({ state, dispatch, say, toast, dismissToast, rep, risk, occ, staffSum, revenue }),
    [state, say, toast, dismissToast, rep, risk, occ, staffSum, revenue],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp(): AppContext {
  const v = useContext(Ctx);
  if (!v) throw new Error('useApp must be used inside <AppProvider>');
  return v;
}
