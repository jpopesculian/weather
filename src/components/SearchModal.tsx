import { useEffect, useRef, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, fonts } from '../theme';
import {
  searchPlaces,
  fetchCurrentBrief,
  type Place,
  type CurrentBrief,
} from '../lib/openMeteo';
import { describeWeather } from '../lib/wmo';
import { WeatherIcon } from './WeatherIcon';
import { SearchGlyph, PinGlyph } from './icons';

type Props = {
  visible: boolean;
  onClose: () => void;
  onSelectPlace: (place: Place) => void;
  onUseCurrentLocation: () => void;
  locating?: boolean;
};

const keyOf = (p: Place) => `${p.latitude.toFixed(3)},${p.longitude.toFixed(3)}`;

export function SearchModal({
  visible,
  onClose,
  onSelectPlace,
  onUseCurrentLocation,
  locating,
}: Props) {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Place[]>([]);
  const [briefs, setBriefs] = useState<Record<string, CurrentBrief>>({});
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<TextInput>(null);

  // Reset when opened.
  useEffect(() => {
    if (visible) {
      setQuery('');
      setResults([]);
      setBriefs({});
      const t = setTimeout(() => inputRef.current?.focus(), 120);
      return () => clearTimeout(t);
    }
  }, [visible]);

  // Debounced geocoding + per-result current conditions.
  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      setBriefs({});
      setLoading(false);
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const places = await searchPlaces(q, controller.signal);
        if (controller.signal.aborted) return;
        setResults(places);
        setLoading(false);
        // Fetch current conditions for each result (best-effort).
        places.forEach(async (p) => {
          const brief = await fetchCurrentBrief(p.latitude, p.longitude, controller.signal);
          if (brief && !controller.signal.aborted) {
            setBriefs((prev) => ({ ...prev, [keyOf(p)]: brief }));
          }
        });
      } catch {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 280);

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [query]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable style={{ height: insets.top + 10 }} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.handle} />

          <View style={styles.searchRow}>
            <View style={styles.field}>
              <SearchGlyph size={18} color={colors.coral} />
              <TextInput
                ref={inputRef}
                style={styles.input}
                value={query}
                onChangeText={setQuery}
                placeholder="Search city"
                placeholderTextColor={colors.faint}
                autoCorrect={false}
                autoCapitalize="words"
                returnKeyType="search"
              />
              {query.length > 0 && (
                <Pressable onPress={() => setQuery('')} hitSlop={8}>
                  <Text style={styles.clear}>✕</Text>
                </Pressable>
              )}
            </View>
            <Pressable onPress={onClose} hitSlop={8}>
              <Text style={styles.cancel}>Cancel</Text>
            </Pressable>
          </View>

          <Pressable style={styles.currentRow} onPress={onUseCurrentLocation}>
            <PinGlyph size={18} color={colors.coral} />
            <View style={styles.currentText}>
              <Text style={styles.currentTitle}>Current Location</Text>
              <Text style={styles.currentSub}>Use my device location</Text>
            </View>
            {locating && <ActivityIndicator color={colors.coral} />}
          </Pressable>

          {query.trim().length >= 2 && (
            <Text style={styles.sectionLabel}>MATCHING CITIES</Text>
          )}

          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
          >
            {loading && results.length === 0 && (
              <View style={styles.loadingBox}>
                <ActivityIndicator color={colors.coral} />
              </View>
            )}
            {results.map((p) => {
              const brief = briefs[keyOf(p)];
              const cond = brief ? describeWeather(brief.weatherCode, brief.isDay) : null;
              return (
                <Pressable key={keyOf(p) + p.name} style={styles.resultRow} onPress={() => onSelectPlace(p)}>
                  <View style={styles.resultIcon}>
                    {cond ? <WeatherIcon name={cond.icon} size={30} /> : null}
                  </View>
                  <View style={styles.resultText}>
                    <HighlightedName name={p.name} query={query} />
                    <Text style={styles.resultSub} numberOfLines={1}>
                      {[p.admin1, p.country].filter(Boolean).join(' · ')}
                    </Text>
                  </View>
                  <Text style={styles.resultTemp}>
                    {brief ? `${Math.round(brief.temp)}°` : ''}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function HighlightedName({ name, query }: { name: string; query: string }) {
  const q = query.trim();
  const idx = q ? name.toLowerCase().indexOf(q.toLowerCase()) : -1;
  if (idx < 0) {
    return <Text style={styles.resultName}>{name}</Text>;
  }
  return (
    <Text style={styles.resultName}>
      {name.slice(0, idx)}
      <Text style={styles.match}>{name.slice(idx, idx + q.length)}</Text>
      {name.slice(idx + q.length)}
    </Text>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: colors.backdrop },
  sheet: {
    flex: 1,
    backgroundColor: colors.card,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    borderTopWidth: 2.5,
    borderColor: colors.ink,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  handle: { width: 42, height: 5, borderRadius: 3, backgroundColor: colors.handle, alignSelf: 'center', marginBottom: 16 },

  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 11, marginBottom: 6 },
  field: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    borderWidth: 2,
    borderColor: colors.ink,
    borderRadius: 16,
    paddingVertical: 9,
    paddingHorizontal: 13,
    backgroundColor: colors.card,
  },
  input: { flex: 1, fontFamily: fonts.bodyMedium, fontSize: 17, color: colors.ink, padding: 0 },
  clear: { fontSize: 13, color: colors.soft, paddingHorizontal: 2 },
  cancel: { fontFamily: fonts.bodyBold, fontSize: 16, color: colors.coral },

  currentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1.5,
    borderBottomColor: colors.hairline,
  },
  currentText: { flex: 1 },
  currentTitle: { fontFamily: fonts.bodyBold, fontSize: 20, color: colors.coral },
  currentSub: { fontFamily: fonts.body, fontSize: 13, color: colors.soft },

  sectionLabel: { fontFamily: fonts.mono, fontSize: 9.5, letterSpacing: 0.5, color: colors.faint, marginTop: 16, marginBottom: 4 },

  loadingBox: { paddingVertical: 30, alignItems: 'center' },

  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    paddingVertical: 11,
    borderBottomWidth: 1.5,
    borderBottomColor: colors.hairline,
  },
  resultIcon: { width: 30, height: 30, alignItems: 'center', justifyContent: 'center' },
  resultText: { flex: 1 },
  resultName: { fontFamily: fonts.bodyExtra, fontSize: 22, color: colors.ink },
  match: { color: colors.coral },
  resultSub: { fontFamily: fonts.body, fontSize: 13, color: colors.soft },
  resultTemp: { fontFamily: fonts.body, fontSize: 18, color: colors.muted },
});
