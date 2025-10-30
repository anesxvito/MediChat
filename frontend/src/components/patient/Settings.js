import React, { useState, useEffect } from 'react';
import { patientAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import {
  User,
  Phone,
  Calendar,
  AlertCircle,
  Pill,
  Save,
  CheckCircle,
  Mail,
  Camera,
  Upload,
  Heart,
  Activity,
  ShieldAlert,
  FileText,
  Users,
  MapPin,
  CreditCard,
  Building2,
  Info,
  Clock,
  UserPlus,
  X,
  Plus,
  Stethoscope,
  Droplet,
  Weight,
  Ruler,
} from 'lucide-react';

/**
 * WORLD-CLASS EMR-COMPLIANT PATIENT SETTINGS
 * Professional medical portal meeting modern healthcare standards
 * Comprehensive patient data management with rich interface
 */
const Settings = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [activeSection, setActiveSection] = useState('personal');

  const [formData, setFormData] = useState({
    // Personal Information
    phone: '',
    dateOfBirth: '',
    gender: '',
    bloodType: '',
    height: '',
    weight: '',

    // Medical Information
    allergies: [],
    currentMedications: [],
    chronicConditions: [],
    surgicalHistory: [],
    familyHistory: [],
    immunizations: [],

    // Emergency Contacts
    emergencyContacts: [],

    // Insurance Information
    insuranceProvider: '',
    insurancePolicyNumber: '',
    insuranceGroupNumber: '',

    // Additional Information
    primaryPhysician: '',
    pharmacyName: '',
    pharmacyPhone: '',
    preferredLanguage: 'English',
    smokingStatus: '',
    alcoholConsumption: '',
    exerciseFrequency: '',
  });

  const [profilePhoto, setProfilePhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  // Input states for adding new items
  const [newAllergy, setNewAllergy] = useState('');
  const [newMedication, setNewMedication] = useState({ name: '', dosage: '', frequency: '' });
  const [newCondition, setNewCondition] = useState('');
  const [newSurgery, setNewSurgery] = useState({ procedure: '', date: '', notes: '' });
  const [newFamilyHistory, setNewFamilyHistory] = useState({ condition: '', relation: '' });
  const [newImmunization, setNewImmunization] = useState({ vaccine: '', date: '' });
  const [newEmergencyContact, setNewEmergencyContact] = useState({
    name: '',
    relationship: '',
    phone: '',
    email: '',
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const response = await patientAPI.getProfile();
      const patient = response.data?.patient || {};
      const medicalInfo = patient.patientMedicalInfo || {};

      setFormData({
        phone: patient.phone || '',
        dateOfBirth: patient.dateOfBirth
          ? new Date(patient.dateOfBirth).toISOString().split('T')[0]
          : '',
        gender: patient.gender || '',
        bloodType: medicalInfo.bloodType || '',
        height: medicalInfo.heightCm ? String(medicalInfo.heightCm) : '',
        weight: medicalInfo.weightKg ? String(medicalInfo.weightKg) : '',
        allergies: patient.allergies || [],
        currentMedications: patient.patientMedications || [],
        chronicConditions: patient.chronicConditions || [],
        surgicalHistory: patient.surgicalHistory || [],
        familyHistory: patient.familyHistory || [],
        immunizations: patient.immunizations || [],
        emergencyContacts: medicalInfo.emergencyContactName ? [{
          name: medicalInfo.emergencyContactName || '',
          relationship: medicalInfo.emergencyContactRelationship || '',
          phone: medicalInfo.emergencyContactPhone || '',
          email: ''
        }] : [],
        insuranceProvider: medicalInfo.insuranceProvider || '',
        insurancePolicyNumber: medicalInfo.insurancePolicyNumber || '',
        insuranceGroupNumber: medicalInfo.insuranceGroupNumber || '',
        primaryPhysician: medicalInfo.assignedDoctor
          ? `${medicalInfo.assignedDoctor.firstName} ${medicalInfo.assignedDoctor.lastName}`
          : '',
        pharmacyName: patient.pharmacyName || '',
        pharmacyPhone: patient.pharmacyPhone || '',
        preferredLanguage: patient.preferredLanguage || 'English',
        smokingStatus: patient.smokingStatus || '',
        alcoholConsumption: patient.alcoholConsumption || '',
        exerciseFrequency: patient.exerciseFrequency || '',
      });
    } catch (err) {
      console.error('Error loading profile:', err);
      setError('Failed to load profile. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        setError('Please upload a valid image file (JPEG, PNG, or WebP)');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
        return;
      }

      setProfilePhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result);
      reader.readAsDataURL(file);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    setError('');

    try {
      let updateData;
      if (profilePhoto) {
        updateData = new FormData();
        Object.keys(formData).forEach(key => {
          if (Array.isArray(formData[key])) {
            updateData.append(key, JSON.stringify(formData[key]));
          } else if (formData[key]) {
            updateData.append(key, formData[key]);
          }
        });
        updateData.append('profilePhoto', profilePhoto);
      } else {
        updateData = formData;
      }

      const response = await patientAPI.updateProfile(updateData);
      updateUser(response.data.patient);
      setSuccess(true);
      setProfilePhoto(null);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  // Add/Remove functions for arrays
  const addAllergy = () => {
    if (newAllergy.trim()) {
      setFormData({ ...formData, allergies: [...formData.allergies, newAllergy.trim()] });
      setNewAllergy('');
    }
  };

  const addMedication = () => {
    if (newMedication.name.trim()) {
      setFormData({
        ...formData,
        currentMedications: [...formData.currentMedications, { ...newMedication }],
      });
      setNewMedication({ name: '', dosage: '', frequency: '' });
    }
  };

  const addCondition = () => {
    if (newCondition.trim()) {
      setFormData({
        ...formData,
        chronicConditions: [...formData.chronicConditions, newCondition.trim()],
      });
      setNewCondition('');
    }
  };

  const addSurgery = () => {
    if (newSurgery.procedure.trim()) {
      setFormData({
        ...formData,
        surgicalHistory: [...formData.surgicalHistory, { ...newSurgery }],
      });
      setNewSurgery({ procedure: '', date: '', notes: '' });
    }
  };

  const addFamilyHistory = () => {
    if (newFamilyHistory.condition.trim() && newFamilyHistory.relation.trim()) {
      setFormData({
        ...formData,
        familyHistory: [...formData.familyHistory, { ...newFamilyHistory }],
      });
      setNewFamilyHistory({ condition: '', relation: '' });
    }
  };

  const addImmunization = () => {
    if (newImmunization.vaccine.trim()) {
      setFormData({
        ...formData,
        immunizations: [...formData.immunizations, { ...newImmunization }],
      });
      setNewImmunization({ vaccine: '', date: '' });
    }
  };

  const addEmergencyContact = () => {
    if (newEmergencyContact.name.trim() && newEmergencyContact.phone.trim()) {
      setFormData({
        ...formData,
        emergencyContacts: [...formData.emergencyContacts, { ...newEmergencyContact }],
      });
      setNewEmergencyContact({ name: '', relationship: '', phone: '', email: '' });
    }
  };

  const removeItem = (field, index) => {
    setFormData({
      ...formData,
      [field]: formData[field].filter((_, i) => i !== index),
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="loading-spinner" style={{ width: '48px', height: '48px', borderWidth: '4px' }}></div>
      </div>
    );
  }

  const sections = [
    { id: 'personal', label: 'Personal Info', icon: User },
    { id: 'medical', label: 'Medical History', icon: Heart },
    { id: 'lifestyle', label: 'Lifestyle', icon: Activity },
    { id: 'emergency', label: 'Emergency Contacts', icon: ShieldAlert },
    { id: 'insurance', label: 'Insurance', icon: CreditCard },
  ];

  return (
    <div className="flex-1 overflow-auto" style={{ backgroundColor: 'var(--gray-50)' }}>
      {/* Fixed Header */}
      <div
        className="sticky top-0 z-30 border-b"
        style={{
          backgroundColor: 'white',
          borderColor: 'var(--gray-200)',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
          <div className="flex items-center justify-between mb-4 pl-16 lg:pl-0">
            <div>
              <h1 className="heading-h1 mb-1">Patient Settings</h1>
              <p className="text-sm text-secondary">
                Comprehensive medical profile and account management
              </p>
            </div>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={saving}
              className="btn btn-success hidden md:inline-flex"
            >
              {saving ? (
                <>
                  <span className="loading-spinner" style={{ width: '20px', height: '20px', borderWidth: '2px' }}></span>
                  Saving...
                </>
              ) : (
                <>
                  <Save style={{ width: '20px', height: '20px' }} />
                  Save All Changes
                </>
              )}
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-2 overflow-x-auto pb-1 pl-16 lg:pl-0" style={{ scrollbarWidth: 'thin' }}>
            {sections.map((section) => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm whitespace-nowrap transition-all"
                  style={{
                    background: isActive
                      ? 'linear-gradient(135deg, #1570EF 0%, #175CD3 100%)'
                      : 'transparent',
                    color: isActive ? 'white' : 'var(--gray-600)',
                    border: isActive ? 'none' : '1px solid var(--gray-300)',
                  }}
                >
                  <Icon style={{ width: '18px', height: '18px' }} />
                  {section.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        {/* Success/Error Messages */}
        {error && (
          <div className="alert alert-error mb-6 animate-fadeIn">
            <AlertCircle style={{ width: '20px', height: '20px', flexShrink: 0 }} />
            <span>{error}</span>
            <button onClick={() => setError('')} className="ml-auto">
              <X style={{ width: '20px', height: '20px' }} />
            </button>
          </div>
        )}

        {success && (
          <div className="alert alert-success mb-6 animate-fadeIn">
            <CheckCircle style={{ width: '20px', height: '20px', flexShrink: 0 }} />
            <span>Profile updated successfully!</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Personal Information Section */}
          {activeSection === 'personal' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Profile Photo Card - Standalone */}
              <div className="lg:col-span-1">
                <div className="card sticky top-32">
                  <div className="card-header">
                    <div className="flex items-center gap-3">
                      <Camera style={{ width: '20px', height: '20px', color: 'var(--primary-600)' }} />
                      <h2 className="heading-h3">Profile Photo</h2>
                    </div>
                  </div>
                  <div className="card-body text-center">
                    <div
                      className="mx-auto mb-4"
                      style={{
                        width: '160px',
                        height: '160px',
                        borderRadius: 'var(--radius-full)',
                        border: '4px solid var(--primary-200)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: photoPreview ? 'transparent' : 'var(--gray-100)',
                        overflow: 'hidden',
                        position: 'relative',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                      }}
                    >
                      {photoPreview ? (
                        <img
                          src={photoPreview}
                          alt="Profile"
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <Camera style={{ width: '64px', height: '64px', color: 'var(--gray-400)' }} />
                      )}
                    </div>

                    <label
                      htmlFor="profilePhotoSettings"
                      className="btn btn-primary cursor-pointer w-full mb-2"
                    >
                      <Upload style={{ width: '20px', height: '20px' }} />
                      {photoPreview ? 'Change Photo' : 'Upload Photo'}
                    </label>
                    <input
                      type="file"
                      id="profilePhotoSettings"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={handlePhotoChange}
                      style={{ display: 'none' }}
                    />
                    <p className="form-hint text-center">
                      JPG, PNG or WebP<br />Max 5MB • 400x400px recommended
                    </p>
                  </div>
                </div>
              </div>

              {/* Personal Details Cards */}
              <div className="lg:col-span-2 flex flex-col gap-6">
                {/* Basic Information */}
                <div className="card">
                  <div className="card-header">
                    <div className="flex items-center gap-3">
                      <User style={{ width: '20px', height: '20px', color: 'var(--primary-600)' }} />
                      <h2 className="heading-h3">Basic Information</h2>
                    </div>
                  </div>
                  <div className="card-body">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="form-label">First Name</label>
                        <input
                          type="text"
                          value={user?.firstName || ''}
                          disabled
                          className="form-input"
                          style={{ backgroundColor: 'var(--gray-50)', cursor: 'not-allowed' }}
                        />
                        <p className="form-hint">Cannot be changed</p>
                      </div>

                      <div>
                        <label className="form-label">Last Name</label>
                        <input
                          type="text"
                          value={user?.lastName || ''}
                          disabled
                          className="form-input"
                          style={{ backgroundColor: 'var(--gray-50)', cursor: 'not-allowed' }}
                        />
                        <p className="form-hint">Cannot be changed</p>
                      </div>

                      <div>
                        <label className="form-label">Email Address</label>
                        <input
                          type="email"
                          value={user?.email || ''}
                          disabled
                          className="form-input"
                          style={{ backgroundColor: 'var(--gray-50)', cursor: 'not-allowed' }}
                        />
                        <p className="form-hint">Cannot be changed</p>
                      </div>

                      <div>
                        <label className="form-label">Phone Number</label>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="+1 (555) 123-4567"
                          className="form-input"
                        />
                      </div>

                      <div>
                        <label className="form-label">Date of Birth</label>
                        <input
                          type="date"
                          value={formData.dateOfBirth}
                          onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                          className="form-input"
                        />
                      </div>

                      <div>
                        <label className="form-label">Gender</label>
                        <select
                          value={formData.gender}
                          onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                          className="form-input"
                        >
                          <option value="">Select gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                          <option value="prefer-not-to-say">Prefer not to say</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Vital Statistics */}
                <div className="card">
                  <div className="card-header" style={{ background: 'linear-gradient(135deg, var(--success-50) 0%, white 100%)' }}>
                    <div className="flex items-center gap-3">
                      <Activity style={{ width: '20px', height: '20px', color: 'var(--success-600)' }} />
                      <h2 className="heading-h3">Vital Statistics</h2>
                    </div>
                  </div>
                  <div className="card-body">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="form-label flex items-center gap-2">
                          <Droplet style={{ width: '16px', height: '16px', color: 'var(--error-600)' }} />
                          Blood Type
                        </label>
                        <select
                          value={formData.bloodType}
                          onChange={(e) => setFormData({ ...formData, bloodType: e.target.value })}
                          className="form-input"
                        >
                          <option value="">Select blood type</option>
                          <option value="A+">A+</option>
                          <option value="A-">A-</option>
                          <option value="B+">B+</option>
                          <option value="B-">B-</option>
                          <option value="AB+">AB+</option>
                          <option value="AB-">AB-</option>
                          <option value="O+">O+</option>
                          <option value="O-">O-</option>
                        </select>
                      </div>

                      <div>
                        <label className="form-label flex items-center gap-2">
                          <Ruler style={{ width: '16px', height: '16px', color: 'var(--primary-600)' }} />
                          Height
                        </label>
                        <input
                          type="text"
                          value={formData.height}
                          onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                          placeholder="5'10&quot; or 178cm"
                          className="form-input"
                        />
                      </div>

                      <div>
                        <label className="form-label flex items-center gap-2">
                          <Weight style={{ width: '16px', height: '16px', color: 'var(--primary-600)' }} />
                          Weight
                        </label>
                        <input
                          type="text"
                          value={formData.weight}
                          onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                          placeholder="170 lbs or 77kg"
                          className="form-input"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Medical History Section */}
          {activeSection === 'medical' && (
            <div className="grid grid-cols-1 gap-6">
              {/* Allergies */}
              <div className="card">
                <div className="card-header" style={{ background: 'linear-gradient(135deg, var(--error-50) 0%, white 100%)' }}>
                  <div className="flex items-center gap-3">
                    <AlertCircle style={{ width: '20px', height: '20px', color: 'var(--error-600)' }} />
                    <h2 className="heading-h3">Allergies</h2>
                    <span className="badge badge-error ml-auto">{formData.allergies.length}</span>
                  </div>
                </div>
                <div className="card-body">
                  <div className="flex gap-2 mb-4">
                    <input
                      type="text"
                      value={newAllergy}
                      onChange={(e) => setNewAllergy(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAllergy())}
                      placeholder="Enter allergy (e.g., Penicillin, Peanuts)"
                      className="form-input flex-1"
                    />
                    <button type="button" onClick={addAllergy} className="btn btn-danger">
                      <Plus style={{ width: '20px', height: '20px' }} />
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.allergies.map((allergy, index) => (
                      <div key={index} className="badge badge-error badge-lg flex items-center gap-2">
                        <span>{allergy}</span>
                        <button type="button" onClick={() => removeItem('allergies', index)} className="hover:opacity-70">
                          <X style={{ width: '16px', height: '16px' }} />
                        </button>
                      </div>
                    ))}
                    {formData.allergies.length === 0 && (
                      <p className="text-sm text-secondary">No known allergies</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Current Medications */}
              <div className="card">
                <div className="card-header" style={{ background: 'linear-gradient(135deg, var(--primary-50) 0%, white 100%)' }}>
                  <div className="flex items-center gap-3">
                    <Pill style={{ width: '20px', height: '20px', color: 'var(--primary-600)' }} />
                    <h2 className="heading-h3">Current Medications</h2>
                    <span className="badge badge-primary ml-auto">{formData.currentMedications.length}</span>
                  </div>
                </div>
                <div className="card-body">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-2 mb-4">
                    <input
                      type="text"
                      value={newMedication.name}
                      onChange={(e) => setNewMedication({ ...newMedication, name: e.target.value })}
                      placeholder="Medication name"
                      className="form-input md:col-span-5"
                    />
                    <input
                      type="text"
                      value={newMedication.dosage}
                      onChange={(e) => setNewMedication({ ...newMedication, dosage: e.target.value })}
                      placeholder="Dosage (e.g., 100mg)"
                      className="form-input md:col-span-3"
                    />
                    <input
                      type="text"
                      value={newMedication.frequency}
                      onChange={(e) => setNewMedication({ ...newMedication, frequency: e.target.value })}
                      placeholder="Frequency"
                      className="form-input md:col-span-3"
                    />
                    <button type="button" onClick={addMedication} className="btn btn-primary md:col-span-1">
                      <Plus style={{ width: '20px', height: '20px' }} />
                    </button>
                  </div>
                  <div className="space-y-2">
                    {formData.currentMedications.map((med, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 rounded-lg border"
                        style={{ borderColor: 'var(--primary-200)', backgroundColor: 'var(--primary-50)' }}
                      >
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">
                            {typeof med === 'string' ? med : med.name}
                          </p>
                          {typeof med === 'object' && (med.dosage || med.frequency) && (
                            <p className="text-sm text-gray-600">
                              {med.dosage} {med.frequency && `• ${med.frequency}`}
                            </p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeItem('currentMedications', index)}
                          className="btn btn-ghost btn-sm"
                        >
                          <X style={{ width: '18px', height: '18px' }} />
                        </button>
                      </div>
                    ))}
                    {formData.currentMedications.length === 0 && (
                      <p className="text-sm text-secondary">No current medications</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Chronic Conditions */}
              <div className="card">
                <div className="card-header" style={{ background: 'linear-gradient(135deg, var(--warning-50) 0%, white 100%)' }}>
                  <div className="flex items-center gap-3">
                    <Stethoscope style={{ width: '20px', height: '20px', color: 'var(--warning-600)' }} />
                    <h2 className="heading-h3">Chronic Conditions</h2>
                    <span className="badge badge-warning ml-auto">{formData.chronicConditions.length}</span>
                  </div>
                </div>
                <div className="card-body">
                  <div className="flex gap-2 mb-4">
                    <input
                      type="text"
                      value={newCondition}
                      onChange={(e) => setNewCondition(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCondition())}
                      placeholder="Enter condition (e.g., Diabetes Type 2, Hypertension)"
                      className="form-input flex-1"
                    />
                    <button type="button" onClick={addCondition} className="btn btn-warning">
                      <Plus style={{ width: '20px', height: '20px' }} />
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.chronicConditions.map((condition, index) => (
                      <div key={index} className="badge badge-warning badge-lg flex items-center gap-2">
                        <span>{condition}</span>
                        <button type="button" onClick={() => removeItem('chronicConditions', index)} className="hover:opacity-70">
                          <X style={{ width: '16px', height: '16px' }} />
                        </button>
                      </div>
                    ))}
                    {formData.chronicConditions.length === 0 && (
                      <p className="text-sm text-secondary">No chronic conditions</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Lifestyle Section */}
          {activeSection === 'lifestyle' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="card">
                <div className="card-header" style={{ background: 'linear-gradient(135deg, var(--success-50) 0%, white 100%)' }}>
                  <div className="flex items-center gap-3">
                    <Activity style={{ width: '20px', height: '20px', color: 'var(--success-600)' }} />
                    <h2 className="heading-h3">Lifestyle Factors</h2>
                  </div>
                </div>
                <div className="card-body space-y-4">
                  <div>
                    <label className="form-label">Smoking Status</label>
                    <select
                      value={formData.smokingStatus}
                      onChange={(e) => setFormData({ ...formData, smokingStatus: e.target.value })}
                      className="form-input"
                    >
                      <option value="">Select status</option>
                      <option value="never">Never smoked</option>
                      <option value="former">Former smoker</option>
                      <option value="current">Current smoker</option>
                    </select>
                  </div>

                  <div>
                    <label className="form-label">Alcohol Consumption</label>
                    <select
                      value={formData.alcoholConsumption}
                      onChange={(e) => setFormData({ ...formData, alcoholConsumption: e.target.value })}
                      className="form-input"
                    >
                      <option value="">Select frequency</option>
                      <option value="none">None</option>
                      <option value="occasional">Occasional (1-2 times/month)</option>
                      <option value="moderate">Moderate (1-2 times/week)</option>
                      <option value="regular">Regular (3+ times/week)</option>
                    </select>
                  </div>

                  <div>
                    <label className="form-label">Exercise Frequency</label>
                    <select
                      value={formData.exerciseFrequency}
                      onChange={(e) => setFormData({ ...formData, exerciseFrequency: e.target.value })}
                      className="form-input"
                    >
                      <option value="">Select frequency</option>
                      <option value="none">None</option>
                      <option value="1-2">1-2 times per week</option>
                      <option value="3-4">3-4 times per week</option>
                      <option value="5+">5+ times per week</option>
                      <option value="daily">Daily</option>
                    </select>
                  </div>

                  <div>
                    <label className="form-label">Preferred Language</label>
                    <select
                      value={formData.preferredLanguage}
                      onChange={(e) => setFormData({ ...formData, preferredLanguage: e.target.value })}
                      className="form-input"
                    >
                      <option value="English">English</option>
                      <option value="Spanish">Spanish</option>
                      <option value="French">French</option>
                      <option value="German">German</option>
                      <option value="Chinese">Chinese</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-header" style={{ background: 'linear-gradient(135deg, var(--primary-50) 0%, white 100%)' }}>
                  <div className="flex items-center gap-3">
                    <Building2 style={{ width: '20px', height: '20px', color: 'var(--primary-600)' }} />
                    <h2 className="heading-h3">Healthcare Providers</h2>
                  </div>
                </div>
                <div className="card-body space-y-4">
                  <div>
                    <label className="form-label">Primary Physician</label>
                    <input
                      type="text"
                      value={formData.primaryPhysician}
                      onChange={(e) => setFormData({ ...formData, primaryPhysician: e.target.value })}
                      placeholder="Dr. John Smith"
                      className="form-input"
                    />
                  </div>

                  <div>
                    <label className="form-label">Pharmacy Name</label>
                    <input
                      type="text"
                      value={formData.pharmacyName}
                      onChange={(e) => setFormData({ ...formData, pharmacyName: e.target.value })}
                      placeholder="CVS Pharmacy"
                      className="form-input"
                    />
                  </div>

                  <div>
                    <label className="form-label">Pharmacy Phone</label>
                    <input
                      type="tel"
                      value={formData.pharmacyPhone}
                      onChange={(e) => setFormData({ ...formData, pharmacyPhone: e.target.value })}
                      placeholder="+1 (555) 123-4567"
                      className="form-input"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Emergency Contacts Section */}
          {activeSection === 'emergency' && (
            <div className="card">
              <div className="card-header" style={{ background: 'linear-gradient(135deg, var(--error-50) 0%, white 100%)' }}>
                <div className="flex items-center gap-3">
                  <ShieldAlert style={{ width: '20px', height: '20px', color: 'var(--error-600)' }} />
                  <h2 className="heading-h3">Emergency Contacts</h2>
                  <span className="badge badge-error ml-auto">{formData.emergencyContacts.length}</span>
                </div>
              </div>
              <div className="card-body">
                <div className="grid grid-cols-1 md:grid-cols-11 gap-2 mb-6">
                  <input
                    type="text"
                    value={newEmergencyContact.name}
                    onChange={(e) => setNewEmergencyContact({ ...newEmergencyContact, name: e.target.value })}
                    placeholder="Contact name"
                    className="form-input md:col-span-3"
                  />
                  <input
                    type="text"
                    value={newEmergencyContact.relationship}
                    onChange={(e) => setNewEmergencyContact({ ...newEmergencyContact, relationship: e.target.value })}
                    placeholder="Relationship"
                    className="form-input md:col-span-2"
                  />
                  <input
                    type="tel"
                    value={newEmergencyContact.phone}
                    onChange={(e) => setNewEmergencyContact({ ...newEmergencyContact, phone: e.target.value })}
                    placeholder="Phone number"
                    className="form-input md:col-span-3"
                  />
                  <input
                    type="email"
                    value={newEmergencyContact.email}
                    onChange={(e) => setNewEmergencyContact({ ...newEmergencyContact, email: e.target.value })}
                    placeholder="Email (optional)"
                    className="form-input md:col-span-2"
                  />
                  <button type="button" onClick={addEmergencyContact} className="btn btn-danger md:col-span-1">
                    <Plus style={{ width: '20px', height: '20px' }} />
                  </button>
                </div>

                <div className="space-y-3">
                  {formData.emergencyContacts.map((contact, index) => (
                    <div
                      key={index}
                      className="flex items-start justify-between p-4 rounded-lg border"
                      style={{ borderColor: 'var(--error-200)', backgroundColor: 'var(--error-50)' }}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Users style={{ width: '18px', height: '18px', color: 'var(--error-600)' }} />
                          <p className="font-bold text-gray-900">{contact.name}</p>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">{contact.relationship}</p>
                        <div className="flex flex-wrap gap-3 text-sm">
                          <span className="flex items-center gap-1">
                            <Phone style={{ width: '14px', height: '14px' }} />
                            {contact.phone}
                          </span>
                          {contact.email && (
                            <span className="flex items-center gap-1">
                              <Mail style={{ width: '14px', height: '14px' }} />
                              {contact.email}
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem('emergencyContacts', index)}
                        className="btn btn-ghost btn-sm"
                      >
                        <X style={{ width: '18px', height: '18px' }} />
                      </button>
                    </div>
                  ))}
                  {formData.emergencyContacts.length === 0 && (
                    <div className="text-center py-8">
                      <ShieldAlert style={{ width: '48px', height: '48px', color: 'var(--gray-400)', margin: '0 auto 16px' }} />
                      <p className="text-gray-600 font-semibold mb-1">No emergency contacts added</p>
                      <p className="text-sm text-secondary">Add at least one emergency contact for safety</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Insurance Section */}
          {activeSection === 'insurance' && (
            <div className="card">
              <div className="card-header" style={{ background: 'linear-gradient(135deg, var(--primary-50) 0%, white 100%)' }}>
                <div className="flex items-center gap-3">
                  <CreditCard style={{ width: '20px', height: '20px', color: 'var(--primary-600)' }} />
                  <h2 className="heading-h3">Insurance Information</h2>
                </div>
              </div>
              <div className="card-body">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="form-label">Insurance Provider</label>
                    <input
                      type="text"
                      value={formData.insuranceProvider}
                      onChange={(e) => setFormData({ ...formData, insuranceProvider: e.target.value })}
                      placeholder="Blue Cross Blue Shield"
                      className="form-input"
                    />
                  </div>

                  <div>
                    <label className="form-label">Policy Number</label>
                    <input
                      type="text"
                      value={formData.insurancePolicyNumber}
                      onChange={(e) => setFormData({ ...formData, insurancePolicyNumber: e.target.value })}
                      placeholder="ABC123456789"
                      className="form-input"
                    />
                  </div>

                  <div>
                    <label className="form-label">Group Number</label>
                    <input
                      type="text"
                      value={formData.insuranceGroupNumber}
                      onChange={(e) => setFormData({ ...formData, insuranceGroupNumber: e.target.value })}
                      placeholder="GRP456789"
                      className="form-input"
                    />
                  </div>
                </div>

                <div
                  className="mt-6 p-4 rounded-lg"
                  style={{ backgroundColor: 'var(--warning-50)', border: '1px solid var(--warning-200)' }}
                >
                  <div className="flex gap-3">
                    <Info style={{ width: '20px', height: '20px', color: 'var(--warning-600)', flexShrink: 0 }} />
                    <div>
                      <p className="font-semibold text-gray-900 mb-1">Insurance Information Security</p>
                      <p className="text-sm text-gray-600">
                        Your insurance information is encrypted and stored securely. This information
                        is only accessible to authorized healthcare providers and administrative staff.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Mobile Save Button */}
          <div className="flex justify-end mt-6 md:hidden">
            <button
              type="submit"
              disabled={saving}
              className="btn btn-success btn-lg w-full"
            >
              {saving ? (
                <>
                  <span className="loading-spinner" style={{ width: '20px', height: '20px', borderWidth: '2px' }}></span>
                  Saving...
                </>
              ) : (
                <>
                  <Save style={{ width: '20px', height: '20px' }} />
                  Save All Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Settings;
