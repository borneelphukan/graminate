/*
  Warnings:

  - You are about to drop the column `area` on the `floriculture` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "marketplace_product_status" AS ENUM ('DRAFT', 'PUBLISHED', 'SOLD_OUT', 'ARCHIVED');

-- AlterTable
ALTER TABLE "floriculture" DROP COLUMN "area",
ADD COLUMN     "plants" INTEGER;

-- CreateTable
CREATE TABLE "marketplace_products" (
    "product_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "inventory_id" INTEGER,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "category" VARCHAR(100) NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "units" VARCHAR(50) NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "images" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" "marketplace_product_status" NOT NULL DEFAULT 'DRAFT',
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "published_at" TIMESTAMP(6),

    CONSTRAINT "marketplace_products_pkey" PRIMARY KEY ("product_id")
);

-- CreateTable
CREATE TABLE "marketplace_favorites" (
    "favorite_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "product_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "marketplace_favorites_pkey" PRIMARY KEY ("favorite_id")
);

-- CreateTable
CREATE TABLE "marketplace_wishlist" (
    "wishlist_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "product_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "marketplace_wishlist_pkey" PRIMARY KEY ("wishlist_id")
);

-- CreateIndex
CREATE INDEX "idx_marketplace_products_user_id" ON "marketplace_products"("user_id");

-- CreateIndex
CREATE INDEX "idx_marketplace_products_category" ON "marketplace_products"("category");

-- CreateIndex
CREATE INDEX "idx_marketplace_products_status" ON "marketplace_products"("status");

-- CreateIndex
CREATE INDEX "idx_marketplace_favorites_user_id" ON "marketplace_favorites"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "marketplace_favorites_user_id_product_id_key" ON "marketplace_favorites"("user_id", "product_id");

-- CreateIndex
CREATE INDEX "idx_marketplace_wishlist_user_id" ON "marketplace_wishlist"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "marketplace_wishlist_user_id_product_id_key" ON "marketplace_wishlist"("user_id", "product_id");

-- AddForeignKey
ALTER TABLE "marketplace_products" ADD CONSTRAINT "marketplace_products_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "marketplace_products" ADD CONSTRAINT "marketplace_products_inventory_id_fkey" FOREIGN KEY ("inventory_id") REFERENCES "inventory"("inventory_id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "marketplace_favorites" ADD CONSTRAINT "marketplace_favorites_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "marketplace_favorites" ADD CONSTRAINT "marketplace_favorites_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "marketplace_products"("product_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "marketplace_wishlist" ADD CONSTRAINT "marketplace_wishlist_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "marketplace_wishlist" ADD CONSTRAINT "marketplace_wishlist_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "marketplace_products"("product_id") ON DELETE CASCADE ON UPDATE NO ACTION;
