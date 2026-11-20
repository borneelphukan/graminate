# @graminate/ui

> **Shared component library** for the Graminate Farm Management System.

A comprehensive UI component library built on **Radix UI primitives**, **TailwindCSS 4**, and **CVA (class-variance-authority)**. Provides 40+ accessible, themeable components used across the frontend, admin, website, and mobile apps.

## 📦 Package Info

- **Name**: `@graminate/ui`
- **Type**: Shared workspace package
- **Build**: Vite library mode (ESM output)
- **Entry**: `lib/index.ts` (development), `dist/ui.js` (production)

## 🧩 Tech Stack

| Technology | Purpose |
|-----------|---------|
| Radix UI | Headless, accessible UI primitives |
| TailwindCSS 4 | Utility-first CSS |
| CVA (class-variance-authority) | Component variant management |
| tailwind-merge | Class merging utility |
| clsx | Conditional class names |
| Lucide React | Icon library |
| Material Symbols | Additional icons |
| next-themes | Dark/light mode support |
| @tanstack/react-table | Data tables |
| react-day-picker | Date picker |
| embla-carousel-react | Carousel/slider |
| react-dropzone | File uploads |
| react-resizable-panels | Resizable layouts |
| sonner | Toast notifications |
| vaul | Drawer component |
| xlsx | Excel export |
| jsPDF + jspdf-autotable | PDF export |

## 📂 Component List

### Form Inputs
- `input.tsx` — Text input
- `textarea.tsx` — Multi-line text input
- `label.tsx` — Form labels
- `checkbox.tsx` — Checkbox
- `radio-group.tsx` — Radio button group
- `select.tsx` — Dropdown select
- `switch.tsx` — Toggle switch
- `toggle.tsx` / `toggle-group.tsx` — Toggle buttons
- `datepicker.tsx` — Date picker (react-day-picker)
- `calendar.tsx` — Calendar component
- `upload.tsx` — File upload (react-dropzone)
- `tag-input.tsx` — Tag/chip input

### Layout & Navigation
- `layout.tsx` — Layout wrapper
- `sidebar.tsx` — Sidebar navigation
- `tabs.tsx` — Tab navigation
- `breadcrumb.tsx` — Breadcrumb navigation
- `navigation-menu.tsx` — Navigation menu
- `menubar.tsx` — Menu bar
- `separator.tsx` — Visual separator

### Overlays & Modals
- `dialog.tsx` — Modal dialog
- `alert-dialog.tsx` — Alert/confirmation dialog
- `popover.tsx` — Popover
- `popup.tsx` — Popup
- `dropdown.tsx` / `dropdownMenu.tsx` — Dropdown menus
- `accordion.tsx` — Accordion/collapsible
- `button-dropdown.tsx` — Button with dropdown

### Data Display
- `table.tsx` — Data table (@tanstack/react-table)
- `card.tsx` — Content card
- `badge.tsx` — Badge/tag
- `avatar.tsx` — Avatar image
- `skeleton.tsx` — Loading skeleton
- `spinner.tsx` — Loading spinner

### Feedback
- `alert.tsx` — Alert message
- `tooltip.tsx` — Tooltip (via Radix)

### Media & Interactive
- `carousel.tsx` — Image/content carousel
- `icon.tsx` — Icon wrapper
- `searchbar.tsx` — Search input
- `segmentedControl.tsx` — Segmented control
- `stepper.tsx` — Step indicator
- `progress.tsx` — Progress bar (via Radix)
- `scroll-area.tsx` — Custom scroll area
- `aspect-ratio.tsx` — Aspect ratio container
- `collapsible.tsx` — Collapsible section
- `context-menu.tsx` — Right-click context menu

## 📦 Installation

Within the monorepo, install the latest version:

```bash
pnpm add @graminate/ui
```

### Import Styles

Import the built CSS file in your application:

```css
@import "@graminate/ui/lib/main.css";
```

Or in your app's entry point:

```typescript
import "@graminate/ui/lib/main.css";
```

## 🎨 Usage

Components follow a consistent API with variant support via CVA:

```tsx
import { Button, Input, Card, Badge } from "@graminate/ui";

function MyComponent() {
  return (
    <Card>
      <Input placeholder="Enter value..." />
      <Button variant="primary">Submit</Button>
      <Badge>Active</Badge>
    </Card>
  );
}
```

## 🏗 Development Guidelines

All components should:

- Use **Radix UI primitives** as a base for accessibility and behavior
- Follow the **shadcn/ui pattern** (copy-paste components, not a traditional library)
- Use **TailwindCSS** for styling
- Use **CVA** for variant management
- Use **tailwind-merge** + **clsx** via the `cn()` utility for class composition
- Export from `lib/index.ts` barrel file

### Component Pattern

```tsx
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center...",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground...",
        outline: "border border-input bg-background...",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
```

## 🏗 Build

```bash
pnpm build    # Build library (Vite)
pnpm dev      # Watch mode
pnpm lint     # ESLint
```

## 📦 Exports

```json
{
  ".": {
    "import": "./dist/ui.js",
    "development": "./lib/index.ts",
    "types": "./lib/index.ts"
  },
  "./lib/main.css": "./lib/main.css"
}
```

## 🔧 Utilities

### `cn()` Function

Located in `lib/utils.ts`:

```typescript
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

## 📂 Project Structure

```
lib/
├── components/           # 40+ UI components
│   ├── accordion.tsx
│   ├── alert-dialog.tsx
│   ├── avatar.tsx
│   ├── badge.tsx
│   ├── button.tsx
│   ├── calendar.tsx
│   ├── card.tsx
│   ├── checkbox.tsx
│   ├── datepicker.tsx
│   ├── dialog.tsx
│   ├── dropdown.tsx
│   ├── dropdownMenu.tsx
│   ├── icon.tsx
│   ├── input.tsx
│   ├── label.tsx
│   ├── layout.tsx
│   ├── popover.tsx
│   ├── searchbar.tsx
│   ├── select.tsx
│   ├── sidebar.tsx
│   ├── skeleton.tsx
│   ├── spinner.tsx
│   ├── switch.tsx
│   ├── table.tsx
│   ├── tabs.tsx
│   ├── tag-input.tsx
│   ├── textarea.tsx
│   ├── toggle.tsx
│   ├── upload.tsx
│   └── ...
├── hooks/                # Shared hooks
├── assets/               # Static assets
├── index.ts              # Barrel exports
├── main.css              # Global TailwindCSS styles
├── types.ts              # Shared types
├── utils.ts              # Utility functions (cn)
└── vite-env.d.ts         # Vite type declarations
```

## 🎯 TODO

- [ ] CSS linting — Enforce no hardcoded colors (use CSS variables from main.css)
- [ ] Enforce property order in CSS rules
- [ ] Add Storybook for component documentation
- [ ] Improve mobile-specific component variants
