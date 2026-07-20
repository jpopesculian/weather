// Interactive weather chart — a react-native-svg port of the design's
// WxChart.dc.html. Temp (line + cloud + sun markers), Precip (bars), Wind
// (speed + gust + direction arrows), all with a draggable scrubber + readout.
import { useMemo, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Line, Path, Rect, Circle, G, Text as SvgText, TSpan } from 'react-native-svg';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

import { fonts, useTheme, type Colors } from '../theme';
import type { ChartWindow } from '../lib/derive';
import { describeWeather } from '../lib/wmo';
import { WeatherIcon } from './WeatherIcon';
import { fracToClock, hourTick } from '../lib/format';

export type ChartType = 'Temp' | 'Precip' | 'Wind';

export type LegendSeries = { id: string; label: string; color: string; dashed: boolean };

// Shared dash pattern for all dotted overlay lines (cloud, humidity, gust) and
// their legend swatches — keeps the dash style uniform across graphs.
export const OVERLAY_DASH = '1 5';

// Series shown in the legend for each chart type (Precip has a single series).
export function legendSeriesFor(type: ChartType, colors: Colors): LegendSeries[] {
  if (type === 'Temp')
    return [
      { id: 'temp', label: 'Temperature', color: colors.ink, dashed: false },
      { id: 'cloud', label: 'Cloud cover', color: colors.cloudLine, dashed: true },
      { id: 'humidity', label: 'Humidity', color: colors.blue, dashed: true },
    ];
  if (type === 'Wind')
    return [
      { id: 'speed', label: 'Wind speed', color: colors.ink, dashed: false },
      { id: 'gust', label: 'Gusts', color: colors.gust, dashed: true },
    ];
  if (type === 'Precip')
    return [
      { id: 'rain', label: 'Rainfall', color: colors.blue, dashed: false },
      { id: 'chance', label: 'Chance', color: colors.ink, dashed: true },
    ];
  return [];
}

type Props = {
  type: ChartType;
  window: ChartWindow;
  accent?: string;
  hidden?: Record<string, boolean>;
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
const CARET_W = 10; // readout arrowhead base width (also the scrubber shaft width)

// Fixed 0–100% vertical mapping — precip, cloud, and humidity always use this
// (so a given % sits at the same height regardless of the data). Temperature
// and wind use their own auto-scaled (relative) mappings.
const yPercent = (v: number) => PB - (Math.max(0, Math.min(100, v)) / 100) * PH;

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

export function WxChart({ type, window: win, accent: accentProp, hidden = {} }: Props) {
  const { colors } = useTheme();
  const accent = accentProp ?? colors.coral;
  const [width, setWidth] = useState(0);
  const [frac, setFrac] = useState<number | null>(null);

  const N = win.times.length;
  // Data is hourly; thin the on-chart markers (labels/icons/arrows) to ~8–9
  // evenly spaced points so they stay readable regardless of point count.
  const markerEvery = Math.max(1, Math.round((N - 1) / 8));
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
  // x labels (thinned to marker cadence)
  win.times.forEach((iso, i) => {
    if (i % markerEvery === 0) {
      els.push(
        <SvgText key={`xl${i}`} x={xAt(i)} y={LABEL_Y} fontSize={10} fontFamily={fonts.body} fill={colors.faint} textAnchor="middle">
          {hourTick(iso)}
        </SvgText>
      );
    }
  });

  // y-axis unit labels: left axis, and (temp/precip only) the right 0–100% axis.
  const leftUnit = type === 'Temp' ? '°C' : type === 'Precip' ? 'mm' : 'km/h';
  els.push(
    <SvgText key="uL" x={PL} y={PT - 5} fontSize={9} fontFamily={fonts.body} fill={colors.faint} textAnchor="start">
      {leftUnit}
    </SvgText>
  );
  if (type !== 'Wind') {
    els.push(
      <SvgText key="uR" x={PR} y={PT - 5} fontSize={9} fontFamily={fonts.body} fill={colors.faint} textAnchor="end">
        %
      </SvgText>
    );
  }

  let sx = PL;
  let sy = PB;
  let readout = ''; // line-1 text for temp/precip (and wind fallback)
  let mainVal: number | null = null; // wind: speed (drives the "x/y km/h" line)
  let subVal: number | null = null; // wind: gust (shown only when the gust series is on)
  let line2Suffix = ''; // precip: appends " · N%" (chance) to the time line
  let primaryVisible = true; // is the scrubbed (primary) series shown?
  let leftBottom = 0; // left-axis value at the bottom gridline
  let leftTop = 1; // left-axis value at the top gridline

  const pushConditionIcons = () => {
    if (scale <= 0) return;
    win.codes.forEach((code, i) => {
      if (i % markerEvery !== 0) return;
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
    leftBottom = vmin;
    leftTop = vmax;
    const yT = (v: number) => PB - ((v - vmin) / (vmax - vmin)) * PH; // relative
    const pts: Pt[] = temps.map((v, i) => [xAt(i), yT(v)]);
    const cpts: Pt[] = clouds.map((v, i) => [xAt(i), yPercent(v)]);
    const hpts: Pt[] = win.humidity.map((v, i) => [xAt(i), yPercent(v)]);

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

    // area fill + cloud + humidity + temp line (each togglable via the legend)
    const tempVisible = !hidden.temp;
    const cloudVisible = !hidden.cloud;
    const humidityVisible = !hidden.humidity;
    primaryVisible = tempVisible;
    if (tempVisible) els.push(<Path key="area" d={`${smooth(pts)} L${PR},${PB} L${PL},${PB} Z`} fill={accent} opacity={0.08} />);
    if (cloudVisible) els.push(<Path key="cloud" d={smooth(cpts)} fill="none" stroke={colors.cloudLine} strokeWidth={1.6} strokeDasharray={OVERLAY_DASH} strokeLinecap="round" />);
    if (humidityVisible) els.push(<Path key="humidity" d={smooth(hpts)} fill="none" stroke={colors.blue} strokeWidth={1.6} strokeDasharray={OVERLAY_DASH} strokeLinecap="round" />);
    if (tempVisible) els.push(<Path key="line" d={smooth(pts)} fill="none" stroke={colors.ink} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />);

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
    const mm = win.precip; // rainfall amount (mm) → histogram bars
    const prob = win.precipProb; // chance of rain (%) → line, fixed 0–100
    const rainVisible = !hidden.rain;
    const chanceVisible = !hidden.chance;
    primaryVisible = rainVisible || chanceVisible;
    const mmMax = Math.max(2, ...mm); // auto-scale bars (floor so a trace isn't exaggerated)
    leftBottom = 0;
    leftTop = mmMax;
    const yMm = (v: number) => PB - (v / mmMax) * PH;
    const ni = Math.round(curFrac * (N - 1));

    if (rainVisible) {
      mm.forEach((v, i) => {
        const bw = (PW / N) * 0.52;
        const bx = xAt(i) - bw / 2;
        const by = yMm(v);
        els.push(<Rect key={`b${i}`} x={bx} y={by} width={bw} height={Math.max(1.5, PB - by)} rx={3} fill={i === ni ? colors.precipActive : colors.precip} />);
      });
    }
    if (chanceVisible) {
      const cpts: Pt[] = prob.map((v, i) => [xAt(i), yPercent(v)]);
      els.push(<Path key="chance" d={smooth(cpts)} fill="none" stroke={colors.ink} strokeWidth={2} strokeDasharray={OVERLAY_DASH} strokeLinecap="round" />);
    }
    pushConditionIcons();

    sx = xAt(ni);
    if (rainVisible) {
      sy = yMm(mm[ni]);
      readout = `${mm[ni].toFixed(1)} mm`;
      line2Suffix = chanceVisible ? ` · ${Math.round(prob[ni])}%` : '';
    } else {
      sy = yPercent(prob[ni]);
      readout = `${Math.round(prob[ni])}%`;
    }
  } else {
    const wind = win.wind;
    const gust = win.gust;
    const dir = win.dir;
    const wmax = Math.max(...gust) + 4;
    leftBottom = 0;
    leftTop = wmax;
    const yW = (v: number) => PB - (v / wmax) * PH;
    const wpts: Pt[] = wind.map((v, i) => [xAt(i), yW(v)]);
    const gpts: Pt[] = gust.map((v, i) => [xAt(i), yW(v)]);
    const speedVisible = !hidden.speed;
    const gustVisible = !hidden.gust;
    primaryVisible = speedVisible;
    if (gustVisible) els.push(<Path key="gust" d={smooth(gpts)} fill="none" stroke={colors.gust} strokeWidth={2} strokeDasharray={OVERLAY_DASH} strokeLinecap="round" />);
    if (speedVisible) els.push(<Path key="spd" d={smooth(wpts)} fill="none" stroke={colors.ink} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />);
    // direction arrows (drawn inside svg, thinned to marker cadence)
    win.times.forEach((_, i) => {
      if (i % markerEvery !== 0) return;
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
    mainVal = Math.round(sv);
    subVal = gustVisible ? Math.round(sg) : null;
  }

  // y-axis tick values at the bottom / middle / top gridlines.
  const fmtL = (v: number) => (type === 'Precip' ? String(Number(v.toFixed(1))) : String(Math.round(v)));
  const leftMid = (leftBottom + leftTop) / 2;
  const leftTicks: Array<[number, number]> = [
    [PT, leftTop],
    [PT + PH / 2, leftMid],
    [PB, leftBottom],
  ];
  leftTicks.forEach(([gy, v], i) => {
    els.push(
      <SvgText key={`lt${i}`} x={PL - 3} y={gy + 3} fontSize={8} fontFamily={fonts.body} fill={colors.faint} textAnchor="end">
        {fmtL(v)}
      </SvgText>
    );
  });
  if (type !== 'Wind') {
    const rightTicks: Array<[number, number]> = [
      [PT, 100],
      [PT + PH / 2, 50],
      [PB, 0],
    ];
    rightTicks.forEach(([gy, v], i) => {
      els.push(
        <SvgText key={`rt${i}`} x={PR + 3} y={gy + 3} fontSize={8} fontFamily={fonts.body} fill={colors.faint} textAnchor="start">
          {v}
        </SvgText>
      );
    });
  }

  // Thin scrubber position line (kept thin, full height).
  els.push(<Line key="scl" x1={sx} y1={PT - 8} x2={sx} y2={PB} stroke={accent} strokeWidth={1.5} />);

  // Floating tag readout (design 1b/1c): a filled callout that rides the dot,
  // flipping above/below to stay on-screen. Value + time in one tight unit
  // (wind folds gust into "speed/gust km/h").
  if (primaryVisible) {
    const timeStr = fracToClock(curFrac, win.startHour);
    const l1len = subVal != null ? String(mainVal).length + String(subVal).length + 6 : readout.length;
    const l2len = (timeStr + line2Suffix).length;
    const tw = Math.max(50, Math.max(l1len * 8.2, l2len * 5.0) + 14);
    const th = 30;
    const cw = CARET_W / 2;
    // Let the tag overhang the plot edge by half the caret width, so when it
    // clamps the caret/filler tuck under it and the tag's top corners stay clean.
    const tx = Math.max(PL - cw, Math.min(PR - tw + cw, sx - tw / 2));
    const above = sy - th - 12 > 2;
    const ty = above ? sy - th - 12 : sy + 12;
    const caret = above
      ? `M${sx - cw},${ty + th} L${sx + cw},${ty + th} L${sx},${ty + th + 6} Z`
      : `M${sx - cw},${ty} L${sx + cw},${ty} L${sx},${ty - 6} Z`;

    els.push(<Circle key="scd" cx={sx} cy={sy} r={4.5} fill={colors.scrubDot} stroke={accent} strokeWidth={2.5} />);
    els.push(
      <G key="ro">
        {/* Caret-width × half-readout-height filler on the caret side, behind the
            tag — joins the arrowhead to the tag at the edges without reaching (and
            squaring off) the tag's far corners. */}
        <Rect x={sx - cw} y={above ? ty + th / 2 : ty} width={CARET_W} height={th / 2} fill={accent} />
        <Path d={caret} fill={accent} />
        <Rect x={tx} y={ty} width={tw} height={th} rx={9} fill={accent} />
        {subVal != null ? (
          <SvgText x={tx + tw / 2} y={ty + 14} textAnchor="middle">
            <TSpan fontSize={14} fontFamily={fonts.bodyExtra} fill="#fff">{String(mainVal)}</TSpan>
            <TSpan fontSize={10} fontFamily={fonts.bodyBold} fill="rgba(255,255,255,0.6)">{`/${subVal}`}</TSpan>
            <TSpan fontSize={14} fontFamily={fonts.bodyExtra} fill="#fff">{' km/h'}</TSpan>
          </SvgText>
        ) : (
          <SvgText x={tx + tw / 2} y={ty + 14} textAnchor="middle" fontSize={14} fontFamily={fonts.bodyExtra} fill="#fff">
            {readout}
          </SvgText>
        )}
        <SvgText x={tx + tw / 2} y={ty + 24} textAnchor="middle" fontSize={8.5} fontFamily={fonts.bodySemi} fill="rgba(255,255,255,0.85)">
          {`${timeStr}${line2Suffix}`}
        </SvgText>
      </G>
    );
  }

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

