const mongoose = require('mongoose');

/**
 * ACTIVITY LOG MODEL
 * Professional audit trail and activity logging system
 */

const activityLogSchema = new mongoose.Schema(
  {
    // User information
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false, // Not required for anonymous actions
    },
    userRole: {
      type: String,
      enum: ['patient', 'doctor', 'admin', 'system', 'anonymous'],
      required: true,
    },
    userEmail: {
      type: String,
      required: false,
    },

    // Action details
    action: {
      type: String,
      required: true,
      enum: [
        // Authentication
        'user.login',
        'user.logout',
        'user.register',
        'user.login.failed',

        // User management
        'user.created',
        'user.updated',
        'user.deleted',
        'user.activated',
        'user.deactivated',
        'profile.updated',

        // Conversations
        'conversation.created',
        'conversation.updated',
        'conversation.deleted',
        'conversation.archived',
        'conversation.unarchived',
        'conversation.assigned',

        // Messages
        'message.sent',
        'message.received',
        'message.read',

        // Medical actions
        'diagnosis.created',
        'prescription.created',
        'referral.created',

        // File operations
        'file.uploaded',
        'file.downloaded',
        'file.deleted',

        // Admin actions
        'admin.report.generated',
        'admin.settings.changed',
        'admin.backup.created',

        // System events
        'system.startup',
        'system.shutdown',
        'system.error',
      ],
    },

    // Resource information
    resourceType: {
      type: String,
      enum: ['user', 'conversation', 'message', 'file', 'prescription', 'system'],
      required: false,
    },
    resourceId: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
    },

    // Request details
    method: {
      type: String,
      enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      required: false,
    },
    endpoint: {
      type: String,
      required: false,
    },

    // Client information
    ipAddress: {
      type: String,
      required: false,
    },
    userAgent: {
      type: String,
      required: false,
    },

    // Status and result
    status: {
      type: String,
      enum: ['success', 'failure', 'error', 'warning'],
      required: true,
      default: 'success',
    },
    statusCode: {
      type: Number,
      required: false,
    },

    // Additional context
    description: {
      type: String,
      required: false,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      required: false,
    },

    // Error information (if applicable)
    error: {
      message: String,
      stack: String,
      code: String,
    },

    // Performance metrics
    duration: {
      type: Number, // in milliseconds
      required: false,
    },

    // Severity level
    severity: {
      type: String,
      enum: ['info', 'warning', 'error', 'critical'],
      default: 'info',
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
    collection: 'activity_logs',
  }
);

// Indexes for efficient querying
activityLogSchema.index({ user: 1, createdAt: -1 });
activityLogSchema.index({ action: 1, createdAt: -1 });
activityLogSchema.index({ status: 1, createdAt: -1 });
activityLogSchema.index({ severity: 1, createdAt: -1 });
activityLogSchema.index({ userRole: 1, createdAt: -1 });
activityLogSchema.index({ resourceType: 1, resourceId: 1 });
activityLogSchema.index({ createdAt: -1 }); // For time-based queries

// TTL index to auto-delete logs older than 90 days (optional)
// activityLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 }); // 90 days

// Static methods
activityLogSchema.statics.logActivity = async function(data) {
  try {
    const log = new this(data);
    await log.save();
    return log;
  } catch (error) {
    console.error('Failed to log activity:', error);
    // Don't throw - logging failures shouldn't break the app
  }
};

// Get recent activities
activityLogSchema.statics.getRecentActivities = async function(filters = {}, limit = 100) {
  return this.find(filters)
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('user', 'firstName lastName email role')
    .lean();
};

// Get user activity history
activityLogSchema.statics.getUserActivity = async function(userId, limit = 50) {
  return this.find({ user: userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
};

// Get failed login attempts
activityLogSchema.statics.getFailedLoginAttempts = async function(email, timeWindow = 15) {
  const since = new Date(Date.now() - timeWindow * 60 * 1000);
  return this.countDocuments({
    action: 'user.login.failed',
    userEmail: email,
    createdAt: { $gte: since },
  });
};

// Get activity statistics
activityLogSchema.statics.getStatistics = async function(startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        },
      },
    },
    {
      $group: {
        _id: {
          action: '$action',
          status: '$status',
        },
        count: { $sum: 1 },
      },
    },
    {
      $sort: { count: -1 },
    },
  ]);
};

module.exports = mongoose.model('ActivityLog', activityLogSchema);
