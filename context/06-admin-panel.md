# Admin Panel

## Overview

The admin panel is a **Next.js 15** application (port 3002) providing centralized system administration and oversight. It shares the same tech stack as the frontend dashboard but targets platform administrators.

## Tech Stack

Identical to frontend:
- Next.js 15 (Pages Router), React 19
- TailwindCSS 4 via PostCSS
- Chart.js + react-chartjs-2
- next-auth, next-i18next
- @graminate/ui, @graminate/shared
- jsPDF, xlsx for exports
- Direct PostgreSQL access via `pg` driver (has its own DB connection)

## Routing Structure

```
src/pages/
├── index.tsx               → Admin login / main dashboard
└── platform/[admin_id]/    → Admin-scoped management pages
```

All routes under `platform/[admin_id]/` require admin JWT authentication.

## Key Admin Capabilities

### User Management
- View all registered users
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

## Authentication

- Separate admin authentication flow
- Admin registration requires an invite code (`ADMIN_INVITE_CODE` env var or root-generated codes)
- JWT tokens contain `{ isAdmin: true, adminId: string, isRoot: boolean }`
- Root admins have elevated privileges

## Backend Admin API Endpoints

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

## Shared Infrastructure

The admin panel shares:
- **Components**: `@graminate/ui` component library
- **Schemas**: `@graminate/shared` Zod validation schemas
- **Layout patterns**: Similar sidebar/navbar structure to frontend
- **Styling**: Same TailwindCSS configuration
- **i18n**: Same translation system
