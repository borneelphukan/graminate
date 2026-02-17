# Storybook Agents Guide

## What This App Is

`apps/storybook` is the Storybook instance used to document and preview components from `packages/ui`.

Key dependency: `@pactos/ui` (workspace package).

## Relevant ADRs

- `docs/adrs/0011-use-tailwind.md`: Tailwind is the styling baseline.
- `docs/adrs/0012-shadcn-over-radix.md`: shadcn/ui as base components for the design system.
- `docs/adrs/0013-restriction-first-component-design.md`: design system API philosophy.
- `docs/adrs/0018-use-global-prettier-config.md`: formatting consistency.

## Directory Structure

```text
apps/storybook/
  .storybook/
    main.ts              # Storybook config
    preview.ts           # global decorators/parameters
    main.css             # Storybook-specific styles
  package.json
  tsconfig.json
```

## Running Locally

From repo root:

- `pnpm dev:storybook`

From this app:

- `pnpm --filter @pactos/storybook dev`

## Conventions

- Stories should prefer importing components from `@pactos/ui`.
- If a component story requires new mock data or utilities, consider placing it in `packages/ui` so it’s reusable.

## Lessons Learned (Update When We Fix A Codegen Bug)

Add entries here when a bug or incident was caused by generated code so future work avoids repeating it.
