const express = require('express');
const router = express.Router();
const { auth, requireRole } = require('../middleware/auth');
const { catchAsync } = require('../middleware/errorHandler');
const { NotFoundError, BadRequestError } = require('../utils/errors');
const { prisma } = require('../config/database');
const logger = require('../utils/logger');

/**
 * CARE PLANS ROUTES
 * Manage patient care plans with goals and tasks
 */

/**
 * @route   GET /api/care-plans
 * @desc    Get all care plans for logged-in patient
 * @access  Private (Patient)
 */
router.get(
  '/',
  auth,
  requireRole('patient'),
  catchAsync(async (req, res) => {
    const { status } = req.query;

    const where = {
      patientId: req.user.id,
    };

    if (status) {
      where.status = status;
    }

    const carePlans = await prisma.carePlan.findMany({
      where,
      include: {
        doctor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            specialization: true,
          },
        },
        goals: {
          orderBy: {
            createdAt: 'asc',
          },
        },
        tasks: {
          orderBy: {
            dueDate: 'asc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    logger.info('Care plans retrieved', {
      userId: req.user.id,
      count: carePlans.length
    });

    res.status(200).json(carePlans);
  })
);

/**
 * @route   GET /api/care-plans/:id
 * @desc    Get care plan by ID
 * @access  Private (Patient)
 */
router.get(
  '/:id',
  auth,
  requireRole('patient'),
  catchAsync(async (req, res) => {
    const carePlan = await prisma.carePlan.findUnique({
      where: { id: req.params.id },
      include: {
        doctor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            specialization: true,
          },
        },
        goals: true,
        tasks: true,
      },
    });

    if (!carePlan) {
      throw new NotFoundError('Care plan not found');
    }

    // Check authorization
    if (carePlan.patientId !== req.user.id) {
      throw new BadRequestError('Not authorized to view this care plan');
    }

    res.status(200).json({
      status: 'success',
      carePlan,
    });
  })
);

/**
 * @route   PATCH /api/care-plans/:id/goals/:goalId
 * @desc    Update goal progress
 * @access  Private (Patient)
 */
router.patch(
  '/:id/goals/:goalId',
  auth,
  requireRole('patient'),
  catchAsync(async (req, res) => {
    const { currentValue, progressPercent, status } = req.body;

    // Verify care plan belongs to patient
    const carePlan = await prisma.carePlan.findUnique({
      where: { id: req.params.id },
    });

    if (!carePlan) {
      throw new NotFoundError('Care plan not found');
    }

    if (carePlan.patientId !== req.user.id) {
      throw new BadRequestError('Not authorized to update this care plan');
    }

    const updateData = {};

    if (currentValue !== undefined) {
      updateData.currentValue = currentValue;
    }

    if (progressPercent !== undefined) {
      updateData.progressPercent = parseInt(progressPercent);
    }

    if (status) {
      updateData.status = status;
      if (status === 'completed') {
        updateData.achievedDate = new Date();
      }
    }

    const goal = await prisma.carePlanGoal.update({
      where: { id: req.params.goalId },
      data: updateData,
    });

    // Recalculate care plan progress
    const goals = await prisma.carePlanGoal.findMany({
      where: { carePlanId: req.params.id },
    });

    const totalProgress = goals.reduce((sum, g) => sum + g.progressPercent, 0);
    const averageProgress = Math.round(totalProgress / goals.length);

    await prisma.carePlan.update({
      where: { id: req.params.id },
      data: { progressPercent: averageProgress },
    });

    logger.info('Care plan goal updated', {
      carePlanId: req.params.id,
      goalId: req.params.goalId,
      patientId: req.user.id
    });

    res.status(200).json({
      status: 'success',
      message: 'Goal updated successfully',
      goal,
    });
  })
);

/**
 * @route   PATCH /api/care-plans/:id/tasks/:taskId
 * @desc    Update task status
 * @access  Private (Patient)
 */
router.patch(
  '/:id/tasks/:taskId',
  auth,
  requireRole('patient'),
  catchAsync(async (req, res) => {
    const { status } = req.body;

    // Verify care plan belongs to patient
    const carePlan = await prisma.carePlan.findUnique({
      where: { id: req.params.id },
    });

    if (!carePlan) {
      throw new NotFoundError('Care plan not found');
    }

    if (carePlan.patientId !== req.user.id) {
      throw new BadRequestError('Not authorized to update this care plan');
    }

    const updateData = {
      status,
    };

    if (status === 'completed') {
      updateData.completedDate = new Date();
    }

    const task = await prisma.carePlanTask.update({
      where: { id: req.params.taskId },
      data: updateData,
    });

    logger.info('Care plan task updated', {
      carePlanId: req.params.id,
      taskId: req.params.taskId,
      patientId: req.user.id
    });

    res.status(200).json({
      status: 'success',
      message: 'Task updated successfully',
      task,
    });
  })
);

/**
 * @route   POST /api/care-plans
 * @desc    Create a new care plan (Doctor only)
 * @access  Private (Doctor)
 */
router.post(
  '/',
  auth,
  requireRole('doctor'),
  catchAsync(async (req, res) => {
    const {
      patientId,
      title,
      description,
      category,
      startDate,
      targetDate,
      goals,
      tasks,
    } = req.body;

    // Validate required fields
    if (!patientId || !title || !startDate) {
      throw new BadRequestError('Patient, title, and start date are required');
    }

    // Verify patient exists
    const patient = await prisma.user.findUnique({
      where: { id: patientId },
    });

    if (!patient || patient.role !== 'patient') {
      throw new NotFoundError('Patient not found');
    }

    const carePlan = await prisma.carePlan.create({
      data: {
        patientId,
        doctorId: req.user.id,
        title,
        description,
        category,
        startDate: new Date(startDate),
        targetDate: targetDate ? new Date(targetDate) : null,
        status: 'active',
        goals: goals
          ? {
              create: goals.map(goal => ({
                title: goal.title,
                description: goal.description,
                targetValue: goal.targetValue,
                unit: goal.unit,
                targetDate: goal.targetDate ? new Date(goal.targetDate) : null,
              })),
            }
          : undefined,
        tasks: tasks
          ? {
              create: tasks.map(task => ({
                title: task.title,
                description: task.description,
                priority: task.priority,
                dueDate: task.dueDate ? new Date(task.dueDate) : null,
              })),
            }
          : undefined,
      },
      include: {
        goals: true,
        tasks: true,
      },
    });

    logger.info('Care plan created', {
      carePlanId: carePlan.id,
      patientId,
      doctorId: req.user.id
    });

    res.status(201).json({
      status: 'success',
      message: 'Care plan created successfully',
      carePlan,
    });
  })
);

module.exports = router;
