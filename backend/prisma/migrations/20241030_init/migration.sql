-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('patient', 'doctor', 'admin');

-- CreateEnum
CREATE TYPE "ConversationStatus" AS ENUM ('in_progress', 'awaiting_doctor', 'doctor_responded', 'closed');

-- CreateEnum
CREATE TYPE "MessageRole" AS ENUM ('user', 'assistant', 'system');

-- CreateEnum
CREATE TYPE "Severity" AS ENUM ('mild', 'moderate', 'severe', 'life_threatening');

-- CreateEnum
CREATE TYPE "AllergenType" AS ENUM ('medication', 'food', 'environmental', 'other');

-- CreateEnum
CREATE TYPE "PrescriptionStatus" AS ENUM ('active', 'completed', 'cancelled', 'expired');

-- CreateEnum
CREATE TYPE "ActivityStatus" AS ENUM ('success', 'failure', 'error', 'warning');

-- CreateEnum
CREATE TYPE "LogSeverity" AS ENUM ('info', 'warning', 'error', 'critical');

-- CreateEnum
CREATE TYPE "AppointmentType" AS ENUM ('in_person', 'video', 'phone');

-- CreateEnum
CREATE TYPE "AppointmentStatus" AS ENUM ('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show', 'rescheduled');

-- CreateEnum
CREATE TYPE "LabTestCategory" AS ENUM ('hematology', 'chemistry', 'endocrinology', 'nutrition', 'microbiology', 'immunology', 'urinalysis', 'other');

-- CreateEnum
CREATE TYPE "LabResultStatus" AS ENUM ('normal', 'abnormal', 'critical', 'pending');

-- CreateEnum
CREATE TYPE "VitalSignType" AS ENUM ('blood_pressure', 'heart_rate', 'temperature', 'oxygen_saturation', 'respiratory_rate', 'weight', 'height', 'bmi');

-- CreateEnum
CREATE TYPE "CarePlanStatus" AS ENUM ('active', 'completed', 'cancelled', 'on_hold');

-- CreateEnum
CREATE TYPE "GoalStatus" AS ENUM ('not_started', 'in_progress', 'completed', 'deferred');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('pending', 'in_progress', 'completed', 'overdue');

-- CreateEnum
CREATE TYPE "DocumentCategory" AS ENUM ('lab_results', 'imaging', 'prescriptions', 'insurance', 'medical_records', 'consent_forms', 'discharge_summary', 'other');

-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('pending', 'paid', 'overdue', 'cancelled', 'partially_paid');

-- CreateEnum
CREATE TYPE "PaymentMethodType" AS ENUM ('credit_card', 'debit_card', 'insurance', 'cash', 'check', 'other');

-- CreateEnum
CREATE TYPE "DirectMessageStatus" AS ENUM ('sent', 'delivered', 'read');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "email" VARCHAR(255) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "role" "UserRole" NOT NULL,
    "first_name" VARCHAR(100) NOT NULL,
    "last_name" VARCHAR(100) NOT NULL,
    "phone" VARCHAR(20),
    "date_of_birth" DATE,
    "specialization" VARCHAR(100),
    "license_number" VARCHAR(50),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "last_login_at" TIMESTAMPTZ(6),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patient_medical_info" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "patient_id" UUID NOT NULL,
    "assigned_doctor_id" UUID,
    "blood_type" VARCHAR(10),
    "height_cm" DECIMAL(5,2),
    "weight_kg" DECIMAL(5,2),
    "emergency_contact_name" VARCHAR(200),
    "emergency_contact_phone" VARCHAR(20),
    "emergency_contact_relationship" VARCHAR(50),
    "insurance_provider" VARCHAR(200),
    "insurance_policy_number" VARCHAR(100),
    "insurance_group_number" VARCHAR(100),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "patient_medical_info_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "allergies" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "patient_id" UUID NOT NULL,
    "allergen" VARCHAR(200) NOT NULL,
    "allergen_type" "AllergenType",
    "reaction" TEXT,
    "severity" "Severity",
    "diagnosed_date" DATE,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "created_by" UUID,

    CONSTRAINT "allergies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "medications" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "patient_id" UUID NOT NULL,
    "medication_name" VARCHAR(200) NOT NULL,
    "dosage" VARCHAR(100),
    "frequency" VARCHAR(100),
    "route" VARCHAR(50),
    "start_date" DATE,
    "end_date" DATE,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "prescribing_doctor_id" UUID,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "medications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "medical_history" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "patient_id" UUID NOT NULL,
    "condition" VARCHAR(300) NOT NULL,
    "icd10_code" VARCHAR(20),
    "diagnosed_date" DATE,
    "resolved_date" DATE,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "diagnosed_by" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "medical_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversations" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "patient_id" UUID NOT NULL,
    "doctor_id" UUID,
    "visit_number" INTEGER NOT NULL,
    "status" "ConversationStatus" NOT NULL,
    "ai_summary" TEXT,
    "diagnosis" TEXT,
    "recommendations" TEXT,
    "referrals" TEXT,
    "call_to_office" BOOLEAN NOT NULL DEFAULT false,
    "doctor_notes" TEXT,
    "responded_at" TIMESTAMPTZ(6),
    "patient_notified" BOOLEAN NOT NULL DEFAULT false,
    "archived_by_patient" BOOLEAN NOT NULL DEFAULT false,
    "archived_by_doctor" BOOLEAN NOT NULL DEFAULT false,
    "conversation_ended_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "conversation_id" UUID NOT NULL,
    "role" "MessageRole" NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "symptoms" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "conversation_id" UUID NOT NULL,
    "symptom" VARCHAR(200) NOT NULL,
    "location" VARCHAR(100),
    "severity" "Severity",
    "duration" VARCHAR(100),
    "notes" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "symptoms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attachments" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "conversation_id" UUID NOT NULL,
    "filename" VARCHAR(255) NOT NULL,
    "original_name" VARCHAR(255) NOT NULL,
    "file_path" TEXT NOT NULL,
    "file_type" VARCHAR(100),
    "file_size_bytes" BIGINT,
    "mime_type" VARCHAR(100),
    "is_encrypted" BOOLEAN NOT NULL DEFAULT false,
    "checksum" VARCHAR(64),
    "uploaded_by" UUID,
    "uploaded_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "attachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prescriptions" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "conversation_id" UUID NOT NULL,
    "patient_id" UUID NOT NULL,
    "doctor_id" UUID NOT NULL,
    "medication_name" VARCHAR(200) NOT NULL,
    "dosage" VARCHAR(100) NOT NULL,
    "frequency" VARCHAR(100) NOT NULL,
    "duration" VARCHAR(100) NOT NULL,
    "quantity" INTEGER,
    "refills" INTEGER NOT NULL DEFAULT 0,
    "status" "PrescriptionStatus" NOT NULL DEFAULT 'active',
    "filled_date" DATE,
    "expiration_date" DATE,
    "pharmacy_name" VARCHAR(200),
    "pharmacy_phone" VARCHAR(20),
    "instructions" TEXT,
    "warnings" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "prescriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_logs" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "user_id" UUID,
    "user_role" "UserRole",
    "user_email" VARCHAR(255),
    "action" VARCHAR(100) NOT NULL,
    "resource_type" VARCHAR(50),
    "resource_id" UUID,
    "method" VARCHAR(10),
    "endpoint" TEXT,
    "ip_address" INET NOT NULL,
    "user_agent" TEXT,
    "status" "ActivityStatus" NOT NULL,
    "status_code" INTEGER,
    "description" TEXT,
    "metadata" JSONB,
    "error_message" TEXT,
    "error_stack" TEXT,
    "error_code" VARCHAR(50),
    "duration_ms" INTEGER,
    "severity" "LogSeverity" NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "user_id" UUID NOT NULL,
    "token_hash" VARCHAR(255) NOT NULL,
    "refresh_token_hash" VARCHAR(255),
    "device_info" TEXT,
    "ip_address" INET,
    "user_agent" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "last_activity_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "revoked_at" TIMESTAMPTZ(6),

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mfa_tokens" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "user_id" UUID NOT NULL,
    "secret" VARCHAR(255) NOT NULL,
    "is_enabled" BOOLEAN NOT NULL DEFAULT false,
    "backup_codes" TEXT[],
    "enabled_at" TIMESTAMPTZ(6),
    "last_used_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mfa_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "appointments" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "patient_id" UUID NOT NULL,
    "doctor_id" UUID NOT NULL,
    "appointment_date" TIMESTAMPTZ(6) NOT NULL,
    "duration" INTEGER NOT NULL DEFAULT 30,
    "type" "AppointmentType" NOT NULL,
    "status" "AppointmentStatus" NOT NULL DEFAULT 'scheduled',
    "location" VARCHAR(300),
    "video_link" TEXT,
    "room_number" VARCHAR(50),
    "reason" TEXT,
    "chief_complaint" TEXT,
    "notes" TEXT,
    "follow_up_for" UUID,
    "cancelled_at" TIMESTAMPTZ(6),
    "cancel_reason" TEXT,
    "rescheduled_from" UUID,
    "reminder_sent" BOOLEAN NOT NULL DEFAULT false,
    "reminder_sent_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "completed_at" TIMESTAMPTZ(6),

    CONSTRAINT "appointments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lab_results" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "patient_id" UUID NOT NULL,
    "test_name" VARCHAR(300) NOT NULL,
    "category" "LabTestCategory" NOT NULL,
    "test_code" VARCHAR(50),
    "result" TEXT NOT NULL,
    "unit" VARCHAR(50),
    "reference_range" VARCHAR(200),
    "status" "LabResultStatus" NOT NULL DEFAULT 'pending',
    "numeric_value" DECIMAL(10,2),
    "ordered_by" UUID,
    "performed_at" VARCHAR(300),
    "interpreted_by" UUID,
    "interpretation" TEXT,
    "is_critical" BOOLEAN NOT NULL DEFAULT false,
    "is_abnormal" BOOLEAN NOT NULL DEFAULT false,
    "collection_date" TIMESTAMPTZ(6),
    "result_date" TIMESTAMPTZ(6) NOT NULL,
    "reviewed_date" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "lab_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vital_signs" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "patient_id" UUID NOT NULL,
    "systolic_bp" INTEGER,
    "diastolic_bp" INTEGER,
    "heart_rate" INTEGER,
    "temperature" DECIMAL(4,1),
    "oxygen_saturation" INTEGER,
    "respiratory_rate" INTEGER,
    "weight" DECIMAL(5,2),
    "height" DECIMAL(5,2),
    "bmi" DECIMAL(4,1),
    "measured_by" UUID,
    "location" VARCHAR(200),
    "notes" TEXT,
    "measured_at" TIMESTAMPTZ(6) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vital_signs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "care_plans" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "patient_id" UUID NOT NULL,
    "doctor_id" UUID NOT NULL,
    "title" VARCHAR(300) NOT NULL,
    "description" TEXT,
    "category" VARCHAR(100),
    "status" "CarePlanStatus" NOT NULL DEFAULT 'active',
    "progress_percent" INTEGER NOT NULL DEFAULT 0,
    "start_date" DATE NOT NULL,
    "target_date" DATE,
    "completed_date" DATE,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "care_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "care_plan_goals" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "care_plan_id" UUID NOT NULL,
    "title" VARCHAR(300) NOT NULL,
    "description" TEXT,
    "target_value" VARCHAR(100),
    "current_value" VARCHAR(100),
    "unit" VARCHAR(50),
    "status" "GoalStatus" NOT NULL DEFAULT 'not_started',
    "progress_percent" INTEGER NOT NULL DEFAULT 0,
    "target_date" DATE,
    "achieved_date" DATE,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "care_plan_goals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "care_plan_tasks" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "care_plan_id" UUID NOT NULL,
    "title" VARCHAR(300) NOT NULL,
    "description" TEXT,
    "status" "TaskStatus" NOT NULL DEFAULT 'pending',
    "priority" VARCHAR(20),
    "due_date" DATE,
    "completed_date" DATE,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "care_plan_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documents" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "patient_id" UUID NOT NULL,
    "title" VARCHAR(300) NOT NULL,
    "description" TEXT,
    "category" "DocumentCategory" NOT NULL,
    "file_name" VARCHAR(300) NOT NULL,
    "file_path" TEXT NOT NULL,
    "file_type" VARCHAR(100) NOT NULL,
    "file_size" BIGINT NOT NULL,
    "mime_type" VARCHAR(100) NOT NULL,
    "is_encrypted" BOOLEAN NOT NULL DEFAULT false,
    "checksum" VARCHAR(64),
    "uploaded_by" UUID,
    "related_to" UUID,
    "uploaded_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoices" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "patient_id" UUID NOT NULL,
    "invoice_number" VARCHAR(50) NOT NULL,
    "description" TEXT NOT NULL,
    "status" "InvoiceStatus" NOT NULL DEFAULT 'pending',
    "total_amount" DECIMAL(10,2) NOT NULL,
    "paid_amount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "insurance_covered" DECIMAL(10,2),
    "patient_balance" DECIMAL(10,2) NOT NULL,
    "service_date" DATE NOT NULL,
    "service_type" VARCHAR(200),
    "provider_id" UUID,
    "due_date" DATE NOT NULL,
    "paid_date" DATE,
    "payment_method_id" UUID,
    "insurance_claim_number" VARCHAR(100),
    "insurance_claim_status" VARCHAR(50),
    "issued_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_methods" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "patient_id" UUID NOT NULL,
    "type" "PaymentMethodType" NOT NULL,
    "card_last_4" VARCHAR(4),
    "card_brand" VARCHAR(50),
    "card_exp_month" INTEGER,
    "card_exp_year" INTEGER,
    "card_holder_name" VARCHAR(200),
    "billing_address" TEXT,
    "billing_zip" VARCHAR(20),
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "stripe_payment_method_id" VARCHAR(255),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "payment_methods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "direct_messages" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "sender_id" UUID NOT NULL,
    "receiver_id" UUID NOT NULL,
    "subject" VARCHAR(300),
    "content" TEXT NOT NULL,
    "status" "DirectMessageStatus" NOT NULL DEFAULT 'sent',
    "read_at" TIMESTAMPTZ(6),
    "thread_id" UUID,
    "reply_to" UUID,
    "sent_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "direct_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "schema_migrations" (
    "version" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "applied_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "schema_migrations_pkey" PRIMARY KEY ("version")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_license_number_key" ON "users"("license_number");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE INDEX "users_license_number_idx" ON "users"("license_number");

-- CreateIndex
CREATE INDEX "users_is_active_idx" ON "users"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "patient_medical_info_patient_id_key" ON "patient_medical_info"("patient_id");

-- CreateIndex
CREATE INDEX "patient_medical_info_patient_id_idx" ON "patient_medical_info"("patient_id");

-- CreateIndex
CREATE INDEX "patient_medical_info_assigned_doctor_id_idx" ON "patient_medical_info"("assigned_doctor_id");

-- CreateIndex
CREATE INDEX "allergies_patient_id_idx" ON "allergies"("patient_id");

-- CreateIndex
CREATE INDEX "allergies_severity_idx" ON "allergies"("severity");

-- CreateIndex
CREATE UNIQUE INDEX "allergies_patient_id_allergen_key" ON "allergies"("patient_id", "allergen");

-- CreateIndex
CREATE INDEX "medications_patient_id_idx" ON "medications"("patient_id");

-- CreateIndex
CREATE INDEX "medications_is_active_idx" ON "medications"("is_active");

-- CreateIndex
CREATE INDEX "medications_prescribing_doctor_id_idx" ON "medications"("prescribing_doctor_id");

-- CreateIndex
CREATE INDEX "medical_history_patient_id_idx" ON "medical_history"("patient_id");

-- CreateIndex
CREATE INDEX "medical_history_is_active_idx" ON "medical_history"("is_active");

-- CreateIndex
CREATE INDEX "medical_history_icd10_code_idx" ON "medical_history"("icd10_code");

-- CreateIndex
CREATE INDEX "conversations_patient_id_created_at_idx" ON "conversations"("patient_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "conversations_doctor_id_status_idx" ON "conversations"("doctor_id", "status");

-- CreateIndex
CREATE INDEX "conversations_status_idx" ON "conversations"("status");

-- CreateIndex
CREATE UNIQUE INDEX "conversations_patient_id_visit_number_key" ON "conversations"("patient_id", "visit_number");

-- CreateIndex
CREATE INDEX "messages_conversation_id_created_at_idx" ON "messages"("conversation_id", "created_at");

-- CreateIndex
CREATE INDEX "messages_role_idx" ON "messages"("role");

-- CreateIndex
CREATE INDEX "symptoms_conversation_id_idx" ON "symptoms"("conversation_id");

-- CreateIndex
CREATE INDEX "symptoms_severity_idx" ON "symptoms"("severity");

-- CreateIndex
CREATE INDEX "attachments_conversation_id_idx" ON "attachments"("conversation_id");

-- CreateIndex
CREATE INDEX "attachments_uploaded_by_idx" ON "attachments"("uploaded_by");

-- CreateIndex
CREATE INDEX "prescriptions_conversation_id_idx" ON "prescriptions"("conversation_id");

-- CreateIndex
CREATE INDEX "prescriptions_patient_id_created_at_idx" ON "prescriptions"("patient_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "prescriptions_doctor_id_idx" ON "prescriptions"("doctor_id");

-- CreateIndex
CREATE INDEX "prescriptions_status_idx" ON "prescriptions"("status");

-- CreateIndex
CREATE INDEX "activity_logs_user_id_created_at_idx" ON "activity_logs"("user_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "activity_logs_action_created_at_idx" ON "activity_logs"("action", "created_at" DESC);

-- CreateIndex
CREATE INDEX "activity_logs_status_created_at_idx" ON "activity_logs"("status", "created_at" DESC);

-- CreateIndex
CREATE INDEX "activity_logs_severity_created_at_idx" ON "activity_logs"("severity", "created_at" DESC);

-- CreateIndex
CREATE INDEX "activity_logs_resource_type_resource_id_idx" ON "activity_logs"("resource_type", "resource_id");

-- CreateIndex
CREATE INDEX "activity_logs_created_at_idx" ON "activity_logs"("created_at" DESC);

-- CreateIndex
CREATE INDEX "activity_logs_ip_address_idx" ON "activity_logs"("ip_address");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_token_hash_key" ON "sessions"("token_hash");

-- CreateIndex
CREATE INDEX "sessions_user_id_is_active_idx" ON "sessions"("user_id", "is_active");

-- CreateIndex
CREATE INDEX "sessions_token_hash_idx" ON "sessions"("token_hash");

-- CreateIndex
CREATE INDEX "sessions_expires_at_idx" ON "sessions"("expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "mfa_tokens_user_id_key" ON "mfa_tokens"("user_id");

-- CreateIndex
CREATE INDEX "mfa_tokens_user_id_idx" ON "mfa_tokens"("user_id");

-- CreateIndex
CREATE INDEX "appointments_patient_id_appointment_date_idx" ON "appointments"("patient_id", "appointment_date" DESC);

-- CreateIndex
CREATE INDEX "appointments_doctor_id_appointment_date_idx" ON "appointments"("doctor_id", "appointment_date");

-- CreateIndex
CREATE INDEX "appointments_status_appointment_date_idx" ON "appointments"("status", "appointment_date");

-- CreateIndex
CREATE INDEX "appointments_appointment_date_idx" ON "appointments"("appointment_date");

-- CreateIndex
CREATE INDEX "lab_results_patient_id_result_date_idx" ON "lab_results"("patient_id", "result_date" DESC);

-- CreateIndex
CREATE INDEX "lab_results_category_result_date_idx" ON "lab_results"("category", "result_date" DESC);

-- CreateIndex
CREATE INDEX "lab_results_status_idx" ON "lab_results"("status");

-- CreateIndex
CREATE INDEX "lab_results_is_critical_idx" ON "lab_results"("is_critical");

-- CreateIndex
CREATE INDEX "vital_signs_patient_id_measured_at_idx" ON "vital_signs"("patient_id", "measured_at" DESC);

-- CreateIndex
CREATE INDEX "vital_signs_measured_at_idx" ON "vital_signs"("measured_at" DESC);

-- CreateIndex
CREATE INDEX "care_plans_patient_id_status_idx" ON "care_plans"("patient_id", "status");

-- CreateIndex
CREATE INDEX "care_plans_doctor_id_status_idx" ON "care_plans"("doctor_id", "status");

-- CreateIndex
CREATE INDEX "care_plans_status_idx" ON "care_plans"("status");

-- CreateIndex
CREATE INDEX "care_plan_goals_care_plan_id_idx" ON "care_plan_goals"("care_plan_id");

-- CreateIndex
CREATE INDEX "care_plan_goals_status_idx" ON "care_plan_goals"("status");

-- CreateIndex
CREATE INDEX "care_plan_tasks_care_plan_id_idx" ON "care_plan_tasks"("care_plan_id");

-- CreateIndex
CREATE INDEX "care_plan_tasks_status_due_date_idx" ON "care_plan_tasks"("status", "due_date");

-- CreateIndex
CREATE INDEX "documents_patient_id_category_idx" ON "documents"("patient_id", "category");

-- CreateIndex
CREATE INDEX "documents_category_uploaded_at_idx" ON "documents"("category", "uploaded_at" DESC);

-- CreateIndex
CREATE INDEX "documents_uploaded_at_idx" ON "documents"("uploaded_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "invoices_invoice_number_key" ON "invoices"("invoice_number");

-- CreateIndex
CREATE INDEX "invoices_patient_id_status_idx" ON "invoices"("patient_id", "status");

-- CreateIndex
CREATE INDEX "invoices_invoice_number_idx" ON "invoices"("invoice_number");

-- CreateIndex
CREATE INDEX "invoices_status_due_date_idx" ON "invoices"("status", "due_date");

-- CreateIndex
CREATE UNIQUE INDEX "payment_methods_stripe_payment_method_id_key" ON "payment_methods"("stripe_payment_method_id");

-- CreateIndex
CREATE INDEX "payment_methods_patient_id_is_default_idx" ON "payment_methods"("patient_id", "is_default");

-- CreateIndex
CREATE INDEX "payment_methods_patient_id_is_active_idx" ON "payment_methods"("patient_id", "is_active");

-- CreateIndex
CREATE INDEX "direct_messages_sender_id_created_at_idx" ON "direct_messages"("sender_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "direct_messages_receiver_id_status_created_at_idx" ON "direct_messages"("receiver_id", "status", "created_at" DESC);

-- CreateIndex
CREATE INDEX "direct_messages_thread_id_created_at_idx" ON "direct_messages"("thread_id", "created_at");

-- AddForeignKey
ALTER TABLE "patient_medical_info" ADD CONSTRAINT "patient_medical_info_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_medical_info" ADD CONSTRAINT "patient_medical_info_assigned_doctor_id_fkey" FOREIGN KEY ("assigned_doctor_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "allergies" ADD CONSTRAINT "allergies_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medications" ADD CONSTRAINT "medications_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medications" ADD CONSTRAINT "medications_prescribing_doctor_id_fkey" FOREIGN KEY ("prescribing_doctor_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medical_history" ADD CONSTRAINT "medical_history_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medical_history" ADD CONSTRAINT "medical_history_diagnosed_by_fkey" FOREIGN KEY ("diagnosed_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "symptoms" ADD CONSTRAINT "symptoms_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mfa_tokens" ADD CONSTRAINT "mfa_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lab_results" ADD CONSTRAINT "lab_results_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vital_signs" ADD CONSTRAINT "vital_signs_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "care_plans" ADD CONSTRAINT "care_plans_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "care_plans" ADD CONSTRAINT "care_plans_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "care_plan_goals" ADD CONSTRAINT "care_plan_goals_care_plan_id_fkey" FOREIGN KEY ("care_plan_id") REFERENCES "care_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "care_plan_tasks" ADD CONSTRAINT "care_plan_tasks_care_plan_id_fkey" FOREIGN KEY ("care_plan_id") REFERENCES "care_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_methods" ADD CONSTRAINT "payment_methods_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "direct_messages" ADD CONSTRAINT "direct_messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "direct_messages" ADD CONSTRAINT "direct_messages_receiver_id_fkey" FOREIGN KEY ("receiver_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

