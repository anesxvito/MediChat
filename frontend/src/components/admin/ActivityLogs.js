import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import {
  Activity,
  Search,
  Filter,
  RefreshCw,
  Calendar,
  User,
  Shield,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle,
  Eye,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

/**
 * PROFESSIONAL ACTIVITY LOGS VIEWER
 * MongoDB-powered audit trail with filtering and pagination
 */
const ActivityLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    action: '',
    status: '',
    severity: '',
    userRole: '',
    startDate: '',
    endDate: '',
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalLogs: 0,
    logsPerPage: 50,
  });
  const [expandedLog, setExpandedLog] = useState(null);

  useEffect(() => {
    loadLogs();
  }, [pagination.currentPage]);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getActivityLogs({
        ...filters,
        page: pagination.currentPage,
        limit: pagination.logsPerPage,
      });
      setLogs(response.data.logs);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error loading logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
  };

  const handleSearch = () => {
    setPagination({ ...pagination, currentPage: 1 });
    loadLogs();
  };

  const handleClearFilters = () => {
    setFilters({
      action: '',
      status: '',
      severity: '',
      userRole: '',
      startDate: '',
      endDate: '',
    });
    setTimeout(() => loadLogs(), 100);
  };

  const getSeverityBadge = (severity) => {
    const variants = {
      info: { className: 'badge-info', icon: <CheckCircle style={{ width: '12px', height: '12px' }} /> },
      warning: { className: 'badge-warning', icon: <AlertTriangle style={{ width: '12px', height: '12px' }} /> },
      error: { className: 'badge-error', icon: <XCircle style={{ width: '12px', height: '12px' }} /> },
      critical: { className: 'badge-error', icon: <AlertCircle style={{ width: '12px', height: '12px' }} /> },
    };
    const variant = variants[severity] || variants.info;
    return (
      <span className={`badge ${variant.className}`}>
        {variant.icon}
        {severity}
      </span>
    );
  };

  const getStatusBadge = (status) => {
    const variants = {
      success: { className: 'badge-success', icon: <CheckCircle style={{ width: '12px', height: '12px' }} /> },
      failure: { className: 'badge-error', icon: <XCircle style={{ width: '12px', height: '12px' }} /> },
      error: { className: 'badge-error', icon: <AlertCircle style={{ width: '12px', height: '12px' }} /> },
      warning: { className: 'badge-warning', icon: <AlertTriangle style={{ width: '12px', height: '12px' }} /> },
    };
    const variant = variants[status] || variants.success;
    return (
      <span className={`badge ${variant.className}`}>
        {variant.icon}
        {status}
      </span>
    );
  };

  const getRoleBadge = (role) => {
    const variants = {
      admin: { className: 'badge-error', icon: <Shield style={{ width: '12px', height: '12px' }} /> },
      doctor: { className: 'badge-info', icon: <User style={{ width: '12px', height: '12px' }} /> },
      patient: { className: 'badge-success', icon: <User style={{ width: '12px', height: '12px' }} /> },
      system: { className: 'badge badge-secondary', icon: <Activity style={{ width: '12px', height: '12px' }} /> },
      anonymous: { className: 'badge badge-secondary', icon: <User style={{ width: '12px', height: '12px' }} /> },
    };
    const variant = variants[role] || variants.anonymous;
    return (
      <span className={`badge ${variant.className}`}>
        {variant.icon}
        {role}
      </span>
    );
  };

  return (
    <div className="flex-1 overflow-auto p-4 md:p-6" style={{ backgroundColor: 'var(--gray-50)' }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 pl-16 lg:pl-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="heading-h1">Activity Logs</h1>
              <p className="text-md text-secondary mt-2">Monitor all system activities and user actions</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={loadLogs}
                className="btn btn-secondary"
                disabled={loading}
              >
                <RefreshCw style={{ width: '20px', height: '20px' }} />
                Refresh
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="card p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Filter style={{ width: '20px', height: '20px', color: 'var(--gray-600)' }} />
              <h3 className="font-semibold text-gray-900">Filters</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="form-group">
                <label className="form-label">Severity</label>
                <select
                  value={filters.severity}
                  onChange={(e) => handleFilterChange('severity', e.target.value)}
                  className="form-select"
                >
                  <option value="">All Severities</option>
                  <option value="info">Info</option>
                  <option value="warning">Warning</option>
                  <option value="error">Error</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="form-select"
                >
                  <option value="">All Statuses</option>
                  <option value="success">Success</option>
                  <option value="failure">Failure</option>
                  <option value="error">Error</option>
                  <option value="warning">Warning</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">User Role</label>
                <select
                  value={filters.userRole}
                  onChange={(e) => handleFilterChange('userRole', e.target.value)}
                  className="form-select"
                >
                  <option value="">All Roles</option>
                  <option value="admin">Admin</option>
                  <option value="doctor">Doctor</option>
                  <option value="patient">Patient</option>
                  <option value="system">System</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Start Date</label>
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
                    value={filters.startDate}
                    onChange={(e) => handleFilterChange('startDate', e.target.value)}
                    className="form-input"
                    style={{ paddingLeft: 'var(--space-10)' }}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">End Date</label>
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
                    value={filters.endDate}
                    onChange={(e) => handleFilterChange('endDate', e.target.value)}
                    className="form-input"
                    style={{ paddingLeft: 'var(--space-10)' }}
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              <button
                onClick={handleSearch}
                className="btn btn-primary"
                disabled={loading}
              >
                <Search style={{ width: '20px', height: '20px' }} />
                Apply Filters
              </button>
              <button
                onClick={handleClearFilters}
                className="btn btn-secondary"
                disabled={loading}
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Logs List */}
        <div className="space-y-3">
          {logs.map((log) => (
            <div key={log._id} className="card">
              <div className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      {getRoleBadge(log.userRole)}
                      {getSeverityBadge(log.severity)}
                      {getStatusBadge(log.status)}
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Clock style={{ width: '12px', height: '12px' }} />
                        {new Date(log.createdAt).toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-start gap-3">
                      <Activity
                        style={{
                          width: '20px',
                          height: '20px',
                          color: 'var(--primary-600)',
                          flexShrink: 0,
                          marginTop: '2px',
                        }}
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">
                          {log.action.replace(/_/g, ' ').replace(/\./g, ' → ')}
                        </h3>
                        {log.description && (
                          <p className="text-sm text-gray-600 mb-2">{log.description}</p>
                        )}
                        {log.user && (
                          <p className="text-xs text-gray-500">
                            <span className="font-medium">User:</span> {log.user.firstName} {log.user.lastName} ({log.user.email})
                          </p>
                        )}
                        {log.userEmail && !log.user && (
                          <p className="text-xs text-gray-500">
                            <span className="font-medium">Email:</span> {log.userEmail}
                          </p>
                        )}
                        {log.ipAddress && (
                          <p className="text-xs text-gray-500 mt-1">
                            <span className="font-medium">IP:</span> {log.ipAddress}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Expandable Details */}
                    {(log.metadata || log.error) && (
                      <button
                        onClick={() => setExpandedLog(expandedLog === log._id ? null : log._id)}
                        className="text-sm text-primary-600 hover:text-primary-700 font-medium mt-3 flex items-center gap-1"
                      >
                        {expandedLog === log._id ? (
                          <>
                            <ChevronUp style={{ width: '16px', height: '16px' }} />
                            Hide Details
                          </>
                        ) : (
                          <>
                            <ChevronDown style={{ width: '16px', height: '16px' }} />
                            Show Details
                          </>
                        )}
                      </button>
                    )}

                    {expandedLog === log._id && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                        {log.metadata && (
                          <div className="mb-3">
                            <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Metadata</h4>
                            <pre className="text-xs text-gray-600 overflow-x-auto">
                              {JSON.stringify(log.metadata, null, 2)}
                            </pre>
                          </div>
                        )}
                        {log.error && (
                          <div>
                            <h4 className="text-xs font-bold text-red-700 uppercase tracking-wider mb-2">Error Details</h4>
                            <p className="text-xs text-red-600 mb-1">{log.error.message}</p>
                            {log.error.stack && (
                              <pre className="text-xs text-gray-600 overflow-x-auto mt-2">
                                {log.error.stack}
                              </pre>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {log.duration && (
                    <div className="text-xs text-gray-500 flex-shrink-0">
                      {log.duration}ms
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {logs.length === 0 && !loading && (
          <div className="card p-16 text-center">
            <Activity style={{ width: '64px', height: '64px', color: 'var(--gray-300)', margin: '0 auto 16px' }} />
            <p className="text-lg font-medium text-gray-500">No activity logs found</p>
            <p className="text-sm text-gray-400 mt-1">Try adjusting your filters</p>
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-16">
            <div className="loading-spinner" style={{ width: '40px', height: '40px', borderWidth: '4px' }}></div>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 p-4 card">
            <div className="text-sm text-gray-600">
              Showing page {pagination.currentPage} of {pagination.totalPages} ({pagination.totalLogs} total logs)
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPagination({ ...pagination, currentPage: pagination.currentPage - 1 })}
                disabled={pagination.currentPage === 1 || loading}
                className="btn btn-secondary btn-sm"
              >
                Previous
              </button>
              <button
                onClick={() => setPagination({ ...pagination, currentPage: pagination.currentPage + 1 })}
                disabled={pagination.currentPage === pagination.totalPages || loading}
                className="btn btn-secondary btn-sm"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityLogs;
