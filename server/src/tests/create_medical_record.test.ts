
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { medicalRecordsTable, patientsTable, usersTable, appointmentsTable } from '../db/schema';
import { type CreateMedicalRecordInput } from '../schema';
import { createMedicalRecord } from '../handlers/create_medical_record';
import { eq } from 'drizzle-orm';

describe('createMedicalRecord', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  let patientId: number;
  let doctorId: number;
  let appointmentId: number;

  beforeEach(async () => {
    // Create test patient
    const patientResult = await db.insert(patientsTable)
      .values({
        patient_code: 'P001',
        full_name: 'John Doe',
        date_of_birth: new Date('1990-01-01'),
        gender: 'male',
        phone: '123-456-7890',
        email: 'john@example.com',
        address: '123 Main St',
        emergency_contact_name: 'Jane Doe',
        emergency_contact_phone: '098-765-4321',
        blood_type: 'O+',
        allergies: 'Penicillin',
        past_medical_history: 'Hypertension'
      })
      .returning()
      .execute();
    patientId = patientResult[0].id;

    // Create test doctor
    const doctorResult = await db.insert(usersTable)
      .values({
        username: 'doctor1',
        email: 'doctor@clinic.com',
        password_hash: 'hashed_password',
        full_name: 'Dr. Smith',
        role: 'doctor',
        is_active: true
      })
      .returning()
      .execute();
    doctorId = doctorResult[0].id;

    // Create test appointment
    const appointmentResult = await db.insert(appointmentsTable)
      .values({
        patient_id: patientId,
        doctor_id: doctorId,
        appointment_date: new Date('2024-01-15 10:00:00'),
        duration_minutes: 30,
        status: 'scheduled',
        notes: 'Regular checkup'
      })
      .returning()
      .execute();
    appointmentId = appointmentResult[0].id;
  });

  const testInput: CreateMedicalRecordInput = {
    patient_id: 0, // Will be set in tests
    doctor_id: 0, // Will be set in tests
    appointment_id: null,
    diagnosis: 'Common cold',
    symptoms: 'Runny nose, cough',
    treatment_plan: 'Rest and fluids',
    notes: 'Patient appears healthy otherwise'
  };

  it('should create a medical record', async () => {
    const input = {
      ...testInput,
      patient_id: patientId,
      doctor_id: doctorId,
      appointment_id: appointmentId
    };

    const result = await createMedicalRecord(input);

    expect(result.patient_id).toEqual(patientId);
    expect(result.doctor_id).toEqual(doctorId);
    expect(result.appointment_id).toEqual(appointmentId);
    expect(result.diagnosis).toEqual('Common cold');
    expect(result.symptoms).toEqual('Runny nose, cough');
    expect(result.treatment_plan).toEqual('Rest and fluids');
    expect(result.notes).toEqual('Patient appears healthy otherwise');
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should create a medical record without appointment', async () => {
    const input = {
      ...testInput,
      patient_id: patientId,
      doctor_id: doctorId,
      appointment_id: null
    };

    const result = await createMedicalRecord(input);

    expect(result.patient_id).toEqual(patientId);
    expect(result.doctor_id).toEqual(doctorId);
    expect(result.appointment_id).toBeNull();
    expect(result.diagnosis).toEqual('Common cold');
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should save medical record to database', async () => {
    const input = {
      ...testInput,
      patient_id: patientId,
      doctor_id: doctorId,
      appointment_id: appointmentId
    };

    const result = await createMedicalRecord(input);

    const records = await db.select()
      .from(medicalRecordsTable)
      .where(eq(medicalRecordsTable.id, result.id))
      .execute();

    expect(records).toHaveLength(1);
    expect(records[0].patient_id).toEqual(patientId);
    expect(records[0].doctor_id).toEqual(doctorId);
    expect(records[0].diagnosis).toEqual('Common cold');
    expect(records[0].created_at).toBeInstanceOf(Date);
  });

  it('should throw error if patient does not exist', async () => {
    const input = {
      ...testInput,
      patient_id: 99999,
      doctor_id: doctorId,
      appointment_id: null
    };

    expect(createMedicalRecord(input)).rejects.toThrow(/patient not found/i);
  });

  it('should throw error if doctor does not exist', async () => {
    const input = {
      ...testInput,
      patient_id: patientId,
      doctor_id: 99999,
      appointment_id: null
    };

    expect(createMedicalRecord(input)).rejects.toThrow(/doctor not found/i);
  });

  it('should throw error if user is not a doctor', async () => {
    // Create non-doctor user
    const nurseResult = await db.insert(usersTable)
      .values({
        username: 'nurse1',
        email: 'nurse@clinic.com',
        password_hash: 'hashed_password',
        full_name: 'Nurse Jane',
        role: 'nurse',
        is_active: true
      })
      .returning()
      .execute();

    const input = {
      ...testInput,
      patient_id: patientId,
      doctor_id: nurseResult[0].id,
      appointment_id: null
    };

    expect(createMedicalRecord(input)).rejects.toThrow(/user is not a doctor/i);
  });

  it('should throw error if appointment does not exist', async () => {
    const input = {
      ...testInput,
      patient_id: patientId,
      doctor_id: doctorId,
      appointment_id: 99999
    };

    expect(createMedicalRecord(input)).rejects.toThrow(/appointment not found/i);
  });
});
