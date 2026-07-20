// Device GPS. `getCurrentPosition` returns coordinates (fast — this is what a
// "Locating…" indicator should wait on). `resolvePlaceName` reverse-geocodes
// those coordinates to a human-readable name; it's a separate network step so the
// caller can run it in the background rather than blocking on it. Names come from
// BigDataCloud's keyless client endpoint (reliable city/locality, web + native),
// falling back to the on-device geocoder.
import * as Location from 'expo-location';

export type PositionResult =
  | { status: 'ok'; latitude: number; longitude: number }
  | { status: 'denied' }
  | { status: 'error' };

export type PlaceName = { name: string; admin1?: string; country?: string };

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

// Permission + a GPS fix. No reverse geocoding, so it returns as soon as the
// device has coordinates.
export async function getCurrentPosition(): Promise<PositionResult> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return { status: 'denied' };

    const pos = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    return { status: 'ok', latitude: pos.coords.latitude, longitude: pos.coords.longitude };
  } catch {
    return { status: 'error' };
  }
}

// Reverse geocode coordinates → a place name (HTTP first, on-device fallback).
// Returns null if neither resolves a name.
export async function resolvePlaceName(latitude: number, longitude: number): Promise<PlaceName | null> {
  return (
    (await reverseGeocodeHttp(latitude, longitude)) ??
    (await reverseGeocodeDevice(latitude, longitude))
  );
}
