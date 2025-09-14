import express from 'express';
import { createNotification, getMyNotifications } from '../controllers/notificationController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Route for officers to create a notification
router.route('/')
  .post(protect, authorize('Officer'), createNotification);

// Route for citizens and workers to get their notifications
router.route('/my-notifications')
  .get(protect, authorize('Citizen', 'Worker'), getMyNotifications);

export default router;