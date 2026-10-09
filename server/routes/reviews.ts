import { Router } from 'express';
import { createReview, getProviderReviews } from '../controllers/reviewController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();

router.post('/', protect, authorize('customer'), createReview);
router.get('/provider/:id', getProviderReviews);

export default router;
