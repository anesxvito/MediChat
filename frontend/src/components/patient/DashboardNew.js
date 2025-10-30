import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { patientAPI } from '../../services/api';
import Chatbot from './Chatbot';
import Settings from './Settings';
import {
  MessageSquare,
  Bell,
  LogOut,
  User,
  Clock,
  CheckCircle,
  Settings as SettingsIcon,
  Archive,
  Trash2,
  Search,
  Filter,
  MoreVertical,
  X,
  RefreshCw,
  Menu,
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
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    loadConversations();
    loadNotifications();
  }, [showArchived]);

  useEffect(() => {
    filterConversations();
  }, [conversations, searchQuery, filterStatus]);

  const loadConversations = async () => {
    try {
      const response = await patientAPI.getConversations(showArchived);
      setConversations(response.data.conversations);
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  };

  const loadNotifications = async () => {
    try {
      const response = await patientAPI.getNotifications();
      setNotifications(response.data.notifications);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const filterConversations = () => {
    let filtered = conversations;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter((conv) => {
        const date = new Date(conv.createdAt).toLocaleDateString();
        const status = conv.status.toLowerCase();
        return date.includes(searchQuery.toLowerCase()) || status.includes(searchQuery.toLowerCase());
      });
    }

    // Filter by status
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
      await patientAPI.markAsRead(conversation._id);
      loadNotifications();
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
      alert('Failed to archive conversation');
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
      alert('Failed to unarchive conversation');
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'awaiting_doctor':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'doctor_responded':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'in_progress':
        return 'In Progress';
      case 'awaiting_doctor':
        return 'Awaiting Doctor';
      case 'doctor_responded':
        return 'Completed';
      default:
        return status;
    }
  };

  return (
    <div className="flex h-screen" style={{ backgroundColor: '#F7FAFC' }}>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-3 bg-white rounded-lg shadow-lg border border-gray-200"
      >
        {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Professional Sidebar */}
      <div
        className={`
          w-72 shadow-xl border-r
          fixed lg:static inset-y-0 left-0 z-40
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
        style={{ backgroundColor: '#FFFFFF', borderColor: '#E6EDF2' }}
      >
        <div className="p-6 border-b" style={{ borderColor: '#E6EDF2', background: 'linear-gradient(135deg, #0B6FA4 0%, #095A87 100%)' }}>
          <h1 className="text-2xl font-bold text-white">MediChat</h1>
          <p className="text-sm text-white opacity-80 mt-1">Patient Portal</p>
        </div>

        <div className="p-4">
          <div className="mb-6">
            <div className="flex items-center gap-3 p-4 rounded-lg border" style={{ backgroundColor: '#EEF6FA', borderColor: '#E6EDF2' }}>
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md" style={{ background: 'linear-gradient(135deg, #0B6FA4 0%, #095A87 100%)' }}>
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate" style={{ color: '#0F1724' }}>
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs truncate" style={{ color: '#6B7280' }}>{user?.email}</p>
              </div>
            </div>
          </div>

          <nav className="space-y-2">
            <button
              onClick={() => setActiveTab('chat')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all font-medium ${
                activeTab === 'chat'
                  ? 'shadow-md'
                  : 'hover:bg-opacity-50'
              }`}
              style={activeTab === 'chat'
                ? { background: 'linear-gradient(135deg, #0B6FA4 0%, #095A87 100%)', color: '#FFFFFF' }
                : { color: '#0F1724', backgroundColor: 'transparent' }
              }
              onMouseEnter={(e) => {
                if (activeTab !== 'chat') {
                  e.currentTarget.style.backgroundColor = '#F7FAFC';
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== 'chat') {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              <MessageSquare className="w-5 h-5" />
              <span>Chat</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all font-medium ${
                activeTab === 'history'
                  ? 'shadow-md'
                  : 'hover:bg-opacity-50'
              }`}
              style={activeTab === 'history'
                ? { background: 'linear-gradient(135deg, #0B6FA4 0%, #095A87 100%)', color: '#FFFFFF' }
                : { color: '#0F1724', backgroundColor: 'transparent' }
              }
              onMouseEnter={(e) => {
                if (activeTab !== 'history') {
                  e.currentTarget.style.backgroundColor = '#F7FAFC';
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== 'history') {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              <Clock className="w-5 h-5" />
              <span>History</span>
            </button>

            <button
              onClick={() => setActiveTab('notifications')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all font-medium relative ${
                activeTab === 'notifications'
                  ? 'shadow-md'
                  : 'hover:bg-opacity-50'
              }`}
              style={activeTab === 'notifications'
                ? { background: 'linear-gradient(135deg, #0B6FA4 0%, #095A87 100%)', color: '#FFFFFF' }
                : { color: '#0F1724', backgroundColor: 'transparent' }
              }
              onMouseEnter={(e) => {
                if (activeTab !== 'notifications') {
                  e.currentTarget.style.backgroundColor = '#F7FAFC';
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== 'notifications') {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              <Bell className="w-5 h-5" />
              <span>Notifications</span>
              {notifications.length > 0 && (
                <span className="absolute right-3 top-3 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold animate-pulse" style={{ backgroundColor: '#D64545' }}>
                  {notifications.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all font-medium ${
                activeTab === 'settings'
                  ? 'shadow-md'
                  : 'hover:bg-opacity-50'
              }`}
              style={activeTab === 'settings'
                ? { background: 'linear-gradient(135deg, #0B6FA4 0%, #095A87 100%)', color: '#FFFFFF' }
                : { color: '#0F1724', backgroundColor: 'transparent' }
              }
              onMouseEnter={(e) => {
                if (activeTab !== 'settings') {
                  e.currentTarget.style.backgroundColor = '#F7FAFC';
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== 'settings') {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              <SettingsIcon className="w-5 h-5" />
              <span>Settings</span>
            </button>
          </nav>
        </div>

        <div className="absolute bottom-0 w-72 p-4 border-t border-gray-200 bg-white">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-all font-medium"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden flex flex-col w-full lg:w-auto">
        {activeTab === 'chat' && (
          <>
            <div className="bg-white shadow-sm p-4 md:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-200">
              <div className="pl-12 lg:pl-0">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900">Medical Assistant Chat</h2>
                <p className="text-gray-600 text-sm mt-1">
                  Get professional medical advice from our AI assistant
                </p>
              </div>
              {selectedConversation && (
                <button
                  onClick={startNewConversation}
                  className="w-full sm:w-auto px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r from-teal-600 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all font-medium text-sm md:text-base"
                >
                  New Conversation
                </button>
              )}
            </div>

            {showConversationEnd ? (
              <div className="flex-1 flex items-center justify-center p-4 md:p-8">
                <div className="max-w-md w-full text-center bg-white rounded-2xl md:rounded-3xl shadow-2xl p-6 md:p-12 border border-gray-200">
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-r from-green-400 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6">
                    <CheckCircle className="w-10 h-10 md:w-12 md:h-12 text-white" />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 md:mb-4">Thank You!</h3>
                  <p className="text-gray-600 mb-6 md:mb-8 leading-relaxed text-sm md:text-base">
                    Your information has been sent to a doctor. You will receive a response
                    soon with recommendations or next steps.
                  </p>
                  <button
                    onClick={startNewConversation}
                    className="w-full sm:w-auto px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-teal-600 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all font-medium text-sm md:text-base"
                  >
                    Start New Conversation
                  </button>
                </div>
              </div>
            ) : (
              <Chatbot
                conversationId={selectedConversation?._id}
                onConversationEnd={handleConversationEnd}
              />
            )}
          </>
        )}

        {activeTab === 'history' && (
          <div className="flex-1 overflow-auto p-4 md:p-6">
            <div className="max-w-6xl mx-auto">
              <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="pl-12 lg:pl-0">
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Conversation History</h2>
                  <p className="text-gray-600 mt-1 text-sm md:text-base">View and manage your past consultations</p>
                </div>
                <button
                  onClick={() => setShowArchived(!showArchived)}
                  className="w-full sm:w-auto px-4 py-2 flex items-center justify-center gap-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors text-sm md:text-base"
                >
                  <Archive className="w-4 h-4" />
                  {showArchived ? 'Hide Archived' : 'Show Archived'}
                </button>
              </div>

              {/* Search and Filter */}
              <div className="mb-6 flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search by date or status..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm md:text-base"
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full sm:w-auto px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm md:text-base"
                >
                  <option value="all">All Status</option>
                  <option value="in_progress">In Progress</option>
                  <option value="awaiting_doctor">Awaiting Doctor</option>
                  <option value="doctor_responded">Completed</option>
                </select>
              </div>

              <div className="grid gap-4">
                {filteredConversations.map((conv) => (
                  <div
                    key={conv._id}
                    onClick={() => viewConversation(conv)}
                    className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all cursor-pointer group relative"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="font-semibold text-lg text-gray-900">
                            Visit #{conv.visitNumber}
                          </h3>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                              conv.status
                            )}`}
                          >
                            {getStatusLabel(conv.status)}
                          </span>
                          {conv.archivedByPatient && (
                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                              Archived
                            </span>
                          )}
                        </div>

                        <p className="text-sm text-gray-600 mb-2">
                          {new Date(conv.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>

                        {conv.doctorResponse && (
                          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl">
                            <p className="text-sm font-medium text-gray-900 mb-1">
                              Doctor's Response:
                            </p>
                            <p className="text-sm text-gray-700 line-clamp-2">
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
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <MoreVertical className="w-5 h-5 text-gray-600" />
                        </button>

                        {menuOpen === conv._id && (
                          <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-10">
                            {conv.archivedByPatient ? (
                              <button
                                onClick={(e) => handleUnarchive(conv._id, e)}
                                className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-gray-700"
                              >
                                <RefreshCw className="w-4 h-4" />
                                Unarchive
                              </button>
                            ) : (
                              <button
                                onClick={(e) => handleArchive(conv._id, e)}
                                className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-gray-700"
                              >
                                <Archive className="w-4 h-4" />
                                Archive
                              </button>
                            )}
                            {conv.status !== 'doctor_responded' && (
                              <button
                                onClick={(e) => handleDelete(conv._id, e)}
                                className="w-full px-4 py-2 text-left hover:bg-red-50 flex items-center gap-2 text-red-600"
                              >
                                <Trash2 className="w-4 h-4" />
                                Delete
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {filteredConversations.length === 0 && (
                  <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
                    <Clock className="w-12 h-12 md:w-16 md:h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-base md:text-lg">No conversations found</p>
                    <p className="text-gray-400 text-sm mt-2">
                      {searchQuery || filterStatus !== 'all'
                        ? 'Try adjusting your search or filters'
                        : 'Start a new chat to begin!'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="flex-1 overflow-auto p-4 md:p-6">
            <div className="max-w-4xl mx-auto">
              <div className="pl-12 lg:pl-0">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Notifications</h2>
                <p className="text-gray-600 mb-6 text-sm md:text-base">Stay updated on your consultations</p>
              </div>

              <div className="grid gap-4">
                {notifications.map((notif) => (
                  <div
                    key={notif._id}
                    onClick={() => viewConversation(notif)}
                    className="bg-white rounded-2xl shadow-sm border-l-4 border-teal-500 p-4 md:p-6 hover:shadow-lg transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-teal-100 to-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Bell className="w-5 h-5 md:w-6 md:h-6 text-teal-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-sm md:text-base">Doctor Response Received</h3>
                        <p className="text-xs md:text-sm text-gray-600">
                          Dr. {notif.doctor?.firstName} {notif.doctor?.lastName} has responded
                        </p>
                      </div>
                    </div>

                    <p className="text-xs text-gray-500">
                      {new Date(notif.doctorResponse.respondedAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}

                {notifications.length === 0 && (
                  <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
                    <Bell className="w-12 h-12 md:w-16 md:h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-base md:text-lg">No new notifications</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && <Settings />}
      </div>

      {/* Click outside to close menu */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setMenuOpen(null)}
        />
      )}
    </div>
  );
};

export default PatientDashboard;
