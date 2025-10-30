import React, { useState, useEffect, useCallback } from 'react';
import { doctorAPI } from '../../services/api';
import RichTextEditor from './RichTextEditor';
import './PatientDetails.css';
import {
  ArrowLeft,
  User,
  Calendar,
  Phone,
  Mail,
  MessageSquare,
  Send,
  AlertCircle,
  FileText,
  Plus,
  Trash2,
  CheckCircle,
  Activity,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

const PatientDetails = ({ conversation: initialConversation, onClose }) => {
  const [conversation, setConversation] = useState(initialConversation);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showFullConversation, setShowFullConversation] = useState(false);
  const [response, setResponse] = useState({
    diagnosis: '',
    recommendations: '',
    prescriptions: [{ medication: '', dosage: '', frequency: '', duration: '' }],
    referrals: '',
    callToOffice: false,
    notes: '',
  });

  const loadConversationDetails = useCallback(async () => {
    const conversationId = initialConversation?.id || initialConversation?._id;
    if (!conversationId) {
      setLoading(false);
      return;
    }

    try {
      const res = await doctorAPI.getConversation(conversationId);
      setConversation(res.data.conversation);
    } catch (error) {
      console.error('Error loading conversation:', error);
    } finally {
      setLoading(false);
    }
  }, [initialConversation?.id, initialConversation?._id]);

  useEffect(() => {
    loadConversationDetails();
  }, [loadConversationDetails]);

  const handleAddPrescription = () => {
    setResponse({
      ...response,
      prescriptions: [
        ...response.prescriptions,
        { medication: '', dosage: '', frequency: '', duration: '' },
      ],
    });
  };

  const handleRemovePrescription = (index) => {
    const newPrescriptions = response.prescriptions.filter((_, i) => i !== index);
    setResponse({ ...response, prescriptions: newPrescriptions });
  };

  const handlePrescriptionChange = (index, field, value) => {
    const newPrescriptions = [...response.prescriptions];
    newPrescriptions[index][field] = value;
    setResponse({ ...response, prescriptions: newPrescriptions });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const conversationId = conversation?.id || conversation?._id;
    if (!conversationId) {
      alert('No conversation selected');
      return;
    }

    setSubmitting(true);

    try {
      // Filter out empty prescriptions (where medication field is empty)
      const validPrescriptions = response.prescriptions.filter(
        (prescription) => prescription.medication.trim() !== ''
      );

      const responseData = {
        ...response,
        prescriptions: validPrescriptions,
      };

      await doctorAPI.respondToPatient(conversationId, responseData);
      alert('Response sent to patient successfully!');
      onClose();
    } catch (error) {
      console.error('Error submitting response:', error);
      console.error('Response data:', error.response?.data);

      // Parse and display validation errors
      if (error.response?.data?.message) {
        try {
          const validationErrors = JSON.parse(error.response.data.message);
          const errorMessages = validationErrors
            .map(err => `${err.field}: ${err.message}`)
            .join('\n');
          alert(`Validation Error:\n\n${errorMessages}`);
        } catch (parseError) {
          alert(`Error: ${error.response.data.message}`);
        }
      } else {
        alert('Failed to send response. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="loading-spinner mb-4" style={{ width: '3rem', height: '3rem' }}></div>
          <p className="text-gray-600">Loading patient information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <button
            onClick={onClose}
            className="btn btn-secondary btn-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="max-w-7xl mx-auto space-y-6 animate-fadeIn">
            {/* Patient Information - Professional EMR */}
            <div style={{
              border: '1px solid #D1D5DB',
              backgroundColor: '#FFFFFF',
              marginBottom: '20px'
            }}>
              {/* Header */}
              <div style={{
                backgroundColor: '#F9FAFB',
                borderBottom: '1px solid #D1D5DB',
                padding: '16px 20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <h1 style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#111827',
                    margin: 0,
                    marginBottom: '4px'
                  }}>
                    {conversation.patient?.lastName?.toUpperCase()}, {conversation.patient?.firstName}
                  </h1>
                  <div style={{
                    fontSize: '12px',
                    color: '#6B7280',
                    fontWeight: '500'
                  }}>
                    Visit #{conversation.visitNumber} | {conversation.status.replace('_', ' ').toUpperCase()}
                  </div>
                </div>
              </div>

              {/* Patient Demographics */}
              <div style={{ padding: '20px' }}>
                <div style={{
                  fontSize: '12px',
                  fontWeight: '600',
                  color: '#111827',
                  textTransform: 'uppercase',
                  letterSpacing: '0.025em',
                  marginBottom: '12px'
                }}>
                  DEMOGRAPHICS
                </div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '16px',
                  fontSize: '13px'
                }}>
                  <div>
                    <div style={{
                      fontSize: '11px',
                      fontWeight: '600',
                      color: '#6B7280',
                      marginBottom: '4px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.025em'
                    }}>
                      Date of Birth
                    </div>
                    <div style={{ color: '#111827' }}>
                      {conversation.patient?.dateOfBirth
                        ? new Date(conversation.patient.dateOfBirth).toLocaleDateString()
                        : 'N/A'}
                    </div>
                  </div>
                  <div>
                    <div style={{
                      fontSize: '11px',
                      fontWeight: '600',
                      color: '#6B7280',
                      marginBottom: '4px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.025em'
                    }}>
                      Email
                    </div>
                    <div style={{ color: '#111827' }}>
                      {conversation.patient?.email}
                    </div>
                  </div>
                  <div>
                    <div style={{
                      fontSize: '11px',
                      fontWeight: '600',
                      color: '#6B7280',
                      marginBottom: '4px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.025em'
                    }}>
                      Phone
                    </div>
                    <div style={{ color: '#111827' }}>
                      {conversation.patient?.phone || 'N/A'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Allergies */}
              {conversation.patient?.allergies?.length > 0 && (
                <div style={{
                  padding: '16px 20px',
                  backgroundColor: '#FEF2F2',
                  borderTop: '1px solid #FCA5A5',
                  borderBottom: '1px solid #FCA5A5'
                }}>
                  <div style={{
                    fontSize: '11px',
                    fontWeight: '600',
                    color: '#991B1B',
                    marginBottom: '6px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.025em'
                  }}>
                    ⚠ ALLERGIES
                  </div>
                  <div style={{
                    fontSize: '13px',
                    color: '#7F1D1D',
                    fontWeight: '500'
                  }}>
                    {conversation.patient.allergies.join(', ')}
                  </div>
                </div>
              )}

              {/* Current Medications */}
              {conversation.patient?.currentMedications?.length > 0 && (
                <div style={{
                  padding: '16px 20px',
                  backgroundColor: '#F0F9FF',
                  borderTop: '1px solid #BAE6FD',
                  borderBottom: '1px solid #BAE6FD'
                }}>
                  <div style={{
                    fontSize: '11px',
                    fontWeight: '600',
                    color: '#075985',
                    marginBottom: '6px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.025em'
                  }}>
                    CURRENT MEDICATIONS
                  </div>
                  <div style={{
                    fontSize: '13px',
                    color: '#0C4A6E',
                    fontWeight: '500'
                  }}>
                    {conversation.patient.currentMedications.join(', ')}
                  </div>
                </div>
              )}
            </div>

            {/* Clinical Summary - Professional EMR */}
            {conversation.aiSummary && (
              <div style={{
                border: '1px solid #D1D5DB',
                backgroundColor: '#FFFFFF',
                marginBottom: '20px'
              }}>
                {/* Header */}
                <div style={{
                  backgroundColor: '#F9FAFB',
                  borderBottom: '1px solid #D1D5DB',
                  padding: '12px 20px'
                }}>
                  <h3 style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#111827',
                    margin: 0,
                    textTransform: 'uppercase',
                    letterSpacing: '0.025em'
                  }}>CLINICAL SUMMARY</h3>
                </div>

                {/* Content */}
                <div style={{ padding: '20px' }}>
                  <div
                    style={{
                      fontSize: '13px',
                      lineHeight: '1.6',
                      color: '#374151',
                      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                    }}
                    dangerouslySetInnerHTML={{
                      __html: conversation.aiSummary
                        .split('\n\n')
                        .map(section => {
                          const headerMatch = section.match(/^\*\*(.+?):\*\*/);
                          if (headerMatch) {
                            const header = headerMatch[1];
                            const content = section.replace(/^\*\*(.+?):\*\*\s*/, '').trim();

                            // Skip Files Uploaded section
                            if (header.includes('Files')) {
                              return '';
                            }

                            return `
                              <div style="margin-bottom: 18px;">
                                <div style="
                                  font-weight: 600;
                                  font-size: 13px;
                                  color: #111827;
                                  margin-bottom: 6px;
                                  text-transform: uppercase;
                                  letter-spacing: 0.025em;
                                ">
                                  ${header}
                                </div>
                                <div style="
                                  color: #374151;
                                  line-height: 1.6;
                                  font-size: 13px;
                                  padding-left: 0;
                                ">
                                  ${content}
                                </div>
                              </div>
                            `;
                          }
                          return '';
                        })
                        .join('')
                    }}
                  />
                </div>
              </div>
            )}

            {/* Conversation History Card - Collapsible */}
            <div className="card">
              <div
                className="card-header cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => setShowFullConversation(!showFullConversation)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-gray-600" />
                    <h2 className="card-title text-gray-800">Full Conversation Transcript</h2>
                    <span className="badge badge-info text-xs">
                      {conversation.messages?.length || 0} messages
                    </span>
                  </div>
                  {showFullConversation ? (
                    <ChevronUp className="w-5 h-5 text-gray-600" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-600" />
                  )}
                </div>
              </div>
              {showFullConversation && (
                <div className="card-body">
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {conversation.messages?.map((message, index) => (
                      <div
                        key={index}
                        className={`flex ${
                          message.role === 'user' ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-sm ${
                            message.role === 'user'
                              ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white'
                              : 'bg-white border-2 border-gray-200 text-gray-800'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap leading-relaxed">
                            {message.content}
                          </p>
                          <p
                            className={`text-xs mt-2 ${
                              message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                            }`}
                          >
                            {new Date(message.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Uploaded Files Card */}
            {conversation.attachments?.length > 0 && (
              <div className="card">
                <div className="card-header">
                  <h2 className="card-title">Medical Documents</h2>
                </div>
                <div className="card-body">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {conversation.attachments.map((file, index) => (
                      <a
                        key={index}
                        href={`http://localhost:5000/api/${file.path}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-4 bg-gray-50 hover:bg-gray-100 rounded-lg border-2 border-gray-200 hover:border-blue-300 transition cursor-pointer group"
                      >
                        <FileText className="w-6 h-6 text-gray-600 group-hover:text-blue-600" />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 truncate">
                            {file.originalName}
                          </div>
                          <div className="text-xs text-gray-500">Click to view</div>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            )}

          {/* Clinical Documentation - Professional EMR */}
          <form onSubmit={handleSubmit} style={{
            border: '1px solid #D1D5DB',
            backgroundColor: '#FFFFFF',
            marginBottom: '20px'
          }}>
              <div style={{
                backgroundColor: '#F9FAFB',
                borderBottom: '1px solid #D1D5DB',
                padding: '12px 20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <h2 style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#111827',
                  margin: 0,
                  textTransform: 'uppercase',
                  letterSpacing: '0.025em'
                }}>PROVIDER DOCUMENTATION</h2>
                <div style={{
                  fontSize: '11px',
                  fontWeight: '600',
                  color: '#6B7280',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  IN PROGRESS
                </div>
              </div>

              <div style={{ padding: '20px' }}>
                {/* Assessment & Diagnosis */}
                <div className="form-group" style={{
                  marginBottom: '20px',
                  borderBottom: '1px solid #E5E7EB',
                  paddingBottom: '20px'
                }}>
                  <label style={{
                    fontSize: '12px',
                    fontWeight: '600',
                    color: '#111827',
                    textTransform: 'uppercase',
                    letterSpacing: '0.025em',
                    marginBottom: '8px',
                    display: 'block'
                  }}>
                    ASSESSMENT & DIAGNOSIS *
                  </label>
                  <RichTextEditor
                    value={response.diagnosis}
                    onChange={(value) => setResponse({ ...response, diagnosis: value })}
                    placeholder="ASSESSMENT:

PRIMARY DIAGNOSIS:
•

DIFFERENTIAL DIAGNOSES:
•

CLINICAL IMPRESSION:"
                    minHeight="320px"
                    backgroundColor="#FAFAFA"
                  />
                </div>

                {/* Treatment Plan & Recommendations */}
                <div className="form-group" style={{
                  marginBottom: '20px',
                  borderBottom: '1px solid #E5E7EB',
                  paddingBottom: '20px'
                }}>
                  <label style={{
                    fontSize: '12px',
                    fontWeight: '600',
                    color: '#111827',
                    textTransform: 'uppercase',
                    letterSpacing: '0.025em',
                    marginBottom: '8px',
                    display: 'block'
                  }}>
                    TREATMENT PLAN & RECOMMENDATIONS *
                  </label>
                  <RichTextEditor
                    value={response.recommendations}
                    onChange={(value) => setResponse({ ...response, recommendations: value })}
                    placeholder="TREATMENT PLAN:

1. PHARMACOLOGICAL MANAGEMENT:
   •

2. NON-PHARMACOLOGICAL INTERVENTIONS:
   •

3. LIFESTYLE MODIFICATIONS:
   •

4. PATIENT EDUCATION:
   •

5. FOLLOW-UP:
   •"
                    minHeight="320px"
                    backgroundColor="#FAFAFA"
                  />
                </div>

                {/* Prescriptions */}
                <div className="form-group" style={{
                  marginBottom: '20px',
                  borderBottom: '1px solid #E5E7EB',
                  paddingBottom: '20px'
                }}>
                  <label style={{
                    fontSize: '12px',
                    fontWeight: '600',
                    color: '#111827',
                    textTransform: 'uppercase',
                    letterSpacing: '0.025em',
                    marginBottom: '8px',
                    display: 'block'
                  }}>
                    MEDICATION ORDERS
                  </label>
                  <div className="space-y-3">
                    {response.prescriptions.map((prescription, index) => (
                      <div
                        key={index}
                        style={{
                          padding: '16px',
                          backgroundColor: '#F9FAFB',
                          border: '1px solid #E5E7EB',
                          marginBottom: '12px'
                        }}
                      >
                        <div style={{
                          fontSize: '11px',
                          fontWeight: '600',
                          color: '#6B7280',
                          marginBottom: '12px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em'
                        }}>
                          Rx {index + 1}
                        </div>

                        <div className="mb-3">
                          <label style={{
                            fontSize: '11px',
                            fontWeight: '500',
                            color: '#374151',
                            marginBottom: '4px',
                            display: 'block'
                          }}>
                            Medication Name & Strength
                          </label>
                          <input
                            type="text"
                            placeholder="e.g., Ibuprofen 400mg"
                            value={prescription.medication}
                            onChange={(e) =>
                              handlePrescriptionChange(index, 'medication', e.target.value)
                            }
                            className="form-input"
                            style={{
                              minHeight: '40px',
                              fontSize: '13px',
                              backgroundColor: 'white',
                              border: '1px solid #D1D5DB'
                            }}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3 mb-3">
                          <div>
                            <label style={{
                              fontSize: '11px',
                              fontWeight: '500',
                              color: '#374151',
                              marginBottom: '4px',
                              display: 'block'
                            }}>
                              Dosage & Route
                            </label>
                            <input
                              type="text"
                              placeholder="e.g., 1 tablet PO"
                              value={prescription.dosage}
                              onChange={(e) =>
                                handlePrescriptionChange(index, 'dosage', e.target.value)
                              }
                              className="form-input"
                              style={{
                                minHeight: '40px',
                                fontSize: '13px',
                                backgroundColor: 'white',
                                border: '1px solid #D1D5DB'
                              }}
                            />
                          </div>
                          <div>
                            <label style={{
                              fontSize: '11px',
                              fontWeight: '500',
                              color: '#374151',
                              marginBottom: '4px',
                              display: 'block'
                            }}>
                              Frequency
                            </label>
                            <input
                              type="text"
                              placeholder="e.g., TID with meals"
                              value={prescription.frequency}
                              onChange={(e) =>
                                handlePrescriptionChange(index, 'frequency', e.target.value)
                              }
                              className="form-input"
                              style={{
                                minHeight: '40px',
                                fontSize: '13px',
                                backgroundColor: 'white',
                                border: '1px solid #D1D5DB'
                              }}
                            />
                          </div>
                        </div>

                        <div className="mb-3">
                          <label style={{
                            fontSize: '11px',
                            fontWeight: '500',
                            color: '#374151',
                            marginBottom: '4px',
                            display: 'block'
                          }}>
                            Duration & Quantity
                          </label>
                          <input
                            type="text"
                            placeholder="e.g., 7 days (Dispense: 21 tablets)"
                            value={prescription.duration}
                            onChange={(e) =>
                              handlePrescriptionChange(index, 'duration', e.target.value)
                            }
                            className="form-input"
                            style={{
                              minHeight: '40px',
                              fontSize: '13px',
                              backgroundColor: 'white',
                              border: '1px solid #D1D5DB'
                            }}
                          />
                        </div>

                        {response.prescriptions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemovePrescription(index)}
                            style={{
                              fontSize: '11px',
                              color: '#DC2626',
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              padding: '4px 0',
                              fontWeight: '500'
                            }}
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={handleAddPrescription}
                      style={{
                        fontSize: '12px',
                        color: '#1F2937',
                        backgroundColor: 'white',
                        border: '1px solid #D1D5DB',
                        padding: '8px 16px',
                        cursor: 'pointer',
                        width: '100%',
                        fontWeight: '500'
                      }}
                    >
                      + Add Prescription
                    </button>
                  </div>
                </div>

                {/* Referrals & Diagnostic Orders */}
                <div className="form-group" style={{
                  marginBottom: '20px',
                  borderBottom: '1px solid #E5E7EB',
                  paddingBottom: '20px'
                }}>
                  <label style={{
                    fontSize: '12px',
                    fontWeight: '600',
                    color: '#111827',
                    textTransform: 'uppercase',
                    letterSpacing: '0.025em',
                    marginBottom: '8px',
                    display: 'block'
                  }}>
                    ORDERS & REFERRALS
                  </label>
                  <RichTextEditor
                    value={response.referrals}
                    onChange={(value) => setResponse({ ...response, referrals: value })}
                    placeholder="REFERRALS:
• Specialty: [e.g., Physical Therapy, Orthopedics]
• Reason:
• Urgency: [Routine/Urgent/STAT]

DIAGNOSTIC TESTS:
• Laboratory: [e.g., CBC, CMP, HbA1c]
• Imaging: [e.g., X-ray, MRI, CT scan]
• Other:"
                    minHeight="200px"
                    backgroundColor="#FEFCE8"
                  />
                </div>

                {/* Follow-Up & Office Visit */}
                <div className="form-group" style={{
                  marginBottom: '20px',
                  borderBottom: '1px solid #E5E7EB',
                  paddingBottom: '20px'
                }}>
                  <label style={{
                    fontSize: '12px',
                    fontWeight: '600',
                    color: '#111827',
                    textTransform: 'uppercase',
                    letterSpacing: '0.025em',
                    marginBottom: '8px',
                    display: 'block'
                  }}>
                    FOLLOW-UP
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer" style={{
                    fontSize: '13px',
                    color: '#374151'
                  }}>
                    <input
                      type="checkbox"
                      id="callToOffice"
                      checked={response.callToOffice}
                      onChange={(e) =>
                        setResponse({
                          ...response,
                          callToOffice: e.target.checked,
                        })
                      }
                      style={{ width: '16px', height: '16px' }}
                    />
                    <span>In-person office visit required</span>
                  </label>
                </div>

                {/* Additional Clinical Notes */}
                <div className="form-group" style={{
                  marginBottom: '20px'
                }}>
                  <label style={{
                    fontSize: '12px',
                    fontWeight: '600',
                    color: '#111827',
                    textTransform: 'uppercase',
                    letterSpacing: '0.025em',
                    marginBottom: '8px',
                    display: 'block'
                  }}>
                    ADDITIONAL NOTES
                  </label>
                  <RichTextEditor
                    value={response.notes}
                    onChange={(value) => setResponse({ ...response, notes: value })}
                    placeholder="PATIENT EDUCATION:
•

WARNING SIGNS (When to seek immediate care):
•

PRECAUTIONS:
•

OTHER NOTES:
•"
                    minHeight="200px"
                    backgroundColor="#F9FAFB"
                  />
                </div>
              </div>

              <div style={{
                backgroundColor: '#F9FAFB',
                borderTop: '1px solid #D1D5DB',
                padding: '16px 20px',
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
                gap: '12px'
              }}>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    backgroundColor: submitting ? '#9CA3AF' : '#1F2937',
                    color: 'white',
                    border: 'none',
                    padding: '10px 24px',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    textTransform: 'uppercase',
                    letterSpacing: '0.025em'
                  }}
                >
                  {submitting ? 'Submitting...' : 'Submit Documentation'}
                </button>
              </div>
            </form>
        </div>
      </div>
    </div>
  );
};

export default PatientDetails;
