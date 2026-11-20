# Frontend Web Application

## Overview

The main user-facing web dashboard built with **Next.js 15** (Pages Router) and **React 19**. Runs on port 3000. This is where farmers and farm managers perform day-to-day operations.

## Tech Stack

| Technology | Purpose |
|-----------|---------|
| Next.js 15 | React framework (Pages Router, API routes) |
| React 19 | UI library |
| TailwindCSS 4 | Utility-first CSS (via PostCSS) |
| Chart.js + react-chartjs-2 | Data visualization |
| @dnd-kit | Drag & drop (kanban boards, sortable lists) |
| next-auth | Authentication integration |
| next-i18next | Internationalization |
| jsPDF + html2canvas | PDF report generation |
| xlsx | Excel export |
| openmeteo | Weather data (via API route proxy) |
| axios | HTTP client |
| @graminate/ui | Shared component library |
| @graminate/shared | Shared Zod schemas |
| date-fns | Date formatting and manipulation |

## Routing Structure

### Root Routes
```
/                    → index.tsx (redirect: checks JWT → dashboard or login)
/login               → login.tsx (login page)
/reset_password      → reset_password.tsx (password recovery)
/privacy-policy      → privacy-policy.tsx
/training-services   → training-services.tsx
/mobile-redirect     → mobile-redirect.tsx
/404                 → 404.tsx (not found)
```

### User-Scoped Routes (`/[user_id]/`)
All authenticated pages are nested under `[user_id]` to support multi-tenant routing:

```
/[user_id]/
├── index.tsx              → Dashboard (calendar, widgets, trend graphs, task manager)
├── apiculture.tsx         → Apiary list view
├── cattle_rearing.tsx     → Cattle list view
├── poultry.tsx            → Poultry flock list view
├── floriculture.tsx       → Floriculture list view
├── crm.tsx                → CRM hub (contacts, companies, contracts)
├── finance_dashboard.tsx  → Finance overview (charts, metrics)
├── finance_sales.tsx      → Sales records
├── finance_expenses.tsx   → Expense tracking
├── finance_loans.tsx      → Loan management
├── finance_receipts.tsx   → Invoice/receipt management
├── labour_database.tsx    → Employee database
├── labour_payment.tsx     → Payroll management
├── storage.tsx            → Warehouse & inventory management
├── marketplace.tsx        → Agricultural marketplace
├── pricing.tsx            → Subscription plans
├── add_service.tsx        → Add new service/module
│
├── apiculture/            → Individual apiary detail, hive detail
├── cattle_rearing/        → Individual cattle detail
├── poultry/               → Flock detail, egg/feed/health records
├── companies/             → Company detail
├── contacts/              → Contact detail
├── contracts/             → Contract detail
├── labour_database/       → Employee detail
├── labour_payment/        → Payment detail
├── warehouse/             → Warehouse detail with inventory
├── receipts/              → Invoice/receipt detail
├── tasks/                 → Task/kanban board
└── settings/              → Settings pages
    ├── account.tsx         → Account management (profile, password, delete)
    ├── billing.tsx         → Subscription & payment management
    ├── general.tsx         → General preferences (language, theme, time)
    ├── notifications.tsx   → Notification preferences
    ├── apiculture_settings.tsx
    ├── cattle_rearing_settings.tsx
    ├── poultry_settings.tsx
    ├── floriculture_settings.tsx
    ├── finance_settings.tsx
    ├── marketplace.tsx
    └── weather_settings.tsx
```

### API Routes (`/api/`)
```
/api/weather    → Proxy to OpenMeteo API (server-side)
/api/llm        → Proxy to backend LLM endpoint
```

## Authentication Flow

1. User visits `/` → `index.tsx` checks localStorage for JWT
2. If valid JWT (not expired) → redirect to `/{user_id}` (dashboard)
3. If no token or expired → redirect to `/login`
4. Login page sends credentials to `POST /api/user/login` on backend
5. Backend validates credentials, sends OTP to user's email, returns `login_id`
6. Frontend opens OTP modal for user to enter 6-digit code
7. Frontend sends `POST /api/user/login-verify` with email, OTP, and `login_id`
8. Backend verifies OTP and returns JWT token
9. On success, stores `token`, `user_id`, and `login_id` in localStorage
10. All API calls include `Authorization: Bearer <token>` via axios interceptor

### Registration & Age Restriction
- The Sign Up form at `/login` validates all inputs before sending the OTP
- **Age check**: the frontend calculates age from the entered date of birth using a `calculateAge` helper in `apps/frontend/src/pages/login.tsx`
- If the user is **under 18**, registration is blocked and an error `Popup` modal is shown with the message: *"You need to be atleast 18 years to be able eto create an account in Graminate"*
- Only after passing the age check does the flow proceed to the check-exists → OTP-send → OTP-verify → register sequence

## Layout System

### PlatformLayout (`src/layout/PlatformLayout.tsx`)
- Main authenticated layout wrapper
- Contains Navbar, NavPanel (sidebar), Notification system
- Provides consistent navigation across all `[user_id]/*` pages
- Wraps content with responsive design

### LoginLayout (`src/layout/LoginLayout.tsx`)
- Simplified layout for auth pages (login, reset password)
- No sidebar/navigation

### ChatWindow (`src/layout/ChatWindow.tsx`)
- AI assistant chat interface (LLM integration)
- Floating chat widget available across authenticated pages
- Communicates with backend `/api/llm` endpoint

## Component Organization

### Cards (`src/components/cards/`)
Dashboard widgets and feature-specific cards:
- `finance/` — TrendGraph, CompareGraph, WorkingCapital, DebtAnalysis
- `TaskManager.tsx` — Task overview widget
- `WarehouseWidget.tsx` — Inventory summary
- `InventoryStockCard.tsx` — Stock level indicators
- `BudgetCard.tsx` — Budget tracking
- `WorkingCapital.tsx` — Cash flow visualization

### Modals (`src/components/modals/`)
Module-specific modal dialogs for CRUD operations:
- `poultry/` — PoultryFeedsModal, EggModal
- `PasswordModal.tsx` — Password verification
- `FirstLoginModal.tsx` — Onboarding for new users
- `WidgetModal.tsx` — Dashboard widget configuration
- Various create/edit modals for each module

### Layout Components (`src/components/layout/`)
- `Navbar/` — Top navigation bar
- `NavPanel.tsx` — Sidebar navigation panel
- `Notification.tsx` — Notification component
- `NotificationSideBar.tsx` — Notification sidebar
- `SettingsBar.tsx` — Settings navigation sidebar

### Tables (`src/components/tables/`)
Reusable data table components with sorting, filtering, pagination.

### Tasks (`src/components/tasks/`)
- `ProjectTaskBoard.tsx` — Kanban-style task board using @dnd-kit

### Marketplace (`src/components/marketplace/`)
- `ProductCard.tsx` — Product listing card
- `ProductDetailView.tsx` — Detailed product view
- `ListProductModal.tsx` — Create/edit product modal

## State Management

### UserPreferencesContext
Central context providing:
- `timeFormat` — "12-hour" | "24-hour"
- `temperatureScale` — "Celsius" | "Fahrenheit"
- `language` — Supported language selection
- `darkMode` — Boolean theme toggle
- `isFirstLogin` — Onboarding flag
- `userType`, `plan`, `country`, `city` — User metadata
- `subTypes` — Available module sub-types
- `entityType` — Business entity type
- `widgets` — Dashboard widget configuration (persisted to backend)

### Toast Store (`src/stores/toast.ts`)
Simple toast notification state management.

## Custom Hooks

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

## Internationalization (i18n)

- Framework: next-i18next / react-i18next
- Translation files in `src/translations/`
- Supported languages configured per user preference
- `getTranslator()` helper for programmatic translations

## Data Visualization

- **Chart.js** via react-chartjs-2 for:
  - Trend graphs (revenue, expenses over time)
  - Comparison charts (period-over-period)
  - Working capital visualization
  - Debt analysis charts
- **date-fns** for time axis formatting
- **chartjs-adapter-date-fns** for date scale integration

## PDF & Excel Export

- **jsPDF** + **jspdf-autotable** for generating PDF reports
- **html2canvas** for screenshot-based PDF content
- **xlsx** for Excel spreadsheet exports

## Styling

- **TailwindCSS 4** via PostCSS (`postcss.config.mjs`)
- Custom brand colors and design tokens
- Responsive design with mobile-first approach
- Dark mode support via UserPreferencesContext

## API Communication

- **Axios** instance at `src/lib/utils/axiosInstance.ts`
- Bearer token interceptor adds auth headers
- Error interceptor handles 401 (redirect to login)
- Base URL configured via `NEXT_PUBLIC_API_URL` env var

## Environment Variables

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Google Maps API key |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Razorpay public key |
