# Key Features by Module

Detailed breakdown of Graminate's domain-specific features, organized by business module.

## 1. Apiculture (Bee Keeping)

### Capabilities
- **Apiary Management**: Create and manage multiple apiaries (bee yards) with location data
- **Hive Tracking**: Individual hive records with type, species, capacity, installation date
- **Hive Inspections**: Comprehensive inspection records including:
  - Queen status and introduction date
  - Brood pattern assessment
  - Population strength evaluation
  - Frame counts (brood, nectar/honey, pollen)
  - Queen cell observation
  - Varroa mite testing (method + count)
  - Symptom tracking and actions taken
- **Honey Production**: Harvest records with weight, frame count, honey type
- **Analytics**: Production trends, hive health over time

### Pages
- `/[user_id]/apiculture` — Apiary list
- `/[user_id]/apiculture/[apiary_id]` — Apiary detail with hives
- `/[user_id]/apiculture/[apiary_id]/[hive_id]` — Hive detail with inspections

## 2. Cattle Rearing

### Capabilities
- **Livestock Groups**: Track cattle by name, type, count, purpose
- **Milk Production**: Daily milk collection records per animal
- **Production Analytics**: Track yield trends over time

### Pages
- `/[user_id]/cattle_rearing` — Cattle list
- `/[user_id]/cattle_rearing/[id]` — Individual cattle with milk records

## 3. Poultry Management

### Capabilities
- **Flock Management**: Track flocks by name, type, breed, quantity, housing
- **Egg Collection & Grading**: Daily egg records with Indian standard sizing:
  - Small, Medium, Large, Extra-Large eggs
  - Total count and broken egg tracking
- **Feed Tracking**: Feed type, amount, units, date per flock
- **Veterinary Health**: Health records including:
  - Veterinary visits
  - Vaccination records (vaccines given, birds vaccinated)
  - Symptom tracking
  - Approved medicines
  - Next appointment scheduling
- **Analytics**: Egg production trends, feed efficiency, health timeline

### Pages
- `/[user_id]/poultry` — Flock list
- `/[user_id]/poultry/[id]` — Flock detail
- `/[user_id]/poultry/poultry-feeds` — Feed records
- `/[user_id]/poultry/poultry-health/[id]` — Health records

## 4. Floriculture

### Capabilities
- **Flower Cultivation**: Track flower varieties, planting methods, plant counts
- **Watering Schedules**: Daily watering tracking with unique constraint (one watering per flower per day)
- **Calendar View**: Visual watering schedule

### Pages
- `/[user_id]/floriculture` — Flower list with watering calendar

## 5. Warehouse & Inventory Management

### Capabilities
- **Warehouse Management**: Multiple warehouses with full address and contact info
- **Inventory Tracking**: Items with:
  - Name, group classification, units
  - Quantity and price per unit
  - Minimum stock limit (low stock alerts)
  - Feed flag (is this a feed item?)
  - Warehouse assignment
- **Stock Analytics**: Warehouse-level and global inventory views
- **Marketplace Integration**: Inventory items can link to marketplace products

### Pages
- `/[user_id]/storage` — Warehouse list
- `/[user_id]/warehouse/[id]` — Warehouse detail with inventory

## 6. CRM (Customer Relationship Management)

### Capabilities
- **Contacts**: Individual contacts with name, email, phone, type classification, address
- **Companies**: Business entities with contact person, industry, website
- **Contracts**: Contract tracking with:
  - Partner, amount, start/end dates
  - Pipeline stage (lead → negotiation → closed)
  - Category and priority
- **Receipts/Invoices**: Invoice generation linked to sales with:
  - Line items (description, quantity, rate)
  - Tax, discount, shipping calculations
  - Billing addresses
  - Receipt numbering
  - Payment terms and notes
- **Task Management**: Per-user project tasks with status, priority, deadline

### Pages
- `/[user_id]/crm` — CRM hub
- `/[user_id]/contacts/[id]` — Contact detail
- `/[user_id]/companies/[id]` — Company detail
- `/[user_id]/contracts/[id]` — Contract detail
- `/[user_id]/receipts/[id]` — Invoice detail
- `/[user_id]/tasks` — Task board

## 7. Finance

### Capabilities
- **Sales Tracking**: Record sales with:
  - Items sold (array), quantities (array), prices per unit (array)
  - Occupation/category
  - Optional invoice generation
- **Expense Tracking**: Categorized expenses with dates and amounts
- **Loan Management**: Track loans with:
  - Lender, amount, interest rate
  - Start/end dates
  - Status (Active/Closed)
- **Financial Dashboard**: Visual analytics including:
  - Trend graphs (revenue, expenses over time)
  - Comparison charts (period-over-period)
  - Working capital calculation
  - Debt analysis (loan breakdown)
  - Opening balance tracking
- **Reports**: PDF and Excel export capabilities

### Pages
- `/[user_id]/finance_dashboard` — Finance overview
- `/[user_id]/finance_sales` — Sales records
- `/[user_id]/finance_expenses` — Expense tracking
- `/[user_id]/finance_loans` — Loan management
- `/[user_id]/finance_receipts` — Invoice management

## 8. HR / Labour Management

### Capabilities
- **Employee Database**: Comprehensive records including:
  - Personal info (name, DOB, gender, contact)
  - Government IDs (Aadhar, PAN, ration card, driving license, MNERGA job card)
  - Social security (EPFO, ESIC)
  - PM Kisan scheme status
  - Bank details (account, IFSC, branch)
  - Disability status
  - Role classification
- **Payroll Management**: Salary payments with:
  - Base salary
  - Bonus and overtime pay
  - Allowances (housing, travel, meal)
  - Payment frequency (Monthly default)
  - Payment status tracking
- **Compliance**: Government ID tracking for Indian labor law compliance

### Pages
- `/[user_id]/labour_database` — Employee list
- `/[user_id]/labour_database/[id]` — Employee detail
- `/[user_id]/labour_payment` — Payroll list
- `/[user_id]/labour_payment/[id]` — Payment detail

## 9. Marketplace

### Capabilities
- **Product Listings**: Sellers create products with:
  - Name, description, category, price, units
  - Images (multiple)
  - Quantity available
  - Status (DRAFT → PUBLISHED → SOLD_OUT → ARCHIVED)
  - Optional inventory link
- **Shopping Experience**:
  - Product browsing and search
  - Product detail views
  - Cart management
  - Wishlist / Favorites
- **Order System**: Escrow-based orders with:
  - Multi-producer support (one order, multiple sellers)
  - Razorpay payment integration
  - GST calculation (CGST + SGST)
  - Order lifecycle: PENDING → PAID → SHIPPED → DELIVERED → RELEASED
  - Per-producer order items with individual escrow tracking
- **Seller Dashboard**: Track products, orders, payments

### Pages
- `/[user_id]/marketplace` — Marketplace hub
- `/[user_id]/marketplace/` — Product detail, cart, orders

## 10. Notifications

### Capabilities
- **In-app Notifications**: Title, message, type classification
- **Read/Unread Tracking**: Mark individual or all as read
- **Deletion**: Remove individual or clear all notifications
- **Types**: Info, alerts, system notifications

## 11. User Settings

### Configurable Preferences
- **Account**: Profile, password change, account deletion
- **Billing**: Subscription plan, payment methods, billing history
- **General**: Language, dark mode, time format, temperature scale
- **Notifications**: Notification preferences
- **Module-Specific**: Per-module settings (apiculture, cattle, poultry, floriculture, finance, marketplace, weather)

### User Preferences (Persisted)
- `language` — UI language
- `darkMode` — Theme preference
- `timeFormat` — "12-hour" or "24-hour"
- `temperatureScale` — "Celsius" or "Fahrenheit"
- `widgets` — Dashboard widget configuration
- `sub_type` — Active module selections
- `entityType` — Business entity type
- `country`, `city` — Location preferences

## 12. Weather Integration

### Capabilities
- Real-time weather data via OpenMeteo API
- Server-side proxy through `/api/weather` route
- Temperature unit preference (Celsius/Fahrenheit)
- Location-based weather (user's configured city/country)
- Used for agricultural decision-making

## 13. Subscription & Payments

### Razorpay Integration
- **Order Creation**: Backend creates orders via Razorpay API
- **Payment Verification**: HMAC signature verification
- **Plan Management**: Upgrade/downgrade with scheduled changes
- **Billing History**: Complete payment audit trail
- **Bank Details**: Secure card storage for recurring payments

### Plan Types
- **FREE**: Basic features
- **BASIC**: + 100 LLM queries/month
- **PRO**: + 300 LLM queries/month

## 14. Task Management

### Capabilities
- **Project-based Tasks**: Group tasks by project
- **Status Tracking**: Custom statuses per task
- **Priority Levels**: Task prioritization
- **Deadlines**: Due date tracking
- **Kanban Board**: Drag-and-drop task management with custom columns

## 15. Data Export

### Capabilities
- **PDF Reports**: jsPDF with auto-table for structured reports
- **Excel Export**: xlsx library for spreadsheet exports
- **Screenshot-based**: html2canvas for visual report capture
- Available for financial reports, inventory lists, payroll records
