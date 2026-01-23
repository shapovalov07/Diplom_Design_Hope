-- Add publishedById to PortfolioItem
ALTER TABLE "PortfolioItem" ADD COLUMN "publishedById" TEXT;

-- CreateIndex
CREATE INDEX "PortfolioItem_publishedById_idx" ON "PortfolioItem"("publishedById");

-- AddForeignKey
ALTER TABLE "PortfolioItem" ADD CONSTRAINT "PortfolioItem_publishedById_fkey" FOREIGN KEY ("publishedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
