// Device GPS → a Place. Coordinates come from expo-location; the place *name*
// comes from a reverse geocode. We use BigDataCloud's keyless client endpoint
// (reliable city/locality, works on web + native), falling back to the on-device
// geocoder, then to a generic label.
import * as Location from 'expo-location';
import type { Place } from './openMeteo';

export type LocationResult =
  | { status: 'ok'; place: Place }
  | { status: 'denied' }
  | { status: 'error' };

type PlaceName = { name: string; admin1?: string; country?: string };

// Keyless reverse geocoding (no API key, CORS-enabled — works on web + native).
async function reverseGeocodeHttp(latitude: number, longitude: number): Promise<PlaceName | null> {
  try {
    const res = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
    );
    if (!res.ok) return null;
    const d = await res.json();
    const name: string | undefined = d.city || d.locality || d.principalSubdivision || undefined;
    if (!name) return null;
    const admin1: string | undefined =
      d.principalSubdivision && d.principalSubdivision !== name ? d.principalSubdivision : undefined;
    return { name, admin1, country: d.countryName || undefined };
  } catch {
    return null;
  }
}

// On-device reverse geocoding fallback (native only; unsupported on web). Its
// `name` is often a street/house number (e.g. "56"), so locality fields first.
async function reverseGeocodeDevice(latitude: number, longitude: number): Promise<PlaceName | null> {
  try {
    const g = (await Location.reverseGeocodeAsync({ latitude, longitude }))[0];
    if (!g) return null;
    const name = [g.city, g.district, g.subregion, g.region, g.name].find((v) => !!v);
    if (!name) return null;
    const admin1 = g.region && g.region !== name ? g.region : undefined;
    return { name, admin1, country: g.country ?? undefined };
  } catch {
    return null;
  }
}

export async function getCurrentPlace(): Promise<LocationResult> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return { status: 'denied' };

    const pos = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    const { latitude, longitude } = pos.coords;

    const named =
      (await reverseGeocodeHttp(latitude, longitude)) ??
      (await reverseGeocodeDevice(latitude, longitude));

    return {
      status: 'ok',
      place: {
        name: named?.name ?? 'Current Location',
        admin1: named?.admin1,
        country: named?.country,
        latitude,
        longitude,
      },
    };
  } catch {
    return { status: 'error' };
  }
}
