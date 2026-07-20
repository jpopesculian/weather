// Small inline UI glyphs (react-native-svg), ported from the wireframe SVGs.
// These are the chrome icons — weather condition icons come from Meteocons.
import Svg, { Circle, Line, Path, G } from 'react-native-svg';
import { colors } from '../theme';

type StrokeProps = { size?: number; color?: string };

export function SearchGlyph({ size = 18, color = colors.coral }: StrokeProps) {
  return (
    <Svg viewBox="0 0 20 20" width={size} height={size}>
      <Circle cx={8} cy={8} r={5.5} fill="none" stroke={color} strokeWidth={2} />
      <Line x1={12} y1={12} x2={17.5} y2={17.5} stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

export function GearGlyph({ size = 16, color = colors.coral }: StrokeProps) {
  return (
    <Svg viewBox="0 0 20 20" width={size} height={size} fill="none" stroke={color} strokeWidth={1.7}>
      <Circle cx={10} cy={10} r={3} />
      <Circle cx={10} cy={10} r={7} strokeDasharray="2.2 2.4" />
    </Svg>
  );
}

// Location "send" arrow (paper-plane style pin marker).
export function PinGlyph({ size = 13, color = colors.coral }: StrokeProps) {
  return (
    <Svg viewBox="0 0 16 16" width={size} height={size}>
      <Path d="M14 2 L2 7 L7 8.5 L8.5 14 Z" fill={color} />
    </Svg>
  );
}

export function DropGlyph({ size = 12, color = colors.blue }: StrokeProps) {
  const h = (size / 9) * 12;
  return (
    <Svg viewBox="0 0 14 18" width={size} height={h}>
      <Path
        d="M7 1 C7 1 12 9 12 12.5 A5 5 0 1 1 2 12.5 C2 9 7 1 7 1 Z"
        fill={color}
        stroke={colors.ink}
        strokeWidth={1}
      />
    </Svg>
  );
}

// Arrow pointing along wind travel. `rotation` in degrees.
export function WindArrow({
  size = 13,
  color = colors.ink,
  rotation = 0,
}: StrokeProps & { rotation?: number }) {
  const h = (size / 18) * 12;
  return (
    <Svg viewBox="0 0 18 12" width={size} height={h}>
      <G transform={`rotate(${rotation}, 9, 6)`}>
        <Path
          d="M1 6 H13 M9.5 2.5 L13 6 L9.5 9.5"
          fill="none"
          stroke={color}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </G>
    </Svg>
  );
}

// Theme-mode glyphs for the header switch.
export function SunGlyph({ size = 16, color = colors.coral }: StrokeProps) {
  return (
    <Svg viewBox="0 0 24 24" width={size} height={size}>
      <Circle cx={12} cy={12} r={4.6} fill="none" stroke={color} strokeWidth={2} />
      <G stroke={color} strokeWidth={2} strokeLinecap="round">
        <Line x1={12} y1={2} x2={12} y2={4.5} />
        <Line x1={12} y1={19.5} x2={12} y2={22} />
        <Line x1={2} y1={12} x2={4.5} y2={12} />
        <Line x1={19.5} y1={12} x2={22} y2={12} />
        <Line x1={4.9} y1={4.9} x2={6.7} y2={6.7} />
        <Line x1={17.3} y1={17.3} x2={19.1} y2={19.1} />
        <Line x1={19.1} y1={4.9} x2={17.3} y2={6.7} />
        <Line x1={6.7} y1={17.3} x2={4.9} y2={19.1} />
      </G>
    </Svg>
  );
}

export function MoonGlyph({ size = 16, color = colors.coral }: StrokeProps) {
  return (
    <Svg viewBox="0 0 24 24" width={size} height={size}>
      <Path
        d="M21 12.8A8.2 8.2 0 1 1 11.2 3 6.4 6.4 0 0 0 21 12.8Z"
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// System / auto: a circle with one half filled (contrast).
export function SystemGlyph({ size = 16, color = colors.coral }: StrokeProps) {
  return (
    <Svg viewBox="0 0 24 24" width={size} height={size}>
      <Circle cx={12} cy={12} r={8} fill="none" stroke={color} strokeWidth={2} />
      <Path d="M12 4.5 A7.5 7.5 0 0 1 12 19.5 Z" fill={color} />
    </Svg>
  );
}
