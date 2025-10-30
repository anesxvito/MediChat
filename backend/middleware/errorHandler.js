const logger = require('../utils/logger');
const { AppError } = require('../utils/errors');

/**
 * PROFESSIONAL ERROR HANDLING MIDDLEWARE
 * Centralized error processing and response formatting
 */

// Handle different types of errors
const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg ? err.errmsg.match(/(["'])(\\?.)*?\1/)[0] : 'duplicate value';
  const message = `Duplicate field value: ${value}. Please use another value`;
  return new AppError(message, 409);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJWTError = () =>
  new AppError('Invalid token. Please log in again', 401);

const handleJWTExpiredError = () =>
  new AppError('Your token has expired. Please log in again', 401);

// Send error response in development
const sendErrorDev = (err, req, res) => {
  logger.error('ERROR 💥', {
    error: err,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    user: req.user ? req.user._id : 'Not authenticated',
  });

  res.status(err.statusCode).json({
    status: err.status,
    error: err.message, // Send just the message string, not the entire error object
    message: err.message,
    stack: err.stack,
  });
};

// Send error response in production
const sendErrorProd = (err, req, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    logger.warn('Operational Error', {
      message: err.message,
      url: req.originalUrl,
      method: req.method,
      statusCode: err.statusCode,
    });

    res.status(err.statusCode).json({
      status: err.status,
      error: err.message,
      message: err.message,
    });
  }
  // Programming or other unknown error: don't leak error details
  else {
    logger.error('UNKNOWN ERROR 💥', {
      error: err,
      url: req.originalUrl,
      method: req.method,
    });

    res.status(500).json({
      status: 'error',
      error: 'Something went wrong. Please try again later.',
      message: 'Something went wrong. Please try again later.',
    });
  }
};

// Global error handling middleware
const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    error.message = err.message;

    // Handle specific error types
    if (err.name === 'CastError') error = handleCastErrorDB(err);
    if (err.code === 11000) error = handleDuplicateFieldsDB(err);
    if (err.name === 'ValidationError') error = handleValidationErrorDB(err);
    if (err.name === 'JsonWebTokenError') error = handleJWTError();
    if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorProd(error, req, res);
  }
};

// 404 Not Found handler
const notFoundHandler = (req, res, next) => {
  const err = new AppError(
    `Cannot find ${req.originalUrl} on this server`,
    404
  );
  next(err);
};

// Async error wrapper to catch errors in async route handlers
const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

module.exports = {
  globalErrorHandler,
  notFoundHandler,
  catchAsync,
};
