import { Router } from 'express';
import { getStats, getAdminProviders, updateProviderApproval } from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();

router.get('/stats', protect, authorize('admin'), getStats);
router.get('/providers', protect, authorize('admin'), getAdminProviders);
router.patch('/providers/:providerId', protect, authorize('admin'), updateProviderApproval);

export default router;
