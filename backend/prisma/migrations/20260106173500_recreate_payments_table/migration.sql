-- DropForeignKey (se esiste)
ALTER TABLE "payments" DROP CONSTRAINT IF EXISTS "payments_memberId_fkey";

-- DropTable
DROP TABLE IF EXISTS "payments";

-- DropEnum (vecchi enum se esistono)
DROP TYPE IF EXISTS "PaymentType";
DROP TYPE IF EXISTS "PaymentStatus";

-- CreateEnum
CREATE TYPE "PaymentTypeNew" AS ENUM ('ABBONAMENTO_ANNUALE', 'LEZIONE', 'RIMBORSO', 'ALTRO');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('ENTRATA', 'USCITA');

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" "PaymentTypeNew" NOT NULL,
    "quantity" INTEGER,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "transactionType" "TransactionType" NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "isPaid" BOOLEAN NOT NULL DEFAULT false,
    "coachId" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "payments_coachId_idx" ON "payments"("coachId");

-- CreateIndex
CREATE INDEX "payments_date_idx" ON "payments"("date");

-- CreateIndex
CREATE INDEX "payments_type_idx" ON "payments"("type");

-- CreateIndex
CREATE INDEX "payments_isPaid_idx" ON "payments"("isPaid");

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_coachId_fkey" FOREIGN KEY ("coachId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
