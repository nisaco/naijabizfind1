import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import rateLimit from 'express-rate-limit'; // Security utility limit wrapper

// Import route modules
import businessRoutes from './routes/businesses.js';
import paymentRoutes from './routes/payments.js';
import adminRoutes from './routes/admin.js';
import uploadRoutes from './routes/upload.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// --- SECURITY RATE LIMITER LAYER CONFIGURATION ---
// Stops bad actors and automated bot loops from spamming critical server execution pipelines
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 Minute observation window
  max: 30, // Limit each IP address node to exactly 30 authentication challenge attempts per window
  standardHeaders: true, // Relay clean tracking parameters via response metadata limits
  legacyHeaders: false, // Turn off obsolete headers to optimize payload transmission scales
  message: {
    message: 'Too many network validation challenges originating from this node location. Access locked for 15 minutes.'
  }
});

// --- GLOBAL MIDDLEWARES ---

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: Origin ${origin} not allowed by policy`));
  },
  credentials: true
}));

// Intercept raw body buffer directly inside the default JSON middleware configuration to bypass route lifecycle parsing conflicts
app.use(express.json({
  verify: (req, res, buf) => {
    if (req.originalUrl.startsWith('/api/payments/webhook')) {
      req.rawBody = buf;
    }
  }
}));

// --- API ROUTES (With Integrated Security Protections) ---
app.use('/api/businesses/owner-login', apiLimiter);
app.use('/api/businesses/register', apiLimiter);

app.use('/api/businesses', businessRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);

// API Health Check
app.get('/api', (req, res) => {
  res.status(200).json({
    message: 'NaijaBizFind API is live 🚀',
    version: '1.0.0',
    endpoints: {
      businesses: '/api/businesses',
      payments: '/api/payments',
      admin: '/api/admin',
      upload: '/api/upload'
    }
  });
});

// --- SERVE STATIC FRONTEND BUILD IN PRODUCTION ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, '../naijabizfind/dist')));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(__dirname, '../naijabizfind/dist', 'index.html'));
});

// --- CENTRAL ERROR HANDLER ---
app.use((err, req, res, next) => {
  console.error('💥 Unhandled Server Error:', err.stack);
  res.status(500).json({
    message: 'An internal server error occurred',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// --- DATABASE CONNECTION & RUN ENGINE ---
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/naijabizfind';

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('🔌 MongoDB connected successfully');
    app.listen(PORT, () => {
      console.log(`🚀 NaijaBizFind Server running securely on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  });