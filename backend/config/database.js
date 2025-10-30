/**
 * DATABASE CONNECTION - PostgreSQL with Prisma
 * Hospital-Grade Database Configuration
 */

const { PrismaClient } = require('@prisma/client');
const logger = require('../utils/logger');

// Prisma Client Singleton Pattern
let prisma;

/**
 * Get Prisma Client Instance (Singleton)
 * Ensures only one instance exists throughout the application lifecycle
 */
const getPrismaClient = () => {
  if (!prisma) {
    prisma = new PrismaClient({
      log: [
        {
          emit: 'event',
          level: 'query',
        },
        {
          emit: 'event',
          level: 'error',
        },
        {
          emit: 'event',
          level: 'warn',
        },
      ],
      errorFormat: 'pretty',
    });

    // Log all queries in development
    if (process.env.NODE_ENV === 'development') {
      prisma.$on('query', (e) => {
        logger.debug('Query: ' + e.query);
        logger.debug('Duration: ' + e.duration + 'ms');
      });
    }

    // Log errors
    prisma.$on('error', (e) => {
      logger.error('Prisma Error:', e);
    });

    // Log warnings
    prisma.$on('warn', (e) => {
      logger.warn('Prisma Warning:', e);
    });

    logger.info('Prisma Client initialized');
  }

  return prisma;
};

/**
 * Connect to PostgreSQL Database
 */
const connectDatabase = async () => {
  try {
    const client = getPrismaClient();

    // Test the connection
    await client.$connect();

    logger.info('✅ PostgreSQL connected successfully via Prisma');

    // Log database info
    const result = await client.$queryRaw`SELECT version()`;
    logger.info(`PostgreSQL Version: ${result[0].version}`);

    return client;
  } catch (error) {
    logger.error('❌ PostgreSQL connection failed:', error);
    process.exit(1);
  }
};

/**
 * Disconnect from database (for graceful shutdown)
 */
const disconnectDatabase = async () => {
  try {
    if (prisma) {
      await prisma.$disconnect();
      logger.info('PostgreSQL disconnected');
    }
  } catch (error) {
    logger.error('Error disconnecting from PostgreSQL:', error);
  }
};

/**
 * Health Check - Test database connectivity
 */
const healthCheck = async () => {
  try {
    const client = getPrismaClient();
    await client.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    logger.error('Database health check failed:', error);
    return false;
  }
};

/**
 * Transaction Helper
 * Usage: await runTransaction(async (tx) => { ... })
 */
const runTransaction = async (callback) => {
  const client = getPrismaClient();
  return await client.$transaction(callback);
};

module.exports = {
  getPrismaClient,
  connectDatabase,
  disconnectDatabase,
  healthCheck,
  runTransaction,
  // Export prisma instance directly for convenience
  get prisma() {
    return getPrismaClient();
  },
};
