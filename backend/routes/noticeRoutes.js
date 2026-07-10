import express from 'express';
import { createNotice, getNotices, getNoticeById, updateNotice, deleteNotice, closeNotice } from '../controllers/noticeController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, authorize('employer'), createNotice)
  .get(getNotices);

router.route('/:id')
  .get(getNoticeById)
  .put(protect, authorize('employer'), updateNotice)
  .delete(protect, authorize('employer'), deleteNotice);

router.post('/:id/close', protect, authorize('employer'), closeNotice);

export default router;
