import type { ComplaintCategory, ComplaintStatus, RoomStatus, Sentiment, TaskPriority } from '../../types';

export type Tone = 'emerald' | 'amber' | 'rose' | 'sky' | 'slate';

export const toneClass: Record<Tone, string> = {
  emerald: 'text-emerald-200 bg-emerald-300/15 border-emerald-200/25',
  amber: 'text-amber-200 bg-amber-300/15 border-amber-200/25',
  rose: 'text-rose-200 bg-rose-300/15 border-rose-200/25',
  sky: 'text-sky-200 bg-sky-300/15 border-sky-200/25',
  slate: 'text-white/75 bg-white/10 border-white/15',
};

/** solid colours for charts / bars */
export const toneHex: Record<Tone, string> = {
  emerald: '#7ee2b0',
  amber: '#f2cf7a',
  rose: '#f59aa5',
  sky: '#8cc8f5',
  slate: '#b8c4bd',
};

export const sentimentTone: Record<Sentiment, Tone> = { positive: 'emerald', neutral: 'amber', negative: 'rose' };
export const categoryTone: Record<ComplaintCategory, Tone> = {
  positive: 'emerald',
  neutral: 'amber',
  high_attention: 'rose',
};
export const categoryLabel: Record<ComplaintCategory, string> = {
  positive: 'Positive',
  neutral: 'Neutral',
  high_attention: 'High attention',
};
export const statusTone: Record<ComplaintStatus, Tone> = { open: 'rose', in_progress: 'amber', resolved: 'emerald' };
export const statusLabel: Record<ComplaintStatus, string> = {
  open: 'Open',
  in_progress: 'In progress',
  resolved: 'Resolved',
};
export const roomTone: Record<RoomStatus, Tone> = {
  Occupied: 'sky',
  Ready: 'emerald',
  Cleaning: 'amber',
  Maintenance: 'rose',
};
export const priorityTone: Record<TaskPriority, Tone> = { High: 'rose', Medium: 'amber', Low: 'slate' };

export const sourceTone: Record<string, Tone> = {
  'Booking.com': 'sky',
  Google: 'rose',
  TripAdvisor: 'emerald',
  Goibibo: 'amber',
  Manual: 'slate',
};
