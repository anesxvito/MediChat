const express = require('express');
const router = express.Router();
const { auth, requireRole } = require('../middleware/auth');
const { catchAsync } = require('../middleware/errorHandler');
const { NotFoundError, BadRequestError } = require('../utils/errors');
const { prisma } = require('../config/database');
const logger = require('../utils/logger');

/**
 * LAB RESULTS ROUTES
 * Manage patient laboratory test results
 */

/**
 * @route   GET /api/lab-results
 * @desc    Get all lab results for logged-in patient
 * @access  Private (Patient)
 */
router.get(
  '/',
  auth,
  requireRole('patient'),
  catchAsync(async (req, res) => {
    const { category, status, startDate, endDate } = req.query;

    const where = {
      patientId: req.user.id,
    };

    // Filter by category
    if (category) {
      where.category = category;
    }

    // Filter by status
    if (status) {
      where.status = status;
    }

    // Filter by date range
    if (startDate || endDate) {
      where.resultDate = {};
      if (startDate) {
        where.resultDate.gte = new Date(startDate);
      }
      if (endDate) {
        where.resultDate.lte = new Date(endDate);
      }
    }

    const labResults = await prisma.labResult.findMany({
      where,
      orderBy: {
        resultDate: 'desc',
      },
    });

    logger.info('Lab results retrieved', {
      userId: req.user.id,
      count: labResults.length
    });

    res.status(200).json(labResults);
  })
);

/**
 * @route   GET /api/lab-results/:id
 * @desc    Get lab result by ID
 * @access  Private (Patient)
 */
router.get(
  '/:id',
  auth,
  requireRole('patient'),
  catchAsync(async (req, res) => {
    const labResult = await prisma.labResult.findUnique({
      where: { id: req.params.id },
    });

    if (!labResult) {
      throw new NotFoundError('Lab result not found');
    }

    // Check authorization
    if (labResult.patientId !== req.user.id) {
      throw new BadRequestError('Not authorized to view this lab result');
    }

    res.status(200).json({
      status: 'success',
      labResult,
    });
  })
);

/**
 * @route   POST /api/lab-results
 * @desc    Create a new lab result (Admin/Doctor only)
 * @access  Private (Doctor/Admin)
 */
router.post(
  '/',
  auth,
  catchAsync(async (req, res) => {
    // Only doctors and admins can create lab results
    if (req.user.role !== 'doctor' && req.user.role !== 'admin') {
      throw new BadRequestError('Not authorized to create lab results');
    }

    const {
      patientId,
      testName,
      category,
      result,
      unit,
      referenceRange,
      status,
      numericValue,
      orderedBy,
      performedAt,
      interpretation,
      isCritical,
      isAbnormal,
      collectionDate,
      resultDate,
    } = req.body;

    // Validate required fields
    if (!patientId || !testName || !category || !result || !resultDate) {
      throw new BadRequestError('Patient, test name, category, result, and result date are required');
    }

    // Verify patient exists
    const patient = await prisma.user.findUnique({
      where: { id: patientId },
    });

    if (!patient || patient.role !== 'patient') {
      throw new NotFoundError('Patient not found');
    }

    const labResult = await prisma.labResult.create({
      data: {
        patientId,
        testName,
        category,
        result,
        unit,
        referenceRange,
        status: status || 'normal',
        numericValue: numericValue ? parseFloat(numericValue) : null,
        orderedBy: orderedBy || req.user.id,
        performedAt,
        interpretedBy: req.user.id,
        interpretation,
        isCritical: isCritical || false,
        isAbnormal: isAbnormal || false,
        collectionDate: collectionDate ? new Date(collectionDate) : null,
        resultDate: new Date(resultDate),
      },
    });

    logger.info('Lab result created', {
      labResultId: labResult.id,
      patientId,
      doctorId: req.user.id
    });

    res.status(201).json({
      status: 'success',
      message: 'Lab result created successfully',
      labResult,
    });
  })
);

/**
 * @route   GET /api/lab-results/trends/:testName
 * @desc    Get trends for a specific test over time
 * @access  Private (Patient)
 */
router.get(
  '/trends/:testName',
  auth,
  requireRole('patient'),
  catchAsync(async (req, res) => {
    const { testName } = req.params;
    const { limit } = req.query;

    const labResults = await prisma.labResult.findMany({
      where: {
        patientId: req.user.id,
        testName: {
          contains: testName,
          mode: 'insensitive',
        },
        numericValue: {
          not: null,
        },
      },
      orderBy: {
        resultDate: 'asc',
      },
      take: limit ? parseInt(limit) : undefined,
    });

    res.status(200).json({
      status: 'success',
      results: labResults.length,
      trends: labResults.map(result => ({
        date: result.resultDate,
        value: result.numericValue,
        status: result.status,
        unit: result.unit,
      })),
    });
  })
);

module.exports = router;
