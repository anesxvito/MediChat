/**
 * NOSQL INJECTION PROTECTION MIDDLEWARE
 * Compatible with Express 5.x
 * Manually sanitizes req.body to prevent NoSQL injection attacks
 */

/**
 * Recursively sanitize an object to remove dangerous MongoDB operators
 * @param {*} obj - Object to sanitize
 * @returns {*} - Sanitized object
 */
function sanitizeObject(obj) {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  // Handle arrays
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }

  // Handle objects
  const sanitized = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      // Remove keys that start with $ (MongoDB operators)
      if (key.startsWith('$')) {
        console.warn(`🚨 NoSQL Injection attempt detected: Key "${key}" removed`);
        continue;
      }

      // Recursively sanitize nested objects
      sanitized[key] = sanitizeObject(obj[key]);
    }
  }

  return sanitized;
}

/**
 * Middleware to sanitize req.body only (Express 5.x compatible)
 */
const sanitizeRequestBody = (req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body);
  }
  next();
};

module.exports = { sanitizeRequestBody, sanitizeObject };
