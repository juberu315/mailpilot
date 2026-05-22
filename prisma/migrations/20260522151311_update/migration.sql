/*
  Warnings:

  - You are about to drop the column `session_state` on the `Account` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Account` table. All the data in the column will be lost.
  - You are about to drop the column `classification` on the `EmailAnalysis` table. All the data in the column will be lost.
  - You are about to drop the column `emailVerified` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `isApproved` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `isTwoFactorEnabled` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `User` table. All the data in the column will be lost.
  - Added the required column `category` to the `EmailAnalysis` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "EmailActionApproval" DROP CONSTRAINT "EmailActionApproval_emailId_fkey";

-- DropForeignKey
ALTER TABLE "EmailAnalysis" DROP CONSTRAINT "EmailAnalysis_emailId_fkey";

-- DropIndex
DROP INDEX "User_phone_key";

-- AlterTable
ALTER TABLE "Account" DROP COLUMN "session_state",
DROP COLUMN "type";

-- AlterTable
ALTER TABLE "Email" ADD COLUMN     "intent" TEXT,
ADD COLUMN     "sentiment" TEXT;

-- AlterTable
ALTER TABLE "EmailAnalysis" DROP COLUMN "classification",
ADD COLUMN     "category" TEXT NOT NULL,
ADD COLUMN     "intent" TEXT,
ADD COLUMN     "priority" TEXT,
ADD COLUMN     "sentiment" TEXT;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "emailVerified",
DROP COLUMN "isApproved",
DROP COLUMN "isTwoFactorEnabled",
DROP COLUMN "password",
DROP COLUMN "phone";

-- AddForeignKey
ALTER TABLE "EmailAnalysis" ADD CONSTRAINT "EmailAnalysis_emailId_fkey" FOREIGN KEY ("emailId") REFERENCES "Email"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailActionApproval" ADD CONSTRAINT "EmailActionApproval_emailId_fkey" FOREIGN KEY ("emailId") REFERENCES "Email"("id") ON DELETE CASCADE ON UPDATE CASCADE;
