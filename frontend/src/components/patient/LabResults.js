import React, { useState, useEffect } from 'react';
import { labResultsAPI } from '../../services/api';
import {
  FlaskConical,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Calendar,
  Download,
  Filter,
  Search,
  FileText,
  Activity,
  Droplet,
  Heart,
  Zap,
  User,
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

/**
 * WORLD-CLASS LAB RESULTS COMPONENT
 * EMR-compliant laboratory test results with visualization and trending
 */
const LabResults = () => {
  const [labResults, setLabResults] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTest, setSelectedTest] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'trends'

  // Mock lab results data (in production, this comes from API)
  const mockLabResults = [
    {
      id: 'lab001',
      testName: 'Complete Blood Count (CBC)',
      category: 'Hematology',
      orderedDate: '2025-10-20',
      resultDate: '2025-10-21',
      status: 'completed',
      orderedBy: 'Dr. Sarah Johnson',
      results: [
        { name: 'White Blood Cells', value: 7.2, unit: 'K/uL', referenceRange: '4.5-11.0', status: 'normal' },
        { name: 'Red Blood Cells', value: 4.8, unit: 'M/uL', referenceRange: '4.5-5.5', status: 'normal' },
        { name: 'Hemoglobin', value: 13.5, unit: 'g/dL', referenceRange: '13.5-17.5', status: 'normal' },
        { name: 'Hematocrit', value: 41, unit: '%', referenceRange: '38.8-50.0', status: 'normal' },
        { name: 'Platelets', value: 245, unit: 'K/uL', referenceRange: '150-400', status: 'normal' },
      ],
      history: [
        { date: '2025-10-21', value: 7.2 },
        { date: '2025-09-15', value: 6.8 },
        { date: '2025-08-10', value: 7.0 },
        { date: '2025-07-05', value: 6.9 },
      ],
    },
    {
      id: 'lab002',
      testName: 'Comprehensive Metabolic Panel',
      category: 'Chemistry',
      orderedDate: '2025-10-20',
      resultDate: '2025-10-21',
      status: 'completed',
      orderedBy: 'Dr. Sarah Johnson',
      results: [
        { name: 'Glucose', value: 98, unit: 'mg/dL', referenceRange: '70-100', status: 'normal' },
        { name: 'Sodium', value: 140, unit: 'mmol/L', referenceRange: '136-145', status: 'normal' },
        { name: 'Potassium', value: 4.2, unit: 'mmol/L', referenceRange: '3.5-5.0', status: 'normal' },
        { name: 'Chloride', value: 102, unit: 'mmol/L', referenceRange: '98-107', status: 'normal' },
        { name: 'CO2', value: 25, unit: 'mmol/L', referenceRange: '23-29', status: 'normal' },
        { name: 'Creatinine', value: 0.9, unit: 'mg/dL', referenceRange: '0.7-1.3', status: 'normal' },
        { name: 'BUN', value: 15, unit: 'mg/dL', referenceRange: '7-20', status: 'normal' },
      ],
      history: [
        { date: '2025-10-21', value: 98 },
        { date: '2025-09-15', value: 95 },
        { date: '2025-08-10', value: 92 },
        { date: '2025-07-05', value: 96 },
      ],
    },
    {
      id: 'lab003',
      testName: 'Lipid Panel',
      category: 'Chemistry',
      orderedDate: '2025-10-18',
      resultDate: '2025-10-19',
      status: 'completed',
      orderedBy: 'Dr. Sarah Johnson',
      results: [
        { name: 'Total Cholesterol', value: 195, unit: 'mg/dL', referenceRange: '<200', status: 'normal' },
        { name: 'LDL Cholesterol', value: 115, unit: 'mg/dL', referenceRange: '<100', status: 'high', alert: true },
        { name: 'HDL Cholesterol', value: 55, unit: 'mg/dL', referenceRange: '>40', status: 'normal' },
        { name: 'Triglycerides', value: 125, unit: 'mg/dL', referenceRange: '<150', status: 'normal' },
      ],
      history: [
        { date: '2025-10-19', value: 195 },
        { date: '2025-07-15', value: 205 },
        { date: '2025-04-10', value: 210 },
        { date: '2025-01-05', value: 215 },
      ],
    },
    {
      id: 'lab004',
      testName: 'Thyroid Function Tests',
      category: 'Endocrinology',
      orderedDate: '2025-10-15',
      resultDate: '2025-10-16',
      status: 'completed',
      orderedBy: 'Dr. Sarah Johnson',
      results: [
        { name: 'TSH', value: 2.5, unit: 'mIU/L', referenceRange: '0.4-4.0', status: 'normal' },
        { name: 'Free T4', value: 1.2, unit: 'ng/dL', referenceRange: '0.8-1.8', status: 'normal' },
        { name: 'Free T3', value: 3.2, unit: 'pg/mL', referenceRange: '2.3-4.2', status: 'normal' },
      ],
      history: [
        { date: '2025-10-16', value: 2.5 },
        { date: '2025-07-10', value: 2.3 },
        { date: '2025-04-05', value: 2.4 },
      ],
    },
    {
      id: 'lab005',
      testName: 'Vitamin D',
      category: 'Nutrition',
      orderedDate: '2025-10-10',
      resultDate: '2025-10-12',
      status: 'completed',
      orderedBy: 'Dr. Sarah Johnson',
      results: [
        { name: 'Vitamin D, 25-Hydroxy', value: 28, unit: 'ng/mL', referenceRange: '30-100', status: 'low', alert: true },
      ],
      history: [
        { date: '2025-10-12', value: 28 },
        { date: '2025-04-15', value: 25 },
        { date: '2024-10-20', value: 22 },
      ],
    },
  ];

  useEffect(() => {
    loadLabResults();
  }, []);

  useEffect(() => {
    filterResults();
  }, [labResults, searchQuery, filterCategory]);

  const loadLabResults = async () => {
    setLoading(true);
    try {
      const response = await labResultsAPI.getLabResults();
      // Group results by test name and transform data
      const groupedResults = {};
      response.data.forEach(result => {
        if (!groupedResults[result.testName]) {
          groupedResults[result.testName] = {
            id: result.id,
            testName: result.testName,
            category: result.category.charAt(0).toUpperCase() + result.category.slice(1),
            orderedDate: result.collectionDate || result.resultDate,
            resultDate: result.resultDate,
            status: 'completed',
            orderedBy: `Dr. ${result.orderedBy || 'Unknown'}`,
            results: [],
            history: []
          };
        }

        groupedResults[result.testName].results.push({
          name: result.testName,
          value: parseFloat(result.numericValue) || result.result,
          unit: result.unit || '',
          referenceRange: result.referenceRange || '',
          status: result.status,
          alert: result.isCritical || result.isAbnormal
        });

        if (result.numericValue) {
          groupedResults[result.testName].history.push({
            date: result.resultDate,
            value: parseFloat(result.numericValue)
          });
        }
      });

      setLabResults(Object.values(groupedResults));
      setLoading(false);
    } catch (error) {
      console.error('Error loading lab results:', error);
      setLoading(false);
    }
  };

  const filterResults = () => {
    let filtered = labResults;

    if (searchQuery) {
      filtered = filtered.filter(lab =>
        lab.testName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lab.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filterCategory !== 'all') {
      filtered = filtered.filter(lab => lab.category === filterCategory);
    }

    setFilteredResults(filtered);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'normal':
        return (
          <span className="badge badge-success">
            <CheckCircle style={{ width: '14px', height: '14px' }} />
            Normal
          </span>
        );
      case 'high':
        return (
          <span className="badge badge-error">
            <TrendingUp style={{ width: '14px', height: '14px' }} />
            High
          </span>
        );
      case 'low':
        return (
          <span className="badge badge-warning">
            <TrendingDown style={{ width: '14px', height: '14px' }} />
            Low
          </span>
        );
      default:
        return null;
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Hematology':
        return <Droplet style={{ width: '20px', height: '20px' }} />;
      case 'Chemistry':
        return <FlaskConical style={{ width: '20px', height: '20px' }} />;
      case 'Endocrinology':
        return <Activity style={{ width: '20px', height: '20px' }} />;
      case 'Nutrition':
        return <Heart style={{ width: '20px', height: '20px' }} />;
      default:
        return <FileText style={{ width: '20px', height: '20px' }} />;
    }
  };

  const categories = ['all', ...new Set(labResults.map(lab => lab.category))];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="loading-spinner mb-4" style={{ width: '48px', height: '48px', borderWidth: '4px' }}></div>
          <p className="text-secondary">Loading lab results...</p>
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
              <h1 className="heading-h1 mb-1">Lab Results</h1>
              <p className="text-sm text-secondary">View and track your laboratory test results</p>
            </div>
            <div className="hidden md:flex gap-2">
              <button
                onClick={() => setViewMode('list')}
                className={`btn ${viewMode === 'list' ? 'btn-primary' : 'btn-secondary'}`}
              >
                <FileText style={{ width: '20px', height: '20px' }} />
                List View
              </button>
              <button
                onClick={() => setViewMode('trends')}
                className={`btn ${viewMode === 'trends' ? 'btn-primary' : 'btn-secondary'}`}
              >
                <TrendingUp style={{ width: '20px', height: '20px' }} />
                Trends
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-3 pl-16 lg:pl-0">
            <div className="relative flex-1">
              <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '20px', height: '20px', color: 'var(--gray-400)' }} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search lab tests..."
                className="form-input"
                style={{ paddingLeft: '40px' }}
              />
            </div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="form-input md:w-48"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat === 'all' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        {viewMode === 'list' ? (
          // List View
          <div className="grid grid-cols-1 gap-4">
            {filteredResults.map((lab) => {
              const hasAlerts = lab.results.some(r => r.alert);
              return (
                <div key={lab.id} className="card">
                  <div className="card-body">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex items-start gap-3 flex-1">
                        <div
                          className="avatar avatar-lg"
                          style={{
                            background: hasAlerts
                              ? 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)'
                              : 'linear-gradient(135deg, #1570EF 0%, #175CD3 100%)',
                          }}
                        >
                          {getCategoryIcon(lab.category)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="heading-h3">{lab.testName}</h3>
                            {hasAlerts && (
                              <span className="badge badge-warning">
                                <AlertTriangle style={{ width: '14px', height: '14px' }} />
                                Attention Needed
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-3 text-sm text-secondary">
                            <span className="flex items-center gap-1">
                              <FlaskConical style={{ width: '14px', height: '14px' }} />
                              {lab.category}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar style={{ width: '14px', height: '14px' }} />
                              {new Date(lab.resultDate).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <User style={{ width: '14px', height: '14px' }} />
                              {lab.orderedBy}
                            </span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedTest(selectedTest?.id === lab.id ? null : lab)}
                        className="btn btn-secondary btn-sm"
                      >
                        {selectedTest?.id === lab.id ? 'Hide Details' : 'View Details'}
                      </button>
                    </div>

                    {/* Results Summary */}
                    {!selectedTest || selectedTest.id !== lab.id ? (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {lab.results.slice(0, 4).map((result, idx) => (
                          <div
                            key={idx}
                            className="p-2 rounded-lg border"
                            style={{
                              backgroundColor: result.alert ? 'var(--warning-50)' : 'var(--gray-50)',
                              borderColor: result.alert ? 'var(--warning-200)' : 'var(--gray-200)',
                            }}
                          >
                            <p className="text-xs text-secondary mb-1">{result.name}</p>
                            <p className="font-bold text-gray-900">
                              {result.value} {result.unit}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      // Detailed Results
                      <div className="space-y-3">
                        {lab.results.map((result, idx) => (
                          <div
                            key={idx}
                            className="p-4 rounded-lg border"
                            style={{
                              backgroundColor: result.alert ? 'var(--warning-50)' : 'white',
                              borderColor: result.alert ? 'var(--warning-300)' : 'var(--gray-200)',
                            }}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold text-gray-900">{result.name}</h4>
                              {getStatusBadge(result.status)}
                            </div>
                            <div className="grid grid-cols-3 gap-4 text-sm">
                              <div>
                                <p className="text-secondary mb-1">Result</p>
                                <p className="font-bold text-gray-900">
                                  {result.value} {result.unit}
                                </p>
                              </div>
                              <div>
                                <p className="text-secondary mb-1">Reference Range</p>
                                <p className="font-medium text-gray-700">{result.referenceRange}</p>
                              </div>
                              <div>
                                <p className="text-secondary mb-1">Status</p>
                                <p className="font-medium capitalize" style={{
                                  color: result.status === 'normal' ? 'var(--success-600)' :
                                         result.status === 'high' ? 'var(--error-600)' :
                                         'var(--warning-600)'
                                }}>
                                  {result.status}
                                </p>
                              </div>
                            </div>
                            {result.alert && (
                              <div className="mt-3 p-2 rounded bg-warning-100 border border-warning-300">
                                <p className="text-sm text-warning-800">
                                  <AlertTriangle style={{ width: '14px', height: '14px', display: 'inline', marginRight: '4px' }} />
                                  This value is outside the normal range. Please consult with your doctor.
                                </p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {filteredResults.length === 0 && (
              <div className="card text-center">
                <div className="card-body py-12">
                  <FlaskConical style={{ width: '64px', height: '64px', color: 'var(--gray-400)', margin: '0 auto 16px' }} />
                  <h3 className="heading-h3 mb-2">No Lab Results Found</h3>
                  <p className="text-secondary">
                    {searchQuery || filterCategory !== 'all'
                      ? 'Try adjusting your filters'
                      : 'Your lab results will appear here once available'}
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : (
          // Trends View
          <div className="grid grid-cols-1 gap-6">
            {filteredResults.map((lab) => (
              <div key={lab.id} className="card">
                <div className="card-header">
                  <div className="flex items-center gap-3">
                    <div className="avatar avatar-sm" style={{ background: 'linear-gradient(135deg, #1570EF 0%, #175CD3 100%)' }}>
                      {getCategoryIcon(lab.category)}
                    </div>
                    <div>
                      <h3 className="heading-h3">{lab.testName}</h3>
                      <p className="text-sm text-secondary">{lab.category}</p>
                    </div>
                  </div>
                </div>
                <div className="card-body">
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={lab.history}>
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
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="#1570EF"
                        strokeWidth={3}
                        dot={{ fill: '#1570EF', r: 5 }}
                        activeDot={{ r: 7 }}
                        name={lab.results[0]?.name || 'Value'}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LabResults;
