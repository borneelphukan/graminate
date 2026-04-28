-- CreateEnum
CREATE TYPE "payment_status" AS ENUM ('PENDING', 'SUCCESS', 'FAILED');

-- CreateEnum
CREATE TYPE "user_plan_type" AS ENUM ('FREE', 'BASIC', 'PRO');

-- CreateTable
CREATE TABLE "admin" (
    "admin_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "first_name" VARCHAR(100) NOT NULL,
    "last_name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password" TEXT NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_pkey" PRIMARY KEY ("admin_id")
);

-- CreateTable
CREATE TABLE "apiculture" (
    "apiary_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "apiary_name" VARCHAR(100) NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "area" DOUBLE PRECISION,
    "address_line_1" VARCHAR(255),
    "address_line_2" VARCHAR(255),
    "city" VARCHAR(100),
    "state" VARCHAR(100),
    "postal_code" VARCHAR(20),

    CONSTRAINT "apiculture_pkey" PRIMARY KEY ("apiary_id")
);

-- CreateTable
CREATE TABLE "bee_hives" (
    "hive_id" SERIAL NOT NULL,
    "apiary_id" INTEGER NOT NULL,
    "hive_name" VARCHAR(100) NOT NULL,
    "hive_type" VARCHAR(50),
    "installation_date" DATE,
    "ventilation_status" VARCHAR(50),
    "notes" TEXT,
    "bee_species" VARCHAR(100),
    "honey_capacity" DOUBLE PRECISION,
    "unit" VARCHAR(20),

    CONSTRAINT "bee_hives_pkey" PRIMARY KEY ("hive_id")
);

-- CreateTable
CREATE TABLE "cattle_milk" (
    "milk_id" SERIAL NOT NULL,
    "cattle_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "date_collected" DATE NOT NULL,
    "animal_name" TEXT,
    "milk_produced" DECIMAL(10,2) NOT NULL,
    "date_logged" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cattle_milk_pkey" PRIMARY KEY ("milk_id")
);

-- CreateTable
CREATE TABLE "cattle_rearing" (
    "cattle_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "cattle_name" TEXT NOT NULL,
    "cattle_type" TEXT NOT NULL,
    "number_of_animals" INTEGER NOT NULL,
    "purpose" TEXT,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cattle_rearing_pkey" PRIMARY KEY ("cattle_id")
);

-- CreateTable
CREATE TABLE "companies" (
    "company_id" SERIAL NOT NULL,
    "user_id" INTEGER,
    "company_name" VARCHAR(100) NOT NULL,
    "contact_person" VARCHAR(50),
    "email" VARCHAR(100),
    "phone_number" VARCHAR(15),
    "type" VARCHAR(50),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "address_line_1" VARCHAR(255) NOT NULL,
    "address_line_2" VARCHAR(255),
    "city" VARCHAR(100) NOT NULL,
    "state" VARCHAR(100) NOT NULL,
    "postal_code" VARCHAR(10) NOT NULL,
    "website" VARCHAR(255),
    "industry" VARCHAR(50),

    CONSTRAINT "companies_pkey" PRIMARY KEY ("company_id")
);

-- CreateTable
CREATE TABLE "contacts" (
    "contact_id" SERIAL NOT NULL,
    "user_id" INTEGER,
    "first_name" VARCHAR(50) NOT NULL,
    "last_name" VARCHAR(50),
    "email" VARCHAR(100),
    "phone_number" VARCHAR(16),
    "type" VARCHAR(50),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "address_line_1" VARCHAR(255),
    "address_line_2" VARCHAR(255),
    "city" VARCHAR(100),
    "state" VARCHAR(100),
    "postal_code" VARCHAR(10),

    CONSTRAINT "contacts_pkey" PRIMARY KEY ("contact_id")
);

-- CreateTable
CREATE TABLE "deals" (
    "deal_id" SERIAL NOT NULL,
    "user_id" INTEGER,
    "deal_name" VARCHAR(100) NOT NULL,
    "partner" VARCHAR(50) NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "stage" VARCHAR(50) NOT NULL,
    "end_date" DATE NOT NULL,
    "start_date" DATE NOT NULL,
    "category" VARCHAR(100),
    "priority" VARCHAR(20) NOT NULL DEFAULT 'Medium',

    CONSTRAINT "deals_pkey" PRIMARY KEY ("deal_id")
);

-- CreateTable
CREATE TABLE "expenses" (
    "expense_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "occupation" VARCHAR(100),
    "category" VARCHAR(100) NOT NULL,
    "expense" DECIMAL(10,2) NOT NULL,
    "date_created" DATE NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "expenses_pkey" PRIMARY KEY ("expense_id")
);

-- CreateTable
CREATE TABLE "hive_inspection" (
    "inspection_id" SERIAL NOT NULL,
    "hive_id" INTEGER NOT NULL,
    "inspection_date" DATE NOT NULL,
    "queen_status" VARCHAR(30),
    "queen_introduced_date" DATE,
    "brood_pattern" VARCHAR(30),
    "notes" TEXT,
    "symptoms" TEXT[],
    "population_strength" VARCHAR(30),
    "frames_of_brood" INTEGER,
    "frames_of_nectar_honey" INTEGER,
    "frames_of_pollen" INTEGER,
    "room_to_lay" VARCHAR(30),
    "queen_cells_observed" VARCHAR(5),
    "queen_cells_count" INTEGER,
    "varroa_mite_method" VARCHAR(50),
    "varroa_mite_count" INTEGER,
    "actions_taken" TEXT,

    CONSTRAINT "hive_inspection_pkey" PRIMARY KEY ("inspection_id")
);

-- CreateTable
CREATE TABLE "honey_production" (
    "harvest_id" SERIAL NOT NULL,
    "hive_id" INTEGER NOT NULL,
    "harvest_date" DATE NOT NULL,
    "honey_weight" DOUBLE PRECISION NOT NULL,
    "frames_harvested" INTEGER,
    "honey_type" VARCHAR(100),
    "harvest_notes" TEXT,
    "logged_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "honey_production_pkey" PRIMARY KEY ("harvest_id")
);

-- CreateTable
CREATE TABLE "inventory" (
    "inventory_id" SERIAL NOT NULL,
    "user_id" INTEGER,
    "item_name" VARCHAR(100) NOT NULL,
    "item_group" VARCHAR(100) NOT NULL,
    "units" VARCHAR(50) NOT NULL,
    "quantity" INTEGER NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "price_per_unit" DECIMAL(10,2) NOT NULL,
    "warehouse_id" INTEGER,
    "minimum_limit" INTEGER,
    "feed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "inventory_pkey" PRIMARY KEY ("inventory_id")
);

-- CreateTable
CREATE TABLE "invoice_items" (
    "item_id" SERIAL NOT NULL,
    "invoice_id" INTEGER NOT NULL,
    "description" TEXT,
    "quantity" DECIMAL NOT NULL DEFAULT 1,
    "rate" DECIMAL(10,2) NOT NULL DEFAULT 0,

    CONSTRAINT "invoice_items_pkey" PRIMARY KEY ("item_id")
);

-- CreateTable
CREATE TABLE "invoices" (
    "invoice_id" SERIAL NOT NULL,
    "user_id" INTEGER,
    "title" VARCHAR(100) NOT NULL,
    "bill_to" VARCHAR(100) NOT NULL,
    "due_date" DATE NOT NULL,
    "receipt_date" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "payment_terms" VARCHAR(100),
    "notes" TEXT,
    "tax" DECIMAL(10,2) DEFAULT 0,
    "discount" DECIMAL(10,2) DEFAULT 0,
    "shipping" DECIMAL(10,2) DEFAULT 0,
    "receipt_number" VARCHAR(50),
    "issued_date" DATE DEFAULT CURRENT_DATE,
    "bill_to_address_line1" VARCHAR(255),
    "bill_to_address_line2" VARCHAR(255),
    "bill_to_city" VARCHAR(100),
    "bill_to_state" VARCHAR(100),
    "bill_to_postal_code" VARCHAR(20),
    "bill_to_country" VARCHAR(100),
    "sales_id" INTEGER,

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("invoice_id")
);

-- CreateTable
CREATE TABLE "job_applications" (
    "id" SERIAL NOT NULL,
    "job_id" INTEGER NOT NULL,
    "first_name" VARCHAR(100) NOT NULL,
    "last_name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(15) NOT NULL,
    "portfolio" VARCHAR(255),
    "cv_file" TEXT NOT NULL,
    "applied_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "job_applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jobs" (
    "id" SERIAL NOT NULL,
    "position" VARCHAR(255) NOT NULL,
    "type" VARCHAR(50) NOT NULL,
    "mode" VARCHAR(50) NOT NULL,
    "description" TEXT NOT NULL,
    "tasks" TEXT[],
    "requirements" TEXT[],
    "benefits" TEXT[],

    CONSTRAINT "jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "labour_payments" (
    "payment_id" SERIAL NOT NULL,
    "labour_id" INTEGER NOT NULL,
    "payment_date" DATE NOT NULL,
    "salary_paid" DECIMAL(10,2) NOT NULL,
    "bonus" DECIMAL(10,2) NOT NULL,
    "overtime_pay" DECIMAL(10,2) NOT NULL,
    "housing_allowance" DECIMAL(10,2) NOT NULL,
    "travel_allowance" DECIMAL(10,2) NOT NULL,
    "meal_allowance" DECIMAL(10,2) NOT NULL,
    "total_amount" DECIMAL(10,2) NOT NULL,
    "payment_status" VARCHAR(20) DEFAULT 'Pending',
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "labour_payments_pkey" PRIMARY KEY ("payment_id")
);

-- CreateTable
CREATE TABLE "labours" (
    "labour_id" SERIAL NOT NULL,
    "user_id" INTEGER,
    "full_name" VARCHAR(100) NOT NULL,
    "date_of_birth" DATE NOT NULL,
    "gender" VARCHAR(10) NOT NULL,
    "contact_number" VARCHAR(15) NOT NULL,
    "aadhar_card_number" VARCHAR(12) NOT NULL,
    "ration_card" VARCHAR(20),
    "pan_card" VARCHAR(10),
    "driving_license" VARCHAR(20),
    "mnrega_job_card_number" VARCHAR(20),
    "bank_account_number" VARCHAR(20),
    "ifsc_code" VARCHAR(11),
    "bank_name" VARCHAR(100),
    "bank_branch" VARCHAR(100),
    "disability_status" BOOLEAN DEFAULT false,
    "epfo" VARCHAR(20),
    "esic" VARCHAR(20),
    "pm_kisan" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "role" VARCHAR(50) NOT NULL DEFAULT 'Worker',
    "base_salary" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "bonus" DECIMAL(10,2),
    "overtime_pay" DECIMAL(10,2),
    "housing_allowance" DECIMAL(10,2),
    "travel_allowance" DECIMAL(10,2),
    "meal_allowance" DECIMAL(10,2),
    "payment_frequency" VARCHAR(20) DEFAULT 'Monthly',
    "address_line_1" VARCHAR(255),
    "address_line_2" VARCHAR(255),
    "city" VARCHAR(100),
    "state" VARCHAR(100),
    "postal_code" VARCHAR(20),

    CONSTRAINT "labours_pkey" PRIMARY KEY ("labour_id")
);

-- CreateTable
CREATE TABLE "login_history" (
    "login_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" INTEGER NOT NULL,
    "logged_in_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "logged_out_at" TIMESTAMP(6),

    CONSTRAINT "login_history_pkey" PRIMARY KEY ("login_id")
);

-- CreateTable
CREATE TABLE "migrations" (
    "id" SERIAL NOT NULL,
    "migration" VARCHAR(255) NOT NULL,
    "batch" INTEGER NOT NULL,

    CONSTRAINT "migrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "password_resets" (
    "email" VARCHAR(100) NOT NULL,
    "token" VARCHAR(255) NOT NULL,
    "expires_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "password_resets_pkey" PRIMARY KEY ("email")
);

-- CreateTable
CREATE TABLE "payments" (
    "payment_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "razorpay_order_id" VARCHAR(255) NOT NULL,
    "razorpay_payment_id" VARCHAR(255),
    "razorpay_signature" VARCHAR(255),
    "amount" INTEGER NOT NULL,
    "currency" VARCHAR(10) NOT NULL,
    "status" "payment_status" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "plan_type" "user_plan_type" NOT NULL DEFAULT 'PRO',

    CONSTRAINT "payments_pkey" PRIMARY KEY ("payment_id")
);

-- CreateTable
CREATE TABLE "poultry_eggs" (
    "egg_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "flock_id" INTEGER NOT NULL,
    "date_collected" DATE NOT NULL,
    "small_eggs" INTEGER NOT NULL DEFAULT 0,
    "medium_eggs" INTEGER NOT NULL DEFAULT 0,
    "large_eggs" INTEGER NOT NULL DEFAULT 0,
    "extra_large_eggs" INTEGER NOT NULL DEFAULT 0,
    "total_eggs" INTEGER NOT NULL DEFAULT 0,
    "broken_eggs" INTEGER NOT NULL DEFAULT 0,
    "date_logged" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "poultry_eggs_pkey" PRIMARY KEY ("egg_id")
);

-- CreateTable
CREATE TABLE "poultry_feeds" (
    "feed_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "flock_id" INTEGER NOT NULL,
    "feed_given" VARCHAR(100) NOT NULL,
    "amount_given" DECIMAL(8,2) NOT NULL,
    "units" VARCHAR(50) NOT NULL,
    "feed_date" DATE NOT NULL DEFAULT CURRENT_DATE,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "poultry_feeds_pkey" PRIMARY KEY ("feed_id")
);

-- CreateTable
CREATE TABLE "poultry_flock" (
    "flock_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "flock_name" TEXT NOT NULL,
    "flock_type" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "breed" VARCHAR(100),
    "source" VARCHAR(255),
    "housing_type" VARCHAR(100),
    "notes" TEXT,

    CONSTRAINT "poultry_flock_pkey" PRIMARY KEY ("flock_id")
);

-- CreateTable
CREATE TABLE "poultry_health" (
    "poultry_health_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "flock_id" INTEGER NOT NULL,
    "veterinary_name" VARCHAR(255),
    "total_birds" INTEGER NOT NULL,
    "birds_vaccinated" INTEGER NOT NULL,
    "vaccines_given" TEXT[],
    "symptoms" TEXT[],
    "medicine_approved" TEXT[],
    "remarks" TEXT,
    "next_appointment" DATE,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "poultry_health_pkey" PRIMARY KEY ("poultry_health_id")
);

-- CreateTable
CREATE TABLE "sales" (
    "sales_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "sales_date" DATE NOT NULL,
    "occupation" VARCHAR(100),
    "items_sold" TEXT[],
    "quantities_sold" INTEGER[],
    "quantity_unit" VARCHAR(50),
    "invoice_created" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "sales_name" VARCHAR(255),
    "prices_per_unit" DECIMAL(10,2)[] DEFAULT ARRAY[]::DECIMAL(10,2)[],

    CONSTRAINT "sales_pkey" PRIMARY KEY ("sales_id")
);

-- CreateTable
CREATE TABLE "tasks" (
    "task_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "project" VARCHAR(100) NOT NULL,
    "task" VARCHAR(255),
    "status" VARCHAR(50),
    "description" TEXT,
    "priority" VARCHAR(10),
    "deadline" DATE,
    "created_on" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tasks_pkey" PRIMARY KEY ("task_id")
);

-- CreateTable
CREATE TABLE "users" (
    "user_id" SERIAL NOT NULL,
    "first_name" VARCHAR(50) NOT NULL,
    "last_name" VARCHAR(50) NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "phone_number" VARCHAR(15) NOT NULL,
    "business_name" VARCHAR(100),
    "date_of_birth" DATE,
    "password" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "language" VARCHAR(50) DEFAULT 'English',
    "time_format" VARCHAR(10) DEFAULT '24-hour',
    "type" VARCHAR(50),
    "sub_type" TEXT[],
    "temperature_scale" VARCHAR(15) DEFAULT 'Celsius',
    "address_line_1" VARCHAR(255),
    "address_line_2" VARCHAR(255),
    "city" VARCHAR(100),
    "state" VARCHAR(100),
    "postal_code" VARCHAR(20),
    "darkMode" BOOLEAN NOT NULL DEFAULT false,
    "widgets" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "plan" "user_plan_type" NOT NULL DEFAULT 'FREE',
    "subscription_expires_at" TIMESTAMP(6),
    "country" VARCHAR(100),
    "opening_balance" DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    "business_size" VARCHAR(50),
    "entity_type" VARCHAR(50),
    "pending_plan" "user_plan_type",
    "pending_plan_source" TEXT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "notification_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "message" TEXT NOT NULL,
    "type" VARCHAR(50) NOT NULL DEFAULT 'info',
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("notification_id")
);

-- CreateTable
CREATE TABLE "kanban_columns" (
    "column_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "project" VARCHAR(100) NOT NULL,
    "title" VARCHAR(100) NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "kanban_columns_pkey" PRIMARY KEY ("column_id")
);

-- CreateTable
CREATE TABLE "warehouse" (
    "warehouse_id" SERIAL NOT NULL,
    "user_id" INTEGER,
    "name" VARCHAR(100) NOT NULL,
    "type" VARCHAR(50),
    "address_line_1" VARCHAR(255),
    "address_line_2" VARCHAR(255),
    "city" VARCHAR(100),
    "state" VARCHAR(100),
    "postal_code" VARCHAR(20),
    "country" VARCHAR(100),
    "contact_person" VARCHAR(100),
    "phone" VARCHAR(20),
    "storage_capacity" DECIMAL(10,2),
    "category" VARCHAR(100),

    CONSTRAINT "warehouse_pkey" PRIMARY KEY ("warehouse_id")
);

-- CreateTable
CREATE TABLE "loans" (
    "loan_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "loan_name" VARCHAR(100) NOT NULL,
    "lender" VARCHAR(100) NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "interest_rate" DECIMAL(5,2) NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE,
    "status" VARCHAR(20) NOT NULL DEFAULT 'Active',
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "loans_pkey" PRIMARY KEY ("loan_id")
);

-- CreateTable
CREATE TABLE "floriculture" (
    "flower_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "flower_name" TEXT NOT NULL,
    "flower_type" TEXT,
    "area" DOUBLE PRECISION,
    "method" VARCHAR(50),
    "planting_date" DATE,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "floriculture_pkey" PRIMARY KEY ("flower_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "admin_email_key" ON "admin"("email");

-- CreateIndex
CREATE INDEX "idx_expenses_date_created" ON "expenses"("date_created");

-- CreateIndex
CREATE INDEX "idx_expenses_user_id" ON "expenses"("user_id");

-- CreateIndex
CREATE INDEX "idx_hive_inspection_hive_id" ON "hive_inspection"("hive_id");

-- CreateIndex
CREATE INDEX "idx_honey_production_hive_id" ON "honey_production"("hive_id");

-- CreateIndex
CREATE INDEX "idx_inventory_item_group" ON "inventory"("item_group");

-- CreateIndex
CREATE INDEX "idx_inventory_user_id" ON "inventory"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_receipt_number_key" ON "invoices"("receipt_number");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_sales_id_unique" ON "invoices"("sales_id");

-- CreateIndex
CREATE UNIQUE INDEX "job_applications_email_key" ON "job_applications"("email");

-- CreateIndex
CREATE UNIQUE INDEX "labours_aadhar_card_number_key" ON "labours"("aadhar_card_number");

-- CreateIndex
CREATE UNIQUE INDEX "labours_ration_card_key" ON "labours"("ration_card");

-- CreateIndex
CREATE UNIQUE INDEX "labours_pan_card_key" ON "labours"("pan_card");

-- CreateIndex
CREATE UNIQUE INDEX "labours_driving_license_key" ON "labours"("driving_license");

-- CreateIndex
CREATE UNIQUE INDEX "labours_mnrega_job_card_number_key" ON "labours"("mnrega_job_card_number");

-- CreateIndex
CREATE UNIQUE INDEX "labours_epfo_key" ON "labours"("epfo");

-- CreateIndex
CREATE UNIQUE INDEX "labours_esic_key" ON "labours"("esic");

-- CreateIndex
CREATE INDEX "idx_labour_aadhar" ON "labours"("aadhar_card_number");

-- CreateIndex
CREATE INDEX "idx_login_history_user_id" ON "login_history"("user_id");

-- CreateIndex
CREATE INDEX "idx_razorpay_order_id" ON "payments"("razorpay_order_id");

-- CreateIndex
CREATE INDEX "idx_poultry_eggs_date_collected" ON "poultry_eggs"("date_collected");

-- CreateIndex
CREATE INDEX "idx_poultry_eggs_flock_id" ON "poultry_eggs"("flock_id");

-- CreateIndex
CREATE INDEX "idx_poultry_eggs_user_id" ON "poultry_eggs"("user_id");

-- CreateIndex
CREATE INDEX "idx_poultry_feeds_feed_date" ON "poultry_feeds"("feed_date");

-- CreateIndex
CREATE INDEX "idx_poultry_feeds_flock_id" ON "poultry_feeds"("flock_id");

-- CreateIndex
CREATE INDEX "idx_poultry_feeds_user_id" ON "poultry_feeds"("user_id");

-- CreateIndex
CREATE INDEX "idx_poultry_health_flock_id" ON "poultry_health"("flock_id");

-- CreateIndex
CREATE INDEX "idx_poultry_health_user_id" ON "poultry_health"("user_id");

-- CreateIndex
CREATE INDEX "idx_sales_sales_name" ON "sales"("sales_name");

-- CreateIndex
CREATE INDEX "idx_sales_user_id" ON "sales"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_number_key" ON "users"("phone_number");

-- CreateIndex
CREATE INDEX "idx_notifications_user_id" ON "notifications"("user_id");

-- CreateIndex
CREATE INDEX "kanban_columns_user_id_project_idx" ON "kanban_columns"("user_id", "project");

-- AddForeignKey
ALTER TABLE "apiculture" ADD CONSTRAINT "fk_user" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "bee_hives" ADD CONSTRAINT "fk_apiary" FOREIGN KEY ("apiary_id") REFERENCES "apiculture"("apiary_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "cattle_milk" ADD CONSTRAINT "fk_cattle_rearing_milk" FOREIGN KEY ("cattle_id") REFERENCES "cattle_rearing"("cattle_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "cattle_milk" ADD CONSTRAINT "fk_user_milk" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "cattle_rearing" ADD CONSTRAINT "fk_user" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "companies" ADD CONSTRAINT "companies_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "deals" ADD CONSTRAINT "deals_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "fk_user_expenses" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "hive_inspection" ADD CONSTRAINT "fk_hive" FOREIGN KEY ("hive_id") REFERENCES "bee_hives"("hive_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "honey_production" ADD CONSTRAINT "fk_hive" FOREIGN KEY ("hive_id") REFERENCES "bee_hives"("hive_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "inventory" ADD CONSTRAINT "inventory_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "inventory" ADD CONSTRAINT "inventory_warehouse_id_fkey" FOREIGN KEY ("warehouse_id") REFERENCES "warehouse"("warehouse_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "invoice_items" ADD CONSTRAINT "invoice_items_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("invoice_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_sales_id_fkey" FOREIGN KEY ("sales_id") REFERENCES "sales"("sales_id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "job_applications" ADD CONSTRAINT "job_applications_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "labour_payments" ADD CONSTRAINT "labour_payments_labour_id_fkey" FOREIGN KEY ("labour_id") REFERENCES "labours"("labour_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "labours" ADD CONSTRAINT "labours_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "login_history" ADD CONSTRAINT "fk_user" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "password_resets" ADD CONSTRAINT "password_resets_email_fkey" FOREIGN KEY ("email") REFERENCES "users"("email") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "poultry_eggs" ADD CONSTRAINT "poultry_eggs_flock_id_fkey" FOREIGN KEY ("flock_id") REFERENCES "poultry_flock"("flock_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "poultry_eggs" ADD CONSTRAINT "poultry_eggs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "poultry_feeds" ADD CONSTRAINT "fk_poultry_feeds_flock" FOREIGN KEY ("flock_id") REFERENCES "poultry_flock"("flock_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "poultry_feeds" ADD CONSTRAINT "fk_poultry_feeds_user" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "poultry_flock" ADD CONSTRAINT "poultry_flock_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "poultry_health" ADD CONSTRAINT "fk_flock" FOREIGN KEY ("flock_id") REFERENCES "poultry_flock"("flock_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "poultry_health" ADD CONSTRAINT "fk_user" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "sales" ADD CONSTRAINT "fk_user" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "kanban_columns" ADD CONSTRAINT "kanban_columns_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "warehouse" ADD CONSTRAINT "warehouse_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "loans" ADD CONSTRAINT "loans_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "floriculture" ADD CONSTRAINT "fk_user" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION;
