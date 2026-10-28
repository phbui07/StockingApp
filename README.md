# StockingApp

Stockline is a stock-tracking and practice-trading app built with React Native 0.88 (New Architecture), React 19 and React Navigation 7. Prices are live; trades use virtual cash, so no real money is involved.

## Features

- **Live market data:** quotes, intraday sparklines, 1D–5Y charts, symbol search and news from Yahoo Finance. Prices refresh every 20 seconds while the app is in the foreground.
- **Practice trading:** every account starts with $100,000 in virtual cash. Buy and sell orders fill instantly at the latest price. Holdings, average cost, unrealized and realized P&L, trade history and a portfolio performance chart are computed from your trades.
- **Watchlist** you can search and sort, and **price alerts** that send a notification when a target is crossed while the app is open.
- **On-device accounts:** sign up, log in, stay logged in, log out, change your name and password, verify a phone number, and reset a forgotten password with a 5-digit code delivered as a local notification.
- **Vietnamese and English**, switchable in Profile → Language.
- Optional Face ID or fingerprint confirmation for trades (Profile → Security).

Demo account: `a1@gmail.com` / `123456`.

## Prerequisites

- **Node.js 22.11 or newer**
- **npm.** The project uses `package-lock.json`, so there's no Yarn lockfile.
- **Watchman** (recommended): `brew install watchman`

For iOS (macOS only):

- **Xcode** (tested with Xcode 27.1) with an iOS Simulator runtime installed
- Make Xcode the active developer directory (the default is Command Line Tools, which can't build iOS apps):
  ```sh
  sudo xcode-select -s /Applications/Xcode.app/Contents/Developer
  ```
- **CocoaPods**: `brew install cocoapods`

For Android:

- **Android Studio**, which bundles a JDK. Use its SDK Manager to install Android SDK Platform 37, Build-Tools 37.0.0, and NDK 27.1.12297006.
- Point your shell at the SDK and tools (for example in `~/.zshrc`):
  ```sh
  export ANDROID_HOME="$HOME/Library/Android/sdk"
  export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"
  export PATH="$PATH:$ANDROID_HOME/emulator:$ANDROID_HOME/platform-tools"
  ```
- An emulator (create one in Android Studio's Device Manager) or a device with USB debugging enabled.

## Setup

```sh
npm install
npm run pods   # iOS only: installs CocoaPods dependencies (rerun after adding native libraries)
```

## Running

Start Metro (the JS bundler) and leave it running in its own terminal:

```sh
npm start
```

In a second terminal, build and launch the app:

```sh
npm run ios       # iOS Simulator
npm run android   # Android emulator or connected device
```

To pick a specific simulator, use `npm run ios -- --simulator "iPhone 17"`. You can also open `ios/StockingApp.xcworkspace` in Xcode (the workspace, not the `.xcodeproj`), or the `android/` folder in Android Studio, and run from there.

When the app is running, press <kbd>R</kbd> in the Metro terminal to reload. Press <kbd>D</kbd> to open the developer menu.

## Checks

```sh
npm test            # Jest: unit tests plus end-to-end flows against a fake Yahoo
npm run lint        # ESLint
npm run typecheck   # TypeScript
```

## How it's organized

- `services/marketData.ts` is the only file that talks to Yahoo Finance. To switch data providers, rewrite it and keep its exported types.
- `services/quoteStore.ts` shares live quotes between screens and handles polling.
- `services/portfolio.ts` and `services/alerts.ts` hold the trading and alert rules as pure, unit-tested functions.
- `services/session.tsx` (accounts) and `services/userData.tsx` (portfolio, watchlist, alerts, settings per user) persist to AsyncStorage.
- `locales/vi.ts` and `locales/en.ts` hold every UI string. TypeScript fails the build if a key is missing from either.

## Configuration notes

- **Market data** comes from Yahoo Finance's public endpoints. They're unofficial, can change without notice, and Yahoo's terms allow personal use only. The company profile and yearly financials (stock detail → About and Details) use an endpoint Yahoo rate-limits. When it refuses, those sections show a Retry button, and everything else keeps working.
- **Google Sign-In on iOS** needs an iOS OAuth client ID. Until one is set, the Google button explains that it isn't set up. Set `googleIosClientId` in `services/useGoogleSignIn.ts` and add the reversed client ID as a URL scheme in `ios/StockingApp/Info.plist`. See the [Google Sign-In setup guide](https://react-native-google-signin.github.io/docs/setting-up/ios). Android uses `android/app/google-services.json`.
- **Verification codes and price alerts** are local notifications. If notifications are turned off, the code is shown in a dialog instead.
- Accounts, including passwords, are stored unencrypted on the device with AsyncStorage. There's no backend, so this is only suitable for a practice app.
