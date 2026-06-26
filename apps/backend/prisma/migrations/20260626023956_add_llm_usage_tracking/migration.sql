-- AlterTable
ALTER TABLE "users" ADD COLUMN     "llm_queries_reset_at" TIMESTAMP(6),
ADD COLUMN     "llm_queries_this_month" INTEGER NOT NULL DEFAULT 0;
