import express from 'express';
import {
  createCall,
  getCalls,
  getCall,
  updateCall,
  deleteCall
} from '../controllers/callController.js';
import { authMiddleware, authenticate } from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Admin-only routes
router.use(authenticate);

// List all calls
router.get('/', getCalls);

// Get call details
router.get('/:id', getCall);

router.use(roleMiddleware(['ADMIN']));

// Create new call for proposals
router.post('/', createCall);

// Update call
router.put('/:id', updateCall);

// Delete call
router.delete('/:id', deleteCall);

export default router;
