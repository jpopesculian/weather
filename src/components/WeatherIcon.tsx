// Meteocons (static, "flat" style) weather icons, imported as components via
// react-native-svg-transformer. Only the icons the WMO map can produce are
// registered here so the bundle stays small and every import is static.
import ClearDay from '@meteocons/svg-static/flat/clear-day.svg';
import ClearNight from '@meteocons/svg-static/flat/clear-night.svg';
import PartlyCloudyDay from '@meteocons/svg-static/flat/partly-cloudy-day.svg';
import PartlyCloudyNight from '@meteocons/svg-static/flat/partly-cloudy-night.svg';
import OvercastDay from '@meteocons/svg-static/flat/overcast-day.svg';
import OvercastNight from '@meteocons/svg-static/flat/overcast-night.svg';
import FogDay from '@meteocons/svg-static/flat/fog-day.svg';
import FogNight from '@meteocons/svg-static/flat/fog-night.svg';
import Drizzle from '@meteocons/svg-static/flat/drizzle.svg';
import Sleet from '@meteocons/svg-static/flat/sleet.svg';
import Rain from '@meteocons/svg-static/flat/rain.svg';
import PartlyCloudyDayRain from '@meteocons/svg-static/flat/partly-cloudy-day-rain.svg';
import PartlyCloudyNightRain from '@meteocons/svg-static/flat/partly-cloudy-night-rain.svg';
import Snow from '@meteocons/svg-static/flat/snow.svg';
import ThunderstormsDay from '@meteocons/svg-static/flat/thunderstorms-day.svg';
import ThunderstormsNight from '@meteocons/svg-static/flat/thunderstorms-night.svg';
import ThunderstormsDayRain from '@meteocons/svg-static/flat/thunderstorms-day-rain.svg';
import ThunderstormsRain from '@meteocons/svg-static/flat/thunderstorms-rain.svg';
import NotAvailable from '@meteocons/svg-static/flat/not-available.svg';

const REGISTRY = {
  'clear-day': ClearDay,
  'clear-night': ClearNight,
  'partly-cloudy-day': PartlyCloudyDay,
  'partly-cloudy-night': PartlyCloudyNight,
  'overcast-day': OvercastDay,
  'overcast-night': OvercastNight,
  'fog-day': FogDay,
  'fog-night': FogNight,
  drizzle: Drizzle,
  sleet: Sleet,
  rain: Rain,
  'partly-cloudy-day-rain': PartlyCloudyDayRain,
  'partly-cloudy-night-rain': PartlyCloudyNightRain,
  snow: Snow,
  'thunderstorms-day': ThunderstormsDay,
  'thunderstorms-night': ThunderstormsNight,
  'thunderstorms-day-rain': ThunderstormsDayRain,
  'thunderstorms-rain': ThunderstormsRain,
  'not-available': NotAvailable,
} as const;

export type IconName = keyof typeof REGISTRY;

type Props = {
  name: IconName;
  size?: number;
};

export function WeatherIcon({ name, size = 40 }: Props) {
  const Svg = REGISTRY[name] ?? NotAvailable;
  return <Svg width={size} height={size} />;
}
