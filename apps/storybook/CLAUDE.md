# CLAUDE.md — storybook

Storybook instance for previewing and documenting `@pactos/ui` components. See also: `AGENTS.md` (full reference), root `CLAUDE.md` (monorepo-wide conventions).

---

## Stack

- Storybook, consuming `@pactos/ui` (workspace package)
- Tailwind CSS + shadcn/ui design system

---

## Directory Map

```text
.storybook/
  main.ts              # Storybook config
  preview.ts           # global decorators / parameters
  main.css             # Storybook-specific styles
```

---

## Rules for Claude

1. **Stories import from `@pactos/ui`** — never duplicate a component locally just to story it.
2. **Mock data and test utilities** that could be reused across stories belong in `packages/ui`, not here.
3. Follow the design system API philosophy from ADR 0013 (restriction-first component design).

---

## Running

```sh
# From repo root
pnpm dev:storybook

# From this app
pnpm --filter @pactos/storybook dev
```

---

## Lessons Learned

_Add entries here when a recurring bug or gotcha is identified during development._
