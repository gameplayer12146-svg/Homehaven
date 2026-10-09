import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load environment variables from .env or app.env
dotenv.config();
if (fs.existsSync(path.resolve(process.cwd(), 'app.env'))) {
  dotenv.config({ path: path.resolve(process.cwd(), 'app.env') });
}

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/homehaven';

// User Schema (Customers, Specialists, Admins)
const UserSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  phone: { type: String, default: '' },
  role: { type: String, default: 'customer' },
  avatar: { type: String, default: '' },
  addresses: [{
    _id: String,
    label: String,
    line: String,
    city: String,
    pincode: String,
    lat: Number,
    lng: Number
  }],
  isApproved: { type: Boolean, default: true },
  createdAt: { type: String }
}, { _id: false, timestamps: true });

// Service Schema (Repair & Maintenance Catalog)
const ServiceSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  name: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String, required: true },
  basePrice: { type: Number, required: true },
  duration: { type: Number, required: true },
  icon: { type: String, default: '🛠️' },
  inclusions: [String],
  exclusions: [String],
  isActive: { type: Boolean, default: true },
  keywords: [String]
}, { _id: false, timestamps: true });

// Provider Schema (Verified Craftsmen & Availability)
const ProviderSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  userId: { type: String, required: true },
  services: [String],
  experience: { type: Number, default: 5 },
  rating: { type: Number, default: 5.0 },
  reviewCount: { type: Number, default: 0 },
  jobsDone: { type: Number, default: 0 },
  trustScore: { type: Number, default: 95 },
  availability: {
    days: [Number],
    slots: [String]
  },
  city: { type: String, required: true },
  bio: { type: String, default: '' }
}, { _id: false, timestamps: true });

// Booking Schema (Customer, Specialist, Date, Time Slot, Location)
const BookingSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  customerId: { type: String, required: true },
  providerId: { type: String, required: true },
  serviceId: { type: String, required: true },
  date: { type: String, required: true },
  timeSlot: { type: String, required: true },
  address: {
    _id: String,
    label: String,
    line: String,
    city: String,
    pincode: String,
    lat: Number,
    lng: Number
  },
  problemNote: { type: String, default: '' },
  status: { type: String, default: 'requested' },
  priceBreakdown: {
    visitFee: Number,
    estimate: Number,
    tax: Number,
    total: Number
  },
  timeline: [{
    status: String,
    at: String,
    note: String
  }],
  createdAt: { type: String }
}, { _id: false, timestamps: true });

// Review Schema
const ReviewSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  bookingId: { type: String, required: true },
  customerId: { type: String, required: true },
  providerId: { type: String, required: true },
  rating: { type: Number, required: true },
  tags: [String],
  comment: { type: String, default: '' },
  createdAt: { type: String }
}, { _id: false, timestamps: true });

export const MongoUser = mongoose.models.User || mongoose.model('User', UserSchema);
export const MongoService = mongoose.models.Service || mongoose.model('Service', ServiceSchema);
export const MongoProvider = mongoose.models.Provider || mongoose.model('Provider', ProviderSchema);
export const MongoBooking = mongoose.models.Booking || mongoose.model('Booking', BookingSchema);
export const MongoReview = mongoose.models.Review || mongoose.model('Review', ReviewSchema);

let isConnected = false;

export async function connectMongo(): Promise<boolean> {
  try {
    mongoose.set('bufferCommands', false); // Fail fast if offline
    console.log(`[MongoDB] Connecting to ${MONGODB_URI}...`);
    
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 2000,
    });
    
    isConnected = true;
    console.log(`[MongoDB] ✅ Connected to MongoDB (${mongoose.connection.host}/${mongoose.connection.name}) - Ready for Compass!`);
    return true;
  } catch (err: any) {
    isConnected = false;
    console.warn(`[MongoDB] ℹ️ Local MongoDB server at ${MONGODB_URI} not reachable (${err.message}). Using local JSON/in-memory store fallback. Start MongoDB Compass to sync!`);
    return false;
  }
}

export function isMongoConnected(): boolean {
  return isConnected;
}

// Sync in-memory state into MongoDB collections whenever data changes
export async function syncToMongo(state: {
  users: any[];
  services: any[];
  providers: any[];
  bookings: any[];
  reviews: any[];
}) {
  if (!isConnected) return;

  try {
    // Upsert Users
    for (const u of state.users) {
      await MongoUser.findByIdAndUpdate(u._id, u, { upsert: true });
    }
    // Upsert Services
    for (const s of state.services) {
      await MongoService.findByIdAndUpdate(s._id, s, { upsert: true });
    }
    // Upsert Providers
    for (const p of state.providers) {
      await MongoProvider.findByIdAndUpdate(p._id, p, { upsert: true });
    }
    // Upsert Bookings
    for (const b of state.bookings) {
      await MongoBooking.findByIdAndUpdate(b._id, b, { upsert: true });
    }
    // Upsert Reviews
    for (const r of state.reviews) {
      await MongoReview.findByIdAndUpdate(r._id, r, { upsert: true });
    }
  } catch (e: any) {
    console.warn('[MongoDB] Sync error:', e.message);
  }
}
