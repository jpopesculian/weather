// Font family constants. Keys match the @expo-google-fonts export names loaded
// in App.tsx via useFonts. Headings use Fraunces (a warm, friendly serif);
// body / labels / chart text use Mulish.
export const fonts = {
  // Serif — headings
  serif: 'Fraunces_700Bold',
  serifBlack: 'Fraunces_900Black',
  serifSemi: 'Fraunces_600SemiBold',

  // Sans — body
  body: 'Mulish_400Regular',
  bodyMedium: 'Mulish_500Medium',
  bodySemi: 'Mulish_600SemiBold',
  bodyBold: 'Mulish_700Bold',
  bodyExtra: 'Mulish_800ExtraBold',

  // Monospace micro-labels (system)
  mono: 'ui-monospace',
} as const;

// Font module map consumed by useFonts (imported in App.tsx).
export { fontModules } from './fontModules';
