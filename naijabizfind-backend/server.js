import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import fs from 'fs'; // ✅ FILE SYSTEM UTILITY: Needed to read and manipulate the index.html template string
import { fileURLToPath } from 'url';
import rateLimit from 'express-rate-limit';

// Import route modules and database schemas for server-side lookup queries
import businessRoutes from './routes/businesses.js';
import paymentRoutes from './routes/payments.js';
import adminRoutes from './routes/admin.js';
import uploadRoutes from './routes/upload.js';
import Business from './models/Business.js'; // ✅ Needed to pre-fetch SEO data on server side

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// --- SECURITY RATE LIMITER ---
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many network validation challenges originating from this node location.' }
});

// --- GLOBAL MIDDLEWARES ---
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'https://naijabizfind.onrender.com',
  'https://naijabizfind.online',
  'https://www.naijabizfind.online'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS Access Blocked: Origin ${origin} not recognized.`));
  },
  credentials: true
}));

app.use(express.json({
  verify: (req, res, buf) => {
    if (req.originalUrl.startsWith('/api/payments/webhook')) {
      req.rawBody = buf;
    }
  }
}));

// --- API ROUTES ---
app.use('/api/businesses/owner-login', apiLimiter);
app.use('/api/businesses/register', apiLimiter);
app.use('/api/businesses', businessRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);

// --- SERVE STATIC FRONTEND BUILD WITH DYNAMIC SEO INTERCEPTION ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Target asset directories path maps
const frontendDistPath = path.join(__dirname, '../naijabizfind/dist');

// Serve your standard static bundles (js, css, images) raw without modification
app.use(express.static(frontendDistPath, { index: false })); 

// ✅ CATCH-ALL SEO INTERCEPTION ENGINE: Hydrates placeholders with database values before hitting the browser
app.get('*', async (req, res) => {
  const indexPath = path.join(frontendDistPath, 'index.html');
  
  // Safety fallback check if the frontend isn't compiled yet
  if (!fs.existsSync(indexPath)) {
    return res.status(404).send('Production frontend build index file is missing.');
  }

  try {
    // 1. Read the blank layout html file template into memory strings
    let htmlContent = fs.readFileSync(indexPath, 'utf8');

    // 2. Set default fallbacks if the route is a standard layout page (Home, Contact, etc.)
    let seoTitle = "Verified Artisans, Mechanics, Tailors & Salons in Nigeria | NaijaBizFind";
    let seoDescription = "Find and connect with trusted, verified local businesses and professional artisans near you across Nigeria. Browse reviews, look up WhatsApp details, and view location directions instantly.";
    let seoKeywords = "naijabizfind, verified mechanics lagos, professional tailors abuja, looking for artisans nigeria, reliable business directory";
    let seoImage = "https://naijabizfind.online/default-meta-banner.jpg"; // Create a nice banner image in your public folder!

    // 3. SECURE ROUTE INTERCEPTION: Check if the user/crawler is hitting a single profile view page
    // Matches patterns like: /businesses/654321abcdef...
    const profileRouteMatch = req.path.match(/\/businesses\/([a-fA-F0-9]{24})/);
    
    if (profileRouteMatch) {
      const businessId = profileRouteMatch[1];
      const businessData = await Business.findById(businessId);
      
      if (businessData && businessData.status === 'approved' && businessData.isPaid) {
        // Hydrate properties with pure database metrics!
        seoTitle = `${businessData.name} - Verified ${businessData.category.toUpperCase()} Specialist in ${businessData.city} | NaijaBizFind`;
        seoDescription = `Get in touch with ${businessData.name} located at ${businessData.address}, ${businessData.city}. Service highlights: ${businessData.description.substring(0, 140)}...`;
        seoKeywords = `${businessData.category}, ${businessData.name}, local businesses in ${businessData.city}, verified artisans near me`;
        seoImage = businessData.images?.shopPhoto || businessData.shopPhoto || seoImage;
      }
    }

    // 4. STRING REPLACEMENT: Dynamically swap the HTML content layout slots
    htmlContent = htmlContent
      .replace(/__SEO_TITLE__/g, seoTitle)
      .replace(/__SEO_DESCRIPTION__/g, seoDescription)
      .replace(/__SEO_KEYWORDS__/g, seoKeywords)
      .replace(/__SEO_IMAGE__/g, seoImage);

    // 5. Stream the freshly hydrated web document out to the browser client or search bot node
    res.send(htmlContent);

  } catch (error) {
    console.error("SEO Interception Engine Crash Exception:", error.message);
    // Silent fail safely to standard static files if something breaks
    res.sendFile(indexPath);
  }
});

// Central Error Handler
app.use((err, req, res, next) => {
  console.error('💥 Unhandled Server Error:', err.stack);
  res.status(500).json({
    message: 'An internal server error occurred',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// Connect and Engine Spin-up
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/naijabizfind';
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('🔌 MongoDB connected successfully');
    app.listen(PORT, () => {
      console.log(`🚀 NaijaBizFind Production Server running securely on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  });