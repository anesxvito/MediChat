import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import {
  BarChart3,
  TrendingUp,
  Users,
  Shield,
  Clock,
  CheckCircle,
  MessageSquare,
  Activity,
  AlertCircle,
  Calendar,
  RefreshCw,
} from 'lucide-react';

/**
 * PROFESSIONAL SYSTEM STATISTICS & ANALYTICS
 * Comprehensive dashboard metrics and visualizations
 */
const SystemStats = ({ stats }) => {
  const [logStats, setLogStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    loadLogStatistics();
  }, []);

  const loadLogStatistics = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getLogStatistics(dateRange.startDate, dateRange.endDate);
      setLogStats(response.data);
    } catch (error) {
      console.error('Error loading log statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateRangeChange = (key, value) => {
    setDateRange({ ...dateRange, [key]: value });
  };

  const handleApplyDateRange = () => {
    loadLogStatistics();
  };

  return (
    <div className="flex-1 overflow-auto p-4 md:p-6" style={{ backgroundColor: 'var(--gray-50)' }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 pl-16 lg:pl-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="heading-h1">System Analytics</h1>
              <p className="text-md text-secondary mt-2">Comprehensive metrics and insights</p>
            </div>
            <button
              onClick={loadLogStatistics}
              className="btn btn-secondary"
              disabled={loading}
            >
              <RefreshCw style={{ width: '20px', height: '20px' }} />
              Refresh
            </button>
          </div>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Patients */}
          <div className="card">
            <div className="card-body p-6">
              <div className="flex items-center justify-between mb-4">
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
                    borderRadius: 'var(--radius-xl)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: 'var(--shadow-md)',
                  }}
                >
                  <Users style={{ width: '24px', height: '24px', color: 'white' }} />
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{stats.totalPatients}</div>
              <div className="text-sm text-gray-600">Total Patients</div>
            </div>
          </div>

          {/* Total Doctors */}
          <div className="card">
            <div className="card-body p-6">
              <div className="flex items-center justify-between mb-4">
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                    borderRadius: 'var(--radius-xl)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: 'var(--shadow-md)',
                  }}
                >
                  <Shield style={{ width: '24px', height: '24px', color: 'white' }} />
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{stats.totalDoctors}</div>
              <div className="text-sm text-gray-600">Total Doctors</div>
            </div>
          </div>

          {/* Total Conversations */}
          <div className="card">
            <div className="card-body p-6">
              <div className="flex items-center justify-between mb-4">
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
                    borderRadius: 'var(--radius-xl)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: 'var(--shadow-md)',
                  }}
                >
                  <MessageSquare style={{ width: '24px', height: '24px', color: 'white' }} />
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{stats.totalConversations}</div>
              <div className="text-sm text-gray-600">Total Conversations</div>
            </div>
          </div>

          {/* Pending Cases */}
          <div className="card">
            <div className="card-body p-6">
              <div className="flex items-center justify-between mb-4">
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                    borderRadius: 'var(--radius-xl)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: 'var(--shadow-md)',
                  }}
                >
                  <Clock style={{ width: '24px', height: '24px', color: 'white' }} />
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{stats.pendingConversations}</div>
              <div className="text-sm text-gray-600">Pending Reviews</div>
            </div>
          </div>
        </div>

        {/* Activity Logs Statistics */}
        {logStats && (
          <>
            {/* Date Range Selector */}
            <div className="card p-6 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Calendar style={{ width: '20px', height: '20px', color: 'var(--gray-600)' }} />
                <h3 className="font-semibold text-gray-900">Activity Date Range</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="form-group">
                  <label className="form-label">Start Date</label>
                  <input
                    type="date"
                    value={dateRange.startDate}
                    onChange={(e) => handleDateRangeChange('startDate', e.target.value)}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">End Date</label>
                  <input
                    type="date"
                    value={dateRange.endDate}
                    onChange={(e) => handleDateRangeChange('endDate', e.target.value)}
                    className="form-input"
                  />
                </div>
                <div className="form-group flex items-end">
                  <button
                    onClick={handleApplyDateRange}
                    className="btn btn-primary w-full"
                    disabled={loading}
                  >
                    Apply Range
                  </button>
                </div>
              </div>
            </div>

            {/* Activity Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="card">
                <div className="card-body p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div
                      style={{
                        width: '48px',
                        height: '48px',
                        backgroundColor: 'var(--primary-50)',
                        borderRadius: 'var(--radius-xl)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Activity style={{ width: '24px', height: '24px', color: 'var(--primary-600)' }} />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900">{logStats.totalLogs}</div>
                      <div className="text-sm text-gray-600">Total Activities</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-body p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div
                      style={{
                        width: '48px',
                        height: '48px',
                        backgroundColor: 'var(--error-50)',
                        borderRadius: 'var(--radius-xl)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <AlertCircle style={{ width: '24px', height: '24px', color: 'var(--error-600)' }} />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900">{logStats.failedLogins}</div>
                      <div className="text-sm text-gray-600">Failed Logins</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-body p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div
                      style={{
                        width: '48px',
                        height: '48px',
                        backgroundColor: 'var(--success-50)',
                        borderRadius: 'var(--radius-xl)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <TrendingUp style={{ width: '24px', height: '24px', color: 'var(--success-600)' }} />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900">
                        {((logStats.totalLogs - logStats.failedLogins) / logStats.totalLogs * 100 || 0).toFixed(1)}%
                      </div>
                      <div className="text-sm text-gray-600">Success Rate</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Activity Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* By Status */}
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Activities by Status</h3>
                </div>
                <div className="card-body">
                  <div className="space-y-3">
                    {logStats.byStatus.map((item) => (
                      <div key={item._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          {item._id === 'success' && <CheckCircle style={{ width: '20px', height: '20px', color: 'var(--success-600)' }} />}
                          {item._id === 'failure' && <AlertCircle style={{ width: '20px', height: '20px', color: 'var(--error-600)' }} />}
                          {item._id === 'error' && <AlertCircle style={{ width: '20px', height: '20px', color: 'var(--error-600)' }} />}
                          <span className="font-medium text-gray-900 capitalize">{item._id}</span>
                        </div>
                        <span className="text-lg font-bold text-gray-900">{item.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* By User Role */}
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Activities by User Role</h3>
                </div>
                <div className="card-body">
                  <div className="space-y-3">
                    {logStats.byUserRole.map((item) => (
                      <div key={item._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          {item._id === 'admin' && <Shield style={{ width: '20px', height: '20px', color: 'var(--error-600)' }} />}
                          {item._id === 'doctor' && <Shield style={{ width: '20px', height: '20px', color: 'var(--info-600)' }} />}
                          {item._id === 'patient' && <Users style={{ width: '20px', height: '20px', color: 'var(--success-600)' }} />}
                          {item._id === 'system' && <Activity style={{ width: '20px', height: '20px', color: 'var(--gray-600)' }} />}
                          <span className="font-medium text-gray-900 capitalize">{item._id}</span>
                        </div>
                        <span className="text-lg font-bold text-gray-900">{item.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Top Actions */}
            <div className="card mt-6">
              <div className="card-header">
                <h3 className="card-title">Top 10 Activities</h3>
              </div>
              <div className="card-body">
                <div className="space-y-2">
                  {logStats.topActions.map((action, index) => (
                    <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div
                          style={{
                            width: '32px',
                            height: '32px',
                            backgroundColor: 'var(--primary-100)',
                            borderRadius: 'var(--radius-lg)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          <span className="text-sm font-bold text-primary-700">{index + 1}</span>
                        </div>
                        <span className="font-medium text-gray-900 truncate">
                          {action._id.replace(/_/g, ' ').replace(/\./g, ' → ')}
                        </span>
                      </div>
                      <span className="text-lg font-bold text-gray-900 ml-4">{action.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {loading && !logStats && (
          <div className="flex items-center justify-center py-16">
            <div className="loading-spinner" style={{ width: '40px', height: '40px', borderWidth: '4px' }}></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SystemStats;
