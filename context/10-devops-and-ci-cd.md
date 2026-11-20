# DevOps & CI/CD

## CI/CD Pipeline Overview

Graminate uses **GitHub Actions** for continuous integration and deployment, with separate workflows for different components.

## Workflows

### 1. CI Pipeline (`ci.yml`)
**Trigger**: Push to `main`, all pull requests

**What it does**:
1. Sets up PostgreSQL 15 service container
2. Installs Node.js 20, pnpm 8.15.3
3. Runs `pnpm install --frozen-lockfile`
4. Generates Prisma client (`prisma generate`)
5. Pushes schema to test database (`prisma db push`)
6. Runs TurboRepo pipeline: `lint`, `typecheck`, `test`, `build`
7. For PRs: only checks affected packages (`--filter=...[origin/main]`)

**Environment**:
- PostgreSQL: `graminate_test` database
- Dummy env vars for: Google Maps, Razorpay, JWT secret, OpenAI key
- 15-minute timeout

**Security**:
- Minimal permissions (`contents: read`)
- Pinned action SHAs for reproducibility

### 2. Backend CD Pipeline (`cd-backend.yml`)
**Trigger**: Push to `main` when `apps/backend/**`, `packages/**`, or root config changes

**What it does**:
1. Install dependencies
2. Run Prisma migrations on production database (`prisma migrate deploy`)
3. Trigger webhook deployment (`BACKEND_DEPLOY_HOOK_URL`)

**Secrets**:
- `PRODUCTION_DATABASE_URL` — Production DB connection
- `BACKEND_DEPLOY_HOOK_URL` — Deployment webhook (e.g., Render, Railway)

### 3. Mobile CD Pipeline (`cd-mobile.yml`)
**Trigger**: Push to `main` when `apps/mobile/**` or `packages/**` change, or manual dispatch

**What it does**:
1. Setup EAS CLI with `EXPO_TOKEN`
2. Initialize EAS project
3. Run `eas build` for selected platform/profile

**Manual Dispatch Options**:
- `profile`: development | preview | production
- `platform`: all | ios | android

### 4. Mobile EAS Update (`eas-update.yml`)
**Trigger**: Push to `main` when `apps/mobile/**` or `packages/**` change, or manual dispatch

**What it does**:
1. Setup EAS CLI
2. Run `eas update` on `main` branch (OTA update)

**Purpose**: Lightweight JS bundle updates without full rebuild. Used for quick fixes and content changes.

## Docker

### Backend Dockerfile
Multi-stage build optimized for production:

```
Stage 1 (base):     Node 20 Alpine + pnpm + libc6-compat
Stage 2 (builder):  TurboRepo prune for backend workspace
Stage 3 (installer): Install deps + generate Prisma + build
Stage 4 (runner):   Non-root user (nestjs:nodejs), exposes 3001
```

Key features:
- Uses `turbo prune --docker` to isolate backend workspace
- Generates Prisma client in build stage
- Non-root execution for security
- Single image contains backend + shared packages

## Deployment Architecture

### Backend
- **Platform**: Likely Render/Railway/Fly.io (webhook-triggered)
- **Database**: Managed PostgreSQL
- **Container**: Docker (via Dockerfile)

### Frontend
- **Platform**: Netlify (has `netlify.toml`)
- **Build**: Next.js static/SSR
- **Deploy**: Git-triggered

### Admin
- **Platform**: Netlify (has `netlify.toml`)
- **Build**: Next.js static/SSR

### Website
- **Platform**: Netlify (has `netlify.toml`)
- **Build**: Next.js static/SSR

### Mobile
- **Platform**: EAS (Expo Application Services)
- **Distribution**: App Store / Google Play via EAS Build
- **OTA Updates**: EAS Update on `main` branch

## Environment Configuration

### Backend (`.env`)
```env
DATABASE_URL="postgresql://user:pass@host:5432/graminate"
NESTJS_API_URL=http://localhost:3001
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
JWT_SECRET=generate-a-long-random-secret
OPENAI_API_KEY=sk-your-key
RAZORPAY_KEY_ID=rzp_test_xxx
RAZORPAY_KEY_SECRET=your-razorpay-secret
ADMIN_INVITE_CODE=generate-a-long-random-invite-code
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
PORT=3001
```

### Frontend (`.env`)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-key
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxx
```

### Mobile (`.env`)
```env
API_URL=http://localhost:3001/api
```

## GitHub Security Practices

- **Dependabot** (`.github/dependabot.yml`) — Automated dependency updates
- **Pinned action SHAs** — All GitHub Actions use commit SHA references
- **Least privilege** — `contents: read` permissions
- **Timeout limits** — 15-30 minutes per job
- **Secrets management** — Via GitHub repository secrets

## API Testing with Bruno

The `bruno/` directory contains API request collections organized by module:
```
bruno/
├── 00-Health/          → Health check
├── 01-Auth/
│   ├── User/           → User endpoints (register, login, profile, notifications, etc.)
│   ├── Admin/          → Admin endpoints
│   └── Email Verification/
└── 02-Waitlist/        → Waitlist endpoints
```

Generated via `scripts/generate-bruno.js`.
