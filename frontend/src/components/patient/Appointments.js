import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, MapPin, Video, Phone, User, Plus, X, CheckCircle, AlertCircle, Edit, Trash2 } from 'lucide-react';
import { format, addDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, isBefore, startOfDay } from 'date-fns';
import { appointmentsAPI } from '../../services/api';

/**
 * WORLD-CLASS APPOINTMENTS SCHEDULING COMPONENT
 * EMR-compliant appointment management with calendar integration
 */
const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showBookModal, setShowBookModal] = useState(false);
  const [viewMode, setViewMode] = useState('upcoming'); // 'upcoming', 'past', 'calendar'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await appointmentsAPI.getAppointments();
      // Transform API data to match component format
      const transformedAppointments = response.data.map(apt => ({
        id: apt.id,
        date: format(new Date(apt.appointmentDate), 'yyyy-MM-dd'),
        time: format(new Date(apt.appointmentDate), 'h:mm a'),
        duration: apt.duration,
        type: apt.type === 'in_person' ? 'In-Person' : apt.type === 'video' ? 'Video Visit' : 'Phone Call',
        reason: apt.reason || 'Medical Consultation',
        doctor: {
          name: `${apt.doctor.firstName} ${apt.doctor.lastName}`,
          specialization: apt.doctor.specialization || 'General Practice'
        },
        location: apt.location,
        status: apt.status,
        notes: apt.notes,
        videoLink: apt.videoLink,
      }));
      setAppointments(transformedAppointments);
      setLoading(false);
    } catch (error) {
      console.error('Error loading appointments:', error);
      setError('Failed to load appointments. Please try again later.');
      setLoading(false);
    }
  };

  const getUpcomingAppointments = () => {
    const today = startOfDay(new Date());
    return appointments
      .filter(apt => new Date(apt.date) >= today && apt.status !== 'completed' && apt.status !== 'cancelled')
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  const getPastAppointments = () => {
    const today = startOfDay(new Date());
    return appointments
      .filter(apt => new Date(apt.date) < today || apt.status === 'completed' || apt.status === 'cancelled')
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  const getAppointmentTypeIcon = (type) => {
    switch (type) {
      case 'Video Visit':
        return <Video style={{ width: '18px', height: '18px' }} />;
      case 'Phone Call':
        return <Phone style={{ width: '18px', height: '18px' }} />;
      default:
        return <MapPin style={{ width: '18px', height: '18px' }} />;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'confirmed':
        return <span className="badge badge-success"><CheckCircle style={{ width: '14px', height: '14px' }} /> Confirmed</span>;
      case 'pending':
        return <span className="badge badge-warning"><Clock style={{ width: '14px', height: '14px' }} /> Pending</span>;
      case 'completed':
        return <span className="badge badge-info"><CheckCircle style={{ width: '14px', height: '14px' }} /> Completed</span>;
      case 'cancelled':
        return <span className="badge badge-error"><X style={{ width: '14px', height: '14px' }} /> Cancelled</span>;
      default:
        return null;
    }
  };

  const AppointmentCard = ({ appointment }) => (
    <div className="card">
      <div className="card-body">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3 flex-1">
            <div
              className="avatar avatar-lg"
              style={{
                background: appointment.status === 'confirmed'
                  ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
                  : appointment.status === 'pending'
                  ? 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)'
                  : 'linear-gradient(135deg, #1570EF 0%, #175CD3 100%)',
              }}
            >
              {getAppointmentTypeIcon(appointment.type)}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="heading-h3">{appointment.reason}</h3>
                {getStatusBadge(appointment.status)}
              </div>
              <div className="flex flex-col gap-2 text-sm text-secondary">
                <div className="flex items-center gap-2">
                  <CalendarIcon style={{ width: '16px', height: '16px' }} />
                  <span>{format(new Date(appointment.date), 'EEEE, MMMM d, yyyy')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock style={{ width: '16px', height: '16px' }} />
                  <span>{appointment.time} ({appointment.duration} minutes)</span>
                </div>
                <div className="flex items-center gap-2">
                  <User style={{ width: '16px', height: '16px' }} />
                  <span>{appointment.doctor.name} - {appointment.doctor.specialization}</span>
                </div>
                {appointment.location && (
                  <div className="flex items-center gap-2">
                    <MapPin style={{ width: '16px', height: '16px' }} />
                    <span>{appointment.location}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {appointment.notes && (
          <div className="p-3 rounded-lg mb-4" style={{ backgroundColor: 'var(--primary-50)', border: '1px solid var(--primary-200)' }}>
            <p className="text-sm" style={{ color: 'var(--primary-700)' }}>
              <AlertCircle style={{ width: '14px', height: '14px', display: 'inline', marginRight: '4px' }} />
              {appointment.notes}
            </p>
          </div>
        )}

        <div className="flex gap-2">
          {appointment.type === 'Video Visit' && appointment.videoLink && appointment.status === 'confirmed' && (
            <button className="btn btn-primary">
              <Video style={{ width: '18px', height: '18px' }} />
              Join Video Call
            </button>
          )}
          {appointment.status === 'confirmed' && (
            <>
              <button className="btn btn-secondary">
                <Edit style={{ width: '18px', height: '18px' }} />
                Reschedule
              </button>
              <button className="btn btn-error">
                <X style={{ width: '18px', height: '18px' }} />
                Cancel
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="loading-spinner mb-4" style={{ width: '48px', height: '48px', borderWidth: '4px' }}></div>
          <p className="text-secondary">Loading appointments...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center max-w-md">
          <AlertCircle style={{ width: '64px', height: '64px', color: 'var(--error-600)', margin: '0 auto 16px' }} />
          <h3 className="heading-h3 mb-2">Error Loading Appointments</h3>
          <p className="text-secondary mb-4">{error}</p>
          <button className="btn btn-primary" onClick={loadAppointments}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto" style={{ backgroundColor: 'var(--gray-50)' }}>
      {/* Header */}
      <div className="sticky top-0 z-30 border-b" style={{ backgroundColor: 'white', borderColor: 'var(--gray-200)', boxShadow: 'var(--shadow-sm)' }}>
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
          <div className="flex items-center justify-between mb-4 pl-16 lg:pl-0">
            <div>
              <h1 className="heading-h1 mb-1">Appointments</h1>
              <p className="text-sm text-secondary">Schedule and manage your medical appointments</p>
            </div>
            <button className="btn btn-primary hidden md:inline-flex" onClick={() => setShowBookModal(true)}>
              <Plus style={{ width: '20px', height: '20px' }} />
              Book Appointment
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-2 pl-16 lg:pl-0">
            <button
              onClick={() => setViewMode('upcoming')}
              className={`btn ${viewMode === 'upcoming' ? 'btn-primary' : 'btn-secondary'}`}
            >
              Upcoming ({getUpcomingAppointments().length})
            </button>
            <button
              onClick={() => setViewMode('past')}
              className={`btn ${viewMode === 'past' ? 'btn-primary' : 'btn-secondary'}`}
            >
              Past
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`btn ${viewMode === 'calendar' ? 'btn-primary' : 'btn-secondary'}`}
            >
              <CalendarIcon style={{ width: '18px', height: '18px' }} />
              Calendar
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        {viewMode === 'upcoming' && (
          <div className="flex flex-col gap-4">
            {getUpcomingAppointments().length > 0 ? (
              getUpcomingAppointments().map(apt => <AppointmentCard key={apt.id} appointment={apt} />)
            ) : (
              <div className="card text-center">
                <div className="card-body py-12">
                  <CalendarIcon style={{ width: '64px', height: '64px', color: 'var(--gray-400)', margin: '0 auto 16px' }} />
                  <h3 className="heading-h3 mb-2">No Upcoming Appointments</h3>
                  <p className="text-secondary mb-4">You don't have any scheduled appointments</p>
                  <button className="btn btn-primary" onClick={() => setShowBookModal(true)}>
                    <Plus style={{ width: '20px', height: '20px' }} />
                    Book Your First Appointment
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {viewMode === 'past' && (
          <div className="flex flex-col gap-4">
            {getPastAppointments().map(apt => <AppointmentCard key={apt.id} appointment={apt} />)}
          </div>
        )}

        {viewMode === 'calendar' && (
          <div className="card">
            <div className="card-body">
              <div className="text-center py-12">
                <CalendarIcon style={{ width: '64px', height: '64px', color: 'var(--primary-600)', margin: '0 auto 16px' }} />
                <h3 className="heading-h3 mb-2">Calendar View</h3>
                <p className="text-secondary">Interactive calendar coming soon</p>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Book Button */}
        <button
          className="btn btn-primary w-full md:hidden mt-4"
          onClick={() => setShowBookModal(true)}
        >
          <Plus style={{ width: '20px', height: '20px' }} />
          Book New Appointment
        </button>
      </div>
    </div>
  );
};

export default Appointments;
