import express from 'express';
import {
  getCurrentUser,
  updateCurrentUser,
  getUserNotifications,
  markNotificationAsRead
} from '../controllers/userController.js';
import { authMiddleware, authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply auth middleware to all user routes
router.use(authenticate);

// Get current user profile
router.get('/me', getCurrentUser);

// Update current user profile
router.put('/me', updateCurrentUser);

// Get user notifications
router.get('/me/notifications', getUserNotifications);

// Mark notification as read
router.put('/me/notifications/:id', markNotificationAsRead);

export default router;
