// Device GPS → a Place, via expo-location. Reverse geocoding yields a short
// place name (falls back gracefully where unsupported, e.g. web).
import * as Location from 'expo-location';
import type { Place } from './openMeteo';

export type LocationResult =
  | { status: 'ok'; place: Place }
  | { status: 'denied' }
  | { status: 'error' };

export async function getCurrentPlace(): Promise<LocationResult> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return { status: 'denied' };

    const pos = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    const { latitude, longitude } = pos.coords;

    let name = 'Current Location';
    let admin1: string | undefined;
    let country: string | undefined;
    try {
      const results = await Location.reverseGeocodeAsync({ latitude, longitude });
      const g = results[0];
      if (g) {
        name =
          [g.name, g.street, g.city, g.subregion].find((v) => !!v) ??
          'Current Location';
        admin1 = g.region ?? undefined;
        country = g.country ?? undefined;
      }
    } catch {
      // reverse geocoding not available on this platform; keep the fallback name
    }

    return { status: 'ok', place: { name, admin1, country, latitude, longitude } };
  } catch {
    return { status: 'error' };
  }
}
