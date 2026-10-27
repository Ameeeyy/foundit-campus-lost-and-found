import express from 'express';
import { listNotifications, markNotificationsRead } from '../controllers/notificationController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, listNotifications);
router.patch('/read', protect, markNotificationsRead);

export default router;
