# Graminate Backend

> **NestJS 11 REST API** powering the Graminate Farm Management System.

The central backend service for Graminate, providing RESTful API endpoints for all farm operations, enterprise management, marketplace, AI integration, and administrative functions. Built with NestJS 11, Prisma 7 ORM, and PostgreSQL.

## 🏗 Architecture

### Framework & Patterns
- **NestJS 11** — Modular, scalable backend framework
- **Controller → Service → Repository** — 3-layer architecture per feature module
- **Prisma 7** — Type-safe ORM for PostgreSQL with auto-generated client
- **Zod Validation** — Input validation via shared schemas from `@graminate/shared`
- **JWT Authentication** — Passport-based strategy with Argon2 password hashing

### Server Configuration
- **Port**: 3001 (configurable via `PORT` env var)
- **Global Prefix**: `/api`
- **Rate Limiting**: 60 req/60s global, 5 req/60s for login
- **Security**: Helmet, CSRF middleware, CORS (configurable origins)
- **Body Limit**: 1MB for JSON and URL-encoded payloads

## 📦 Tech Stack

| Technology | Purpose |
|-----------|---------|
| NestJS 11 | Application framework |
| TypeScript | Language |
| Prisma 7 | ORM & database migrations |
| PostgreSQL | Database |
| Passport + JWT | Authentication |
| Argon2 | Password hashing |
| Zod | Input validation (via `@graminate/shared`) |
| OpenAI SDK | GPT-4o integration with function calling |
| Razorpay SDK | Payment processing |
| Nodemailer + MJML | Email delivery with HTML templates |
| AWS S3 SDK | File storage (presigned URLs) |
| @nestjs/axios | HTTP client for internal API calls |
| @nestjs/throttler | Rate limiting |
| class-validator / class-transformer | DTO validation |
| Jest | Testing framework |

## 🗂 Module Structure

```
src/
├── main.ts                    # Bootstrap, CORS, helmet, CSRF, validation pipe
├── app.module.ts              # Root module (imports all feature modules)
├── auth/                      # JWT auth (Passport strategy, guards, repository)
├── common/
│   ├── decorators/            # @UseZodSchema for request validation
│   ├── middlewares/           # CSRF protection middleware
│   ├── pipes/                 # ZodValidationPipe (global)
│   └── types/                 # RequestWithUser type
├── prisma/                    # PrismaService (global), PrismaModule
│
├── user/                      # User CRUD, profile, notifications, billing
├── admin/                     # Admin management, user oversight
├── otp/                       # OTP generation & verification
├── password/                  # Password reset flows
├── email-verification/        # Email verification tokens
├── payment/                   # Razorpay order creation & verification
├── llm/                       # OpenAI GPT-4o assistant (function calling)
├── waitlist/                  # Waitlist signup management
│
├── bee-keeping/               # Apiculture module
│   ├── apiculture/            # Apiary CRUD
│   ├── bee-hives/             # Hive CRUD
│   ├── hive-inspection/       # Inspection records
│   └── honey-production/      # Harvest records
│
├── cattle/                    # Cattle module
│   ├── cattle-rearing/        # Livestock CRUD
│   └── cattle-milk/           # Milk production records
│
├── poultry/                   # Poultry module
│   ├── flock/                 # Flock CRUD
│   ├── poultry-eggs/          # Egg collection & grading
│   ├── poultry-feeds/         # Feed tracking
│   └── poultry-health/        # Veterinary health records
│
├── floriculture/              # Flower cultivation & watering
│
├── crm/                       # CRM module
│   ├── contacts/              # Contact management
│   ├── companies/             # Company management
│   ├── contracts/             # Contract tracking
│   ├── receipts/              # Invoice/receipt generation
│   └── tasks/                 # Task management
│
├── finance/                   # Finance module
│   ├── sales/                 # Sales records
│   ├── expenses/              # Expense tracking
│   └── loans/                 # Loan management
│
├── employees/                 # HR module
│   ├── labour/                # Employee database
│   └── labour_payment/        # Payroll management
│
├── warehouses/                # Storage module
│   ├── warehouse/             # Warehouse CRUD
│   └── inventory/             # Inventory management
│
├── marketplace/               # Marketplace (products, cart, orders, escrow)
├── stores/                    # Store-related logic
└── templates/                 # MJML email templates
```

## 🔐 Authentication

### JWT Strategy
- Token extraction: `Authorization: Bearer <token>` header
- Payload: `{ userId }` for users, `{ isAdmin, adminId, isRoot }` for admins
- Guard: `JwtAuthGuard` applied per-route with `@UseGuards(JwtAuthGuard)`

### Login Flow (2-Step OTP)
1. **POST `/api/user/login`** — User submits email + password. Backend validates credentials, creates login_history record, sends OTP via email. Returns `{ success, login_id, user }` (NO JWT).
2. **POST `/api/user/login-verify`** — User enters OTP from email. Frontend sends `{ email, otp, loginId }`. Backend verifies OTP, issues JWT token with `{ userId }` payload. Returns `{ access_token, login_id, user }`.

### Authorization Pattern
- Self-only access: Routes verify `req.user.userId === paramId`
- Admin override: Admin routes can access any user's data
- `UnauthorizedException` thrown on access violations

```typescript
@UseGuards(JwtAuthGuard)
@Get(':id')
async getUser(@Param('id') id: string, @Request() req: RequestWithUser) {
  if (String(req.user.userId) !== id) throw new UnauthorizedException();
  return this.userService.getUserById(id);
}
```

## 📡 API Endpoints

All routes are prefixed with `/api/`.

| Module | Base Route | Key Endpoints |
|--------|-----------|---------------|
| User | `/user` | register, login (2-step with OTP), login-verify, logout, get/update/delete profile, notifications, billing |
| Admin | `/admin` | register (invite code), login, user management, stats |
| Bee Keeping | `/apiculture`, `/bee-hives`, `/hive-inspection`, `/honey-production` | CRUD per entity |
| Cattle | `/cattle-rearing`, `/cattle-milk` | CRUD per entity |
| Poultry | `/flock`, `/poultry-eggs`, `/poultry-feeds`, `/poultry-health` | CRUD per entity |
| Floriculture | `/floriculture` | Flowers, watering schedules |
| CRM | `/contacts`, `/companies`, `/contracts`, `/receipts` | CRUD per entity |
| Finance | `/sales`, `/expenses`, `/loans` | CRUD per entity |
| HR | `/labour`, `/labour_payment` | Employee DB, payroll |
| Warehouses | `/warehouse`, `/inventory` | CRUD per entity |
| Marketplace | `/marketplace` | Products, cart, orders, payments |
| Payment | `/payment` | create-order, verify |
| LLM | `/llm` | POST (chat with AI assistant) |
| Waitlist | `/waitlist` | join, list (admin) |
| Health | `/health` | GET health check |

## 🤖 AI Integration (LLM Module)

The LLM module provides an AI agricultural assistant powered by **OpenAI GPT-4o** with function calling:

- **Plan Gating**: FREE (no access), BASIC (100 queries/month), PRO (300 queries/month)
- **Tools Available** (11 functions):
  - `get_contacts`, `get_companies`, `get_contracts`, `get_receipts`
  - `get_sales_records`, `get_expense_records`
  - `get_poultry_egg_records` (filterable by flock)
  - `get_warehouses`, `get_inventory_items` (filterable by warehouse)
  - `get_labour_records`, `get_labour_payments` (filterable by employee)
- **Internal Calls**: Tools make HTTP requests to the backend's own API endpoints
- **Conversation**: Last 15 messages, max 1500 tokens per response

## 🗃 Database

- **Database**: PostgreSQL
- **ORM**: Prisma 7 (schema at `prisma/schema.prisma`)
- **Models**: 35+ models covering users, agriculture, CRM, finance, HR, marketplace, payments
- **Cascade Deletes**: All domain models cascade-delete when a user is removed
- **Migrations**: `pnpm prisma migrate dev` (dev), `pnpm prisma migrate deploy` (prod)

## 📧 Email System

- **Transport**: Nodemailer via Gmail SMTP
- **Templates**: MJML for responsive HTML emails
- **Use Cases**: Registration verification, password resets, OTP delivery

## 🐳 Docker

Multi-stage production Dockerfile:

```dockerfile
# Stages:
# 1. base     — Node 20 Alpine + pnpm
# 2. builder  — TurboRepo prune for backend workspace
# 3. installer — Install deps + generate Prisma + build
# 4. runner   — Non-root user (nestjs:nodejs), exposes port 3001
```

```bash
docker build -t graminate-backend .
docker run -p 3001:3001 --env-file .env graminate-backend
```

## 🏁 Getting Started

### Prerequisites
- Node.js >= 20
- pnpm 8.15.3
- PostgreSQL database

### Installation

```bash
# From the monorepo root
pnpm install

# Navigate to backend
cd apps/backend

# Set up environment
cp .env.example .env
# Edit .env with your database URL, JWT secret, API keys, etc.

# Generate Prisma client & run migrations
pnpm prisma generate
pnpm prisma migrate dev
```

### Running

```bash
pnpm dev          # Development mode (watch)
pnpm build        # Build for production
pnpm start:prod   # Production mode
pnpm test         # Run unit tests
pnpm test:e2e     # Run E2E tests
```

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `JWT_SECRET` | ✅ | Secret for JWT signing/verification |
| `OPENAI_API_KEY` | ✅ (for LLM) | OpenAI API key |
| `RAZORPAY_KEY_ID` | ✅ (for payments) | Razorpay key ID |
| `RAZORPAY_KEY_SECRET` | ✅ (for payments) | Razorpay key secret |
| `EMAIL_USER` | ✅ (for email) | Gmail address |
| `EMAIL_PASS` | ✅ (for email) | Gmail app password |
| `ADMIN_INVITE_CODE` | Optional | Shared invite code for admin registration |
| `ALLOWED_ORIGINS` | Optional | Comma-separated CORS origins (defaults to localhost:3000-3003, 8081) |
| `NESTJS_API_URL` | ✅ (for LLM) | Self-referencing URL for internal API calls |
| `PORT` | Optional | Server port (default: 3001) |

## 🧪 Testing

```bash
pnpm test          # Unit tests (Jest, *.spec.ts)
pnpm test:watch    # Watch mode
pnpm test:cov      # Coverage report
pnpm test:e2e      # E2E tests (Supertest)
```

## 📜 Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Development mode with hot-reloading (runs `prisma generate` first) |
| `pnpm build` | Build for production (runs `prisma generate` first) |
| `pnpm start` | Start in development mode |
| `pnpm start:prod` | Start production build |
| `pnpm lint` | ESLint with auto-fix |
| `pnpm format` | Prettier formatting |
| `pnpm test` | Run unit tests |
| `pnpm test:e2e` | Run E2E tests |
