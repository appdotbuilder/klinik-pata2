
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable, patientsTable, prescriptionsTable, medicalRecordsTable } from '../db/schema';
import { getPrescriptions } from '../handlers/get_prescriptions';

describe('getPrescriptions', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no prescriptions exist', async () => {
    const result = await getPrescriptions();
    expect(result).toEqual([]);
  });

  it('should return all prescriptions', async () => {
    // Create prerequisite data directly in database
    const doctorResult = await db.insert(usersTable)
      .values({
        username: 'testdoctor',
        email: 'doctor@test.com',
        password_hash: 'hashedpassword',
        full_name: 'Dr. Test Doctor',
        role: 'doctor'
      })
      .returning()
      .execute();

    const patientResult = await db.insert(patientsTable)
      .values({
        patient_code: 'PAT001',
        full_name: 'Test Patient',
        date_of_birth: new Date('1990-01-01'),
        gender: 'male',
        phone: '1234567890',
        email: 'patient@test.com',
        address: '123 Test St',
        emergency_contact_name: 'Emergency Contact',
        emergency_contact_phone: '0987654321',
        blood_type: 'O+',
        allergies: 'None',
        past_medical_history: 'No significant history'
      })
      .returning()
      .execute();

    const doctor = doctorResult[0];
    const patient = patientResult[0];

    // Create test prescriptions
    await db.insert(prescriptionsTable)
      .values({
        patient_id: patient.id,
        doctor_id: doctor.id,
        medical_record_id: null,
        instructions: 'Take with food'
      })
      .execute();

    await db.insert(prescriptionsTable)
      .values({
        patient_id: patient.id,
        doctor_id: doctor.id,
        medical_record_id: null,
        instructions: 'Take before meals'
      })
      .execute();

    const result = await getPrescriptions();

    expect(result).toHaveLength(2);
    expect(result[0].patient_id).toEqual(patient.id);
    expect(result[0].doctor_id).toEqual(doctor.id);
    expect(result[0].instructions).toEqual('Take with food');
    expect(result[0].prescription_date).toBeInstanceOf(Date);
    expect(result[0].created_at).toBeInstanceOf(Date);
    expect(result[0].id).toBeDefined();

    expect(result[1].patient_id).toEqual(patient.id);
    expect(result[1].doctor_id).toEqual(doctor.id);
    expect(result[1].instructions).toEqual('Take before meals');
    expect(result[1].prescription_date).toBeInstanceOf(Date);
    expect(result[1].created_at).toBeInstanceOf(Date);
    expect(result[1].id).toBeDefined();
  });

  it('should return prescriptions with correct data types', async () => {
    // Create prerequisite data directly
    const doctorResult = await db.insert(usersTable)
      .values({
        username: 'testdoctor2',
        email: 'doctor2@test.com',
        password_hash: 'hashedpassword',
        full_name: 'Dr. Test Doctor 2',
        role: 'doctor'
      })
      .returning()
      .execute();

    const patientResult = await db.insert(patientsTable)
      .values({
        patient_code: 'PAT002',
        full_name: 'Test Patient 2',
        date_of_birth: new Date('1985-05-15'),
        gender: 'female',
        phone: '2345678901',
        email: 'patient2@test.com',
        address: '456 Test Ave',
        emergency_contact_name: 'Emergency Contact 2',
        emergency_contact_phone: '1098765432',
        blood_type: 'A+',
        allergies: 'Penicillin',
        past_medical_history: 'Diabetes'
      })
      .returning()
      .execute();

    const doctor = doctorResult[0];
    const patient = patientResult[0];

    // Create test prescription
    await db.insert(prescriptionsTable)
      .values({
        patient_id: patient.id,
        doctor_id: doctor.id,
        medical_record_id: null,
        instructions: 'Test instructions'
      })
      .execute();

    const result = await getPrescriptions();

    expect(result).toHaveLength(1);
    const prescription = result[0];
    
    // Verify data types
    expect(typeof prescription.id).toBe('number');
    expect(typeof prescription.patient_id).toBe('number');
    expect(typeof prescription.doctor_id).toBe('number');
    expect(prescription.medical_record_id).toBeNull();
    expect(typeof prescription.instructions).toBe('string');
    expect(prescription.prescription_date).toBeInstanceOf(Date);
    expect(prescription.created_at).toBeInstanceOf(Date);
  });

  it('should handle prescriptions with medical record references', async () => {
    // Create prerequisite data
    const doctorResult = await db.insert(usersTable)
      .values({
        username: 'testdoctor3',
        email: 'doctor3@test.com',
        password_hash: 'hashedpassword',
        full_name: 'Dr. Test Doctor 3',
        role: 'doctor'
      })
      .returning()
      .execute();

    const patientResult = await db.insert(patientsTable)
      .values({
        patient_code: 'PAT003',
        full_name: 'Test Patient 3',
        date_of_birth: new Date('1975-12-25'),
        gender: 'other',
        phone: '3456789012',
        email: 'patient3@test.com',
        address: '789 Test Blvd',
        emergency_contact_name: 'Emergency Contact 3',
        emergency_contact_phone: '2109876543',
        blood_type: 'B-',
        allergies: 'Shellfish',
        past_medical_history: 'Hypertension'
      })
      .returning()
      .execute();

    const doctor = doctorResult[0];
    const patient = patientResult[0];

    // Create a medical record first to satisfy foreign key constraint
    const medicalRecordResult = await db.insert(medicalRecordsTable)
      .values({
        patient_id: patient.id,
        doctor_id: doctor.id,
        appointment_id: null,
        diagnosis: 'Test diagnosis',
        symptoms: 'Test symptoms',
        treatment_plan: 'Test treatment',
        notes: 'Test notes'
      })
      .returning()
      .execute();

    const medicalRecord = medicalRecordResult[0];

    // Create prescription with valid medical_record_id
    await db.insert(prescriptionsTable)
      .values({
        patient_id: patient.id,
        doctor_id: doctor.id,
        medical_record_id: medicalRecord.id,
        instructions: 'Follow up prescription'
      })
      .execute();

    const result = await getPrescriptions();

    expect(result).toHaveLength(1);
    expect(result[0].medical_record_id).toEqual(medicalRecord.id);
    expect(result[0].instructions).toEqual('Follow up prescription');
  });
});
