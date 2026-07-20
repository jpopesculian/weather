// Palette extracted from the Claude Design wireframes.
// Warm cream base, coral accent, ink text — minimal & friendly.
export const colors = {
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

  // Shadow (signature offset drop shadow)
  shadow: 'rgba(42,42,42,0.10)',
  backdrop: 'rgba(28,26,22,0.32)',
} as const;

export type ColorName = keyof typeof colors;
