/*
  Warnings:

  - You are about to drop the column `content` on the `Flowchart` table. All the data in the column will be lost.
  - You are about to drop the column `onePageMode` on the `Flowchart` table. All the data in the column will be lost.
  - You are about to drop the column `version` on the `Flowchart` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Flowchart" DROP COLUMN "content",
DROP COLUMN "onePageMode",
DROP COLUMN "version";

-- CreateTable
CREATE TABLE "Chart" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'New Chart',
    "content" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#80B500',
    "onePageMode" BOOLEAN NOT NULL DEFAULT false,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "flowchartId" TEXT NOT NULL,

    CONSTRAINT "Chart_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Chart_flowchartId_idx" ON "Chart"("flowchartId");

-- CreateIndex
CREATE INDEX "Chart_isPublished_idx" ON "Chart"("isPublished");

-- AddForeignKey
ALTER TABLE "Chart" ADD CONSTRAINT "Chart_flowchartId_fkey" FOREIGN KEY ("flowchartId") REFERENCES "Flowchart"("id") ON DELETE CASCADE ON UPDATE CASCADE;
