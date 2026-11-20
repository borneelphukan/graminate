# Graminate Admin Panel

> **Next.js 15 admin dashboard** for the Graminate Farm Management System.

Centralized system administration and oversight dashboard for managing users, billing, and platform operations. Built with Next.js 15 (Pages Router), React 19, and TailwindCSS 4. Runs on port 3002.

## 🏗 Architecture

### Framework
- **Next.js 15** — Pages Router
- **React 19** — UI library
- **TailwindCSS 4** — Utility-first CSS via PostCSS
- **TypeScript** — Full type safety

### Routing
```
src/pages/
├── index.tsx               → Admin login / main dashboard
└── platform/[admin_id]/    → Admin-scoped platform management pages
```

All routes under `platform/[admin_id]/` require admin JWT authentication.

## 🧩 Tech Stack

| Technology | Purpose |
|-----------|---------|
| Next.js 15 | React framework (Pages Router) |
| React 19 | UI library |
| TailwindCSS 4 | Utility-first CSS |
| Chart.js + react-chartjs-2 | Analytics & dashboards |
| next-auth | Authentication integration |
| next-i18next | Internationalization |
| jsPDF + xlsx | Report exports |
| axios | HTTP client |
| @graminate/ui | Shared component library |
| @graminate/shared | Shared Zod schemas |
| @dnd-kit | Drag & drop |
| date-fns | Date formatting |
| pg | Direct PostgreSQL connection (admin-specific queries) |

## 🔐 Admin Authentication

### Separate Auth Flow
- Admin registration requires invite code (`ADMIN_INVITE_CODE` env var or root-generated)
- JWT payload: `{ isAdmin: true, adminId: string, isRoot: boolean }`
- Root admins (`is_root: true`) have elevated privileges
- Stored separately from user tokens

### Roles & Permissions
- `admin_roles` table with name + permissions array
- Role-based access control
- Root admin can assign roles and manage other admins

## 🎛 Admin Capabilities

### User Management
- View all registered users with search/filter
- View/edit individual user profiles
- Delete users (cascades to all their data)
- View user count statistics
- View user login history
- View user billing history
- Update user plans and settings
- Schedule user plan changes

### Platform Oversight
- Admin dashboard with analytics
- User activity monitoring
- Revenue/billing overview
- System health monitoring

## 📡 Backend API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/admin/register` | Register new admin (requires invite code) |
| POST | `/api/admin/login` | Admin login |
| GET | `/api/admin/me` | Get current admin profile |
| GET | `/api/admin/users` | List all users |
| GET | `/api/admin/users/:id` | Get specific user details |
| POST | `/api/admin/users/:id` | Update user |
| DELETE | `/api/admin/users/:id` | Delete user |
| GET | `/api/admin/users/count` | User count statistics |
| GET | `/api/admin/users/:id/login-history` | User login history |
| GET | `/api/admin/users/:id/billing-history` | User billing history |

## 📂 Project Structure

```
src/
├── pages/
│   ├── index.tsx               # Admin login / dashboard
│   └── platform/[admin_id]/    # Admin-scoped management pages
├── components/                 # Admin-specific components
├── contexts/                   # Admin context (auth, preferences)
├── hooks/                      # Admin hooks
├── layout/                     # Admin layout (sidebar, navbar)
├── lib/                        # Utilities (axiosInstance, helpers)
├── constants/                  # Admin constants
└── styles/                     # Admin styles
```

## 🔄 Shared Infrastructure

The admin panel shares with other apps:
- **@graminate/ui** — 40+ shared UI components (Radix UI, TailwindCSS)
- **@graminate/shared** — Zod validation schemas
- **Layout patterns** — Similar sidebar/navbar structure to frontend
- **Styling** — Same TailwindCSS configuration
- **i18n** — Same translation system

## 🏁 Getting Started

```bash
# From monorepo root
pnpm install

# Navigate to admin
cd apps/admin

# Create .env with:
# NEXT_PUBLIC_API_URL=http://localhost:3001/api

pnpm dev    # Start on port 3002
```

## 📜 Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server (port 3002) |
| `pnpm build` | Build for production |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |

## 🌍 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_API_URL` | ✅ | Backend API base URL |

## 🚀 Deployment

- **Platform**: Netlify (`netlify.toml` configured)
- **Build**: Next.js static/SSR
- **Deploy**: Git-triggered via Netlify
