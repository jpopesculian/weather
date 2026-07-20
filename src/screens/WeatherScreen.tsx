import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Alert,
  useWindowDimensions,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Above this width, lay out as two columns (weather + today | 10-day forecast).
const TWO_COL_BREAKPOINT = 800;
const MAX_CONTENT_WIDTH = 980;

import { fonts, space, useTheme, type Colors } from '../theme';
import { type Place } from '../lib/openMeteo';
import { describeWeather } from '../lib/wmo';
import { hourIndex, todayWindow } from '../lib/derive';
import { getCurrentPlace } from '../lib/location';
import { loadLastLocation, saveLastLocation } from '../lib/storage';
import { useForecast } from '../hooks/useForecast';
import { Header } from '../components/Header';
import { RightNow } from '../components/RightNow';
import { SegmentedTabs } from '../components/SegmentedTabs';
import { WxChart } from '../components/WxChart';
import { LegendMenu } from '../components/LegendMenu';
import { DailyList } from '../components/DailyList';
import { SearchModal } from '../components/SearchModal';

const DEFAULT_PLACE: Place = {
  name: 'San Francisco',
  admin1: 'California',
  country: 'United States',
  latitude: 37.7749,
  longitude: -122.4194,
};

const TODAY_TABS = ['Temp', 'Precip', 'Wind'] as const;
type TodayTab = (typeof TODAY_TABS)[number];

export function WeatherScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { width } = useWindowDimensions();
  const twoCol = width >= TWO_COL_BREAKPOINT;
  const [place, setPlace] = useState<Place | null>(null);
  const [todayTab, setTodayTab] = useState<TodayTab>('Temp');
  const [todayHidden, setTodayHidden] = useState<Record<string, boolean>>({});
  const [searchVisible, setSearchVisible] = useState(false);
  const [locating, setLocating] = useState(false);
  const { forecast, loading, error, refresh } = useForecast(place);

  // On launch: restore last location → GPS → sensible default.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const saved = await loadLastLocation();
      if (saved) {
        if (!cancelled) setPlace(saved);
        return;
      }
      const loc = await getCurrentPlace();
      if (cancelled) return;
      if (loc.status === 'ok') {
        setPlace(loc.place);
        saveLastLocation(loc.place);
      } else {
        setPlace(DEFAULT_PLACE);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const selectPlace = useCallback((p: Place) => {
    setPlace(p);
    saveLastLocation(p);
    setSearchVisible(false);
  }, []);

  const useCurrentLocation = useCallback(async () => {
    setLocating(true);
    const loc = await getCurrentPlace();
    setLocating(false);
    if (loc.status === 'ok') {
      setPlace(loc.place);
      saveLastLocation(loc.place);
      setSearchVisible(false);
    } else {
      Alert.alert(
        'Location unavailable',
        loc.status === 'denied'
          ? 'Location permission was denied. Search for a city instead.'
          : "Couldn't get your location. Search for a city instead."
      );
    }
  }, []);

  const initializing = !place;

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 6, paddingBottom: insets.bottom + 40 },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={loading && !!forecast} onRefresh={refresh} tintColor={colors.coral} />
        }
      >
        <View style={styles.inner}>
        <Header placeName={place?.name ?? 'Locating…'} onSearchPress={() => setSearchVisible(true)} />

        {(initializing || (loading && !forecast)) && !error && (
          <View style={styles.center}>
            <ActivityIndicator color={colors.coral} />
          </View>
        )}

        {error && !forecast && (
          <View style={styles.center}>
            <Text style={styles.error}>Couldn’t load weather.</Text>
            <Text style={styles.errorDim}>{error}</Text>
          </View>
        )}

        {forecast && (
          <View style={twoCol ? styles.columns : styles.stack}>
            <View style={twoCol ? styles.col : styles.stack}>
              <RightNow
                temp={forecast.current.temp}
                icon={describeWeather(forecast.current.weatherCode, forecast.current.isDay).icon}
                conditionLabel={describeWeather(forecast.current.weatherCode, forecast.current.isDay).label}
                feels={forecast.current.apparentTemp}
                high={forecast.daily.tempMax[0]}
                low={forecast.daily.tempMin[0]}
                precipMm={forecast.current.precipitation}
                precipPct={forecast.hourly.precipProb[hourIndex(forecast.hourly, forecast.current.time)] ?? 0}
                windSpeed={forecast.current.windSpeed}
                windDir={forecast.current.windDir}
              />

              <View style={styles.section}>
                <View style={styles.todayHead}>
                  <Text style={styles.todayTitle}>Today</Text>
                  <View style={styles.todayControls}>
                    <LegendMenu
                      type={todayTab}
                      hidden={todayHidden}
                      onToggle={(id) => setTodayHidden((h) => ({ ...h, [id]: !h[id] }))}
                    />
                    <SegmentedTabs options={TODAY_TABS} value={todayTab} onChange={setTodayTab} />
                  </View>
                </View>
                <View style={styles.chartCard}>
                  <WxChart type={todayTab} window={todayWindow(forecast)} hidden={todayHidden} />
                </View>
                <Text style={styles.hint}>drag the scrubber to read values</Text>
              </View>
            </View>

            <View style={twoCol ? styles.col : styles.section}>
              <DailyList forecast={forecast} />
            </View>
          </View>
        )}
        </View>
      </ScrollView>

      <SearchModal
        visible={searchVisible}
        onClose={() => setSearchVisible(false)}
        onSelectPlace={selectPlace}
        onUseCurrentLocation={useCurrentLocation}
        locating={locating}
      />
    </View>
  );
}

const makeStyles = (colors: Colors) =>
  StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.cream },
  content: { paddingHorizontal: space.screenH + 3, alignItems: 'center' },
  inner: { width: '100%', maxWidth: MAX_CONTENT_WIDTH, gap: 22 },

  // Layout: single column (phone) vs two columns (desktop/tablet).
  stack: { gap: 22 },
  columns: { flexDirection: 'row', alignItems: 'flex-start', gap: 28 },
  col: { flex: 1, gap: 22 },

  center: { paddingVertical: 60, alignItems: 'center', gap: 6 },
  error: { fontFamily: fonts.serif, fontSize: 18, color: colors.ink },
  errorDim: { fontFamily: fonts.body, fontSize: 12, color: colors.muted, textAlign: 'center' },

  section: { gap: 12 },
  todayHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  todayControls: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  todayTitle: { fontFamily: fonts.serif, fontSize: 23, color: colors.ink },

  chartCard: {
    borderWidth: 2,
    borderColor: colors.ink,
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingTop: 12,
    paddingBottom: 6,
  },
  hint: { fontFamily: fonts.mono, fontSize: 10, color: colors.faint, marginTop: -4 },
});
