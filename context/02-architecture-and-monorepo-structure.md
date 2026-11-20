# Architecture & Monorepo Structure

## Monorepo Layout

```
graminate/
├── apps/
│   ├── backend/         # NestJS 11 API server (Port 3001)
│   ├── frontend/        # Next.js 15 Dashboard web app (Port 3000)
│   ├── admin/           # Next.js 15 Admin panel (Port 3002)
│   ├── website/         # Next.js 15 Public website (Port 3003)
│   └── mobile/          # Expo 54 / React Native 0.81 mobile app
├── packages/
│   ├── ui/              # Shared component library (@graminate/ui)
│   └── shared/          # Shared schemas, types, utilities (@graminate/shared)
├── bruno/               # API request collections (Bruno format)
├── scripts/             # Utility scripts (Bruno generation)
├── .github/workflows/   # CI/CD pipelines
├── turbo.json           # TurboRepo config
├── pnpm-workspace.yaml  # Workspace definition
└── package.json         # Root scripts
```

## Dependency Graph Between Packages

```
@graminate/shared  ──→  (imported by backend, frontend, admin)
@graminate/ui      ──→  (imported by frontend, admin, website, mobile)

frontend   ──→  @graminate/shared, @graminate/ui
admin      ──→  @graminate/shared, @graminate/ui
backend    ──→  @graminate/shared
website    ──→  @graminate/ui
mobile     ──→  @graminate/ui
```

## Tooling & Build System

### TurboRepo (`turbo.json`)
- **build**: Depends on upstream builds (`^build`). Outputs: `.next/**`, `dist/**`. Reads `.env` as input.
- **lint**: Depends on upstream lint.
- **typecheck**: Depends on upstream typecheck.
- **test**: Depends on upstream test and build.
- **dev**: Non-cached, persistent (long-running dev servers).

### pnpm
- Version 8.15.3 (pinned in `packageManager` field).
- Overrides `react` and `react-dom` to `19.1.0` globally.
- Workspaces: `apps/*` and `packages/*`.

### Root Scripts
```bash
pnpm dev         # Start all apps via TurboRepo concurrently
pnpm build       # Build all apps sequentially (--concurrency=1)
pnpm lint        # Lint all packages
pnpm typecheck   # Type-check all packages
pnpm format      # Prettier formatting
pnpm clean       # Remove node_modules
```

## Backend Architecture (`apps/backend`)

### Framework: NestJS 11

```
src/
├── main.ts                  # Bootstrap, CORS, helmet, CSRF, Zod validation pipe, /api prefix
├── app.module.ts            # Root module importing all feature modules
├── auth/                    # JWT auth (Passport strategy, guards)
├── common/
│   ├── decorators/          # @UseZodSchema for validation
│   ├── middlewares/         # CSRF middleware
│   ├── pipes/               # ZodValidationPipe (global)
│   └── types/               # RequestWithUser type
├── prisma/                  # PrismaService (global), PrismaModule
├── user/                    # User CRUD, auth, notifications, billing
├── admin/                   # Admin management
├── otp/                     # OTP generation/verification
├── password/                # Password reset flows
├── email-verification/      # Email verification tokens
├── payment/                 # Razorpay order creation & verification
├── llm/                     # OpenAI GPT-4o assistant with tool calling
├── bee-keeping/             # Apiculture (apiary, hives, inspections, honey)
├── cattle/                  # Cattle rearing, milk production
├── poultry/                 # Flock, eggs, feeds, health
├── floriculture/            # Flowers, watering schedules
├── crm/                     # Contacts, companies, contracts, receipts, tasks
├── finance/                 # Sales, expenses, loans
├── employees/               # Labour database, labour payments
├── warehouses/              # Warehouse management, inventory
├── marketplace/             # Products, cart, orders, payments
├── waitlist/                # Waitlist signup
├── stores/                  # (Store-related logic)
└── templates/               # Email templates (MJML)
```

### Backend Pattern: Controller → Service → Repository

Every feature module follows a consistent 3-layer pattern:
1. **Controller** — HTTP route handlers, input validation (`@UseZodSchema`), auth guards (`@UseGuards(JwtAuthGuard)`), request parsing
2. **Service** — Thin business logic layer delegating to repository
3. **Repository** — Direct Prisma database operations, data transformation

Example route pattern:
```
POST /api/user/register     → UserController.register()    → UserService → UserRepository
GET  /api/user/:id          → UserController.getUser()     → UserService → UserRepository
POST /api/payment/create-order → PaymentController         → PaymentService → PaymentRepository
```

### Key Backend Configuration
- Global prefix: `/api`
- Rate limiting: 60 requests/60 seconds (global), 5 requests/60 seconds for login
- CORS: Configurable origins via `ALLOWED_ORIGINS` env var
- Security: Helmet, CSRF middleware, Argon2 password hashing
- Body size limit: 1MB for JSON and URL-encoded

## Frontend Architecture (`apps/frontend`)

### Framework: Next.js 15 (Pages Router)

```
src/
├── pages/
│   ├── index.tsx               # Redirect handler (checks JWT, routes to dashboard or login)
│   ├── login.tsx               # Login page
│   ├── _app.tsx                # App wrapper
│   ├── 404.tsx                 # Not found
│   ├── [user_id]/              # Dynamic user-scoped routes
│   │   ├── index.tsx           # Dashboard (calendar, widgets, charts)
│   │   ├── apiculture.tsx      # Bee keeping list
│   │   ├── cattle_rearing.tsx  # Cattle list
│   │   ├── poultry.tsx         # Poultry list
│   │   ├── floriculture.tsx    # Floriculture list
│   │   ├── crm.tsx             # CRM hub
│   │   ├── finance_*.tsx       # Finance pages (dashboard, sales, expenses, loans, receipts)
│   │   ├── labour_database.tsx # Employee list
│   │   ├── labour_payment.tsx  # Payroll
│   │   ├── storage.tsx         # Warehouses
│   │   ├── marketplace.tsx     # Marketplace
│   │   ├── pricing.tsx         # Subscription plans
│   │   ├── add_service.tsx     # Add new service
│   │   ├── apiculture/         # Nested: individual apiary/hive pages
│   │   ├── cattle_rearing/     # Nested: individual cattle pages
│   │   ├── poultry/            # Nested: flock detail pages
│   │   ├── companies/          # CRM company detail
│   │   ├── contacts/           # CRM contact detail
│   │   ├── contracts/          # CRM contract detail
│   │   ├── labour_database/    # Employee detail
│   │   ├── labour_payment/     # Payment detail
│   │   ├── warehouse/          # Warehouse detail
│   │   ├── receipts/           # Invoice detail
│   │   ├── tasks/              # Task management
│   │   └── settings/           # Settings pages (account, billing, module-specific settings)
│   ├── api/
│   │   ├── weather.ts          # Weather proxy endpoint (OpenMeteo)
│   │   └── llm.ts              # LLM proxy endpoint
│   ├── privacy-policy.tsx
│   ├── reset_password.tsx
│   ├── training-services.tsx
│   └── mobile-redirect.tsx
├── components/
│   ├── cards/                  # Dashboard cards (finance, tasks, inventory, etc.)
│   ├── floriculture/           # Floriculture-specific components
│   ├── form/                   # Form components
│   ├── layout/                 # Navbar, NavPanel, Notification, SettingsBar
│   ├── maps/                   # Google Maps integration
│   ├── marketplace/            # Marketplace components (ProductCard, ListProductModal)
│   ├── modals/                 # Modal dialogs for each module
│   ├── tables/                 # Data table components
│   ├── tasks/                  # Task/kanban board components
│   └── ui/                     # App-specific UI (Calendar, etc.)
├── constants/                  # App constants and options
├── contexts/                   # UserPreferencesContext (language, theme, time format, etc.)
├── hooks/                      # Custom hooks (finance, forms, maps, modals, sidebar, tables, weather)
├── layout/                     # PlatformLayout, LoginLayout, ChatWindow
├── lib/                        # Utilities (axiosInstance, helpers)
├── stores/                     # Toast store
├── styles/                     # Global styles
├── templates/                  # Email templates
└── translations/               # i18n translation files
```

### Frontend Patterns
- **Routing**: Next.js Pages Router with dynamic `[user_id]` segments for multi-tenant user isolation
- **Auth**: JWT stored in localStorage, checked on page load, API calls include Bearer token
- **State**: React Context (UserPreferencesContext), custom hooks, Zustand-like toast store
- **Styling**: TailwindCSS 4 via PostCSS
- **API Calls**: Axios instance with interceptors (`src/lib/utils/axiosInstance`)
- **Data Viz**: Chart.js with react-chartjs-2
- **Drag & Drop**: @dnd-kit for sortable lists and kanban boards
- **Exports**: jsPDF + html2canvas for PDF generation, xlsx for Excel exports
- **i18n**: next-i18next with multiple language support

## Admin Panel Architecture (`apps/admin`)

```
src/
├── pages/
│   ├── index.tsx               # Admin login/dashboard
│   └── platform/[admin_id]/    # Admin-scoped platform management
├── components/                 # Admin-specific components
├── contexts/                   # Admin context
├── hooks/                      # Admin hooks
├── layout/                     # Admin layout
├── lib/                        # Utilities
├── constants/                  # Admin constants
└── styles/                     # Admin styles
```

Shares the same tech stack as frontend (Next.js 15, TailwindCSS 4, Chart.js) but with admin-specific functionality for user management, billing oversight, and platform monitoring.

## Mobile App Architecture (`apps/mobile`)

### Framework: Expo 54 with Expo Router

```
app/
├── _layout.tsx                 # Root layout (theme, splash, gesture handler)
├── index.tsx                   # Entry/redirect
├── login.tsx                   # Login screen
├── forgot_password.tsx         # Password recovery
├── modal.tsx                   # Modal screen
└── [user_id]/                  # User-scoped routes (mirrors frontend structure)
    ├── index.tsx               # Dashboard
    ├── apiculture.tsx          # Bee keeping
    ├── cattle_rearing.tsx      # Cattle
    ├── poultry.tsx             # Poultry
    ├── floriculture.tsx        # Flowers
    ├── crm.tsx                 # CRM
    ├── finance_*.tsx           # Finance pages
    ├── labour_database.tsx     # Employees
    ├── labour_payment.tsx      # Payroll
    ├── storage.tsx             # Warehouses
    ├── marketplace.tsx         # Marketplace
    ├── add_service.tsx
    ├── apiculture/             # Nested apiary/hive routes
    ├── companies/
    ├── contacts/
    ├── contracts/
    ├── labour_database/
    ├── labour_payment/
    ├── marketplace/
    ├── poultry/
    ├── receipts/
    ├── settings/
    └── warehouse/
components/
├── cards/                      # Feature cards (apiculture, poultry, finance, etc.)
├── form/                       # Form components
├── layout/                     # Sidebar, Navbar, NavPanel, ChatWindow, Notification
├── marketplace/                # Marketplace components
├── modals/                     # Module-specific modals
├── tasks/                      # Task board components
├── ui/                         # Mobile-specific UI components
├── calendar.tsx                # Calendar component
└── AnimatedSplashScreen.tsx    # Custom splash animation
contexts/
└── UserPreferencesContext.tsx  # Dark mode, language, preferences
hooks/
├── finance.ts                  # Finance hooks
├── use-color-scheme.ts         # Native color scheme
└── use-color-scheme.web.ts     # Web color scheme
```

### Mobile Patterns
- **Routing**: Expo Router (file-based, similar to Next.js)
- **Styling**: NativeWind (TailwindCSS for React Native) + global.css
- **Navigation**: React Navigation with bottom tabs
- **State**: AsyncStorage for persistence, React Context for preferences
- **Icons**: @expo/vector-icons, Material Design Icons
- **Charts**: react-native-chart-kit
- **Gestures**: react-native-gesture-handler, react-native-reanimated
- **Deployment**: EAS Build + EAS Update (OTA updates via GitHub Actions)

## Public Website Architecture (`apps/website`)

```
src/
├── pages/
│   ├── index.tsx               # Landing page
│   ├── contact.tsx             # Contact form
│   ├── technology.tsx          # Technology showcase
│   ├── waitlist.tsx            # Waitlist signup
│   ├── company/                # Company info pages
│   ├── products/               # Product showcase pages
│   └── api/
│       └── jobs/               # Job listing API (jobs.ts, apply.ts, candidate.ts)
├── components/
│   ├── cards/                  # Feature/product cards
│   ├── layout/                 # Website layout (header, footer)
│   ├── others/                 # Misc components
│   ├── sections/               # Landing page sections
│   └── ui/                     # UI components
├── config/                     # Site configuration
├── contexts/                   # Website contexts
├── layout/                     # Layout components
├── lib/                        # Utilities
├── stores/                     # State stores
├── styles/                     # Styles
└── translations/               # i18n translations
```

### Website Patterns
- **Animations**: Framer Motion for scroll/entrance animations
- **Icons**: Font Awesome (brands, solid)
- **Headless UI**: @headlessui/react for accessible components
- **Purpose**: Marketing, waitlist collection, job postings, product showcases

## Shared Package: `@graminate/ui`

```
lib/
├── components/                 # 40+ Radix UI-based components
│   ├── accordion.tsx
│   ├── alert-dialog.tsx
│   ├── avatar.tsx
│   ├── badge.tsx
│   ├── button.tsx
│   ├── calendar.tsx
│   ├── card.tsx
│   ├── checkbox.tsx
│   ├── datepicker.tsx
│   ├── dialog.tsx
│   ├── dropdown.tsx / dropdownMenu.tsx
│   ├── input.tsx
│   ├── label.tsx
│   ├── layout.tsx
│   ├── popover.tsx
│   ├── searchbar.tsx
│   ├── select.tsx
│   ├── sidebar.tsx
│   ├── skeleton.tsx
│   ├── spinner.tsx
│   ├── stepper.tsx
│   ├── switch.tsx
│   ├── table.tsx
│   ├── tabs.tsx
│   ├── tag-input.tsx
│   ├── textarea.tsx
│   ├── toggle.tsx / toggle-group.tsx
│   ├── upload.tsx
│   └── ... (and more)
├── hooks/                      # Shared hooks
├── index.ts                    # Barrel exports
├── main.css                    # Global TailwindCSS
├── types.ts                    # Shared types
└── utils.ts                    # Utility functions (cn() for class merging, etc.)
```

### UI Package Tech
- **Base**: Radix UI primitives (headless, accessible)
- **Styling**: TailwindCSS 4, CVA (class-variance-authority), tailwind-merge, clsx
- **Icons**: Lucide React, Material Symbols
- **Theming**: next-themes for dark/light mode
- **Tables**: @tanstack/react-table
- **Forms**: react-dropzone for file uploads
- **Build**: Vite library mode

## Shared Package: `@graminate/shared`

```
src/
├── index.ts                    # Barrel export
├── general.ts                  # General utilities
├── user/user.ts                # Zod schemas: usersSchema, adminSchema, loginHistorySchema, etc.
├── apiculture/                 # Bee keeping schemas
├── cattle_rearing/             # Cattle schemas
├── crm/                        # CRM schemas (contacts, companies, contracts)
├── finance/                    # Finance schemas (sales, expenses, loans)
├── floriculture/               # Floriculture schemas
├── poultry/                    # Poultry schemas
├── payment/                    # Payment schemas (createPaymentSchema, verifyPaymentSchema)
├── llm/                        # LLM schemas
├── waitlist/                   # Waitlist schemas
├── password/                   # Password schemas
└── email-verification/         # Email verification schemas
```

### Shared Package Tech
- **Validation**: Zod schemas used for input validation on both frontend and backend
- **OpenAPI**: zod-openapi for generating OpenAPI specs from Zod schemas
- **Build**: Vite library mode (outputs ESM + CJS + type declarations)
- **Testing**: Vitest
