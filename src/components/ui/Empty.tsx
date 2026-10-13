import type { ReactNode } from 'react';

export default function Empty({ children }: { children: ReactNode }) {
  return <p className="rounded-2xl border border-dashed border-white/15 px-4 py-8 text-center text-[13.5px] text-white/60">{children}</p>;
}
