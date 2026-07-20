import { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { fonts, useTheme, type Colors } from '../theme';

type Props = {
  label: string;
  children: React.ReactNode;
};

export function StatCard({ label, children }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  return (
    <View style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.value}>{children}</View>
    </View>
  );
}

const makeStyles = (colors: Colors) =>
  StyleSheet.create({
    card: {
      flex: 1,
      borderWidth: 2,
      borderColor: colors.ink,
      borderRadius: 12,
      paddingVertical: 7,
      paddingHorizontal: 7,
      gap: 2,
    },
    label: {
      fontFamily: fonts.mono,
      fontSize: 9,
      letterSpacing: 0.5,
      color: colors.faint,
    },
    value: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3,
    },
  });
