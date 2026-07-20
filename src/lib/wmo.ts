// WMO weather-code interpretation → human label, Meteocons icon name, and a
// "rainy" flag. Day/night variants chosen from the is_day signal.
// Codes: https://open-meteo.com/en/docs (WW interpretation table).
import type { IconName } from '../components/WeatherIcon';

export type Condition = {
  label: string;
  icon: IconName;
  rainy: boolean;
};

export function describeWeather(code: number, isDay = true): Condition {
  const d = isDay;
  if (code === 0) return { label: 'Clear', icon: d ? 'clear-day' : 'clear-night', rainy: false };
  if (code === 1) return { label: 'Mainly Clear', icon: d ? 'clear-day' : 'clear-night', rainy: false };
  if (code === 2) return { label: 'Partly Cloudy', icon: d ? 'partly-cloudy-day' : 'partly-cloudy-night', rainy: false };
  if (code === 3) return { label: 'Overcast', icon: d ? 'overcast-day' : 'overcast-night', rainy: false };
  if (code === 45 || code === 48) return { label: 'Fog', icon: d ? 'fog-day' : 'fog-night', rainy: false };
  if (code >= 51 && code <= 55) return { label: 'Drizzle', icon: 'drizzle', rainy: true };
  if (code === 56 || code === 57) return { label: 'Freezing Drizzle', icon: 'sleet', rainy: true };
  if (code >= 61 && code <= 65) return { label: 'Rain', icon: 'rain', rainy: true };
  if (code === 66 || code === 67) return { label: 'Freezing Rain', icon: 'sleet', rainy: true };
  if (code >= 71 && code <= 75) return { label: 'Snow', icon: 'snow', rainy: false };
  if (code === 77) return { label: 'Snow Grains', icon: 'snow', rainy: false };
  if (code >= 80 && code <= 82) return { label: 'Rain Showers', icon: d ? 'partly-cloudy-day-rain' : 'partly-cloudy-night-rain', rainy: true };
  if (code === 85 || code === 86) return { label: 'Snow Showers', icon: 'snow', rainy: false };
  if (code === 95) return { label: 'Thunderstorm', icon: d ? 'thunderstorms-day' : 'thunderstorms-night', rainy: true };
  if (code === 96 || code === 99) return { label: 'Thunderstorm', icon: 'thunderstorms-rain', rainy: true };
  return { label: '—', icon: 'not-available', rainy: false };
}
