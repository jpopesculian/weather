import { useEffect, useState, useCallback } from 'react';
import { fetchForecast, type Forecast, type Place } from '../lib/openMeteo';

type State = {
  forecast: Forecast | null;
  loading: boolean;
  error: string | null;
};

export function useForecast(place: Place | null) {
  const [state, setState] = useState<State>({ forecast: null, loading: false, error: null });
  const [nonce, setNonce] = useState(0);

  const refresh = useCallback(() => setNonce((n) => n + 1), []);

  useEffect(() => {
    if (!place) return;
    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: null }));
    fetchForecast(place.latitude, place.longitude)
      .then((f) => {
        if (!cancelled) setState({ forecast: f, loading: false, error: null });
      })
      .catch((e) => {
        if (!cancelled) setState((s) => ({ ...s, loading: false, error: String(e?.message ?? e) }));
      });
    return () => {
      cancelled = true;
    };
  }, [place?.latitude, place?.longitude, nonce]);

  // Auto-refetch every 15 minutes while mounted — silent (updates the data in
  // place without toggling the loading/refresh spinner).
  useEffect(() => {
    if (!place) return;
    let cancelled = false;
    const id = setInterval(() => {
      fetchForecast(place.latitude, place.longitude)
        .then((f) => {
          if (!cancelled) setState((s) => ({ ...s, forecast: f, error: null }));
        })
        .catch(() => {
          // keep showing the last-good data on a failed background refresh
        });
    }, 15 * 60 * 1000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [place?.latitude, place?.longitude]);

  return { ...state, refresh };
}
