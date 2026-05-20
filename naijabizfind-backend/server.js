import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';

// Import route modules
import businessRoutes from './routes/businesses.js';
import paymentRoutes from './routes/payments.js';
import adminRoutes from './routes/admin.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// --- GLOBAL MIDDLEWARES ---

// CORS: Allow React frontend to communicate with this API
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: Origin ${origin} not allowed`));
  },
  credentials: true
}));

// IMPORTANT: Paystack webhook needs the raw body for HMAC signature verification.
// We register it BEFORE the global express.json() parser.
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));

// Parse JSON bodies for all other routes
app.use(express.json());

// --- ROUTES ---
app.use('/api/businesses', businessRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'NaijaBizFind API is live 🚀',
    version: '1.0.0',
    endpoints: {
      businesses: '/api/businesses',
      payments: '/api/payments',
      admin: '/api/admin'
    }
  });
});

// --- CENTRAL ERROR HANDLER ---
app.use((err, req, res, next) => {
  console.error('💥 Unhandled Server Error:', err.stack);
  res.status(500).json({
    message: 'An internal server error occurred',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// --- MONGODB CONNECTION & SERVER START ---
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/naijabizfind';

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('🔌 MongoDB connected successfully');
    app.listen(PORT, () => {
      console.log(`🚀 NaijaBizFind API running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  });