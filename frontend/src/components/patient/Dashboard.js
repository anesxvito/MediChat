import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { patientAPI } from '../../services/api';
import socketService from '../../services/socket';
import { toast } from 'react-toastify';
import DashboardLayout from '../shared/DashboardLayout';
import Chatbot from './Chatbot';
import Settings from './Settings';
import Prescriptions from './Prescriptions';
import LabResults from './LabResults';
import VitalSigns from './VitalSigns';
import Appointments from './Appointments';
import Messages from './Messages';
import Documents from './Documents';
import CarePlans from './CarePlans';
import Billing from './Billing';
import {
  MessageSquare,
  Bell,
  Clock,
  Settings as SettingsIcon,
  Archive,
  Trash2,
  Search,
  MoreVertical,
  RefreshCw,
  CheckCircle,
  User,
  Calendar,
  FileText,
  Plus,
  Pill,
  FlaskConical,
  Activity,
  Send,
  FolderOpen,
  Target,
  DollarSign,
  Heart,
} from 'lucide-react';

const PatientDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('chat');
  const [conversations, setConversations] = useState([]);
  const [filteredConversations, setFilteredConversations] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [showConversationEnd, setShowConversationEnd] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showArchived, setShowArchived] = useState(false);
  const [menuOpen, setMenuOpen] = useState(null);

  useEffect(() => {
    loadConversations();
    loadNotifications();
  }, [showArchived]);

  useEffect(() => {
    filterConversations();
  }, [conversations, searchQuery, filterStatus]);

  useEffect(() => {
    // Listen for prescription tab switch events from Chatbot
    const handleSwitchToPrescriptions = () => {
      setActiveTab('prescriptions');
    };

    window.addEventListener('switchToPrescriptions', handleSwitchToPrescriptions);
    return () => {
      window.removeEventListener('switchToPrescriptions', handleSwitchToPrescriptions);
    };
  }, []);

  // Socket.IO connection and real-time notifications
  useEffect(() => {
    if (!user?.id) return;

    console.log('Setting up Socket.IO connection for user:', user.id);

    // Connect to Socket.IO server
    socketService.connect(user.id);

    // Listen for new notifications
    const handleNewNotification = (notification) => {
      console.log('✅ New notification received:', notification);

      // Reload notifications to update the list
      loadNotifications();

      // Show toast notification
      toast.info(
        <div>
          <strong>New Response from Doctor</strong>
          <p style={{ margin: '4px 0 0 0', fontSize: '14px' }}>
            {notification.message}
          </p>
        </div>,
        {
          position: 'top-right',
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        }
      );

      // Reload conversations to show updated status
      loadConversations();
    };

    socketService.on('new_notification', handleNewNotification);

    // Cleanup on unmount
    return () => {
      socketService.off('new_notification', handleNewNotification);
      socketService.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const loadConversations = async () => {
    try {
      const response = await patientAPI.getConversations(showArchived);
      setConversations(response.data.conversations || []);
    } catch (error) {
      console.error('Error loading conversations:', error);
      setConversations([]);
    }
  };

  const loadNotifications = async () => {
    try {
      const response = await patientAPI.getNotifications();
      setNotifications(response.data.notifications || []);
    } catch (error) {
      console.error('Error loading notifications:', error);
      setNotifications([]);
    }
  };

  const filterConversations = () => {
    let filtered = conversations || [];

    if (searchQuery) {
      filtered = filtered.filter((conv) => {
        const date = new Date(conv.createdAt).toLocaleDateString();
        const status = conv.status.toLowerCase();
        return date.includes(searchQuery.toLowerCase()) || status.includes(searchQuery.toLowerCase());
      });
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter((conv) => conv.status === filterStatus);
    }

    setFilteredConversations(filtered);
  };

  const handleConversationEnd = (conversationId) => {
    setShowConversationEnd(true);
    loadConversations();
  };

  const startNewConversation = () => {
    setSelectedConversation(null);
    setShowConversationEnd(false);
    setActiveTab('chat');
  };

  const viewConversation = async (conversation) => {
    setSelectedConversation(conversation);
    setShowConversationEnd(false);
    setActiveTab('chat');

    if (conversation.status === 'doctor_responded' && conversation.patientNotified) {
      const conversationId = conversation.id || conversation._id;
      if (conversationId) {
        await patientAPI.markAsRead(conversationId);
        loadNotifications();
      }
    }
  };

  const handleArchive = async (conversationId, e) => {
    e.stopPropagation();
    try {
      await patientAPI.archiveConversation(conversationId);
      loadConversations();
      setMenuOpen(null);
    } catch (error) {
      console.error('Error archiving conversation:', error);
    }
  };

  const handleUnarchive = async (conversationId, e) => {
    e.stopPropagation();
    try {
      await patientAPI.unarchiveConversation(conversationId);
      loadConversations();
      setMenuOpen(null);
    } catch (error) {
      console.error('Error unarchiving conversation:', error);
    }
  };

  const handleDelete = async (conversationId, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this conversation? This action cannot be undone.')) {
      return;
    }

    try {
      await patientAPI.deleteConversation(conversationId);
      loadConversations();
      setMenuOpen(null);
    } catch (error) {
      console.error('Error deleting conversation:', error);
      alert(error.response?.data?.error || 'Failed to delete conversation');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      in_progress: { label: 'In Progress', class: 'badge-primary' },
      awaiting_doctor: { label: 'Awaiting Doctor', class: 'badge-warning' },
      doctor_responded: { label: 'Completed', class: 'badge-success' },
    };

    const config = statusConfig[status] || { label: status, class: 'badge-gray' };

    return <span className={`badge ${config.class}`}>{config.label}</span>;
  };

  // Navigation items for sidebar - FULL EMR SUITE
  const navigationItems = [
    {
      id: 'chat',
      label: 'AI Consultation',
      icon: <MessageSquare style={{ width: '20px', height: '20px' }} />,
      badge: 0,
    },
    {
      id: 'appointments',
      label: 'Appointments',
      icon: <Calendar style={{ width: '20px', height: '20px' }} />,
      badge: 0,
    },
    {
      id: 'messages',
      label: 'Messages',
      icon: <Send style={{ width: '20px', height: '20px' }} />,
      badge: 0,
    },
    {
      id: 'lab-results',
      label: 'Lab Results',
      icon: <FlaskConical style={{ width: '20px', height: '20px' }} />,
      badge: 0,
    },
    {
      id: 'vital-signs',
      label: 'Vital Signs',
      icon: <Activity style={{ width: '20px', height: '20px' }} />,
      badge: 0,
    },
    {
      id: 'prescriptions',
      label: 'Prescriptions',
      icon: <Pill style={{ width: '20px', height: '20px' }} />,
      badge: 0,
    },
    {
      id: 'care-plans',
      label: 'Care Plans',
      icon: <Target style={{ width: '20px', height: '20px' }} />,
      badge: 0,
    },
    {
      id: 'documents',
      label: 'Documents',
      icon: <FolderOpen style={{ width: '20px', height: '20px' }} />,
      badge: 0,
    },
    {
      id: 'billing',
      label: 'Billing',
      icon: <DollarSign style={{ width: '20px', height: '20px' }} />,
      badge: 0,
    },
    {
      id: 'history',
      label: 'History',
      icon: <Clock style={{ width: '20px', height: '20px' }} />,
      badge: 0,
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: <Bell style={{ width: '20px', height: '20px' }} />,
      badge: (notifications || []).length,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <SettingsIcon style={{ width: '20px', height: '20px' }} />,
      badge: 0,
    },
  ];

  // Stats for sidebar
  const stats = [
    {
      label: 'Total Consultations',
      value: (conversations || []).length,
      icon: <FileText style={{ width: '18px', height: '18px' }} />,
      bgColor: 'var(--primary-50)',
      borderColor: 'var(--primary-200)',
      iconColor: 'var(--primary-600)',
      valueColor: 'var(--primary-700)',
    },
  ];

  return (
    <DashboardLayout
      user={user}
      navigationItems={navigationItems}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      logout={logout}
      stats={stats}
      notifications={(notifications || []).length}
      brandColor="var(--primary-600)"
      role="Patient"
    >
      {/* Chat Tab */}
      {activeTab === 'chat' && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div
            className="p-6 border-b flex items-center justify-between"
            style={{
              backgroundColor: 'white',
              borderColor: '#EAECF0',
            }}
          >
            <div>
              <h2 style={{
                fontSize: '20px',
                fontWeight: '600',
                color: '#101828',
                lineHeight: '1.25',
              }}>
                Medical Assistant Chat
              </h2>
              <p style={{
                fontSize: '14px',
                color: '#475467',
                marginTop: '4px',
              }}>
                Get professional medical advice from our AI assistant
              </p>
            </div>
            {selectedConversation && (
              <button onClick={startNewConversation} className="btn btn-primary hidden sm:flex">
                <Plus style={{ width: '20px', height: '20px' }} />
                New Conversation
              </button>
            )}
          </div>

          {/* Content */}
          {showConversationEnd ? (
            <div className="flex-1 flex items-center justify-center p-6">
              <div className="card max-w-md w-full text-center animate-fadeIn">
                <div className="card-body" style={{ padding: 'var(--space-10)' }}>
                  <div
                    className="inline-flex items-center justify-center mb-6 mx-auto"
                    style={{
                      width: '88px',
                      height: '88px',
                      background: 'linear-gradient(135deg, var(--success-600) 0%, var(--success-700) 100%)',
                      borderRadius: 'var(--radius-full)',
                    }}
                  >
                    <CheckCircle style={{ width: '48px', height: '48px', color: 'white' }} />
                  </div>
                  <h3 className="display-lg mb-4">Thank You!</h3>
                  <p className="text-md text-secondary mb-8">
                    Your information has been sent to a doctor. You will receive a response soon with recommendations or next steps.
                  </p>
                  <button onClick={startNewConversation} className="btn btn-primary btn-lg w-full">
                    Start New Conversation
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <Chatbot
              conversationId={selectedConversation?.id || selectedConversation?._id}
              onConversationEnd={handleConversationEnd}
            />
          )}
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8 pl-16 lg:pl-0">
              <div>
                <h2 className="heading-h1">Conversation History</h2>
                <p className="text-sm text-secondary mt-1">View and manage your past consultations</p>
              </div>
              <button
                onClick={() => setShowArchived(!showArchived)}
                className="btn btn-secondary"
              >
                <Archive style={{ width: '20px', height: '20px' }} />
                {showArchived ? 'Hide Archived' : 'Show Archived'}
              </button>
            </div>

            {/* Search and Filter */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="relative">
                <Search
                  style={{
                    position: 'absolute',
                    left: 'var(--space-3)',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '20px',
                    height: '20px',
                    color: 'var(--gray-400)',
                  }}
                />
                <input
                  type="text"
                  placeholder="Search by date or status..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: 'var(--space-10)' }}
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="form-input"
              >
                <option value="all">All Status</option>
                <option value="in_progress">In Progress</option>
                <option value="awaiting_doctor">Awaiting Doctor</option>
                <option value="doctor_responded">Completed</option>
              </select>
            </div>

            {/* Conversations List */}
            <div className="flex flex-col gap-4">
              {filteredConversations.map((conv) => (
                <div
                  key={conv.id || conv._id}
                  onClick={() => viewConversation(conv)}
                  className="card card-interactive"
                >
                  <div className="card-body">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3 flex-wrap">
                          <h3 className="heading-h3">Visit #{conv.visitNumber}</h3>
                          {getStatusBadge(conv.status)}
                          {conv.archivedByPatient && (
                            <span className="badge badge-gray">
                              <Archive style={{ width: '14px', height: '14px' }} />
                              Archived
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-sm text-secondary mb-4">
                          <Calendar style={{ width: '16px', height: '16px' }} />
                          {new Date(conv.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>

                        {conv.doctorResponse && (
                          <div
                            className="p-4 rounded-lg"
                            style={{
                              backgroundColor: 'var(--success-50)',
                              border: '1px solid var(--success-200)',
                            }}
                          >
                            <p className="text-sm font-semibold text-primary mb-2">Doctor's Response:</p>
                            <p className="text-sm text-secondary line-clamp-2">
                              {conv.doctorResponse.diagnosis || conv.doctorResponse.recommendations}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Action Menu */}
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setMenuOpen(menuOpen === conv._id ? null : conv._id);
                          }}
                          className="btn btn-ghost btn-icon"
                        >
                          <MoreVertical style={{ width: '20px', height: '20px' }} />
                        </button>

                        {menuOpen === conv._id && (
                          <div
                            className="card absolute right-0 top-full mt-2 w-48 z-10"
                            style={{ padding: 'var(--space-2)' }}
                          >
                            {conv.archivedByPatient ? (
                              <button
                                onClick={(e) => handleUnarchive(conv._id, e)}
                                className="btn btn-ghost w-full justify-start"
                              >
                                <RefreshCw style={{ width: '18px', height: '18px' }} />
                                Unarchive
                              </button>
                            ) : (
                              <button
                                onClick={(e) => handleArchive(conv._id, e)}
                                className="btn btn-ghost w-full justify-start"
                              >
                                <Archive style={{ width: '18px', height: '18px' }} />
                                Archive
                              </button>
                            )}
                            {conv.status !== 'doctor_responded' && (
                              <button
                                onClick={(e) => handleDelete(conv._id, e)}
                                className="btn btn-ghost w-full justify-start"
                                style={{ color: 'var(--error-600)' }}
                              >
                                <Trash2 style={{ width: '18px', height: '18px' }} />
                                Delete
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {filteredConversations.length === 0 && (
                <div className="card text-center">
                  <div className="card-body" style={{ padding: 'var(--space-12)' }}>
                    <Clock style={{ width: '64px', height: '64px', color: 'var(--gray-300)', margin: '0 auto var(--space-4)' }} />
                    <p className="text-lg text-secondary">No conversations found</p>
                    <p className="text-sm text-tertiary mt-2">
                      {searchQuery || filterStatus !== 'all'
                        ? 'Try adjusting your search or filters'
                        : 'Start a new chat to begin!'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8 pl-16 lg:pl-0">
              <h2 className="heading-h1">Notifications</h2>
              <p className="text-sm text-secondary mt-1">Stay updated on your consultations</p>
            </div>

            <div className="flex flex-col gap-4">
              {notifications.map((notif) => (
                <div
                  key={notif.id || notif._id}
                  onClick={() => viewConversation(notif)}
                  className="card card-interactive"
                  style={{
                    borderLeft: '4px solid var(--primary-600)',
                  }}
                >
                  <div className="card-body">
                    <div className="flex items-start gap-4">
                      <div
                        className="avatar avatar-lg"
                        style={{
                          background: 'linear-gradient(135deg, var(--primary-100) 0%, var(--primary-200) 100%)',
                          color: 'var(--primary-700)',
                        }}
                      >
                        <Bell />
                      </div>
                      <div className="flex-1">
                        <h3 className="heading-h4 mb-1">Doctor Response Received</h3>
                        <p className="text-sm text-secondary mb-2">
                          Dr. {notif.doctor?.firstName} {notif.doctor?.lastName} has responded to your consultation
                        </p>
                        <p className="text-xs text-tertiary">
                          {new Date(notif.doctorResponse.respondedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {notifications.length === 0 && (
                <div className="card text-center">
                  <div className="card-body" style={{ padding: 'var(--space-12)' }}>
                    <Bell style={{ width: '64px', height: '64px', color: 'var(--gray-300)', margin: '0 auto var(--space-4)' }} />
                    <p className="text-lg text-secondary">No new notifications</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Prescriptions Tab */}
      {activeTab === 'prescriptions' && <Prescriptions />}

      {/* Appointments Tab */}
      {activeTab === 'appointments' && <Appointments />}

      {/* Messages Tab */}
      {activeTab === 'messages' && <Messages />}

      {/* Lab Results Tab */}
      {activeTab === 'lab-results' && <LabResults />}

      {/* Vital Signs Tab */}
      {activeTab === 'vital-signs' && <VitalSigns />}

      {/* Care Plans Tab */}
      {activeTab === 'care-plans' && <CarePlans />}

      {/* Documents Tab */}
      {activeTab === 'documents' && <Documents />}

      {/* Billing Tab */}
      {activeTab === 'billing' && <Billing />}

      {/* Settings Tab */}
      {activeTab === 'settings' && <Settings />}

      {/* Click outside to close menu */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setMenuOpen(null)}
        />
      )}
    </DashboardLayout>
  );
};

export default PatientDashboard;
