import { Router } from 'express';
import {
  createBooking,
  getMyBookings,
  getBookingById,
  updateBookingStatus,
  rescheduleBooking,
  cancelBooking
} from '../controllers/bookingController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.post('/', protect, createBooking);
router.get('/mine', protect, getMyBookings);
router.get('/:id', protect, getBookingById);
router.patch('/:id/status', protect, updateBookingStatus);
router.patch('/:id/reschedule', protect, rescheduleBooking);
router.patch('/:id/cancel', protect, cancelBooking);

export default router;
