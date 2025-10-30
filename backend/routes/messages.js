const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { catchAsync } = require('../middleware/errorHandler');
const { NotFoundError, BadRequestError } = require('../utils/errors');
const { prisma } = require('../config/database');
const logger = require('../utils/logger');

/**
 * DIRECT MESSAGES ROUTES
 * Manage direct messaging between patients and doctors
 */

/**
 * @route   GET /api/messages
 * @desc    Get all message threads for logged-in user
 * @access  Private
 */
router.get(
  '/',
  auth,
  catchAsync(async (req, res) => {
    const userId = req.user.id;

    // Get unique conversations (threads)
    const sentMessages = await prisma.directMessage.findMany({
      where: { senderId: userId },
      distinct: ['receiverId'],
      include: {
        receiver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
            specialization: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const receivedMessages = await prisma.directMessage.findMany({
      where: { receiverId: userId },
      distinct: ['senderId'],
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
            specialization: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Combine and deduplicate conversations
    const conversationsMap = new Map();

    sentMessages.forEach(msg => {
      const otherId = msg.receiverId;
      if (!conversationsMap.has(otherId)) {
        conversationsMap.set(otherId, {
          user: msg.receiver,
          lastMessage: msg,
        });
      }
    });

    receivedMessages.forEach(msg => {
      const otherId = msg.senderId;
      if (!conversationsMap.has(otherId)) {
        conversationsMap.set(otherId, {
          user: msg.sender,
          lastMessage: msg,
        });
      } else {
        const existing = conversationsMap.get(otherId);
        if (new Date(msg.createdAt) > new Date(existing.lastMessage.createdAt)) {
          existing.lastMessage = msg;
        }
      }
    });

    // Get unread count for each conversation
    const conversations = await Promise.all(
      Array.from(conversationsMap.entries()).map(async ([otherId, data]) => {
        const unreadCount = await prisma.directMessage.count({
          where: {
            senderId: otherId,
            receiverId: userId,
            status: { not: 'read' },
          },
        });

        return {
          id: data.lastMessage.id,
          currentUserId: userId,
          otherUser: {
            id: otherId,
            firstName: data.user.firstName,
            lastName: data.user.lastName,
            specialization: data.user.specialization,
          },
          lastMessage: {
            content: data.lastMessage.content,
            sentAt: data.lastMessage.createdAt,
          },
          subject: data.lastMessage.subject,
          unreadCount,
        };
      })
    );

    // Sort by last message time
    conversations.sort((a, b) =>
      new Date(b.lastMessage.sentAt) - new Date(a.lastMessage.sentAt)
    );

    logger.info('Message conversations retrieved', {
      userId,
      count: conversations.length
    });

    res.status(200).json(conversations);
  })
);

/**
 * @route   GET /api/messages/conversation/:userId
 * @desc    Get all messages in a conversation with a specific user
 * @access  Private
 */
router.get(
  '/conversation/:userId',
  auth,
  catchAsync(async (req, res) => {
    const currentUserId = req.user.id;
    const otherUserId = req.params.userId;

    const messages = await prisma.directMessage.findMany({
      where: {
        OR: [
          { senderId: currentUserId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: currentUserId },
        ],
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
        receiver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Mark all received messages as read
    await prisma.directMessage.updateMany({
      where: {
        senderId: otherUserId,
        receiverId: currentUserId,
        status: { not: 'read' },
      },
      data: {
        status: 'read',
        readAt: new Date(),
      },
    });

    // Format messages for frontend
    const formattedMessages = messages.map(msg => ({
      id: msg.id,
      senderId: msg.senderId,
      receiverId: msg.receiverId,
      content: msg.content,
      subject: msg.subject,
      status: msg.status,
      sentAt: msg.createdAt,
      readAt: msg.readAt,
    }));

    logger.info('Conversation messages retrieved', {
      currentUserId,
      otherUserId,
      count: messages.length
    });

    res.status(200).json(formattedMessages);
  })
);

/**
 * @route   POST /api/messages
 * @desc    Send a new message
 * @access  Private
 */
router.post(
  '/',
  auth,
  catchAsync(async (req, res) => {
    const { receiverId, subject, content, threadId } = req.body;

    // Validate required fields
    if (!receiverId || !content) {
      throw new BadRequestError('Receiver and content are required');
    }

    // Verify receiver exists
    const receiver = await prisma.user.findUnique({
      where: { id: receiverId },
    });

    if (!receiver || !receiver.isActive) {
      throw new NotFoundError('Receiver not found or not active');
    }

    // Verify role compatibility (patients can only message doctors and vice versa)
    if (req.user.role === 'patient' && receiver.role !== 'doctor') {
      throw new BadRequestError('Patients can only message doctors');
    }
    if (req.user.role === 'doctor' && receiver.role !== 'patient') {
      throw new BadRequestError('Doctors can only message patients');
    }

    const message = await prisma.directMessage.create({
      data: {
        senderId: req.user.id,
        receiverId,
        subject,
        content,
        threadId,
        status: 'sent',
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
        receiver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
    });

    logger.info('Message sent', {
      messageId: message.id,
      senderId: req.user.id,
      receiverId
    });

    res.status(201).json({
      id: message.id,
      senderId: message.senderId,
      receiverId: message.receiverId,
      content: message.content,
      subject: message.subject,
      status: message.status,
      sentAt: message.createdAt,
      readAt: message.readAt,
    });
  })
);

/**
 * @route   PATCH /api/messages/:id/read
 * @desc    Mark message as read
 * @access  Private
 */
router.patch(
  '/:id/read',
  auth,
  catchAsync(async (req, res) => {
    const message = await prisma.directMessage.findUnique({
      where: { id: req.params.id },
    });

    if (!message) {
      throw new NotFoundError('Message not found');
    }

    // Check authorization (only receiver can mark as read)
    if (message.receiverId !== req.user.id) {
      throw new BadRequestError('Not authorized to update this message');
    }

    const updatedMessage = await prisma.directMessage.update({
      where: { id: req.params.id },
      data: {
        status: 'read',
        readAt: new Date(),
      },
    });

    res.status(200).json({
      status: 'success',
      message: 'Message marked as read',
      data: updatedMessage,
    });
  })
);

/**
 * @route   GET /api/messages/unread/count
 * @desc    Get unread message count
 * @access  Private
 */
router.get(
  '/unread/count',
  auth,
  catchAsync(async (req, res) => {
    const count = await prisma.directMessage.count({
      where: {
        receiverId: req.user.id,
        status: { not: 'read' },
      },
    });

    res.status(200).json({
      status: 'success',
      count,
    });
  })
);

module.exports = router;
