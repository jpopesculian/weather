// Layout tokens from the wireframes: chunky ink borders, rounded cards, and a
// signature offset drop-shadow. The "wonky" asymmetric radii give the friendly,
// hand-drawn feel.
import { colors } from './colors';

export const radii = {
  card: 30,
  sheet: 26,
  pill: 200,
  stat: 12,
  chip: 14,
  segment: 20,
} as const;

export const border = {
  width: 2.5,
  color: colors.ink,
} as const;

// Asymmetric radius used on the chart card / search field (a gentle wobble).
export const wonkyRadius = '16px 24px 16px 24px / 24px 16px 24px 16px';

// Signature offset shadow — implemented per-platform in the Card component.
export const cardShadow = {
  shadowColor: colors.ink,
  shadowOffset: { width: 5, height: 7 },
  shadowOpacity: 0.1,
  shadowRadius: 0,
  elevation: 4,
} as const;

export const space = {
  screenH: 15,
  screenTop: 16,
  gap: 18,
} as const;
