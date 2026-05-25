/*
  Warnings:

  - A unique constraint covering the columns `[emailId]` on the table `EmailAnalysis` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Email" ADD COLUMN     "suggestedReply" TEXT;

-- DropEnum
DROP TYPE "PaidStatus";

-- CreateIndex
CREATE INDEX "Email_userId_idx" ON "Email"("userId");

-- CreateIndex
CREATE INDEX "Email_receivedAt_idx" ON "Email"("receivedAt");

-- CreateIndex
CREATE UNIQUE INDEX "EmailAnalysis_emailId_key" ON "EmailAnalysis"("emailId");
