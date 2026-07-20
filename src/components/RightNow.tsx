import { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { fonts, useTheme, type Colors } from '../theme';
import { WeatherIcon, type IconName } from './WeatherIcon';
import { StatCard } from './StatCard';
import { DropGlyph, WindArrow } from './icons';
import { degToCompass } from '../lib/format';

type Props = {
  temp: number;
  icon: IconName;
  conditionLabel: string;
  feels: number;
  high: number;
  low: number;
  precipMm: number;
  precipPct: number;
  windSpeed: number;
  windDir: number;
};

export function RightNow(p: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  return (
    <View style={styles.wrap}>
      <View style={styles.hero}>
        <WeatherIcon name={p.icon} size={86} />
        <Text style={styles.temp}>{Math.round(p.temp)}°C</Text>
      </View>

      <Text style={styles.summary} numberOfLines={1}>
        {p.conditionLabel}
        <Text style={styles.summaryDim}>{`  •  Feels ${Math.round(p.feels)}°C`}</Text>
      </Text>

      <View style={styles.chips}>
        <StatCard label="TEMP">
          <Text style={styles.chipText} numberOfLines={1}>
            {`H ${Math.round(p.high)}°C  L ${Math.round(p.low)}°C`}
          </Text>
        </StatCard>
        <StatCard label="PRECIP">
          <DropGlyph size={11} color={colors.blue} />
          <Text style={styles.chipText} numberOfLines={1}>
            {p.precipMm.toFixed(1)} mm · {Math.round(p.precipPct)}%
          </Text>
        </StatCard>
        <StatCard label="WIND">
          <WindArrow size={13} color={colors.ink} rotation={p.windDir + 90} />
          <Text style={styles.chipText} numberOfLines={1}>
            {Math.round(p.windSpeed)} km/h {degToCompass(p.windDir)}
          </Text>
        </StatCard>
      </View>
    </View>
  );
}

const makeStyles = (colors: Colors) =>
  StyleSheet.create({
    wrap: {},
    hero: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
    temp: { fontFamily: fonts.serifBlack, fontSize: 58, color: colors.ink, lineHeight: 62 },
    summary: {
      textAlign: 'center',
      fontFamily: fonts.bodyBold,
      fontSize: 15,
      color: colors.ink,
      marginTop: 4,
      marginBottom: 18,
    },
    summaryDim: { fontFamily: fonts.body, color: colors.muted },
    chips: { flexDirection: 'row', gap: 7 },
    chipText: { fontFamily: fonts.bodyBold, fontSize: 11, color: colors.ink, flexShrink: 1 },
  });
