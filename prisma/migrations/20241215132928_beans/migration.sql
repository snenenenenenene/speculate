/*
  Warnings:

  - You are about to drop the column `edges` on the `ChartInstance` table. All the data in the column will be lost.
  - You are about to drop the column `flowId` on the `ChartInstance` table. All the data in the column will be lost.
  - You are about to drop the column `nodes` on the `ChartInstance` table. All the data in the column will be lost.
  - You are about to drop the column `publishedVersions` on the `ChartInstance` table. All the data in the column will be lost.
  - The `variables` column on the `ChartInstance` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `metadata` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Payment` table. All the data in the column will be lost.
  - You are about to alter the column `amount` on the `Payment` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - You are about to drop the column `apiEnabled` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `tags` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the `APIUsage` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Flow` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[apiKey]` on the table `Project` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `content` to the `ChartInstance` table without a default value. This is not possible if the table is not empty.
  - Added the required column `projectId` to the `ChartInstance` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `ChartInstance` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ShareAccessLevel" AS ENUM ('VIEW', 'COMMENT', 'EDIT');

-- CreateEnum
CREATE TYPE "ProjectRole" AS ENUM ('OWNER', 'ADMIN', 'EDITOR', 'VIEWER');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('CREATED', 'UPDATED', 'DELETED', 'PUBLISHED', 'UNPUBLISHED', 'ROLE_CHANGED', 'COLLABORATOR_ADDED', 'COLLABORATOR_REMOVED', 'VARIABLE_ADDED', 'VARIABLE_UPDATED', 'VARIABLE_REMOVED', 'API_KEY_GENERATED', 'API_KEY_REVOKED', 'VERSION_CREATED', 'INVITATION_SENT', 'INVITATION_ACCEPTED', 'INVITATION_REJECTED', 'SHARE_CREATED', 'SHARE_UPDATED', 'SHARE_DELETED', 'SHARE_ACCESSED');

-- DropForeignKey
ALTER TABLE "APIUsage" DROP CONSTRAINT "APIUsage_projectId_fkey";

-- DropForeignKey
ALTER TABLE "ChartInstance" DROP CONSTRAINT "ChartInstance_flowId_fkey";

-- DropForeignKey
ALTER TABLE "Flow" DROP CONSTRAINT "Flow_projectId_fkey";

-- DropForeignKey
ALTER TABLE "Flow" DROP CONSTRAINT "Flow_userId_fkey";

-- DropForeignKey
ALTER TABLE "Payment" DROP CONSTRAINT "Payment_userId_fkey";

-- DropIndex
DROP INDEX "ChartInstance_flowId_idx";

-- DropIndex
DROP INDEX "Payment_createdAt_idx";

-- AlterTable
ALTER TABLE "ChartInstance" DROP COLUMN "edges",
DROP COLUMN "flowId",
DROP COLUMN "nodes",
DROP COLUMN "publishedVersions",
ADD COLUMN     "content" TEXT NOT NULL,
ADD COLUMN     "isPublished" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "projectId" TEXT NOT NULL,
ADD COLUMN     "publishedAt" TIMESTAMP(3),
ADD COLUMN     "userId" TEXT NOT NULL,
ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 1,
ALTER COLUMN "name" SET DEFAULT 'New Chart',
ALTER COLUMN "color" SET DEFAULT '#80B500',
DROP COLUMN "variables",
ADD COLUMN     "variables" JSONB[] DEFAULT ARRAY[]::JSONB[];

-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "metadata",
DROP COLUMN "updatedAt",
ALTER COLUMN "amount" SET DATA TYPE INTEGER,
ALTER COLUMN "currency" SET DEFAULT 'USD',
ALTER COLUMN "stripeSessionId" DROP NOT NULL,
ALTER COLUMN "creditAmount" DROP NOT NULL,
ALTER COLUMN "creditAmount" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Project" DROP COLUMN "apiEnabled",
DROP COLUMN "tags",
ADD COLUMN     "apiKey" TEXT,
ADD COLUMN     "isPublic" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "shareSettings" JSONB,
ADD COLUMN     "variables" JSONB[] DEFAULT ARRAY[]::JSONB[];

-- DropTable
DROP TABLE "APIUsage";

-- DropTable
DROP TABLE "Flow";

-- CreateTable
CREATE TABLE "ProjectShare" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "settings" JSONB NOT NULL,
    "shareId" TEXT NOT NULL,
    "password" TEXT,
    "views" INTEGER NOT NULL DEFAULT 0,
    "lastViewed" TIMESTAMP(3),

    CONSTRAINT "ProjectShare_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectShareAccess" (
    "id" TEXT NOT NULL,
    "shareId" TEXT NOT NULL,
    "userId" TEXT,
    "accessedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "accessLevel" "ShareAccessLevel" NOT NULL,

    CONSTRAINT "ProjectShareAccess_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectCollaborator" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "ProjectRole" NOT NULL DEFAULT 'VIEWER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectCollaborator_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectInvitation" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "role" "ProjectRole" NOT NULL DEFAULT 'VIEWER',
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "accepted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT,

    CONSTRAINT "ProjectInvitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AllowedDomain" (
    "id" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AllowedDomain_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Version" (
    "id" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "name" TEXT,
    "content" JSONB NOT NULL,
    "metadata" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "publishedAt" TIMESTAMP(3),
    "flowId" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,

    CONSTRAINT "Version_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "action" "AuditAction" NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "metadata" JSONB NOT NULL,
    "snapshot" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProjectShare_shareId_key" ON "ProjectShare"("shareId");

-- CreateIndex
CREATE INDEX "ProjectShare_projectId_idx" ON "ProjectShare"("projectId");

-- CreateIndex
CREATE INDEX "ProjectShare_createdBy_idx" ON "ProjectShare"("createdBy");

-- CreateIndex
CREATE INDEX "ProjectShare_shareId_idx" ON "ProjectShare"("shareId");

-- CreateIndex
CREATE INDEX "ProjectShare_expiresAt_idx" ON "ProjectShare"("expiresAt");

-- CreateIndex
CREATE INDEX "ProjectShareAccess_shareId_idx" ON "ProjectShareAccess"("shareId");

-- CreateIndex
CREATE INDEX "ProjectShareAccess_userId_idx" ON "ProjectShareAccess"("userId");

-- CreateIndex
CREATE INDEX "ProjectShareAccess_accessedAt_idx" ON "ProjectShareAccess"("accessedAt");

-- CreateIndex
CREATE INDEX "ProjectCollaborator_projectId_idx" ON "ProjectCollaborator"("projectId");

-- CreateIndex
CREATE INDEX "ProjectCollaborator_userId_idx" ON "ProjectCollaborator"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectCollaborator_projectId_userId_key" ON "ProjectCollaborator"("projectId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectInvitation_token_key" ON "ProjectInvitation"("token");

-- CreateIndex
CREATE INDEX "ProjectInvitation_projectId_idx" ON "ProjectInvitation"("projectId");

-- CreateIndex
CREATE INDEX "ProjectInvitation_email_idx" ON "ProjectInvitation"("email");

-- CreateIndex
CREATE INDEX "AllowedDomain_projectId_idx" ON "AllowedDomain"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "AllowedDomain_projectId_domain_key" ON "AllowedDomain"("projectId", "domain");

-- CreateIndex
CREATE INDEX "Version_flowId_idx" ON "Version"("flowId");

-- CreateIndex
CREATE INDEX "Version_createdBy_idx" ON "Version"("createdBy");

-- CreateIndex
CREATE UNIQUE INDEX "Version_flowId_version_key" ON "Version"("flowId", "version");

-- CreateIndex
CREATE INDEX "AuditLog_projectId_idx" ON "AuditLog"("projectId");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_entityId_idx" ON "AuditLog"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "ChartInstance_userId_idx" ON "ChartInstance"("userId");

-- CreateIndex
CREATE INDEX "ChartInstance_projectId_idx" ON "ChartInstance"("projectId");

-- CreateIndex
CREATE INDEX "ChartInstance_isPublished_idx" ON "ChartInstance"("isPublished");

-- CreateIndex
CREATE UNIQUE INDEX "Project_apiKey_key" ON "Project"("apiKey");

-- CreateIndex
CREATE INDEX "Project_isPublic_idx" ON "Project"("isPublic");

-- AddForeignKey
ALTER TABLE "ProjectShare" ADD CONSTRAINT "ProjectShare_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectShare" ADD CONSTRAINT "ProjectShare_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectShareAccess" ADD CONSTRAINT "ProjectShareAccess_shareId_fkey" FOREIGN KEY ("shareId") REFERENCES "ProjectShare"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectShareAccess" ADD CONSTRAINT "ProjectShareAccess_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectCollaborator" ADD CONSTRAINT "ProjectCollaborator_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectCollaborator" ADD CONSTRAINT "ProjectCollaborator_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectInvitation" ADD CONSTRAINT "ProjectInvitation_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectInvitation" ADD CONSTRAINT "ProjectInvitation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AllowedDomain" ADD CONSTRAINT "AllowedDomain_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChartInstance" ADD CONSTRAINT "ChartInstance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChartInstance" ADD CONSTRAINT "ChartInstance_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Version" ADD CONSTRAINT "Version_flowId_fkey" FOREIGN KEY ("flowId") REFERENCES "ChartInstance"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Version" ADD CONSTRAINT "Version_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
