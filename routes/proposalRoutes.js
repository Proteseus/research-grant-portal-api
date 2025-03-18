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
import { authMiddleware, authenticate } from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';
import { proposalUpload } from '../utils/fileUpload.js';

const router = express.Router();

// Apply auth middleware to all proposal routes
router.use(authenticate);

// Researcher-only routes
router.post(
  '/',
  roleMiddleware(['RESEARCHER']),
  proposalUpload,
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
  proposalUpload,
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
