# Public Website

## Overview

The public-facing marketing website built with **Next.js 15** (port 3003). Serves as the landing page, showcases products and technology, collects waitlist signups, and handles job postings.

## Tech Stack

| Technology | Purpose |
|-----------|---------|
| Next.js 15 | React framework (Pages Router) |
| React 19 | UI library |
| TailwindCSS 4 | Styling |
| Framer Motion | Animations (scroll, entrance) |
| Font Awesome | Icons (brands, solid) |
| @headlessui/react | Accessible UI primitives |
| @graminate/ui | Shared component library |
| Nodemailer | Contact form email |
| PostgreSQL (pg) | Direct DB access for jobs, waitlist |

## Routing Structure

```
src/pages/
├── index.tsx           → Landing page (hero, features, testimonials)
├── contact.tsx         → Contact form (sends email via Nodemailer)
├── technology.tsx      → Technology showcase page
├── waitlist.tsx        → Waitlist signup form
├── company/            → Company information pages
├── products/           → Product showcase pages
└── api/
    └── jobs/
        ├── jobs.ts     → List/create job listings
        ├── apply.ts    → Submit job application (with CV upload)
        └── candidate.ts → Candidate/application management
```

## Pages

### Landing Page (`index.tsx`)
- Hero section with animated entrance (Framer Motion)
- Feature highlights for each platform module
- Testimonials / social proof
- Call-to-action sections
- Footer with links

### Contact (`contact.tsx`)
- Contact form with name, email, message
- Submits via EmailJS (`@emailjs/browser`) or server-side Nodemailer
- Success/error feedback

### Technology (`technology.tsx`)
- Showcases the technology stack
- Platform architecture overview
- Integration highlights

### Waitlist (`waitlist.tsx`)
- Waitlist signup form (first_name, last_name, email, phone, role)
- Posts to backend `/api/waitlist/join`
- Email validation and duplicate checking

### Company (`company/`)
- About the company
- Mission and vision
- Team information

### Products (`products/`)
- Product feature showcases
- Module-specific detail pages
- Pricing highlights

## API Routes

### Jobs API (`/api/jobs/`)

**jobs.ts** — Job listing endpoints:
- `GET`: List all job postings
- `POST`: Create new job posting (admin)

**apply.ts** — Job application:
- `POST`: Submit application with CV file upload
- Fields: first_name, last_name, email, phone, portfolio, cv_file
- Stores CV file path in database

**candidate.ts** — Candidate management:
- `GET`: List applications for a job
- Admin-only access

## Component Organization

```
src/components/
├── cards/          → Feature cards, product cards
├── layout/         → Header, footer, navigation
├── others/         → Misc components (CTA buttons, badges)
├── sections/       → Landing page sections (hero, features, testimonials)
└── ui/             → Basic UI components
```

## Styling & Animations

- **TailwindCSS 4**: Consistent with other apps
- **Framer Motion**: Smooth scroll-triggered animations, page transitions
- **Font Awesome**: Brand icons (social media), solid icons for features
- **Headless UI**: Accessible dropdowns, modals, transitions

## State Management

- `src/stores/` — Lightweight state stores
- `src/contexts/` — React contexts for shared state
- `src/config/` — Site configuration constants

## Internationalization

- `src/translations/` — Translation files
- Multi-language support for marketing content

## Key Differentiators from Other Apps

| Feature | Website | Frontend/Admin |
|---------|---------|----------------|
| Auth | None (public) | JWT required |
| Purpose | Marketing, lead gen | Farm operations |
| Animations | Heavy (Framer Motion) | Minimal |
| Data Access | Direct DB (jobs, waitlist) | Via backend API |
| Complexity | Static + forms | Full CRUD SPA |
