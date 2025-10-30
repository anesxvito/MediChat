const express = require('express');
const router = express.Router();
const { auth, requireRole } = require('../middleware/auth');
const { catchAsync } = require('../middleware/errorHandler');
const { NotFoundError, BadRequestError } = require('../utils/errors');
const { prisma } = require('../config/database');
const logger = require('../utils/logger');

/**
 * APPOINTMENTS ROUTES
 * Manage patient appointments with doctors
 */

/**
 * @route   GET /api/appointments
 * @desc    Get all appointments for logged-in user (patient or doctor)
 * @access  Private
 */
router.get(
  '/',
  auth,
  catchAsync(async (req, res) => {
    const { status, type, startDate, endDate } = req.query;
    const userId = req.user.id;

    const where = {};

    // Filter by user role
    if (req.user.role === 'patient') {
      where.patientId = userId;
    } else if (req.user.role === 'doctor') {
      where.doctorId = userId;
    }

    // Filter by status
    if (status) {
      where.status = status;
    }

    // Filter by type
    if (type) {
      where.type = type;
    }

    // Filter by date range
    if (startDate || endDate) {
      where.appointmentDate = {};
      if (startDate) {
        where.appointmentDate.gte = new Date(startDate);
      }
      if (endDate) {
        where.appointmentDate.lte = new Date(endDate);
      }
    }

    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        doctor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            specialization: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: {
        appointmentDate: 'desc',
      },
    });

    logger.info('Appointments retrieved', {
      userId,
      role: req.user.role,
      count: appointments.length
    });

    res.status(200).json(appointments);
  })
);

/**
 * @route   GET /api/appointments/:id
 * @desc    Get appointment by ID
 * @access  Private
 */
router.get(
  '/:id',
  auth,
  catchAsync(async (req, res) => {
    const appointment = await prisma.appointment.findUnique({
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
          },
        },
        doctor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            specialization: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    if (!appointment) {
      throw new NotFoundError('Appointment not found');
    }

    // Check authorization
    if (
      req.user.role === 'patient' && appointment.patientId !== req.user.id ||
      req.user.role === 'doctor' && appointment.doctorId !== req.user.id
    ) {
      throw new BadRequestError('Not authorized to view this appointment');
    }

    res.status(200).json({
      status: 'success',
      appointment,
    });
  })
);

/**
 * @route   POST /api/appointments
 * @desc    Book a new appointment
 * @access  Private (Patient)
 */
router.post(
  '/',
  auth,
  requireRole('patient'),
  catchAsync(async (req, res) => {
    const {
      doctorId,
      appointmentDate,
      duration,
      type,
      reason,
      chiefComplaint,
      location,
    } = req.body;

    // Validate required fields
    if (!doctorId || !appointmentDate || !type) {
      throw new BadRequestError('Doctor, appointment date, and type are required');
    }

    // Check if doctor exists and is active
    const doctor = await prisma.user.findUnique({
      where: { id: doctorId },
    });

    if (!doctor || doctor.role !== 'doctor' || !doctor.isActive) {
      throw new NotFoundError('Doctor not found or not available');
    }

    // Check for scheduling conflicts
    const conflictingAppointment = await prisma.appointment.findFirst({
      where: {
        doctorId,
        appointmentDate: new Date(appointmentDate),
        status: {
          notIn: ['cancelled', 'no_show'],
        },
      },
    });

    if (conflictingAppointment) {
      throw new BadRequestError('This time slot is already booked');
    }

    // Create appointment
    const appointment = await prisma.appointment.create({
      data: {
        patientId: req.user.id,
        doctorId,
        appointmentDate: new Date(appointmentDate),
        duration: duration || 30,
        type,
        reason,
        chiefComplaint,
        location,
        status: 'scheduled',
      },
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        doctor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            specialization: true,
            email: true,
          },
        },
      },
    });

    logger.info('Appointment created', {
      appointmentId: appointment.id,
      patientId: req.user.id,
      doctorId
    });

    res.status(201).json({
      status: 'success',
      message: 'Appointment booked successfully',
      appointment,
    });
  })
);

/**
 * @route   PATCH /api/appointments/:id
 * @desc    Update appointment (reschedule, confirm, etc.)
 * @access  Private
 */
router.patch(
  '/:id',
  auth,
  catchAsync(async (req, res) => {
    const { status, appointmentDate, notes, cancelReason } = req.body;

    const existingAppointment = await prisma.appointment.findUnique({
      where: { id: req.params.id },
    });

    if (!existingAppointment) {
      throw new NotFoundError('Appointment not found');
    }

    // Check authorization
    if (
      req.user.role === 'patient' && existingAppointment.patientId !== req.user.id ||
      req.user.role === 'doctor' && existingAppointment.doctorId !== req.user.id
    ) {
      throw new BadRequestError('Not authorized to update this appointment');
    }

    const updateData = {};

    // Handle status changes
    if (status) {
      updateData.status = status;

      if (status === 'cancelled') {
        updateData.cancelledAt = new Date();
        if (cancelReason) {
          updateData.cancelReason = cancelReason;
        }
      } else if (status === 'completed') {
        updateData.completedAt = new Date();
      }
    }

    // Handle rescheduling
    if (appointmentDate && appointmentDate !== existingAppointment.appointmentDate.toISOString()) {
      // Check for conflicts
      const conflictingAppointment = await prisma.appointment.findFirst({
        where: {
          doctorId: existingAppointment.doctorId,
          appointmentDate: new Date(appointmentDate),
          id: { not: req.params.id },
          status: {
            notIn: ['cancelled', 'no_show'],
          },
        },
      });

      if (conflictingAppointment) {
        throw new BadRequestError('This time slot is already booked');
      }

      updateData.appointmentDate = new Date(appointmentDate);
      updateData.status = 'rescheduled';
      updateData.rescheduledFrom = existingAppointment.id;
    }

    // Handle notes
    if (notes !== undefined) {
      updateData.notes = notes;
    }

    const appointment = await prisma.appointment.update({
      where: { id: req.params.id },
      data: updateData,
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        doctor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            specialization: true,
          },
        },
      },
    });

    logger.info('Appointment updated', {
      appointmentId: appointment.id,
      updates: Object.keys(updateData)
    });

    res.status(200).json({
      status: 'success',
      message: 'Appointment updated successfully',
      appointment,
    });
  })
);

/**
 * @route   DELETE /api/appointments/:id
 * @desc    Cancel appointment
 * @access  Private
 */
router.delete(
  '/:id',
  auth,
  catchAsync(async (req, res) => {
    const appointment = await prisma.appointment.findUnique({
      where: { id: req.params.id },
    });

    if (!appointment) {
      throw new NotFoundError('Appointment not found');
    }

    // Check authorization
    if (
      req.user.role === 'patient' && appointment.patientId !== req.user.id ||
      req.user.role === 'doctor' && appointment.doctorId !== req.user.id
    ) {
      throw new BadRequestError('Not authorized to cancel this appointment');
    }

    await prisma.appointment.update({
      where: { id: req.params.id },
      data: {
        status: 'cancelled',
        cancelledAt: new Date(),
        cancelReason: req.body.reason || 'Cancelled by user',
      },
    });

    logger.info('Appointment cancelled', {
      appointmentId: req.params.id,
      userId: req.user.id
    });

    res.status(200).json({
      status: 'success',
      message: 'Appointment cancelled successfully',
    });
  })
);

module.exports = router;
