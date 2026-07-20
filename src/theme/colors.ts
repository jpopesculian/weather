// Palette extracted from the Claude Design wireframes, with a warm dark
// counterpart. Same keys in both so components can switch at runtime via the
// theme context. Light = warm cream; dark = warm espresso (not pure black),
// keeping the friendly feel. Coral accent carries across both.

export const colorsLight = {
  // Surfaces
  cream: '#f0eee9', // app background
  card: '#fffdf8', // raised cards / sheets
  segment: '#f2efe7', // segmented-control track
  wash: '#fffaf4', // expanded-day card wash

  // Text
  ink: '#2a2a2a', // primary text / borders
  muted: '#6b655c', // secondary text
  soft: '#857f76', // tertiary text (search subtitles)
  faint: '#a49c90', // monospace micro-labels

  // Accent
  coral: '#cf6a4f',
  coralDark: '#b4553c',

  // Weather hues
  gold: '#e6b23c', // sun
  blue: '#7ea8bd', // rain / precip line
  precip: '#cfe0e8', // precip bars
  precipActive: '#5f97bd', // scrubbed precip bar
  cloud: '#cdd3d8', // cloud fills
  cloudLine: '#c4bcac', // cloud line on chart
  gust: '#b6ae9e', // wind gust line

  // Lines
  hairline: '#ece6db', // list row dividers
  grid: '#eae3d4', // chart gridlines
  handle: '#d8d2c6', // sheet drag handle

  // Chrome
  scrubDot: '#ffffff', // scrubber dot fill / on-coral text
  shadow: 'rgba(42,42,42,0.10)',
  backdrop: 'rgba(28,26,22,0.32)',
} as const;

export type Colors = { [K in keyof typeof colorsLight]: string };

export const colorsDark: Colors = {
  // Surfaces
  cream: '#1b1813',
  card: '#241f19',
  segment: '#2c261f',
  wash: '#2a241d',

  // Text
  ink: '#f2ede3',
  muted: '#b6ac9d',
  soft: '#978d7e',
  faint: '#7a7164',

  // Accent
  coral: '#e87d5e',
  coralDark: '#cf6a4f',

  // Weather hues
  gold: '#eec25c',
  blue: '#8fb9ce',
  precip: '#33454f',
  precipActive: '#7fb2d2',
  cloud: '#4a4f56',
  cloudLine: '#6f6759',
  gust: '#7c7568',

  // Lines
  hairline: '#332d25',
  grid: '#2c271f',
  handle: '#48423a',

  // Chrome
  scrubDot: '#241f19',
  shadow: 'rgba(0,0,0,0.4)',
  backdrop: 'rgba(0,0,0,0.55)',
};

// Legacy static alias (light). Prefer useTheme().colors in components.
export const colors: Colors = colorsLight;
export type ColorName = keyof typeof colorsLight;
