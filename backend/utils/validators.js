const Joi = require('joi');
const { ValidationError } = require('./errors');

/**
 * PROFESSIONAL VALIDATION SYSTEM
 * Joi-based validators for all API endpoints
 */

// User validation schemas
const userSchemas = {
  register: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required',
    }),
    password: Joi.string().min(6).required().messages({
      'string.min': 'Password must be at least 6 characters long',
      'any.required': 'Password is required',
    }),
    role: Joi.string().valid('patient', 'doctor').required().messages({
      'any.only': 'Role must be either patient or doctor',
      'any.required': 'Role is required',
    }),
    firstName: Joi.string().trim().min(1).required().messages({
      'string.empty': 'First name is required',
      'any.required': 'First name is required',
    }),
    lastName: Joi.string().trim().min(1).required().messages({
      'string.empty': 'Last name is required',
      'any.required': 'Last name is required',
    }),
    phone: Joi.string().pattern(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/).allow('').messages({
      'string.pattern.base': 'Please provide a valid phone number',
    }),
    dateOfBirth: Joi.date().max('now').allow('').messages({
      'date.max': 'Date of birth cannot be in the future',
    }),
    specialization: Joi.string().when('role', {
      is: 'doctor',
      then: Joi.required(),
      otherwise: Joi.forbidden(),
    }).messages({
      'any.required': 'Specialization is required for doctors',
    }),
    licenseNumber: Joi.string().when('role', {
      is: 'doctor',
      then: Joi.required(),
      otherwise: Joi.forbidden(),
    }).messages({
      'any.required': 'License number is required for doctors',
    }),
  }),

  login: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required',
    }),
    password: Joi.string().required().messages({
      'any.required': 'Password is required',
    }),
  }),

  updateProfile: Joi.object({
    phone: Joi.string().pattern(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/).allow('').messages({
      'string.pattern.base': 'Please provide a valid phone number',
    }),
    dateOfBirth: Joi.date().max('now').allow('').messages({
      'date.max': 'Date of birth cannot be in the future',
    }),
    allergies: Joi.array().items(Joi.string()).messages({
      'array.base': 'Allergies must be an array of strings',
    }),
    currentMedications: Joi.array().items(Joi.string()).messages({
      'array.base': 'Current medications must be an array of strings',
    }),
  }),
};

// Conversation validation schemas
const conversationSchemas = {
  chat: Joi.object({
    message: Joi.string().trim().min(1).max(5000).required().messages({
      'string.empty': 'Message cannot be empty',
      'string.max': 'Message is too long (maximum 5000 characters)',
      'any.required': 'Message is required',
    }),
    conversationId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).allow('').messages({
      'string.pattern.base': 'Invalid conversation ID format',
    }),
  }),

  doctorResponse: Joi.object({
    diagnosis: Joi.string().trim().min(1).max(5000).required().messages({
      'string.empty': 'Diagnosis is required',
      'string.max': 'Diagnosis is too long (maximum 5000 characters)',
      'any.required': 'Diagnosis is required',
    }),
    recommendations: Joi.string().trim().min(1).max(5000).required().messages({
      'string.empty': 'Recommendations are required',
      'string.max': 'Recommendations are too long (maximum 5000 characters)',
      'any.required': 'Recommendations are required',
    }),
    prescriptions: Joi.array().items(
      Joi.object({
        medication: Joi.string().trim().required().messages({
          'any.required': 'Medication name is required',
        }),
        dosage: Joi.string().trim().allow(''),
        frequency: Joi.string().trim().allow(''),
        duration: Joi.string().trim().allow(''),
      })
    ).messages({
      'array.base': 'Prescriptions must be an array',
    }),
    referrals: Joi.string().trim().max(10000).allow('').messages({
      'string.max': 'Referrals text is too long (maximum 10000 characters)',
    }),
    callToOffice: Joi.boolean(),
    notes: Joi.string().trim().max(5000).allow('').messages({
      'string.max': 'Notes are too long (maximum 5000 characters)',
    }),
  }),
};

// Admin validation schemas
const adminSchemas = {
  createUser: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    role: Joi.string().valid('patient', 'doctor', 'admin').required(),
    firstName: Joi.string().trim().min(1).required(),
    lastName: Joi.string().trim().min(1).required(),
    specialization: Joi.string().when('role', {
      is: 'doctor',
      then: Joi.required(),
    }),
    licenseNumber: Joi.string().when('role', {
      is: 'doctor',
      then: Joi.required(),
    }),
  }),

  updateUser: Joi.object({
    email: Joi.string().email(),
    role: Joi.string().valid('patient', 'doctor', 'admin'),
    firstName: Joi.string().trim().min(1),
    lastName: Joi.string().trim().min(1),
    specialization: Joi.string(),
    licenseNumber: Joi.string(),
    isActive: Joi.boolean(),
  }),
};

// Validation middleware factory
const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));

      return next(new ValidationError(JSON.stringify(errors)));
    }

    req.validatedBody = value;
    next();
  };
};

module.exports = {
  validate,
  userSchemas,
  conversationSchemas,
  adminSchemas,
};
