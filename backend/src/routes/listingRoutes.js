import express from 'express';
import { createListing, getDashboard, getListing, getMatches, listListings } from '../controllers/listingController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/', listListings);
router.get('/dashboard', protect, getDashboard);
router.get('/:id/matches', protect, getMatches);
router.get('/:id', getListing);
router.post('/', protect, createListing);

export default router;
