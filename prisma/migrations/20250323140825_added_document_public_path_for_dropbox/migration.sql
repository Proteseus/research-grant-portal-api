-- AlterTable
ALTER TABLE "Proposal" ADD COLUMN     "documentPath" TEXT;

-- AlterTable
ALTER TABLE "ProposalRevision" ADD COLUMN     "revisedDocumentPath" TEXT;
