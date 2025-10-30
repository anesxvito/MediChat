import React, { useState, useEffect } from 'react';
import { FileText, Upload, Download, Eye, Trash2, Folder, Calendar, User, Search, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { documentsAPI } from '../../services/api';

/**
 * MEDICAL DOCUMENT MANAGEMENT SYSTEM
 * EMR-compliant document storage with categorization and secure sharing
 */
const Documents = () => {
  const [documents, setDocuments] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDocuments();
  }, [selectedCategory]);

  const loadDocuments = async () => {
    setLoading(true);
    try {
      const filters = selectedCategory !== 'all' ? { category: selectedCategory } : {};
      const response = await documentsAPI.getDocuments(filters);
      const transformedDocs = response.data.map(doc => ({
        id: doc.id,
        name: doc.title,
        category: doc.category.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
        uploadDate: doc.uploadedAt,
        size: `${(doc.fileSize / 1024).toFixed(0)} KB`,
        uploadedBy: doc.uploadedBy || 'System',
        fileType: doc.fileType.toUpperCase(),
      }));
      setDocuments(transformedDocs);
      setLoading(false);
    } catch (error) {
      console.error('Error loading documents:', error);
      setLoading(false);
    }
  };

  const mockDocuments = [
    {
      id: 'doc1',
      name: 'Blood Test Results - October 2025',
      category: 'Lab Results',
      uploadDate: '2025-10-21',
      size: '245 KB',
      uploadedBy: 'Dr. Sarah Johnson',
      fileType: 'PDF',
    },
    {
      id: 'doc2',
      name: 'X-Ray - Chest',
      category: 'Imaging',
      uploadDate: '2025-10-15',
      size: '1.2 MB',
      uploadedBy: 'Radiology Dept',
      fileType: 'DICOM',
    },
    {
      id: 'doc3',
      name: 'Prescription - October 2025',
      category: 'Prescriptions',
      uploadDate: '2025-10-21',
      size: '89 KB',
      uploadedBy: 'Dr. Sarah Johnson',
      fileType: 'PDF',
    },
    {
      id: 'doc4',
      name: 'Insurance Card - Front',
      category: 'Insurance',
      uploadDate: '2025-09-01',
      size: '156 KB',
      uploadedBy: 'Self',
      fileType: 'JPG',
    },
  ];

  const categories = ['all', 'Lab Results', 'Imaging', 'Prescriptions', 'Insurance', 'Medical Records', 'Other'];

  const getCategoryColor = (category) => {
    const colors = {
      'Lab Results': { bg: '#EBF5FF', border: '#B3DDFF', text: '#1570EF' },
      'Imaging': { bg: '#F0FDF4', border: '#BBF7D0', text: '#16A34A' },
      'Prescriptions': { bg: '#FEF3C7', border: '#FDE68A', text: '#D97706' },
      'Insurance': { bg: '#F3E8FF', border: '#E9D5FF', text: '#9333EA' },
      'Medical Records': { bg: '#FEE2E2', border: '#FECACA', text: '#DC2626' },
    };
    return colors[category] || { bg: '#F3F4F6', border: '#D1D5DB', text: '#6B7280' };
  };

  return (
    <div className="flex-1 overflow-auto" style={{ backgroundColor: 'var(--gray-50)' }}>
      <div className="sticky top-0 z-30 border-b" style={{ backgroundColor: 'white', borderColor: 'var(--gray-200)', boxShadow: 'var(--shadow-sm)' }}>
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
          <div className="flex items-center justify-between mb-4 pl-16 lg:pl-0">
            <div>
              <h1 className="heading-h1 mb-1">Medical Documents</h1>
              <p className="text-sm text-secondary">Securely store and manage your medical records</p>
            </div>
            <button className="btn btn-primary hidden md:inline-flex">
              <Upload style={{ width: '20px', height: '20px' }} />
              Upload Document
            </button>
          </div>

          <div className="flex flex-col md:flex-row gap-3 pl-16 lg:pl-0">
            <div className="relative flex-1">
              <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '20px', height: '20px', color: 'var(--gray-400)' }} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search documents..."
                className="form-input"
                style={{ paddingLeft: '40px' }}
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="form-input md:w-48"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat === 'all' ? 'All Categories' : cat}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        <div className="grid grid-cols-1 gap-4">
          {loading ? (
            <div className="flex justify-center p-8">
              <div className="loading-spinner" style={{ width: '48px', height: '48px', borderWidth: '4px' }}></div>
            </div>
          ) : documents.length === 0 ? (
            <div className="card text-center">
              <div className="card-body py-12">
                <FileText style={{ width: '64px', height: '64px', color: 'var(--gray-400)', margin: '0 auto 16px' }} />
                <h3 className="heading-h3 mb-2">No Documents Found</h3>
                <p className="text-secondary">Upload your first medical document to get started</p>
              </div>
            </div>
          ) : (
            documents.map((doc) => {
            const colors = getCategoryColor(doc.category);
            return (
              <div key={doc.id} className="card">
                <div className="card-body">
                  <div className="flex items-start gap-4">
                    <div
                      className="avatar avatar-lg"
                      style={{ backgroundColor: colors.bg, border: `2px solid ${colors.border}`, color: colors.text }}
                    >
                      <FileText style={{ width: '24px', height: '24px' }} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-1">{doc.name}</h3>
                          <div className="flex flex-wrap gap-2 text-sm text-secondary">
                            <span className="flex items-center gap-1">
                              <Folder style={{ width: '14px', height: '14px' }} />
                              {doc.category}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar style={{ width: '14px', height: '14px' }} />
                              {format(new Date(doc.uploadDate), 'MMM d, yyyy')}
                            </span>
                            <span className="flex items-center gap-1">
                              <User style={{ width: '14px', height: '14px' }} />
                              {doc.uploadedBy}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button className="btn btn-secondary btn-sm">
                            <Eye style={{ width: '16px', height: '16px' }} />
                            View
                          </button>
                          <button className="btn btn-secondary btn-sm">
                            <Download style={{ width: '16px', height: '16px' }} />
                          </button>
                          <button className="btn btn-error btn-sm">
                            <Trash2 style={{ width: '16px', height: '16px' }} />
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="badge badge-sm" style={{ backgroundColor: colors.bg, color: colors.text }}>
                          {doc.fileType}
                        </span>
                        <span className="text-xs text-secondary">{doc.size}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default Documents;
