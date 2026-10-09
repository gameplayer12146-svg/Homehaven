import { Router } from 'express';
import { getProviders, getProviderById, updateProviderProfile } from '../controllers/providerController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();

router.get('/', getProviders);
router.get('/:id', getProviderById);
router.put('/profile', protect, authorize('provider'), updateProviderProfile);

export default router;
