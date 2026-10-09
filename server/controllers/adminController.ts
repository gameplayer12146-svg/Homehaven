import { Response } from 'express';
import { db } from '../config/db.js';
import { AuthRequest } from '../middleware/auth.js';

export async function getStats(_req: AuthRequest, res: Response) {
  const totalUsers = db.users.filter(u => u.role === 'customer').length;
  const totalProviders = db.providers.length;
  const totalBookings = db.bookings.length;
  const completedBookings = db.bookings.filter(b => b.status === 'completed').length;
  const pendingApprovals = db.users.filter(u => u.role === 'provider' && !u.isApproved).length;

  // Calculate gross revenue
  const totalRevenue = db.bookings
    .filter(b => b.status === 'completed')
    .reduce((sum, b) => sum + (b.priceBreakdown?.total || 0), 0);

  // Bookings by category
  const categoryCounts: Record<string, { count: number; revenue: number }> = {};
  db.services.forEach(s => {
    categoryCounts[s.category] = { count: 0, revenue: 0 };
  });

  db.bookings.forEach(b => {
    const service = db.services.find(s => s._id === b.serviceId);
    const cat = service ? service.category : 'other';
    if (!categoryCounts[cat]) {
      categoryCounts[cat] = { count: 0, revenue: 0 };
    }
    categoryCounts[cat].count += 1;
    if (b.status === 'completed') {
      categoryCounts[cat].revenue += b.priceBreakdown?.total || 0;
    }
  });

  const categoryBreakdown = Object.entries(categoryCounts).map(([category, data]) => ({
    category,
    name: category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    count: data.count,
    revenue: Number(data.revenue.toFixed(2))
  }));

  // Monthly revenue breakdown (sample 6 months for chart in INR)
  const monthlyRevenue = [
    { month: 'May', revenue: 98000, bookings: 140 },
    { month: 'Jun', revenue: 145000, bookings: 210 },
    { month: 'Jul', revenue: 210000, bookings: 290 },
    { month: 'Aug', revenue: 285000, bookings: 360 },
    { month: 'Sep', revenue: 340000, bookings: 440 },
    { month: 'Oct', revenue: Number(totalRevenue.toFixed(0)) || 395000, bookings: totalBookings * 40 }
  ];

  // Recent 6 bookings
  const recentBookings = db.bookings.slice(0, 6).map(b => {
    const service = db.services.find(s => s._id === b.serviceId);
    const customer = db.users.find(u => u._id === b.customerId);
    const provider = db.providers.find(p => p._id === b.providerId);
    const providerUser = provider ? db.users.find(u => u._id === provider.userId) : null;
    return {
      _id: b._id,
      date: b.date,
      timeSlot: b.timeSlot,
      status: b.status,
      total: b.priceBreakdown.total,
      serviceName: service?.name || 'Home Service',
      customerName: customer?.name || 'Customer',
      providerName: providerUser?.name || 'Specialist'
    };
  });

  res.json({
    success: true,
    stats: {
      totalUsers,
      totalProviders,
      totalBookings,
      completedBookings,
      pendingApprovals,
      totalRevenue: Number(totalRevenue.toFixed(2)),
      categoryBreakdown,
      monthlyRevenue,
      recentBookings
    }
  });
}

export async function getAdminProviders(_req: AuthRequest, res: Response) {
  const providers = db.providers.map(p => {
    const user = db.users.find(u => u._id === p.userId);
    const services = db.services.filter(s => p.services.includes(s._id));
    return {
      ...p,
      user: user ? {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        isApproved: user.isApproved,
        createdAt: user.createdAt
      } : null,
      serviceNames: services.map(s => s.name)
    };
  });

  res.json({
    success: true,
    providers
  });
}

export async function updateProviderApproval(req: AuthRequest, res: Response) {
  const { providerId } = req.params;
  const { isApproved } = req.body;

  const provider = db.providers.find(p => p._id === providerId);
  if (!provider) {
    return res.status(404).json({ success: false, message: 'Provider not found.' });
  }

  const user = db.users.find(u => u._id === provider.userId);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User account for this provider not found.' });
  }

  user.isApproved = Boolean(isApproved);
  db.save();

  res.json({
    success: true,
    message: `Provider ${user.name} has been ${user.isApproved ? 'approved' : 'rejected'}.`,
    isApproved: user.isApproved
  });
}
