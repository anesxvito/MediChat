const express = require('express');
const router = express.Router();
const { prisma } = require('../config/database');
const { auth, requireRole } = require('../middleware/auth');
const { validate, userSchemas } = require('../utils/validators');
const { catchAsync } = require('../middleware/errorHandler');
const { NotFoundError } = require('../utils/errors');
const logger = require('../utils/logger');
const upload = require('../config/multer');

/**
 * PROFESSIONAL PATIENT ROUTES
 * Secure patient data management with comprehensive validation
 */

/**
 * @route   GET /api/patients/profile
 * @desc    Get patient profile
 * @access  Private (Patient only)
 */
router.get(
  '/profile',
  auth,
  requireRole('patient'),
  catchAsync(async (req, res) => {
    logger.info('Patient profile requested', { userId: req.user.id });

    const patient = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        phone: true,
        dateOfBirth: true,
        isActive: true,
        emailVerified: true,
        createdAt: true,
        patientMedicalInfo: {
          select: {
            id: true,
            bloodType: true,
            heightCm: true,
            weightKg: true,
            emergencyContactName: true,
            emergencyContactPhone: true,
            emergencyContactRelationship: true,
            insuranceProvider: true,
            insurancePolicyNumber: true,
            insuranceGroupNumber: true,
            assignedDoctor: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                specialization: true,
                email: true
              }
            }
          }
        },
        allergies: true,
        patientMedications: true,
        medicalHistory: true
      }
    });

    if (!patient) {
      throw new NotFoundError('Patient profile not found');
    }

    res.status(200).json({
      status: 'success',
      patient,
    });
  })
);

/**
 * @route   PATCH /api/patients/profile
 * @desc    Update patient profile
 * @access  Private (Patient only)
 */
router.patch(
  '/profile',
  auth,
  requireRole('patient'),
  upload.single('profilePhoto'),
  catchAsync(async (req, res) => {
    logger.info('Patient profile update requested', { userId: req.user.id });

    const userUpdates = {};
    const medicalInfoUpdates = {};

    // Helper function to parse JSON strings from FormData
    const parseIfJSON = (value) => {
      if (typeof value === 'string') {
        try {
          return JSON.parse(value);
        } catch (e) {
          return value;
        }
      }
      return value;
    };

    // User table fields
    const userFields = ['phone', 'dateOfBirth'];
    userFields.forEach(field => {
      if (req.body[field] !== undefined && req.body[field] !== '') {
        if (field === 'dateOfBirth') {
          userUpdates[field] = new Date(req.body[field]);
        } else {
          userUpdates[field] = req.body[field];
        }
      }
    });

    // PatientMedicalInfo fields
    const medicalFields = [
      'bloodType', 'height', 'weight', 'insuranceProvider', 'insurancePolicyNumber',
      'primaryPhysician', 'emergencyContact', 'emergencyContactPhone'
    ];
    medicalFields.forEach(field => {
      if (req.body[field] !== undefined && req.body[field] !== '') {
        if (field === 'height' || field === 'weight') {
          medicalInfoUpdates[field] = parseFloat(req.body[field]);
        } else {
          medicalInfoUpdates[field] = req.body[field];
        }
      }
    });

    // Add profile photo if uploaded
    if (req.file) {
      userUpdates.profilePhoto = `/uploads/profiles/${req.file.filename}`;
      logger.info('Profile photo uploaded', {
        filename: req.file.filename,
        userId: req.user.id,
      });
    }

    // Update user and medical info
    const patient = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        ...userUpdates,
        patientMedicalInfo: Object.keys(medicalInfoUpdates).length > 0 ? {
          upsert: {
            create: medicalInfoUpdates,
            update: medicalInfoUpdates
          }
        } : undefined
      },
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        phone: true,
        dateOfBirth: true,
        profilePhoto: true,
        isActive: true,
        patientMedicalInfo: true
      }
    });

    logger.info('Patient profile updated successfully', {
      userId: req.user.id,
      updatedFields: [...Object.keys(userUpdates), ...Object.keys(medicalInfoUpdates)],
    });

    res.status(200).json({
      status: 'success',
      message: 'Profile updated successfully',
      patient,
    });
  })
);

/**
 * @route   GET /api/patients/conversations
 * @desc    Get all patient conversations
 * @access  Private (Patient only)
 */
router.get(
  '/conversations',
  auth,
  requireRole('patient'),
  catchAsync(async (req, res) => {
    const { includeArchived } = req.query;

    logger.info('Patient conversations requested', {
      userId: req.user.id,
      includeArchived,
    });

    const where = { patientId: req.user.id };

    // Filter out archived conversations unless explicitly requested
    if (includeArchived !== 'true') {
      where.archivedByPatient = false;
    }

    const conversations = await prisma.conversation.findMany({
      where,
      include: {
        doctor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            specialization: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json(conversations);
  })
);

/**
 * @route   GET /api/patients/conversations/:id
 * @desc    Get specific conversation with doctor response
 * @access  Private (Patient only)
 */
router.get(
  '/conversations/:id',
  auth,
  requireRole('patient'),
  catchAsync(async (req, res) => {
    logger.info('Patient conversation details requested', {
      userId: req.user.id,
      conversationId: req.params.id,
    });

    const conversation = await prisma.conversation.findFirst({
      where: {
        id: req.params.id,
        patientId: req.user.id
      },
      include: {
        doctor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            specialization: true,
            email: true
          }
        },
        messages: true,
        symptoms: true,
        prescriptions: true
      }
    });

    if (!conversation) {
      throw new NotFoundError('Conversation not found');
    }

    res.status(200).json({
      status: 'success',
      conversation,
    });
  })
);

/**
 * @route   GET /api/patients/notifications
 * @desc    Get patient notifications
 * @access  Private (Patient only)
 */
router.get(
  '/notifications',
  auth,
  requireRole('patient'),
  catchAsync(async (req, res) => {
    logger.info('Patient notifications requested', { userId: req.user.id });

    const notifications = await prisma.conversation.findMany({
      where: {
        patientId: req.user.id,
        status: 'doctor_responded',
        patientNotified: true,
      },
      select: {
        id: true,
        visitNumber: true,
        respondedAt: true,
        createdAt: true,
        doctor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            specialization: true
          }
        }
      },
      orderBy: { respondedAt: 'desc' },
      take: 20
    });

    res.status(200).json(notifications);
  })
);

/**
 * @route   PATCH /api/patients/conversations/:id/mark-read
 * @desc    Mark conversation notification as read
 * @access  Private (Patient only)
 */
router.patch(
  '/conversations/:id/mark-read',
  auth,
  requireRole('patient'),
  catchAsync(async (req, res) => {
    logger.info('Marking conversation as read', {
      userId: req.user.id,
      conversationId: req.params.id,
    });

    const conversation = await prisma.conversation.updateMany({
      where: {
        id: req.params.id,
        patientId: req.user.id,
      },
      data: { patientNotified: false }
    });

    if (conversation.count === 0) {
      throw new NotFoundError('Conversation not found');
    }

    res.status(200).json({
      status: 'success',
      message: 'Notification marked as read',
    });
  })
);

/**
 * @route   PATCH /api/patients/conversations/:id/archive
 * @desc    Archive a conversation
 * @access  Private (Patient only)
 */
router.patch(
  '/conversations/:id/archive',
  auth,
  requireRole('patient'),
  catchAsync(async (req, res) => {
    logger.info('Archiving conversation', {
      userId: req.user.id,
      conversationId: req.params.id,
    });

    const conversation = await prisma.conversation.updateMany({
      where: {
        id: req.params.id,
        patientId: req.user.id,
      },
      data: { archivedByPatient: true }
    });

    if (conversation.count === 0) {
      throw new NotFoundError('Conversation not found');
    }

    res.status(200).json({
      status: 'success',
      message: 'Conversation archived successfully',
    });
  })
);

/**
 * @route   PATCH /api/patients/conversations/:id/unarchive
 * @desc    Unarchive a conversation
 * @access  Private (Patient only)
 */
router.patch(
  '/conversations/:id/unarchive',
  auth,
  requireRole('patient'),
  catchAsync(async (req, res) => {
    logger.info('Unarchiving conversation', {
      userId: req.user.id,
      conversationId: req.params.id,
    });

    const conversation = await prisma.conversation.updateMany({
      where: {
        id: req.params.id,
        patientId: req.user.id,
      },
      data: { archivedByPatient: false }
    });

    if (conversation.count === 0) {
      throw new NotFoundError('Conversation not found');
    }

    res.status(200).json({
      status: 'success',
      message: 'Conversation unarchived successfully',
    });
  })
);

/**
 * @route   DELETE /api/patients/conversations/:id
 * @desc    Delete a conversation (soft delete - mark as archived)
 * @access  Private (Patient only)
 */
router.delete(
  '/conversations/:id',
  auth,
  requireRole('patient'),
  catchAsync(async (req, res) => {
    logger.warn('Patient attempting to delete conversation', {
      userId: req.user.id,
      conversationId: req.params.id,
    });

    // For medical records, we do soft delete (archive) instead of hard delete
    const conversation = await prisma.conversation.updateMany({
      where: {
        id: req.params.id,
        patientId: req.user.id,
      },
      data: { archivedByPatient: true }
    });

    if (conversation.count === 0) {
      throw new NotFoundError('Conversation not found');
    }

    logger.info('Conversation soft-deleted (archived)', {
      userId: req.user.id,
      conversationId: req.params.id,
    });

    res.status(200).json({
      status: 'success',
      message: 'Conversation deleted successfully',
    });
  })
);

module.exports = router;
