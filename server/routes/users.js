import express from 'express';
import { getWorkers, addWorker, getUserStats, getLeaderboard } from '../controllers/userController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/workers')
  .get(protect, authorize('Officer'), getWorkers)
  .post(protect, authorize('Officer'), addWorker);

router.get('/stats', protect, getUserStats);
router.get('/leaderboard', protect, getLeaderboard);

export default router;