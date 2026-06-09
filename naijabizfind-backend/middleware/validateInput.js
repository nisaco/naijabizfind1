import { body, query, validationResult } from 'express-validator';

/**
 * Input Validation Middleware
 * Prevents NoSQL injection, XSS, and other input-based attacks
 */

// Middleware to handle validation errors
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.param,
        message: err.msg
      }))
    });
  }
  next();
};

// Business Registration Validators
export const validateBusinessRegistration = [
  body('name')
    .trim()
    .notEmpty().withMessage('Business name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Business name must be 2-100 characters')
    .matches(/^[a-zA-Z0-9\s&'-]+$/).withMessage('Business name contains invalid characters'),
  
  body('category')
    .trim()
    .notEmpty().withMessage('Category is required')
    .isIn(['mechanic', 'tailor', 'salon', 'artisan', 'plumber', 'electrician', 'carpenter', 'other'])
    .withMessage('Invalid category'),
  
  body('city')
    .trim()
    .notEmpty().withMessage('City is required')
    .isLength({ min: 2, max: 50 }).withMessage('City must be 2-50 characters'),
  
  body('address')
    .trim()
    .notEmpty().withMessage('Address is required')
    .isLength({ min: 5, max: 200 }).withMessage('Address must be 5-200 characters'),
  
  body('description')
    .trim()
    .notEmpty().withMessage('Description is required')
    .isLength({ min: 10, max: 1000 }).withMessage('Description must be 10-1000 characters'),
  
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format'),
  
  body('phone')
    .trim()
    .notEmpty().withMessage('Phone is required')
    .matches(/^\+?[0-9]{10,15}$/).withMessage('Invalid phone number format'),
  
  body('whatsapp')
    .optional()
    .trim()
    .matches(/^\+?[0-9]{10,15}$/).withMessage('Invalid WhatsApp number format'),
  
  body('openTime')
    .trim()
    .notEmpty().withMessage('Opening time is required')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Invalid time format (HH:MM)'),
  
  body('closeTime')
    .trim()
    .notEmpty().withMessage('Closing time is required')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Invalid time format (HH:MM)'),
  
  body('shopPhoto')
    .notEmpty().withMessage('Shop photo URL is required')
    .isURL().withMessage('Invalid shop photo URL'),
  
  body('plan')
    .optional()
    .isIn(['basic', 'featured', 'ultimate']).withMessage('Invalid plan'),
];

// Business Owner Login Validators
export const validateOwnerLogin = [
  body('phone')
    .trim()
    .notEmpty().withMessage('Phone number is required')
    .matches(/^\+?[0-9]{10,15}$/).withMessage('Invalid phone number format'),
  
  body('password')
    .optional()
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  
  body('email')
    .optional()
    .trim()
    .isEmail().withMessage('Invalid email format'),
  
  body('promoCodeApplied')
    .optional()
    .trim()
    .matches(/^[A-Z0-9]{6}$/).withMessage('Invalid promo code format'),
];

// Business Search Validators
export const validateBusinessSearch = [
  query('category')
    .optional()
    .trim()
    .isIn(['mechanic', 'tailor', 'salon', 'artisan', 'plumber', 'electrician', 'carpenter', 'other'])
    .withMessage('Invalid category'),
  
  query('city')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 }).withMessage('City must be 2-50 characters')
    .matches(/^[a-zA-Z\s-]+$/).withMessage('City name contains invalid characters'),
  
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
];

// Admin Rejection Validators
export const validateAdminRejection = [
  body('reason')
    .optional()
    .trim()
    .isLength({ min: 5, max: 500 }).withMessage('Reason must be 5-500 characters'),
];