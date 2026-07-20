// Small pure formatting helpers (metric units).

export const roundTemp = (t: number): number => Math.round(t);

export const tempLabel = (t: number): string => `${Math.round(t)}°`;

const COMPASS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'] as const;

// Meteorological wind direction (degrees the wind comes FROM) → 8-point compass.
export function degToCompass(deg: number): string {
  const idx = Math.round(deg / 45) % 8;
  return COMPASS[(idx + 8) % 8];
}

// "YYYY-MM-DD" (or ISO) → short weekday, with "Today" for the current date.
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

export function dayLabel(iso: string, todayIso?: string): string {
  const datePart = iso.slice(0, 10);
  if (todayIso && datePart === todayIso.slice(0, 10)) return 'Today';
  const d = new Date(`${datePart}T00:00:00`);
  return WEEKDAYS[d.getDay()];
}

// ISO datetime → "5:10p" style short clock (used for chart marker labels).
export function shortClock(iso: string): string {
  const t = iso.slice(11, 16); // "HH:MM"
  let [h, m] = t.split(':').map((n) => parseInt(n, 10));
  const ap = h < 12 ? 'a' : 'p';
  h = h % 12;
  if (h === 0) h = 12;
  return m === 0 ? `${h}${ap}` : `${h}:${String(m).padStart(2, '0')}${ap}`;
}

// Fraction (0..1) of a 24h window that starts at `startHour` → clock string.
export function fracToClock(frac: number, startHour: number): string {
  const total = (startHour + frac * 24) % 24;
  let h = Math.floor(total);
  let min = Math.round((total - h) * 60);
  if (min === 60) {
    min = 0;
    h = (h + 1) % 24;
  }
  return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
}

// Compact 24-hour x-axis tick like "12", "18", "00", "06".
export function hourTick(iso: string): string {
  const h = parseInt(iso.slice(11, 13), 10);
  return String(h).padStart(2, '0');
}
