import { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { fonts, useTheme, type Colors } from '../theme';
import { SearchGlyph, PinGlyph, SunGlyph, MoonGlyph, SystemGlyph } from './icons';

type Props = {
  placeName: string;
  onSearchPress: () => void;
};

const THEME_ICON = { light: SunGlyph, dark: MoonGlyph, system: SystemGlyph };

export function Header({ placeName, onSearchPress }: Props) {
  const { colors, mode, cycleMode } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const ThemeIcon = THEME_ICON[mode];

  return (
    <View style={styles.row}>
      <Pressable
        onPress={onSearchPress}
        style={styles.circle}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="Search locations"
      >
        <SearchGlyph size={16} color={colors.coral} />
      </Pressable>

      <View style={styles.place}>
        <PinGlyph size={13} color={colors.coral} />
        <Text style={styles.placeText} numberOfLines={1}>
          {placeName}
        </Text>
      </View>

      <Pressable
        onPress={cycleMode}
        style={styles.circle}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={`Theme: ${mode}. Tap to switch light, dark, or system.`}
      >
        <ThemeIcon size={16} color={colors.coral} />
      </Pressable>
    </View>
  );
}

const makeStyles = (colors: Colors) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 4,
    },
    circle: {
      width: 40,
      height: 40,
      borderRadius: 20,
      borderWidth: 2,
      borderColor: colors.ink,
      alignItems: 'center',
      justifyContent: 'center',
    },
    place: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      paddingHorizontal: 8,
    },
    placeText: {
      fontFamily: fonts.bodyBold,
      fontSize: 16,
      color: colors.coral,
      flexShrink: 1,
    },
  });
