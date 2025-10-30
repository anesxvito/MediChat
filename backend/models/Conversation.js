const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'assistant', 'system'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const conversationSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  visitNumber: {
    type: Number,
    required: true,
    default: 1
  },
  messages: [messageSchema],

  // AI-generated summary of the conversation
  aiSummary: {
    type: String,
    default: ''
  },

  // Extracted medical information
  symptoms: [{
    symptom: String,
    location: String,
    severity: String,
    duration: String,
    notes: String
  }],

  // Uploaded files
  attachments: [{
    filename: String,
    originalName: String,
    path: String,
    fileType: String,
    uploadDate: {
      type: Date,
      default: Date.now
    }
  }],

  // Doctor's response
  doctorResponse: {
    diagnosis: String,
    recommendations: String,
    prescriptions: [{
      medication: String,
      dosage: String,
      frequency: String,
      duration: String
    }],
    referrals: String,
    callToOffice: Boolean,
    notes: String,
    respondedAt: Date
  },

  // Status tracking
  status: {
    type: String,
    enum: ['in_progress', 'awaiting_doctor', 'doctor_responded', 'closed'],
    default: 'in_progress'
  },

  // Patient notification status
  patientNotified: {
    type: Boolean,
    default: false
  },

  // Archive status
  archivedByPatient: {
    type: Boolean,
    default: false
  },
  archivedByDoctor: {
    type: Boolean,
    default: false
  },

  conversationEndedAt: Date

}, {
  timestamps: true
});

// Index for faster queries
conversationSchema.index({ patient: 1, createdAt: -1 });
conversationSchema.index({ doctor: 1, status: 1 });

module.exports = mongoose.model('Conversation', conversationSchema);
