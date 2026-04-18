# Pactos component library

This is the component library for pactos according to the [design system](https://www.figma.com/design/75aVgx2wCAUUBBN45bjMBP/Pactos-Design-System).

## Installation

It can be used within the monorepo by installing the latest version:

```bash
npm install @pactos/ui
```

Additionally it is also important to import the built css file in the application.

```css
@import "@pactos/ui/lib/main.css";
```

## Guidelines

All components should:

- use [radix-ui primitives](https://www.radix-ui.com/primitives/docs/overview/introduction) as a base

TODOS:

1. Css linting. The css should not include colors etc. that are defined in main.css. Also it might make sense to enforce the order of properties in css rules.
