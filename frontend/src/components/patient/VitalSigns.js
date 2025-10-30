import React, { useState, useEffect } from 'react';
import { vitalSignsAPI } from '../../services/api';
import {
  Activity,
  Heart,
  Thermometer,
  Wind,
  Droplets,
  Weight as WeightIcon,
  TrendingUp,
  TrendingDown,
  Plus,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

/**
 * WORLD-CLASS VITAL SIGNS TRACKING COMPONENT
 * EMR-compliant vital signs monitoring with trending and alerts
 */
const VitalSigns = () => {
  const [vitals, setVitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState('bloodPressure');
  const [timeRange, setTimeRange] = useState('30d'); // '7d', '30d', '90d', '1y'

  // Mock vital signs data
  const mockVitals = [
    {
      date: '2025-10-28',
      time: '08:30',
      bloodPressureSystolic: 120,
      bloodPressureDiastolic: 80,
      heartRate: 72,
      temperature: 98.6,
      respiratoryRate: 16,
      oxygenSaturation: 98,
      weight: 170,
      height: 70,
      bmi: 24.4,
      recordedBy: 'Self-reported',
    },
    {
      date: '2025-10-21',
      time: '09:00',
      bloodPressureSystolic: 118,
      bloodPressureDiastolic: 78,
      heartRate: 70,
      temperature: 98.4,
      respiratoryRate: 15,
      oxygenSaturation: 99,
      weight: 171,
      recordedBy: 'Dr. Sarah Johnson',
    },
    {
      date: '2025-10-14',
      time: '10:15',
      bloodPressureSystolic: 122,
      bloodPressureDiastolic: 82,
      heartRate: 74,
      temperature: 98.5,
      respiratoryRate: 16,
      oxygenSaturation: 98,
      weight: 172,
      recordedBy: 'Nurse Williams',
    },
    {
      date: '2025-10-07',
      time: '14:30',
      bloodPressureSystolic: 119,
      bloodPressureDiastolic: 79,
      heartRate: 71,
      temperature: 98.6,
      respiratoryRate: 15,
      oxygenSaturation: 99,
      weight: 171,
      recordedBy: 'Self-reported',
    },
    {
      date: '2025-09-30',
      time: '08:00',
      bloodPressureSystolic: 121,
      bloodPressureDiastolic: 81,
      heartRate: 73,
      temperature: 98.5,
      respiratoryRate: 16,
      oxygenSaturation: 98,
      weight: 170,
      recordedBy: 'Dr. Sarah Johnson',
    },
  ];

  useEffect(() => {
    loadVitals();
  }, []);

  const loadVitals = async () => {
    setLoading(true);
    try {
      const response = await vitalSignsAPI.getVitalSigns();
      // Transform API data to match component format
      const transformedVitals = response.data.map(vital => ({
        date: vital.measuredAt.split('T')[0],
        time: new Date(vital.measuredAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        bloodPressureSystolic: vital.systolicBp,
        bloodPressureDiastolic: vital.diastolicBp,
        heartRate: vital.heartRate,
        temperature: vital.temperature,
        respiratoryRate: vital.respiratoryRate,
        oxygenSaturation: vital.oxygenSat,
        weight: vital.weight,
        height: vital.height,
        bmi: vital.bmi,
        recordedBy: vital.measuredBy || 'Self-reported',
      }));
      setVitals(transformedVitals);
      setLoading(false);
    } catch (error) {
      console.error('Error loading vitals:', error);
      setLoading(false);
    }
  };

  const vitalMetrics = [
    {
      id: 'bloodPressure',
      name: 'Blood Pressure',
      icon: <Activity style={{ width: '24px', height: '24px' }} />,
      unit: 'mmHg',
      normalRange: '90/60 - 120/80',
      color: '#EF4444',
      bgColor: '#FEE2E2',
      borderColor: '#FECACA',
      getValue: (v) => `${v.bloodPressureSystolic}/${v.bloodPressureDiastolic}`,
      getChartValue: (v) => v.bloodPressureSystolic,
      isAbnormal: (v) => v.bloodPressureSystolic > 130 || v.bloodPressureSystolic < 90 || v.bloodPressureDiastolic > 80 || v.bloodPressureDiastolic < 60,
    },
    {
      id: 'heartRate',
      name: 'Heart Rate',
      icon: <Heart style={{ width: '24px', height: '24px' }} />,
      unit: 'bpm',
      normalRange: '60-100',
      color: '#EF4444',
      bgColor: '#FEE2E2',
      borderColor: '#FECACA',
      getValue: (v) => v.heartRate,
      getChartValue: (v) => v.heartRate,
      isAbnormal: (v) => v.heartRate > 100 || v.heartRate < 60,
    },
    {
      id: 'temperature',
      name: 'Temperature',
      icon: <Thermometer style={{ width: '24px', height: '24px' }} />,
      unit: '°F',
      normalRange: '97.0-99.0',
      color: '#F97316',
      bgColor: '#FFEDD5',
      borderColor: '#FED7AA',
      getValue: (v) => v.temperature,
      getChartValue: (v) => v.temperature,
      isAbnormal: (v) => v.temperature > 99.0 || v.temperature < 97.0,
    },
    {
      id: 'oxygenSaturation',
      name: 'Oxygen Saturation',
      icon: <Wind style={{ width: '24px', height: '24px' }} />,
      unit: '%',
      normalRange: '95-100',
      color: '#3B82F6',
      bgColor: '#DBEAFE',
      borderColor: '#BFDBFE',
      getValue: (v) => v.oxygenSaturation,
      getChartValue: (v) => v.oxygenSaturation,
      isAbnormal: (v) => v.oxygenSaturation < 95,
    },
    {
      id: 'respiratoryRate',
      name: 'Respiratory Rate',
      icon: <Droplets style={{ width: '24px', height: '24px' }} />,
      unit: 'breaths/min',
      normalRange: '12-20',
      color: '#06B6D4',
      bgColor: '#CFFAFE',
      borderColor: '#A5F3FC',
      getValue: (v) => v.respiratoryRate,
      getChartValue: (v) => v.respiratoryRate,
      isAbnormal: (v) => v.respiratoryRate > 20 || v.respiratoryRate < 12,
    },
    {
      id: 'weight',
      name: 'Weight',
      icon: <WeightIcon style={{ width: '24px', height: '24px' }} />,
      unit: 'lbs',
      normalRange: 'Varies',
      color: '#8B5CF6',
      bgColor: '#EDE9FE',
      borderColor: '#DDD6FE',
      getValue: (v) => v.weight,
      getChartValue: (v) => v.weight,
      isAbnormal: (v) => false,
    },
  ];

  const getCurrentMetric = () => vitalMetrics.find(m => m.id === selectedMetric);
  const metric = getCurrentMetric();

  const getLatestValue = (metricId) => {
    if (vitals.length === 0) return null;
    const m = vitalMetrics.find(metric => metric.id === metricId);
    return m.getValue(vitals[0]);
  };

  const getTrend = (metricId) => {
    if (vitals.length < 2) return null;
    const m = vitalMetrics.find(metric => metric.id === metricId);
    const latest = m.getChartValue(vitals[0]);
    const previous = m.getChartValue(vitals[1]);
    return latest > previous ? 'up' : latest < previous ? 'down' : 'stable';
  };

  const getChartData = () => {
    return vitals.map(v => ({
      date: new Date(v.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: metric.getChartValue(v),
      fullDate: v.date,
    })).reverse();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="loading-spinner mb-4" style={{ width: '48px', height: '48px', borderWidth: '4px' }}></div>
          <p className="text-secondary">Loading vital signs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto" style={{ backgroundColor: 'var(--gray-50)' }}>
      {/* Header */}
      <div className="sticky top-0 z-30 border-b" style={{ backgroundColor: 'white', borderColor: 'var(--gray-200)', boxShadow: 'var(--shadow-sm)' }}>
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
          <div className="flex items-center justify-between pl-16 lg:pl-0">
            <div>
              <h1 className="heading-h1 mb-1">Vital Signs</h1>
              <p className="text-sm text-secondary">Track and monitor your vital signs over time</p>
            </div>
            <button className="btn btn-primary hidden md:inline-flex" onClick={() => setShowAddModal(true)}>
              <Plus style={{ width: '20px', height: '20px' }} />
              Add Reading
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        {/* Current Readings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {vitalMetrics.map((m) => {
            const latest = vitals[0];
            const value = getLatestValue(m.id);
            const trend = getTrend(m.id);
            const isAbnormal = latest && m.isAbnormal(latest);

            return (
              <div
                key={m.id}
                className="card cursor-pointer transition-all"
                onClick={() => setSelectedMetric(m.id)}
                style={{
                  borderWidth: '2px',
                  borderColor: selectedMetric === m.id ? m.color : 'var(--gray-200)',
                  backgroundColor: selectedMetric === m.id ? m.bgColor : 'white',
                }}
              >
                <div className="card-body">
                  <div className="flex items-start justify-between mb-3">
                    <div
                      className="avatar avatar-md"
                      style={{
                        backgroundColor: m.bgColor,
                        color: m.color,
                        border: `2px solid ${m.borderColor}`,
                      }}
                    >
                      {m.icon}
                    </div>
                    {isAbnormal && (
                      <AlertCircle style={{ width: '20px', height: '20px', color: 'var(--warning-600)' }} />
                    )}
                  </div>
                  <h3 className="text-sm font-medium text-secondary mb-1">{m.name}</h3>
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-3xl font-bold text-gray-900 mb-1">
                        {value || 'N/A'}
                      </p>
                      <p className="text-xs text-secondary">{m.unit}</p>
                    </div>
                    {trend && (
                      <div className="flex items-center gap-1">
                        {trend === 'up' ? (
                          <TrendingUp style={{ width: '16px', height: '16px', color: 'var(--success-600)' }} />
                        ) : trend === 'down' ? (
                          <TrendingDown style={{ width: '16px', height: '16px', color: 'var(--error-600)' }} />
                        ) : null}
                      </div>
                    )}
                  </div>
                  <div className="mt-3 pt-3 border-t" style={{ borderColor: m.borderColor }}>
                    <p className="text-xs text-secondary">Normal: {m.normalRange}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Trend Chart */}
        {vitals.length > 0 && (
          <div className="card mb-6">
            <div className="card-header">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="avatar avatar-sm"
                    style={{
                      backgroundColor: metric.bgColor,
                      color: metric.color,
                    }}
                  >
                    {metric.icon}
                  </div>
                  <div>
                    <h3 className="heading-h3">{metric.name} Trend</h3>
                    <p className="text-sm text-secondary">Last 30 days</p>
                  </div>
                </div>
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="form-input w-32"
                >
                  <option value="7d">7 Days</option>
                  <option value="30d">30 Days</option>
                  <option value="90d">90 Days</option>
                  <option value="1y">1 Year</option>
                </select>
              </div>
            </div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={getChartData()}>
                  <defs>
                    <linearGradient id={`color${metric.id}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={metric.color} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={metric.color} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis
                    dataKey="date"
                    stroke="#6B7280"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis stroke="#6B7280" style={{ fontSize: '12px' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke={metric.color}
                    strokeWidth={3}
                    fillOpacity={1}
                    fill={`url(#color${metric.id})`}
                    name={metric.name}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Recent Readings Table */}
        <div className="card">
          <div className="card-header">
            <h3 className="heading-h3">Recent Readings</h3>
          </div>
          <div className="card-body p-0">
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Date & Time</th>
                    <th>Blood Pressure</th>
                    <th>Heart Rate</th>
                    <th>Temperature</th>
                    <th>O2 Sat</th>
                    <th>Recorded By</th>
                  </tr>
                </thead>
                <tbody>
                  {vitals.map((vital, idx) => (
                    <tr key={idx}>
                      <td>
                        <div className="flex items-center gap-2">
                          <Calendar style={{ width: '16px', height: '16px', color: 'var(--gray-400)' }} />
                          <div>
                            <p className="font-medium text-gray-900">
                              {new Date(vital.date).toLocaleDateString()}
                            </p>
                            <p className="text-xs text-secondary">{vital.time}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={vital.bloodPressureSystolic > 130 ? 'text-error-600 font-semibold' : ''}>
                          {vital.bloodPressureSystolic}/{vital.bloodPressureDiastolic}
                        </span>
                      </td>
                      <td>
                        <span className={vital.heartRate > 100 || vital.heartRate < 60 ? 'text-error-600 font-semibold' : ''}>
                          {vital.heartRate} bpm
                        </span>
                      </td>
                      <td>
                        <span className={vital.temperature > 99.0 || vital.temperature < 97.0 ? 'text-error-600 font-semibold' : ''}>
                          {vital.temperature}°F
                        </span>
                      </td>
                      <td>
                        <span className={vital.oxygenSaturation < 95 ? 'text-error-600 font-semibold' : ''}>
                          {vital.oxygenSaturation}%
                        </span>
                      </td>
                      <td>
                        <span className="text-sm text-secondary">{vital.recordedBy}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Mobile Add Button */}
        <button
          className="btn btn-primary w-full md:hidden mt-4"
          onClick={() => setShowAddModal(true)}
        >
          <Plus style={{ width: '20px', height: '20px' }} />
          Add New Reading
        </button>
      </div>
    </div>
  );
};

export default VitalSigns;
