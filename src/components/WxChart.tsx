// Interactive weather chart — a react-native-svg port of the design's
// WxChart.dc.html. Temp (line + cloud + sun markers), Precip (bars), Wind
// (speed + gust + direction arrows), all with a draggable scrubber + readout.
import { useMemo, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Line, Path, Rect, Circle, G, Text as SvgText } from 'react-native-svg';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

import { colors, fonts } from '../theme';
import type { ChartWindow } from '../lib/derive';
import { describeWeather } from '../lib/wmo';
import { WeatherIcon } from './WeatherIcon';
import { fracToClock, hourTick } from '../lib/format';

type ChartType = 'Temp' | 'Precip' | 'Wind';

type Props = {
  type: ChartType;
  window: ChartWindow;
  accent?: string;
};

// viewBox geometry (matches the design).
const VBW = 340;
const VBH = 200;
const PL = 16;
const PR = 324;
const PT = 44;
const PB = 150;
const PW = PR - PL;
const PH = PB - PT;
const ICON_Y = PB + 30;
const LABEL_Y = PB + 15;
const ICON_PX = 22; // overlay icon pixel size

type Pt = [number, number];

function smooth(pts: Pt[]): string {
  if (pts.length < 2) return '';
  let s = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] || p2;
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    s += `C${c1x.toFixed(1)},${c1y.toFixed(1)} ${c2x.toFixed(1)},${c2y.toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
  }
  return s;
}

export function WxChart({ type, window: win, accent = colors.coral }: Props) {
  const [width, setWidth] = useState(0);
  const [frac, setFrac] = useState<number | null>(null);

  const N = win.times.length;
  const scale = width > 0 ? width / VBW : 0;
  const height = width * (VBH / VBW);

  const xAt = (i: number) => PL + (i / (N - 1)) * PW;
  const interp = (arr: number[], f: number) => {
    const p = f * (N - 1);
    const i = Math.floor(p);
    const t = p - i;
    const a = arr[i];
    const b = arr[Math.min(i + 1, N - 1)];
    return a + (b - a) * t;
  };

  const curFrac = frac == null ? (win.nowFrac ?? 0.5) : frac;

  const setFromX = (px: number) => {
    if (scale <= 0) return;
    const vx = px / scale;
    const f = Math.max(0, Math.min(1, (vx - PL) / PW));
    setFrac(f);
  };

  const pan = useMemo(
    () =>
      Gesture.Pan()
        .minDistance(0)
        .onBegin((e) => setFromX(e.x))
        .onUpdate((e) => setFromX(e.x)),
    [scale, N]
  );

  // --- build svg children + overlay icons for the active type ---
  const els: React.ReactNode[] = [];
  const overlay: React.ReactNode[] = [];

  // gridlines
  for (let g = 0; g <= 2; g++) {
    const gy = PT + g * (PH / 2);
    els.push(<Line key={`g${g}`} x1={PL} y1={gy} x2={PR} y2={gy} stroke={colors.grid} strokeWidth={1} />);
  }
  // x labels (every other point)
  win.times.forEach((iso, i) => {
    if (i % 2 === 0) {
      els.push(
        <SvgText key={`xl${i}`} x={xAt(i)} y={LABEL_Y} fontSize={10} fontFamily={fonts.body} fill={colors.faint} textAnchor="middle">
          {hourTick(iso)}
        </SvgText>
      );
    }
  });

  let sx = PL;
  let sy = PB;
  let readout = '';
  let sub = '';

  const pushConditionIcons = () => {
    if (scale <= 0) return;
    win.codes.forEach((code, i) => {
      const cond = describeWeather(code, win.isDay[i] === 1);
      overlay.push(
        <View
          key={`ic${i}`}
          style={{
            position: 'absolute',
            left: xAt(i) * scale - ICON_PX / 2,
            top: ICON_Y * scale - ICON_PX / 2,
            width: ICON_PX,
            height: ICON_PX,
            pointerEvents: 'none',
          }}
        >
          <WeatherIcon name={cond.icon} size={ICON_PX} />
        </View>
      );
    });
  };

  if (type === 'Temp') {
    const temps = win.temp;
    const clouds = win.cloud;
    const vmin = Math.min(...temps) - 3;
    const vmax = Math.max(...temps) + 3;
    const yT = (v: number) => PB - ((v - vmin) / (vmax - vmin)) * PH;
    const yC = (v: number) => PB - (v / 100) * PH * 0.92;
    const pts: Pt[] = temps.map((v, i) => [xAt(i), yT(v)]);
    const cpts: Pt[] = clouds.map((v, i) => [xAt(i), yC(v)]);

    // sunrise / sunset markers
    ([['sunsetFrac', 'Sunset'], ['sunriseFrac', 'Sunrise']] as const).forEach(([k, lab], idx) => {
      const f = win[k];
      if (f == null) return;
      const lx = PL + f * PW;
      els.push(<Line key={`sl${idx}`} x1={lx} y1={PT - 4} x2={lx} y2={PB} stroke="#e0b866" strokeWidth={1.3} strokeDasharray="2 3" />);
      els.push(
        <SvgText key={`st${idx}`} x={lx - 4} y={PT + 30} fontSize={7.5} fontFamily={fonts.body} fill="#bd9636" textAnchor="middle" transform={`rotate(-90, ${lx - 4}, ${PT + 30})`}>
          {lab}
        </SvgText>
      );
    });

    // area fill + cloud line + temp line
    els.push(<Path key="area" d={`${smooth(pts)} L${PR},${PB} L${PL},${PB} Z`} fill={accent} opacity={0.08} />);
    els.push(<Path key="cloud" d={smooth(cpts)} fill="none" stroke={colors.cloudLine} strokeWidth={1.6} strokeDasharray="1 5" strokeLinecap="round" />);
    els.push(<Path key="line" d={smooth(pts)} fill="none" stroke={colors.ink} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />);

    // now dot
    if (win.nowFrac != null) {
      els.push(<Circle key="nowdot" cx={PL + win.nowFrac * PW} cy={PB} r={2.6} fill={accent} />);
    }

    pushConditionIcons();
    const sv = interp(temps, curFrac);
    sx = PL + curFrac * PW;
    sy = yT(sv);
    readout = `${Math.round(sv)}°`;
  } else if (type === 'Precip') {
    const precip = win.precipProb;
    const pmax = Math.max(10, ...precip);
    const yP = (v: number) => PB - (v / pmax) * PH * 0.92;
    const ni = Math.round(curFrac * (N - 1));
    precip.forEach((v, i) => {
      const bw = (PW / N) * 0.52;
      const bx = xAt(i) - bw / 2;
      const by = yP(v);
      els.push(<Rect key={`b${i}`} x={bx} y={by} width={bw} height={Math.max(1.5, PB - by)} rx={3} fill={i === ni ? colors.precipActive : colors.precip} />);
    });
    pushConditionIcons();
    sx = xAt(ni);
    sy = yP(precip[ni]);
    readout = `${Math.round(precip[ni])}%`;
  } else {
    const wind = win.wind;
    const gust = win.gust;
    const dir = win.dir;
    const wmax = Math.max(...gust) + 4;
    const yW = (v: number) => PB - (v / wmax) * PH * 0.94;
    const wpts: Pt[] = wind.map((v, i) => [xAt(i), yW(v)]);
    const gpts: Pt[] = gust.map((v, i) => [xAt(i), yW(v)]);
    els.push(<Path key="gust" d={smooth(gpts)} fill="none" stroke={colors.gust} strokeWidth={2} strokeDasharray="4 3" strokeLinecap="round" />);
    els.push(<Path key="spd" d={smooth(wpts)} fill="none" stroke={colors.ink} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />);
    // legend
    els.push(<Line key="lg1" x1={PL} y1={PT - 24} x2={PL + 14} y2={PT - 24} stroke={colors.ink} strokeWidth={2.5} />);
    els.push(<SvgText key="lg1t" x={PL + 18} y={PT - 21} fontSize={9} fontFamily={fonts.body} fill={colors.muted}>speed</SvgText>);
    els.push(<Line key="lg2" x1={PL + 58} y1={PT - 24} x2={PL + 72} y2={PT - 24} stroke={colors.gust} strokeWidth={2} strokeDasharray="4 3" />);
    els.push(<SvgText key="lg2t" x={PL + 76} y={PT - 21} fontSize={9} fontFamily={fonts.body} fill={colors.muted}>gust</SvgText>);
    // direction arrows (drawn inside svg)
    win.times.forEach((_, i) => {
      els.push(
        <G key={`da${i}`} transform={`translate(${xAt(i)}, ${ICON_Y}) rotate(${dir[i] + 180})`}>
          <Path d="M0 -5 L0 5 M-2.6 -2 L0 -5 L2.6 -2" fill="none" stroke={colors.soft} strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" />
        </G>
      );
    });
    const sv = interp(wind, curFrac);
    const sg = interp(gust, curFrac);
    sx = PL + curFrac * PW;
    sy = yW(sv);
    readout = `${Math.round(sv)} km/h`;
    sub = `gusts ${Math.round(sg)}`;
  }

  // scrubber
  els.push(<Line key="scl" x1={sx} y1={PT - 8} x2={sx} y2={PB} stroke={accent} strokeWidth={1.5} />);
  els.push(<Circle key="scd" cx={sx} cy={sy} r={4.5} fill="#fff" stroke={accent} strokeWidth={2.5} />);

  // readout bubble
  const bw = sub ? 78 : 54;
  const bh = sub ? 32 : 26;
  const bx = Math.max(PL, Math.min(PR - bw, sx - bw / 2));
  els.push(
    <G key="ro">
      <Rect x={bx} y={6} width={bw} height={bh} rx={8} fill={colors.card} stroke={accent} strokeWidth={1.5} />
      <SvgText x={bx + bw / 2} y={sub ? 19 : 20} fontSize={15} fontFamily={fonts.bodyExtra} fill={colors.ink} textAnchor="middle">
        {readout}
      </SvgText>
      {sub ? (
        <SvgText x={bx + bw / 2} y={28} fontSize={8.5} fontFamily={fonts.body} fill={colors.soft} textAnchor="middle">
          {sub}
        </SvgText>
      ) : null}
      <SvgText x={bx + bw / 2} y={bh + 18} fontSize={9} fontFamily={fonts.body} fill={accent} textAnchor="middle">
        {fracToClock(curFrac, win.startHour)}
      </SvgText>
    </G>
  );

  return (
    <View style={styles.wrap} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
      <GestureDetector gesture={pan}>
        <View style={{ width: '100%', height }}>
          {width > 0 && (
            <Svg width={width} height={height} viewBox={`0 0 ${VBW} ${VBH}`}>
              {els}
            </Svg>
          )}
          {overlay}
        </View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: '100%' },
});
