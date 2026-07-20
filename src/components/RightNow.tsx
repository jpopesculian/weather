import { View, Text, StyleSheet } from 'react-native';
import { colors, fonts } from '../theme';
import { WeatherIcon, type IconName } from './WeatherIcon';
import { StatCard } from './StatCard';
import { DropGlyph, WindArrow } from './icons';
import { degToCompass, mmToCmLabel } from '../lib/format';

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
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>Right Now</Text>

      <View style={styles.main}>
        <WeatherIcon name={p.icon} size={64} />
        <Text style={styles.temp}>{Math.round(p.temp)}°</Text>
        <Text style={styles.detail}>
          {p.conditionLabel}
          {'\n'}
          <Text style={styles.detailDim}>
            Feels {Math.round(p.feels)}° · H {Math.round(p.high)}° L {Math.round(p.low)}°
          </Text>
        </Text>
      </View>

      <View style={styles.stats}>
        <StatCard label="PRECIP">
          <DropGlyph size={11} color={colors.blue} />
          <Text style={styles.statText}>
            {mmToCmLabel(p.precipMm)} · {Math.round(p.precipPct)}%
          </Text>
        </StatCard>
        <StatCard label="WIND">
          <WindArrow size={14} color={colors.ink} rotation={p.windDir + 90} />
          <Text style={styles.statText}>
            {Math.round(p.windSpeed)} {degToCompass(p.windDir)}
          </Text>
        </StatCard>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 12 },
  title: { fontFamily: fonts.serif, fontSize: 27, color: colors.ink },
  main: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  temp: { fontFamily: fonts.serifBlack, fontSize: 46, color: colors.ink, lineHeight: 50 },
  detail: { fontFamily: fonts.bodySemi, fontSize: 14, color: colors.ink, lineHeight: 19, flexShrink: 1 },
  detailDim: { fontFamily: fonts.body, fontSize: 12.5, color: colors.muted, lineHeight: 18 },
  stats: { flexDirection: 'row', gap: 8, marginTop: 2 },
  statText: { fontFamily: fonts.bodyBold, fontSize: 14, color: colors.ink },
});
