import { Request, Response } from 'express';
import { db, IService } from '../config/db.js';

export async function getServices(req: Request, res: Response) {
  const { category, search, activeOnly } = req.query;

  let list = [...db.services];

  if (activeOnly !== 'false') {
    list = list.filter(s => s.isActive);
  }

  if (category && typeof category === 'string' && category !== 'all') {
    list = list.filter(s => s.category.toLowerCase() === category.toLowerCase());
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase().trim();
    list = list.filter(s =>
      s.name.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q) ||
      s.category.toLowerCase().includes(q) ||
      s.keywords.some(k => k.toLowerCase().includes(q))
    );
  }

  res.json({
    success: true,
    count: list.length,
    services: list
  });
}

export async function getServiceById(req: Request, res: Response) {
  const { id } = req.params;
  const service = db.services.find(s => s._id === id);

  if (!service) {
    return res.status(404).json({ success: false, message: 'Service not found.' });
  }

  // Find providers offering this service
  const providersOffering = db.providers.filter(p => p.services.includes(service._id));
  const providersWithUser = providersOffering.map(p => {
    const user = db.users.find(u => u._id === p.userId);
    return {
      ...p,
      user: user ? { name: user.name, avatar: user.avatar, isApproved: user.isApproved } : null
    };
  }).filter(p => p.user?.isApproved);

  res.json({
    success: true,
    service,
    providers: providersWithUser
  });
}

export async function createService(req: Request, res: Response) {
  const { name, category, description, basePrice, duration, icon, inclusions, exclusions, keywords } = req.body;

  if (!name || !category || !basePrice) {
    return res.status(400).json({ success: false, message: 'Name, category, and base price are required.' });
  }

  const newService: IService = {
    _id: `srv_${Date.now()}`,
    name,
    category,
    description: description || '',
    basePrice: Number(basePrice),
    duration: Number(duration) || 60,
    icon: icon || '🛠️',
    inclusions: Array.isArray(inclusions) ? inclusions : [],
    exclusions: Array.isArray(exclusions) ? exclusions : [],
    isActive: true,
    keywords: Array.isArray(keywords) ? keywords : []
  };

  db.services.push(newService);
  db.save();

  res.status(201).json({
    success: true,
    service: newService
  });
}

export async function updateService(req: Request, res: Response) {
  const { id } = req.params;
  const service = db.services.find(s => s._id === id);

  if (!service) {
    return res.status(404).json({ success: false, message: 'Service not found.' });
  }

  const fields = ['name', 'category', 'description', 'basePrice', 'duration', 'icon', 'inclusions', 'exclusions', 'isActive', 'keywords'];
  for (const field of fields) {
    if (req.body[field] !== undefined) {
      (service as any)[field] = req.body[field];
    }
  }

  db.save();

  res.json({
    success: true,
    service
  });
}

export async function deleteService(req: Request, res: Response) {
  const { id } = req.params;
  const index = db.services.findIndex(s => s._id === id);

  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Service not found.' });
  }

  db.services.splice(index, 1);
  db.save();

  res.json({
    success: true,
    message: 'Service deleted successfully.'
  });
}
