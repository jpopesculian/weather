# Weather

A minimal, friendly weather app built with React Native (Expo). Warm cream
background, coral accents, bold serif headings — built from the Claude Design
"Weather app design concept" wireframes.

## Features

- **Right Now** — current temperature, condition, feels-like, high/low, precip & wind.
- **Today** — an interactive hourly chart (Temp / Precip / Wind) with a draggable
  scrubber and a live readout bubble; sunrise/sunset markers and hourly icons.
- **Next 10 Days** — daily rows with a temperature range bar; tap any day to expand
  an inline chart with its own Temp / Precip / Wind tabs.
- **Search** — city search with per-result conditions and temperatures, plus a
  "Current Location" option (device GPS). The last location is remembered.

## Stack

- **Expo** (managed) + TypeScript
- **Open-Meteo** for forecast + geocoding — **no API keys required**
- **Meteocons** (`@meteocons/svg-static`) for weather icons, via `react-native-svg`
- **react-native-gesture-handler** for the chart scrubber
- **Fraunces** (serif headings) + **Mulish** (body) via `@expo-google-fonts`

## Run

```sh
npm install
npx expo start
```

Then open the app:

- **On your phone:** install **Expo Go** (iOS/Android) and scan the QR code.
- **Android emulator / iOS simulator:** press `a` or `i` in the Expo CLI.
- **Web preview:** `npx expo start --web` (note: device GPS is limited in the
  browser, so it falls back to a default city — use search to change location).

No configuration or API keys are needed.

## Project layout

```
src/
  theme/        color, type, and spacing tokens
  lib/          Open-Meteo client, WMO→icon mapping, formatting, GPS, storage, chart windows
  components/   Header, RightNow, StatCard, SegmentedTabs, WxChart, DailyList, SearchModal, icons
  screens/      WeatherScreen (composition + state)
  hooks/        useForecast
```
