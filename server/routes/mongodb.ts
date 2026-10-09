import { Router } from 'express';
import { db } from '../config/db.js';
import { MONGODB_ARCHITECTURE_GUIDE } from '../models/mongooseSchemas.js';

const router = Router();

// GET /api/mongodb/overview - returns schema definitions, indexing, and steps to build MongoDB
router.get('/overview', (_req, res) => {
  res.json({
    success: true,
    data: MONGODB_ARCHITECTURE_GUIDE,
    liveStats: {
      userCount: db.users.length,
      serviceCount: db.services.length,
      providerCount: db.providers.length,
      bookingCount: db.bookings.length,
      reviewCount: db.reviews.length,
      engine: 'MongoDB / Mongoose Compatible Document Engine'
    }
  });
});

// POST /api/mongodb/query - live MongoDB query explorer
router.post('/query', (req, res) => {
  const { operation, collection, filter, payload } = req.body;

  try {
    let result: any = null;
    let queryExplanation = '';

    switch (operation) {
      case 'find':
        if (collection === 'services') {
          result = db.services.slice(0, 5);
          queryExplanation = `db.services.find(${JSON.stringify(filter || {})}).limit(5)`;
        } else if (collection === 'providers') {
          result = db.providers.slice(0, 3).map(p => ({
            ...p,
            user: db.users.find(u => u._id === p.userId)
          }));
          queryExplanation = `db.providers.aggregate([{ $lookup: { from: 'users', localField: 'userId', foreignField: '_id', as: 'user' } }])`;
        } else if (collection === 'bookings') {
          result = db.bookings.slice(0, 4).map(b => ({
            ...b,
            service: db.services.find(s => s._id === b.serviceId),
            customer: db.users.find(u => u._id === b.customerId)
          }));
          queryExplanation = `db.bookings.find().sort({ createdAt: -1 }).populate('serviceId customerId')`;
        } else {
          result = db.users.slice(0, 4).map(u => ({ ...u, password: '[PROTECTED_BCRYPT_HASH]' }));
          queryExplanation = `db.users.find({}, { password: 0 })`;
        }
        break;

      case 'insert':
        if (collection === 'services') {
          const newDoc = {
            _id: `srv_custom_${Date.now()}`,
            name: payload?.name || 'Custom Home Care Task',
            category: payload?.category || 'plumbing',
            description: payload?.description || 'Instant doorstep service',
            basePrice: Number(payload?.basePrice) || 499,
            duration: 60,
            icon: '🛠️',
            inclusions: ['Diagnostic inspection', 'Labor up to 1 hr'],
            exclusions: ['Hardware parts'],
            isActive: true,
            keywords: ['custom', 'home']
          };
          db.services.push(newDoc as any);
          db.save();
          result = newDoc;
          queryExplanation = `db.services.insertOne(${JSON.stringify(newDoc)})`;
        }
        break;

      case 'aggregate':
        const stats = {
          totalRevenue: db.bookings.filter(b => b.status === 'completed').reduce((sum, b) => sum + (b.priceBreakdown?.total || 0), 0),
          categoryCounts: db.services.map(s => ({
            service: s.name,
            category: s.category,
            bookings: db.bookings.filter(b => b.serviceId === s._id).length
          }))
        };
        result = stats;
        queryExplanation = `db.bookings.aggregate([{ $match: { status: 'completed' } }, { $group: { _id: '$serviceId', totalRevenue: { $sum: '$priceBreakdown.total' } } }])`;
        break;

      default:
        result = { message: 'Select an operation' };
        queryExplanation = 'db.collection.operation()';
    }

    res.json({
      success: true,
      operation,
      collection,
      queryExplanation,
      result
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
