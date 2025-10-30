const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');

// Load environment variables
dotenv.config();

// Import professional utilities
const logger = require('./utils/logger');
const { connectDatabase } = require('./config/database');
const { globalErrorHandler, notFoundHandler } = require('./middleware/errorHandler');
const {
  helmetConfig,
  apiLimiter,
  corsOptions,
  preventParameterPollution,
  securityHeaders,
  requestSizeLimiter,
} = require('./middleware/security');
const { sanitizeRequestBody } = require('./middleware/noSqlSanitizer');

/**
 * ================================================================
 * MEDICHAT PROFESSIONAL BACKEND SERVER
 * World-class medical platform with comprehensive security,
 * logging, error handling, and validation
 * ================================================================
 */

const app = express();

// ================================================================
// TRUST PROXY (for Railway, Heroku, etc.)
// ================================================================
app.set('trust proxy', 1);

// ================================================================
// SECURITY MIDDLEWARE
// ================================================================

// Helmet - Security headers
app.use(helmetConfig);

// Custom security headers
app.use(securityHeaders);

// CORS configuration
app.use(cors(corsOptions));

// Request size limiting (DOS protection)
app.use(requestSizeLimiter);

// MongoDB NoSQL injection protection
// ✅ ENABLED: Custom sanitizer compatible with Express 5.x
// Removes dangerous MongoDB operators ($ne, $gt, etc.) from req.body
app.use(sanitizeRequestBody);

// Parameter pollution prevention
app.use(preventParameterPollution);

// ================================================================
// GENERAL MIDDLEWARE
// ================================================================

// Body parsing
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// HTTP request logging
app.use(logger.http);

// ================================================================
// API ROUTES
// ================================================================

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'MediChat API is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
  });
});

// API version and info
app.get('/api', (req, res) => {
  res.status(200).json({
    name: 'MediChat API',
    version: '1.0.0',
    description: 'Professional Medical Consultation Platform',
    endpoints: {
      auth: '/api/auth',
      patients: '/api/patients',
      doctors: '/api/doctors',
      chatbot: '/api/chatbot',
      admin: '/api/admin',
      appointments: '/api/appointments',
      labResults: '/api/lab-results',
      vitalSigns: '/api/vital-signs',
      carePlans: '/api/care-plans',
      documents: '/api/documents',
      billing: '/api/billing',
      messages: '/api/messages',
    },
  });
});

// Apply rate limiting to all API routes
app.use('/api', apiLimiter);

// Mount route handlers
app.use('/api/auth', require('./routes/auth'));
app.use('/api/patients', require('./routes/patients'));
app.use('/api/doctors', require('./routes/doctors'));
app.use('/api/chatbot', require('./routes/chatbot'));
app.use('/api/admin', require('./routes/admin'));

// EMR Feature Routes
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/lab-results', require('./routes/labResults'));
app.use('/api/vital-signs', require('./routes/vitalSigns'));
app.use('/api/care-plans', require('./routes/carePlans'));
app.use('/api/documents', require('./routes/documents'));
app.use('/api/billing', require('./routes/billing'));
app.use('/api/messages', require('./routes/messages'));

// Serve uploaded files
app.use('/api/uploads', express.static(path.join(__dirname, 'uploads')));

// ================================================================
// DATABASE CONNECTION
// ================================================================

// Connect to PostgreSQL via Prisma
connectDatabase()
  .then(() => {
    logger.info('✓ PostgreSQL connected successfully');
  })
  .catch((err) => {
    logger.error('✗ PostgreSQL connection error:', err);
    process.exit(1);
  });

// ================================================================
// ERROR HANDLING
// ================================================================

// 404 Not Found handler
app.use(notFoundHandler);

// Global error handler
app.use(globalErrorHandler);

// ================================================================
// START SERVER & SOCKET.IO
// ================================================================

const PORT = process.env.PORT || 5000;

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO with CORS
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  logger.info(`Socket connected: ${socket.id}`);

  // Join user-specific room for targeted notifications
  socket.on('join', (userId) => {
    socket.join(`user:${userId}`);
    logger.info(`User ${userId} joined their notification room`);
  });

  socket.on('disconnect', () => {
    logger.info(`Socket disconnected: ${socket.id}`);
  });
});

// Make io accessible to routes
app.set('io', io);

server.listen(PORT, () => {
  logger.info('='.repeat(60));
  logger.info(`🏥 MediChat Professional Backend Server`);
  logger.info('='.repeat(60));
  logger.info(`✓ Server running on port ${PORT}`);
  logger.info(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`✓ API Base URL: http://localhost:${PORT}/api`);
  logger.info(`✓ Health Check: http://localhost:${PORT}/health`);
  logger.info(`✓ Socket.IO enabled for real-time notifications`);
  logger.info('='.repeat(60));
});

// ================================================================
// GRACEFUL SHUTDOWN
// ================================================================

const gracefulShutdown = async (signal) => {
  logger.info(`${signal} received. Starting graceful shutdown...`);

  // Close Socket.IO connections
  io.close(() => {
    logger.info('Socket.IO connections closed');
  });

  server.close(async () => {
    logger.info('HTTP server closed');

    // Close PostgreSQL
    const { disconnectDatabase } = require('./config/database');
    await disconnectDatabase();
    logger.info('PostgreSQL connection closed');

    process.exit(0);
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! 💥');
  console.error('Error:', err);
  console.error('Stack:', err.stack);
  logger.error('UNCAUGHT EXCEPTION! 💥 Shutting down...', {
    error: err.message,
    stack: err.stack,
  });
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('UNHANDLED REJECTION! 💥 Shutting down...', {
    error: err.message,
    stack: err.stack,
  });
  process.exit(1);
});

module.exports = app;
