import express from 'express';
import { applyToNotice, getMyApplications, getNoticeApplicants, updateApplicationStatus } from '../controllers/applicationController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/apply/:noticeId', protect, authorize('worker'), applyToNotice);
router.get('/my-applications', protect, authorize('worker'), getMyApplications);
router.get('/notice/:noticeId', protect, authorize('employer'), getNoticeApplicants);
router.put('/:id/status', protect, updateApplicationStatus);

export default router;
