import express from 'express';
import { 
    createComplaint, 
    getComplaints, 
    getMyResolutions,
    assignComplaint,
    resolveComplaint
} from '../controllers/complaintController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.route('/')
    .post(protect, upload.single('photo'), createComplaint)
    .get(protect, authorize('Officer'), getComplaints);

router.route('/my-resolutions')
    .get(protect, authorize('Worker'), getMyResolutions);

router.route('/:id/assign')
    .put(protect, authorize('Officer'), assignComplaint);

router.route('/:id/resolve')
    .put(protect, authorize('Worker'), resolveComplaint);

export default router;