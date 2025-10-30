/**
 * ================================================================
 * MEDICHAT DATABASE SEED SCRIPT
 * Populates PostgreSQL database with comprehensive sample data
 * for testing all EMR features
 * ================================================================
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// Helper function to generate dates
const daysAgo = (days) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
};

const daysFromNow = (days) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
};

async function main() {
  console.log('🌱 Starting database seed...\n');

  // ================================================================
  // 1. CLEAR EXISTING DATA
  // ================================================================
  console.log('🗑️  Clearing existing data...');

  // Delete in reverse order of dependencies
  await prisma.directMessage.deleteMany({});
  await prisma.paymentMethod.deleteMany({});
  await prisma.invoice.deleteMany({});
  await prisma.document.deleteMany({});
  await prisma.carePlanTask.deleteMany({});
  await prisma.carePlanGoal.deleteMany({});
  await prisma.carePlan.deleteMany({});
  await prisma.vitalSign.deleteMany({});
  await prisma.labResult.deleteMany({});
  await prisma.appointment.deleteMany({});
  await prisma.prescription.deleteMany({});
  await prisma.symptom.deleteMany({});
  await prisma.attachment.deleteMany({});
  await prisma.message.deleteMany({});
  await prisma.conversation.deleteMany({});
  await prisma.medicalHistory.deleteMany({});
  await prisma.medication.deleteMany({});
  await prisma.allergy.deleteMany({});
  await prisma.activityLog.deleteMany({});
  await prisma.session.deleteMany({});
  await prisma.mfaToken.deleteMany({});
  await prisma.patientMedicalInfo.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('✓ Existing data cleared\n');

  // ================================================================
  // 2. CREATE USERS
  // ================================================================
  console.log('👥 Creating users...');

  const password = await bcrypt.hash('password123', 10);

  // Create Admin
  const admin = await prisma.user.create({
    data: {
      email: 'admin@medichat.com',
      passwordHash: password,
      role: 'admin',
      firstName: 'System',
      lastName: 'Administrator',
      phone: '+1-555-0001',
      dateOfBirth: new Date('1985-01-15'),
      isActive: true,
      emailVerified: true,
    },
  });
  console.log('✓ Admin created:', admin.email);

  // Create Doctors
  const doctor1 = await prisma.user.create({
    data: {
      email: 'dr.smith@medichat.com',
      passwordHash: password,
      role: 'doctor',
      firstName: 'Sarah',
      lastName: 'Smith',
      phone: '+1-555-0101',
      dateOfBirth: new Date('1978-05-20'),
      specialization: 'Internal Medicine',
      licenseNumber: 'MD-123456',
      isActive: true,
      emailVerified: true,
    },
  });
  console.log('✓ Doctor created:', doctor1.email);

  const doctor2 = await prisma.user.create({
    data: {
      email: 'dr.johnson@medichat.com',
      passwordHash: password,
      role: 'doctor',
      firstName: 'Michael',
      lastName: 'Johnson',
      phone: '+1-555-0102',
      dateOfBirth: new Date('1982-09-12'),
      specialization: 'Cardiology',
      licenseNumber: 'MD-234567',
      isActive: true,
      emailVerified: true,
    },
  });
  console.log('✓ Doctor created:', doctor2.email);

  const doctor3 = await prisma.user.create({
    data: {
      email: 'dr.chen@medichat.com',
      passwordHash: password,
      role: 'doctor',
      firstName: 'Emily',
      lastName: 'Chen',
      phone: '+1-555-0103',
      dateOfBirth: new Date('1985-03-08'),
      specialization: 'Endocrinology',
      licenseNumber: 'MD-345678',
      isActive: true,
      emailVerified: true,
    },
  });
  console.log('✓ Doctor created:', doctor3.email);

  // Create Patients
  const patient1 = await prisma.user.create({
    data: {
      email: 'john.doe@example.com',
      passwordHash: password,
      role: 'patient',
      firstName: 'John',
      lastName: 'Doe',
      phone: '+1-555-1001',
      dateOfBirth: new Date('1990-06-15'),
      isActive: true,
      emailVerified: true,
      patientMedicalInfo: {
        create: {
          bloodType: 'O+',
          heightCm: 178,
          weightKg: 82,
          emergencyContactName: 'Jane Doe',
          emergencyContactPhone: '+1-555-1002',
          emergencyContactRelationship: 'Spouse',
          insuranceProvider: 'BlueCross BlueShield',
          insurancePolicyNumber: 'BC-123456789',
          insuranceGroupNumber: 'GRP-001',
          assignedDoctorId: doctor1.id,
        },
      },
    },
  });
  console.log('✓ Patient created:', patient1.email);

  const patient2 = await prisma.user.create({
    data: {
      email: 'maria.garcia@example.com',
      passwordHash: password,
      role: 'patient',
      firstName: 'Maria',
      lastName: 'Garcia',
      phone: '+1-555-1003',
      dateOfBirth: new Date('1985-03-22'),
      isActive: true,
      emailVerified: true,
      patientMedicalInfo: {
        create: {
          bloodType: 'A+',
          heightCm: 165,
          weightKg: 68,
          emergencyContactName: 'Carlos Garcia',
          emergencyContactPhone: '+1-555-1004',
          emergencyContactRelationship: 'Spouse',
          insuranceProvider: 'Aetna',
          insurancePolicyNumber: 'AET-987654321',
          insuranceGroupNumber: 'GRP-002',
          assignedDoctorId: doctor2.id,
        },
      },
    },
  });
  console.log('✓ Patient created:', patient2.email);

  const patient3 = await prisma.user.create({
    data: {
      email: 'robert.chen@example.com',
      passwordHash: password,
      role: 'patient',
      firstName: 'Robert',
      lastName: 'Chen',
      phone: '+1-555-1005',
      dateOfBirth: new Date('1975-11-08'),
      isActive: true,
      emailVerified: true,
      patientMedicalInfo: {
        create: {
          bloodType: 'B+',
          heightCm: 172,
          weightKg: 78,
          emergencyContactName: 'Lisa Chen',
          emergencyContactPhone: '+1-555-1006',
          emergencyContactRelationship: 'Spouse',
          insuranceProvider: 'UnitedHealthcare',
          insurancePolicyNumber: 'UHC-456789123',
          insuranceGroupNumber: 'GRP-003',
          assignedDoctorId: doctor3.id,
        },
      },
    },
  });
  console.log('✓ Patient created:', patient3.email);

  console.log('\n');

  // ================================================================
  // 3. CREATE ALLERGIES
  // ================================================================
  console.log('🤧 Creating allergies...');

  await prisma.allergy.createMany({
    data: [
      {
        patientId: patient1.id,
        allergen: 'Penicillin',
        allergenType: 'medication',
        reaction: 'Hives, difficulty breathing',
        severity: 'severe',
        diagnosedDate: new Date('2015-06-10'),
        notes: 'Anaphylactic reaction in 2015',
      },
      {
        patientId: patient1.id,
        allergen: 'Peanuts',
        allergenType: 'food',
        reaction: 'Swelling, itching',
        severity: 'moderate',
        diagnosedDate: new Date('2010-03-15'),
      },
      {
        patientId: patient2.id,
        allergen: 'Sulfa drugs',
        allergenType: 'medication',
        reaction: 'Rash, fever',
        severity: 'moderate',
        diagnosedDate: new Date('2018-09-20'),
      },
      {
        patientId: patient3.id,
        allergen: 'Latex',
        allergenType: 'environmental',
        reaction: 'Skin irritation',
        severity: 'mild',
        diagnosedDate: new Date('2012-07-05'),
      },
    ],
  });
  console.log('✓ Allergies created\n');

  // ================================================================
  // 4. CREATE MEDICATIONS
  // ================================================================
  console.log('💊 Creating medications...');

  await prisma.medication.createMany({
    data: [
      {
        patientId: patient1.id,
        medicationName: 'Lisinopril',
        dosage: '10mg',
        frequency: 'Once daily',
        route: 'oral',
        startDate: new Date('2022-01-15'),
        isActive: true,
        prescribingDoctorId: doctor1.id,
        notes: 'For blood pressure control',
      },
      {
        patientId: patient1.id,
        medicationName: 'Atorvastatin',
        dosage: '20mg',
        frequency: 'Once daily at bedtime',
        route: 'oral',
        startDate: new Date('2022-06-01'),
        isActive: true,
        prescribingDoctorId: doctor1.id,
        notes: 'For cholesterol management',
      },
      {
        patientId: patient2.id,
        medicationName: 'Metformin',
        dosage: '500mg',
        frequency: 'Twice daily with meals',
        route: 'oral',
        startDate: new Date('2021-03-10'),
        isActive: true,
        prescribingDoctorId: doctor2.id,
        notes: 'For Type 2 diabetes management',
      },
      {
        patientId: patient3.id,
        medicationName: 'Levothyroxine',
        dosage: '75mcg',
        frequency: 'Once daily in the morning',
        route: 'oral',
        startDate: new Date('2020-08-15'),
        isActive: true,
        prescribingDoctorId: doctor3.id,
        notes: 'For hypothyroidism',
      },
    ],
  });
  console.log('✓ Medications created\n');

  // ================================================================
  // 5. CREATE MEDICAL HISTORY
  // ================================================================
  console.log('📋 Creating medical history...');

  await prisma.medicalHistory.createMany({
    data: [
      {
        patientId: patient1.id,
        condition: 'Hypertension',
        icd10Code: 'I10',
        diagnosedDate: new Date('2022-01-10'),
        isActive: true,
        diagnosedBy: doctor1.id,
        notes: 'Essential hypertension, well-controlled with medication',
      },
      {
        patientId: patient1.id,
        condition: 'Hyperlipidemia',
        icd10Code: 'E78.5',
        diagnosedDate: new Date('2022-05-20'),
        isActive: true,
        diagnosedBy: doctor1.id,
      },
      {
        patientId: patient2.id,
        condition: 'Type 2 Diabetes Mellitus',
        icd10Code: 'E11.9',
        diagnosedDate: new Date('2021-02-15'),
        isActive: true,
        diagnosedBy: doctor2.id,
        notes: 'Managed with Metformin and diet',
      },
      {
        patientId: patient3.id,
        condition: 'Hypothyroidism',
        icd10Code: 'E03.9',
        diagnosedDate: new Date('2020-08-01'),
        isActive: true,
        diagnosedBy: doctor3.id,
      },
    ],
  });
  console.log('✓ Medical history created\n');

  // ================================================================
  // 6. CREATE APPOINTMENTS
  // ================================================================
  console.log('📅 Creating appointments...');

  await prisma.appointment.createMany({
    data: [
      // Past appointments
      {
        patientId: patient1.id,
        doctorId: doctor1.id,
        appointmentDate: daysAgo(30),
        duration: 30,
        type: 'in_person',
        status: 'completed',
        location: 'Medical Center, Room 205',
        reason: 'Annual physical examination',
        chiefComplaint: 'Routine checkup',
        completedAt: daysAgo(30),
      },
      {
        patientId: patient1.id,
        doctorId: doctor1.id,
        appointmentDate: daysAgo(15),
        duration: 20,
        type: 'video',
        status: 'completed',
        videoLink: 'https://meet.medichat.com/abc123',
        reason: 'Blood pressure follow-up',
        chiefComplaint: 'BP monitoring',
        completedAt: daysAgo(15),
      },
      {
        patientId: patient2.id,
        doctorId: doctor2.id,
        appointmentDate: daysAgo(20),
        duration: 45,
        type: 'in_person',
        status: 'completed',
        location: 'Cardiology Clinic, Suite 300',
        reason: 'Diabetes management review',
        chiefComplaint: 'Blood sugar control discussion',
        completedAt: daysAgo(20),
      },
      // Upcoming appointments
      {
        patientId: patient1.id,
        doctorId: doctor1.id,
        appointmentDate: daysFromNow(7),
        duration: 30,
        type: 'in_person',
        status: 'confirmed',
        location: 'Medical Center, Room 205',
        reason: 'Follow-up visit',
        chiefComplaint: 'Medication review',
        reminderSent: true,
        reminderSentAt: daysFromNow(6),
      },
      {
        patientId: patient2.id,
        doctorId: doctor2.id,
        appointmentDate: daysFromNow(14),
        duration: 30,
        type: 'video',
        status: 'scheduled',
        videoLink: 'https://meet.medichat.com/def456',
        reason: 'Quarterly diabetes checkup',
        chiefComplaint: 'Review lab results and adjust medications',
      },
      {
        patientId: patient3.id,
        doctorId: doctor3.id,
        appointmentDate: daysFromNow(21),
        duration: 20,
        type: 'phone',
        status: 'scheduled',
        reason: 'Thyroid medication adjustment',
        chiefComplaint: 'Discuss recent thyroid panel results',
      },
      // Cancelled appointment
      {
        patientId: patient3.id,
        doctorId: doctor3.id,
        appointmentDate: daysAgo(5),
        duration: 30,
        type: 'in_person',
        status: 'cancelled',
        location: 'Endocrine Center, Room 101',
        reason: 'Routine thyroid checkup',
        cancelledAt: daysAgo(6),
        cancelReason: 'Patient scheduling conflict',
      },
    ],
  });
  console.log('✓ Appointments created\n');

  // ================================================================
  // 7. CREATE LAB RESULTS
  // ================================================================
  console.log('🔬 Creating lab results...');

  await prisma.labResult.createMany({
    data: [
      // Patient 1 - Lipid Panel (trending)
      {
        patientId: patient1.id,
        testName: 'Total Cholesterol',
        category: 'chemistry',
        testCode: '2093-3',
        result: '185',
        unit: 'mg/dL',
        referenceRange: '<200',
        status: 'normal',
        numericValue: 185,
        orderedBy: doctor1.id,
        performedAt: 'Quest Diagnostics Lab',
        collectionDate: daysAgo(10),
        resultDate: daysAgo(8),
        reviewedDate: daysAgo(7),
        isAbnormal: false,
      },
      {
        patientId: patient1.id,
        testName: 'LDL Cholesterol',
        category: 'chemistry',
        testCode: '13457-7',
        result: '98',
        unit: 'mg/dL',
        referenceRange: '<100',
        status: 'normal',
        numericValue: 98,
        orderedBy: doctor1.id,
        performedAt: 'Quest Diagnostics Lab',
        collectionDate: daysAgo(10),
        resultDate: daysAgo(8),
        reviewedDate: daysAgo(7),
        isAbnormal: false,
      },
      {
        patientId: patient1.id,
        testName: 'HDL Cholesterol',
        category: 'chemistry',
        testCode: '2085-9',
        result: '62',
        unit: 'mg/dL',
        referenceRange: '>40',
        status: 'normal',
        numericValue: 62,
        orderedBy: doctor1.id,
        performedAt: 'Quest Diagnostics Lab',
        collectionDate: daysAgo(10),
        resultDate: daysAgo(8),
        reviewedDate: daysAgo(7),
        isAbnormal: false,
      },
      // Patient 1 - Complete Blood Count
      {
        patientId: patient1.id,
        testName: 'White Blood Cell Count',
        category: 'hematology',
        testCode: '6690-2',
        result: '7.2',
        unit: 'K/uL',
        referenceRange: '4.5-11.0',
        status: 'normal',
        numericValue: 7.2,
        orderedBy: doctor1.id,
        performedAt: 'LabCorp',
        collectionDate: daysAgo(30),
        resultDate: daysAgo(29),
        reviewedDate: daysAgo(28),
        isAbnormal: false,
      },
      {
        patientId: patient1.id,
        testName: 'Hemoglobin',
        category: 'hematology',
        testCode: '718-7',
        result: '14.8',
        unit: 'g/dL',
        referenceRange: '13.5-17.5',
        status: 'normal',
        numericValue: 14.8,
        orderedBy: doctor1.id,
        performedAt: 'LabCorp',
        collectionDate: daysAgo(30),
        resultDate: daysAgo(29),
        reviewedDate: daysAgo(28),
        isAbnormal: false,
      },
      // Patient 2 - HbA1c (Diabetes monitoring, trending)
      {
        patientId: patient2.id,
        testName: 'Hemoglobin A1c',
        category: 'endocrinology',
        testCode: '4548-4',
        result: '6.8',
        unit: '%',
        referenceRange: '<5.7',
        status: 'abnormal',
        numericValue: 6.8,
        orderedBy: doctor2.id,
        performedAt: 'Quest Diagnostics Lab',
        interpretation: 'Prediabetic range, continue monitoring and lifestyle modifications',
        collectionDate: daysAgo(5),
        resultDate: daysAgo(3),
        reviewedDate: daysAgo(2),
        isAbnormal: true,
      },
      {
        patientId: patient2.id,
        testName: 'Fasting Glucose',
        category: 'chemistry',
        testCode: '1558-6',
        result: '118',
        unit: 'mg/dL',
        referenceRange: '70-100',
        status: 'abnormal',
        numericValue: 118,
        orderedBy: doctor2.id,
        performedAt: 'Quest Diagnostics Lab',
        collectionDate: daysAgo(5),
        resultDate: daysAgo(3),
        reviewedDate: daysAgo(2),
        isAbnormal: true,
      },
      // Patient 3 - Thyroid Panel (trending)
      {
        patientId: patient3.id,
        testName: 'TSH',
        category: 'endocrinology',
        testCode: '3016-3',
        result: '2.8',
        unit: 'mIU/L',
        referenceRange: '0.4-4.0',
        status: 'normal',
        numericValue: 2.8,
        orderedBy: doctor3.id,
        performedAt: 'LabCorp',
        interpretation: 'Thyroid function well-controlled',
        collectionDate: daysAgo(12),
        resultDate: daysAgo(10),
        reviewedDate: daysAgo(9),
        isAbnormal: false,
      },
      {
        patientId: patient3.id,
        testName: 'Free T4',
        category: 'endocrinology',
        testCode: '3024-7',
        result: '1.2',
        unit: 'ng/dL',
        referenceRange: '0.8-1.8',
        status: 'normal',
        numericValue: 1.2,
        orderedBy: doctor3.id,
        performedAt: 'LabCorp',
        collectionDate: daysAgo(12),
        resultDate: daysAgo(10),
        reviewedDate: daysAgo(9),
        isAbnormal: false,
      },
    ],
  });
  console.log('✓ Lab results created\n');

  // ================================================================
  // 8. CREATE VITAL SIGNS
  // ================================================================
  console.log('💓 Creating vital signs...');

  await prisma.vitalSign.createMany({
    data: [
      // Patient 1 - Recent vitals (trending)
      {
        patientId: patient1.id,
        systolicBp: 128,
        diastolicBp: 82,
        heartRate: 72,
        temperature: 98.6,
        oxygenSat: 98,
        respiratoryRate: 16,
        weight: 82.0,
        height: 178.0,
        bmi: 25.9,
        measuredAt: daysAgo(1),
        location: 'Home',
        notes: 'Self-monitored at home',
      },
      {
        patientId: patient1.id,
        systolicBp: 132,
        diastolicBp: 84,
        heartRate: 75,
        temperature: 98.4,
        oxygenSat: 97,
        respiratoryRate: 16,
        weight: 81.8,
        height: 178.0,
        bmi: 25.8,
        measuredAt: daysAgo(7),
        location: 'Medical Center',
        measuredBy: doctor1.id,
      },
      {
        patientId: patient1.id,
        systolicBp: 135,
        diastolicBp: 86,
        heartRate: 78,
        temperature: 98.7,
        oxygenSat: 98,
        respiratoryRate: 18,
        weight: 82.2,
        height: 178.0,
        bmi: 26.0,
        measuredAt: daysAgo(14),
        location: 'Medical Center',
        measuredBy: doctor1.id,
      },
      {
        patientId: patient1.id,
        systolicBp: 138,
        diastolicBp: 88,
        heartRate: 80,
        temperature: 98.5,
        oxygenSat: 97,
        respiratoryRate: 17,
        weight: 82.5,
        height: 178.0,
        bmi: 26.1,
        measuredAt: daysAgo(30),
        location: 'Medical Center',
        measuredBy: doctor1.id,
        notes: 'Annual physical exam',
      },
      // Patient 2 - Recent vitals
      {
        patientId: patient2.id,
        systolicBp: 118,
        diastolicBp: 76,
        heartRate: 68,
        temperature: 98.3,
        oxygenSat: 99,
        respiratoryRate: 14,
        weight: 68.0,
        height: 165.0,
        bmi: 25.0,
        measuredAt: daysAgo(2),
        location: 'Home',
        notes: 'Morning measurement',
      },
      {
        patientId: patient2.id,
        systolicBp: 120,
        diastolicBp: 78,
        heartRate: 70,
        temperature: 98.6,
        oxygenSat: 98,
        respiratoryRate: 15,
        weight: 68.2,
        height: 165.0,
        bmi: 25.1,
        measuredAt: daysAgo(20),
        location: 'Cardiology Clinic',
        measuredBy: doctor2.id,
      },
      // Patient 3 - Recent vitals
      {
        patientId: patient3.id,
        systolicBp: 124,
        diastolicBp: 80,
        heartRate: 74,
        temperature: 98.4,
        oxygenSat: 98,
        respiratoryRate: 16,
        weight: 78.0,
        height: 172.0,
        bmi: 26.4,
        measuredAt: daysAgo(3),
        location: 'Home',
      },
      {
        patientId: patient3.id,
        systolicBp: 122,
        diastolicBp: 78,
        heartRate: 72,
        temperature: 98.5,
        oxygenSat: 99,
        respiratoryRate: 15,
        weight: 77.8,
        height: 172.0,
        bmi: 26.3,
        measuredAt: daysAgo(15),
        location: 'Endocrine Center',
        measuredBy: doctor3.id,
      },
    ],
  });
  console.log('✓ Vital signs created\n');

  // ================================================================
  // 9. CREATE CARE PLANS
  // ================================================================
  console.log('📝 Creating care plans...');

  // Patient 1 - Hypertension Management
  const carePlan1 = await prisma.carePlan.create({
    data: {
      patientId: patient1.id,
      doctorId: doctor1.id,
      title: 'Hypertension Management Plan',
      description: 'Comprehensive plan to manage and reduce blood pressure through medication, diet, and lifestyle changes',
      category: 'Cardiovascular Health',
      status: 'active',
      progressPercent: 65,
      startDate: new Date('2024-01-15'),
      targetDate: new Date('2024-07-15'),
    },
  });

  await prisma.carePlanGoal.createMany({
    data: [
      {
        carePlanId: carePlan1.id,
        title: 'Reduce systolic BP to <130 mmHg',
        description: 'Target blood pressure reading below 130/80',
        targetValue: '130',
        currentValue: '128',
        unit: 'mmHg',
        status: 'in_progress',
        progressPercent: 80,
        targetDate: new Date('2024-07-15'),
      },
      {
        carePlanId: carePlan1.id,
        title: 'Reduce weight by 10 pounds',
        description: 'Achieve target weight through diet and exercise',
        targetValue: '180',
        currentValue: '181',
        unit: 'lbs',
        status: 'in_progress',
        progressPercent: 50,
        targetDate: new Date('2024-07-15'),
      },
      {
        carePlanId: carePlan1.id,
        title: 'Exercise 150 minutes per week',
        description: 'Moderate aerobic activity for cardiovascular health',
        targetValue: '150',
        currentValue: '120',
        unit: 'minutes/week',
        status: 'in_progress',
        progressPercent: 60,
        targetDate: new Date('2024-07-15'),
      },
    ],
  });

  await prisma.carePlanTask.createMany({
    data: [
      {
        carePlanId: carePlan1.id,
        title: 'Take Lisinopril daily',
        description: 'Take 10mg Lisinopril every morning',
        status: 'in_progress',
        priority: 'high',
        dueDate: daysFromNow(1),
      },
      {
        carePlanId: carePlan1.id,
        title: 'Monitor blood pressure daily',
        description: 'Record BP readings every morning',
        status: 'in_progress',
        priority: 'high',
        dueDate: daysFromNow(1),
      },
      {
        carePlanId: carePlan1.id,
        title: 'Follow DASH diet',
        description: 'Reduce sodium intake, eat more fruits and vegetables',
        status: 'in_progress',
        priority: 'medium',
        dueDate: daysFromNow(30),
      },
      {
        carePlanId: carePlan1.id,
        title: 'Walk 30 minutes daily',
        description: 'Moderate-intensity aerobic exercise',
        status: 'in_progress',
        priority: 'medium',
        dueDate: daysFromNow(1),
      },
      {
        carePlanId: carePlan1.id,
        title: 'Follow-up appointment',
        description: 'Schedule next BP check with Dr. Smith',
        status: 'completed',
        priority: 'high',
        dueDate: daysAgo(5),
        completedDate: daysAgo(5),
      },
    ],
  });

  // Patient 2 - Diabetes Management
  const carePlan2 = await prisma.carePlan.create({
    data: {
      patientId: patient2.id,
      doctorId: doctor2.id,
      title: 'Type 2 Diabetes Management',
      description: 'Control blood sugar levels through medication, diet, exercise, and regular monitoring',
      category: 'Diabetes Management',
      status: 'active',
      progressPercent: 70,
      startDate: new Date('2024-02-01'),
      targetDate: new Date('2024-08-01'),
    },
  });

  await prisma.carePlanGoal.createMany({
    data: [
      {
        carePlanId: carePlan2.id,
        title: 'Achieve HbA1c below 7.0%',
        description: 'Reduce HbA1c from current 6.8% to below 7.0%',
        targetValue: '6.5',
        currentValue: '6.8',
        unit: '%',
        status: 'in_progress',
        progressPercent: 75,
        targetDate: new Date('2024-08-01'),
      },
      {
        carePlanId: carePlan2.id,
        title: 'Maintain fasting glucose 80-100 mg/dL',
        description: 'Keep morning fasting blood sugar in normal range',
        targetValue: '100',
        currentValue: '118',
        unit: 'mg/dL',
        status: 'in_progress',
        progressPercent: 60,
        targetDate: new Date('2024-08-01'),
      },
    ],
  });

  await prisma.carePlanTask.createMany({
    data: [
      {
        carePlanId: carePlan2.id,
        title: 'Take Metformin twice daily',
        description: 'Take 500mg Metformin with breakfast and dinner',
        status: 'in_progress',
        priority: 'high',
        dueDate: daysFromNow(1),
      },
      {
        carePlanId: carePlan2.id,
        title: 'Check blood glucose 2x daily',
        description: 'Morning fasting and 2 hours after dinner',
        status: 'in_progress',
        priority: 'high',
        dueDate: daysFromNow(1),
      },
      {
        carePlanId: carePlan2.id,
        title: 'Carbohydrate counting',
        description: 'Track daily carb intake, aim for 45-60g per meal',
        status: 'in_progress',
        priority: 'medium',
        dueDate: daysFromNow(7),
      },
      {
        carePlanId: carePlan2.id,
        title: 'Exercise 30 minutes, 5 days/week',
        description: 'Walking, swimming, or cycling',
        status: 'in_progress',
        priority: 'medium',
        dueDate: daysFromNow(7),
      },
    ],
  });

  // Patient 3 - Thyroid Management
  const carePlan3 = await prisma.carePlan.create({
    data: {
      patientId: patient3.id,
      doctorId: doctor3.id,
      title: 'Hypothyroidism Management',
      description: 'Maintain optimal thyroid function with medication and regular monitoring',
      category: 'Endocrine Health',
      status: 'active',
      progressPercent: 85,
      startDate: new Date('2023-08-01'),
      targetDate: new Date('2024-12-31'),
    },
  });

  await prisma.carePlanGoal.createMany({
    data: [
      {
        carePlanId: carePlan3.id,
        title: 'Maintain TSH in normal range',
        description: 'Keep TSH between 0.4-4.0 mIU/L',
        targetValue: '2.5',
        currentValue: '2.8',
        unit: 'mIU/L',
        status: 'in_progress',
        progressPercent: 90,
      },
      {
        carePlanId: carePlan3.id,
        title: 'Reduce fatigue symptoms',
        description: 'Improve energy levels through optimal thyroid management',
        status: 'in_progress',
        progressPercent: 80,
      },
    ],
  });

  await prisma.carePlanTask.createMany({
    data: [
      {
        carePlanId: carePlan3.id,
        title: 'Take Levothyroxine daily',
        description: 'Take 75mcg every morning on empty stomach',
        status: 'in_progress',
        priority: 'high',
        dueDate: daysFromNow(1),
      },
      {
        carePlanId: carePlan3.id,
        title: 'Schedule thyroid panel',
        description: 'Get TSH and Free T4 tested every 6 months',
        status: 'pending',
        priority: 'medium',
        dueDate: daysFromNow(90),
      },
    ],
  });

  console.log('✓ Care plans created\n');

  // ================================================================
  // 10. CREATE DOCUMENTS
  // ================================================================
  console.log('📄 Creating documents...');

  await prisma.document.createMany({
    data: [
      {
        patientId: patient1.id,
        title: 'Lipid Panel Results - January 2024',
        description: 'Complete cholesterol panel including LDL, HDL, and triglycerides',
        category: 'lab_results',
        fileName: 'lipid-panel-2024-01.pdf',
        filePath: '/uploads/documents/patient1/lipid-panel-2024-01.pdf',
        fileType: 'application/pdf',
        fileSize: 256000,
        mimeType: 'application/pdf',
        uploadedBy: doctor1.id,
        uploadedAt: daysAgo(8),
      },
      {
        patientId: patient1.id,
        title: 'Chest X-Ray Report',
        description: 'Annual physical exam chest X-ray',
        category: 'imaging',
        fileName: 'chest-xray-2024.pdf',
        filePath: '/uploads/documents/patient1/chest-xray-2024.pdf',
        fileType: 'application/pdf',
        fileSize: 512000,
        mimeType: 'application/pdf',
        uploadedBy: doctor1.id,
        uploadedAt: daysAgo(30),
      },
      {
        patientId: patient1.id,
        title: 'Insurance Card - BlueCross',
        description: 'Current insurance card front and back',
        category: 'insurance',
        fileName: 'insurance-card-bluecross.pdf',
        filePath: '/uploads/documents/patient1/insurance-card.pdf',
        fileType: 'application/pdf',
        fileSize: 128000,
        mimeType: 'application/pdf',
        uploadedBy: patient1.id,
        uploadedAt: daysAgo(90),
      },
      {
        patientId: patient2.id,
        title: 'HbA1c Test Results',
        description: 'Latest diabetes monitoring test',
        category: 'lab_results',
        fileName: 'hba1c-2024-10.pdf',
        filePath: '/uploads/documents/patient2/hba1c-2024-10.pdf',
        fileType: 'application/pdf',
        fileSize: 192000,
        mimeType: 'application/pdf',
        uploadedBy: doctor2.id,
        uploadedAt: daysAgo(3),
      },
      {
        patientId: patient2.id,
        title: 'Metformin Prescription',
        description: 'Current prescription for Metformin 500mg',
        category: 'prescriptions',
        fileName: 'metformin-prescription.pdf',
        filePath: '/uploads/documents/patient2/metformin-rx.pdf',
        fileType: 'application/pdf',
        fileSize: 96000,
        mimeType: 'application/pdf',
        uploadedBy: doctor2.id,
        uploadedAt: daysAgo(60),
      },
      {
        patientId: patient3.id,
        title: 'Thyroid Panel - October 2024',
        description: 'TSH and Free T4 results',
        category: 'lab_results',
        fileName: 'thyroid-panel-2024-10.pdf',
        filePath: '/uploads/documents/patient3/thyroid-panel-2024-10.pdf',
        fileType: 'application/pdf',
        fileSize: 176000,
        mimeType: 'application/pdf',
        uploadedBy: doctor3.id,
        uploadedAt: daysAgo(10),
      },
      {
        patientId: patient3.id,
        title: 'Medical Records Transfer',
        description: 'Previous medical records from former provider',
        category: 'medical_records',
        fileName: 'medical-records-transfer.pdf',
        filePath: '/uploads/documents/patient3/medical-records.pdf',
        fileType: 'application/pdf',
        fileSize: 1024000,
        mimeType: 'application/pdf',
        uploadedBy: patient3.id,
        uploadedAt: daysAgo(180),
      },
    ],
  });
  console.log('✓ Documents created\n');

  // ================================================================
  // 11. CREATE INVOICES
  // ================================================================
  console.log('💰 Creating invoices...');

  await prisma.invoice.createMany({
    data: [
      // Patient 1 - Paid invoice
      {
        patientId: patient1.id,
        invoiceNumber: 'INV-2024-001',
        description: 'Annual Physical Examination - Office Visit',
        status: 'paid',
        totalAmount: 250.00,
        paidAmount: 250.00,
        insuranceCovered: 200.00,
        patientBalance: 0.00,
        serviceDate: daysAgo(30),
        serviceType: 'Office Visit',
        providerId: doctor1.id,
        dueDate: daysAgo(15),
        paidDate: daysAgo(20),
      },
      // Patient 1 - Pending invoice
      {
        patientId: patient1.id,
        invoiceNumber: 'INV-2024-002',
        description: 'Lipid Panel Lab Tests',
        status: 'pending',
        totalAmount: 150.00,
        paidAmount: 0.00,
        insuranceCovered: 120.00,
        patientBalance: 30.00,
        serviceDate: daysAgo(10),
        serviceType: 'Laboratory Tests',
        providerId: doctor1.id,
        dueDate: daysFromNow(15),
      },
      // Patient 2 - Partially paid
      {
        patientId: patient2.id,
        invoiceNumber: 'INV-2024-003',
        description: 'Diabetes Management Visit - Cardiology Consultation',
        status: 'partially_paid',
        totalAmount: 350.00,
        paidAmount: 200.00,
        insuranceCovered: 280.00,
        patientBalance: 150.00,
        serviceDate: daysAgo(20),
        serviceType: 'Specialist Consultation',
        providerId: doctor2.id,
        dueDate: daysFromNow(5),
      },
      // Patient 2 - Overdue invoice
      {
        patientId: patient2.id,
        invoiceNumber: 'INV-2024-004',
        description: 'HbA1c Test and Follow-up',
        status: 'overdue',
        totalAmount: 180.00,
        paidAmount: 0.00,
        insuranceCovered: 150.00,
        patientBalance: 30.00,
        serviceDate: daysAgo(45),
        serviceType: 'Laboratory Tests',
        providerId: doctor2.id,
        dueDate: daysAgo(10),
      },
      // Patient 3 - Paid invoice
      {
        patientId: patient3.id,
        invoiceNumber: 'INV-2024-005',
        description: 'Thyroid Panel and Endocrinology Consultation',
        status: 'paid',
        totalAmount: 300.00,
        paidAmount: 300.00,
        insuranceCovered: 240.00,
        patientBalance: 0.00,
        serviceDate: daysAgo(12),
        serviceType: 'Specialist Consultation',
        providerId: doctor3.id,
        dueDate: daysAgo(5),
        paidDate: daysAgo(8),
      },
      // Patient 3 - Pending invoice
      {
        patientId: patient3.id,
        invoiceNumber: 'INV-2024-006',
        description: 'Levothyroxine Prescription - 3 month supply',
        status: 'pending',
        totalAmount: 45.00,
        paidAmount: 0.00,
        insuranceCovered: 35.00,
        patientBalance: 10.00,
        serviceDate: daysAgo(5),
        serviceType: 'Prescription',
        providerId: doctor3.id,
        dueDate: daysFromNow(20),
      },
    ],
  });
  console.log('✓ Invoices created\n');

  // ================================================================
  // 12. CREATE PAYMENT METHODS
  // ================================================================
  console.log('💳 Creating payment methods...');

  await prisma.paymentMethod.createMany({
    data: [
      {
        patientId: patient1.id,
        type: 'credit_card',
        cardLast4: '4242',
        cardBrand: 'Visa',
        cardExpMonth: 12,
        cardExpYear: 2026,
        cardHolderName: 'John Doe',
        billingAddress: '123 Main St, Springfield, IL 62701',
        billingZip: '62701',
        isDefault: true,
        isActive: true,
      },
      {
        patientId: patient1.id,
        type: 'insurance',
        isDefault: false,
        isActive: true,
      },
      {
        patientId: patient2.id,
        type: 'debit_card',
        cardLast4: '5555',
        cardBrand: 'Mastercard',
        cardExpMonth: 8,
        cardExpYear: 2025,
        cardHolderName: 'Maria Garcia',
        billingAddress: '456 Oak Ave, Chicago, IL 60601',
        billingZip: '60601',
        isDefault: true,
        isActive: true,
      },
      {
        patientId: patient3.id,
        type: 'credit_card',
        cardLast4: '1234',
        cardBrand: 'American Express',
        cardExpMonth: 3,
        cardExpYear: 2027,
        cardHolderName: 'Robert Chen',
        billingAddress: '789 Elm St, Boston, MA 02101',
        billingZip: '02101',
        isDefault: true,
        isActive: true,
      },
    ],
  });
  console.log('✓ Payment methods created\n');

  // ================================================================
  // 13. CREATE DIRECT MESSAGES
  // ================================================================
  console.log('💬 Creating direct messages...');

  // Conversation between Patient 1 and Doctor 1
  await prisma.directMessage.createMany({
    data: [
      {
        senderId: patient1.id,
        receiverId: doctor1.id,
        subject: 'Question about blood pressure readings',
        content: 'Hi Dr. Smith, I noticed my blood pressure was a bit higher this morning (135/85). Should I be concerned?',
        status: 'read',
        readAt: daysAgo(2),
        sentAt: daysAgo(3),
      },
      {
        senderId: doctor1.id,
        receiverId: patient1.id,
        subject: 'Re: Question about blood pressure readings',
        content: 'Hi John, that reading is slightly elevated but not alarming. Continue monitoring it daily and make sure you\'re taking your Lisinopril as prescribed. If it stays above 140/90, please let me know.',
        status: 'read',
        readAt: daysAgo(2),
        sentAt: daysAgo(2),
      },
      {
        senderId: patient1.id,
        receiverId: doctor1.id,
        subject: 'Follow-up appointment',
        content: 'Thank you, Doctor. I\'ll continue monitoring. Looking forward to our follow-up next week.',
        status: 'read',
        readAt: daysAgo(1),
        sentAt: daysAgo(1),
      },
      // Conversation between Patient 2 and Doctor 2
      {
        senderId: patient2.id,
        receiverId: doctor2.id,
        subject: 'HbA1c results question',
        content: 'Dr. Johnson, I saw my HbA1c results came back at 6.8%. What does this mean for my diabetes management?',
        status: 'read',
        readAt: daysAgo(1),
        sentAt: daysAgo(2),
      },
      {
        senderId: doctor2.id,
        receiverId: patient2.id,
        subject: 'Re: HbA1c results question',
        content: 'Hi Maria, your HbA1c of 6.8% is in the prediabetic range, which is actually good progress. Continue with your current Metformin regimen and maintain your diet and exercise plan. We\'ll retest in 3 months.',
        status: 'read',
        readAt: daysAgo(1),
        sentAt: daysAgo(1),
      },
      // Unread message to Patient 3
      {
        senderId: doctor3.id,
        receiverId: patient3.id,
        subject: 'Thyroid test results',
        content: 'Hi Robert, your recent thyroid panel shows excellent results! Your TSH is 2.8, which is right in the optimal range. Keep taking your Levothyroxine as prescribed.',
        status: 'delivered',
        sentAt: new Date(),
      },
    ],
  });
  console.log('✓ Direct messages created\n');

  // ================================================================
  // SUMMARY
  // ================================================================
  console.log('='.repeat(60));
  console.log('✅ Database seeding completed successfully!\n');
  console.log('Summary:');
  console.log('  • 1 Admin user');
  console.log('  • 3 Doctor users');
  console.log('  • 3 Patient users');
  console.log('  • 4 Allergies');
  console.log('  • 4 Active medications');
  console.log('  • 4 Medical history entries');
  console.log('  • 7 Appointments (past, upcoming, cancelled)');
  console.log('  • 9 Lab results');
  console.log('  • 8 Vital sign records');
  console.log('  • 3 Care plans with goals and tasks');
  console.log('  • 7 Documents');
  console.log('  • 6 Invoices (various statuses)');
  console.log('  • 4 Payment methods');
  console.log('  • 6 Direct messages');
  console.log('\n📧 Login credentials (all users):');
  console.log('  Email: [user email from seed]');
  console.log('  Password: password123');
  console.log('\n🎯 Test Users:');
  console.log('  Admin: admin@medichat.com');
  console.log('  Doctor: dr.smith@medichat.com');
  console.log('  Patient: john.doe@example.com');
  console.log('='.repeat(60));
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
