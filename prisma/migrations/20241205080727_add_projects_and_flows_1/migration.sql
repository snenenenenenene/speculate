/*
  Warnings:

  - You are about to drop the column `method` on the `APIUsage` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `APIUsage` table. All the data in the column will be lost.
  - You are about to drop the column `timestamp` on the `APIUsage` table. All the data in the column will be lost.
  - You are about to drop the column `color` on the `Flow` table. All the data in the column will be lost.
  - You are about to drop the column `content` on the `Flow` table. All the data in the column will be lost.
  - You are about to drop the column `isPublished` on the `Flow` table. All the data in the column will be lost.
  - You are about to drop the column `onePageMode` on the `Flow` table. All the data in the column will be lost.
  - You are about to drop the column `version` on the `Flow` table. All the data in the column will be lost.
  - You are about to drop the column `apiKey` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `apiKeyLastRegen` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `category` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `color` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `rateLimit` on the `Project` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[projectId]` on the table `Flow` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `duration` to the `APIUsage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `statusCode` to the `APIUsage` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "APIUsage_timestamp_idx";

-- DropIndex
DROP INDEX "Flow_isPublished_idx";

-- DropIndex
DROP INDEX "Project_apiKey_key";

-- AlterTable
ALTER TABLE "APIUsage" DROP COLUMN "method",
DROP COLUMN "status",
DROP COLUMN "timestamp",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "duration" INTEGER NOT NULL,
ADD COLUMN     "statusCode" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Flow" DROP COLUMN "color",
DROP COLUMN "content",
DROP COLUMN "isPublished",
DROP COLUMN "onePageMode",
DROP COLUMN "version",
ADD COLUMN     "userId" TEXT,
ALTER COLUMN "name" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Project" DROP COLUMN "apiKey",
DROP COLUMN "apiKeyLastRegen",
DROP COLUMN "category",
DROP COLUMN "color",
DROP COLUMN "rateLimit",
ALTER COLUMN "name" DROP DEFAULT;

-- CreateTable
CREATE TABLE "ChartInstance" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nodes" JSONB NOT NULL DEFAULT '[]',
    "edges" JSONB NOT NULL DEFAULT '[]',
    "color" TEXT NOT NULL DEFAULT '#3B82F6',
    "onePageMode" BOOLEAN NOT NULL DEFAULT false,
    "publishedVersions" JSONB NOT NULL DEFAULT '[]',
    "variables" JSONB NOT NULL DEFAULT '[]',
    "flowId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChartInstance_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ChartInstance_flowId_idx" ON "ChartInstance"("flowId");

-- CreateIndex
CREATE INDEX "APIUsage_createdAt_idx" ON "APIUsage"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Flow_projectId_key" ON "Flow"("projectId");

-- CreateIndex
CREATE INDEX "Flow_userId_idx" ON "Flow"("userId");

-- AddForeignKey
ALTER TABLE "Flow" ADD CONSTRAINT "Flow_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChartInstance" ADD CONSTRAINT "ChartInstance_flowId_fkey" FOREIGN KEY ("flowId") REFERENCES "Flow"("id") ON DELETE CASCADE ON UPDATE CASCADE;
