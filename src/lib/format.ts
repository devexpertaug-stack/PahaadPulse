export const pad = (n: number) => String(n).padStart(2, '0');

/** Indian digit grouping: 940520 → "9,40,520" */
export const fmtINR = (n: number) => Math.round(n).toLocaleString('en-IN');

export const ordinal = (n: number) => {
  if (n % 100 >= 11 && n % 100 <= 13) return 'th';
  return ['th', 'st', 'nd', 'rd'][n % 10 > 3 ? 0 : n % 10];
};

export function parseDMY(s: string): Date {
  const [d, m, y] = s.split('/').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

export function fmtDMY(d: Date): string {
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}

/**
 * The demo is set on a fixed "today" so every seeded date, calendar and chart lines up,
 * whatever the real date is. Time-of-day still comes from the visitor's clock.
 */
export const DEMO_TODAY = new Date(2026, 9, 13);

export function nowStamp(): string {
  const real = new Date();
  const h = real.getHours();
  return `${fmtDMY(DEMO_TODAY)}, ${h % 12 || 12}:${pad(real.getMinutes())} ${h >= 12 ? 'PM' : 'AM'}`;
}

export const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);

/** Monday of the week containing d */
export function startOfWeek(d: Date): Date {
  const dow = (d.getDay() + 6) % 7;
  return addDays(d, -dow);
}

export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const fmtShort = (d: Date) => `${pad(d.getDate())} ${MONTHS[d.getMonth()]}`;

export const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('') || '?';

export const uid = (prefix: string) => `${prefix}${Math.random().toString(36).slice(2, 8)}`;

export const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;
