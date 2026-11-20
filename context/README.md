# Graminate — AI Context Documentation

This folder contains comprehensive context files designed to help AI agents quickly understand the entire Graminate codebase with minimal token consumption.

## Files

| # | File | Contents | When to Read |
|---|------|----------|--------------|
| 01 | [Project Overview](./01-project-overview.md) | What Graminate is, target users, domain modules, tech stack, quick start | **Always start here** |
| 02 | [Architecture & Monorepo](./02-architecture-and-monorepo-structure.md) | Monorepo layout, dependency graph, tooling, app structures | When navigating code or understanding relationships between packages |
| 03 | [Database Schema](./03-database-schema.md) | Complete Prisma schema with all models, relationships, enums, indexes | When working with data models, queries, or migrations |
| 04 | [Backend API](./04-backend-api.md) | All API routes, auth flow, module patterns, validation, env vars | When building or modifying backend endpoints |
| 05 | [Frontend Web App](./05-frontend-web-app.md) | Routing, components, hooks, state, i18n, charts, exports | When building or modifying frontend pages/components |
| 06 | [Admin Panel](./06-admin-panel.md) | Admin routes, capabilities, auth differences | When working on admin functionality |
| 07 | [Mobile App](./07-mobile-app.md) | Expo structure, routing, NativeWind, deployment | When building or modifying mobile screens |
| 08 | [Website](./08-website.md) | Public site pages, jobs API, marketing content | When working on the landing page or careers section |
| 09 | [AI Integration](./09-ai-integration.md) | LLM architecture, tools, access control, conversation flow | When working on the AI assistant or chat features |
| 10 | [DevOps & CI/CD](./10-devops-and-ci-cd.md) | GitHub Actions, Docker, deployment, environment config | When modifying CI/CD, Docker, or deployment config |
| 11 | [Auth & Security](./11-auth-and-security.md) | JWT auth, security measures, rate limiting, plan gating | When working on authentication or security features |
| 12 | [Features by Module](./12-key-features-by-module.md) | Detailed feature breakdown for every business domain | When implementing domain-specific features |

## Usage Guide

### For Quick Orientation
Read `01-project-overview.md` first. It gives you the entire 30,000-foot view.

### For Code Navigation
Read `02-architecture-and-monorepo-structure.md` to understand where things live and how packages relate.

### For Feature Work
1. Start with `12-key-features-by-module.md` to understand the domain
2. Read the app-specific context file (05, 06, 07, or 08)
3. Read `04-backend-api.md` if the feature touches the API
4. Read `03-database-schema.md` if the feature involves data model changes

### For Infrastructure Work
Read `10-devops-and-ci-cd.md` and `11-auth-and-security.md`.

### For AI/Chat Features
Read `09-ai-integration.md`.

## Design Principles

These files are designed to:
- **Minimize token usage**: Dense, structured information (tables, code blocks)
- **Maximize comprehension**: Complete coverage of each topic area
- **Enable quick lookup**: Clear headings, tables of contents, cross-references
- **Stay accurate**: Written from direct codebase analysis
- **Reduce exploration**: An AI agent should rarely need to read raw source files after reading these docs
