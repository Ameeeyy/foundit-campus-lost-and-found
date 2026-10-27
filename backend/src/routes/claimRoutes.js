import express from 'express';
import { confirmReturn, listClaims, reviewClaim, submitClaim } from '../controllers/claimController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, listClaims);
router.post('/', protect, submitClaim);
router.patch('/:id/review', protect, reviewClaim);
router.post('/confirm-return', protect, confirmReturn);

export default router;
