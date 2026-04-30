/*
  Warnings:

  - You are about to drop the column `storage_capacity` on the `warehouse` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "warehouse" DROP COLUMN "storage_capacity";

-- CreateTable
CREATE TABLE "flower_watering" (
    "watering_id" SERIAL NOT NULL,
    "flower_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "watering_date" DATE NOT NULL,
    "watered" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "flower_watering_pkey" PRIMARY KEY ("watering_id")
);

-- CreateIndex
CREATE INDEX "flower_watering_user_id_watering_date_idx" ON "flower_watering"("user_id", "watering_date");

-- CreateIndex
CREATE UNIQUE INDEX "flower_watering_flower_id_watering_date_key" ON "flower_watering"("flower_id", "watering_date");

-- AddForeignKey
ALTER TABLE "flower_watering" ADD CONSTRAINT "fk_flower" FOREIGN KEY ("flower_id") REFERENCES "floriculture"("flower_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flower_watering" ADD CONSTRAINT "fk_user" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;
