import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { colorsLight, colorsDark, type Colors } from './colors';

export type ThemeMode = 'light' | 'dark' | 'system';
type Scheme = 'light' | 'dark';

const STORAGE_KEY = 'weather:themeMode';
const MODES: ThemeMode[] = ['light', 'dark', 'system'];

type ThemeValue = {
  mode: ThemeMode; // user's choice
  scheme: Scheme; // effective (resolves 'system')
  colors: Colors;
  setMode: (m: ThemeMode) => void;
  cycleMode: () => void; // light → dark → system → …
};

const ThemeContext = createContext<ThemeValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const system = useColorScheme(); // 'light' | 'dark' | null
  const [mode, setModeState] = useState<ThemeMode>('system');

  // Restore the saved preference.
  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((v) => {
        if (!cancelled && (v === 'light' || v === 'dark' || v === 'system')) {
          setModeState(v);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const persist = (m: ThemeMode) => {
    AsyncStorage.setItem(STORAGE_KEY, m).catch(() => {});
  };

  const setMode = useCallback((m: ThemeMode) => {
    setModeState(m);
    persist(m);
  }, []);

  const cycleMode = useCallback(() => {
    setModeState((prev) => {
      const next = MODES[(MODES.indexOf(prev) + 1) % MODES.length];
      persist(next);
      return next;
    });
  }, []);

  const scheme: Scheme = mode === 'system' ? (system === 'dark' ? 'dark' : 'light') : mode;
  const colors = scheme === 'dark' ? colorsDark : colorsLight;

  const value = useMemo<ThemeValue>(
    () => ({ mode, scheme, colors, setMode, cycleMode }),
    [mode, scheme, colors, setMode, cycleMode]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx;
}
