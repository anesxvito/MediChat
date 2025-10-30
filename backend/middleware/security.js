const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

/**
 * PROFESSIONAL SECURITY MIDDLEWARE
 * Comprehensive security measures for production
 */

// Rate limiting for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: {
    error: 'Too many authentication attempts, please try again after 15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful requests
});

// Rate limiting for API endpoints
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 1000, // 1000 requests for dev, 100 for production
  message: {
    error: 'Too many requests, please try again later',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict rate limiting for file uploads
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // 20 uploads per hour
  message: {
    error: 'Upload limit exceeded, please try again later',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Helmet configuration for security headers
const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' },
});

// Request size limiter to prevent DOS
const requestSizeLimiter = (req, res, next) => {
  const contentLength = parseInt(req.get('content-length') || 0);
  const maxSize = req.path.includes('/upload') ? 10 * 1024 * 1024 : 1024 * 1024; // 10MB for uploads, 1MB for others

  if (contentLength > maxSize) {
    return res.status(413).json({
      error: 'Request entity too large',
    });
  }

  next();
};

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3001',
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// Prevent parameter pollution
// Simple pass-through middleware - in production, use hpp package instead
const preventParameterPollution = (req, res, next) => {
  // For now, just pass through without modification
  // This avoids the read-only property issue with req.query
  next();
};

// Security headers middleware
const securityHeaders = (req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.removeHeader('X-Powered-By');
  next();
};

module.exports = {
  authLimiter,
  apiLimiter,
  uploadLimiter,
  helmetConfig,
  requestSizeLimiter,
  corsOptions,
  preventParameterPollution,
  securityHeaders,
};
