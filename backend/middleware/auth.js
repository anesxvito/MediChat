const jwt = require('jsonwebtoken');
const { prisma } = require('../config/database');
const logger = require('../utils/logger');
const { AuthenticationError, AuthorizationError } = require('../utils/errors');
const { catchAsync } = require('./errorHandler');

/**
 * PROFESSIONAL AUTHENTICATION & AUTHORIZATION MIDDLEWARE
 * Secure JWT-based authentication with comprehensive logging
 * Using Prisma/PostgreSQL
 */

// Verify JWT token and attach user to request
const auth = catchAsync(async (req, res, next) => {
  // Get token from header
  const authHeader = req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    logger.warn('Authentication attempt without token', {
      ip: req.ip,
      url: req.originalUrl,
    });
    throw new AuthenticationError('Authentication required. Please provide a valid token');
  }

  const token = authHeader.replace('Bearer ', '');

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user in PostgreSQL
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        phone: true,
        dateOfBirth: true,
        specialization: true,
        licenseNumber: true,
        isActive: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        lastLoginAt: true,
      }
    });

    if (!user) {
      logger.warn('Token valid but user not found', {
        userId: decoded.userId,
        ip: req.ip,
      });
      throw new AuthenticationError('User associated with this token no longer exists');
    }

    // Check if user is active
    if (user.isActive === false) {
      logger.warn('Inactive user attempted access', {
        userId: user.id,
        email: user.email,
      });
      throw new AuthenticationError('Your account has been deactivated. Please contact support');
    }

    // Attach user and token to request
    req.user = user;
    req.token = token;

    logger.debug('User authenticated successfully', {
      userId: user.id,
      role: user.role,
      url: req.originalUrl,
    });

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      logger.warn('Invalid JWT token', {
        ip: req.ip,
        url: req.originalUrl,
        error: error.message,
      });
      throw new AuthenticationError('Invalid authentication token. Please log in again');
    }

    if (error.name === 'TokenExpiredError') {
      logger.warn('Expired JWT token', {
        ip: req.ip,
        url: req.originalUrl,
      });
      throw new AuthenticationError('Your session has expired. Please log in again');
    }

    throw error;
  }
});

// Require specific role(s)
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      logger.error('requireRole called without auth middleware');
      throw new AuthenticationError('Authentication required');
    }

    if (!allowedRoles.includes(req.user.role)) {
      logger.warn('Unauthorized access attempt', {
        userId: req.user.id,
        userRole: req.user.role,
        requiredRoles: allowedRoles,
        url: req.originalUrl,
      });
      throw new AuthorizationError(
        `Access denied. This endpoint requires ${allowedRoles.join(' or ')} role`
      );
    }

    logger.debug('Role authorization successful', {
      userId: req.user.id,
      role: req.user.role,
      url: req.originalUrl,
    });

    next();
  };
};

// Check if user owns the resource
const checkOwnership = (resourceIdParam = 'id') => {
  return catchAsync(async (req, res, next) => {
    const resourceUserId = req.params[resourceIdParam];

    if (req.user.role === 'admin') {
      // Admins can access any resource
      return next();
    }

    if (req.user.id !== resourceUserId) {
      logger.warn('Unauthorized resource access attempt', {
        userId: req.user.id,
        targetResourceId: resourceUserId,
        url: req.originalUrl,
      });
      throw new AuthorizationError('You do not have permission to access this resource');
    }

    next();
  });
};

// Optional authentication (doesn't fail if no token)
const optionalAuth = catchAsync(async (req, res, next) => {
  const authHeader = req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.replace('Bearer ', '');

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        phone: true,
        dateOfBirth: true,
        specialization: true,
        licenseNumber: true,
        isActive: true,
        emailVerified: true,
      }
    });

    if (user) {
      req.user = user;
      req.token = token;
    }
  } catch (error) {
    // Silently fail for optional auth
    logger.debug('Optional auth failed', { error: error.message });
  }

  next();
});

module.exports = {
  auth,
  requireRole,
  checkOwnership,
  optionalAuth,
};
