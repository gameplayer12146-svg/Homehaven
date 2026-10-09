/**
 * MongoDB / Mongoose Data Models & Architecture
 * Defines Schema specifications for Service, Provider, Customer (User), Booking, and Review
 * with full indexing for Date, Time, and Geo Location (2dsphere).
 */

export const MONGODB_ARCHITECTURE_GUIDE = {
  systemOverview: "The HomeHaven architecture utilizes MongoDB document collections to manage services, verified craftspeople, customer accounts, and real-time appointment scheduling with conflict prevention across Indian metro locations.",
  collections: [
    {
      name: "users",
      description: "Manages customer, provider, and admin profiles, credentials, and Indian residential addresses.",
      schemaDefinition: `const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, index: true },
  password: { type: String, required: true }, // bcrypt hashed (10 salt rounds)
  phone: { type: String, required: true },
  role: { type: String, enum: ['customer', 'provider', 'admin'], default: 'customer' },
  avatar: { type: String, default: '' },
  addresses: [{
    label: { type: String, required: true }, // e.g. "Primary Residence", "Family Home"
    line: { type: String, required: true }, // Flat 402, Shanthi Niketan, 7th Main, Koramangala
    city: { type: String, required: true }, // Bengaluru, Mumbai, Hyderabad
    pincode: { type: String, required: true }, // 6-digit Indian PIN (e.g. 560034)
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [77.6245, 12.9352] } // [longitude, latitude]
    }
  }],
  isApproved: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

// Pre-save hook for password hashing
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Authentication comparison method
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};`,
      indexes: [
        { fields: "{ email: 1 }", unique: true, type: "Unique B-tree" },
        { fields: "{ 'addresses.location': '2dsphere' }", unique: false, type: "Geospatial 2dsphere" }
      ]
    },
    {
      name: "services",
      description: "Manages 8 core repair and maintenance categories, INR rate cards, checklists, and symptom search keywords.",
      schemaDefinition: `const ServiceSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  category: { 
    type: String, 
    required: true, 
    enum: ['plumbing', 'electrical', 'cleaning', 'ac_repair', 'painting', 'pest_control', 'appliance_repair', 'carpentry'],
    index: true 
  },
  description: { type: String, required: true },
  basePrice: { type: Number, required: true, min: 0 }, // In INR (₹)
  duration: { type: Number, required: true }, // In minutes
  icon: { type: String, required: true },
  inclusions: [{ type: String }],
  exclusions: [{ type: String }],
  isActive: { type: Boolean, default: true, index: true },
  keywords: [{ type: String, index: true }] // Search indexing for problem queries
}, { timestamps: true });

// Text index for problem-first search mapping
ServiceSchema.index({ name: 'text', description: 'text', keywords: 'text' });`,
      indexes: [
        { fields: "{ category: 1, isActive: 1 }", unique: false, type: "Compound" },
        { fields: "{ name: 'text', description: 'text', keywords: 'text' }", unique: false, type: "Text Index" }
      ]
    },
    {
      name: "providers",
      description: "Manages vetted specialist profiles, verified trade experience, trust scores, and weekly working slots.",
      schemaDefinition: `const ProviderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  services: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Service' }],
  experience: { type: Number, required: true, default: 5 }, // Years
  rating: { type: Number, default: 5.0, min: 0, max: 5 },
  reviewCount: { type: Number, default: 0 },
  jobsDone: { type: Number, default: 0 },
  trustScore: { type: Number, default: 95, min: 0, max: 100 },
  availability: {
    days: [{ type: Number, min: 0, max: 6 }], // 0 (Sun) - 6 (Sat)
    slots: [{ type: String }] // ['09:00', '11:00', '14:00', '16:30']
  },
  city: { type: String, required: true, index: true }, // Bengaluru, Mumbai, Hyderabad
  bio: { type: String, default: '' }
}, { timestamps: true });`,
      indexes: [
        { fields: "{ userId: 1 }", unique: true, type: "Unique Ref" },
        { fields: "{ city: 1, rating: -1 }", unique: false, type: "Compound Sort" },
        { fields: "{ services: 1 }", unique: false, type: "Multikey Index" }
      ]
    },
    {
      name: "bookings",
      description: "Manages appointments linking customer, specialist, service, date, time slot, and Indian location address.",
      schemaDefinition: `const BookingSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  providerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Provider', required: true, index: true },
  serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
  date: { type: String, required: true, index: true }, // 'YYYY-MM-DD'
  timeSlot: { type: String, required: true }, // '09:00', '11:00', '14:00'
  address: {
    label: { type: String, default: 'Home' },
    line: { type: String, required: true },
    city: { type: String, required: true },
    pincode: { type: String, required: true },
    lat: { type: Number },
    lng: { type: Number }
  },
  problemNote: { type: String, default: '' },
  status: {
    type: String,
    enum: ['requested', 'accepted', 'on_the_way', 'in_progress', 'completed', 'cancelled'],
    default: 'requested',
    index: true
  },
  priceBreakdown: {
    visitFee: { type: Number, default: 149 }, // ₹149 Visit & Inspection
    estimate: { type: Number, required: true }, // Service rate
    tax: { type: Number, required: true }, // 18% GST
    total: { type: Number, required: true }
  },
  timeline: [{
    status: { type: String, required: true },
    at: { type: Date, default: Date.now },
    note: { type: String }
  }]
}, { timestamps: true });

// CRITICAL: Double-booking prevention index
BookingSchema.index(
  { providerId: 1, date: 1, timeSlot: 1 },
  { 
    unique: true, 
    partialFilterExpression: { status: { $ne: 'cancelled' } } 
  }
);`,
      indexes: [
        { fields: "{ providerId: 1, date: 1, timeSlot: 1 }", unique: true, type: "Partial Unique (Non-cancelled slots)" },
        { fields: "{ customerId: 1, createdAt: -1 }", unique: false, type: "Customer History" },
        { fields: "{ status: 1, date: 1 }", unique: false, type: "Status Filtering" }
      ]
    },
    {
      name: "reviews",
      description: "Customer feedback, star ratings, and punctuality/quality tags post-service completion.",
      schemaDefinition: `const ReviewSchema = new mongoose.Schema({
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true, unique: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  providerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Provider', required: true, index: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  tags: [{ type: String }], // 'punctual', 'clean work', 'polite behavior'
  comment: { type: String, default: '' }
}, { timestamps: true });

// Post-save hook to recalculate provider rating & trust score
ReviewSchema.post('save', async function() {
  const reviews = await this.model('Review').find({ providerId: this.providerId });
  const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  await mongoose.model('Provider').findByIdAndUpdate(this.providerId, {
    rating: parseFloat(avg.toFixed(2)),
    reviewCount: reviews.length
  });
});`,
      indexes: [
        { fields: "{ bookingId: 1 }", unique: true, type: "1 Review per Booking" },
        { fields: "{ providerId: 1, rating: -1 }", unique: false, type: "Provider Reviews" }
      ]
    }
  ],
  crudOperations: {
    create: {
      name: "Create Booking (INSERT)",
      mongooseCode: `const newBooking = await Booking.create({
  customerId: req.user._id,
  providerId: req.body.providerId,
  serviceId: req.body.serviceId,
  date: req.body.date,
  timeSlot: req.body.timeSlot,
  address: req.body.address,
  problemNote: req.body.problemNote,
  status: 'requested',
  priceBreakdown: calculateBreakdown(service.basePrice),
  timeline: [{ status: 'requested', at: new Date(), note: 'Booking submitted by customer' }]
});`
    },
    read: {
      name: "Read Bookings with Population (FIND + POPULATE)",
      mongooseCode: `const userBookings = await Booking.find({ customerId: req.user._id })
  .populate('serviceId', 'name category basePrice icon duration')
  .populate({
    path: 'providerId',
    populate: { path: 'userId', select: 'name phone avatar' }
  })
  .sort({ createdAt: -1 });`
    },
    update: {
      name: "Update Status & Push Timeline (FIND_ONE_AND_UPDATE)",
      mongooseCode: `const updatedBooking = await Booking.findByIdAndUpdate(
  bookingId,
  {
    $set: { status: newStatus },
    $push: { timeline: { status: newStatus, at: new Date(), note: updateNote } }
  },
  { new: true, runValidators: true }
);`
    },
    delete: {
      name: "Cancel / Delete Booking (SOFT DELETE / ARCHIVE)",
      mongooseCode: `// Soft-delete to preserve service warranty & audit logs:
const cancelled = await Booking.findByIdAndUpdate(
  bookingId,
  {
    $set: { status: 'cancelled' },
    $push: { timeline: { status: 'cancelled', at: new Date(), note: 'Cancelled by customer' } }
  },
  { new: true }
);`
    }
  },
  stepsToBuild: [
    {
      step: 1,
      title: "Initialize MongoDB & Environment Connection",
      description: "Connect to MongoDB Atlas cluster or local MongoDB instance with Mongoose connection pooling and error listeners.",
      codeSnippet: `import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/homehaven';

export async function connectMongoDB() {
  try {
    await mongoose.connect(MONGO_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      autoIndex: true
    });
    console.log('MongoDB connected successfully to:', mongoose.connection.name);
  } catch (error) {
    console.error('MongoDB connection error:', error);
  }
}`
    },
    {
      step: 2,
      title: "Design Mongoose Schemas & 2dsphere / Compound Indexes",
      description: "Define schemas for Service, Provider, User (Customer), and Booking. Add compound partial indexes to guarantee zero slot conflicts.",
      codeSnippet: `// Compound Partial Index prevents overlapping provider bookings:
BookingSchema.index(
  { providerId: 1, date: 1, timeSlot: 1 },
  { unique: true, partialFilterExpression: { status: { $ne: 'cancelled' } } }
);

// 2dsphere Index enables nearby provider discovery within radius:
UserSchema.index({ 'addresses.location': '2dsphere' });`
    },
    {
      step: 3,
      title: "Implement MongoDB User Authentication with Bcrypt & JWT",
      description: "Hash passwords with bcrypt inside schema pre-save hooks. Validate credentials with matchPassword and generate tamper-proof JWT tokens.",
      codeSnippet: `// 1. Password comparison method
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// 2. JWT signing controller
export function signToken(user) {
  return jwt.sign(
    { id: user._id, role: user.role, name: user.name, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}`
    },
    {
      step: 4,
      title: "Implement Full MongoDB CRUD Endpoints",
      description: "Create RESTful API controllers with Mongoose models for Service catalog, Provider directories, and Customer Bookings.",
      codeSnippet: `// CREATE:
app.post('/api/bookings', protect, createBookingController);

// READ:
app.get('/api/bookings/mine', protect, getCustomerBookingsController);

// UPDATE:
app.patch('/api/bookings/:id/status', protect, updateBookingStatusController);

// DELETE:
app.delete('/api/bookings/:id', protect, cancelBookingController);`
    },
    {
      step: 5,
      title: "Aggregation Pipelines for Revenue, Ratings & Location Dispatch",
      description: "Run high-performance MongoDB aggregation pipelines ($group, $match, $geoNear) for live admin stats and provider trust scoring.",
      codeSnippet: `const stats = await Booking.aggregate([
  { $match: { status: 'completed' } },
  { $group: {
      _id: '$serviceId',
      totalRevenue: { $sum: '$priceBreakdown.total' },
      bookingCount: { $sum: 1 }
    }
  },
  { $sort: { totalRevenue: -1 } }
]);`
    }
  ]
};
