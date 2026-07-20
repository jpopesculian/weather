// Open-Meteo API client (keyless). Forecast + geocoding.
// Docs: https://open-meteo.com/en/docs and .../geocoding-api

const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';
const GEOCODE_URL = 'https://geocoding-api.open-meteo.com/v1/search';

export type Place = {
  name: string;
  admin1?: string;
  country?: string;
  countryCode?: string;
  latitude: number;
  longitude: number;
};

export type CurrentWx = {
  time: string;
  temp: number;
  apparentTemp: number;
  weatherCode: number;
  isDay: boolean;
  precipitation: number;
  windSpeed: number;
  windDir: number;
};

export type HourlyWx = {
  time: string[];
  temp: number[];
  precip: number[];
  precipProb: number[];
  cloud: number[];
  humidity: number[];
  weatherCode: number[];
  isDay: number[];
  windSpeed: number[];
  windGust: number[];
  windDir: number[];
};

export type DailyWx = {
  time: string[];
  weatherCode: number[];
  tempMax: number[];
  tempMin: number[];
  precipProbMax: number[];
  precipSum: number[];
  windMax: number[];
  windDir: number[];
  sunrise: string[];
  sunset: string[];
};

export type Forecast = {
  timezone: string;
  current: CurrentWx;
  hourly: HourlyWx;
  daily: DailyWx;
};

const CURRENT_FIELDS = [
  'temperature_2m',
  'apparent_temperature',
  'weather_code',
  'is_day',
  'precipitation',
  'wind_speed_10m',
  'wind_direction_10m',
].join(',');

const HOURLY_FIELDS = [
  'temperature_2m',
  'precipitation',
  'precipitation_probability',
  'cloud_cover',
  'relative_humidity_2m',
  'weather_code',
  'is_day',
  'wind_speed_10m',
  'wind_gusts_10m',
  'wind_direction_10m',
].join(',');

const DAILY_FIELDS = [
  'weather_code',
  'temperature_2m_max',
  'temperature_2m_min',
  'precipitation_probability_max',
  'precipitation_sum',
  'wind_speed_10m_max',
  'wind_direction_10m_dominant',
  'sunrise',
  'sunset',
].join(',');

export async function fetchForecast(lat: number, lon: number): Promise<Forecast> {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    current: CURRENT_FIELDS,
    hourly: HOURLY_FIELDS,
    daily: DAILY_FIELDS,
    timezone: 'auto',
    forecast_days: '10',
    wind_speed_unit: 'kmh',
  });
  const res = await fetch(`${FORECAST_URL}?${params.toString()}`);
  if (!res.ok) throw new Error(`Forecast request failed: ${res.status}`);
  const j = await res.json();

  return {
    timezone: j.timezone,
    current: {
      time: j.current.time,
      temp: j.current.temperature_2m,
      apparentTemp: j.current.apparent_temperature,
      weatherCode: j.current.weather_code,
      isDay: j.current.is_day === 1,
      precipitation: j.current.precipitation,
      windSpeed: j.current.wind_speed_10m,
      windDir: j.current.wind_direction_10m,
    },
    hourly: {
      time: j.hourly.time,
      temp: j.hourly.temperature_2m,
      precip: j.hourly.precipitation,
      precipProb: j.hourly.precipitation_probability,
      cloud: j.hourly.cloud_cover,
      humidity: j.hourly.relative_humidity_2m,
      weatherCode: j.hourly.weather_code,
      isDay: j.hourly.is_day,
      windSpeed: j.hourly.wind_speed_10m,
      windGust: j.hourly.wind_gusts_10m,
      windDir: j.hourly.wind_direction_10m,
    },
    daily: {
      time: j.daily.time,
      weatherCode: j.daily.weather_code,
      tempMax: j.daily.temperature_2m_max,
      tempMin: j.daily.temperature_2m_min,
      precipProbMax: j.daily.precipitation_probability_max,
      precipSum: j.daily.precipitation_sum,
      windMax: j.daily.wind_speed_10m_max,
      windDir: j.daily.wind_direction_10m_dominant,
      sunrise: j.daily.sunrise,
      sunset: j.daily.sunset,
    },
  };
}

type GeoResult = {
  name: string;
  admin1?: string;
  country?: string;
  country_code?: string;
  latitude: number;
  longitude: number;
};

export async function searchPlaces(
  query: string,
  signal?: AbortSignal
): Promise<Place[]> {
  const q = query.trim();
  if (q.length < 2) return [];
  const params = new URLSearchParams({
    name: q,
    count: '8',
    language: 'en',
    format: 'json',
  });
  const res = await fetch(`${GEOCODE_URL}?${params.toString()}`, { signal });
  if (!res.ok) throw new Error(`Geocoding failed: ${res.status}`);
  const j = await res.json();
  const results: GeoResult[] = j.results ?? [];
  return results.map((r) => ({
    name: r.name,
    admin1: r.admin1,
    country: r.country,
    countryCode: r.country_code,
    latitude: r.latitude,
    longitude: r.longitude,
  }));
}

export type CurrentBrief = { temp: number; weatherCode: number; isDay: boolean };

// Lightweight current-conditions lookup used to annotate search results.
export async function fetchCurrentBrief(
  lat: number,
  lon: number,
  signal?: AbortSignal
): Promise<CurrentBrief | null> {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    current: 'temperature_2m,weather_code,is_day',
    wind_speed_unit: 'kmh',
  });
  try {
    const res = await fetch(`${FORECAST_URL}?${params.toString()}`, { signal });
    if (!res.ok) return null;
    const j = await res.json();
    if (j.current?.temperature_2m == null) return null;
    return {
      temp: j.current.temperature_2m,
      weatherCode: j.current.weather_code,
      isDay: j.current.is_day === 1,
    };
  } catch {
    return null;
  }
}
