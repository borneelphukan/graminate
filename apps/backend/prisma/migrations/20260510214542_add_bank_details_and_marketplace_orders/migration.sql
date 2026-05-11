-- CreateEnum
CREATE TYPE "marketplace_order_status" AS ENUM ('PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'RELEASED', 'CANCELLED');

-- CreateTable
CREATE TABLE "bank_details" (
    "bank_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "account_holder_name" VARCHAR(255) NOT NULL,
    "bank_name" VARCHAR(255) NOT NULL,
    "account_number" VARCHAR(50) NOT NULL,
    "ifsc_code" VARCHAR(20) NOT NULL,
    "upi_id" VARCHAR(100),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bank_details_pkey" PRIMARY KEY ("bank_id")
);

-- CreateTable
CREATE TABLE "marketplace_orders" (
    "order_id" SERIAL NOT NULL,
    "buyer_id" INTEGER NOT NULL,
    "razorpay_order_id" VARCHAR(255) NOT NULL,
    "razorpay_payment_id" VARCHAR(255),
    "total_amount" DECIMAL(15,2) NOT NULL,
    "cgst" DECIMAL(15,2) NOT NULL,
    "sgst" DECIMAL(15,2) NOT NULL,
    "status" "marketplace_order_status" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "marketplace_orders_pkey" PRIMARY KEY ("order_id")
);

-- CreateTable
CREATE TABLE "marketplace_order_items" (
    "order_item_id" SERIAL NOT NULL,
    "order_id" INTEGER NOT NULL,
    "product_id" INTEGER NOT NULL,
    "producer_id" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unit_price" DECIMAL(10,2) NOT NULL,
    "escrow_released" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "marketplace_order_items_pkey" PRIMARY KEY ("order_item_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "bank_details_user_id_key" ON "bank_details"("user_id");

-- CreateIndex
CREATE INDEX "idx_marketplace_orders_buyer_id" ON "marketplace_orders"("buyer_id");

-- CreateIndex
CREATE INDEX "idx_marketplace_orders_status" ON "marketplace_orders"("status");

-- CreateIndex
CREATE INDEX "idx_marketplace_order_items_order_id" ON "marketplace_order_items"("order_id");

-- CreateIndex
CREATE INDEX "idx_marketplace_order_items_producer_id" ON "marketplace_order_items"("producer_id");

-- AddForeignKey
ALTER TABLE "bank_details" ADD CONSTRAINT "bank_details_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "marketplace_orders" ADD CONSTRAINT "marketplace_orders_buyer_id_fkey" FOREIGN KEY ("buyer_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "marketplace_order_items" ADD CONSTRAINT "marketplace_order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "marketplace_orders"("order_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "marketplace_order_items" ADD CONSTRAINT "marketplace_order_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "marketplace_products"("product_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "marketplace_order_items" ADD CONSTRAINT "marketplace_order_items_producer_id_fkey" FOREIGN KEY ("producer_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION;
