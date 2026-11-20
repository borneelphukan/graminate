# Graminate — Project Overview

## What Is Graminate?

Graminate is a **comprehensive digital agriculture platform** (Farm Management System) that connects farm operations, financial management, and workforce coordination into a single unified ecosystem. It targets agricultural producers — especially small-to-medium farms in India — providing specialized modules for livestock, resource tracking, and enterprise operations.

## One-Line Summary

A full-stack monorepo application (NestJS + Next.js + Expo/React Native) that digitizes farm management across poultry, cattle, bee keeping, floriculture, warehousing, CRM, finance, HR, and an agricultural marketplace.

## Target Users

| User Type | Access Point | Purpose |
|-----------|-------------|---------|
| **Farmers / Farm Managers** | Frontend web app (port 3000), Mobile app | Day-to-day farm operations, record keeping, analytics |
| **System Administrators** | Admin panel (port 3002) | Manage users, billing, platform oversight |
| **Public Visitors** | Website (port 3003) | Marketing, waitlist signup, job applications, product browsing |
| **AI Assistant** | Integrated chat (via backend LLM endpoint) | Agricultural Q&A, data-driven insights for paid users |

## Domain Modules

Graminate organizes its business logic into distinct agricultural and enterprise domains:

### Agricultural Operations
- **Apiculture (Bee Keeping)** — Apiary and hive management, hive inspections, honey production tracking
- **Cattle Rearing** — Livestock tracking, milk production records
- **Poultry** — Flock management, egg collection & grading, feed tracking, veterinary health records
- **Floriculture** — Flower cultivation tracking, watering schedules
- **Warehouses & Inventory** — Storage facilities, inventory items with minimum stock limits, item groups

### Enterprise / Business Operations
- **CRM** — Contacts, companies, contracts (with stages/priorities), receipts/invoices
- **Finance** — Sales records, expense tracking, loans, financial dashboard with charts
- **HR / Labour Management** — Employee database with government IDs (Aadhar, PAN, EPFO, ESIC), payroll with allowances (housing, travel, meal, overtime)
- **Tasks** — Per-user project task management with Kanban columns
- **Marketplace** — Product listings, cart, wishlist, favorites, escrow-based orders with Razorpay payments
- **Notifications** — In-app notification system with read/unread tracking

### Intelligent Features
- **LLM Integration** — OpenAI GPT-4o assistant with function-calling to query user data (contacts, sales, expenses, poultry, warehouses, inventory, labour, etc.)
- **Weather Integration** — OpenMeteo API for real-time weather data
- **AI-Powered Insights** — Financial metrics calculation, agricultural advice based on user data

## Subscription Tiers

| Plan | Price | Key Limits |
|------|-------|------------|
| **FREE** | ₹0 | Basic features, no LLM access |
| **BASIC** | Paid | 100 LLM queries/month |
| **PRO** | Paid | 300 LLM queries/month, all features |

Users can schedule plan downgrades. Payments processed through Razorpay.

## Key Ports & URLs

| Service | Default Port | Description |
|---------|-------------|-------------|
| Frontend (Dashboard) | 3000 | Main user-facing Next.js web app |
| Backend API | 3001 | NestJS API server with `/api` prefix |
| Admin Panel | 3002 | Next.js admin dashboard |
| Website | 3003 | Public marketing website |
| Mobile App | 8081 | Expo dev server |

## Quick Start

```bash
# 1. Clone & install
git clone https://github.com/borneelphukan/graminate.git
cd graminate
pnpm install

# 2. Set up environment variables
# Create .env in apps/backend based on apps/backend/.env.example

# 3. Database migration
cd apps/backend
pnpm prisma migrate dev

# 4. Start all apps
cd ../..
pnpm dev
```

## Tech Stack Summary

| Layer | Technology |
|-------|-----------|
| Monorepo | TurboRepo + pnpm 8.15.3 |
| Frontend | Next.js 15, React 19, TailwindCSS 4 |
| Backend | NestJS 11, Prisma 7 ORM, PostgreSQL |
| Mobile | Expo 54, React Native 0.81, NativeWind (TailwindCSS) |
| UI Library | Radix UI, Lucide Icons, CVA, shadcn-style components |
| Auth | JWT (Passport), OTP verification for login & registration, Argon2 password hashing |
| Payments | Razorpay |
| AI | OpenAI GPT-4o |
| Email | Nodemailer + MJML templates |
| Charts | Chart.js via react-chartjs-2 |
| i18n | next-i18next / i18next |
| Validation | Zod schemas (shared across frontend/backend) |
| Testing | Jest (backend), Playwright (frontend E2E), Vitest (shared) |

## Repository Root Files

| File | Purpose |
|------|---------|
| `package.json` | Root workspace scripts (dev, build, lint, format, clean) |
| `pnpm-workspace.yaml` | Defines `apps/*` and `packages/*` as workspaces |
| `turbo.json` | TurboRepo task pipeline config (build, lint, typecheck, test, dev) |
| `Gemini.md` | AI assistant rules for Gemini (no docs, no browser) |
| `.nvmrc` | Node version pinning |
| `.npmrc` | pnpm/npm configuration |
