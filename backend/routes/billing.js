const express = require('express');
const router = express.Router();
const { auth, requireRole } = require('../middleware/auth');
const { catchAsync } = require('../middleware/errorHandler');
const { NotFoundError, BadRequestError } = require('../utils/errors');
const { prisma } = require('../config/database');
const logger = require('../utils/logger');

/**
 * BILLING ROUTES
 * Manage patient billing, invoices, and payment methods
 */

/**
 * @route   GET /api/billing/invoices
 * @desc    Get all invoices for logged-in patient
 * @access  Private (Patient)
 */
router.get(
  '/invoices',
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

    const invoices = await prisma.invoice.findMany({
      where,
      orderBy: {
        issuedAt: 'desc',
      },
    });

    // Calculate summary statistics
    const totalDue = invoices
      .filter(inv => inv.status === 'pending' || inv.status === 'overdue')
      .reduce((sum, inv) => sum + Number(inv.patientBalance), 0);

    const totalPaidThisYear = invoices
      .filter(inv => {
        const thisYear = new Date().getFullYear();
        return inv.paidDate && inv.paidDate.getFullYear() === thisYear;
      })
      .reduce((sum, inv) => sum + Number(inv.paidAmount), 0);

    logger.info('Invoices retrieved', {
      userId: req.user.id,
      count: invoices.length
    });

    res.status(200).json({
      status: 'success',
      results: invoices.length,
      summary: {
        totalDue,
        totalPaidThisYear,
      },
      invoices,
    });
  })
);

/**
 * @route   GET /api/billing/invoices/:id
 * @desc    Get invoice by ID
 * @access  Private (Patient)
 */
router.get(
  '/invoices/:id',
  auth,
  requireRole('patient'),
  catchAsync(async (req, res) => {
    const invoice = await prisma.invoice.findUnique({
      where: { id: req.params.id },
    });

    if (!invoice) {
      throw new NotFoundError('Invoice not found');
    }

    // Check authorization
    if (invoice.patientId !== req.user.id) {
      throw new BadRequestError('Not authorized to view this invoice');
    }

    res.status(200).json({
      status: 'success',
      invoice,
    });
  })
);

/**
 * @route   POST /api/billing/invoices
 * @desc    Create a new invoice (Admin only)
 * @access  Private (Admin)
 */
router.post(
  '/invoices',
  auth,
  requireRole('admin'),
  catchAsync(async (req, res) => {
    const {
      patientId,
      invoiceNumber,
      description,
      totalAmount,
      insuranceCovered,
      serviceDate,
      serviceType,
      dueDate,
    } = req.body;

    // Validate required fields
    if (!patientId || !invoiceNumber || !description || !totalAmount || !serviceDate || !dueDate) {
      throw new BadRequestError('Required fields: patientId, invoiceNumber, description, totalAmount, serviceDate, dueDate');
    }

    // Verify patient exists
    const patient = await prisma.user.findUnique({
      where: { id: patientId },
    });

    if (!patient || patient.role !== 'patient') {
      throw new NotFoundError('Patient not found');
    }

    // Calculate patient balance
    const totalAmountDecimal = parseFloat(totalAmount);
    const insuranceCoveredDecimal = insuranceCovered ? parseFloat(insuranceCovered) : 0;
    const patientBalance = totalAmountDecimal - insuranceCoveredDecimal;

    const invoice = await prisma.invoice.create({
      data: {
        patientId,
        invoiceNumber,
        description,
        totalAmount: totalAmountDecimal,
        insuranceCovered: insuranceCoveredDecimal,
        patientBalance,
        serviceDate: new Date(serviceDate),
        serviceType,
        dueDate: new Date(dueDate),
        status: 'pending',
      },
    });

    logger.info('Invoice created', {
      invoiceId: invoice.id,
      patientId,
      amount: totalAmount
    });

    res.status(201).json({
      status: 'success',
      message: 'Invoice created successfully',
      invoice,
    });
  })
);

/**
 * @route   POST /api/billing/invoices/:id/pay
 * @desc    Pay an invoice
 * @access  Private (Patient)
 */
router.post(
  '/invoices/:id/pay',
  auth,
  requireRole('patient'),
  catchAsync(async (req, res) => {
    const { paymentMethodId, amount } = req.body;

    const invoice = await prisma.invoice.findUnique({
      where: { id: req.params.id },
    });

    if (!invoice) {
      throw new NotFoundError('Invoice not found');
    }

    // Check authorization
    if (invoice.patientId !== req.user.id) {
      throw new BadRequestError('Not authorized to pay this invoice');
    }

    if (invoice.status === 'paid') {
      throw new BadRequestError('Invoice already paid');
    }

    // Verify payment method belongs to patient
    if (paymentMethodId) {
      const paymentMethod = await prisma.paymentMethod.findUnique({
        where: { id: paymentMethodId },
      });

      if (!paymentMethod || paymentMethod.patientId !== req.user.id) {
        throw new BadRequestError('Invalid payment method');
      }
    }

    const paymentAmount = amount ? parseFloat(amount) : Number(invoice.patientBalance);
    const newPaidAmount = Number(invoice.paidAmount) + paymentAmount;
    const newBalance = Number(invoice.totalAmount) - Number(invoice.insuranceCovered || 0) - newPaidAmount;

    let newStatus = invoice.status;
    if (newBalance <= 0) {
      newStatus = 'paid';
    } else if (newPaidAmount > 0) {
      newStatus = 'partially_paid';
    }

    const updatedInvoice = await prisma.invoice.update({
      where: { id: req.params.id },
      data: {
        paidAmount: newPaidAmount,
        patientBalance: newBalance,
        status: newStatus,
        paidDate: newStatus === 'paid' ? new Date() : undefined,
        paymentMethodId,
      },
    });

    logger.info('Invoice payment processed', {
      invoiceId: req.params.id,
      patientId: req.user.id,
      amount: paymentAmount,
      newStatus
    });

    res.status(200).json({
      status: 'success',
      message: 'Payment processed successfully',
      invoice: updatedInvoice,
    });
  })
);

/**
 * @route   GET /api/billing/payment-methods
 * @desc    Get all payment methods for logged-in patient
 * @access  Private (Patient)
 */
router.get(
  '/payment-methods',
  auth,
  requireRole('patient'),
  catchAsync(async (req, res) => {
    const paymentMethods = await prisma.paymentMethod.findMany({
      where: {
        patientId: req.user.id,
        isActive: true,
      },
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    res.status(200).json(paymentMethods);
  })
);

/**
 * @route   POST /api/billing/payment-methods
 * @desc    Add a new payment method
 * @access  Private (Patient)
 */
router.post(
  '/payment-methods',
  auth,
  requireRole('patient'),
  catchAsync(async (req, res) => {
    const {
      type,
      cardLast4,
      cardBrand,
      cardExpMonth,
      cardExpYear,
      cardHolderName,
      billingAddress,
      billingZip,
      isDefault,
    } = req.body;

    // Validate required fields
    if (!type) {
      throw new BadRequestError('Payment method type is required');
    }

    // If this is the default, unset other defaults
    if (isDefault) {
      await prisma.paymentMethod.updateMany({
        where: {
          patientId: req.user.id,
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      });
    }

    const paymentMethod = await prisma.paymentMethod.create({
      data: {
        patientId: req.user.id,
        type,
        cardLast4,
        cardBrand,
        cardExpMonth: cardExpMonth ? parseInt(cardExpMonth) : null,
        cardExpYear: cardExpYear ? parseInt(cardExpYear) : null,
        cardHolderName,
        billingAddress,
        billingZip,
        isDefault: isDefault || false,
      },
    });

    logger.info('Payment method added', {
      paymentMethodId: paymentMethod.id,
      patientId: req.user.id
    });

    res.status(201).json({
      status: 'success',
      message: 'Payment method added successfully',
      paymentMethod,
    });
  })
);

/**
 * @route   DELETE /api/billing/payment-methods/:id
 * @desc    Delete a payment method
 * @access  Private (Patient)
 */
router.delete(
  '/payment-methods/:id',
  auth,
  requireRole('patient'),
  catchAsync(async (req, res) => {
    const paymentMethod = await prisma.paymentMethod.findUnique({
      where: { id: req.params.id },
    });

    if (!paymentMethod) {
      throw new NotFoundError('Payment method not found');
    }

    // Check authorization
    if (paymentMethod.patientId !== req.user.id) {
      throw new BadRequestError('Not authorized to delete this payment method');
    }

    await prisma.paymentMethod.update({
      where: { id: req.params.id },
      data: { isActive: false },
    });

    logger.info('Payment method deleted', {
      paymentMethodId: req.params.id,
      patientId: req.user.id
    });

    res.status(200).json({
      status: 'success',
      message: 'Payment method deleted successfully',
    });
  })
);

module.exports = router;
