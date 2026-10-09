import { Request, Response } from 'express';
import { db, IProvider } from '../config/db.js';
import { AuthRequest } from '../middleware/auth.js';

export async function getProviders(req: Request, res: Response) {
  const { serviceId, city, minRating } = req.query;

  let providers = [...db.providers];

  // Filter only approved providers for public listing
  providers = providers.filter(p => {
    const user = db.users.find(u => u._id === p.userId);
    return user && user.isApproved;
  });

  if (serviceId && typeof serviceId === 'string' && serviceId !== 'all') {
    providers = providers.filter(p => p.services.includes(serviceId));
  }

  if (city && typeof city === 'string' && city !== 'all') {
    providers = providers.filter(p => p.city.toLowerCase() === city.toLowerCase());
  }

  if (minRating && !isNaN(Number(minRating))) {
    providers = providers.filter(p => p.rating >= Number(minRating));
  }

  const detailed = providers.map(p => {
    const user = db.users.find(u => u._id === p.userId);
    const services = db.services.filter(s => p.services.includes(s._id));
    return {
      ...p,
      user: user ? {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar
      } : null,
      serviceDetails: services
    };
  });

  res.json({
    success: true,
    count: detailed.length,
    providers: detailed
  });
}

export async function getProviderById(req: Request, res: Response) {
  const { id } = req.params;
  const provider = db.providers.find(p => p._id === id);

  if (!provider) {
    return res.status(404).json({ success: false, message: 'Provider not found.' });
  }

  const user = db.users.find(u => u._id === provider.userId);
  const services = db.services.filter(s => provider.services.includes(s._id));
  const reviews = db.reviews.filter(r => r.providerId === provider._id).map(r => {
    const customer = db.users.find(u => u._id === r.customerId);
    return {
      ...r,
      customer: customer ? { name: customer.name, avatar: customer.avatar } : { name: 'Customer' }
    };
  });

  res.json({
    success: true,
    provider: {
      ...provider,
      user: user ? {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        isApproved: user.isApproved
      } : null,
      serviceDetails: services,
      reviews
    }
  });
}

export async function updateProviderProfile(req: AuthRequest, res: Response) {
  if (!req.user || req.user.role !== 'provider') {
    return res.status(403).json({ success: false, message: 'Only providers can update this profile.' });
  }

  let provider = db.providers.find(p => p.userId === req.user?._id);

  if (!provider) {
    // If provider record doesn't exist yet, create one
    provider = {
      _id: `prov_${Date.now()}`,
      userId: req.user._id,
      services: [],
      experience: 1,
      rating: 5.0,
      reviewCount: 0,
      jobsDone: 0,
      trustScore: 85,
      availability: { days: [1, 2, 3, 4, 5], slots: ['09:00', '11:00', '14:00', '16:00'] },
      city: 'Austin',
      bio: ''
    };
    db.providers.push(provider);
  }

  const { services, experience, availability, city, bio } = req.body;

  if (Array.isArray(services)) provider.services = services;
  if (experience !== undefined) provider.experience = Number(experience);
  if (availability) {
    provider.availability = {
      days: Array.isArray(availability.days) ? availability.days : provider.availability.days,
      slots: Array.isArray(availability.slots) ? availability.slots : provider.availability.slots
    };
  }
  if (city) provider.city = city;
  if (bio !== undefined) provider.bio = bio;

  // Recalculate trust score
  provider.trustScore = Math.min(99, Math.max(70, Math.round(
    (provider.rating * 14) +
    Math.min(provider.jobsDone * 0.25, 20) +
    Math.min(provider.experience * 1.2, 10)
  )));

  db.save();

  res.json({
    success: true,
    provider
  });
}
