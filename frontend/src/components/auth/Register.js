import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Activity, Mail, Lock, User, Phone, Calendar, Briefcase, FileText, ArrowRight, AlertCircle, Camera, Upload } from 'lucide-react';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'patient',
    firstName: '',
    lastName: '',
    phone: '',
    dateOfBirth: '',
    specialization: '',
    licenseNumber: '',
  });
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        setError('Please upload a valid image file (JPEG, PNG, or WebP)');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
        return;
      }

      setProfilePhoto(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Create FormData to handle file upload
    const submitData = new FormData();
    Object.keys(formData).forEach(key => {
      if (formData[key]) {
        submitData.append(key, formData[key]);
      }
    });

    // Add profile photo if selected
    if (profilePhoto) {
      submitData.append('profilePhoto', profilePhoto);
    }

    const result = await register(submitData);

    if (result.success) {
      if (formData.role === 'doctor') {
        navigate('/doctor/dashboard');
      } else {
        navigate('/patient/dashboard');
      }
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 py-12"
      style={{
        background: 'linear-gradient(135deg, #EBF5FF 0%, #F9FAFB 100%)',
      }}
    >
      {/* Background Pattern */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `
            radial-gradient(circle at 20% 50%, rgba(21, 112, 239, 0.05) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(46, 144, 250, 0.05) 0%, transparent 50%)
          `,
          pointerEvents: 'none',
        }}
      />

      <div className="w-full max-w-4xl relative animate-fadeIn">
        {/* Logo and Brand */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center mb-6"
            style={{
              width: '80px',
              height: '80px',
              background: 'linear-gradient(135deg, var(--primary-600) 0%, var(--primary-700) 100%)',
              borderRadius: 'var(--radius-2xl)',
              boxShadow: 'var(--shadow-xl)',
            }}
          >
            <Activity style={{ width: '44px', height: '44px', color: 'white', strokeWidth: 2.5 }} />
          </div>
          <h1 className="display-lg" style={{ color: 'var(--gray-900)', marginBottom: 'var(--space-2)' }}>
            Join MediChat
          </h1>
          <p className="text-md text-secondary">
            Create your account to get started with professional medical care
          </p>
        </div>

        {/* Registration Card */}
        <div className="card">
          <div className="card-body" style={{ padding: 'var(--space-8)' }}>
            {error && (
              <div className="alert alert-error mb-6">
                <AlertCircle style={{ width: '20px', height: '20px', flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              {/* Role Selection */}
              <div>
                <label className="form-label form-label-required">I am a</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: 'patient' })}
                    className={`flex items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all ${
                      formData.role === 'patient'
                        ? 'border-primary-600 bg-primary-50'
                        : 'border-gray-300 bg-white hover:border-gray-400'
                    }`}
                    style={{
                      borderColor: formData.role === 'patient' ? 'var(--primary-600)' : 'var(--gray-300)',
                      backgroundColor: formData.role === 'patient' ? 'var(--primary-50)' : 'white',
                    }}
                  >
                    <User style={{ width: '24px', height: '24px', color: formData.role === 'patient' ? 'var(--primary-600)' : 'var(--gray-600)' }} />
                    <span className="font-semibold" style={{ color: formData.role === 'patient' ? 'var(--primary-700)' : 'var(--gray-700)' }}>
                      Patient
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: 'doctor' })}
                    className={`flex items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all ${
                      formData.role === 'doctor'
                        ? 'border-primary-600 bg-primary-50'
                        : 'border-gray-300 bg-white hover:border-gray-400'
                    }`}
                    style={{
                      borderColor: formData.role === 'doctor' ? 'var(--primary-600)' : 'var(--gray-300)',
                      backgroundColor: formData.role === 'doctor' ? 'var(--primary-50)' : 'white',
                    }}
                  >
                    <Briefcase style={{ width: '24px', height: '24px', color: formData.role === 'doctor' ? 'var(--primary-600)' : 'var(--gray-600)' }} />
                    <span className="font-semibold" style={{ color: formData.role === 'doctor' ? 'var(--primary-700)' : 'var(--gray-700)' }}>
                      Doctor
                    </span>
                  </button>
                </div>
              </div>

              {/* Profile Photo Upload */}
              <div>
                <label className="form-label">Profile Photo</label>
                <div className="flex items-center gap-4">
                  {/* Photo Preview */}
                  <div
                    style={{
                      width: '100px',
                      height: '100px',
                      borderRadius: 'var(--radius-xl)',
                      border: '2px dashed var(--gray-300)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: photoPreview ? 'transparent' : 'var(--gray-50)',
                      overflow: 'hidden',
                      position: 'relative',
                    }}
                  >
                    {photoPreview ? (
                      <img
                        src={photoPreview}
                        alt="Profile preview"
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />
                    ) : (
                      <Camera style={{ width: '32px', height: '32px', color: 'var(--gray-400)' }} />
                    )}
                  </div>

                  {/* Upload Button */}
                  <div className="flex-1">
                    <label
                      htmlFor="profilePhoto"
                      className="btn btn-secondary cursor-pointer"
                      style={{ display: 'inline-flex' }}
                    >
                      <Upload style={{ width: '20px', height: '20px' }} />
                      {photoPreview ? 'Change Photo' : 'Upload Photo'}
                    </label>
                    <input
                      type="file"
                      id="profilePhoto"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={handlePhotoChange}
                      style={{ display: 'none' }}
                    />
                    <p className="form-hint mt-2">
                      JPG, PNG or WebP. Max size 5MB. Recommended: 400x400px
                    </p>
                  </div>
                </div>
              </div>

              {/* Name Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="form-label form-label-required">First Name</label>
                  <div className="relative">
                    <User
                      style={{
                        position: 'absolute',
                        left: 'var(--space-3)',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: '20px',
                        height: '20px',
                        color: 'var(--gray-400)',
                        pointerEvents: 'none',
                      }}
                    />
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="John"
                      style={{ paddingLeft: 'var(--space-10)' }}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="form-label form-label-required">Last Name</label>
                  <div className="relative">
                    <User
                      style={{
                        position: 'absolute',
                        left: 'var(--space-3)',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: '20px',
                        height: '20px',
                        color: 'var(--gray-400)',
                        pointerEvents: 'none',
                      }}
                    />
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="Doe"
                      style={{ paddingLeft: 'var(--space-10)' }}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="form-label form-label-required">Email Address</label>
                <div className="relative">
                  <Mail
                    style={{
                      position: 'absolute',
                      left: 'var(--space-3)',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: '20px',
                      height: '20px',
                      color: 'var(--gray-400)',
                      pointerEvents: 'none',
                    }}
                  />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="you@example.com"
                    style={{ paddingLeft: 'var(--space-10)' }}
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="form-label form-label-required">Password</label>
                <div className="relative">
                  <Lock
                    style={{
                      position: 'absolute',
                      left: 'var(--space-3)',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: '20px',
                      height: '20px',
                      color: 'var(--gray-400)',
                      pointerEvents: 'none',
                    }}
                  />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Minimum 6 characters"
                    style={{ paddingLeft: 'var(--space-10)' }}
                    required
                    minLength="6"
                    autoComplete="new-password"
                  />
                </div>
                <p className="form-hint">Must be at least 6 characters</p>
              </div>

              {/* Phone and Date of Birth */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Phone Number</label>
                  <div className="relative">
                    <Phone
                      style={{
                        position: 'absolute',
                        left: 'var(--space-3)',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: '20px',
                        height: '20px',
                        color: 'var(--gray-400)',
                        pointerEvents: 'none',
                      }}
                    />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="+1 (555) 123-4567"
                      style={{ paddingLeft: 'var(--space-10)' }}
                    />
                  </div>
                </div>

                <div>
                  <label className="form-label">Date of Birth</label>
                  <div className="relative">
                    <Calendar
                      style={{
                        position: 'absolute',
                        left: 'var(--space-3)',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: '20px',
                        height: '20px',
                        color: 'var(--gray-400)',
                        pointerEvents: 'none',
                      }}
                    />
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                      className="form-input"
                      style={{ paddingLeft: 'var(--space-10)' }}
                    />
                  </div>
                </div>
              </div>

              {/* Doctor-specific fields */}
              {formData.role === 'doctor' && (
                <div className="animate-fadeIn">
                  <div
                    className="p-4 rounded-lg mb-4"
                    style={{
                      backgroundColor: 'var(--primary-50)',
                      border: '1px solid var(--primary-200)',
                    }}
                  >
                    <p className="text-sm font-medium" style={{ color: 'var(--primary-700)' }}>
                      Additional information required for medical professionals
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="form-label form-label-required">Specialization</label>
                      <div className="relative">
                        <Briefcase
                          style={{
                            position: 'absolute',
                            left: 'var(--space-3)',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            width: '20px',
                            height: '20px',
                            color: 'var(--gray-400)',
                            pointerEvents: 'none',
                          }}
                        />
                        <input
                          type="text"
                          name="specialization"
                          value={formData.specialization}
                          onChange={handleChange}
                          className="form-input"
                          placeholder="e.g., Cardiology, Surgery"
                          style={{ paddingLeft: 'var(--space-10)' }}
                          required={formData.role === 'doctor'}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="form-label form-label-required">License Number</label>
                      <div className="relative">
                        <FileText
                          style={{
                            position: 'absolute',
                            left: 'var(--space-3)',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            width: '20px',
                            height: '20px',
                            color: 'var(--gray-400)',
                            pointerEvents: 'none',
                          }}
                        />
                        <input
                          type="text"
                          name="licenseNumber"
                          value={formData.licenseNumber}
                          onChange={handleChange}
                          className="form-input"
                          placeholder="Medical license number"
                          style={{ paddingLeft: 'var(--space-10)' }}
                          required={formData.role === 'doctor'}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary btn-lg w-full"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="loading-spinner"></span>
                    Creating account...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Create Account
                    <ArrowRight style={{ width: '20px', height: '20px' }} />
                  </span>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-8">
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <div
                  style={{
                    width: '100%',
                    borderTop: '1px solid var(--gray-200)',
                  }}
                />
              </div>
              <div className="relative flex justify-center">
                <span
                  className="text-sm"
                  style={{
                    backgroundColor: 'white',
                    padding: '0 var(--space-3)',
                    color: 'var(--gray-500)',
                  }}
                >
                  Already have an account?
                </span>
              </div>
            </div>

            {/* Sign In Link */}
            <Link to="/login" className="btn btn-secondary btn-lg w-full">
              Sign In
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-xs text-tertiary">
            By creating an account, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
