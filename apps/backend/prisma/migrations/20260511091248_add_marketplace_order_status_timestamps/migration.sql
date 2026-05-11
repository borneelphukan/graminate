-- AlterTable
ALTER TABLE "marketplace_orders" ADD COLUMN     "delivered_at" TIMESTAMP(6),
ADD COLUMN     "paid_at" TIMESTAMP(6),
ADD COLUMN     "released_at" TIMESTAMP(6),
ADD COLUMN     "shipped_at" TIMESTAMP(6);
