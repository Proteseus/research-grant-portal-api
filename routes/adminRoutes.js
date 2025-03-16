import express from 'express';
import {
  getStats,
  getProposals,
  getUsers,
  updateUserRole
} from '../controllers/adminController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Apply auth and admin role middleware to all routes
router.use(authMiddleware);
router.use(roleMiddleware('ADMIN'));

// Dashboard statistics
router.get('/stats', getStats);

// Proposal management
router.get('/proposals', getProposals);

// User management
router.get('/users', getUsers);
router.put('/users/:id/role', updateUserRole);

export default router;
