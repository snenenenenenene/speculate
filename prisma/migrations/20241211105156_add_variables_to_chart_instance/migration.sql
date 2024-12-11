-- AlterTable
ALTER TABLE "ChartInstance" ADD COLUMN     "variables" JSONB[] DEFAULT ARRAY[]::JSONB[];
