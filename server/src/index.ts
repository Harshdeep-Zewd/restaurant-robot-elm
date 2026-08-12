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

// API Routes
app.use('/api', apiRouter);

// Initialize DB and Seed Data
seedDatabase();

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'RoboServ ELM API', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🤖 Restaurant Robot ELM Platform API Server Running!`);
  console.log(`🌐 Server URL: http://localhost:${PORT}`);
  console.log(`=======================================================`);
});
