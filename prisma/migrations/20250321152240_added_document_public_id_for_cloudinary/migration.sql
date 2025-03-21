-- AlterTable
ALTER TABLE "Proposal" ADD COLUMN     "documentPublicId" TEXT;

-- AlterTable
ALTER TABLE "ProposalRevision" ADD COLUMN     "revisedDocumentPublicId" TEXT;
