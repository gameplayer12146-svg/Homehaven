import { Response } from 'express';
import { db, IBooking } from '../config/db.js';
import { AuthRequest } from '../middleware/auth.js';

function populateBooking(b: IBooking) {
  const service = db.services.find(s => s._id === b.serviceId);
  const provider = db.providers.find(p => p._id === b.providerId);
  const providerUser = provider ? db.users.find(u => u._id === provider.userId) : null;
  const customer = db.users.find(u => u._id === b.customerId);
  const review = db.reviews.find(r => r.bookingId === b._id);

  return {
    ...b,
    service: service || null,
    provider: provider ? {
      ...provider,
      user: providerUser ? {
        _id: providerUser._id,
        name: providerUser.name,
        email: providerUser.email,
        phone: providerUser.phone,
        avatar: providerUser.avatar
      } : null
    } : null,
    customer: customer ? {
      _id: customer._id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      avatar: customer.avatar
    } : null,
    review: review || null
  };
}

export async function createBooking(req: AuthRequest, res: Response) {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Not authenticated.' });
  }

  const { providerId, serviceId, date, timeSlot, address, problemNote } = req.body;

  if (!providerId || !serviceId || !date || !timeSlot || !address) {
    return res.status(400).json({
      success: false,
      message: 'Provider, service, date, time slot, and address are required.'
    });
  }

  const provider = db.providers.find(p => p._id === providerId);
  if (!provider) {
    return res.status(404).json({ success: false, message: 'Selected provider not found.' });
  }

  const service = db.services.find(s => s._id === serviceId);
  if (!service) {
    return res.status(404).json({ success: false, message: 'Selected service not found.' });
  }

  // Conflict Check: Check if this provider is already booked at that date & time
  const conflict = db.bookings.find(
    b => b.providerId === providerId &&
         b.date === date &&
         b.timeSlot === timeSlot &&
         b.status !== 'cancelled'
  );

  if (conflict) {
    return res.status(400).json({
      success: false,
      message: `The selected time slot (${timeSlot}) on ${date} is already reserved for this specialist. Please select another slot.`
    });
  }

  // Transparent Price Breakdown (INR)
  const visitFee = 149;
  const estimate = service.basePrice;
  const subtotal = visitFee + estimate;
  const tax = Math.round(subtotal * 0.18);
  const total = subtotal + tax;

  const bookingId = `book_${Date.now()}`;
  const now = new Date().toISOString();

  const newBooking: IBooking = {
    _id: bookingId,
    customerId: req.user._id,
    providerId,
    serviceId,
    date,
    timeSlot,
    address: {
      label: address.label || 'Home',
      line: address.line || '',
      city: address.city || '',
      pincode: address.pincode || '',
      lat: address.lat,
      lng: address.lng
    },
    problemNote: problemNote || '',
    status: 'requested',
    priceBreakdown: {
      visitFee,
      estimate,
      tax,
      total
    },
    timeline: [
      {
        status: 'requested',
        at: now,
        note: 'Booking requested by customer'
      }
    ],
    createdAt: now
  };

  db.bookings.unshift(newBooking);
  db.save();

  res.status(201).json({
    success: true,
    booking: populateBooking(newBooking)
  });
}

export async function getMyBookings(req: AuthRequest, res: Response) {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Not authenticated.' });
  }

  let list: IBooking[] = [];

  if (req.user.role === 'admin') {
    list = [...db.bookings];
  } else if (req.user.role === 'provider') {
    const providerProfile = db.providers.find(p => p.userId === req.user?._id);
    if (providerProfile) {
      list = db.bookings.filter(b => b.providerId === providerProfile._id);
    }
  } else {
    list = db.bookings.filter(b => b.customerId === req.user?._id);
  }

  // Sort by date/createdAt descending
  list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  res.json({
    success: true,
    count: list.length,
    bookings: list.map(populateBooking)
  });
}

export async function getBookingById(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const booking = db.bookings.find(b => b._id === id);

  if (!booking) {
    return res.status(404).json({ success: false, message: 'Booking not found.' });
  }

  // Authorization check: customer, provider, or admin
  const user = req.user;
  if (user && user.role !== 'admin') {
    const provider = db.providers.find(p => p._id === booking.providerId);
    const isOwner = booking.customerId === user._id || (provider && provider.userId === user._id);
    if (!isOwner) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }
  }

  res.json({
    success: true,
    booking: populateBooking(booking)
  });
}

export async function updateBookingStatus(req: AuthRequest, res: Response) {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Not authenticated.' });
  }

  const { id } = req.params;
  const { status, note } = req.body;

  const validStatuses = ['requested', 'accepted', 'on_the_way', 'in_progress', 'completed', 'cancelled'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: `Invalid status '${status}'.` });
  }

  const booking = db.bookings.find(b => b._id === id);
  if (!booking) {
    return res.status(404).json({ success: false, message: 'Booking not found.' });
  }

  const provider = db.providers.find(p => p._id === booking.providerId);
  const isAuthorized =
    req.user.role === 'admin' ||
    (provider && provider.userId === req.user._id) ||
    (req.user._id === booking.customerId && (status === 'cancelled'));

  if (!isAuthorized) {
    return res.status(403).json({ success: false, message: 'Not authorized to change this booking status.' });
  }

  booking.status = status;
  booking.timeline.push({
    status,
    at: new Date().toISOString(),
    note: note || `Status updated to ${status.replace(/_/g, ' ')}`
  });

  // If completed, increment jobs done
  if (status === 'completed' && provider) {
    provider.jobsDone = (provider.jobsDone || 0) + 1;
    // Update trust score
    provider.trustScore = Math.min(99, Math.round(
      (provider.rating * 14) +
      Math.min(provider.jobsDone * 0.25, 20) +
      Math.min(provider.experience * 1.2, 10)
    ));
  }

  db.save();

  res.json({
    success: true,
    booking: populateBooking(booking)
  });
}

export async function rescheduleBooking(req: AuthRequest, res: Response) {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Not authenticated.' });
  }

  const { id } = req.params;
  const { date, timeSlot } = req.body;

  const booking = db.bookings.find(b => b._id === id);
  if (!booking) {
    return res.status(404).json({ success: false, message: 'Booking not found.' });
  }

  if (booking.customerId !== req.user._id && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Only booking owner can reschedule.' });
  }

  if (booking.status === 'completed' || booking.status === 'cancelled') {
    return res.status(400).json({ success: false, message: 'Cannot reschedule completed or cancelled booking.' });
  }

  // Conflict Check
  const conflict = db.bookings.find(
    b => b._id !== id &&
         b.providerId === booking.providerId &&
         b.date === date &&
         b.timeSlot === timeSlot &&
         b.status !== 'cancelled'
  );

  if (conflict) {
    return res.status(400).json({
      success: false,
      message: `The selected time slot (${timeSlot}) on ${date} is already reserved. Please pick another slot.`
    });
  }

  const oldDate = booking.date;
  const oldSlot = booking.timeSlot;

  booking.date = date;
  booking.timeSlot = timeSlot;
  booking.timeline.push({
    status: booking.status,
    at: new Date().toISOString(),
    note: `Rescheduled from ${oldDate} ${oldSlot} to ${date} ${timeSlot}`
  });

  db.save();

  res.json({
    success: true,
    booking: populateBooking(booking)
  });
}

export async function cancelBooking(req: AuthRequest, res: Response) {
  return updateBookingStatus(req, res);
}
