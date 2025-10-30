const express = require('express');
const router = express.Router();
const { prisma } = require('../config/database');
const { auth, requireRole } = require('../middleware/auth');
const { validate, conversationSchemas } = require('../utils/validators');
const { catchAsync } = require('../middleware/errorHandler');
const { NotFoundError } = require('../utils/errors');
const logger = require('../utils/logger');

/**
 * PROFESSIONAL DOCTOR ROUTES
 * Secure doctor operations with comprehensive validation
 */

/**
 * @route   GET /api/doctors/pending-conversations
 * @desc    Get all pending patient conversations awaiting doctor review
 * @access  Private (Doctor only)
 */
router.get(
  '/pending-conversations',
  auth,
  requireRole('doctor'),
  catchAsync(async (req, res) => {
    logger.info('Pending conversations requested', { userId: req.user.id });

    const conversations = await prisma.conversation.findMany({
      where: {
        status: 'awaiting_doctor',
        archivedByDoctor: false,
      },
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            dateOfBirth: true,
            allergies: true,
            patientMedications: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({
      status: 'success',
      count: conversations.length,
      conversations,
    });
  })
);

/**
 * @route   GET /api/doctors/my-conversations
 * @desc    Get doctor's responded conversations
 * @access  Private (Doctor only)
 */
router.get(
  '/my-conversations',
  auth,
  requireRole('doctor'),
  catchAsync(async (req, res) => {
    const { includeArchived } = req.query;

    logger.info('Doctor conversations requested', {
      userId: req.user.id,
      includeArchived,
    });

    const where = { doctorId: req.user.id };

    if (includeArchived !== 'true') {
      where.archivedByDoctor = false;
    }

    const conversations = await prisma.conversation.findMany({
      where,
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            dateOfBirth: true,
            allergies: true,
            patientMedications: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({
      status: 'success',
      count: conversations.length,
      conversations,
    });
  })
);

/**
 * @route   GET /api/doctors/conversation/:id
 * @desc    Get specific conversation details
 * @access  Private (Doctor only)
 */
router.get(
  '/conversation/:id',
  auth,
  requireRole('doctor'),
  catchAsync(async (req, res) => {
    logger.info('Conversation details requested', {
      userId: req.user.id,
      conversationId: req.params.id,
    });

    const conversation = await prisma.conversation.findUnique({
      where: { id: req.params.id },
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            dateOfBirth: true,
            allergies: true,
            patientMedications: true
          }
        },
        doctor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            specialization: true
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
 * @route   PATCH /api/doctors/conversation/:id/update-info
 * @desc    Update patient information in conversation
 * @access  Private (Doctor only)
 */
router.patch(
  '/conversation/:id/update-info',
  auth,
  requireRole('doctor'),
  catchAsync(async (req, res) => {
    logger.info('Updating conversation info', {
      userId: req.user.id,
      conversationId: req.params.id,
    });

    const { symptoms } = req.body;

    const conversation = await prisma.conversation.findUnique({ where: { id: req.params.id } });

    if (!conversation) {
      throw new NotFoundError('Conversation not found');
    }

    const updatedConversation = await prisma.conversation.update({
      where: { id: req.params.id },
      data: { symptoms }
    });

    logger.info('Conversation updated successfully', {
      userId: req.user.id,
      conversationId: req.params.id,
    });

    res.status(200).json({
      status: 'success',
      message: 'Conversation updated successfully',
      conversation: updatedConversation,
    });
  })
);

/**
 * @route   POST /api/doctors/conversation/:id/respond
 * @desc    Submit doctor's response to patient
 * @access  Private (Doctor only)
 */
router.post(
  '/conversation/:id/respond',
  auth,
  requireRole('doctor'),
  validate(conversationSchemas.doctorResponse),
  catchAsync(async (req, res) => {
    logger.info('Doctor response submitted', {
      userId: req.user.id,
      conversationId: req.params.id,
    });

    const {
      diagnosis,
      recommendations,
      prescriptions,
      referrals,
      callToOffice,
      notes,
    } = req.validatedBody;

    const conversation = await prisma.conversation.findUnique({ where: { id: req.params.id } });

    if (!conversation) {
      throw new NotFoundError('Conversation not found');
    }

    // Update conversation with doctor's response
    const updatedConversation = await prisma.conversation.update({
      where: { id: req.params.id },
      data: {
        doctorId: req.user.id,
        status: 'doctor_responded',
        patientNotified: true,
        diagnosis,
        recommendations,
        referrals,
        callToOffice,
        doctorNotes: notes,
        respondedAt: new Date(),
      },
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        doctor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            specialization: true
          }
        }
      }
    });

    // Create prescription records if provided
    if (prescriptions && prescriptions.length > 0) {
      await Promise.all(
        prescriptions.map(async (prescription) => {
          await prisma.prescription.create({
            data: {
              conversationId: req.params.id,
              patientId: conversation.patientId,
              doctorId: req.user.id,
              medicationName: prescription.medication,
              dosage: prescription.dosage || '',
              frequency: prescription.frequency || '',
              duration: prescription.duration || '',
              status: 'active',
            }
          });
        })
      );
    }

    logger.info('Doctor response saved successfully', {
      userId: req.user.id,
      conversationId: req.params.id,
      patientId: updatedConversation.patient.id,
    });

    // Emit real-time notification to patient via Socket.IO
    const io = req.app.get('io');
    if (io) {
      io.to(`user:${updatedConversation.patient.id}`).emit('new_notification', {
        type: 'doctor_response',
        conversationId: updatedConversation.id,
        message: `Dr. ${updatedConversation.doctor.firstName} ${updatedConversation.doctor.lastName} has responded to your consultation`,
        data: {
          doctorName: `${updatedConversation.doctor.firstName} ${updatedConversation.doctor.lastName}`,
          specialization: updatedConversation.doctor.specialization,
          diagnosis: updatedConversation.diagnosis,
          hasPrescriptions: prescriptions && prescriptions.length > 0,
          timestamp: new Date().toISOString(),
        },
      });
      logger.info('Real-time notification sent to patient', {
        patientId: updatedConversation.patient.id,
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Response submitted successfully',
      conversation: updatedConversation,
    });
  })
);

/**
 * @route   GET /api/doctors/patient/:patientId/history
 * @desc    Get patient's medical history (previous conversations)
 * @access  Private (Doctor only)
 */
router.get(
  '/patient/:patientId/history',
  auth,
  requireRole('doctor'),
  catchAsync(async (req, res) => {
    logger.info('Patient history requested', {
      userId: req.user.id,
      patientId: req.params.patientId,
    });

    const conversations = await prisma.conversation.findMany({
      where: {
        patientId: req.params.patientId,
        status: 'doctor_responded',
      },
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
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    const patient = await prisma.user.findUnique({
      where: { id: req.params.patientId },
      select: {
        firstName: true,
        lastName: true,
        email: true,
        allergies: true,
        dateOfBirth: true
      }
    });

    if (!patient) {
      throw new NotFoundError('Patient not found');
    }

    res.status(200).json({
      status: 'success',
      patient,
      history: conversations,
      count: conversations.length,
    });
  })
);

/**
 * @route   GET /api/doctors/stats
 * @desc    Get doctor statistics
 * @access  Private (Doctor only)
 */
router.get(
  '/stats',
  auth,
  requireRole('doctor'),
  catchAsync(async (req, res) => {
    logger.info('Doctor stats requested', { userId: req.user.id });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [pendingCount, doctorConversations, todayResponses] = await Promise.all([
      // Pending conversations
      prisma.conversation.count({
        where: {
          status: 'awaiting_doctor',
          archivedByDoctor: false,
        },
      }),
      // Total unique patients this doctor has seen
      prisma.conversation.findMany({
        where: {
          doctorId: req.user.id,
        },
        select: {
          patientId: true,
        },
        distinct: ['patientId'],
      }),
      // Responses today
      prisma.conversation.count({
        where: {
          doctorId: req.user.id,
          respondedAt: {
            gte: today,
          },
        },
      }),
    ]);

    res.status(200).json({
      status: 'success',
      pendingConversations: pendingCount,
      totalPatients: doctorConversations.length,
      todayResponses,
    });
  })
);

/**
 * @route   PATCH /api/doctors/conversation/:id/archive
 * @desc    Archive a conversation
 * @access  Private (Doctor only)
 */
router.patch(
  '/conversation/:id/archive',
  auth,
  requireRole('doctor'),
  catchAsync(async (req, res) => {
    logger.info('Doctor archiving conversation', {
      userId: req.user.id,
      conversationId: req.params.id,
    });

    const conversation = await prisma.conversation.update({
      where: { id: req.params.id },
      data: { archivedByDoctor: true }
    });

    if (!conversation) {
      throw new NotFoundError('Conversation not found');
    }

    res.status(200).json({
      status: 'success',
      message: 'Conversation archived successfully',
    });
  })
);

/**
 * @route   PATCH /api/doctors/conversation/:id/unarchive
 * @desc    Unarchive a conversation
 * @access  Private (Doctor only)
 */
router.patch(
  '/conversation/:id/unarchive',
  auth,
  requireRole('doctor'),
  catchAsync(async (req, res) => {
    logger.info('Doctor unarchiving conversation', {
      userId: req.user.id,
      conversationId: req.params.id,
    });

    const conversation = await prisma.conversation.update({
      where: { id: req.params.id },
      data: { archivedByDoctor: false }
    });

    if (!conversation) {
      throw new NotFoundError('Conversation not found');
    }

    res.status(200).json({
      status: 'success',
      message: 'Conversation unarchived successfully',
    });
  })
);

/**
 * @route   DELETE /api/doctors/conversation/:id
 * @desc    Delete a conversation (soft delete)
 * @access  Private (Doctor only)
 */
router.delete(
  '/conversation/:id',
  auth,
  requireRole('doctor'),
  catchAsync(async (req, res) => {
    logger.warn('Doctor attempting to delete conversation', {
      userId: req.user.id,
      conversationId: req.params.id,
    });

    // Soft delete (archive) for medical records
    const conversation = await prisma.conversation.update({
      where: { id: req.params.id },
      data: { archivedByDoctor: true }
    });

    if (!conversation) {
      throw new NotFoundError('Conversation not found');
    }

    logger.info('Conversation soft-deleted by doctor', {
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
