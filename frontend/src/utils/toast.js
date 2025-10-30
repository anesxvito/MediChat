import { toast } from 'react-toastify';

/**
 * PROFESSIONAL TOAST NOTIFICATION SYSTEM
 * Centralized toast configurations for consistent UX
 */

// Default toast configuration
const defaultConfig = {
  position: 'top-right',
  autoClose: 5000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
};

// Toast utility functions
export const showToast = {
  // Success notifications
  success: (message, options = {}) => {
    toast.success(message, {
      ...defaultConfig,
      ...options,
      className: 'toast-success',
    });
  },

  // Error notifications
  error: (message, options = {}) => {
    toast.error(message, {
      ...defaultConfig,
      autoClose: 7000, // Errors stay longer
      ...options,
      className: 'toast-error',
    });
  },

  // Warning notifications
  warning: (message, options = {}) => {
    toast.warning(message, {
      ...defaultConfig,
      ...options,
      className: 'toast-warning',
    });
  },

  // Info notifications
  info: (message, options = {}) => {
    toast.info(message, {
      ...defaultConfig,
      ...options,
      className: 'toast-info',
    });
  },

  // Loading notifications with promise
  promise: (promise, messages, options = {}) => {
    return toast.promise(
      promise,
      {
        pending: messages.pending || 'Processing...',
        success: messages.success || 'Success!',
        error: messages.error || 'Something went wrong',
      },
      {
        ...defaultConfig,
        ...options,
      }
    );
  },

  // Custom notifications
  custom: (message, options = {}) => {
    toast(message, {
      ...defaultConfig,
      ...options,
    });
  },
};

// Predefined medical-specific toasts
export const medicalToasts = {
  prescriptionDownloaded: () => {
    showToast.success('Prescription downloaded successfully');
  },

  profileUpdated: () => {
    showToast.success('Profile updated successfully');
  },

  messagesSent: () => {
    showToast.success('Message sent successfully');
  },

  doctorResponseSent: () => {
    showToast.success('Response sent to patient successfully');
  },

  conversationArchived: () => {
    showToast.info('Conversation archived');
  },

  conversationDeleted: () => {
    showToast.info('Conversation deleted');
  },

  loginSuccess: (name) => {
    showToast.success(`Welcome back, ${name}!`);
  },

  registrationSuccess: (name) => {
    showToast.success(`Welcome to MediChat, ${name}!`);
  },

  logoutSuccess: () => {
    showToast.info('Logged out successfully');
  },

  sessionExpired: () => {
    showToast.warning('Your session has expired. Please log in again');
  },

  uploadSuccess: () => {
    showToast.success('File uploaded successfully');
  },

  uploadError: () => {
    showToast.error('Failed to upload file. Please try again');
  },

  networkError: () => {
    showToast.error('Network error. Please check your connection');
  },

  serverError: () => {
    showToast.error('Server error. Please try again later');
  },

  validationError: (message) => {
    showToast.error(message || 'Please check your input and try again');
  },

  accessDenied: () => {
    showToast.error('Access denied. You don\'t have permission for this action');
  },
};

export default showToast;
