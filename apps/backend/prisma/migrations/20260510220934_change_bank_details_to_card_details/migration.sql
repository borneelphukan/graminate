/*
  Warnings:

  - You are about to drop the column `account_holder_name` on the `bank_details` table. All the data in the column will be lost.
  - You are about to drop the column `account_number` on the `bank_details` table. All the data in the column will be lost.
  - You are about to drop the column `bank_name` on the `bank_details` table. All the data in the column will be lost.
  - You are about to drop the column `ifsc_code` on the `bank_details` table. All the data in the column will be lost.
  - You are about to drop the column `upi_id` on the `bank_details` table. All the data in the column will be lost.
  - Added the required column `card_number` to the `bank_details` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cardholder_name` to the `bank_details` table without a default value. This is not possible if the table is not empty.
  - Added the required column `expiry_date` to the `bank_details` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "bank_details" DROP COLUMN "account_holder_name",
DROP COLUMN "account_number",
DROP COLUMN "bank_name",
DROP COLUMN "ifsc_code",
DROP COLUMN "upi_id",
ADD COLUMN     "card_number" VARCHAR(50) NOT NULL,
ADD COLUMN     "card_type" VARCHAR(50),
ADD COLUMN     "cardholder_name" VARCHAR(255) NOT NULL,
ADD COLUMN     "expiry_date" VARCHAR(10) NOT NULL;
