// Derived views over a Forecast: locate "now", and build the 24h chart windows
// at hourly resolution (25 points). WxChart thins the on-chart markers so they
// stay readable.
import type { Forecast, HourlyWx } from './openMeteo';

const MS_PER_HOUR = 3600_000;
const localMs = (iso: string) => new Date(iso.length <= 16 ? `${iso}:00` : iso).getTime();

// Index in hourly.time whose hour matches isoTime (falls back to nearest).
export function hourIndex(hourly: HourlyWx, isoTime: string): number {
  const key = isoTime.slice(0, 13); // YYYY-MM-DDTHH
  const exact = hourly.time.findIndex((t) => t.slice(0, 13) === key);
  if (exact >= 0) return exact;
  const target = localMs(isoTime);
  let best = 0;
  let bestD = Infinity;
  hourly.time.forEach((t, i) => {
    const d = Math.abs(localMs(t) - target);
    if (d < bestD) {
      bestD = d;
      best = i;
    }
  });
  return best;
}

export type ChartWindow = {
  times: string[]; // iso per sampled point
  temp: number[];
  cloud: number[];
  humidity: number[];
  precip: number[]; // rainfall amount (mm)
  precipProb: number[]; // chance of rain (%)
  wind: number[];
  gust: number[];
  dir: number[];
  codes: number[];
  isDay: number[];
  startHour: number; // hour-of-day at window start (for the clock readout)
  nowFrac: number | null;
  sunriseFrac: number | null;
  sunsetFrac: number | null;
};

const STEP = 1; // hours between sampled points (hourly)
const SPAN = 24; // window length in hours

function sample<T>(arr: T[], start: number, count: number): T[] {
  const out: T[] = [];
  for (let k = 0; k <= count; k++) {
    const i = Math.min(arr.length - 1, start + k * STEP);
    out.push(arr[i]);
  }
  return out;
}

function fracWithin(iso: string | undefined, startMs: number): number | null {
  if (!iso) return null;
  const f = (localMs(iso) - startMs) / (SPAN * MS_PER_HOUR);
  return f >= 0 && f <= 1 ? f : null;
}

function build(forecast: Forecast, startIdx: number, dayIdx: number, nowIso?: string): ChartWindow {
  const h = forecast.hourly;
  const count = SPAN / STEP; // 24 → 25 points inclusive (hourly)
  const times = sample(h.time, startIdx, count);
  const startMs = localMs(h.time[startIdx]);
  const d = forecast.daily;
  return {
    times,
    temp: sample(h.temp, startIdx, count),
    cloud: sample(h.cloud, startIdx, count),
    humidity: sample(h.humidity, startIdx, count),
    precip: sample(h.precip, startIdx, count),
    precipProb: sample(h.precipProb, startIdx, count),
    wind: sample(h.windSpeed, startIdx, count),
    gust: sample(h.windGust, startIdx, count),
    dir: sample(h.windDir, startIdx, count),
    codes: sample(h.weatherCode, startIdx, count),
    isDay: sample(h.isDay, startIdx, count),
    startHour: parseInt(h.time[startIdx].slice(11, 13), 10),
    nowFrac: nowIso ? fracWithin(nowIso, startMs) : null,
    sunriseFrac: fracWithin(d.sunrise[dayIdx], startMs) ?? fracWithin(d.sunrise[dayIdx + 1], startMs),
    sunsetFrac: fracWithin(d.sunset[dayIdx], startMs) ?? fracWithin(d.sunset[dayIdx + 1], startMs),
  };
}

// "Today": the next 24h starting at the current hour.
export function todayWindow(forecast: Forecast): ChartWindow {
  const start = hourIndex(forecast.hourly, forecast.current.time);
  return build(forecast, start, 0, forecast.current.time);
}

// A specific forecast day (index into daily.*): that calendar day, 00:00–24:00.
export function dayWindow(forecast: Forecast, dayIdx: number): ChartWindow {
  const dayIso = forecast.daily.time[dayIdx];
  const start = hourIndex(forecast.hourly, `${dayIso}T00:00`);
  const isToday = dayIso.slice(0, 10) === forecast.current.time.slice(0, 10);
  return build(forecast, start, dayIdx, isToday ? forecast.current.time : undefined);
}
