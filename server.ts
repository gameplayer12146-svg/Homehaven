import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import dotenv from 'dotenv';
import authRoutes from './server/routes/auth.js';
import servicesRoutes from './server/routes/services.js';
import providersRoutes from './server/routes/providers.js';
import bookingsRoutes from './server/routes/bookings.js';
import reviewsRoutes from './server/routes/reviews.js';
import adminRoutes from './server/routes/admin.js';
import { errorHandler } from './server/middleware/errorHandler.js';
import { runSeed } from './server/seed.js';
import { connectMongo, syncToMongo } from './server/config/mongo.js';
import { db } from './server/config/db.js';

// Load .env and app.env
dotenv.config();
if (fs.existsSync(path.resolve(process.cwd(), 'app.env'))) {
  dotenv.config({ path: path.resolve(process.cwd(), 'app.env') });
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  // Connect to MongoDB if available (e.g. from app.env / MongoDB Compass)
  await connectMongo();

  // Initialize seed data
  await runSeed();
  await syncToMongo(db as any);

  // Middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Seed reset endpoint for quick testing
  app.post('/api/seed/reset', async (_req, res) => {
    await runSeed(true);
    res.json({ success: true, message: 'Database reset to initial demo state.' });
  });

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/services', servicesRoutes);
  app.use('/api/providers', providersRoutes);
  app.use('/api/bookings', bookingsRoutes);
  app.use('/api/reviews', reviewsRoutes);
  app.use('/api/admin', adminRoutes);

  // Global Error Handler for API
  app.use(errorHandler);

  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`HomeHaven Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
