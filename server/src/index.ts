import express from 'express';
import cors from 'cors';
import path from 'path';
import apiRouter from './routes/api';
import { seedDatabase } from './db/seed';

const app = express();
const PORT = process.env.PORT || 4000;

// Enable CORS & JSON middleware
app.use(cors());
app.use(express.json());

// Serve static artifacts
app.use('/artifacts', express.static(path.join(__dirname, '../storage/artifacts')));

// Ensure database initialized & seeded on server start / cold start
try {
  seedDatabase();
} catch (err) {
  console.error('Database initialization error:', err);
}

// API Routes
app.use('/api', apiRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'RoboServ ELM API', timestamp: new Date().toISOString() });
});

// Start standalone server if not running in serverless environment
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🤖 Restaurant Robot ELM Platform API Server Running!`);
    console.log(`🌐 Server URL: http://localhost:${PORT}`);
    console.log(`=======================================================`);
  });
}

// Export default app for Vercel Serverless Function compatibility
export default app;
