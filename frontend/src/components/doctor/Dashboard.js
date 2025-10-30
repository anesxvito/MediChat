import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { doctorAPI } from '../../services/api';
import DashboardLayout from '../shared/DashboardLayout';
import PatientDetails from './PatientDetails';
import {
  Users,
  Clock,
  CheckCircle,
  User,
  Activity,
  Calendar,
  FileText,
  Stethoscope,
  ArrowRight,
} from 'lucide-react';

/**
 * WORLD-CLASS DOCTOR DASHBOARD
 * Professional medical workspace inspired by Epic, Cerner, and Doctolib
 */
const DoctorDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('pending');
  const [pendingConversations, setPendingConversations] = useState([]);
  const [myConversations, setMyConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [stats, setStats] = useState({
    pendingConversations: 0,
    totalPatients: 0,
    todayResponses: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [pendingRes, myRes, statsRes] = await Promise.all([
        doctorAPI.getPendingConversations(),
        doctorAPI.getMyConversations(),
        doctorAPI.getStats(),
      ]);

      setPendingConversations(pendingRes.data?.conversations || []);
      setMyConversations(myRes.data?.conversations || []);
      setStats(statsRes.data || {
        pendingConversations: 0,
        totalPatients: 0,
        todayResponses: 0,
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setPendingConversations([]);
      setMyConversations([]);
      setStats({
        pendingConversations: 0,
        totalPatients: 0,
        todayResponses: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
  };

  const handleCloseDetails = () => {
    setSelectedConversation(null);
    loadDashboardData();
  };

  if (selectedConversation) {
    return (
      <PatientDetails
        conversation={selectedConversation}
        onClose={handleCloseDetails}
      />
    );
  }

  // Navigation items for doctor sidebar
  const navigationItems = [
    {
      id: 'pending',
      label: 'Pending Cases',
      icon: <Clock style={{ width: '20px', height: '20px' }} />,
      badge: stats.pendingConversations,
    },
    {
      id: 'my-patients',
      label: 'My Patients',
      icon: <Users style={{ width: '20px', height: '20px' }} />,
      badge: 0,
    },
  ];

  // Stats for doctor sidebar
  const doctorStats = [
    {
      label: 'Pending Reviews',
      value: stats.pendingConversations,
      icon: <Clock style={{ width: '18px', height: '18px' }} />,
      bgColor: '#FFFAEB',
      borderColor: '#FEF0C7',
      iconColor: '#DC6803',
      valueColor: '#B54708',
    },
    {
      label: 'Total Patients',
      value: stats.totalPatients,
      icon: <Users style={{ width: '18px', height: '18px' }} />,
      bgColor: '#EBF5FF',
      borderColor: '#B3DDFF',
      iconColor: '#1570EF',
      valueColor: '#175CD3',
    },
    {
      label: 'Today Responses',
      value: stats.todayResponses,
      icon: <CheckCircle style={{ width: '18px', height: '18px' }} />,
      bgColor: '#ECFDF3',
      borderColor: '#D1FADF',
      iconColor: '#039855',
      valueColor: '#027A48',
    },
  ];

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status) => {
    if (status === 'awaiting_doctor') {
      return <span className="badge badge-warning">Awaiting Review</span>;
    } else if (status === 'doctor_responded') {
      return <span className="badge badge-success">Completed</span>;
    }
    return <span className="badge badge-gray">{status}</span>;
  };

  return (
    <DashboardLayout
      user={user}
      navigationItems={navigationItems}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      logout={logout}
      stats={doctorStats}
      brandColor="#1570EF"
      role="Doctor"
    >
      {/* Pending Cases Tab */}
      {activeTab === 'pending' && (
        <div className="flex-1 overflow-auto p-4 md:p-6" style={{ backgroundColor: '#F9FAFB' }}>
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 style={{
                fontSize: '30px',
                fontWeight: '600',
                color: '#101828',
                marginBottom: '8px',
              }}>
                Pending Patient Cases
              </h1>
              <p style={{
                fontSize: '16px',
                color: '#475467',
              }}>
                Review and respond to patient consultations awaiting your expertise
              </p>
            </div>

            {/* Loading State */}
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="loading-spinner" style={{ width: '40px', height: '40px', borderWidth: '4px' }}></div>
              </div>
            ) : (
              <>
                {/* Patient Cases Grid */}
                {pendingConversations.length > 0 ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {pendingConversations.map((conversation) => (
                      <div
                        key={conversation.id || conversation._id}
                        onClick={() => handleSelectConversation(conversation)}
                        className="card card-interactive"
                      >
                        <div className="card-body">
                          {/* Patient Info Header */}
                          <div className="flex items-center gap-3 mb-4">
                            <div
                              className="avatar avatar-lg"
                              style={{
                                background: 'linear-gradient(135deg, #1570EF 0%, #175CD3 100%)',
                                color: 'white',
                              }}
                            >
                              <User style={{ width: '24px', height: '24px' }} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 style={{
                                fontSize: '16px',
                                fontWeight: '600',
                                color: '#101828',
                                marginBottom: '2px',
                              }}>
                                {conversation.patient?.firstName} {conversation.patient?.lastName}
                              </h3>
                              <p style={{
                                fontSize: '14px',
                                color: '#475467',
                              }}>
                                Visit #{conversation.visitNumber}
                              </p>
                            </div>
                            {getStatusBadge(conversation.status)}
                          </div>

                          {/* Timestamp */}
                          <div className="flex items-center gap-2 mb-4">
                            <Calendar style={{ width: '16px', height: '16px', color: '#667085' }} />
                            <span style={{
                              fontSize: '14px',
                              color: '#667085',
                            }}>
                              {formatDate(conversation.createdAt)}
                            </span>
                          </div>

                          {/* Summary Preview */}
                          {conversation.summary && (
                            <div
                              className="p-3 rounded-lg mb-4"
                              style={{
                                backgroundColor: '#F9FAFB',
                                border: '1px solid #EAECF0',
                              }}
                            >
                              <p style={{
                                fontSize: '13px',
                                fontWeight: '600',
                                color: '#344054',
                                marginBottom: '4px',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                              }}>
                                Chief Complaint
                              </p>
                              <p style={{
                                fontSize: '14px',
                                color: '#475467',
                                lineHeight: '1.5',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                display: '-webkit-box',
                                WebkitLineClamp: 3,
                                WebkitBoxOrient: 'vertical',
                              }}>
                                {conversation.summary.chiefComplaint || 'Not specified'}
                              </p>
                            </div>
                          )}

                          {/* Patient Medical Info */}
                          {conversation.patient && (
                            <div className="flex flex-col gap-2 mb-4">
                              {conversation.patient.allergies && conversation.patient.allergies.length > 0 && (
                                <div>
                                  <p style={{
                                    fontSize: '12px',
                                    fontWeight: '600',
                                    color: '#D92D20',
                                    marginBottom: '4px',
                                  }}>
                                    ALLERGIES
                                  </p>
                                  <div className="flex flex-wrap gap-1">
                                    {conversation.patient.allergies.slice(0, 3).map((allergy, idx) => (
                                      <span key={idx} className="badge badge-error">
                                        {allergy}
                                      </span>
                                    ))}
                                    {conversation.patient.allergies.length > 3 && (
                                      <span className="badge badge-error">
                                        +{conversation.patient.allergies.length - 3}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              )}

                              {conversation.patient.currentMedications && conversation.patient.currentMedications.length > 0 && (
                                <div>
                                  <p style={{
                                    fontSize: '12px',
                                    fontWeight: '600',
                                    color: '#1570EF',
                                    marginBottom: '4px',
                                  }}>
                                    CURRENT MEDICATIONS
                                  </p>
                                  <p style={{
                                    fontSize: '13px',
                                    color: '#475467',
                                  }}>
                                    {conversation.patient.currentMedications.length} medication(s)
                                  </p>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Action Button */}
                          <button
                            className="btn btn-primary w-full"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectConversation(conversation);
                            }}
                          >
                            <Stethoscope style={{ width: '20px', height: '20px' }} />
                            Review Case
                            <ArrowRight style={{ width: '20px', height: '20px' }} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="card text-center">
                    <div className="card-body" style={{ padding: 'var(--space-12)' }}>
                      <CheckCircle style={{
                        width: '64px',
                        height: '64px',
                        color: '#D0D5DD',
                        margin: '0 auto var(--space-4)',
                      }} />
                      <h3 style={{
                        fontSize: '20px',
                        fontWeight: '600',
                        color: '#101828',
                        marginBottom: '8px',
                      }}>
                        All Caught Up!
                      </h3>
                      <p style={{
                        fontSize: '16px',
                        color: '#667085',
                      }}>
                        No pending patient cases at the moment.
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* My Patients Tab */}
      {activeTab === 'my-patients' && (
        <div className="flex-1 overflow-auto p-4 md:p-6" style={{ backgroundColor: '#F9FAFB' }}>
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 style={{
                fontSize: '30px',
                fontWeight: '600',
                color: '#101828',
                marginBottom: '8px',
              }}>
                My Patients
              </h1>
              <p style={{
                fontSize: '16px',
                color: '#475467',
              }}>
                View all patients you've consulted with
              </p>
            </div>

            {/* Loading State */}
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="loading-spinner" style={{ width: '40px', height: '40px', borderWidth: '4px' }}></div>
              </div>
            ) : (
              <>
                {/* Patient List */}
                {myConversations.length > 0 ? (
                  <div className="flex flex-col gap-4">
                    {myConversations.map((conversation) => (
                      <div
                        key={conversation.id || conversation._id}
                        onClick={() => handleSelectConversation(conversation)}
                        className="card card-interactive"
                      >
                        <div className="card-body">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 flex-1">
                              <div
                                className="avatar avatar-lg"
                                style={{
                                  background: 'linear-gradient(135deg, #039855 0%, #027A48 100%)',
                                  color: 'white',
                                }}
                              >
                                <User style={{ width: '24px', height: '24px' }} />
                              </div>
                              <div className="flex-1">
                                <h3 style={{
                                  fontSize: '18px',
                                  fontWeight: '600',
                                  color: '#101828',
                                  marginBottom: '4px',
                                }}>
                                  {conversation.patient?.firstName} {conversation.patient?.lastName}
                                </h3>
                                <div className="flex items-center gap-3 flex-wrap">
                                  <span style={{
                                    fontSize: '14px',
                                    color: '#667085',
                                  }}>
                                    Visit #{conversation.visitNumber}
                                  </span>
                                  <span style={{ color: '#D0D5DD' }}>•</span>
                                  <span style={{
                                    fontSize: '14px',
                                    color: '#667085',
                                  }}>
                                    {formatDate(conversation.createdAt)}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              {getStatusBadge(conversation.status)}
                              <ArrowRight style={{ width: '20px', height: '20px', color: '#667085' }} />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="card text-center">
                    <div className="card-body" style={{ padding: 'var(--space-12)' }}>
                      <Users style={{
                        width: '64px',
                        height: '64px',
                        color: '#D0D5DD',
                        margin: '0 auto var(--space-4)',
                      }} />
                      <h3 style={{
                        fontSize: '20px',
                        fontWeight: '600',
                        color: '#101828',
                        marginBottom: '8px',
                      }}>
                        No Patients Yet
                      </h3>
                      <p style={{
                        fontSize: '16px',
                        color: '#667085',
                      }}>
                        You haven't responded to any patient cases yet.
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default DoctorDashboard;
