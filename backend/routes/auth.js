const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const path = require('path');
const { prisma } = require('../config/database');
const logger = require('../utils/logger');
const ActivityLogger = require('../services/activityLogger');
const { validate, userSchemas } = require('../utils/validators');
const { catchAsync } = require('../middleware/errorHandler');
const { authLimiter } = require('../middleware/security');
const { ConflictError, AuthenticationError, ValidationError } = require('../utils/errors');
const upload = require('../config/multer');

/**
 * PROFESSIONAL AUTHENTICATION ROUTES
 * Secure user registration and login with comprehensive validation
 */

// Generate JWT token
const generateToken = (userId, role) => {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user (patient or doctor)
 * @access  Public
 */
router.post(
  '/register',
  authLimiter,
  upload.single('profilePhoto'),
  catchAsync(async (req, res) => {
    // Extract data from req.body (FormData or JSON)
    const {
      email,
      password,
      role,
      firstName,
      lastName,
      specialization,
      licenseNumber,
      phone,
      dateOfBirth,
    } = req.body;

    // Basic validation
    if (!email || !password || !role || !firstName || !lastName) {
      throw new ValidationError('Missing required fields: email, password, role, firstName, lastName');
    }

    if (password.length < 6) {
      throw new ValidationError('Password must be at least 6 characters long');
    }

    if (!['patient', 'doctor'].includes(role)) {
      throw new ValidationError('Invalid role. Must be either "patient" or "doctor"');
    }

    logger.info('Registration attempt', { email, role });

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });
    if (existingUser) {
      logger.warn('Registration failed - email already exists', { email });
      throw new ConflictError('An account with this email already exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Prepare user data
    const userData = {
      email: email.toLowerCase(),
      passwordHash,
      role,
      firstName,
      lastName,
      phone: phone || null,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
      isActive: true,
      emailVerified: false,
    };

    // Add profile photo if uploaded
    if (req.file) {
      // Store relative path to the uploaded file
      userData.profilePhoto = `/uploads/profiles/${req.file.filename}`;
      logger.info('Profile photo uploaded', {
        filename: req.file.filename,
        email,
      });
    }

    // Add doctor-specific fields
    if (role === 'doctor') {
      if (!specialization || !licenseNumber) {
        throw new ValidationError('Doctors must provide specialization and license number');
      }
      userData.specialization = specialization;
      userData.licenseNumber = licenseNumber;
    }

    // Create user
    const user = await prisma.user.create({
      data: userData
    });

    logger.info('User registered successfully', {
      userId: user.id,
      email: user.email,
      role: user.role,
      hasProfilePhoto: !!req.file,
    });

    // Log registration activity
    await ActivityLogger.logRegistration(user, req);

    // Generate token
    const token = generateToken(user.id, user.role);

    // Send response
    res.status(201).json({
      status: 'success',
      message: 'Registration successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        dateOfBirth: user.dateOfBirth,
        specialization: user.specialization,
        licenseNumber: user.licenseNumber,
        profilePhoto: user.profilePhoto,
        isActive: user.isActive,
        emailVerified: user.emailVerified,
      },
    });
  })
);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post(
  '/login',
  authLimiter,
  validate(userSchemas.login),
  catchAsync(async (req, res) => {
    const { email, password } = req.validatedBody;

    logger.info('Login attempt', { email });

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });
    if (!user) {
      logger.warn('Login failed - user not found', { email });
      // Log failed login attempt
      await ActivityLogger.logLogin({ email }, req, false);
      throw new AuthenticationError('Invalid email or password');
    }

    // Check if user is active
    if (user.isActive === false) {
      logger.warn('Login failed - account deactivated', {
        userId: user.id,
        email: user.email,
      });
      // Log failed login attempt
      await ActivityLogger.logLogin(user, req, false);
      throw new AuthenticationError('Your account has been deactivated. Please contact support');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      logger.warn('Login failed - invalid password', { email });
      // Log failed login attempt
      await ActivityLogger.logLogin(user, req, false);
      throw new AuthenticationError('Invalid email or password');
    }

    // Update last login timestamp
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    });

    logger.info('User logged in successfully', {
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Log successful login
    await ActivityLogger.logLogin(user, req, true);

    // Generate token
    const token = generateToken(user.id, user.role);

    // Send response
    res.status(200).json({
      status: 'success',
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        dateOfBirth: user.dateOfBirth,
        specialization: user.specialization,
        licenseNumber: user.licenseNumber,
        profilePhoto: user.profilePhoto,
        isActive: user.isActive,
        emailVerified: user.emailVerified,
      },
    });
  })
);

/**
 * @route   GET /api/auth/verify
 * @desc    Verify token and get user
 * @access  Private
 */
router.get(
  '/verify',
  catchAsync(async (req, res) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      throw new AuthenticationError('No token provided');
    }

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
          profilePhoto: true,
          isActive: true,
          emailVerified: true,
        }
      });

      if (!user) {
        throw new AuthenticationError('User not found');
      }

      res.status(200).json({
        status: 'success',
        user,
      });
    } catch (error) {
      if (error.name === 'JsonWebTokenError') {
        throw new AuthenticationError('Invalid token');
      }
      if (error.name === 'TokenExpiredError') {
        throw new AuthenticationError('Token expired');
      }
      throw error;
    }
  })
);

module.exports = router;
