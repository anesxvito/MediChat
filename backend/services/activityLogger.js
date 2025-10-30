/**
 * PROFESSIONAL ACTIVITY LOGGING SERVICE
 * Centralized service for logging all user and system activities
 * TEMPORARILY DISABLED during PostgreSQL migration
 */

class ActivityLogger {
  // All methods temporarily return resolved promises during migration
  static async logLogin(user, req, success = true) {
    return Promise.resolve();
  }

  static async logLogout(user, req) {
    return Promise.resolve();
  }

  static async logRegistration(user, req) {
    return Promise.resolve();
  }

  static async logUserCreated(admin, newUser, req) {
    return Promise.resolve();
  }

  static async logUserUpdated(admin, updatedUser, req, changes = {}) {
    return Promise.resolve();
  }

  static async logProfileUpdated(user, req, changes = {}) {
    return Promise.resolve();
  }

  static async logUserDeleted(admin, deletedUserId, req) {
    return Promise.resolve();
  }

  static async logConversationCreated(user, conversation, req) {
    return Promise.resolve();
  }

  static async logMessageSent(user, message, conversationId, req) {
    return Promise.resolve();
  }

  static async logDiagnosisCreated(doctor, conversation, req) {
    return Promise.resolve();
  }

  static async logPrescriptionCreated(doctor, conversation, prescriptions, req) {
    return Promise.resolve();
  }

  static async logFileUpload(user, filename, filesize, req) {
    return Promise.resolve();
  }

  static async logError(error, req, user = null) {
    return Promise.resolve();
  }

  static async logSystemEvent(action, description, severity = 'info', metadata = {}) {
    return Promise.resolve();
  }

  static async logRequest(req, res, duration, user = null) {
    return Promise.resolve();
  }
}

module.exports = ActivityLogger;
