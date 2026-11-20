# Database Schema

## Overview

- **Database**: PostgreSQL (version 15+ in CI)
- **ORM**: Prisma 7 (with `@prisma/adapter-pg` driver)
- **Schema file**: `apps/backend/prisma/schema.prisma`
- **Client generation**: Automatic via `pnpm prisma generate` (part of backend predev)
- **Migrations**: `pnpm prisma migrate dev` (dev), `pnpm prisma migrate deploy` (prod)

## Entity Relationship Overview

```
users (central entity)
├── apiculture → bee_hives → [hive_inspection, honey_production]
├── cattle_rearing → cattle_milk
├── poultry_flock → [poultry_eggs, poultry_feeds, poultry_health]
├── floriculture → flower_watering
├── warehouse → inventory → marketplace_products
├── marketplace_products → [marketplace_favorites, marketplace_wishlist, marketplace_cart, marketplace_order_items]
├── marketplace_orders → marketplace_order_items
├── companies, contacts, contracts (CRM)
├── sales → invoices → invoice_items
├── expenses
├── loans
├── labours → labour_payments
├── tasks
├── kanban_columns
├── notifications
├── payments (Razorpay)
├── login_history
├── bank_details
└── password_resets

admin → admin_roles

jobs → job_applications

waitlist (standalone)
```

## Core Models

### users
The central entity. All domain data belongs to a user via `user_id` foreign key with cascade deletes.

| Field | Type | Notes |
|-------|------|-------|
| `user_id` | Int (auto) | Primary key |
| `first_name` | VarChar(50) | |
| `last_name` | VarChar(50) | |
| `email` | VarChar(100) | Unique |
| `phone_number` | VarChar(20) | Unique |
| `business_name` | VarChar(100)? | |
| `password` | VarChar(255) | Argon2 hashed |
| `type` | VarChar(50)? | User type classification |
| `sub_type` | String[] | Array of sub-type tags |
| `plan` | user_plan_type | FREE / BASIC / PRO |
| `subscription_expires_at` | Timestamp? | |
| `pending_plan` | user_plan_type? | Scheduled downgrade target |
| `darkMode` | Boolean | Default false |
| `widgets` | String[] | Dashboard widget configuration |
| `language` | VarChar(50)? | Default "English" |
| `time_format` | VarChar(10)? | "24-hour" default |
| `temperature_scale` | VarChar(15)? | "Celsius" default |
| `opening_balance` | Decimal(15,2) | Financial opening balance |
| `business_size` | VarChar(50)? | |
| `entity_type` | VarChar(50)? | |
| `email_verified` | Boolean | Default false |
| `llm_queries_this_month` | Int | LLM usage counter |
| `llm_queries_reset_at` | Timestamp? | Monthly reset timestamp |
| `country` | VarChar(100)? | |

### admin

| Field | Type | Notes |
|-------|------|-------|
| `admin_id` | UUID | dbgenerated gen_random_uuid() |
| `first_name` | VarChar(100) | |
| `last_name` | VarChar(100) | |
| `email` | VarChar(255) | Unique |
| `password` | String | |
| `is_root` | Boolean | Root admin flag |
| `status` | VarChar(20) | Default "PENDING" |
| `role_id` | Int? | FK to admin_roles |

### admin_roles

| Field | Type | Notes |
|-------|------|-------|
| `role_id` | Int (auto) | Primary key |
| `name` | VarChar(50) | Unique role name |
| `permissions` | String[] | Array of permission strings |

## Agricultural Domain Models

### Apiculture (Bee Keeping)

**apiculture** — An apiary (bee yard) owned by a user.

| Field | Type | Notes |
|-------|------|-------|
| `apiary_id` | Int (auto) | |
| `user_id` | Int | FK to users (cascade) |
| `apiary_name` | VarChar(100) | |
| `area` | Float? | |
| `address_line_1/2`, `city`, `state`, `postal_code` | VarChar | Location data |

**bee_hives** — Individual hives within an apiary.

| Field | Type | Notes |
|-------|------|-------|
| `hive_id` | Int (auto) | |
| `apiary_id` | Int | FK to apiculture (cascade) |
| `hive_name`, `hive_type`, `bee_species` | VarChar | |
| `installation_date` | Date? | |
| `ventilation_status` | VarChar(50)? | |
| `honey_capacity` | Float? | |
| `unit` | VarChar(20)? | |
| `notes` | String? | |

**hive_inspection** — Periodic health/status inspections.

| Field | Type | Notes |
|-------|------|-------|
| `inspection_id` | Int (auto) | |
| `hive_id` | Int | FK to bee_hives (cascade) |
| `inspection_date` | Date | |
| `queen_status`, `brood_pattern` | VarChar(30)? | |
| `symptoms` | String[] | |
| `population_strength` | VarChar(30)? | |
| `frames_of_brood`, `frames_of_nectar_honey`, `frames_of_pollen` | Int? | |
| `varroa_mite_method`, `varroa_mite_count` | VarChar(50)?, Int? | |
| `actions_taken` | String? | |
| `queen_cells_observed`, `room_to_lay` | VarChar? | |

**honey_production** — Harvest records.

| Field | Type | Notes |
|-------|------|-------|
| `harvest_id` | Int (auto) | |
| `hive_id` | Int | FK to bee_hives (cascade) |
| `harvest_date` | Date | |
| `honey_weight` | Float | |
| `frames_harvested` | Int? | |
| `honey_type` | VarChar(100)? | |

### Cattle

**cattle_rearing** — Livestock groups.

| Field | Type | Notes |
|-------|------|-------|
| `cattle_id` | Int (auto) | |
| `user_id` | Int | FK to users |
| `cattle_name`, `cattle_type` | String | |
| `number_of_animals` | Int | |
| `purpose` | String? | |

**cattle_milk** — Milk production records.

| Field | Type | Notes |
|-------|------|-------|
| `milk_id` | Int (auto) | |
| `cattle_id` | Int | FK to cattle_rearing |
| `user_id` | Int | FK to users |
| `date_collected` | Date | |
| `milk_produced` | Decimal(10,2) | |

### Poultry

**poultry_flock** — Flock groups.

| Field | Type | Notes |
|-------|------|-------|
| `flock_id` | Int (auto) | |
| `user_id` | Int | FK to users |
| `flock_name`, `flock_type` | String | |
| `quantity` | Int | Number of birds |
| `breed`, `source`, `housing_type` | VarChar? | |

**poultry_eggs** — Egg collection and grading (Indian sizing standards).

| Field | Type | Notes |
|-------|------|-------|
| `egg_id` | Int (auto) | Indexed on date_collected, flock_id, user_id |
| `user_id` | Int | FK to users |
| `flock_id` | Int | FK to poultry_flock |
| `date_collected` | Date | |
| `small_eggs`, `medium_eggs`, `large_eggs`, `extra_large_eggs` | Int | Default 0 |
| `total_eggs`, `broken_eggs` | Int | Default 0 |

**poultry_feeds** — Feed tracking.

| Field | Type | Notes |
|-------|------|-------|
| `feed_id` | Int (auto) | |
| `flock_id` | Int | FK to poultry_flock |
| `feed_given` | VarChar(100) | Feed type/name |
| `amount_given` | Decimal(8,2) | |
| `units` | VarChar(50) | |
| `feed_date` | Date | |

**poultry_health** — Veterinary health records.

| Field | Type | Notes |
|-------|------|-------|
| `poultry_health_id` | Int (auto) | |
| `flock_id` | Int | FK to poultry_flock |
| `veterinary_name` | VarChar(255)? | |
| `total_birds`, `birds_vaccinated` | Int | |
| `vaccines_given`, `symptoms`, `medicine_approved` | String[] | Arrays |
| `next_appointment` | Date? | |

### Floriculture

**floriculture** — Flower cultivation records.

| Field | Type | Notes |
|-------|------|-------|
| `flower_id` | Int (auto) | |
| `user_id` | Int | |
| `flower_name`, `flower_type` | String | |
| `method` | VarChar(50)? | |
| `planting_date` | Date? | |
| `plants` | Int? | |

**flower_watering** — Watering schedule tracking.

| Field | Type | Notes |
|-------|------|-------|
| `watering_id` | Int (auto) | |
| `flower_id` | Int | FK to floriculture (cascade) |
| `user_id` | Int | |
| `watering_date` | Date | Unique per flower |
| `watered` | Boolean | Default false |

## Enterprise / Business Models

### Warehouses & Inventory

**warehouse** — Storage facilities.

| Field | Type | Notes |
|-------|------|-------|
| `warehouse_id` | Int (auto) | |
| `user_id` | Int? | |
| `name` | VarChar(100) | |
| `type`, `category` | VarChar(50/100)? | |
| `address_line_1/2`, `city`, `state`, `postal_code`, `country` | VarChar | |
| `contact_person`, `phone` | VarChar? | |

**inventory** — Items stored in warehouses.

| Field | Type | Notes |
|-------|------|-------|
| `inventory_id` | Int (auto) | Indexed on item_group, user_id |
| `user_id` | Int? | |
| `item_name`, `item_group` | VarChar(100) | |
| `units` | VarChar(50) | |
| `quantity` | Int | |
| `price_per_unit` | Decimal(10,2) | |
| `warehouse_id` | Int? | FK to warehouse (cascade) |
| `minimum_limit` | Int? | Low stock threshold |
| `feed` | Boolean | Default false (is it feed?) |

### CRM

**contacts** — CRM contacts (has check constraints).

| Field | Type | Notes |
|-------|------|-------|
| `contact_id` | Int (auto) | |
| `user_id` | Int? | |
| `first_name`, `last_name` | VarChar(50) | |
| `email`, `phone_number` | VarChar | |
| `type` | VarChar(50)? | Contact classification |
| Full address fields | | |

**companies** — Business entities.

| Field | Type | Notes |
|-------|------|-------|
| `company_id` | Int (auto) | |
| `company_name` | VarChar(100) | |
| `contact_person`, `email`, `phone_number`, `type`, `industry`, `website` | VarChar? | |
| Full address fields | | |

**contracts** — Business contracts with stages.

| Field | Type | Notes |
|-------|------|-------|
| `contract_id` | Int (auto) | |
| `contract_name` | VarChar(100) | |
| `partner` | VarChar(50) | |
| `amount` | Decimal(10,2) | |
| `stage` | VarChar(50) | Pipeline stage |
| `start_date`, `end_date` | Date | |
| `category` | VarChar(100)? | |
| `priority` | VarChar(20) | Default "Medium" |

### Finance

**sales** — Sales records.

| Field | Type | Notes |
|-------|------|-------|
| `sales_id` | Int (auto) | |
| `user_id` | Int | |
| `sales_date` | Date | |
| `sales_name` | VarChar(255)? | |
| `occupation` | VarChar(100)? | |
| `items_sold` | String[] | Items array |
| `quantities_sold` | Int[] | Parallel quantities array |
| `prices_per_unit` | Decimal(10,2)[] | Parallel prices array |
| `quantity_unit` | VarChar(50)? | |
| `invoice_created` | Boolean? | Default false |

**invoices** — Generated invoices linked to sales.

| Field | Type | Notes |
|-------|------|-------|
| `invoice_id` | Int (auto) | |
| `sales_id` | Int? | Unique FK to sales |
| `user_id` | Int? | |
| `title`, `bill_to` | VarChar(100) | |
| `due_date` | Date | |
| `receipt_number` | VarChar(50)? | Unique |
| `tax`, `discount`, `shipping` | Decimal(10,2)? | |
| Full billing address fields | | |

**invoice_items** — Line items on invoices.

| Field | Type | Notes |
|-------|------|-------|
| `item_id` | Int (auto) | |
| `invoice_id` | Int | FK to invoices (cascade) |
| `description` | String? | |
| `quantity` | Decimal | Default 1 |
| `rate` | Decimal(10,2) | Default 0 |

**expenses** — Expense tracking.

| Field | Type | Notes |
|-------|------|-------|
| `expense_id` | Int (auto) | Indexed on date_created, user_id |
| `user_id` | Int | |
| `title` | VarChar(255) | |
| `occupation`, `category` | VarChar(100) | |
| `expense` | Decimal(10,2) | Amount |
| `date_created` | Date | |

**loans** — Loan tracking.

| Field | Type | Notes |
|-------|------|-------|
| `loan_id` | Int (auto) | |
| `user_id` | Int | |
| `loan_name`, `lender` | VarChar(100) | |
| `amount` | Decimal(10,2) | |
| `interest_rate` | Decimal(5,2) | |
| `start_date` | Date | |
| `end_date` | Date? | |
| `status` | VarChar(20) | Default "Active" |

### HR / Labour

**labours** — Employee database (has check constraints).

| Field | Type | Notes |
|-------|------|-------|
| `labour_id` | Int (auto) | |
| `user_id` | Int? | |
| `full_name` | VarChar(100) | |
| `date_of_birth` | Date | |
| `gender` | VarChar(10) | |
| `contact_number` | VarChar(15) | |
| `aadhar_card_number` | VarChar(12) | Unique, indexed |
| `ration_card`, `pan_card`, `driving_license`, `mnrega_job_card_number` | VarChar? | Unique government IDs |
| `epfo`, `esic` | VarChar? | Unique social security IDs |
| `bank_account_number`, `ifsc_code`, `bank_name`, `bank_branch` | VarChar? | |
| `disability_status` | Boolean? | |
| `pm_kisan` | Boolean? | Government scheme |
| `role` | VarChar(50) | Default "Worker" |
| `base_salary` | Decimal(10,2) | Default 0.00 |
| `bonus`, `overtime_pay`, `housing_allowance`, `travel_allowance`, `meal_allowance` | Decimal(10,2)? | |
| `payment_frequency` | VarChar(20) | Default "Monthly" |

**labour_payments** — Payroll records.

| Field | Type | Notes |
|-------|------|-------|
| `payment_id` | Int (auto) | |
| `labour_id` | Int | FK to labours (cascade) |
| `payment_date` | Date | |
| `salary_paid`, `bonus`, `overtime_pay` | Decimal(10,2) | |
| `housing_allowance`, `travel_allowance`, `meal_allowance` | Decimal(10,2) | |
| `total_amount` | Decimal(10,2) | |
| `payment_status` | VarChar(20)? | Default "Pending" |

### Tasks

**tasks** — User task management.

| Field | Type | Notes |
|-------|------|-------|
| `task_id` | Int (auto) | |
| `user_id` | Int | |
| `project` | VarChar(100) | Project grouping |
| `task` | VarChar(255)? | |
| `status`, `priority` | VarChar? | |
| `description` | String? | |
| `deadline` | Date? | |

**kanban_columns** — Custom kanban board columns.

| Field | Type | Notes |
|-------|------|-------|
| `column_id` | Int (auto) | |
| `user_id` | Int | |
| `project` | VarChar(100) | Indexed with user_id |
| `title` | VarChar(100) | |
| `position` | Int | Default 0 |

### Marketplace

**marketplace_products** — Product listings.

| Field | Type | Notes |
|-------|------|-------|
| `product_id` | Int (auto) | Indexed on user_id, category, status |
| `user_id` | Int | Producer/seller |
| `inventory_id` | Int? | Optional link to inventory |
| `name` | VarChar(255) | |
| `description` | String? | |
| `category` | VarChar(100) | |
| `price` | Decimal(10,2) | |
| `units` | VarChar(50) | |
| `quantity` | Int | Default 1 |
| `images` | String[] | |
| `status` | marketplace_product_status | DRAFT/PUBLISHED/SOLD_OUT/ARCHIVED |

**marketplace_favorites**, **marketplace_wishlist** — User-product relationships.
- Both have unique constraint on `(user_id, product_id)`.

**marketplace_cart** — Shopping cart.
- Unique constraint on `(user_id, product_id)`, with quantity field.

**marketplace_orders** — Buyer orders with Razorpay integration.

| Field | Type | Notes |
|-------|------|-------|
| `order_id` | Int (auto) | |
| `buyer_id` | Int | FK to users |
| `razorpay_order_id` | VarChar(255) | |
| `razorpay_payment_id` | VarChar(255)? | |
| `total_amount`, `cgst`, `sgst` | Decimal(15,2) | |
| `status` | marketplace_order_status | PENDING→PAID→SHIPPED→DELIVERED→RELEASED or CANCELLED |
| `paid_at`, `shipped_at`, `delivered_at`, `released_at` | Timestamp? | Lifecycle timestamps |

**marketplace_order_items** — Line items in orders (per producer).

| Field | Type | Notes |
|-------|------|-------|
| `order_item_id` | Int (auto) | |
| `order_id` | Int | FK to marketplace_orders |
| `product_id` | Int | FK to marketplace_products |
| `producer_id` | Int | FK to users (the seller) |
| `quantity` | Int | |
| `unit_price` | Decimal(10,2) | |
| `escrow_released` | Boolean | Default false |

### Payments

**payments** — Razorpay subscription payments.

| Field | Type | Notes |
|-------|------|-------|
| `payment_id` | Int (auto) | |
| `user_id` | Int | |
| `razorpay_order_id` | VarChar(255) | Indexed |
| `razorpay_payment_id`, `razorpay_signature` | VarChar(255)? | |
| `amount` | Int | In paise |
| `currency` | VarChar(10) | |
| `status` | payment_status | PENDING/SUCCESS/FAILED |
| `plan_type` | user_plan_type | FREE/BASIC/PRO |

**bank_details** — User payment card storage.

| Field | Type | Notes |
|-------|------|-------|
| `bank_id` | Int (auto) | |
| `user_id` | Int | Unique (one card per user) |
| `cardholder_name` | VarChar(255) | |
| `card_number` | VarChar(50) | |
| `expiry_date` | VarChar(10) | MM/YY format |
| `card_type` | VarChar(50)? | Visa, Mastercard, etc. |

### Notifications

**notifications** — In-app notifications.

| Field | Type | Notes |
|-------|------|-------|
| `notification_id` | Int (auto) | Indexed on user_id |
| `user_id` | Int | |
| `title` | VarChar(255) | |
| `message` | String | |
| `type` | VarChar(50) | Default "info" |
| `is_read` | Boolean | Default false |

### Auth Support

**login_history** — User login/logout tracking.

| Field | Type | Notes |
|-------|------|-------|
| `login_id` | UUID | dbgenerated |
| `user_id` | Int | Indexed |
| `logged_in_at`, `logged_out_at` | Timestamp? | |

**password_resets** — Password reset tokens.

| Field | Type | Notes |
|-------|------|-------|
| `email` | VarChar(100) | PK, FK to users.email |
| `token` | VarChar(255) | |
| `expires_at` | Timestamp | |

### Other

**jobs** — Public job listings (for website careers section).

| Field | Type | Notes |
|-------|------|-------|
| `id` | Int (auto) | |
| `position` | VarChar(255) | |
| `type`, `mode` | VarChar(50) | |
| `description` | String | |
| `tasks`, `requirements`, `benefits` | String[] | |

**job_applications** — Applications for jobs.

| Field | Type | Notes |
|-------|------|-------|
| `id` | Int (auto) | |
| `job_id` | Int | FK to jobs (cascade) |
| `first_name`, `last_name` | VarChar(100) | |
| `email` | VarChar(255) | Unique |
| `phone` | VarChar(15) | |
| `portfolio` | VarChar(255)? | |
| `cv_file` | String | File path |

**waitlist** — Pre-launch waitlist signups.

| Field | Type | Notes |
|-------|------|-------|
| `id` | Int (auto) | |
| `first_name`, `last_name` | VarChar(100) | |
| `email` | VarChar(255) | Unique |
| `phone` | VarChar(20)? | |
| `role` | VarChar(50) | |

## Enums

```prisma
enum marketplace_order_status { PENDING, PAID, SHIPPED, DELIVERED, RELEASED, CANCELLED }
enum marketplace_product_status { DRAFT, PUBLISHED, SOLD_OUT, ARCHIVED }
enum payment_status { PENDING, SUCCESS, FAILED }
enum user_plan_type { FREE, BASIC, PRO }
```

## Key Indexes

- `idx_expenses_date_created`, `idx_expenses_user_id`
- `idx_hive_inspection_hive_id`, `idx_honey_production_hive_id`
- `idx_inventory_item_group`, `idx_inventory_user_id`
- `idx_poultry_eggs_*` (date_collected, flock_id, user_id)
- `idx_poultry_feeds_*` (feed_date, flock_id, user_id)
- `idx_poultry_health_*` (flock_id, user_id)
- `idx_sales_*` (sales_name, user_id)
- `idx_labour_aadhar`
- `idx_login_history_user_id`
- `idx_notifications_user_id`
- `idx_razorpay_order_id`
- `idx_marketplace_products_*` (user_id, category, status)
- `idx_marketplace_orders_*` (buyer_id, status)
- `idx_marketplace_order_items_*` (order_id, producer_id)

## Cascade Delete Pattern

Nearly all domain models reference `users` with `onDelete: Cascade`. This means deleting a user removes ALL their data (apiaries, hives, flocks, eggs, feeds, health records, warehouses, inventory, CRM data, finance data, labour records, payments, notifications, etc.). This is intentional for data isolation but requires care during development/testing.
