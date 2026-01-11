/*
  Warnings:

  - You are about to drop the column `content` on the `PortfolioItem` table. All the data in the column will be lost.
  - You are about to drop the column `galleryUrls` on the `PortfolioItem` table. All the data in the column will be lost.
  - You are about to drop the column `slug` on the `PortfolioItem` table. All the data in the column will be lost.
  - You are about to drop the column `tags` on the `PortfolioItem` table. All the data in the column will be lost.
  - Added the required column `projectUrl` to the `PortfolioItem` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "PortfolioItem_slug_key";

-- AlterTable
ALTER TABLE "PortfolioItem" DROP COLUMN "content",
DROP COLUMN "galleryUrls",
DROP COLUMN "slug",
DROP COLUMN "tags",
ADD COLUMN     "projectUrl" TEXT NOT NULL;
