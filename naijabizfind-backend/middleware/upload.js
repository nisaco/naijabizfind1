import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

/**
 * Cloudinary Configuration & Upload Middleware
 * Securely handles file uploads for shop photos and certificates
 * Uses environment variables for credentials
 */

// Validate Cloudinary credentials exist
const validateCloudinaryConfig = () => {
  const required = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing Cloudinary configuration: ${missing.join(', ')}`);
  }
};

try {
  validateCloudinaryConfig();
} catch (error) {
  console.error('❌ Cloudinary Configuration Error:', error.message);
  console.error('Please ensure all CLOUDINARY_* environment variables are set');
}

// Configure Cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// File size limits (5MB max)
const LIMITS = { fileSize: 5 * 1024 * 1024 };

// Allowed file types
const ALLOWED_SHOP_FORMATS = ['jpg', 'jpeg', 'png', 'webp'];
const ALLOWED_CERT_FORMATS = ['jpg', 'jpeg', 'png', 'pdf'];

// Storage engine for shop photos (images only)
const shopPhotoStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'naijabizfind/shops',
    allowed_formats: ALLOWED_SHOP_FORMATS,
    transformation: [
      { width: 800, height: 600, crop: 'fill', quality: 'auto:good' }
    ],
  },
});

// Storage engine for certificates (images or PDFs)
const certificateStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'naijabizfind/certificates',
    allowed_formats: ALLOWED_CERT_FORMATS,
    resource_type: 'auto',
  },
});

// Combined upload storage
const combinedStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    if (file.fieldname === 'certificate') {
      return {
        folder: 'naijabizfind/certificates',
        resource_type: 'auto',
        allowed_formats: ALLOWED_CERT_FORMATS,
      };
    }
    // Default: shop photo
    return {
      folder: 'naijabizfind/shops',
      allowed_formats: ALLOWED_SHOP_FORMATS,
      transformation: [{ width: 800, height: 600, crop: 'fill', quality: 'auto:good' }],
    };
  },
});

// File filter to prevent non-image uploads
const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'certificate') {
    if (!ALLOWED_CERT_FORMATS.includes(file.mimetype.split('/')[1])) {
      return cb(new Error('Invalid certificate format. Only JPG, PNG, and PDF allowed.'));
    }
  } else if (file.fieldname === 'shopPhoto') {
    if (!ALLOWED_SHOP_FORMATS.includes(file.mimetype.split('/')[1])) {
      return cb(new Error('Invalid shop photo format. Only JPG, PNG, and WEBP allowed.'));
    }
  }
  cb(null, true);
};

// Multer instances
export const uploadShopPhoto = multer({
  storage: shopPhotoStorage,
  limits: LIMITS,
  fileFilter
});

export const uploadCertificate = multer({
  storage: certificateStorage,
  limits: LIMITS,
  fileFilter
});

// Combined upload instance
export const uploadCombined = multer({
  storage: combinedStorage,
  limits: LIMITS,
  fileFilter
});

export { cloudinary };