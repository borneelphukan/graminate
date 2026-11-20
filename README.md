# Graminate Farm Management System

> **Comprehensive Digital Agriculture Platform** connecting farm operations, financial management, and workforce coordination into a unified ecosystem.

Graminate is a monorepo-based full-stack application designed to streamline agricultural processes for small-to-medium farms in India. It provides specialized modules for livestock management (Apiculture, Cattle, Poultry), floriculture, resource tracking (Warehouses & Inventory), and enterprise operations (CRM, Finance, HR/Payroll, Marketplace).

## 🚀 Key Features

### 🌱 Agricultural Operations
- **Apiculture (Bee Keeping)**: Apiary management, hive tracking, inspection records (queen status, brood pattern, varroa mite testing), and honey production logs.
- **Cattle Rearing**: Livestock group management with milk production tracking per animal.
- **Poultry Management**: Flock tracking, egg collection & grading (Indian standards: small/medium/large/XL), feed management, and veterinary health records.
- **Floriculture**: Flower cultivation tracking with calendar-based watering schedules.
- **Warehouse & Inventory**: Multi-warehouse inventory control with item groups, minimum stock limits, and low-stock alerts.
- **Weather Integration**: Real-time weather data via OpenMeteo API for informed farm decisions.

### 💼 Enterprise Management
- **CRM**: Contacts, companies, contracts (with pipeline stages and priorities), and invoice/receipt generation linked to sales.
- **Finance & Accounting**: Sales tracking, categorized expenses, loan management, financial dashboard with trend graphs, working capital analysis, and debt visualization.
- **HR & Payroll**: Employee database with Indian government ID tracking (Aadhar, PAN, EPFO, ESIC, PM Kisan), salary payments with allowances (housing, travel, meal, overtime).
- **Task Management**: Project-based tasks with Kanban boards and drag-and-drop organization.
- **Admin Dashboard**: Centralized platform administration for user management, billing oversight, and system monitoring.

### 🛒 Marketplace
- **Product Listings**: Sellers publish agricultural products with images, categories, and inventory linkage.
- **Shopping Experience**: Cart, wishlist, favorites, and product browsing.
- **Escrow-Based Orders**: Multi-producer orders with Razorpay payment integration and GST (CGST + SGST) calculation.
- **Order Lifecycle**: PENDING → PAID → SHIPPED → DELIVERED → RELEASED with per-producer escrow tracking.

### 🤖 Intelligent Features
- **AI Agricultural Assistant**: OpenAI GPT-4o powered chat with function-calling that queries user data (sales, expenses, contacts, inventory, poultry records, labour, etc.) to provide contextual insights. Plan-gated (FREE: no access, BASIC: 100 queries/month, PRO: 300 queries/month).
- **Analytics & Visualization**: Chart.js dashboards with trend graphs, comparison charts, and financial metrics.
- **Data Export**: PDF reports (jsPDF) and Excel exports (xlsx) for financial, inventory, and payroll data.

### 🌐 Public Website
- Marketing landing page with Framer Motion animations.
- Waitlist signup system.
- Job listings and application portal with CV upload.

## 🏗 Project Structure

This project is built using [TurboRepo](https://turbo.build/) and managed with [pnpm](https://pnpm.io/).

### Apps

| Directory | Name | Framework | Port | Description |
|-----------|------|-----------|------|-------------|
| `apps/frontend` | **Dashboard** | Next.js 15 (Pages Router), React 19 | 3000 | Main user interface for farm managers and staff. |
| `apps/backend` | **API Server** | NestJS 11 | 3001 | Core REST API with Prisma ORM, JWT auth, and integrations. |
| `apps/mobile` | **Mobile App** | Expo 54, React Native 0.81 | 8081 | Field operations app with NativeWind (TailwindCSS for RN). |
| `apps/admin` | **Admin Panel** | Next.js 15, React 19 | 3002 | System administration and oversight dashboard. |
| `apps/website` | **Landing Page** | Next.js 15, React 19 | 3003 | Public marketing site with waitlist and careers section. |

### Shared Packages

| Directory | Name | Description |
|-----------|------|-------------|
| `packages/ui` | **@graminate/ui** | 40+ shared UI components built on Radix UI primitives, TailwindCSS 4, CVA, and Lucide icons. |
| `packages/shared` | **@graminate/shared** | Zod validation schemas, TypeScript types, and utilities used across frontend and backend. |

### Other Directories

| Directory | Purpose |
|-----------|---------|
| `bruno/` | API request collections (Bruno format) organized by module for endpoint testing. |
| `scripts/` | Utility scripts (e.g., Bruno collection generation). |
| `.github/workflows/` | CI/CD pipelines (CI, Backend CD, Mobile CD, EAS OTA Updates). |

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Monorepo** | TurboRepo, pnpm 8.15.3 |
| **Frontend** | Next.js 15, React 19, TailwindCSS 4 |
| **Backend** | NestJS 11, Prisma 7 ORM, PostgreSQL |
| **Mobile** | Expo 54, React Native 0.81, NativeWind 4, Expo Router 6 |
| **UI Library** | Radix UI primitives, Lucide Icons, CVA, tailwind-merge, clsx |
| **Validation** | Zod schemas (shared via `@graminate/shared`) |
| **Auth** | JWT (Passport strategy), Argon2 password hashing |
| **Payments** | Razorpay (orders, verification, subscription management) |
| **AI** | OpenAI GPT-4o (function-calling with 11 tools) |
| **Email** | Nodemailer + MJML templates |
| **Charts** | Chart.js + react-chartjs-2 (web), react-native-chart-kit (mobile) |
| **i18n** | next-i18next / react-i18next (multi-language support) |
| **Drag & Drop** | @dnd-kit (kanban boards, sortable lists) |
| **Export** | jsPDF, html2canvas, xlsx |
| **Weather** | OpenMeteo API |
| **Storage** | AWS S3 (file uploads via presigned URLs) |
| **Testing** | Jest (backend unit/E2E), Vitest (shared package), Playwright (frontend E2E) |
| **CI/CD** | GitHub Actions, Docker, EAS Build/Update |
| **Deployment** | Netlify (frontend, admin, website), Docker webhook (backend), EAS (mobile) |

## 🏁 Getting Started

### Prerequisites
- **Node.js** >= 20 (LTS recommended)
- **pnpm** 8.15.3 (`npm install -g pnpm@8.15.3`)
- **PostgreSQL** database

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/borneelphukan/graminate.git
   cd graminate
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Environment Setup:**
   Create `.env` files in the respective application directories. See `apps/backend/.env.example` for the backend configuration:
   ```env
   DATABASE_URL="postgresql://user:pass@localhost:5432/graminate"
   NESTJS_API_URL=http://localhost:3001
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   JWT_SECRET=generate-a-long-random-secret
   OPENAI_API_KEY=sk-your-key
   RAZORPAY_KEY_ID=rzp_test_xxx
   RAZORPAY_KEY_SECRET=your-razorpay-secret
   ADMIN_INVITE_CODE=generate-a-long-random-invite-code
   ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3002,http://localhost:3003
   PORT=3001
   ```

4. **Database Setup:**
   Navigate to the backend and apply migrations:
   ```bash
   cd apps/backend
   pnpm prisma migrate dev
   ```

### Running the Project

Start all development servers via TurboRepo:

```bash
pnpm dev
```

Default URLs:
| Service | URL |
|---------|-----|
| **Frontend (Dashboard)** | http://localhost:3000 |
| **Backend API** | http://localhost:3001 (routes prefixed with `/api`) |
| **Admin Panel** | http://localhost:3002 |
| **Website** | http://localhost:3003 |
| **Mobile App** | http://localhost:8081 (Expo dev server) |

### Running Individual Apps

```bash
pnpm --filter frontend dev    # Dashboard only
pnpm --filter backend dev     # Backend only
pnpm --filter admin dev       # Admin only
pnpm --filter website dev     # Website only
pnpm --filter mobile dev      # Mobile (Expo)
```

## 📜 Root Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start all development servers via TurboRepo. |
| `pnpm build` | Build all applications and packages (sequential). |
| `pnpm lint` | Run ESLint across the codebase. |
| `pnpm typecheck` | Type-check all packages. |
| `pnpm format` | Format code with Prettier. |
| `pnpm clean` | Remove `node_modules`. |
| `pnpm start` | Start backend in production mode. |

## 📦 Backend API Structure

All API routes are prefixed with `/api/`. Key modules:

| Module | Base Route | Description |
|--------|-----------|-------------|
| User | `/api/user` | Registration, login, profile, notifications |
| Admin | `/api/admin` | Admin management, user oversight |
| Bee Keeping | `/api/apiculture`, `/api/bee-hives`, `/api/hive-inspection`, `/api/honey-production` | Apiary & hive management |
| Cattle | `/api/cattle-rearing`, `/api/cattle-milk` | Livestock & milk tracking |
| Poultry | `/api/flock`, `/api/poultry-eggs`, `/api/poultry-feeds`, `/api/poultry-health` | Flock, egg, feed, health records |
| Floriculture | `/api/floriculture` | Flower cultivation & watering |
| CRM | `/api/contacts`, `/api/companies`, `/api/contracts`, `/api/receipts` | Customer relationship management |
| Finance | `/api/sales`, `/api/expenses`, `/api/loans` | Sales, expenses, loans |
| HR | `/api/labour`, `/api/labour_payment` | Employee database & payroll |
| Warehouses | `/api/warehouse`, `/api/inventory` | Storage & inventory management |
| Marketplace | `/api/marketplace` | Products, cart, orders, payments |
| Payment | `/api/payment` | Razorpay order creation & verification |
| LLM | `/api/llm` | AI assistant (GPT-4o with function calling) |
| Waitlist | `/api/waitlist` | Pre-launch waitlist signups |

## 🗺️ Database Schema

The database (PostgreSQL) is managed via Prisma with 35+ models covering:
- **User & Auth**: users, admin, admin_roles, login_history, password_resets, notifications
- **Agriculture**: apiculture, bee_hives, hive_inspection, honey_production, cattle_rearing, cattle_milk, poultry_flock, poultry_eggs, poultry_feeds, poultry_health, floriculture, flower_watering
- **Business**: warehouse, inventory, contacts, companies, contracts, sales, invoices, invoice_items, expenses, loans, tasks, kanban_columns
- **HR**: labours, labour_payments
- **Marketplace**: marketplace_products, marketplace_cart, marketplace_favorites, marketplace_wishlist, marketplace_orders, marketplace_order_items
- **Payments**: payments, bank_details
- **Other**: jobs, job_applications, waitlist

See `apps/backend/prisma/schema.prisma` for the complete schema.

## 🐳 Docker

The backend includes a multi-stage Dockerfile optimized for production:
```bash
# Build and run
docker build -t graminate-backend apps/backend
docker run -p 3001:3001 --env-file apps/backend/.env graminate-backend
```

## 🔄 CI/CD

| Workflow | Trigger | Action |
|----------|---------|--------|
| **CI** | Push to main, all PRs | Lint, typecheck, test, build |
| **Backend CD** | Push to main (backend changes) | Prisma migrate + webhook deploy |
| **Mobile CD** | Push to main (mobile changes) | EAS Build (iOS/Android) |
| **EAS Update** | Push to main (mobile changes) | OTA update via EAS |

## 📄 License

This project is private and proprietary.
