-- =====================================================
-- MEDICHAT POSTGRESQL SCHEMA
-- Hospital-Grade EMR Database Design
-- HIPAA-Compliant with Audit Trails
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- TABLE: users
-- Core user accounts (Patients, Doctors, Admins)
-- =====================================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('patient', 'doctor', 'admin')),

    -- Personal Information
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    date_of_birth DATE,

    -- Doctor-Specific Fields
    specialization VARCHAR(100),
    license_number VARCHAR(50) UNIQUE,

    -- Account Status
    is_active BOOLEAN DEFAULT true NOT NULL,
    email_verified BOOLEAN DEFAULT false,

    -- Audit Fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    last_login_at TIMESTAMP WITH TIME ZONE,

    -- Indexes for performance
    CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Indexes for users table
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_license ON users(license_number) WHERE license_number IS NOT NULL;
CREATE INDEX idx_users_active ON users(is_active);

-- =====================================================
-- TABLE: patient_medical_info
-- Extended medical information for patients
-- =====================================================
CREATE TABLE patient_medical_info (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    assigned_doctor_id UUID REFERENCES users(id) ON DELETE SET NULL,

    -- Medical Data (will be encrypted at application level)
    blood_type VARCHAR(10),
    height_cm DECIMAL(5,2),
    weight_kg DECIMAL(5,2),
    emergency_contact_name VARCHAR(200),
    emergency_contact_phone VARCHAR(20),
    emergency_contact_relationship VARCHAR(50),

    -- Insurance Information
    insurance_provider VARCHAR(200),
    insurance_policy_number VARCHAR(100),
    insurance_group_number VARCHAR(100),

    -- Audit Fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,

    CONSTRAINT unique_patient_medical_info UNIQUE(patient_id)
);

CREATE INDEX idx_patient_medical_info_patient ON patient_medical_info(patient_id);
CREATE INDEX idx_patient_medical_info_doctor ON patient_medical_info(assigned_doctor_id);

-- =====================================================
-- TABLE: allergies
-- Patient allergies (critical for clinical decisions)
-- =====================================================
CREATE TABLE allergies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    allergen VARCHAR(200) NOT NULL,
    allergen_type VARCHAR(50) CHECK (allergen_type IN ('medication', 'food', 'environmental', 'other')),
    reaction TEXT,
    severity VARCHAR(20) CHECK (severity IN ('mild', 'moderate', 'severe', 'life-threatening')),
    diagnosed_date DATE,
    notes TEXT,

    -- Audit Fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by UUID REFERENCES users(id),

    CONSTRAINT unique_patient_allergen UNIQUE(patient_id, allergen)
);

CREATE INDEX idx_allergies_patient ON allergies(patient_id);
CREATE INDEX idx_allergies_severity ON allergies(severity);

-- =====================================================
-- TABLE: medications
-- Current medications for patients
-- =====================================================
CREATE TABLE medications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    medication_name VARCHAR(200) NOT NULL,
    dosage VARCHAR(100),
    frequency VARCHAR(100),
    route VARCHAR(50), -- oral, IV, topical, etc.
    start_date DATE,
    end_date DATE,
    is_active BOOLEAN DEFAULT true,
    prescribing_doctor_id UUID REFERENCES users(id),
    notes TEXT,

    -- Audit Fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,

    CONSTRAINT valid_date_range CHECK (end_date IS NULL OR end_date >= start_date)
);

CREATE INDEX idx_medications_patient ON medications(patient_id);
CREATE INDEX idx_medications_active ON medications(is_active);
CREATE INDEX idx_medications_prescriber ON medications(prescribing_doctor_id);

-- =====================================================
-- TABLE: medical_history
-- Patient medical history entries
-- =====================================================
CREATE TABLE medical_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    condition VARCHAR(300) NOT NULL,
    icd10_code VARCHAR(20), -- ICD-10 diagnosis code
    diagnosed_date DATE,
    resolved_date DATE,
    is_active BOOLEAN DEFAULT true,
    notes TEXT,
    diagnosed_by UUID REFERENCES users(id),

    -- Audit Fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,

    CONSTRAINT valid_history_dates CHECK (resolved_date IS NULL OR resolved_date >= diagnosed_date)
);

CREATE INDEX idx_medical_history_patient ON medical_history(patient_id);
CREATE INDEX idx_medical_history_active ON medical_history(is_active);
CREATE INDEX idx_medical_history_icd10 ON medical_history(icd10_code);

-- =====================================================
-- TABLE: conversations
-- Medical consultation sessions
-- =====================================================
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES users(id) ON DELETE SET NULL,

    visit_number INTEGER NOT NULL,
    status VARCHAR(30) NOT NULL CHECK (status IN ('in_progress', 'awaiting_doctor', 'doctor_responded', 'closed')),

    -- AI Summary (encrypted at application level)
    ai_summary TEXT,

    -- Doctor Response Fields (encrypted at application level)
    diagnosis TEXT,
    recommendations TEXT,
    referrals TEXT,
    call_to_office BOOLEAN DEFAULT false,
    doctor_notes TEXT,
    responded_at TIMESTAMP WITH TIME ZONE,

    -- Status Flags
    patient_notified BOOLEAN DEFAULT false,
    archived_by_patient BOOLEAN DEFAULT false,
    archived_by_doctor BOOLEAN DEFAULT false,
    conversation_ended_at TIMESTAMP WITH TIME ZONE,

    -- Audit Fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,

    CONSTRAINT unique_patient_visit UNIQUE(patient_id, visit_number)
);

CREATE INDEX idx_conversations_patient ON conversations(patient_id, created_at DESC);
CREATE INDEX idx_conversations_doctor ON conversations(doctor_id, status);
CREATE INDEX idx_conversations_status ON conversations(status);
CREATE INDEX idx_conversations_visit ON conversations(patient_id, visit_number);

-- =====================================================
-- TABLE: messages
-- Individual messages within conversations
-- =====================================================
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,

    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL, -- Encrypted at application level

    -- Audit Fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at);
CREATE INDEX idx_messages_role ON messages(role);

-- =====================================================
-- TABLE: symptoms
-- Symptoms reported in conversations
-- =====================================================
CREATE TABLE symptoms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,

    symptom VARCHAR(200) NOT NULL,
    location VARCHAR(100),
    severity VARCHAR(20) CHECK (severity IN ('mild', 'moderate', 'severe')),
    duration VARCHAR(100),
    notes TEXT,

    -- Audit Fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX idx_symptoms_conversation ON symptoms(conversation_id);
CREATE INDEX idx_symptoms_severity ON symptoms(severity);

-- =====================================================
-- TABLE: attachments
-- File attachments for conversations
-- =====================================================
CREATE TABLE attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,

    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_type VARCHAR(100),
    file_size_bytes BIGINT,
    mime_type VARCHAR(100),

    -- Security
    is_encrypted BOOLEAN DEFAULT false,
    checksum VARCHAR(64), -- SHA-256 checksum for integrity

    -- Audit Fields
    uploaded_by UUID REFERENCES users(id),
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX idx_attachments_conversation ON attachments(conversation_id);
CREATE INDEX idx_attachments_uploaded_by ON attachments(uploaded_by);

-- =====================================================
-- TABLE: prescriptions
-- Prescriptions given by doctors
-- =====================================================
CREATE TABLE prescriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    medication_name VARCHAR(200) NOT NULL,
    dosage VARCHAR(100) NOT NULL,
    frequency VARCHAR(100) NOT NULL,
    duration VARCHAR(100) NOT NULL,
    quantity INTEGER,
    refills INTEGER DEFAULT 0,

    -- Prescription Status
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled', 'expired')),
    filled_date DATE,
    expiration_date DATE,

    -- Pharmacy Information
    pharmacy_name VARCHAR(200),
    pharmacy_phone VARCHAR(20),

    -- Special Instructions
    instructions TEXT,
    warnings TEXT,

    -- Audit Fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX idx_prescriptions_conversation ON prescriptions(conversation_id);
CREATE INDEX idx_prescriptions_patient ON prescriptions(patient_id, created_at DESC);
CREATE INDEX idx_prescriptions_doctor ON prescriptions(doctor_id);
CREATE INDEX idx_prescriptions_status ON prescriptions(status);

-- =====================================================
-- TABLE: activity_logs
-- Comprehensive audit trail for HIPAA compliance
-- =====================================================
CREATE TABLE activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- User Information
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    user_role VARCHAR(20) CHECK (user_role IN ('patient', 'doctor', 'admin', 'system', 'anonymous')),
    user_email VARCHAR(255),

    -- Action Details
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50),
    resource_id UUID,

    -- Request Information
    method VARCHAR(10),
    endpoint TEXT,
    ip_address INET NOT NULL,
    user_agent TEXT,

    -- Response Information
    status VARCHAR(20) NOT NULL CHECK (status IN ('success', 'failure', 'error', 'warning')),
    status_code INTEGER,

    -- Additional Context
    description TEXT,
    metadata JSONB,

    -- Error Information
    error_message TEXT,
    error_stack TEXT,
    error_code VARCHAR(50),

    -- Performance
    duration_ms INTEGER,

    -- Severity
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('info', 'warning', 'error', 'critical')),

    -- Timestamp (immutable - never updated)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Indexes for activity_logs (critical for audit queries)
CREATE INDEX idx_activity_logs_user ON activity_logs(user_id, created_at DESC);
CREATE INDEX idx_activity_logs_action ON activity_logs(action, created_at DESC);
CREATE INDEX idx_activity_logs_status ON activity_logs(status, created_at DESC);
CREATE INDEX idx_activity_logs_severity ON activity_logs(severity, created_at DESC);
CREATE INDEX idx_activity_logs_resource ON activity_logs(resource_type, resource_id);
CREATE INDEX idx_activity_logs_created ON activity_logs(created_at DESC);
CREATE INDEX idx_activity_logs_ip ON activity_logs(ip_address);

-- GIN index for JSONB metadata queries
CREATE INDEX idx_activity_logs_metadata ON activity_logs USING GIN (metadata);

-- =====================================================
-- TABLE: sessions (for proper session management)
-- =====================================================
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Session Information
    token_hash VARCHAR(255) NOT NULL UNIQUE,
    refresh_token_hash VARCHAR(255),
    device_info TEXT,
    ip_address INET,
    user_agent TEXT,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,

    -- Status
    is_active BOOLEAN DEFAULT true,
    revoked_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_sessions_user ON sessions(user_id, is_active);
CREATE INDEX idx_sessions_token ON sessions(token_hash);
CREATE INDEX idx_sessions_expires ON sessions(expires_at);

-- =====================================================
-- TABLE: mfa_tokens (Multi-Factor Authentication)
-- =====================================================
CREATE TABLE mfa_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- MFA Configuration
    secret VARCHAR(255) NOT NULL, -- Encrypted TOTP secret
    is_enabled BOOLEAN DEFAULT false,
    backup_codes TEXT[], -- Array of encrypted backup codes

    -- Audit
    enabled_at TIMESTAMP WITH TIME ZONE,
    last_used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,

    CONSTRAINT unique_user_mfa UNIQUE(user_id)
);

CREATE INDEX idx_mfa_tokens_user ON mfa_tokens(user_id);

-- =====================================================
-- TRIGGERS FOR UPDATED_AT
-- Auto-update updated_at timestamp
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to all tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_patient_medical_info_updated_at BEFORE UPDATE ON patient_medical_info
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_allergies_updated_at BEFORE UPDATE ON allergies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_medications_updated_at BEFORE UPDATE ON medications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_medical_history_updated_at BEFORE UPDATE ON medical_history
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prescriptions_updated_at BEFORE UPDATE ON prescriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- VIEWS FOR COMMON QUERIES
-- =====================================================

-- Complete patient profile view
CREATE VIEW patient_profiles AS
SELECT
    u.id,
    u.email,
    u.first_name,
    u.last_name,
    u.phone,
    u.date_of_birth,
    u.created_at,
    pmi.blood_type,
    pmi.height_cm,
    pmi.weight_kg,
    pmi.assigned_doctor_id,
    pmi.insurance_provider,
    COUNT(DISTINCT a.id) as allergy_count,
    COUNT(DISTINCT m.id) FILTER (WHERE m.is_active = true) as active_medication_count,
    COUNT(DISTINCT c.id) as conversation_count
FROM users u
LEFT JOIN patient_medical_info pmi ON u.id = pmi.patient_id
LEFT JOIN allergies a ON u.id = a.patient_id
LEFT JOIN medications m ON u.id = m.patient_id
LEFT JOIN conversations c ON u.id = c.patient_id
WHERE u.role = 'patient' AND u.is_active = true
GROUP BY u.id, pmi.patient_id, pmi.blood_type, pmi.height_cm, pmi.weight_kg,
         pmi.assigned_doctor_id, pmi.insurance_provider;

-- Active prescriptions view
CREATE VIEW active_prescriptions AS
SELECT
    p.*,
    u_patient.first_name as patient_first_name,
    u_patient.last_name as patient_last_name,
    u_doctor.first_name as doctor_first_name,
    u_doctor.last_name as doctor_last_name
FROM prescriptions p
JOIN users u_patient ON p.patient_id = u_patient.id
JOIN users u_doctor ON p.doctor_id = u_doctor.id
WHERE p.status = 'active'
  AND (p.expiration_date IS NULL OR p.expiration_date > CURRENT_DATE);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) for HIPAA Compliance
-- =====================================================

-- Enable RLS on sensitive tables
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_history ENABLE ROW LEVEL SECURITY;

-- Policies will be added based on application roles

-- =====================================================
-- GRANTS AND PERMISSIONS
-- =====================================================

-- Create application user (will be used by backend)
-- Run separately: CREATE USER medichat_app WITH PASSWORD 'your_secure_password';

-- Grant permissions (uncomment when user is created)
-- GRANT CONNECT ON DATABASE medichat TO medichat_app;
-- GRANT USAGE ON SCHEMA public TO medichat_app;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO medichat_app;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO medichat_app;

-- =====================================================
-- DATA RETENTION POLICY (HIPAA: 6 years minimum)
-- =====================================================

-- Function to archive old activity logs
CREATE OR REPLACE FUNCTION archive_old_activity_logs()
RETURNS void AS $$
BEGIN
    -- Archive logs older than 7 years to separate table
    -- This is a placeholder - implement based on retention policy
    -- For now, just add a comment
    RAISE NOTICE 'Activity log archival should be implemented';
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================
COMMENT ON TABLE users IS 'Core user accounts for patients, doctors, and administrators';
COMMENT ON TABLE patient_medical_info IS 'Extended medical information for patients - PHI data';
COMMENT ON TABLE allergies IS 'Patient allergies - CRITICAL for clinical decision support';
COMMENT ON TABLE medications IS 'Current and historical medications';
COMMENT ON TABLE conversations IS 'Medical consultation sessions with AI and doctor responses';
COMMENT ON TABLE prescriptions IS 'Prescriptions issued by doctors';
COMMENT ON TABLE activity_logs IS 'HIPAA-compliant audit trail for all system activities';
COMMENT ON TABLE sessions IS 'User session management for security';
COMMENT ON TABLE mfa_tokens IS 'Multi-factor authentication configuration';

-- =====================================================
-- INITIAL DATA (Optional)
-- =====================================================

-- Default admin user (password: Admin@123 - CHANGE IMMEDIATELY)
-- Hash generated with bcrypt for 'Admin@123'
INSERT INTO users (email, password_hash, role, first_name, last_name, is_active)
VALUES (
    'admin@medichat.com',
    '$2a$10$YourHashedPasswordHere', -- Replace with actual hash
    'admin',
    'System',
    'Administrator',
    true
);

-- =====================================================
-- SCHEMA VERSION TRACKING
-- =====================================================
CREATE TABLE IF NOT EXISTS schema_migrations (
    version INTEGER PRIMARY KEY,
    description TEXT NOT NULL,
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

INSERT INTO schema_migrations (version, description)
VALUES (1, 'Initial schema creation - Hospital-grade EMR database');

-- =====================================================
-- END OF SCHEMA
-- =====================================================
