-- CreateTable
CREATE TABLE "marketplace_cart" (
    "cart_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "product_id" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "marketplace_cart_pkey" PRIMARY KEY ("cart_id")
);

-- CreateIndex
CREATE INDEX "idx_marketplace_cart_user_id" ON "marketplace_cart"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "marketplace_cart_user_id_product_id_key" ON "marketplace_cart"("user_id", "product_id");

-- AddForeignKey
ALTER TABLE "marketplace_cart" ADD CONSTRAINT "marketplace_cart_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "marketplace_products"("product_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "marketplace_cart" ADD CONSTRAINT "marketplace_cart_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION;
