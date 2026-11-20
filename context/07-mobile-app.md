# Mobile Application

## Overview

The mobile app is built with **Expo 54** and **React Native 0.81**, providing field-level access to all farm management features. Uses Expo Router for file-based navigation (similar to Next.js).

## Tech Stack

| Technology | Purpose |
|-----------|---------|
| Expo 54 | React Native development framework |
| React Native 0.81 | Mobile UI framework |
| Expo Router 6 | File-based routing |
| NativeWind 4.0.36 | TailwindCSS for React Native |
| React Navigation 7 | Navigation primitives (bottom tabs, stacks) |
| react-native-reanimated | Smooth animations |
| react-native-gesture-handler | Gesture recognition |
| react-native-chart-kit | Data visualization |
| react-native-calendars | Calendar UI |
| @react-native-async-storage/async-storage | Local persistence |
| expo-image-picker | Image selection |
| expo-file-system | File operations |
| expo-haptics | Haptic feedback |
| react-native-toast-message | Toast notifications |
| @graminate/ui | Shared component library |
| axios | HTTP client |
| date-fns | Date formatting |

## App Structure

### Entry & Root Layout (`app/_layout.tsx`)

```typescript
// Root layout structure:
UserPreferencesProvider
  └── GestureHandlerRootView
      └── ThemeProvider (dark/light based on preferences)
          └── Stack (headerless)
              ├── index         → Entry/redirect
              ├── login         → Login screen
              ├── forgot_password → Password recovery
              ├── [user_id]     → Main authenticated app
              └── modal         → Modal presentation
          └── AnimatedSplashScreen (until app is ready)
```

Theme colors:
- **Light**: Primary `#2b7860`, Background `#ffffff`, Card `#f8f9fa`, Text `#171717`
- **Dark**: Primary `#04ad79`, Background `#0a0a0a`, Card `#030712`, Text `#ededed`

### File-Based Routes

```
app/
├── _layout.tsx                 # Root layout (theme, splash, navigation)
├── index.tsx                   # Entry redirect (checks auth → dashboard or login)
├── login.tsx                   # Login screen
├── forgot_password.tsx         # Password recovery
├── modal.tsx                   # Generic modal screen
│
└── [user_id]/                  # Authenticated routes (mirrors frontend)
    ├── index.tsx               # Dashboard
    ├── apiculture.tsx          # Bee keeping list
    ├── cattle_rearing.tsx      # Cattle list
    ├── poultry.tsx             # Poultry list
    ├── floriculture.tsx        # Floriculture list
    ├── crm.tsx                 # CRM hub
    ├── finance_dashboard.tsx   # Finance overview
    ├── finance_sales.tsx       # Sales
    ├── finance_expenses.tsx    # Expenses
    ├── finance_loans.tsx       # Loans
    ├── finance_receipts.tsx    # Receipts
    ├── labour_database.tsx     # Employee database
    ├── labour_payment.tsx      # Payroll
    ├── storage.tsx             # Warehouses
    ├── marketplace.tsx         # Marketplace
    ├── add_service.tsx         # Add new service
    │
    ├── apiculture/             # Apiary/hive detail routes
    │   ├── [apiary_id].tsx
    │   └── [apiary_id]/[hive_id].tsx
    │
    ├── companies/[id].tsx      # Company detail
    ├── contacts/               # Contact detail
    ├── contracts/              # Contract detail
    ├── labour_database/[id].tsx # Employee detail
    ├── labour_payment/         # Payment detail
    ├── marketplace/            # Marketplace detail
    ├── poultry/                # Poultry detail
    │   ├── [id].tsx
    │   ├── poultry-feeds.tsx
    │   └── poultry-health/[id].tsx
    ├── receipts/               # Receipt detail
    ├── settings/               # Settings pages
    └── warehouse/[id].tsx      # Warehouse detail
```

### Components

```
components/
├── cards/
│   ├── apiculture/
│   │   └── HoneyProductionCard.tsx
│   ├── poultry/
│   │   ├── PoultryFeedCard.tsx
│   │   ├── PoultryEggCard.tsx
│   │   └── VeterinaryCard.tsx
│   ├── TaskManager.tsx
│   ├── InventoryStockCard.tsx
│   ├── WorkingCapital.tsx
│   ├── BudgetCard.tsx
│   ├── TrendGraph.tsx
│   ├── DebtAnalysis.tsx
│   ├── WarehouseWidget.tsx
│   └── CompareGraph.tsx
│
├── form/                       # Form components
├── layout/
│   ├── Sidebar.tsx
│   ├── Navbar.tsx
│   ├── NavPanel.tsx
│   ├── ChatWindow.tsx
│   ├── Notification.tsx
│   ├── NotificationBar.tsx
│   └── PlatformLayout.tsx
│
├── marketplace/
│   ├── ProductCard.tsx
│   ├── ProductDetailView.tsx
│   └── ListProductModal.tsx
│
├── modals/
│   ├── poultry/
│   │   ├── PoultryFeedsModal.tsx
│   │   └── EggModal.tsx
│   └── PasswordModal.tsx
│
├── tasks/
│   └── ProjectTaskBoard.tsx
│
├── ui/                         # Mobile-specific UI components
├── calendar.tsx                # Calendar component
└── AnimatedSplashScreen.tsx    # Custom animated splash screen
```

### Contexts

**UserPreferencesContext** (`contexts/UserPreferencesContext.tsx`)
- Same API as frontend: dark mode, language, time format, temperature scale, etc.
- Persisted via AsyncStorage on mobile

### Hooks

| Hook | Purpose |
|------|---------|
| `useFinance` | Finance data and calculations |
| `useColorScheme` | Platform color scheme detection |
| `useColorScheme.web` | Web-specific color scheme |

## Styling

- **NativeWind 4** — TailwindCSS 3 syntax for React Native
- `global.css` — Global stylesheet
- `tailwind.config.js` — TailwindCSS configuration
- Native components styled with `className` prop (same as web TailwindCSS)
- `nativewind-env.d.ts` — TypeScript declarations for NativeWind

## Navigation Patterns

- **Stack Navigation**: For drill-down flows (list → detail)
- **Bottom Tabs**: For main navigation sections
- **Modal**: For overlay presentations
- **Expo Router**: File-based routing with dynamic segments (`[user_id]`, `[id]`)

## Deployment

### EAS Build
- Configuration: `eas.json`
- Profiles: development, preview, production
- Platforms: iOS, Android
- Account: `borneelphukan`

### EAS Update (OTA)
- Branch-based updates (`main`)
- Over-the-air updates for JS bundle changes
- Triggered via GitHub Actions on push to `main`

### GitHub Actions Workflows
1. **cd-mobile.yml**: Full EAS build on push to main (when mobile/ or packages/ change)
2. **eas-update.yml**: OTA EAS update on push to main (lighter, faster)
3. Both support manual dispatch with custom profiles/platforms

## Environment

- `.env` file in `apps/mobile/`
- `app.json` — Expo configuration
- API URL configured for backend connectivity
- `NEXT_PUBLIC_API_URL` equivalent for mobile

## Key Differences from Web Frontend

| Feature | Web | Mobile |
|---------|-----|--------|
| Routing | Next.js Pages Router | Expo Router (file-based) |
| Styling | TailwindCSS (CSS) | NativeWind (React Native) |
| Charts | Chart.js | react-native-chart-kit |
| Storage | localStorage | AsyncStorage |
| Navigation | URL-based | Stack/Tab navigators |
| Animations | CSS transitions | react-native-reanimated |
| Forms | HTML forms | React Native components |
| File access | Browser APIs | expo-file-system |
| Images | `<img>` | expo-image |
