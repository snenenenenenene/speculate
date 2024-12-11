-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "variables" JSONB[] DEFAULT ARRAY[]::JSONB[];
