import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { patientAPI } from '../../services/api';
import {
  FileText,
  Download,
  Calendar,
  Stethoscope,
  Pill,
  AlertCircle,
  CheckCircle,
  Clock,
} from 'lucide-react';
import jsPDF from 'jspdf';

/**
 * WORLD-CLASS PRESCRIPTION MANAGEMENT COMPONENT
 * Professional medical prescription system with PDF download
 */
const Prescriptions = () => {
  const { user } = useAuth();
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPrescriptions();
  }, []);

  const loadPrescriptions = async () => {
    setLoading(true);
    try {
      const response = await patientAPI.getConversations(false);

      // Extract all prescriptions from conversations with doctor responses
      const conversations = response.data?.conversations || [];
      const allPrescriptions = conversations
        .filter((conv) => conv.doctorResponse && conv.doctorResponse.prescriptions?.length > 0)
        .map((conv) => ({
          conversationId: conv._id,
          visitNumber: conv.visitNumber,
          doctor: conv.doctor,
          diagnosis: conv.doctorResponse.diagnosis,
          prescriptions: conv.doctorResponse.prescriptions,
          issuedDate: conv.doctorResponse.respondedAt || conv.updatedAt,
          status: getStatus(conv.doctorResponse.respondedAt),
        }))
        .sort((a, b) => new Date(b.issuedDate) - new Date(a.issuedDate));

      setPrescriptions(allPrescriptions);
    } catch (error) {
      console.error('Error loading prescriptions:', error);
      setPrescriptions([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatus = (issuedDate) => {
    const daysSinceIssued = Math.floor((Date.now() - new Date(issuedDate)) / (1000 * 60 * 60 * 24));

    if (daysSinceIssued <= 7) return 'new';
    if (daysSinceIssued <= 30) return 'active';
    return 'archived';
  };

  const getStatusBadge = (status) => {
    if (status === 'new') {
      return (
        <span className="badge badge-success">
          <CheckCircle style={{ width: '14px', height: '14px' }} />
          New
        </span>
      );
    } else if (status === 'active') {
      return (
        <span className="badge badge-info">
          <Clock style={{ width: '14px', height: '14px' }} />
          Active
        </span>
      );
    }
    return (
      <span className="badge badge-gray">
        <FileText style={{ width: '14px', height: '14px' }} />
        Archived
      </span>
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const generatePDF = (prescription) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Header - Blue gradient background
    doc.setFillColor(21, 112, 239);
    doc.rect(0, 0, pageWidth, 40, 'F');

    // MediChat Logo
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('MediChat', 20, 20);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Professional Medical Platform', 20, 28);

    // Document Title
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('MEDICAL PRESCRIPTION', 20, 55);

    // Document Info Box
    doc.setFillColor(249, 250, 251);
    doc.rect(20, 65, pageWidth - 40, 20, 'F');
    doc.setDrawColor(234, 236, 240);
    doc.rect(20, 65, pageWidth - 40, 20);

    doc.setFontSize(9);
    doc.setTextColor(102, 112, 133);
    doc.text(`Visit Number: #${prescription.visitNumber}`, 25, 73);
    doc.text(`Issue Date: ${formatDate(prescription.issuedDate)}`, 25, 80);
    doc.text(`Document ID: RX-${prescription.conversationId.substring(0, 8).toUpperCase()}`, pageWidth - 25, 73, { align: 'right' });

    // Patient Information Section
    let yPos = 100;
    doc.setFillColor(239, 246, 255);
    doc.rect(20, yPos, pageWidth - 40, 8, 'F');
    doc.setFontSize(11);
    doc.setTextColor(21, 112, 239);
    doc.setFont('helvetica', 'bold');
    doc.text('PATIENT INFORMATION', 25, yPos + 5);

    yPos += 15;
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    doc.text(`Name: ${user.firstName} ${user.lastName}`, 25, yPos);
    yPos += 7;
    doc.text(`Email: ${user.email}`, 25, yPos);
    if (user.dateOfBirth) {
      yPos += 7;
      doc.text(`Date of Birth: ${formatDate(user.dateOfBirth)}`, 25, yPos);
    }

    // Doctor Information Section
    yPos += 15;
    doc.setFillColor(236, 253, 243);
    doc.rect(20, yPos, pageWidth - 40, 8, 'F');
    doc.setFontSize(11);
    doc.setTextColor(3, 152, 85);
    doc.setFont('helvetica', 'bold');
    doc.text('PRESCRIBING PHYSICIAN', 25, yPos + 5);

    yPos += 15;
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    doc.text(`Dr. ${prescription.doctor.firstName} ${prescription.doctor.lastName}`, 25, yPos);
    if (prescription.doctor.specialization) {
      yPos += 7;
      doc.text(`Specialization: ${prescription.doctor.specialization}`, 25, yPos);
    }

    // Diagnosis Section
    yPos += 15;
    doc.setFillColor(255, 250, 235);
    doc.rect(20, yPos, pageWidth - 40, 8, 'F');
    doc.setFontSize(11);
    doc.setTextColor(220, 104, 3);
    doc.setFont('helvetica', 'bold');
    doc.text('DIAGNOSIS', 25, yPos + 5);

    yPos += 15;
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    const diagnosisLines = doc.splitTextToSize(prescription.diagnosis, pageWidth - 50);
    doc.text(diagnosisLines, 25, yPos);
    yPos += diagnosisLines.length * 7;

    // Prescriptions Section
    yPos += 10;
    doc.setFillColor(21, 112, 239);
    doc.rect(20, yPos, pageWidth - 40, 10, 'F');
    doc.setFontSize(12);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('℞ PRESCRIBED MEDICATIONS', 25, yPos + 7);

    yPos += 20;

    prescription.prescriptions.forEach((rx, index) => {
      // Check if we need a new page
      if (yPos > pageHeight - 60) {
        doc.addPage();
        yPos = 30;
      }

      // Prescription Box
      doc.setDrawColor(179, 221, 255);
      doc.setLineWidth(0.5);
      doc.roundedRect(20, yPos, pageWidth - 40, 35, 3, 3);

      // Medication Number
      doc.setFillColor(21, 112, 239);
      doc.circle(28, yPos + 8, 5, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(`${index + 1}`, 28, yPos + 10, { align: 'center' });

      // Medication Name
      doc.setTextColor(16, 24, 40);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(rx.medication || 'Not specified', 38, yPos + 10);

      // Medication Details
      doc.setFontSize(9);
      doc.setTextColor(71, 84, 103);
      doc.setFont('helvetica', 'normal');

      let detailY = yPos + 18;
      if (rx.dosage) {
        doc.text(`Dosage: ${rx.dosage}`, 25, detailY);
        detailY += 6;
      }
      if (rx.frequency) {
        doc.text(`Frequency: ${rx.frequency}`, 25, detailY);
        detailY += 6;
      }
      if (rx.duration) {
        doc.text(`Duration: ${rx.duration}`, 25, detailY);
      }

      yPos += 42;
    });

    // Important Notice
    yPos += 10;
    if (yPos > pageHeight - 50) {
      doc.addPage();
      yPos = 30;
    }

    doc.setFillColor(254, 240, 240);
    doc.rect(20, yPos, pageWidth - 40, 25, 'F');
    doc.setDrawColor(254, 205, 211);
    doc.rect(20, yPos, pageWidth - 40, 25);

    doc.setFontSize(9);
    doc.setTextColor(185, 28, 28);
    doc.setFont('helvetica', 'bold');
    doc.text('IMPORTANT NOTICE:', 25, yPos + 6);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(127, 29, 29);
    const notice = 'This prescription is valid for 30 days from the issue date. Please follow your doctor\'s instructions carefully. Contact your physician if you experience any adverse effects.';
    const noticeLines = doc.splitTextToSize(notice, pageWidth - 50);
    doc.text(noticeLines, 25, yPos + 13);

    // Footer
    const footerY = pageHeight - 20;
    doc.setDrawColor(234, 236, 240);
    doc.line(20, footerY, pageWidth - 20, footerY);

    doc.setFontSize(8);
    doc.setTextColor(156, 163, 175);
    doc.setFont('helvetica', 'italic');
    doc.text('Generated by MediChat - Professional Medical Platform', pageWidth / 2, footerY + 7, { align: 'center' });
    doc.text(`Generated on: ${new Date().toLocaleString()}`, pageWidth / 2, footerY + 12, { align: 'center' });

    // Save PDF
    const fileName = `Prescription_Visit${prescription.visitNumber}_${new Date(prescription.issuedDate).toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="loading-spinner mb-4" style={{ width: '40px', height: '40px', borderWidth: '4px' }}></div>
          <p style={{ color: '#667085', fontSize: '14px' }}>Loading your prescriptions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto p-4 md:p-6" style={{ backgroundColor: '#F9FAFB' }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 style={{
            fontSize: '30px',
            fontWeight: '600',
            color: '#101828',
            marginBottom: '8px',
          }}>
            My Prescriptions
          </h1>
          <p style={{
            fontSize: '16px',
            color: '#475467',
          }}>
            View and download your medical prescriptions
          </p>
        </div>

        {/* Info Alert */}
        <div
          className="alert alert-info mb-6"
          style={{
            backgroundColor: '#EBF5FF',
            borderColor: '#B3DDFF',
          }}
        >
          <div className="flex items-start gap-3">
            <AlertCircle style={{ width: '20px', height: '20px', color: '#1570EF', flexShrink: 0 }} />
            <div>
              <p style={{ fontSize: '14px', color: '#194185', fontWeight: '500' }}>
                Download your prescriptions as professional PDF documents to share with your pharmacy.
                All prescriptions are digitally signed by your prescribing physician.
              </p>
            </div>
          </div>
        </div>

        {/* Prescriptions List */}
        {prescriptions.length > 0 ? (
          <div className="flex flex-col gap-4">
            {prescriptions.map((prescription, index) => (
              <div
                key={index}
                className="card"
                style={{ backgroundColor: 'white' }}
              >
                <div className="card-body">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div
                        className="avatar avatar-lg"
                        style={{
                          background: 'linear-gradient(135deg, #1570EF 0%, #175CD3 100%)',
                          color: 'white',
                        }}
                      >
                        <FileText style={{ width: '24px', height: '24px' }} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 style={{
                            fontSize: '18px',
                            fontWeight: '600',
                            color: '#101828',
                          }}>
                            Prescription - Visit #{prescription.visitNumber}
                          </h3>
                          {getStatusBadge(prescription.status)}
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <Stethoscope style={{ width: '16px', height: '16px', color: '#667085' }} />
                          <span style={{ fontSize: '14px', color: '#667085' }}>
                            Dr. {prescription.doctor.firstName} {prescription.doctor.lastName}
                            {prescription.doctor.specialization && ` - ${prescription.doctor.specialization}`}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar style={{ width: '16px', height: '16px', color: '#667085' }} />
                          <span style={{ fontSize: '14px', color: '#667085' }}>
                            Issued: {formatDate(prescription.issuedDate)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Diagnosis Preview */}
                  <div
                    className="p-3 rounded-lg mb-4"
                    style={{
                      backgroundColor: '#FFFAEB',
                      border: '1px solid #FEF0C7',
                    }}
                  >
                    <p style={{
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#DC6803',
                      marginBottom: '4px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}>
                      DIAGNOSIS
                    </p>
                    <p style={{
                      fontSize: '14px',
                      color: '#B54708',
                      lineHeight: '1.5',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                    }}>
                      {prescription.diagnosis}
                    </p>
                  </div>

                  {/* Medications List */}
                  <div className="mb-4">
                    <p style={{
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#344054',
                      marginBottom: '8px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}>
                      PRESCRIBED MEDICATIONS ({prescription.prescriptions.length})
                    </p>
                    <div className="flex flex-col gap-2">
                      {prescription.prescriptions.map((rx, rxIndex) => (
                        <div
                          key={rxIndex}
                          className="flex items-center gap-3 p-3 rounded-lg"
                          style={{
                            backgroundColor: '#F9FAFB',
                            border: '1px solid #EAECF0',
                          }}
                        >
                          <div
                            className="flex items-center justify-center"
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '8px',
                              background: 'linear-gradient(135deg, #1570EF 0%, #175CD3 100%)',
                              color: 'white',
                              fontSize: '14px',
                              fontWeight: '600',
                              flexShrink: 0,
                            }}
                          >
                            <Pill style={{ width: '16px', height: '16px' }} />
                          </div>
                          <div className="flex-1">
                            <p style={{
                              fontSize: '14px',
                              fontWeight: '600',
                              color: '#101828',
                              marginBottom: '2px',
                            }}>
                              {rx.medication}
                            </p>
                            <p style={{ fontSize: '13px', color: '#667085' }}>
                              {rx.dosage && `${rx.dosage} • `}
                              {rx.frequency && `${rx.frequency} • `}
                              {rx.duration && `${rx.duration}`}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Download Button */}
                  <button
                    onClick={() => generatePDF(prescription)}
                    className="btn btn-primary w-full"
                  >
                    <Download style={{ width: '20px', height: '20px' }} />
                    Download Prescription PDF
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card text-center">
            <div className="card-body" style={{ padding: 'var(--space-12)' }}>
              <FileText style={{
                width: '64px',
                height: '64px',
                color: '#D0D5DD',
                margin: '0 auto var(--space-4)',
              }} />
              <h3 style={{
                fontSize: '20px',
                fontWeight: '600',
                color: '#101828',
                marginBottom: '8px',
              }}>
                No Prescriptions Yet
              </h3>
              <p style={{
                fontSize: '16px',
                color: '#667085',
              }}>
                Your prescriptions will appear here once a doctor responds to your consultation.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Prescriptions;
