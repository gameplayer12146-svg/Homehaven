import fs from 'fs';
import path from 'path';

export interface Address {
  _id?: string;
  label: string;
  line: string;
  city: string;
  pincode: string;
  lat?: number;
  lng?: number;
}

export interface IUser {
  _id: string;
  name: string;
  email: string;
  password: string; // bcrypt hashed
  phone: string;
  role: 'customer' | 'provider' | 'admin';
  avatar: string;
  addresses: Address[];
  isApproved: boolean;
  createdAt: string;
}

export interface IService {
  _id: string;
  name: string;
  category: 'plumbing' | 'electrical' | 'cleaning' | 'ac_repair' | 'painting' | 'pest_control' | 'appliance_repair' | 'carpentry';
  description: string;
  basePrice: number;
  duration: number; // minutes
  icon: string;
  inclusions: string[];
  exclusions: string[];
  isActive: boolean;
  keywords: string[];
}

export interface IProvider {
  _id: string;
  userId: string; // ref User
  services: string[]; // ref Service IDs
  experience: number; // years
  rating: number; // 0 - 5
  reviewCount: number;
  jobsDone: number;
  trustScore: number; // 0 - 100
  availability: {
    days: number[]; // 0 - 6 (Sun = 0)
    slots: string[]; // e.g. "09:00", "10:30", "14:00"
  };
  city: string;
  bio: string;
}

export interface IBooking {
  _id: string;
  customerId: string; // ref User
  providerId: string; // ref Provider
  serviceId: string; // ref Service
  date: string; // YYYY-MM-DD
  timeSlot: string; // HH:mm
  address: Address;
  problemNote: string;
  status: 'requested' | 'accepted' | 'on_the_way' | 'in_progress' | 'completed' | 'cancelled';
  priceBreakdown: {
    visitFee: number;
    estimate: number;
    tax: number;
    total: number;
  };
  timeline: Array<{
    status: string;
    at: string;
    note?: string;
  }>;
  createdAt: string;
}

export interface IReview {
  _id: string;
  bookingId: string;
  customerId: string;
  providerId: string;
  rating: number;
  tags: string[];
  comment: string;
  createdAt: string;
}

export interface DatabaseState {
  users: IUser[];
  services: IService[];
  providers: IProvider[];
  bookings: IBooking[];
  reviews: IReview[];
}

const DATA_DIR = path.resolve(process.cwd(), '.data');
const DB_FILE = path.resolve(DATA_DIR, 'db.json');

class DatabaseStore {
  private state: DatabaseState = {
    users: [],
    services: [],
    providers: [],
    bookings: [],
    reviews: []
  };

  constructor() {
    this.load();
  }

  private load() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.state = JSON.parse(raw);
      }
    } catch (e) {
      console.warn('Error reading db.json, using memory store', e);
    }
  }

  public save() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(this.state, null, 2), 'utf-8');
    } catch (e) {
      console.warn('Error saving to db.json', e);
    }
  }

  public get users() { return this.state.users; }
  public get services() { return this.state.services; }
  public get providers() { return this.state.providers; }
  public get bookings() { return this.state.bookings; }
  public get reviews() { return this.state.reviews; }

  public resetWithData(data: DatabaseState) {
    this.state = data;
    this.save();
  }
}

export const db = new DatabaseStore();
