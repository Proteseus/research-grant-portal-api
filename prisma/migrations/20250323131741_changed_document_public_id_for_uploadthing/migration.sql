/*
  Warnings:

  - You are about to drop the column `documentPublicId` on the `Proposal` table. All the data in the column will be lost.
  - You are about to drop the column `revisedDocumentPublicId` on the `ProposalRevision` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Proposal" DROP COLUMN "documentPublicId",
ADD COLUMN     "documentKey" TEXT;

-- AlterTable
ALTER TABLE "ProposalRevision" DROP COLUMN "revisedDocumentPublicId",
ADD COLUMN     "revisedDocumentKey" TEXT;
