const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['patient', 'doctor', 'admin'],
    required: true
  },
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  phone: {
    type: String
  },
  dateOfBirth: {
    type: Date
  },
  profilePhoto: {
    type: String,
    default: null
  },
  // Doctor-specific fields
  specialization: {
    type: String,
    required: function() { return this.role === 'doctor'; }
  },
  licenseNumber: {
    type: String,
    required: function() { return this.role === 'doctor'; }
  },
  // Patient-specific fields - Personal Information
  gender: {
    type: String,
    enum: ['male', 'female', 'other', 'prefer-not-to-say', '']
  },
  bloodType: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', '']
  },
  height: String,
  weight: String,
  assignedDoctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  // Medical History
  medicalHistory: [{
    condition: String,
    diagnosedDate: Date,
    notes: String
  }],
  allergies: [String],
  currentMedications: mongoose.Schema.Types.Mixed,  // Can be string or object
  chronicConditions: [String],
  surgicalHistory: [{
    procedure: String,
    date: String,
    notes: String
  }],
  familyHistory: [{
    condition: String,
    relation: String
  }],
  immunizations: [{
    vaccine: String,
    date: String
  }],

  // Emergency Contacts
  emergencyContacts: [{
    name: String,
    relationship: String,
    phone: String,
    email: String
  }],

  // Insurance Information
  insuranceProvider: String,
  insurancePolicyNumber: String,
  insuranceGroupNumber: String,

  // Healthcare Providers & Preferences
  primaryPhysician: String,
  pharmacyName: String,
  pharmacyPhone: String,
  preferredLanguage: {
    type: String,
    default: 'English'
  },

  // Lifestyle Factors
  smokingStatus: {
    type: String,
    enum: ['never', 'former', 'current', '']
  },
  alcoholConsumption: {
    type: String,
    enum: ['none', 'occasional', 'moderate', 'regular', '']
  },
  exerciseFrequency: {
    type: String,
    enum: ['none', '1-2', '3-4', '5+', 'daily', '']
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON responses
userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
