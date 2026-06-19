-- AlterTable
ALTER TABLE "payment" ADD COLUMN "mtnReferenceId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "payment_mtnReferenceId_key" ON "payment"("mtnReferenceId");