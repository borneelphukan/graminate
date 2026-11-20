# Backend API Reference

## Overview

The backend is a **NestJS 11** application running on port 3001 with a global `/api` prefix. It uses Prisma ORM for PostgreSQL database access, JWT for authentication, and follows a Controller → Service → Repository pattern.

## Server Bootstrap (`main.ts`)

- Global prefix: `/api`
- CORS: Configurable via `ALLOWED_ORIGINS` env var (defaults to localhost:3000-3003, 8081)
- Security: Helmet headers, custom CSRF middleware
- Body limits: 1MB for JSON and URL-encoded
- Validation: Global `ZodValidationPipe`
- Cookie parsing: `cookie-parser`

## Authentication & Authorization

### JWT Strategy
- Token extraction: `Authorization: Bearer <token>` header
- Secret: `JWT_SECRET` env var
- Payload contains either `{ isAdmin, adminId, isRoot }` or `{ userId }`
- Guard: `JwtAuthGuard` applied per-controller or per-route with `@UseGuards(JwtAuthGuard)`

### Rate Limiting
- Global: 60 requests per 60 seconds (`ThrottlerModule`)
- Login: 5 requests per 60 seconds (`@Throttle`)

### Request Type
```typescript
// common/types/request.type.ts
interface RequestWithUser extends Request {
  user: {
    isAdmin?: boolean;
    adminId?: string;
    isRoot?: boolean;
    userId?: number;
  };
}
```

## Module Architecture

All API routes are under `/api/`. Each module follows the Controller → Service → Repository pattern.

### User Module (`/api/user`)

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/user/register` | No | Register new user (Zod: usersSchema partial) |
| POST | `/user/check-exists` | No | Check if email/phone exists |
| POST | `/user/login` | No | Step 1: Validate credentials, send OTP (throttled: 5/min). Returns `login_id` (no JWT) |
| POST | `/user/login-verify` | No | Step 2: Verify OTP with `login_id`, returns JWT token (throttled: 5/min) |
| POST | `/user/logout` | JWT | Logout (invalidate session) |
| GET | `/user/:id` | JWT | Get user profile (self only) |
| PUT | `/user/:id` | JWT | Update profile (self only) |
| DELETE | `/user/delete/:id` | JWT | Delete account (self only) |
| POST | `/user/verify-password/:id` | JWT | Verify password (self only) |
| GET | `/user/:id/available-sub-types` | JWT | Get available sub-types |
| POST | `/user/:id/schedule-downgrade` | JWT | Schedule plan downgrade |
| GET | `/user/:id/billing-history` | JWT | Get billing history |
| GET | `/user/:id/notifications` | JWT | Get notifications |
| PUT | `/user/:id/notifications/read` | JWT | Mark notification(s) read |
| DELETE | `/user/:id/notifications/:notificationId` | JWT | Delete single notification |
| DELETE | `/user/:id/notifications` | JWT | Clear all notifications |

### Admin Module (`/api/admin`)

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/admin/register` | No (invite code) | Register admin |
| POST | `/admin/login` | No | Admin login |
| GET | `/admin/me` | JWT (admin) | Get admin profile |
| GET | `/admin/users` | JWT (admin) | List all users |
| GET | `/admin/users/:id` | JWT (admin) | Get specific user |
| POST | `/admin/users/:id` | JWT (admin) | Update user |
| DELETE | `/admin/users/:id` | JWT (admin) | Delete user |
| GET | `/admin/users/count` | JWT (admin) | User count stats |
| GET | `/admin/users/:id/login-history` | JWT (admin) | User login history |
| GET | `/admin/users/:id/billing-history` | JWT (admin) | User billing history |

### Bee Keeping Module (`/api/apiculture`, `/api/bee-hives`, `/api/hive-inspection`, `/api/honey-production`)

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET/POST | `/apiculture/user/:userId` | JWT | List/create apiaries |
| GET/PUT/DELETE | `/apiculture/:id` | JWT | Read/update/delete apiary |
| GET/POST | `/bee-hives/apiary/:apiaryId` | JWT | List/create hives |
| GET/PUT/DELETE | `/bee-hives/:id` | JWT | Read/update/delete hive |
| GET/POST | `/hive-inspection/hive/:hiveId` | JWT | List/create inspections |
| GET/PUT/DELETE | `/hive-inspection/:id` | JWT | Read/update/delete inspection |
| GET/POST | `/honey-production/hive/:hiveId` | JWT | List/create harvests |
| GET/PUT/DELETE | `/honey-production/:id` | JWT | Read/update/delete harvest |

### Cattle Module (`/api/cattle-rearing`, `/api/cattle-milk`)

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET/POST | `/cattle-rearing/user/:userId` | JWT | List/create cattle |
| GET/PUT/DELETE | `/cattle-rearing/:id` | JWT | Read/update/delete cattle |
| GET/POST | `/cattle-milk/cattle/:cattleId` | JWT | List/create milk records |
| GET/PUT/DELETE | `/cattle-milk/:id` | JWT | Read/update/delete milk record |

### Poultry Module (`/api/flock`, `/api/poultry-eggs`, `/api/poultry-feeds`, `/api/poultry-health`)

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET/POST | `/flock/user/:userId` | JWT | List/create flocks |
| GET/PUT/DELETE | `/flock/:id` | JWT | Read/update/delete flock |
| GET/POST | `/poultry-eggs/:userId` | JWT | List/create egg records (query: flockId) |
| GET/PUT/DELETE | `/poultry-eggs/:id` | JWT | Read/update/delete egg record |
| GET/POST | `/poultry-feeds/:userId` | JWT | List/create feed records |
| GET/PUT/DELETE | `/poultry-feeds/:id` | JWT | Read/update/delete feed record |
| GET/POST | `/poultry-health/:userId` | JWT | List/create health records |
| GET/PUT/DELETE | `/poultry-health/:id` | JWT | Read/update/delete health record |

### Floriculture Module (`/api/floriculture`)

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET/POST | `/floriculture/user/:userId` | JWT | List/create flower records |
| GET/PUT/DELETE | `/floriculture/:id` | JWT | Read/update/delete flower |
| GET/POST | `/floriculture/watering/:flowerId` | JWT | List/create watering records |
| PUT | `/floriculture/watering/:id` | JWT | Update watering record |

### CRM Module (`/api/contacts`, `/api/companies`, `/api/contracts`, `/api/receipts`)

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET/POST | `/contacts/:userId` | JWT | List/create contacts |
| GET/PUT/DELETE | `/contacts/:id` | JWT | CRUD contact |
| GET/POST | `/companies/:userId` | JWT | List/create companies |
| GET/PUT/DELETE | `/companies/:id` | JWT | CRUD company |
| GET/POST | `/contracts/:userId` | JWT | List/create contracts |
| GET/PUT/DELETE | `/contracts/:id` | JWT | CRUD contract |
| GET/POST | `/receipts/:userId` | JWT | List/create receipts |
| GET/PUT/DELETE | `/receipts/:id` | JWT | CRUD receipt |

### Finance Module (`/api/sales`, `/api/expenses`, `/api/loans`)

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET/POST | `/sales/user/:userId` | JWT | List/create sales |
| GET/PUT/DELETE | `/sales/:id` | JWT | CRUD sale |
| GET/POST | `/expenses/user/:userId` | JWT | List/create expenses |
| GET/PUT/DELETE | `/expenses/:id` | JWT | CRUD expense |
| GET/POST | `/loans/user/:userId` | JWT | List/create loans |
| GET/PUT/DELETE | `/loans/:id` | JWT | CRUD loan |

### Employees Module (`/api/labour`, `/api/labour_payment`)

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET/POST | `/labour/:userId` | JWT | List/create employees |
| GET/PUT/DELETE | `/labour/:id` | JWT | CRUD employee |
| GET/POST | `/labour_payment/:labourId` | JWT | List/create payments |
| GET/PUT/DELETE | `/labour_payment/:id` | JWT | CRUD payment |

### Warehouses Module (`/api/warehouse`, `/api/inventory`)

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET/POST | `/warehouse/user/:userId` | JWT | List/create warehouses |
| GET/PUT/DELETE | `/warehouse/:id` | JWT | CRUD warehouse |
| GET/POST | `/inventory/:userId` | JWT | List/create items (query: warehouse_id) |
| GET/PUT/DELETE | `/inventory/:id` | JWT | CRUD inventory item |

### Marketplace Module (`/api/marketplace`)

Handles product listings, cart, wishlist, favorites, orders, and payment flow.

### Payment Module (`/api/payment`)

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/payment/create-order` | JWT | Create Razorpay order |
| POST | `/payment/verify` | JWT | Verify Razorpay payment |

### LLM Module (`/api/llm`)

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/llm` | JWT | Chat with AI assistant (plan-gated: BASIC=100/mo, PRO=300/mo) |

### OTP Module (`/api/otp`)

Handles OTP generation and verification for security flows.

### Password Module (`/api/password`)

Password reset request and confirmation flows.

### Email Verification Module (`/api/email-verification`)

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/email-verification/verify` | No | Verify email token |
| POST | `/email-verification/resend` | JWT | Resend verification email |

### Waitlist Module (`/api/waitlist`)

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/waitlist/join` | No | Join waitlist |
| GET | `/waitlist` | JWT (admin) | Get all waitlist entries |

### Health Check

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/health` | No | Health check endpoint |

## Validation Pattern

All endpoints use Zod schemas from `@graminate/shared` via the `@UseZodSchema` decorator:

```typescript
@UseZodSchema(usersSchema, { partial: true })
@Post('register')
async register(@Body() body: Partial<users>): Promise<any> { ... }
```

The global `ZodValidationPipe` processes the decorated schema and validates request bodies.

## Email System

- **Transport**: Nodemailer via Gmail SMTP
- **Templates**: MJML for responsive HTML emails
- **Use cases**: Registration verification, password resets, OTP delivery
- **Env vars**: `EMAIL_USER`, `EMAIL_PASS` (Gmail app password)

## Environment Variables (`.env.example`)

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string |
| `NESTJS_API_URL` | Self-referencing API URL (for LLM internal calls) |
| `EMAIL_USER` | Gmail address for email sending |
| `EMAIL_PASS` | Gmail app-specific password |
| `JWT_SECRET` | Secret for JWT signing/verification |
| `OPENAI_API_KEY` | OpenAI API key for GPT-4o |
| `RAZORPAY_KEY_ID` | Razorpay test/live key ID |
| `RAZORPAY_KEY_SECRET` | Razorpay key secret |
| `ADMIN_INVITE_CODE` | Shared invite code for admin registration |
| `ALLOWED_ORIGINS` | Comma-separated CORS origins |
| `PORT` | Server port (default 3001) |

## Docker Deployment

Multi-stage Dockerfile:
1. **Base**: Node 20 Alpine + pnpm
2. **Builder**: TurboRepo prune for backend workspace
3. **Installer**: Install deps, generate Prisma client, build
4. **Runner**: Non-root user (nestjs:nodejs), exposes port 3001

## Testing

- **Unit tests**: Jest with `*.spec.ts` pattern in `src/`
- **E2E tests**: Supertest with `test/jest-e2e.json` config
- **Test command**: `pnpm test` (unit), `pnpm test:e2e` (E2E)
