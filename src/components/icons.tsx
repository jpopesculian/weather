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
