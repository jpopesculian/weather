import { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { fonts, useTheme, type Colors } from '../theme';

type Props<T extends string> = {
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
  size?: 'md' | 'sm';
};

export function SegmentedTabs<T extends string>({
  options,
  value,
  onChange,
  size = 'md',
}: Props<T>) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const sm = size === 'sm';
  return (
    <View style={styles.track}>
      {options.map((opt) => {
        const active = opt === value;
        return (
          <Pressable
            key={opt}
            onPress={() => onChange(opt)}
            style={[styles.pill, sm && styles.pillSm, active && styles.pillActive]}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
          >
            <Text
              style={[
                styles.text,
                sm && styles.textSm,
                active ? styles.textActive : styles.textInactive,
              ]}
            >
              {opt}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const makeStyles = (colors: Colors) =>
  StyleSheet.create({
    track: {
      flexDirection: 'row',
      gap: 3,
      padding: 3,
      borderWidth: 2,
      borderColor: colors.ink,
      borderRadius: 20,
      backgroundColor: colors.segment,
    },
    pill: {
      paddingVertical: 5,
      paddingHorizontal: 12,
      borderRadius: 14,
    },
    pillSm: { paddingVertical: 4, paddingHorizontal: 10 },
    pillActive: { backgroundColor: colors.coral },
    text: { fontFamily: fonts.bodySemi, fontSize: 12 },
    textSm: { fontSize: 11 },
    textActive: { color: '#fff', fontFamily: fonts.bodyBold },
    textInactive: { color: colors.muted },
  });
