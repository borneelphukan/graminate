# Graminate Mobile App

> **Expo 54 / React Native 0.81 mobile app** for the Graminate Farm Management System.

Mobile application providing field-level access to all farm management features. Built with Expo, React Native, and NativeWind (TailwindCSS for React Native). Uses Expo Router for file-based navigation.

## 🏗 Architecture

### Framework
- **Expo 54** — React Native development framework
- **React Native 0.81** — Mobile UI framework
- **Expo Router 6** — File-based routing (like Next.js)
- **NativeWind 4** — TailwindCSS for React Native
- **TypeScript** — Full type safety

### Entry Point & Root Layout
```typescript
// app/_layout.tsx
UserPreferencesProvider
  └── GestureHandlerRootView
      └── ThemeProvider (dark/light)
          └── Stack (headerless)
              ├── index         → Entry/redirect
              ├── login         → Login screen
              ├── forgot_password → Password recovery
              ├── [user_id]     → Main authenticated app
              └── modal         → Modal presentation
          └── AnimatedSplashScreen
```

Theme colors:
- **Light**: Primary `#2b7860`, Background `#ffffff`, Text `#171717`
- **Dark**: Primary `#04ad79`, Background `#0a0a0a`, Text `#ededed`

## 📱 Routing Structure

File-based routes via Expo Router (mirrors frontend web app structure):

```
app/
├── _layout.tsx                 # Root layout (theme, splash, navigation)
├── index.tsx                   # Entry redirect
├── login.tsx                   # Login screen
├── forgot_password.tsx         # Password recovery
├── modal.tsx                   # Modal screen
│
└── [user_id]/                  # Authenticated routes
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
    ├── apiculture/             # Apiary/hive detail
    │   ├── [apiary_id].tsx
    │   └── [apiary_id]/[hive_id].tsx
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

## 🧩 Tech Stack

| Technology | Purpose |
|-----------|---------|
| Expo 54 | React Native framework |
| React Native 0.81 | Mobile UI |
| Expo Router 6 | File-based routing |
| NativeWind 4.0.36 | TailwindCSS for RN |
| React Navigation 7 | Navigation primitives |
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

## 📂 Project Structure

```
├── app/                        # File-based routes (Expo Router)
├── components/
│   ├── cards/                  # Feature cards (apiculture, poultry, finance, etc.)
│   ├── form/                   # Form components
│   ├── layout/                 # Sidebar, Navbar, NavPanel, ChatWindow, Notification
│   ├── marketplace/            # Marketplace components
│   ├── modals/                 # Module-specific modals (poultry, password)
│   ├── tasks/                  # Task board components
│   ├── ui/                     # Mobile-specific UI components
│   ├── calendar.tsx            # Calendar component
│   └── AnimatedSplashScreen.tsx # Custom splash animation
├── contexts/
│   └── UserPreferencesContext.tsx # Dark mode, language, preferences
├── hooks/
│   ├── finance.ts              # Finance hooks
│   ├── use-color-scheme.ts     # Native color scheme
│   └── use-color-scheme.web.ts # Web color scheme
├── lib/                        # Utilities (axiosInstance)
├── constants/                  # App constants
├── assets/                     # Images, icons, fonts
├── app.json                    # Expo configuration
├── eas.json                    # EAS Build configuration
├── babel.config.js             # Babel configuration (module resolver)
├── metro.config.js             # Metro bundler configuration
├── tailwind.config.js          # TailwindCSS config
├── global.css                  # Global styles
└── tsconfig.json               # TypeScript configuration
```

## 🎨 Styling

- **NativeWind 4** — TailwindCSS 3 syntax for React Native
- Components styled with `className` prop (same as web)
- `tailwind.config.js` — Custom TailwindCSS configuration
- `global.css` — Global stylesheet
- Dark mode support via UserPreferencesContext

## 🧭 Navigation Patterns

- **Stack Navigation** — Drill-down flows (list → detail)
- **Bottom Tabs** — Main navigation sections
- **Modal** — Overlay presentations
- **Dynamic Routes** — `[user_id]`, `[id]` for parameterized navigation

## 🔐 Authentication

Same flow as web frontend:
1. Check AsyncStorage for JWT on app launch
2. Valid token → navigate to dashboard
3. No/expired token → navigate to login
4. Login → store token in AsyncStorage
5. Axios interceptor adds Bearer token to API calls

## 📱 State Management

### UserPreferencesContext
Same API as web frontend:
- Dark mode, language, time format, temperature scale
- Persisted via AsyncStorage on mobile

### AsyncStorage
- JWT token storage
- User preferences persistence

## 🚀 Deployment

### EAS Build
- Configuration: `eas.json`
- Profiles: development, preview, production
- Platforms: iOS, Android
- Account: `borneelphukan`

### EAS Update (OTA)
- Branch: `main`
- Over-the-air updates for JS bundle changes
- Triggered via GitHub Actions on push to `main`

### GitHub Actions Workflows
1. **cd-mobile.yml**: Full EAS build on push (when mobile/ or packages/ change)
2. **eas-update.yml**: OTA EAS update on push (lighter, faster)
3. Both support manual dispatch with custom profiles/platforms

## 🏁 Getting Started

```bash
# From monorepo root
pnpm install

# Navigate to mobile app
cd apps/mobile

# Create .env with API_URL=http://localhost:3001/api

# Start Expo dev server
pnpm dev    # or: npx expo start
```

In the output, you'll find options to open the app in:
- **Development build**
- **Android emulator**
- **iOS simulator**
- **Expo Go** (limited sandbox)

## 📜 Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` / `pnpm start` | Start Expo dev server |
| `pnpm android` | Start on Android |
| `pnpm ios` | Start on iOS |
| `pnpm web` | Start in web browser |
| `pnpm lint` | Run ESLint |
| `pnpm reset-project` | Reset to blank project |

## 🌍 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `API_URL` | ✅ | Backend API base URL |

## 🔗 Key Differences from Web Frontend

| Feature | Web | Mobile |
|---------|-----|--------|
| Routing | Next.js Pages Router | Expo Router (file-based) |
| Styling | TailwindCSS (CSS) | NativeWind (React Native) |
| Charts | Chart.js | react-native-chart-kit |
| Storage | localStorage | AsyncStorage |
| Navigation | URL-based | Stack/Tab navigators |
| Animations | CSS transitions | react-native-reanimated |
| File access | Browser APIs | expo-file-system |
