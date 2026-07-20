import { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, ActivityIndicator, RefreshControl, Alert, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, fonts, space } from '../theme';
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
  const [place, setPlace] = useState<Place | null>(null);
  const [todayTab, setTodayTab] = useState<TodayTab>('Temp');
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
          <>
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
                <SegmentedTabs options={TODAY_TABS} value={todayTab} onChange={setTodayTab} />
              </View>
              <View style={styles.chartCard}>
                <WxChart type={todayTab} window={todayWindow(forecast)} />
              </View>
              <Text style={styles.hint}>drag the scrubber to read values</Text>
            </View>

            <View style={styles.section}>
              <DailyList forecast={forecast} />
            </View>
          </>
        )}
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

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.cream },
  content: { paddingHorizontal: space.screenH + 3, gap: 22 },
  center: { paddingVertical: 60, alignItems: 'center', gap: 6 },
  error: { fontFamily: fonts.serif, fontSize: 18, color: colors.ink },
  errorDim: { fontFamily: fonts.body, fontSize: 12, color: colors.muted, textAlign: 'center' },

  section: { gap: 12 },
  todayHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
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
