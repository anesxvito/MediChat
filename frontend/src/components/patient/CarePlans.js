import React, { useState, useEffect } from 'react';
import { Target, CheckCircle, Circle, Calendar, User, AlertTriangle, TrendingUp, FileText } from 'lucide-react';
import { carePlansAPI } from '../../services/api';

/**
 * CARE PLANS & TREATMENT TRACKING
 * EMR-compliant care plan management with goal tracking
 */
const CarePlans = () => {
  const [activeTab, setActiveTab] = useState('current');
  const [carePlans, setCarePlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCarePlans();
  }, []);

  const loadCarePlans = async () => {
    setLoading(true);
    try {
      const response = await carePlansAPI.getCarePlans('active');
      const transformedPlans = response.data.map(plan => ({
        id: plan.id,
        title: plan.title,
        doctor: `${plan.doctor.firstName} ${plan.doctor.lastName}`,
        startDate: plan.startDate,
        endDate: plan.targetDate,
        status: plan.status,
        progress: plan.progressPercent,
        goals: plan.goals.map(goal => ({
          id: goal.id,
          text: goal.title,
          completed: goal.status === 'completed',
          progress: goal.progressPercent
        })),
        tasks: plan.tasks.map(task => ({
          id: task.id,
          text: task.title,
          dueDate: task.dueDate,
          status: task.status
        }))
      }));
      setCarePlans(transformedPlans);
      setLoading(false);
    } catch (error) {
      console.error('Error loading care plans:', error);
      setLoading(false);
    }
  };

  const mockCarePlans = [
    {
      id: 'cp1',
      title: 'Hypertension Management Plan',
      doctor: 'Dr. Sarah Johnson',
      startDate: '2025-10-01',
      endDate: '2026-01-01',
      status: 'active',
      progress: 65,
      goals: [
        { id: 'g1', text: 'Reduce blood pressure to below 130/80', completed: false, progress: 70 },
        { id: 'g2', text: 'Daily 30-minute walk', completed: true, progress: 100 },
        { id: 'g3', text: 'Reduce sodium intake to <2000mg/day', completed: false, progress: 60 },
        { id: 'g4', text: 'Take medication as prescribed', completed: true, progress: 100 },
      ],
      tasks: [
        { id: 't1', text: 'Check blood pressure daily', dueDate: 'Daily', status: 'ongoing' },
        { id: 't2', text: 'Follow-up appointment', dueDate: '2025-11-15', status: 'pending' },
        { id: 't3', text: 'Review medication dosage', dueDate: '2025-11-01', status: 'completed' },
      ],
    },
    {
      id: 'cp2',
      title: 'Diabetes Type 2 Management',
      doctor: 'Dr. Michael Chen',
      startDate: '2025-09-15',
      endDate: '2026-03-15',
      status: 'active',
      progress: 45,
      goals: [
        { id: 'g5', text: 'Maintain HbA1c below 7%', completed: false, progress: 50 },
        { id: 'g6', text: 'Monitor blood glucose twice daily', completed: false, progress: 80 },
        { id: 'g7', text: 'Lose 10 pounds', completed: false, progress: 30 },
      ],
      tasks: [
        { id: 't4', text: 'Log blood glucose readings', dueDate: 'Daily', status: 'ongoing' },
        { id: 't5', text: 'Dietary consultation', dueDate: '2025-11-10', status: 'pending' },
      ],
    },
  ];

  const CarePlanCard = ({ plan }) => (
    <div className="card">
      <div className="card-body">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="heading-h3">{plan.title}</h3>
              <span className="badge badge-success">Active</span>
            </div>
            <div className="flex flex-wrap gap-3 text-sm text-secondary">
              <span className="flex items-center gap-1">
                <User style={{ width: '14px', height: '14px' }} />
                {plan.doctor}
              </span>
              <span className="flex items-center gap-1">
                <Calendar style={{ width: '14px', height: '14px' }} />
                {new Date(plan.startDate).toLocaleDateString()} - {new Date(plan.endDate).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Overall Progress</span>
            <span className="text-sm font-bold text-primary-600">{plan.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="h-3 rounded-full transition-all"
              style={{
                width: `${plan.progress}%`,
                background: 'linear-gradient(90deg, #10B981 0%, #059669 100%)',
              }}
            />
          </div>
        </div>

        {/* Goals */}
        <div className="mb-4">
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Target style={{ width: '18px', height: '18px', color: 'var(--primary-600)' }} />
            Treatment Goals
          </h4>
          <div className="space-y-2">
            {plan.goals.map((goal) => (
              <div key={goal.id} className="flex items-center gap-3 p-3 rounded-lg" style={{ backgroundColor: 'var(--gray-50)' }}>
                {goal.completed ? (
                  <CheckCircle style={{ width: '20px', height: '20px', color: 'var(--success-600)', flexShrink: 0 }} />
                ) : (
                  <Circle style={{ width: '20px', height: '20px', color: 'var(--gray-400)', flexShrink: 0 }} />
                )}
                <div className="flex-1">
                  <p className={`text-sm ${goal.completed ? 'line-through text-secondary' : 'text-gray-900'}`}>
                    {goal.text}
                  </p>
                  {!goal.completed && (
                    <div className="mt-1">
                      <div className="w-full bg-gray-300 rounded-full h-1.5">
                        <div
                          className="h-1.5 rounded-full"
                          style={{
                            width: `${goal.progress}%`,
                            backgroundColor: 'var(--primary-600)',
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tasks */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <FileText style={{ width: '18px', height: '18px', color: 'var(--primary-600)' }} />
            Action Items
          </h4>
          <div className="space-y-2">
            {plan.tasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between p-3 rounded-lg"
                style={{
                  backgroundColor: task.status === 'completed' ? 'var(--success-50)' :
                                   task.status === 'ongoing' ? 'var(--primary-50)' : 'var(--warning-50)',
                  border: `1px solid ${task.status === 'completed' ? 'var(--success-200)' :
                                       task.status === 'ongoing' ? 'var(--primary-200)' : 'var(--warning-200)'}`,
                }}
              >
                <div className="flex items-center gap-3">
                  {task.status === 'completed' ? (
                    <CheckCircle style={{ width: '18px', height: '18px', color: 'var(--success-600)' }} />
                  ) : (
                    <Circle style={{ width: '18px', height: '18px', color: 'var(--gray-400)' }} />
                  )}
                  <div>
                    <p className={`text-sm ${task.status === 'completed' ? 'line-through text-secondary' : 'text-gray-900 font-medium'}`}>
                      {task.text}
                    </p>
                    <p className="text-xs text-secondary mt-0.5">Due: {task.dueDate}</p>
                  </div>
                </div>
                {task.status === 'pending' && (
                  <button className="btn btn-primary btn-sm">Mark Complete</button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex-1 overflow-auto" style={{ backgroundColor: 'var(--gray-50)' }}>
      <div className="sticky top-0 z-30 border-b" style={{ backgroundColor: 'white', borderColor: 'var(--gray-200)', boxShadow: 'var(--shadow-sm)' }}>
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
          <div className="pl-16 lg:pl-0">
            <h1 className="heading-h1 mb-1">Care Plans</h1>
            <p className="text-sm text-secondary">Track your treatment goals and care plans</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="card">
            <div className="card-body text-center">
              <div className="avatar avatar-xl mx-auto mb-3" style={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)' }}>
                <Target style={{ width: '32px', height: '32px', color: 'white' }} />
              </div>
              <h3 className="text-3xl font-bold text-gray-900">2</h3>
              <p className="text-sm text-secondary">Active Plans</p>
            </div>
          </div>
          <div className="card">
            <div className="card-body text-center">
              <div className="avatar avatar-xl mx-auto mb-3" style={{ background: 'linear-gradient(135deg, #1570EF 0%, #175CD3 100%)' }}>
                <TrendingUp style={{ width: '32px', height: '32px', color: 'white' }} />
              </div>
              <h3 className="text-3xl font-bold text-gray-900">55%</h3>
              <p className="text-sm text-secondary">Average Progress</p>
            </div>
          </div>
          <div className="card">
            <div className="card-body text-center">
              <div className="avatar avatar-xl mx-auto mb-3" style={{ background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)' }}>
                <AlertTriangle style={{ width: '32px', height: '32px', color: 'white' }} />
              </div>
              <h3 className="text-3xl font-bold text-gray-900">3</h3>
              <p className="text-sm text-secondary">Pending Tasks</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {loading ? (
            <div className="flex justify-center p-8">
              <div className="loading-spinner" style={{ width: '48px', height: '48px', borderWidth: '4px' }}></div>
            </div>
          ) : carePlans.length === 0 ? (
            <div className="card text-center">
              <div className="card-body py-12">
                <Target style={{ width: '64px', height: '64px', color: 'var(--gray-400)', margin: '0 auto 16px' }} />
                <h3 className="heading-h3 mb-2">No Active Care Plans</h3>
                <p className="text-secondary">You don't have any active care plans</p>
              </div>
            </div>
          ) : (
            carePlans.map(plan => <CarePlanCard key={plan.id} plan={plan} />)
          )}
        </div>
      </div>
    </div>
  );
};

export default CarePlans;
