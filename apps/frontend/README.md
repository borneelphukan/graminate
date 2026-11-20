# Graminate Frontend

> **Next.js 15 web dashboard** for the Graminate Farm Management System.

The main user-facing web application where farmers and farm managers perform day-to-day operations. Built with Next.js 15 (Pages Router), React 19, and TailwindCSS 4. Runs on port 3000.

## 🏗 Architecture

### Framework
- **Next.js 15** — Pages Router (not App Router)
- **React 19** — UI library
- **TailwindCSS 4** — Utility-first CSS via PostCSS
- **TypeScript** — Full type safety

### Routing
All authenticated pages are nested under `[user_id]/` for multi-tenant routing:

```
/                        → Redirect (checks JWT → dashboard or login)
/login                   → Login page
/reset_password          → Password recovery
/privacy-policy          → Privacy policy
/training-services       → Training info
/[user_id]/
├── index.tsx            → Dashboard (calendar, widgets, charts)
├── apiculture.tsx       → Apiary list
├── cattle_rearing.tsx   → Cattle list
├── poultry.tsx          → Poultry flock list
├── floriculture.tsx     → Floriculture list
├── crm.tsx              → CRM hub
├── finance_dashboard.tsx → Finance overview
├── finance_sales.tsx    → Sales records
├── finance_expenses.tsx → Expense tracking
├── finance_loans.tsx    → Loan management
├── finance_receipts.tsx → Invoice/receipt management
├── labour_database.tsx  → Employee database
├── labour_payment.tsx   → Payroll
├── storage.tsx          → Warehouses & inventory
├── marketplace.tsx      → Agricultural marketplace
├── pricing.tsx          → Subscription plans
├── add_service.tsx      → Add new module
├── apiculture/          → Apiary/hive detail pages
├── cattle_rearing/      → Cattle detail pages
├── poultry/             → Flock detail pages
├── companies/           → Company detail
├── contacts/            → Contact detail
├── contracts/           → Contract detail
├── labour_database/     → Employee detail
├── labour_payment/      → Payment detail
├── warehouse/           → Warehouse detail
├── receipts/            → Invoice detail
├── tasks/               → Kanban task board
└── settings/            → Account, billing, general, notifications, module settings
```

### API Routes (Next.js API)
```
/api/weather    → Proxy to OpenMeteo API (server-side)
/api/llm        → Proxy to backend LLM endpoint
```

## 🧩 Tech Stack

| Technology | Purpose |
|-----------|---------|
| Next.js 15 | React framework (Pages Router, API routes) |
| React 19 | UI library |
| TailwindCSS 4 | Utility-first CSS |
| Chart.js + react-chartjs-2 | Data visualization |
| @dnd-kit | Drag & drop (kanban, sortable lists) |
| next-auth | Authentication integration |
| next-i18next | Internationalization (multi-language) |
| jsPDF + html2canvas | PDF report generation |
| xlsx | Excel export |
| axios | HTTP client to backend API |
| @graminate/ui | Shared component library (40+ components) |
| @graminate/shared | Shared Zod validation schemas |
| date-fns | Date formatting |
| react-markdown + remark-gfm | Markdown rendering (AI chat) |

## 📂 Project Structure

```
src/
├── pages/
│   ├── [user_id]/           # User-scoped authenticated routes
│   ├── api/                 # API routes (weather proxy, LLM proxy)
│   ├── index.tsx            # Redirect handler (JWT check)
│   ├── login.tsx            # Login page
│   └── ...                  # Auth pages, public pages
├── components/
│   ├── cards/               # Dashboard cards (finance, tasks, inventory)
│   ├── floriculture/        # Floriculture components
│   ├── form/                # Form components
│   ├── layout/              # Navbar, NavPanel, Notification, SettingsBar
│   ├── maps/                # Google Maps integration
│   ├── marketplace/         # Marketplace components
│   ├── modals/              # Module-specific modal dialogs
│   ├── tables/              # Data tables (sorting, filtering, pagination)
│   ├── tasks/               # Kanban task board
│   └── ui/                  # App-specific UI (Calendar, etc.)
├── constants/               # App constants and options
├── contexts/                # UserPreferencesContext (theme, language, etc.)
├── hooks/                   # Custom hooks (finance, forms, maps, modals, tables, weather)
├── layout/                  # PlatformLayout, LoginLayout, ChatWindow
├── lib/                     # Utilities (axiosInstance, helpers)
├── stores/                  # Toast store
├── styles/                  # Global styles
├── templates/               # Email templates
└── translations/            # i18n translation files
```

## 🔐 Authentication Flow

1. User visits `/` → `index.tsx` checks localStorage for JWT
2. Valid JWT (not expired) → redirect to `/{user_id}` (dashboard)
3. No token or expired → redirect to `/login`
4. Login: Enter email + password → `POST /api/user/login` on backend
5. Backend validates credentials, sends OTP to email, returns `login_id` (no JWT yet)
6. Frontend opens OTP modal for user to enter 6-digit code from email
7. OTP submitted → `POST /api/user/login-verify` with email, OTP, and `login_id`
8. Backend verifies OTP → returns JWT token
9. Frontend stores `token`, `user_id`, and `login_id` in localStorage
10. All API calls include `Authorization: Bearer <token>` via axios interceptor
11. 401 responses redirect to login

## 🎨 State Management

### UserPreferencesContext
Central React Context providing:
- `timeFormat` — "12-hour" | "24-hour"
- `temperatureScale` — "Celsius" | "Fahrenheit"
- `language` — Supported language selection
- `darkMode` — Theme toggle
- `isFirstLogin` — Onboarding flag
- `userType`, `plan`, `country`, `city` — User metadata
- `subTypes` — Active module selections
- `entityType` — Business entity type
- `widgets` — Dashboard widget configuration (persisted to backend)

### Toast Store
Simple toast notification state management.

## 🪝 Custom Hooks

| Hook | Purpose |
|------|---------|
| `useFinance` | Finance data fetching and calculations |
| `useForms` | Form state management |
| `useMaps` | Google Maps integration |
| `useModals` | Modal open/close state |
| `useSidebar` | Sidebar toggle state |
| `useTables` | Table pagination, sorting, filtering |
| `useTableActions` | Table row action handlers |
| `useWeather` | Weather data fetching |

## 📊 Data Visualization

- **Chart.js** via react-chartjs-2:
  - Trend graphs (revenue, expenses over time)
  - Comparison charts (period-over-period)
  - Working capital visualization
  - Debt analysis charts
- **date-fns** + **chartjs-adapter-date-fns** for time axis formatting

## 📤 Export Capabilities

- **PDF**: jsPDF + jspdf-autotable for structured reports
- **Screenshots**: html2canvas for visual PDF content
- **Excel**: xlsx for spreadsheet exports

## 🌐 API Communication

- **Axios** instance at `src/lib/utils/axiosInstance.ts`
- Bearer token interceptor adds auth headers
- Error interceptor handles 401 (redirect to login)
- Base URL: `NEXT_PUBLIC_API_URL` env var

## 🏁 Getting Started

```bash
# From monorepo root
pnpm install

# Set up environment
cd apps/frontend
# Create .env with:
# NEXT_PUBLIC_API_URL=http://localhost:3001/api
# NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-key
# NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxx

pnpm dev    # Start on port 3000
```

## 📜 Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server (port 3000) |
| `pnpm build` | Build for production |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |
| `pnpm test:e2e` | Run Playwright E2E tests |

## 🌍 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_API_URL` | ✅ | Backend API base URL |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Optional | Google Maps API key |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Optional | Razorpay public key |

## 🚀 Deployment

- **Platform**: Netlify (`netlify.toml` configured)
- **Build**: Next.js static/SSR
- **Deploy**: Git-triggered via Netlify
