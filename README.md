# Graminate Farm Management System
> **Comprehensive Digital Agriculture Platform** connecting farm operations, financial management, and workforce coordination into a unified ecosystem.

Graminate is a monorepo-based full-stack application designed to streamline agricultural processes. It provides specialized modules for livestock management (Bee Keeping, Cattle, Poultry), resource tracking (Warehouses), and enterprise operations (CRM, Finance, HR).

## 🚀 Key Features

### 🌱 Agricultural Operations
- **Bee Keeping Management**: Track hive health, production, and apiary status.
- **Livestock Tracking**: Manage Cattle and Poultry lifecycles, health records, and productivity.
- **Warehouse Management**: comprehensive inventory control for produce and supplies.
- **Weather Integration**: Real-time updates via OpenMeteo for informed decision-making.

### 💼 Enterprise Management
- **CRM**: Customer relationship management tailored for agricultural sales.
- **Finance & Payments**: Integrated financial tracking with Razorpay support.
- **Employee Management**: Workforce coordination and payroll.
- **Admin Dashboard**: Centralized control for platform administrators.

### 🤖 Intelligent Features
- **AI Integration**: Powered by OpenAI for intelligent insights and automation.
- **Analytics**: Data visualization using Chart.js for actionable business intelligence.

## 🏗 Project Structure

This project is built using [TurboRepo](https://turbo.build/) and managed with [pnpm](https://pnpm.io/).

### Apps
| Directory | Name | Type | Description |
|-----------|------|------|-------------|
| `apps/frontend` | **Dashboard** | Next.js | Main user interface for farm managers and staff. |
| `apps/backend` | **API Server** | NestJS | Core business logic, database interactions, and integrations. |
| `apps/mobile` | **Mobile App** | Expo | Mobile interface for on-the-field operations. |
| `apps/admin` | **Admin Panel** | Next.js | System administration and oversight dashboard. |
| `apps/website` | **Landing Page** | Next.js | Public-facing marketing website. |

### Packages
- `packages/ui`: Shared UI components and design system.
- `packages/shared`: Shared utilities, types, and configurations.

## 🛠 Tech Stack

- **Monorepo**: TurboRepo, pnpm
- **Frontend**: React, Next.js, TailwindCSS
- **Backend**: NestJS, Prisma ORM, PostgreSQL
- **Mobile**: React Native, Expo
- **Database**: PostgreSQL
- **Authentication**: NextAuth.js (Frontend), Passport/JWT (Backend)
- **Email**: Nodemailer, MJML

## 🏁 Getting Started

### Prerequisites
- Node.js (Latest LTS recommended)
- pnpm (`npm install -g pnpm`)
- PostgreSQL Database

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/borneelphukan/graminate.git
   cd graminate
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Environment Setup:**
   Create `.env` files in the respective application directories (`apps/backend`, `apps/frontend`, etc.) based on the examples provided or required configurations (Database URL, API Keys).

4. **Database Setup:**
   Navigate to the backend and apply migrations:
   ```bash
   cd apps/backend
   pnpm prisma migrate dev
   ```

### Running the Project

Start the development server for all apps:

```bash
pnpm dev
```

This will launch the TurboRepo pipeline. By default:
- **Frontend**: http://localhost:3000
- **Admin**: http://localhost:3002
- **Website**: http://localhost:3003
- **Backend API**: http://localhost:3001 (or configured port)

## 📜 Scripts

Run these commands from the root directory:

- `pnpm build` - Build all applications and packages.
- `pnpm dev` - Start development servers.
- `pnpm lint` - Run ESLint across the codebase.
- `pnpm format` - Format code with Prettier.
- `pnpm clean` - Remove `node_modules`.

## 🤝 Contributing

Contributions are welcome! Please ensure you follow the established code style and commit conventions.

## 📄 License

This project is private and proprietary.
