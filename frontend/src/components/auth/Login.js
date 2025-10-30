import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Activity, Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(formData);

    if (result.success) {
      const user = JSON.parse(localStorage.getItem('user'));
      if (user.role === 'doctor') {
        navigate('/doctor/dashboard');
      } else if (user.role === 'admin') {
        navigate('/admin/dashboard');
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
      className="min-h-screen flex items-center justify-center p-4"
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

      <div className="w-full max-w-md relative animate-fadeIn">
        {/* Logo and Brand */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center mb-6"
            style={{
              width: '88px',
              height: '88px',
              background: 'linear-gradient(135deg, var(--primary-600) 0%, var(--primary-700) 100%)',
              borderRadius: 'var(--radius-2xl)',
              boxShadow: 'var(--shadow-xl)',
            }}
          >
            <Activity style={{ width: '48px', height: '48px', color: 'white', strokeWidth: 2.5 }} />
          </div>
          <h1 className="display-lg" style={{ color: 'var(--gray-900)', marginBottom: 'var(--space-2)' }}>
            Welcome to MediChat
          </h1>
          <p className="text-md text-secondary">
            Professional medical care at your fingertips
          </p>
        </div>

        {/* Login Card */}
        <div className="card">
          <div className="card-body" style={{ padding: 'var(--space-8)' }}>
            {error && (
              <div className="alert alert-error mb-6">
                <AlertCircle style={{ width: '20px', height: '20px', flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              {/* Email Input */}
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

              {/* Password Input */}
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
                    placeholder="Enter your password"
                    style={{ paddingLeft: 'var(--space-10)' }}
                    required
                    autoComplete="current-password"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary btn-lg w-full"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="loading-spinner"></span>
                    Signing in...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Sign In
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
                  New to MediChat?
                </span>
              </div>
            </div>

            {/* Sign Up Link */}
            <Link to="/register" className="btn btn-secondary btn-lg w-full">
              Create an Account
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-xs text-tertiary">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
