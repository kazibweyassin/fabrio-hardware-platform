-- AlterTable
ALTER TABLE "product" ADD COLUMN "catalogId" TEXT,
ADD COLUMN "subcategory" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "product_catalogId_key" ON "product"("catalogId");