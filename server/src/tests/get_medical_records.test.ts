
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable, patientsTable, medicalRecordsTable } from '../db/schema';
import { getMedicalRecords } from '../handlers/get_medical_records';

describe('getMedicalRecords', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no medical records exist', async () => {
    const result = await getMedicalRecords();
    expect(result).toEqual([]);
  });

  it('should return all medical records', async () => {
    // Create prerequisite data - doctor user
    const doctorResult = await db.insert(usersTable)
      .values({
        username: 'doctor1',
        email: 'doctor@test.com',
        password_hash: 'hashed_password',
        full_name: 'Dr. John Smith',
        role: 'doctor',
        is_active: true
      })
      .returning()
      .execute();

    const doctorId = doctorResult[0].id;

    // Create prerequisite data - patient
    const patientResult = await db.insert(patientsTable)
      .values({
        patient_code: 'P001',
        full_name: 'Jane Doe',
        date_of_birth: new Date('1990-01-01'),
        gender: 'female',
        phone: '1234567890',
        email: 'jane@test.com',
        address: '123 Main St',
        emergency_contact_name: 'John Doe',
        emergency_contact_phone: '0987654321',
        blood_type: 'A+',
        allergies: 'Penicillin',
        past_medical_history: 'Hypertension'
      })
      .returning()
      .execute();

    const patientId = patientResult[0].id;

    // Create medical records
    const record1 = await db.insert(medicalRecordsTable)
      .values({
        patient_id: patientId,
        doctor_id: doctorId,
        appointment_id: null,
        diagnosis: 'Common Cold',
        symptoms: 'Cough, runny nose',
        treatment_plan: 'Rest and fluids',
        notes: 'Follow up in 1 week'
      })
      .returning()
      .execute();

    const record2 = await db.insert(medicalRecordsTable)
      .values({
        patient_id: patientId,
        doctor_id: doctorId,
        appointment_id: null,
        diagnosis: 'Headache',
        symptoms: 'Severe headache',
        treatment_plan: 'Pain medication',
        notes: 'Monitor symptoms'
      })
      .returning()
      .execute();

    const result = await getMedicalRecords();

    expect(result).toHaveLength(2);
    
    // Verify first record
    const firstRecord = result.find(r => r.diagnosis === 'Common Cold');
    expect(firstRecord).toBeDefined();
    expect(firstRecord!.patient_id).toEqual(patientId);
    expect(firstRecord!.doctor_id).toEqual(doctorId);
    expect(firstRecord!.symptoms).toEqual('Cough, runny nose');
    expect(firstRecord!.treatment_plan).toEqual('Rest and fluids');
    expect(firstRecord!.notes).toEqual('Follow up in 1 week');
    expect(firstRecord!.id).toBeDefined();
    expect(firstRecord!.created_at).toBeInstanceOf(Date);

    // Verify second record
    const secondRecord = result.find(r => r.diagnosis === 'Headache');
    expect(secondRecord).toBeDefined();
    expect(secondRecord!.patient_id).toEqual(patientId);
    expect(secondRecord!.doctor_id).toEqual(doctorId);
    expect(secondRecord!.symptoms).toEqual('Severe headache');
    expect(secondRecord!.treatment_plan).toEqual('Pain medication');
    expect(secondRecord!.notes).toEqual('Monitor symptoms');
    expect(secondRecord!.id).toBeDefined();
    expect(secondRecord!.created_at).toBeInstanceOf(Date);
  });

  it('should handle records with null optional fields', async () => {
    // Create prerequisite data - doctor user
    const doctorResult = await db.insert(usersTable)
      .values({
        username: 'doctor2',
        email: 'doctor2@test.com',
        password_hash: 'hashed_password',
        full_name: 'Dr. Jane Smith',
        role: 'doctor',
        is_active: true
      })
      .returning()
      .execute();

    const doctorId = doctorResult[0].id;

    // Create prerequisite data - patient
    const patientResult = await db.insert(patientsTable)
      .values({
        patient_code: 'P002',
        full_name: 'John Doe',
        date_of_birth: null,
        gender: null,
        phone: null,
        email: null,
        address: null,
        emergency_contact_name: null,
        emergency_contact_phone: null,
        blood_type: null,
        allergies: null,
        past_medical_history: null
      })
      .returning()
      .execute();

    const patientId = patientResult[0].id;

    // Create medical record with minimal data
    await db.insert(medicalRecordsTable)
      .values({
        patient_id: patientId,
        doctor_id: doctorId,
        appointment_id: null,
        diagnosis: 'Routine Checkup',
        symptoms: null,
        treatment_plan: null,
        notes: null
      })
      .returning()
      .execute();

    const result = await getMedicalRecords();

    expect(result).toHaveLength(1);
    expect(result[0].diagnosis).toEqual('Routine Checkup');
    expect(result[0].symptoms).toBeNull();
    expect(result[0].treatment_plan).toBeNull();
    expect(result[0].notes).toBeNull();
    expect(result[0].appointment_id).toBeNull();
  });

  it('should verify medical records are saved to database correctly', async () => {
    // Create prerequisite data
    const doctorResult = await db.insert(usersTable)
      .values({
        username: 'doctor3',
        email: 'doctor3@test.com',
        password_hash: 'hashed_password',
        full_name: 'Dr. Bob Wilson',
        role: 'doctor',
        is_active: true
      })
      .returning()
      .execute();

    const patientResult = await db.insert(patientsTable)
      .values({
        patient_code: 'P003',
        full_name: 'Alice Johnson',
        date_of_birth: new Date('1985-05-15'),
        gender: 'female',
        phone: '5551234567',
        email: 'alice@test.com',
        address: '456 Oak Ave',
        emergency_contact_name: 'Bob Johnson',
        emergency_contact_phone: '5559876543',
        blood_type: 'O-',
        allergies: 'Shellfish',
        past_medical_history: 'Diabetes'
      })
      .returning()
      .execute();

    // Create medical record
    const recordResult = await db.insert(medicalRecordsTable)
      .values({
        patient_id: patientResult[0].id,
        doctor_id: doctorResult[0].id,
        appointment_id: null,
        diagnosis: 'Flu',
        symptoms: 'Fever, body aches',
        treatment_plan: 'Antiviral medication',
        notes: 'Patient should rest'
      })
      .returning()
      .execute();

    const result = await getMedicalRecords();
    
    expect(result).toHaveLength(1);
    expect(result[0].id).toEqual(recordResult[0].id);
    expect(result[0].diagnosis).toEqual('Flu');
    expect(result[0].patient_id).toEqual(patientResult[0].id);
    expect(result[0].doctor_id).toEqual(doctorResult[0].id);
  });
});
