# TradeCalc Pro — Professional Trade Calculators

<div align="center">

**The all-in-one calculator app for trade professionals**

[![Platform: iOS](https://img.shields.io/badge/Platform-iOS-blue)](https://developer.apple.com/app-store/)
[![Framework: React Native / Expo](https://img.shields.io/badge/Framework-React%20Native%20%7C%20Expo-purple)](https://expo.dev/)
[![License: Proprietary](https://img.shields.io/badge/License-Proprietary-red)](LICENSE)

🔌 📡 ⚡ 🔥 🚿 💨

</div>

---

## Overview

**TradeCalc Pro** is a premium mobile application for **electricians, welders, plumbers, and HVAC technicians**. It provides professional-grade calculation tools based on industry standards (NEC, ASHRAE, AWS).

### Target Market
- **Primary:** United States (English-speaking trade professionals)
- **Secondary:** UK, Canada, Australia

### Monetization
| Plan | Price | Revenue Target |
|------|-------|---------------|
| Free | $0 | User acquisition |
| Weekly | $2.99/week | ~100 users/yr = $297 |
| Monthly | $4.99/month | ~60 users/mo = $297 |
| **Lifetime** | **$14.99 one-time** | **~20 users = $297** ✅ |

---

## Features

### 6 Core Calculators

| # | Calculator | Standard | Color |
|---|-----------|----------|-------|
| 1 | Wire Sizing & Ampacity | NEC Table 310.16 | `#F39C12` |
| 2 | Conduit Fill Rate | NEC Chapter 9 | `#27AE60` |
| 3 | Voltage Drop | NEC 210.19(A) | `#E74C3C` |
| 4 | Welding Parameters | AWS D1.1 | `#E67E22` |
| 5 | Plumbing Flow & Sizing | IPC / UPC | `#2980B9` |
| 6 | HVAC Duct Sizer | ASHRAE Fundamentals | `#9B59B6` |

### Pro Features (Paid)
- All 6 calculators unlocked
- Save and export results (CSV/PDF)
- No ads ever
- Priority support

---

## Tech Stack

```
┌─────────────────────────────────┐
│         React Native            │
│    (via Expo SDK 52)           │
├─────────────────────────────────┤
│   TypeScript + Expo Router     │
│   expo-in-app-purchases        │
│   expo-secure-store            │
│   @react-navigation/native     │
└─────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│      Codemagic CI/CD          │
│  → Auto Build → IPA Export    │
│  → App Store Connect Submit   │
└─────────────────────────────────┘
```

## Project Structure

```
quote-calculator-pro/
├── app/                    # Expo Router pages
│   ├── _layout.tsx         # Navigation layout with tab bar
│   ├── index.tsx           # Home screen (calculator grid)
│   ├── calculator-electrician.tsx
│   ├── calculator-conduit.tsx
│   ├── calculator-voltagedrop.tsx
│   ├── calculator-welding.tsx
│   ├── calculator-plumbing.tsx
│   ├── calculator-hvac.tsx
│   ├── pro-paywall.tsx     # Subscription screen
│   └── settings.tsx
├── constants/
│   └── styles.ts           # Global styles, colors, spacing
├── types/
│   └── navigation.ts       # TypeScript navigation types
├── app.json                # Expo config
├── package.json            # Dependencies
├── tsconfig.json           # TypeScript config
├── eas.json                # EAS Build config (for App Store)
└── README.md               # This file
```

## Getting Started

### Prerequisites
- Node.js >= 18
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator or physical device

### Installation
```bash
cd quote-calculator-pro
npm install
npx expo start
```

### Run on device
```bash
npx expo run:ios      # iOS Simulator
npx expo run:ios --device  # Physical device
```

## Build for App Store

### Option A: EAS Build (Recommended)
```bash
eas build --platform ios --profile production
eas submit --platform ios
```

### Option B: Codemagic
1. Connect GitHub repository
2. Use `eas.json` configuration
3. Automatic build on push to `main` branch
4. Auto-submit to TestFlight / App Store

## App Store Information

| Field | Value |
|-------|-------|
| **App Name** | TradeCalc Pro: Trade Calculator |
| **Bundle ID** | `com.quotecalculator.pro` |
| **App ID** | 6762173287 |
| **Category** | Utilities / Productivity |
| **Rating** | 4+ |
| **Price** | Free (with In-App Purchases) |

## Roadmap

### v1.0 (Current)
- [x] 6 core calculators
- [x] Pro paywall with subscription options
- [x] Settings screen
- [ ] In-app purchase integration
- [ ] Ad network integration (AdMob)

### v1.1
- [ ] Unit conversion (Imperial ↔ Metric)
- [ ] Dark mode
- [ ] Calculation history cloud sync

### v1.2
- [ ] More calculators (Solar, Concrete, Roofing)
- [ ] Apple Watch companion app

---

## License

Proprietary © 2026 TradeCalc Pro. All rights reserved.

---

<div align="center">
<b>Built for trade professionals who need answers fast.</b><br>
<i>Zero maintenance • Zero server costs • Pure passive income</i>
</div>
