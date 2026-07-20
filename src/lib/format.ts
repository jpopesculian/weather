// Small pure formatting helpers (metric units).

export const roundTemp = (t: number): number => Math.round(t);

export const tempLabel = (t: number): string => `${Math.round(t)}°`;

const COMPASS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'] as const;

// Meteorological wind direction (degrees the wind comes FROM) → 8-point compass.
export function degToCompass(deg: number): string {
  const idx = Math.round(deg / 45) % 8;
  return COMPASS[(idx + 8) % 8];
}

// Precip amount: Open-Meteo returns mm; the wireframe shows cm.
export function mmToCmLabel(mm: number): string {
  const cm = mm / 10;
  return `${cm.toFixed(1)}cm`;
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
  let hh = (startHour + frac * 24) % 24;
  const ap = hh < 12 ? 'AM' : 'PM';
  let hr = Math.floor(hh) % 12;
  if (hr === 0) hr = 12;
  const min = Math.round((hh - Math.floor(hh)) * 60);
  const mm = min === 60 ? '00' : String(min).padStart(2, '0');
  return `${hr}:${mm} ${ap}`;
}

// Compact x-axis tick like "12P", "6A".
export function hourTick(iso: string): string {
  const h = parseInt(iso.slice(11, 13), 10);
  const ap = h < 12 ? 'A' : 'P';
  let hr = h % 12;
  if (hr === 0) hr = 12;
  return `${hr}${ap}`;
}
