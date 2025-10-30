import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { adminAPI } from '../../services/api';
import DashboardLayout from '../shared/DashboardLayout';
import UserManagement from './UserManagement';
import ActivityLogs from './ActivityLogs';
import SystemStats from './SystemStats';
import {
  Users,
  Activity,
  BarChart3,
  Shield,
  Clock,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

/**
 * WORLD-CLASS ADMIN DASHBOARD
 * Professional system control panel matching patient/doctor dashboard standards
 */
const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('users');
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalDoctors: 0,
    totalConversations: 0,
    pendingConversations: 0,
    completedConversations: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  // Navigation items for admin sidebar
  const navigationItems = [
    {
      id: 'users',
      label: 'User Management',
      icon: <Users style={{ width: '20px', height: '20px' }} />,
      badge: 0,
    },
    {
      id: 'logs',
      label: 'Activity Logs',
      icon: <Activity style={{ width: '20px', height: '20px' }} />,
      badge: 0,
    },
    {
      id: 'stats',
      label: 'System Analytics',
      icon: <BarChart3 style={{ width: '20px', height: '20px' }} />,
      badge: 0,
    },
  ];

  // Stats for admin sidebar
  const adminStats = [
    {
      label: 'Total Patients',
      value: stats.totalPatients,
      icon: <Users style={{ width: '18px', height: '18px' }} />,
      bgColor: '#EFF6FF',
      borderColor: '#DBEAFE',
      iconColor: '#1D4ED8',
    },
    {
      label: 'Total Doctors',
      value: stats.totalDoctors,
      icon: <Shield style={{ width: '18px', height: '18px' }} />,
      bgColor: '#F0FDF4',
      borderColor: '#BBF7D0',
      iconColor: '#15803D',
    },
    {
      label: 'Pending Cases',
      value: stats.pendingConversations,
      icon: <Clock style={{ width: '18px', height: '18px' }} />,
      bgColor: '#FFFAEB',
      borderColor: '#FEF0C7',
      iconColor: '#DC6803',
    },
    {
      label: 'Completed',
      value: stats.completedConversations,
      icon: <CheckCircle style={{ width: '18px', height: '18px' }} />,
      bgColor: '#ECFDF5',
      borderColor: '#D1FAE5',
      iconColor: '#047857',
    },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'users':
        return <UserManagement onUpdate={loadStats} />;
      case 'logs':
        return <ActivityLogs />;
      case 'stats':
        return <SystemStats stats={stats} />;
      default:
        return <UserManagement onUpdate={loadStats} />;
    }
  };

  return (
    <DashboardLayout
      user={user}
      navigationItems={navigationItems}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      logout={logout}
      stats={adminStats}
      brandColor="var(--primary-600)"
      role="Administrator"
    >
      {loading ? (
        <div className="flex items-center justify-center h-full">
          <div className="loading-spinner" style={{ width: '40px', height: '40px', borderWidth: '4px' }}></div>
        </div>
      ) : (
        renderContent()
      )}
    </DashboardLayout>
  );
};

export default AdminDashboard;
