-- CreateEnum
CREATE TYPE "ReportType" AS ENUM ('LEZIONE_SINGOLA', 'LEZIONE_GRUPPO', 'ALTRO');

-- CreateTable
CREATE TABLE "reports" (
    "id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "type" "ReportType" NOT NULL,
    "coachId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "reports_coachId_idx" ON "reports"("coachId");

-- CreateIndex
CREATE INDEX "reports_date_idx" ON "reports"("date");

-- CreateIndex
CREATE INDEX "reports_type_idx" ON "reports"("type");

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_coachId_fkey" FOREIGN KEY ("coachId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
