-- AlterTable
ALTER TABLE "categories" ADD COLUMN     "parentCategoryId" TEXT;

-- CreateIndex
CREATE INDEX "categories_parentCategoryId_idx" ON "categories"("parentCategoryId");

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_parentCategoryId_fkey" FOREIGN KEY ("parentCategoryId") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
