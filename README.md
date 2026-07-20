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
- **Theme** — the top-right button cycles Light → Dark → System (warm cream vs.
  warm espresso); the choice is remembered and the icon reflects the current mode.
- **Responsive** — two-column layout on wide screens (weather + today | 10-day),
  single column on phones.

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

## Building for production

Production builds are made with **EAS Build** (Expo's cloud build service). The
project is already linked — `eas.json` defines the build profiles and the EAS
`projectId` lives in `app.json`.

**One-time setup:**

```sh
npm install -g eas-cli
eas login              # needs a free Expo account
```

**Android** (the app's configured target — package `io.github.jpopesculian`):

```sh
# Installable APK for your own phone (sideload) — scan the QR / open the link
# EAS prints when the build finishes, then install it directly.
eas build --profile preview --platform android

# Store-ready App Bundle (.aab) for Google Play
eas build --profile production --platform android
```

**iOS** (builds in the cloud; installing on a device or TestFlight needs a paid
Apple Developer account):

```sh
eas build --profile production --platform ios
```

**Submit to a store** (optional, once you have a developer account):

```sh
eas submit --profile production --platform android   # or ios
```

Versioning is handled remotely (`appVersionSource: "remote"` in `eas.json`): the
`production` profile auto-increments the build number, while the marketing
version comes from `app.json` (`expo.version`). Prefer local builds? Add
`--local` to any `eas build` command — that needs the Android SDK / Xcode
installed.

**Web** — export a static site you can host anywhere:

```sh
npx expo export --platform web   # outputs to ./dist
```

### Deploy the web app to GitHub Pages

Pushing to `main` auto-deploys the web build via
[`.github/workflows/deploy-web.yml`](.github/workflows/deploy-web.yml) — it runs
`expo export`, then publishes `dist/` with the official Pages actions. Enable it
once under **Settings → Pages → Source: "GitHub Actions"**; the site then serves
at `https://jpopesculian.github.io/weather/`.

A project page is served from the `/weather/` subpath, so the workflow exports
with `DEPLOY_TARGET=gh-pages`, which `app.config.js` uses to set
`experiments.baseUrl` so assets resolve under that path. Local `expo start` and
native builds are unaffected — they stay rooted at `/`. (If you fork/rename the
repo, update the `baseUrl` in `app.config.js` to match the new repo name.)

## Project layout

```
src/
  theme/        color, type, and spacing tokens
  lib/          Open-Meteo client, WMO→icon mapping, formatting, GPS, storage, chart windows
  components/   Header, RightNow, StatCard, SegmentedTabs, WxChart, DailyList, SearchModal, icons
  screens/      WeatherScreen (composition + state)
  hooks/        useForecast
```
