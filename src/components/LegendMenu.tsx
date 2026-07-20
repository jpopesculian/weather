// Small legend button that sits next to the chart's segmented tabs. Tapping it
// opens a dropdown listing the chart's series; each row toggles that series'
// visibility (the toggling drives WxChart via the shared `hidden` map).
import { useRef, useState } from 'react';
import { View, Text, Pressable, Modal, StyleSheet, useWindowDimensions } from 'react-native';
import Svg, { Line, Circle } from 'react-native-svg';

import { fonts, useTheme } from '../theme';
import { legendSeriesFor, OVERLAY_DASH, type ChartType } from './WxChart';

const MENU_W = 194;

type Props = {
  type: ChartType;
  hidden: Record<string, boolean>;
  onToggle: (id: string) => void;
  size?: 'md' | 'sm';
};

export function LegendMenu({ type, hidden, onToggle, size = 'md' }: Props) {
  const { colors } = useTheme();
  const { width: screenW, height: screenH } = useWindowDimensions();
  const series = legendSeriesFor(type, colors);
  const btnRef = useRef<View>(null);
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ x: number; y: number; w: number; h: number } | null>(null);

  // Precip has a single series — no legend needed.
  if (series.length === 0) return null;

  const dim = size === 'sm' ? 28 : 32;

  const openMenu = () => {
    const node = btnRef.current;
    if (node) {
      node.measureInWindow((x, y, w, h) => {
        setPos({ x, y, w, h });
        setOpen(true);
      });
    } else {
      setOpen(true);
    }
  };

  const below = !pos || pos.y < screenH * 0.6;
  const anchor = pos
    ? {
        left: Math.min(Math.max(8, pos.x), screenW - MENU_W - 8),
        ...(below ? { top: pos.y + pos.h + 6 } : { bottom: screenH - pos.y + 6 }),
      }
    : {};

  return (
    <>
      <Pressable
        ref={btnRef}
        onPress={openMenu}
        style={[styles.btn, { width: dim, height: dim, borderRadius: dim / 2, borderColor: colors.ink }]}
        hitSlop={6}
        accessibilityRole="button"
        accessibilityLabel="Show chart legend"
      >
        <InfoGlyph color={colors.coral} />
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={StyleSheet.absoluteFill} onPress={() => setOpen(false)}>
          {pos && (
            <View style={[styles.menu, { backgroundColor: colors.card, borderColor: colors.ink }, anchor]}>
              <Text style={[styles.menuTitle, { color: colors.faint }]}>LEGEND</Text>
              {series.map((s) => {
                const active = !hidden[s.id];
                return (
                  <Pressable
                    key={s.id}
                    style={styles.row}
                    onPress={() => onToggle(s.id)}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: active }}
                  >
                    <Svg width={22} height={6} viewBox="0 0 22 6">
                      <Line
                        x1={1}
                        y1={3}
                        x2={21}
                        y2={3}
                        stroke={active ? s.color : colors.faint}
                        strokeWidth={s.dashed ? 2 : 3}
                        strokeDasharray={s.dashed ? OVERLAY_DASH : undefined}
                        strokeLinecap="round"
                      />
                    </Svg>
                    <Text
                      style={[
                        styles.rowLabel,
                        { color: active ? colors.ink : colors.faint },
                        !active && styles.rowLabelOff,
                      ]}
                      numberOfLines={1}
                    >
                      {s.label}
                    </Text>
                    <Text style={[styles.check, { color: active ? colors.coral : 'transparent' }]}>✓</Text>
                  </Pressable>
                );
              })}
            </View>
          )}
        </Pressable>
      </Modal>
    </>
  );
}

function InfoGlyph({ color }: { color: string }) {
  return (
    <Svg width={14} height={16} viewBox="0 0 14 16">
      <Circle cx={7} cy={2.4} r={1.5} fill={color} />
      <Line x1={7} y1={6} x2={7} y2={13} stroke={color} strokeWidth={2.4} strokeLinecap="round" />
    </Svg>
  );
}

const styles = StyleSheet.create({
  btn: {
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menu: {
    position: 'absolute',
    width: MENU_W,
    borderWidth: 2,
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 10,
    elevation: 8, // subtle depth on Android; border defines it elsewhere
  },
  menuTitle: {
    fontFamily: fonts.mono,
    fontSize: 9,
    letterSpacing: 0.5,
    marginBottom: 4,
    paddingHorizontal: 2,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, paddingHorizontal: 2 },
  rowLabel: { flex: 1, fontFamily: fonts.bodySemi, fontSize: 14 },
  rowLabelOff: { textDecorationLine: 'line-through' },
  check: { fontFamily: fonts.bodyBold, fontSize: 14, width: 16, textAlign: 'center' },
});
