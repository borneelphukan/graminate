# Graminate Repository Guide & Rules for Gemini

This file serves as the core context for Gemini when navigating and assisting with the Graminate Farm Management System. It outlines the codebase structure, development workflow, and strict repository rules.

## 🏗 Project Architecture & Tooling
- **Structure**: Monorepo managed with **TurboRepo** and **pnpm**.
- **Apps** (`apps/` directory):
  - `frontend` (Next.js 15, React 19) - Main web dashboard for farm managers. Runs on Port `3000`.
  - `backend` (NestJS 11) - Core API server utilizing Prisma ORM and PostgreSQL. Runs on Port `3001`.
  - `admin` (Next.js 15, React 19) - Centralized system administration panel. Runs on Port `3002`.
  - `website` (Next.js 15, React 19) - Public-facing landing/marketing page. Runs on Port `3003`.
  - `mobile` (Expo, React Native 0.81) - Mobile application for field operations.
- **Packages** (`packages/` directory):
  - `ui` - Shared design system and components built with TailwindCSS 4, Radix UI primitives, and Lucide icons.
  - `shared` - Shared TypeScript definitions, utility functions, and Zod schemas used across the stack.

## 💻 Development Workflow
- **Running the Stack**: Use `pnpm dev` at the root level. TurboRepo will concurrently start the backend API, frontends, admin, and website.
- **Database Migrations**: Navigate to `apps/backend` and run `pnpm prisma migrate dev` to apply schema changes.
- **Workspace Commands**: `pnpm build`, `pnpm lint`, `pnpm format` (Prettier), and `pnpm clean` are available from the root.

## 🚨 Strict Rules for Gemini (Repository-Specific)
When working on the Graminate repository, Gemini **MUST** always adhere to the following guidelines without exception:
1. **No Documentation**: Do not write or generate any code documentations (e.g., JSDoc, inline comments explaining the code, etc.).
2. **No Browser Execution**: Do not attempt to run or open the browser for testing or validation purposes.