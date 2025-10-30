import React, { useState, useEffect } from 'react';
import { LogOut, Menu, X } from 'lucide-react';

/**
 * WORLD-CLASS DASHBOARD LAYOUT - COMPLETELY REDESIGNED
 * Professional medical portal with vibrant colors and clear visibility
 */
const DashboardLayout = ({
  children,
  user,
  navigationItems,
  activeTab,
  setActiveTab,
  logout,
  stats = [],
  notifications = 0,
  brandColor = 'var(--primary-600)',
  role = 'Patient',
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [imageLoadError, setImageLoadError] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      // For medical professional applications, keep sidebar open on desktop by default
      if (!mobile) {
        setSidebarOpen(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const getInitials = () => {
    if (!user) return '?';
    const first = user.firstName?.[0] || '';
    const last = user.lastName?.[0] || '';
    return (first + last).toUpperCase();
  };

  return (
    <div className="flex h-screen" style={{ backgroundColor: 'var(--gray-50)' }}>
      {/* Mobile Menu Button - Professional Medical Dashboard Navigation */}
      {isMobile && (
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="fixed top-4 left-4 z-50 shadow-xl"
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #1570EF 0%, #175CD3 100%)',
            color: '#FFFFFF',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 10px 15px -3px rgba(21, 112, 239, 0.3), 0 4px 6px -2px rgba(21, 112, 239, 0.2)',
          }}
          aria-label={sidebarOpen ? 'Close navigation menu' : 'Open navigation menu'}
        >
          {sidebarOpen ? <X style={{ width: '24px', height: '24px' }} /> : <Menu style={{ width: '24px', height: '24px' }} />}
        </button>
      )}

      {/* Overlay for mobile - Professional dimming */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black z-40"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* MEDICAL PROFESSIONAL SIDEBAR - Always visible on desktop, smooth mobile toggle */}
      <div
        className="flex flex-col w-80 shadow-2xl border-r"
        style={{
          backgroundColor: 'white',
          borderColor: '#D0D5DD',
          position: isMobile ? 'fixed' : 'relative',
          top: 0,
          left: isMobile ? (sidebarOpen ? 0 : '-320px') : 0,
          height: '100vh',
          zIndex: isMobile ? 45 : 10,
          transition: 'left 300ms cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: isMobile && sidebarOpen
            ? '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
            : '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        }}
      >
        {/* Compact Brand Header */}
        <div
          className="p-4 border-b"
          style={{
            borderColor: '#EAECF0',
            background: 'linear-gradient(135deg, #1570EF 0%, #175CD3 100%)',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          }}
        >
          <h1 style={{
            fontSize: '20px',
            fontWeight: '700',
            color: '#FFFFFF',
            marginBottom: '2px',
          }}>
            MediChat
          </h1>
          <p style={{
            fontSize: '13px',
            color: '#FFFFFF',
            fontWeight: '500',
            opacity: 0.95,
          }}>
            {role} Portal
          </p>
        </div>

        {/* Compact User Profile */}
        <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--gray-200)' }}>
          <div className="flex items-center gap-3">
            <div
              className="avatar font-bold text-white"
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: (user?.profilePhoto && !imageLoadError) ? 'transparent' : `linear-gradient(135deg, ${brandColor} 0%, ${brandColor}dd 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                overflow: 'hidden',
                border: (user?.profilePhoto && !imageLoadError) ? '2px solid var(--primary-200)' : 'none',
              }}
            >
              {(user?.profilePhoto && !imageLoadError) ? (
                <img
                  src={`http://localhost:5000${user.profilePhoto}`}
                  alt={`${user.firstName} ${user.lastName}`}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                  onError={() => setImageLoadError(true)}
                />
              ) : (
                getInitials()
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm text-primary truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-secondary truncate">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Compact Stats Grid - 2 columns for space efficiency */}
        {stats.length > 0 && (
          <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--gray-200)' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '8px'
            }}>
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="p-3 rounded-lg"
                  style={{
                    backgroundColor: stat.bgColor || 'var(--primary-50)',
                    border: `1px solid ${stat.borderColor || 'var(--primary-200)'}`,
                  }}
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1">
                      {stat.icon && <div style={{ color: stat.iconColor, opacity: 0.8 }}>{stat.icon}</div>}
                    </div>
                    <span className="text-xl font-bold" style={{ color: stat.valueColor || brandColor }}>
                      {stat.value}
                    </span>
                    <span className="text-xs font-medium" style={{ color: 'var(--gray-600)', lineHeight: '1.2' }}>
                      {stat.label}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MEDICAL PROFESSIONAL NAVIGATION - Primary focus, always visible */}
        <nav className="flex-1 px-4 py-4 overflow-y-auto">
          <div className="flex flex-col gap-3">
            {navigationItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    if (isMobile) setSidebarOpen(false);
                  }}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm relative"
                  style={{
                    background: isActive
                      ? 'linear-gradient(135deg, #1570EF 0%, #175CD3 100%)'
                      : 'transparent',
                    color: isActive ? '#FFFFFF' : '#344054',
                    boxShadow: isActive
                      ? '0px 12px 16px -4px rgba(16, 24, 40, 0.08), 0px 4px 6px -2px rgba(16, 24, 40, 0.03)'
                      : 'none',
                    transform: isActive ? 'translateX(6px)' : 'translateX(0)',
                    border: isActive ? 'none' : '2px solid transparent',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = '#F9FAFB';
                      e.currentTarget.style.borderColor = '#E5E7EB';
                      e.currentTarget.style.transform = 'translateX(3px)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.borderColor = 'transparent';
                      e.currentTarget.style.transform = 'translateX(0)';
                    }
                  }}
                  aria-current={isActive ? 'page' : undefined}
                  role="tab"
                >
                  <div style={{
                    color: isActive ? '#FFFFFF' : '#1570EF',
                    display: 'flex',
                    alignItems: 'center',
                  }}>
                    {item.icon}
                  </div>
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.badge > 0 && (
                    <span
                      className="badge badge-error font-bold animate-pulse"
                      style={{
                        minWidth: '28px',
                        height: '28px',
                        fontSize: '13px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      aria-label={`${item.badge} notifications`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Compact Logout Button */}
        <div className="px-4 py-3 border-t" style={{ borderColor: 'var(--gray-200)', backgroundColor: 'var(--gray-50)' }}>
          <button
            onClick={logout}
            className="flex items-center gap-2 w-full px-4 py-2 rounded-lg font-semibold text-sm transition-all"
            style={{
              color: 'var(--error-600)',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#FEE2E2';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <LogOut style={{ width: '18px', height: '18px' }} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden flex flex-col w-full lg:w-auto">
        {children}
      </div>
    </div>
  );
};

export default DashboardLayout;
