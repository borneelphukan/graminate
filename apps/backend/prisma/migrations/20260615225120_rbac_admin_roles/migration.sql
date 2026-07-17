-- CreateTable
CREATE TABLE "admin_roles" (
    "role_id" SERIAL NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "permissions" TEXT[] NOT NULL,

    CONSTRAINT "admin_roles_pkey" PRIMARY KEY ("role_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "admin_roles_name_key" ON "admin_roles"("name");

-- AlterTable
ALTER TABLE "admin" ADD COLUMN "role_id" INTEGER,
ADD COLUMN "status" VARCHAR(20) NOT NULL DEFAULT 'PENDING';

-- AddForeignKey
ALTER TABLE "admin" ADD FOREIGN KEY ("role_id") REFERENCES "admin_roles"("role_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
