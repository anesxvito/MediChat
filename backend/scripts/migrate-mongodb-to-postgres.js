/**
 * MONGODB TO POSTGRESQL MIGRATION SCRIPT
 * Migrates all data from MongoDB to PostgreSQL
 * Run with: npm run migrate:mongo-to-postgres
 */

const mongoose = require('mongoose');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
require('dotenv').config();

const prisma = new PrismaClient();

/**
 * Convert MongoDB ObjectID to PostgreSQL UUID
 * MongoDB ObjectID: 24 hex characters (12 bytes)
 * PostgreSQL UUID: 32 hex characters (16 bytes) with dashes
 */
function mongoIdToUuid(mongoId) {
  const hex = mongoId.toString();
  // Pad the 24-char MongoDB ID to 32 chars by adding zeros
  const paddedHex = hex + '00000000';
  // Format as UUID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
  return `${paddedHex.slice(0,8)}-${paddedHex.slice(8,12)}-${paddedHex.slice(12,16)}-${paddedHex.slice(16,20)}-${paddedHex.slice(20,32)}`;
}

// Import MongoDB Models
const User = require('../models/User');
const Conversation = require('../models/Conversation');
const ActivityLog = require('../models/ActivityLog');

/**
 * Migration Statistics
 */
const stats = {
  users: { total: 0, migrated: 0, errors: 0 },
  patientInfo: { total: 0, migrated: 0, errors: 0 },
  allergies: { total: 0, migrated: 0, errors: 0 },
  medications: { total: 0, migrated: 0, errors: 0 },
  medicalHistory: { total: 0, migrated: 0, errors: 0 },
  conversations: { total: 0, migrated: 0, errors: 0 },
  messages: { total: 0, migrated: 0, errors: 0 },
  symptoms: { total: 0, migrated: 0, errors: 0 },
  attachments: { total: 0, migrated: 0, errors: 0 },
  prescriptions: { total: 0, migrated: 0, errors: 0 },
  activityLogs: { total: 0, migrated: 0, errors: 0 },
};

/**
 * Connect to MongoDB
 */
async function connectMongoDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    process.exit(1);
  }
}

/**
 * Migrate Users
 */
async function migrateUsers() {
  console.log('\n📦 Migrating Users...');

  try {
    const mongoUsers = await User.find();
    stats.users.total = mongoUsers.length;

    for (const mongoUser of mongoUsers) {
      try {
        // Create user in PostgreSQL
        const user = await prisma.user.create({
          data: {
            id: mongoIdToUuid(mongoUser._id),
            email: mongoUser.email,
            passwordHash: mongoUser.password, // Already hashed
            role: mongoUser.role,
            firstName: mongoUser.firstName,
            lastName: mongoUser.lastName,
            phone: mongoUser.phone || null,
            dateOfBirth: mongoUser.dateOfBirth || null,
            specialization: mongoUser.specialization || null,
            licenseNumber: mongoUser.licenseNumber || null,
            isActive: mongoUser.isActive !== false,
            emailVerified: mongoUser.emailVerified || false,
            createdAt: mongoUser.createdAt || new Date(),
            updatedAt: mongoUser.updatedAt || new Date(),
            lastLoginAt: mongoUser.lastLoginAt || null,
          },
        });

        stats.users.migrated++;

        // Migrate patient-specific data
        if (mongoUser.role === 'patient') {
          await migratePatientInfo(mongoUser, user.id);
        }
      } catch (error) {
        console.error(`Error migrating user ${mongoUser.email}:`, error.message);
        stats.users.errors++;
      }
    }

    console.log(`✅ Users: ${stats.users.migrated}/${stats.users.total} migrated`);
  } catch (error) {
    console.error('❌ Error migrating users:', error);
  }
}

/**
 * Migrate Patient Medical Info
 */
async function migratePatientInfo(mongoUser, userId) {
  try {
    // Create patient medical info if patient has additional data
    if (mongoUser.role === 'patient') {
      stats.patientInfo.total++;

      await prisma.patientMedicalInfo.create({
        data: {
          patientId: userId,
          assignedDoctorId: mongoUser.assignedDoctor ? mongoIdToUuid(mongoUser.assignedDoctor) : null,
        },
      });

      stats.patientInfo.migrated++;

      // Migrate allergies
      if (mongoUser.allergies && Array.isArray(mongoUser.allergies)) {
        for (const allergen of mongoUser.allergies) {
          try {
            stats.allergies.total++;
            await prisma.allergy.create({
              data: {
                patientId: userId,
                allergen: allergen,
                allergenType: 'other',
                severity: 'moderate',
                createdAt: new Date(),
                updatedAt: new Date(),
              },
            });
            stats.allergies.migrated++;
          } catch (error) {
            stats.allergies.errors++;
          }
        }
      }

      // Migrate current medications
      if (mongoUser.currentMedications && Array.isArray(mongoUser.currentMedications)) {
        for (const med of mongoUser.currentMedications) {
          try {
            stats.medications.total++;
            await prisma.medication.create({
              data: {
                patientId: userId,
                medicationName: med,
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date(),
              },
            });
            stats.medications.migrated++;
          } catch (error) {
            stats.medications.errors++;
          }
        }
      }

      // Migrate medical history
      if (mongoUser.medicalHistory && Array.isArray(mongoUser.medicalHistory)) {
        for (const history of mongoUser.medicalHistory) {
          try {
            stats.medicalHistory.total++;
            await prisma.medicalHistory.create({
              data: {
                patientId: userId,
                condition: history.condition || 'Unknown',
                diagnosedDate: history.diagnosedDate || null,
                notes: history.notes || null,
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date(),
              },
            });
            stats.medicalHistory.migrated++;
          } catch (error) {
            stats.medicalHistory.errors++;
          }
        }
      }
    }
  } catch (error) {
    console.error(`Error migrating patient info for user ${userId}:`, error.message);
    stats.patientInfo.errors++;
  }
}

/**
 * Migrate Conversations
 */
async function migrateConversations() {
  console.log('\n📦 Migrating Conversations...');

  try {
    const mongoConversations = await Conversation.find();
    stats.conversations.total = mongoConversations.length;

    for (const mongoConv of mongoConversations) {
      try {
        // Create conversation
        const conversation = await prisma.conversation.create({
          data: {
            id: mongoIdToUuid(mongoConv._id),
            patientId: mongoIdToUuid(mongoConv.patient),
            doctorId: mongoConv.doctor ? mongoIdToUuid(mongoConv.doctor) : null,
            visitNumber: mongoConv.visitNumber || 1,
            status: mongoConv.status || 'in_progress',
            aiSummary: mongoConv.aiSummary || null,
            diagnosis: mongoConv.doctorResponse?.diagnosis || null,
            recommendations: mongoConv.doctorResponse?.recommendations || null,
            referrals: mongoConv.doctorResponse?.referrals || null,
            callToOffice: mongoConv.doctorResponse?.callToOffice || false,
            doctorNotes: mongoConv.doctorResponse?.notes || null,
            respondedAt: mongoConv.doctorResponse?.respondedAt || null,
            patientNotified: mongoConv.patientNotified || false,
            archivedByPatient: mongoConv.archivedByPatient || false,
            archivedByDoctor: mongoConv.archivedByDoctor || false,
            conversationEndedAt: mongoConv.conversationEndedAt || null,
            createdAt: mongoConv.createdAt || new Date(),
            updatedAt: mongoConv.updatedAt || new Date(),
          },
        });

        stats.conversations.migrated++;

        // Migrate messages
        if (mongoConv.messages && Array.isArray(mongoConv.messages)) {
          for (const message of mongoConv.messages) {
            try {
              stats.messages.total++;
              await prisma.message.create({
                data: {
                  conversationId: conversation.id,
                  role: message.role || 'user',
                  content: message.content,
                  createdAt: message.timestamp || new Date(),
                },
              });
              stats.messages.migrated++;
            } catch (error) {
              stats.messages.errors++;
            }
          }
        }

        // Migrate symptoms
        if (mongoConv.symptoms && Array.isArray(mongoConv.symptoms)) {
          for (const symptom of mongoConv.symptoms) {
            try {
              stats.symptoms.total++;
              await prisma.symptom.create({
                data: {
                  conversationId: conversation.id,
                  symptom: symptom.symptom || 'Unknown',
                  location: symptom.location || null,
                  severity: symptom.severity || null,
                  duration: symptom.duration || null,
                  notes: symptom.notes || null,
                  createdAt: new Date(),
                },
              });
              stats.symptoms.migrated++;
            } catch (error) {
              stats.symptoms.errors++;
            }
          }
        }

        // Migrate attachments
        if (mongoConv.attachments && Array.isArray(mongoConv.attachments)) {
          for (const attachment of mongoConv.attachments) {
            try {
              stats.attachments.total++;
              await prisma.attachment.create({
                data: {
                  conversationId: conversation.id,
                  filename: attachment.filename,
                  originalName: attachment.originalName,
                  filePath: attachment.path,
                  fileType: attachment.fileType || null,
                  mimeType: attachment.mimeType || null,
                  uploadedAt: attachment.uploadDate || new Date(),
                },
              });
              stats.attachments.migrated++;
            } catch (error) {
              stats.attachments.errors++;
            }
          }
        }

        // Migrate prescriptions
        if (mongoConv.doctorResponse?.prescriptions && Array.isArray(mongoConv.doctorResponse.prescriptions)) {
          for (const rx of mongoConv.doctorResponse.prescriptions) {
            try {
              stats.prescriptions.total++;
              await prisma.prescription.create({
                data: {
                  conversationId: conversation.id,
                  patientId: mongoIdToUuid(mongoConv.patient),
                  doctorId: mongoConv.doctor ? mongoIdToUuid(mongoConv.doctor) : conversation.patientId, // Fallback
                  medicationName: rx.medication || 'Unknown',
                  dosage: rx.dosage || 'As directed',
                  frequency: rx.frequency || 'As directed',
                  duration: rx.duration || 'Until finished',
                  status: 'active',
                  createdAt: mongoConv.doctorResponse.respondedAt || new Date(),
                  updatedAt: mongoConv.doctorResponse.respondedAt || new Date(),
                },
              });
              stats.prescriptions.migrated++;
            } catch (error) {
              stats.prescriptions.errors++;
            }
          }
        }
      } catch (error) {
        console.error(`Error migrating conversation ${mongoConv._id}:`, error.message);
        stats.conversations.errors++;
      }
    }

    console.log(`✅ Conversations: ${stats.conversations.migrated}/${stats.conversations.total} migrated`);
    console.log(`✅ Messages: ${stats.messages.migrated}/${stats.messages.total} migrated`);
    console.log(`✅ Symptoms: ${stats.symptoms.migrated}/${stats.symptoms.total} migrated`);
    console.log(`✅ Attachments: ${stats.attachments.migrated}/${stats.attachments.total} migrated`);
    console.log(`✅ Prescriptions: ${stats.prescriptions.migrated}/${stats.prescriptions.total} migrated`);
  } catch (error) {
    console.error('❌ Error migrating conversations:', error);
  }
}

/**
 * Migrate Activity Logs
 */
async function migrateActivityLogs() {
  console.log('\n📦 Migrating Activity Logs...');

  try {
    const mongoLogs = await ActivityLog.find().limit(10000); // Limit for safety
    stats.activityLogs.total = mongoLogs.length;

    for (const log of mongoLogs) {
      try {
        await prisma.activityLog.create({
          data: {
            id: mongoIdToUuid(log._id),
            userId: log.user ? mongoIdToUuid(log.user) : null,
            userRole: log.userRole || null,
            userEmail: log.userEmail || null,
            action: log.action,
            resourceType: log.resourceType || null,
            resourceId: log.resourceId ? mongoIdToUuid(log.resourceId) : null,
            method: log.method || null,
            endpoint: log.endpoint || null,
            ipAddress: log.ipAddress || '0.0.0.0',
            userAgent: log.userAgent || null,
            status: log.status || 'success',
            statusCode: log.statusCode || null,
            description: log.description || null,
            metadata: log.metadata || null,
            errorMessage: log.error?.message || null,
            errorStack: log.error?.stack || null,
            errorCode: log.error?.code || null,
            durationMs: log.duration || null,
            severity: log.severity || 'info',
            createdAt: log.createdAt || new Date(),
          },
        });

        stats.activityLogs.migrated++;
      } catch (error) {
        stats.activityLogs.errors++;
      }
    }

    console.log(`✅ Activity Logs: ${stats.activityLogs.migrated}/${stats.activityLogs.total} migrated`);
  } catch (error) {
    console.error('❌ Error migrating activity logs:', error);
  }
}

/**
 * Print Migration Summary
 */
function printSummary() {
  console.log('\n' + '='.repeat(60));
  console.log('📊 MIGRATION SUMMARY');
  console.log('='.repeat(60));

  for (const [entity, stat] of Object.entries(stats)) {
    const successRate = stat.total > 0 ? ((stat.migrated / stat.total) * 100).toFixed(1) : 0;
    console.log(`\n${entity.toUpperCase()}:`);
    console.log(`  Total: ${stat.total}`);
    console.log(`  Migrated: ${stat.migrated} (${successRate}%)`);
    console.log(`  Errors: ${stat.errors}`);
  }

  console.log('\n' + '='.repeat(60));

  const totalRecords = Object.values(stats).reduce((sum, stat) => sum + stat.total, 0);
  const totalMigrated = Object.values(stats).reduce((sum, stat) => sum + stat.migrated, 0);
  const totalErrors = Object.values(stats).reduce((sum, stat) => sum + stat.errors, 0);
  const overallSuccess = totalRecords > 0 ? ((totalMigrated / totalRecords) * 100).toFixed(1) : 0;

  console.log(`\n🎯 OVERALL RESULTS:`);
  console.log(`  Total Records: ${totalRecords}`);
  console.log(`  Successfully Migrated: ${totalMigrated} (${overallSuccess}%)`);
  console.log(`  Errors: ${totalErrors}`);
  console.log('\n' + '='.repeat(60) + '\n');
}

/**
 * Main Migration Function
 */
async function main() {
  console.log('\n🚀 Starting MongoDB to PostgreSQL Migration...\n');

  try {
    // Connect to databases
    await connectMongoDB();
    await prisma.$connect();
    console.log('✅ Connected to PostgreSQL');

    // Run migrations in order
    await migrateUsers(); // Must be first (other entities reference users)
    await migrateConversations(); // Includes messages, symptoms, attachments, prescriptions
    await migrateActivityLogs();

    // Print summary
    printSummary();

    console.log('✅ Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    // Disconnect from databases
    await mongoose.disconnect();
    await prisma.$disconnect();
    console.log('\n👋 Disconnected from databases');
  }
}

// Run migration
main();
