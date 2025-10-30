const express = require('express');
const router = express.Router();
const { auth, requireRole } = require('../middleware/auth');
const { catchAsync } = require('../middleware/errorHandler');
const { NotFoundError, BadRequestError } = require('../utils/errors');
const { prisma } = require('../config/database');
const logger = require('../utils/logger');

/**
 * VITAL SIGNS ROUTES
 * Manage patient vital signs measurements
 */

/**
 * @route   GET /api/vital-signs
 * @desc    Get all vital signs for logged-in patient
 * @access  Private (Patient)
 */
router.get(
  '/',
  auth,
  requireRole('patient'),
  catchAsync(async (req, res) => {
    const { startDate, endDate, limit } = req.query;

    const where = {
      patientId: req.user.id,
    };

    // Filter by date range
    if (startDate || endDate) {
      where.measuredAt = {};
      if (startDate) {
        where.measuredAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.measuredAt.lte = new Date(endDate);
      }
    }

    const vitalSigns = await prisma.vitalSign.findMany({
      where,
      orderBy: {
        measuredAt: 'desc',
      },
      take: limit ? parseInt(limit) : undefined,
    });

    logger.info('Vital signs retrieved', {
      userId: req.user.id,
      count: vitalSigns.length
    });

    res.status(200).json(vitalSigns);
  })
);

/**
 * @route   GET /api/vital-signs/latest
 * @desc    Get latest vital signs for patient
 * @access  Private (Patient)
 */
router.get(
  '/latest',
  auth,
  requireRole('patient'),
  catchAsync(async (req, res) => {
    const latestVitalSign = await prisma.vitalSign.findFirst({
      where: {
        patientId: req.user.id,
      },
      orderBy: {
        measuredAt: 'desc',
      },
    });

    res.status(200).json({
      status: 'success',
      vitalSign: latestVitalSign,
    });
  })
);

/**
 * @route   POST /api/vital-signs
 * @desc    Add new vital sign measurement
 * @access  Private (Patient)
 */
router.post(
  '/',
  auth,
  requireRole('patient'),
  catchAsync(async (req, res) => {
    const {
      systolicBp,
      diastolicBp,
      heartRate,
      temperature,
      oxygenSat,
      respiratoryRate,
      weight,
      height,
      bmi,
      location,
      notes,
      measuredAt,
    } = req.body;

    // Calculate BMI if height and weight are provided but BMI isn't
    let calculatedBmi = bmi;
    if (!bmi && height && weight) {
      const heightInMeters = parseFloat(height) / 100;
      calculatedBmi = parseFloat(weight) / (heightInMeters * heightInMeters);
    }

    const vitalSign = await prisma.vitalSign.create({
      data: {
        patientId: req.user.id,
        systolicBp: systolicBp ? parseInt(systolicBp) : null,
        diastolicBp: diastolicBp ? parseInt(diastolicBp) : null,
        heartRate: heartRate ? parseInt(heartRate) : null,
        temperature: temperature ? parseFloat(temperature) : null,
        oxygenSat: oxygenSat ? parseInt(oxygenSat) : null,
        respiratoryRate: respiratoryRate ? parseInt(respiratoryRate) : null,
        weight: weight ? parseFloat(weight) : null,
        height: height ? parseFloat(height) : null,
        bmi: calculatedBmi ? parseFloat(calculatedBmi) : null,
        location,
        notes,
        measuredAt: measuredAt ? new Date(measuredAt) : new Date(),
      },
    });

    logger.info('Vital sign created', {
      vitalSignId: vitalSign.id,
      patientId: req.user.id
    });

    res.status(201).json({
      status: 'success',
      message: 'Vital sign recorded successfully',
      vitalSign,
    });
  })
);

/**
 * @route   GET /api/vital-signs/:id
 * @desc    Get vital sign by ID
 * @access  Private (Patient)
 */
router.get(
  '/:id',
  auth,
  requireRole('patient'),
  catchAsync(async (req, res) => {
    const vitalSign = await prisma.vitalSign.findUnique({
      where: { id: req.params.id },
    });

    if (!vitalSign) {
      throw new NotFoundError('Vital sign not found');
    }

    // Check authorization
    if (vitalSign.patientId !== req.user.id) {
      throw new BadRequestError('Not authorized to view this vital sign');
    }

    res.status(200).json({
      status: 'success',
      vitalSign,
    });
  })
);

/**
 * @route   DELETE /api/vital-signs/:id
 * @desc    Delete vital sign
 * @access  Private (Patient)
 */
router.delete(
  '/:id',
  auth,
  requireRole('patient'),
  catchAsync(async (req, res) => {
    const vitalSign = await prisma.vitalSign.findUnique({
      where: { id: req.params.id },
    });

    if (!vitalSign) {
      throw new NotFoundError('Vital sign not found');
    }

    // Check authorization
    if (vitalSign.patientId !== req.user.id) {
      throw new BadRequestError('Not authorized to delete this vital sign');
    }

    await prisma.vitalSign.delete({
      where: { id: req.params.id },
    });

    logger.info('Vital sign deleted', {
      vitalSignId: req.params.id,
      patientId: req.user.id
    });

    res.status(200).json({
      status: 'success',
      message: 'Vital sign deleted successfully',
    });
  })
);

module.exports = router;
