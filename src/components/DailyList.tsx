import { useMemo, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { fonts, useTheme, type Colors } from '../theme';
import type { Forecast } from '../lib/openMeteo';
import { describeWeather } from '../lib/wmo';
import { degToCompass, dayLabel } from '../lib/format';
import { dayWindow } from '../lib/derive';
import { WeatherIcon } from './WeatherIcon';
import { DropGlyph, WindArrow } from './icons';
import { SegmentedTabs } from './SegmentedTabs';
import { WxChart } from './WxChart';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const DAY_TABS = ['Temp', 'Precip', 'Wind'] as const;
type DayTab = (typeof DAY_TABS)[number];

type Props = {
  forecast: Forecast;
};

export function DailyList({ forecast }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const daily = forecast.daily;
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [tabs, setTabs] = useState<Record<number, DayTab>>({});

  const weekMin = Math.min(...daily.tempMin);
  const weekMax = Math.max(...daily.tempMax);
  const todayIso = daily.time[0];

  const toggle = (i: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  const setDayTab = (i: number, t: DayTab) => setTabs((prev) => ({ ...prev, [i]: t }));

  return (
    <View>
      <Text style={styles.title}>Next 10 Days</Text>

      <View style={styles.head}>
        <Text style={[styles.headCell, styles.colDay]}>DAY</Text>
        <Text style={[styles.headCell, styles.colPrecip]}>PRECIP</Text>
        <Text style={[styles.headCell, styles.colBar, styles.center]}>LO — HI</Text>
        <Text style={[styles.headCell, styles.colWind]}>WIND</Text>
        <View style={styles.colChevron} />
      </View>

      {daily.time.map((iso, i) => {
        const cond = describeWeather(daily.weatherCode[i], true);
        const isOpen = expanded.has(i);
        const tab = tabs[i] ?? 'Temp';
        return (
          <View key={iso}>
            <Pressable
              style={styles.row}
              onPress={() => toggle(i)}
              accessibilityRole="button"
              accessibilityState={{ expanded: isOpen }}
            >
              <View style={styles.colDay}>
                <WeatherIcon name={cond.icon} size={26} />
                <Text style={styles.day}>{dayLabel(iso, todayIso)}</Text>
              </View>

              <View style={[styles.colPrecip, styles.precip]}>
                <DropGlyph size={10} color={colors.blue} />
                <Text style={styles.precipText}>{Math.round(daily.precipProbMax[i] ?? 0)}%</Text>
              </View>

              <View style={[styles.colBar, styles.rangeRow]}>
                <Text style={styles.lo}>{Math.round(daily.tempMin[i])}°</Text>
                <RangeBar
                  lo={daily.tempMin[i]}
                  hi={daily.tempMax[i]}
                  min={weekMin}
                  max={weekMax}
                  colors={colors}
                />
                <Text style={styles.hi}>{Math.round(daily.tempMax[i])}°</Text>
              </View>

              <View style={[styles.colWind, styles.wind]}>
                <WindArrow size={12} color={colors.muted} rotation={daily.windDir[i] + 90} />
                <Text style={styles.windText}>
                  {Math.round(daily.windMax[i])} {degToCompass(daily.windDir[i])}
                </Text>
              </View>

              <Text style={[styles.colChevron, isOpen && styles.chevronOpen]}>›</Text>
            </Pressable>

            {isOpen && (
              <View style={styles.expand}>
                <View style={styles.expandHead}>
                  <Text style={styles.expandDay}>{dayLabel(iso, todayIso)}</Text>
                  <SegmentedTabs
                    options={DAY_TABS}
                    value={tab}
                    onChange={(t) => setDayTab(i, t)}
                    size="sm"
                  />
                </View>
                <WxChart type={tab} window={dayWindow(forecast, i)} />
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
}

function RangeBar({
  lo,
  hi,
  min,
  max,
  colors,
}: {
  lo: number;
  hi: number;
  min: number;
  max: number;
  colors: Colors;
}) {
  const span = Math.max(1, max - min);
  const left = ((lo - min) / span) * 100;
  const width = Math.max(6, ((hi - lo) / span) * 100);
  return (
    <View style={{ flex: 1, height: 7, borderRadius: 4, backgroundColor: colors.segment, overflow: 'hidden' }}>
      <View
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: `${left}%`,
          width: `${width}%`,
          borderRadius: 4,
          backgroundColor: colors.coral,
        }}
      />
    </View>
  );
}

const makeStyles = (colors: Colors) =>
  StyleSheet.create({
    title: { fontFamily: fonts.serif, fontSize: 23, color: colors.ink, marginBottom: 8 },

    head: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 2, paddingBottom: 4 },
    headCell: { fontFamily: fonts.mono, fontSize: 9, letterSpacing: 0.4, color: colors.faint },

    row: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 9,
      paddingHorizontal: 2,
      borderTopWidth: 1.5,
      borderTopColor: colors.hairline,
    },

    colDay: { width: 78, flexDirection: 'row', alignItems: 'center', gap: 6 },
    colPrecip: { width: 50 },
    colBar: { flex: 1 },
    colWind: { width: 74 },
    colChevron: { width: 14, textAlign: 'center', fontSize: 18, color: colors.coral },
    chevronOpen: { transform: [{ rotate: '90deg' }] },

    center: { textAlign: 'center' },

    day: { fontFamily: fonts.bodyBold, fontSize: 15, color: colors.ink },

    precip: { flexDirection: 'row', alignItems: 'center', gap: 3 },
    precipText: { fontFamily: fonts.body, fontSize: 13, color: colors.blue },

    rangeRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
    lo: { fontFamily: fonts.body, fontSize: 13, color: colors.muted, width: 22, textAlign: 'right' },
    hi: { fontFamily: fonts.bodyBold, fontSize: 13, color: colors.ink, width: 22 },

    wind: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    windText: { fontFamily: fonts.body, fontSize: 13, color: colors.muted },

    expand: {
      borderWidth: 2,
      borderColor: colors.coral,
      borderRadius: 18,
      backgroundColor: colors.wash,
      padding: 12,
      marginTop: 4,
      marginBottom: 6,
      gap: 8,
    },
    expandHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    expandDay: { fontFamily: fonts.serif, fontSize: 16, color: colors.ink },
  });
