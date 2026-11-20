# Authentication & Security

## Authentication Architecture

Graminate uses a **JWT-based authentication system** with separate flows for regular users and administrators.

## User Authentication Flow

### Registration
1. Frontend sends `POST /api/user/register` with user data (validated by `usersSchema` Zod schema)
2. Backend creates user in database with **Argon2-hashed password**
3. Email verification token generated and sent via Nodemailer
4. User must verify email before full access

### Age Restriction (Frontend Validation)
- During registration, the **frontend calculates age** from the date of birth entered
- If the user is **under 18 years old**, account creation is denied
- A modal is displayed with the message: *"You need to be atleast 18 years to be able eto create an account in Graminate"*
- Calculation is done client-side using a `calculateAge` helper in `apps/frontend/src/pages/login.tsx` that accounts for whether the birthday has occurred yet this calendar year
- The registration flow is blocked before the OTP/API request is sent

### Login
1. Frontend sends `POST /api/user/login` with email + password
2. Backend validates credentials (Argon2 verify)
3. Backend creates a login history entry and sends OTP to user's email
4. Backend returns `{ success: true, login_id, message, user }` — **NO JWT yet**
5. Frontend opens OTP modal for the user to enter the 6-digit code
6. Frontend sends `POST /api/user/login-verify` with email + OTP + login_id
7. Backend verifies OTP, issues JWT with `{ userId }` payload, and returns it
8. Frontend stores JWT + user_id in localStorage and redirects to dashboard
9. Rate limited to 5 login attempts per 60 seconds

### Session Management
- JWT extracted from `Authorization: Bearer <token>` header
- `JwtStrategy` validates token and extracts user identity
- Guard: `JwtAuthGuard` (Passport-based) applied to protected routes
- Logout: `POST /api/user/logout` invalidates login session

### Password Recovery
1. User requests reset → `POST /api/password/request`
2. Token generated and stored in `password_resets` table
3. Email sent with reset link
4. User clicks link → `POST /api/password/reset` with token + new password
5. Token validated (not expired), password updated

### Email Verification
- `GET /api/email-verification/verify?token=...` — Verify email
- `POST /api/email-verification/resend` — Resend verification email

## Admin Authentication

### Registration
- Requires valid invite code (`ADMIN_INVITE_CODE` env var or root-generated)
- Creates admin with `status: "PENDING"`
- Root admins can approve and assign roles

### Login
- `POST /api/admin/login` with email + password
- JWT issued with `{ isAdmin: true, adminId, isRoot }` payload
- Separate JWT namespace from user tokens

### Roles & Permissions
- `admin_roles` table: name + permissions array
- Root admins (`is_root: true`) have unrestricted access
- Role-based permission system via permissions array

## JWT Payload Structure

```typescript
interface JwtPayload {
  isAdmin?: boolean;   // true for admin tokens
  adminId?: string;    // UUID of admin
  isRoot?: boolean;    // Root admin flag
  userId?: number;     // User ID for regular users
}
```

Exactly one of `isAdmin` or `userId` is set — never both.

## Security Measures

### Password Security
- **Hashing**: Argon2 (memory-hard, GPU-resistant)
- No plaintext passwords stored anywhere
- Password verification endpoint for sensitive operations

### CSRF Protection
- Custom CSRF middleware (`common/middlewares/csrf.middleware.ts`)
- Applied globally to all API routes
- Validates origin against allowed origins list

### HTTP Security
- **Helmet**: Sets security headers (CSP, HSTS, X-Frame-Options, etc.)
- **CORS**: Configurable via `ALLOWED_ORIGINS` env var
- **Credentials**: CORS allows credentials (cookies)

### Rate Limiting
- **Global**: 60 requests per 60 seconds (`ThrottlerModule`)
- **Login**: 5 requests per 60 seconds (`@Throttle`)
- Prevents brute force and DDoS

### Input Validation
- **Zod schemas**: All inputs validated via `@UseZodSchema` decorator
- **Global pipe**: `ZodValidationPipe` processes all requests
- **Class-validator**: Additional validation in DTOs
- **Body limits**: 1MB for JSON and URL-encoded

### Database Security
- **Parameterized queries**: Prisma ORM prevents SQL injection
- **Cascade deletes**: Intentional for user data isolation
- **UUID primary keys**: For admin and sensitive tables
- **Unique constraints**: On email, phone, Aadhar, etc.

### Authorization Pattern
- **Self-only access**: User routes verify `req.user.userId === paramId`
- **UnauthorizedException**: Thrown when user tries to access another user's data
- **Admin override**: Admin routes can access any user's data

```typescript
// Typical authorization check in controllers:
if (String(req.user.userId) !== id) throw new UnauthorizedException();
```

### Frontend Auth
- JWT stored in localStorage (not httpOnly cookie — trade-off for SPA)
- Token validated on page load (expiry check)
- Axios interceptor adds Bearer token to all API calls
- 401 responses redirect to login page

## Subscription-Based Feature Gating

### LLM Access
```typescript
if (user.plan === 'FREE') {
  throw new ForbiddenException('LLM access is not available on the Free plan.');
} else if (user.plan === 'BASIC' && queriesThisMonth >= 100) {
  throw new ForbiddenException('Monthly query limit of 100 reached.');
} else if (user.plan === 'PRO' && queriesThisMonth >= 300) {
  throw new ForbiddenException('Monthly query limit of 300 reached.');
}
```

### Plan Types
```typescript
enum user_plan_type {
  FREE   // Basic features, no AI
  BASIC  // 100 LLM queries/month
  PRO    // 300 LLM queries/month
}
```

## Environment Variables for Security

| Variable | Purpose | Sensitivity |
|----------|---------|-------------|
| `JWT_SECRET` | JWT signing/verification | 🔴 High |
| `DATABASE_URL` | PostgreSQL connection | 🔴 High |
| `OPENAI_API_KEY` | OpenAI API access | 🔴 High |
| `RAZORPAY_KEY_SECRET` | Payment verification | 🔴 High |
| `ADMIN_INVITE_CODE` | Admin registration gate | 🟡 Medium |
| `EMAIL_PASS` | Gmail app password | 🟡 Medium |
| `ALLOWED_ORIGINS` | CORS whitelist | 🟢 Low |

## Security Checklist

- [x] Argon2 password hashing
- [x] JWT-based authentication
- [x] CSRF protection middleware
- [x] Helmet security headers
- [x] CORS with configurable origins
- [x] Rate limiting (global + per-route)
- [x] Input validation (Zod + class-validator)
- [x] SQL injection prevention (Prisma ORM)
- [x] Self-only access authorization
- [x] Plan-based feature gating
- [x] Email verification flow
- [x] Password reset with expiring tokens
- [x] Docker non-root execution
- [x] GitHub Actions with minimal permissions
- [x] Pinned action SHAs in CI/CD
