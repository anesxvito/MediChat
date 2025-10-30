const express = require('express');
const router = express.Router();
const { auth, requireRole } = require('../middleware/auth');
const { prisma } = require('../config/database');
const ActivityLogger = require('../services/activityLogger');
const bcrypt = require('bcryptjs');

// Get all users (with filters)
router.get('/users', auth, requireRole('admin'), async (req, res) => {
  try {
    const { role, search } = req.query;
    const where = {};

    if (role) {
      where.role = role;
    }

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }

    const users = await prisma.user.findMany({
      where,
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
        updatedAt: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get system statistics
router.get('/stats', auth, requireRole('admin'), async (req, res) => {
  try {
    const [
      totalPatients,
      totalDoctors,
      totalConversations,
      pendingConversations,
      completedConversations
    ] = await Promise.all([
      prisma.user.count({ where: { role: 'patient' } }),
      prisma.user.count({ where: { role: 'doctor' } }),
      prisma.conversation.count(),
      prisma.conversation.count({ where: { status: 'awaiting_doctor' } }),
      prisma.conversation.count({ where: { status: 'doctor_responded' } })
    ]);

    // Get conversations per day for last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentConversations = await prisma.$queryRaw`
      SELECT
        DATE(created_at) as date,
        COUNT(*)::int as count
      FROM conversations
      WHERE created_at >= ${sevenDaysAgo}
      GROUP BY DATE(created_at)
      ORDER BY DATE(created_at) ASC
    `;

    res.json({
      totalPatients,
      totalDoctors,
      totalConversations,
      pendingConversations,
      completedConversations,
      conversationsPerDay: recentConversations
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Create new user (admin can create doctors/patients)
router.post('/users', auth, requireRole('admin'), async (req, res) => {
  try {
    const { email, password, firstName, lastName, role, phone, specialization, licenseNumber } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    const userData = {
      email: email.toLowerCase(),
      passwordHash,
      firstName,
      lastName,
      role,
      phone: phone || null,
      isActive: true,
      emailVerified: false
    };

    // Add doctor-specific fields
    if (role === 'doctor') {
      userData.specialization = specialization || null;
      userData.licenseNumber = licenseNumber || null;
    }

    const user = await prisma.user.create({
      data: userData,
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        phone: true,
        specialization: true,
        licenseNumber: true,
        isActive: true,
        emailVerified: true,
        createdAt: true
      }
    });

    res.status(201).json({
      message: 'User created successfully',
      user
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Update user
router.patch('/users/:id', auth, requireRole('admin'), async (req, res) => {
  try {
    const allowedUpdates = ['firstName', 'lastName', 'phone', 'specialization', 'licenseNumber', 'role', 'isActive'];
    const updates = {};

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: updates,
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        phone: true,
        specialization: true,
        licenseNumber: true,
        isActive: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true
      }
    });

    res.json({
      message: 'User updated successfully',
      user
    });
  } catch (error) {
    console.error('Error updating user:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Delete user
router.delete('/users/:id', auth, requireRole('admin'), async (req, res) => {
  try {
    // Don't allow admin to delete themselves
    if (req.params.id === req.user.id) {
      return res.status(403).json({ error: 'Cannot delete your own account' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.params.id }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // If deleting a doctor, unassign them from conversations
    if (user.role === 'doctor') {
      await prisma.conversation.updateMany({
        where: { doctorId: user.id },
        data: { doctorId: null }
      });
    }

    // Delete user (cascading deletes will handle related records)
    await prisma.user.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Get all conversations (admin view)
router.get('/conversations', auth, requireRole('admin'), async (req, res) => {
  try {
    const { status, search } = req.query;
    const where = {};

    if (status) {
      where.status = status;
    }

    const conversations = await prisma.conversation.findMany({
      where,
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
      },
      orderBy: { createdAt: 'desc' },
      take: 100
    });

    res.json({ conversations });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

// Delete any conversation (admin power)
router.delete('/conversations/:id', auth, requireRole('admin'), async (req, res) => {
  try {
    await prisma.conversation.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Conversation deleted successfully' });
  } catch (error) {
    console.error('Error deleting conversation:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Conversation not found' });
    }
    res.status(500).json({ error: 'Failed to delete conversation' });
  }
});

// ================================================================
// ACTIVITY LOGS ENDPOINTS
// ================================================================

// Get activity logs (with filtering and pagination)
router.get('/logs/activities', auth, requireRole('admin'), async (req, res) => {
  try {
    const {
      action,
      status,
      severity,
      userRole,
      userId,
      startDate,
      endDate,
      page = 1,
      limit = 100
    } = req.query;

    const where = {};

    // Build query filters
    if (action) where.action = action;
    if (status) where.status = status;
    if (severity) where.severity = severity;
    if (userRole) where.userRole = userRole;
    if (userId) where.userId = userId;

    // Date range filter
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get logs with pagination
    const [logs, total] = await Promise.all([
      prisma.activityLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit),
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              role: true
            }
          }
        }
      }),
      prisma.activityLog.count({ where })
    ]);

    res.json({
      logs,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalLogs: total,
        logsPerPage: parseInt(limit),
      },
    });
  } catch (error) {
    console.error('Error fetching activity logs:', error);
    res.status(500).json({ error: 'Failed to fetch activity logs' });
  }
});

// Get activity statistics
router.get('/logs/statistics', auth, requireRole('admin'), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Last 30 days
    const end = endDate ? new Date(endDate) : new Date();

    const where = {
      createdAt: { gte: start, lte: end }
    };

    const [
      totalLogs,
      byStatusResults,
      bySeverityResults,
      byUserRoleResults,
      topActionsResults,
      failedLogins
    ] = await Promise.all([
      prisma.activityLog.count({ where }),

      prisma.activityLog.groupBy({
        by: ['status'],
        where,
        _count: true
      }),

      prisma.activityLog.groupBy({
        by: ['severity'],
        where,
        _count: true
      }),

      prisma.activityLog.groupBy({
        by: ['userRole'],
        where,
        _count: true
      }),

      prisma.activityLog.groupBy({
        by: ['action'],
        where,
        _count: true,
        orderBy: { _count: { action: 'desc' } },
        take: 10
      }),

      prisma.activityLog.count({
        where: {
          action: 'user.login.failed',
          createdAt: { gte: start, lte: end }
        }
      })
    ]);

    // Format the results to match the expected structure
    const byStatus = byStatusResults.map(item => ({
      _id: item.status,
      count: item._count
    }));

    const bySeverity = bySeverityResults.map(item => ({
      _id: item.severity,
      count: item._count
    }));

    const byUserRole = byUserRoleResults.map(item => ({
      _id: item.userRole,
      count: item._count
    }));

    const topActions = topActionsResults.map(item => ({
      _id: item.action,
      count: item._count
    }));

    res.json({
      period: { startDate: start, endDate: end },
      totalLogs,
      byStatus,
      bySeverity,
      byUserRole,
      topActions,
      failedLogins
    });
  } catch (error) {
    console.error('Error fetching activity statistics:', error);
    res.status(500).json({ error: 'Failed to fetch activity statistics' });
  }
});

// Get user activity history
router.get('/logs/user/:userId', auth, requireRole('admin'), async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 50 } = req.query;

    const activities = await prisma.activityLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true
          }
        }
      }
    });

    res.json({ activities });
  } catch (error) {
    console.error('Error fetching user activity:', error);
    res.status(500).json({ error: 'Failed to fetch user activity' });
  }
});

// Get recent activities (last 100)
router.get('/logs/recent', auth, requireRole('admin'), async (req, res) => {
  try {
    const { limit = 100 } = req.query;

    const activities = await prisma.activityLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true
          }
        }
      }
    });

    res.json({ activities });
  } catch (error) {
    console.error('Error fetching recent activities:', error);
    res.status(500).json({ error: 'Failed to fetch recent activities' });
  }
});

module.exports = router;
