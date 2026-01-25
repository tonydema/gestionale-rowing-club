-- CreateEnum
CREATE TYPE "WorkoutType" AS ENUM ('PESI', 'CORSA', 'REMERGOMETRO', 'BARCA', 'BIKE');

-- CreateTable
CREATE TABLE "workouts" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "notes" TEXT,
    "startDateTime" TIMESTAMP(3) NOT NULL,
    "endDateTime" TIMESTAMP(3) NOT NULL,
    "type" "WorkoutType" NOT NULL,
    "distance" INTEGER,
    "repetitions" INTEGER,
    "weightDescription" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workouts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "workouts_groupId_idx" ON "workouts"("groupId");

-- CreateIndex
CREATE INDEX "workouts_startDateTime_idx" ON "workouts"("startDateTime");

-- CreateIndex
CREATE INDEX "workouts_type_idx" ON "workouts"("type");

-- AddForeignKey
ALTER TABLE "workouts" ADD CONSTRAINT "workouts_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workouts" ADD CONSTRAINT "workouts_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
