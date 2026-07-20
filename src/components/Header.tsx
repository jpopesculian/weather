import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors, fonts } from '../theme';
import { SearchGlyph, GearGlyph, PinGlyph } from './icons';

type Props = {
  placeName: string;
  onSearchPress: () => void;
};

export function Header({ placeName, onSearchPress }: Props) {
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

      {/* Settings gear — decorative in the metric-only build */}
      <View style={styles.circle}>
        <GearGlyph size={16} color={colors.coral} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
