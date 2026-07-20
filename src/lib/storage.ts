// Persist the last-selected location so the app reopens where you left off.
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Place } from './openMeteo';

const KEY = 'weather:lastLocation';

export async function saveLastLocation(place: Place): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(place));
  } catch {
    // best-effort; ignore write failures
  }
}

export async function loadLastLocation(): Promise<Place | null> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Place) : null;
  } catch {
    return null;
  }
}
