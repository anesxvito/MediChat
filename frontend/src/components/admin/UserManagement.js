import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import {
  Users,
  UserPlus,
  Search,
  Trash2,
  Shield,
  Stethoscope,
  UserCheck,
  X,
  Mail,
  Lock,
  Award,
  FileText,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  User,
  Phone,
} from 'lucide-react';

/**
 * PROFESSIONAL USER MANAGEMENT COMPONENT
 * Full CRUD operations for system users
 */
const UserManagement = ({ onUpdate }) => {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [imageLoadErrors, setImageLoadErrors] = useState({});
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'patient',
    phone: '',
    specialization: '',
    licenseNumber: '',
  });

  useEffect(() => {
    loadUsers();
  }, [roleFilter]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getUsers(roleFilter, searchQuery);
      setUsers(response.data.users);
    } catch (error) {
      console.error('Error loading users:', error);
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    loadUsers();
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await adminAPI.createUser(newUser);
      setShowModal(false);
      setNewUser({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        role: 'patient',
        phone: '',
        specialization: '',
        licenseNumber: '',
      });
      setSuccess('User created successfully!');
      loadUsers();
      if (onUpdate) onUpdate();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error creating user:', error);
      setError(error.response?.data?.error || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    setLoading(true);
    try {
      await adminAPI.deleteUser(userId);
      setSuccess('User deleted successfully!');
      loadUsers();
      if (onUpdate) onUpdate();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error deleting user:', error);
      setError(error.response?.data?.error || 'Failed to delete user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 overflow-auto p-4 md:p-6" style={{ backgroundColor: 'var(--gray-50)' }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 pl-16 lg:pl-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="heading-h1">User Management</h1>
              <p className="text-md text-secondary mt-2">Manage system users and permissions</p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="btn btn-primary btn-lg"
              disabled={loading}
            >
              <UserPlus style={{ width: '20px', height: '20px' }} />
              Add New User
            </button>
          </div>

          {/* Success/Error Messages */}
          {error && (
            <div className="alert alert-error mb-6 animate-fadeIn">
              <AlertCircle style={{ width: '20px', height: '20px' }} />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="alert alert-success mb-6 animate-fadeIn">
              <CheckCircle style={{ width: '20px', height: '20px' }} />
              <span>{success}</span>
            </div>
          )}

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search
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
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="form-input"
                style={{ paddingLeft: 'var(--space-10)' }}
              />
            </div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="form-select"
              style={{ minWidth: '200px' }}
            >
              <option value="">All Roles</option>
              <option value="patient">Patients</option>
              <option value="doctor">Doctors</option>
              <option value="admin">Administrators</option>
            </select>
            <button
              onClick={loadUsers}
              className="btn btn-secondary"
              disabled={loading}
            >
              <RefreshCw style={{ width: '20px', height: '20px' }} />
              Refresh
            </button>
          </div>
        </div>

        {/* Users Table */}
        <div className="card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor: 'var(--gray-50)', borderBottom: '2px solid var(--gray-200)' }}>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">User</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider hidden md:table-cell">Contact</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider hidden lg:table-cell">Joined</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody style={{ backgroundColor: 'white' }}>
                {users.map((u) => (
                  <tr
                    key={u.id}
                    style={{
                      borderBottom: '1px solid var(--gray-200)',
                      transition: 'background-color 0.15s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--gray-50)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'white')}
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div
                          style={{
                            width: '44px',
                            height: '44px',
                            background: (u.profilePhoto && !imageLoadErrors[u.id]) ? 'transparent' : 'linear-gradient(135deg, var(--primary-600) 0%, var(--primary-700) 100%)',
                            borderRadius: 'var(--radius-xl)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: '700',
                            fontSize: '14px',
                            boxShadow: 'var(--shadow-md)',
                            overflow: 'hidden',
                            border: (u.profilePhoto && !imageLoadErrors[u.id]) ? '2px solid var(--primary-200)' : 'none',
                          }}
                        >
                          {(u.profilePhoto && !imageLoadErrors[u.id]) ? (
                            <img
                              src={`http://localhost:5000${u.profilePhoto}`}
                              alt={`${u.firstName} ${u.lastName}`}
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                              }}
                              onError={() => {
                                setImageLoadErrors(prev => ({ ...prev, [u.id]: true }));
                              }}
                            />
                          ) : (
                            `${u.firstName[0]}${u.lastName[0]}`
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">
                            {u.firstName} {u.lastName}
                          </div>
                          {u.role === 'doctor' && u.specialization && (
                            <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                              <Stethoscope style={{ width: '12px', height: '12px' }} />
                              {u.specialization}
                            </div>
                          )}
                          <div className="text-xs text-gray-600 md:hidden mt-1">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 hidden md:table-cell">
                      <div className="text-sm text-gray-700">{u.email}</div>
                      {u.phone && (
                        <div className="text-xs text-gray-500 mt-1">{u.phone}</div>
                      )}
                    </td>
                    <td className="px-6 py-5">
                      {u.role === 'admin' && (
                        <span className="badge badge-error">
                          <Shield style={{ width: '12px', height: '12px' }} />
                          Admin
                        </span>
                      )}
                      {u.role === 'doctor' && (
                        <span className="badge badge-info">
                          <Stethoscope style={{ width: '12px', height: '12px' }} />
                          Doctor
                        </span>
                      )}
                      {u.role === 'patient' && (
                        <span className="badge badge-success">
                          <UserCheck style={{ width: '12px', height: '12px' }} />
                          Patient
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-5 text-sm text-gray-600 hidden lg:table-cell">
                      {new Date(u.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex justify-end">
                        <button
                          onClick={() => handleDeleteUser(u.id)}
                          className="p-2.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete user"
                          disabled={loading}
                        >
                          <Trash2 style={{ width: '20px', height: '20px' }} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {users.length === 0 && !loading && (
            <div className="text-center py-16" style={{ backgroundColor: 'var(--gray-50)' }}>
              <Users style={{ width: '64px', height: '64px', color: 'var(--gray-300)', margin: '0 auto 16px' }} />
              <p className="text-lg font-medium" style={{ color: 'var(--gray-500)' }}>No users found</p>
              <p className="text-sm mt-1" style={{ color: 'var(--gray-400)' }}>Try adjusting your search or filters</p>
            </div>
          )}

          {loading && (
            <div className="flex items-center justify-center py-16">
              <div className="loading-spinner" style={{ width: '40px', height: '40px', borderWidth: '4px' }}></div>
            </div>
          )}
        </div>
      </div>

      {/* Create User Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-container" style={{ maxWidth: '600px' }}>
            {/* Modal Header */}
            <div className="modal-header">
              <div className="flex items-center gap-3">
                <div className="modal-icon">
                  <UserPlus style={{ width: '24px', height: '24px', color: 'white' }} />
                </div>
                <div>
                  <h3 className="modal-title">Add New User</h3>
                  <p className="text-sm text-primary-100">Create a new account</p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition text-white"
              >
                <X style={{ width: '24px', height: '24px' }} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleCreateUser} className="modal-body">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label form-label-required">First Name</label>
                  <input
                    type="text"
                    required
                    value={newUser.firstName}
                    onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
                    className="form-input"
                    placeholder="John"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label form-label-required">Last Name</label>
                  <input
                    type="text"
                    required
                    value={newUser.lastName}
                    onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
                    className="form-input"
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div className="form-group">
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
                    required
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    className="form-input"
                    style={{ paddingLeft: 'var(--space-10)' }}
                    placeholder="john.doe@example.com"
                  />
                </div>
              </div>

              <div className="form-group">
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
                    required
                    minLength={6}
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    className="form-input"
                    style={{ paddingLeft: 'var(--space-10)' }}
                    placeholder="Minimum 6 characters"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label form-label-required">Role</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className="form-select"
                >
                  <option value="patient">Patient</option>
                  <option value="doctor">Doctor</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>

              {newUser.role === 'doctor' && (
                <div className="space-y-4">
                  <div className="form-group">
                    <label className="form-label form-label-required">Specialization</label>
                    <div className="relative">
                      <Stethoscope
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
                        required
                        value={newUser.specialization}
                        onChange={(e) => setNewUser({ ...newUser, specialization: e.target.value })}
                        className="form-input"
                        style={{ paddingLeft: 'var(--space-10)' }}
                        placeholder="e.g., General Medicine, Cardiology"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label form-label-required">License Number</label>
                    <div className="relative">
                      <Award
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
                        required
                        value={newUser.licenseNumber}
                        onChange={(e) => setNewUser({ ...newUser, licenseNumber: e.target.value })}
                        className="form-input"
                        style={{ paddingLeft: 'var(--space-10)' }}
                        placeholder="Medical license number"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn btn-secondary"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="loading-spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <UserPlus style={{ width: '20px', height: '20px' }} />
                      Create User
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
