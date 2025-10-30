const express = require('express');
const router = express.Router();
const { auth, requireRole } = require('../middleware/auth');
const { catchAsync } = require('../middleware/errorHandler');
const { NotFoundError, BadRequestError } = require('../utils/errors');
const { prisma } = require('../config/database');
const logger = require('../utils/logger');
const upload = require('../config/multer');
const path = require('path');
const fs = require('fs').promises;

/**
 * DOCUMENTS ROUTES
 * Manage patient documents and files
 */

/**
 * @route   GET /api/documents
 * @desc    Get all documents for logged-in patient
 * @access  Private (Patient)
 */
router.get(
  '/',
  auth,
  requireRole('patient'),
  catchAsync(async (req, res) => {
    const { category, search } = req.query;

    const where = {
      patientId: req.user.id,
    };

    if (category) {
      where.category = category;
    }

    if (search) {
      where.OR = [
        {
          title: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          description: {
            contains: search,
            mode: 'insensitive',
          },
        },
      ];
    }

    const documents = await prisma.document.findMany({
      where,
      orderBy: {
        uploadedAt: 'desc',
      },
    });

    logger.info('Documents retrieved', {
      userId: req.user.id,
      count: documents.length
    });

    res.status(200).json(documents);
  })
);

/**
 * @route   GET /api/documents/:id
 * @desc    Get document by ID
 * @access  Private (Patient)
 */
router.get(
  '/:id',
  auth,
  requireRole('patient'),
  catchAsync(async (req, res) => {
    const document = await prisma.document.findUnique({
      where: { id: req.params.id },
    });

    if (!document) {
      throw new NotFoundError('Document not found');
    }

    // Check authorization
    if (document.patientId !== req.user.id) {
      throw new BadRequestError('Not authorized to view this document');
    }

    res.status(200).json({
      status: 'success',
      document,
    });
  })
);

/**
 * @route   GET /api/documents/:id/download
 * @desc    Download document file
 * @access  Private (Patient)
 */
router.get(
  '/:id/download',
  auth,
  requireRole('patient'),
  catchAsync(async (req, res) => {
    const document = await prisma.document.findUnique({
      where: { id: req.params.id },
    });

    if (!document) {
      throw new NotFoundError('Document not found');
    }

    // Check authorization
    if (document.patientId !== req.user.id) {
      throw new BadRequestError('Not authorized to download this document');
    }

    // Send file
    const filePath = path.join(__dirname, '..', document.filePath);

    try {
      await fs.access(filePath);
      res.download(filePath, document.fileName);
    } catch (error) {
      throw new NotFoundError('File not found on server');
    }
  })
);

/**
 * @route   POST /api/documents
 * @desc    Upload a new document
 * @access  Private (Patient)
 */
router.post(
  '/',
  auth,
  requireRole('patient'),
  upload.single('file'),
  catchAsync(async (req, res) => {
    if (!req.file) {
      throw new BadRequestError('No file uploaded');
    }

    const { title, description, category, relatedTo } = req.body;

    if (!title || !category) {
      throw new BadRequestError('Title and category are required');
    }

    const document = await prisma.document.create({
      data: {
        patientId: req.user.id,
        title,
        description,
        category,
        fileName: req.file.originalname,
        filePath: req.file.path,
        fileType: path.extname(req.file.originalname),
        fileSize: BigInt(req.file.size),
        mimeType: req.file.mimetype,
        uploadedBy: req.user.id,
        relatedTo,
      },
    });

    logger.info('Document uploaded', {
      documentId: document.id,
      patientId: req.user.id,
      fileName: req.file.originalname
    });

    res.status(201).json({
      status: 'success',
      message: 'Document uploaded successfully',
      document,
    });
  })
);

/**
 * @route   DELETE /api/documents/:id
 * @desc    Delete document
 * @access  Private (Patient)
 */
router.delete(
  '/:id',
  auth,
  requireRole('patient'),
  catchAsync(async (req, res) => {
    const document = await prisma.document.findUnique({
      where: { id: req.params.id },
    });

    if (!document) {
      throw new NotFoundError('Document not found');
    }

    // Check authorization
    if (document.patientId !== req.user.id) {
      throw new BadRequestError('Not authorized to delete this document');
    }

    // Delete file from filesystem
    try {
      const filePath = path.join(__dirname, '..', document.filePath);
      await fs.unlink(filePath);
    } catch (error) {
      logger.warn('Failed to delete file from filesystem', {
        documentId: req.params.id,
        error: error.message
      });
    }

    // Delete from database
    await prisma.document.delete({
      where: { id: req.params.id },
    });

    logger.info('Document deleted', {
      documentId: req.params.id,
      patientId: req.user.id
    });

    res.status(200).json({
      status: 'success',
      message: 'Document deleted successfully',
    });
  })
);

module.exports = router;
