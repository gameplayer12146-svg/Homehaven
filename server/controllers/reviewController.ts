import { Request, Response } from 'express';
import { db, IReview } from '../config/db.js';
import { AuthRequest } from '../middleware/auth.js';

export async function createReview(req: AuthRequest, res: Response) {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Not authenticated.' });
  }

  const { bookingId, rating, tags, comment } = req.body;

  if (!bookingId || !rating) {
    return res.status(400).json({ success: false, message: 'Booking ID and numeric rating are required.' });
  }

  const booking = db.bookings.find(b => b._id === bookingId);
  if (!booking) {
    return res.status(404).json({ success: false, message: 'Booking not found.' });
  }

  if (booking.customerId !== req.user._id) {
    return res.status(403).json({ success: false, message: 'You can only review your own bookings.' });
  }

  if (booking.status !== 'completed') {
    return res.status(400).json({ success: false, message: 'You can only review completed service visits.' });
  }

  const existingReview = db.reviews.find(r => r.bookingId === bookingId);
  if (existingReview) {
    return res.status(400).json({ success: false, message: 'You have already submitted a review for this booking.' });
  }

  const numRating = Math.max(1, Math.min(5, Number(rating)));
  const reviewId = `rev_${Date.now()}`;

  const newReview: IReview = {
    _id: reviewId,
    bookingId,
    customerId: req.user._id,
    providerId: booking.providerId,
    rating: numRating,
    tags: Array.isArray(tags) ? tags : [],
    comment: comment || '',
    createdAt: new Date().toISOString()
  };

  db.reviews.unshift(newReview);

  // Recalculate provider rating & count
  const provider = db.providers.find(p => p._id === booking.providerId);
  if (provider) {
    const provReviews = db.reviews.filter(r => r.providerId === provider._id);
    const sum = provReviews.reduce((acc, r) => acc + r.rating, 0);
    const avg = Number((sum / provReviews.length).toFixed(2));
    provider.rating = avg;
    provider.reviewCount = provReviews.length;

    // Recalculate trust score
    provider.trustScore = Math.min(99, Math.round(
      (provider.rating * 14) +
      Math.min(provider.jobsDone * 0.25, 20) +
      Math.min(provider.experience * 1.2, 10)
    ));
  }

  db.save();

  res.status(201).json({
    success: true,
    review: newReview
  });
}

export async function getProviderReviews(req: Request, res: Response) {
  const { id } = req.params;
  const reviews = db.reviews.filter(r => r.providerId === id);

  const populated = reviews.map(r => {
    const customer = db.users.find(u => u._id === r.customerId);
    return {
      ...r,
      customer: customer ? {
        _id: customer._id,
        name: customer.name,
        avatar: customer.avatar
      } : { name: 'Verified Customer' }
    };
  });

  res.json({
    success: true,
    count: populated.length,
    reviews: populated
  });
}
