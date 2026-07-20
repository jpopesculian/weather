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

  return { ...state, refresh };
}
