import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db, IUser, IProvider } from '../config/db.js';
import { AuthRequest, JWT_SECRET } from '../middleware/auth.js';

function signToken(id: string, role: string): string {
  return jwt.sign({ id, role }, JWT_SECRET, { expiresIn: '7d' });
}

export async function register(req: Request, res: Response) {
  const { name, email, password, phone, role, city, bio, services } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
  }

  const existing = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  const userRole = role === 'provider' ? 'provider' : (role === 'admin' ? 'admin' : 'customer');
  const isApproved = userRole === 'customer'; // Providers require admin approval

  const userId = `user_${Date.now()}`;
  const newUser: IUser = {
    _id: userId,
    name,
    email: email.toLowerCase(),
    password: hashedPassword,
    phone: phone || '',
    role: userRole,
    avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=0F4C5C&textColor=ffffff`,
    addresses: [],
    isApproved,
    createdAt: new Date().toISOString()
  };

  db.users.push(newUser);

  // If registering as provider, create provider profile
  if (userRole === 'provider') {
    const provId = `prov_${Date.now()}`;
    const newProv: IProvider = {
      _id: provId,
      userId,
      services: Array.isArray(services) ? services : [],
      experience: 1,
      rating: 5.0,
      reviewCount: 0,
      jobsDone: 0,
      trustScore: 85,
      availability: {
        days: [1, 2, 3, 4, 5],
        slots: ['09:00', '11:00', '14:00', '16:00']
      },
      city: city || 'Austin',
      bio: bio || 'Professional home service specialist.'
    };
    db.providers.push(newProv);
  }

  db.save();

  const token = signToken(newUser._id, newUser.role);
  const { password: _, ...userWithoutPassword } = newUser;

  res.status(201).json({
    success: true,
    token,
    user: userWithoutPassword
  });
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required.' });
  }

  const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid email or password.' });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ success: false, message: 'Invalid email or password.' });
  }

  const token = signToken(user._id, user.role);
  const { password: _, ...userWithoutPassword } = user;

  res.json({
    success: true,
    token,
    user: userWithoutPassword
  });
}

export async function getMe(req: AuthRequest, res: Response) {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Not authenticated.' });
  }

  const { password: _, ...userWithoutPassword } = req.user;
  let providerProfile = null;
  if (req.user.role === 'provider') {
    providerProfile = db.providers.find(p => p.userId === req.user?._id) || null;
  }

  res.json({
    success: true,
    user: userWithoutPassword,
    provider: providerProfile
  });
}

export async function updateProfile(req: AuthRequest, res: Response) {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Not authenticated.' });
  }

  const user = db.users.find(u => u._id === req.user?._id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found.' });
  }

  const { name, phone, addresses, avatar } = req.body;
  if (name) user.name = name;
  if (phone) user.phone = phone;
  if (avatar) user.avatar = avatar;
  if (Array.isArray(addresses)) {
    user.addresses = addresses.map((addr, idx) => ({
      _id: addr._id || `addr_${Date.now()}_${idx}`,
      label: addr.label || 'Home',
      line: addr.line || '',
      city: addr.city || '',
      pincode: addr.pincode || '',
      lat: addr.lat,
      lng: addr.lng
    }));
  }

  db.save();

  const { password: _, ...userWithoutPassword } = user;
  res.json({
    success: true,
    user: userWithoutPassword
  });
}
