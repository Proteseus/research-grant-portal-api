import express from 'express';
import {
  createProposal,
  getProposals,
  getProposal,
  updateProposal,
  deleteProposal,
  createProposalRevision,
  getProposalRevisions,
  updateProposalStatus
} from '../controllers/proposalController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';
import { upload } from '../utils/fileUpload.js';

const router = express.Router();

// Apply auth middleware to all proposal routes
router.use(authMiddleware);

// Researcher-only routes
router.post(
  '/',
  roleMiddleware(['RESEARCHER']),
  upload.single('document'),
  createProposal
);

router.put(
  '/:id',
  roleMiddleware(['RESEARCHER']),
  updateProposal
);

router.delete(
  '/:id',
  roleMiddleware(['RESEARCHER']),
  deleteProposal
);

router.post(
  '/:id/revisions',
  roleMiddleware(['RESEARCHER']),
  upload.single('document'),
  createProposalRevision
);

// Shared routes
router.get('/', getProposals);
router.get('/:id', getProposal);
router.get('/:id/revisions', getProposalRevisions);

// Admin-only routes
router.put(
  '/:id/status',
  roleMiddleware(['ADMIN']),
  updateProposalStatus
);

export default router;
