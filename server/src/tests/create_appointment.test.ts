
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { appointmentsTable, patientsTable, usersTable } from '../db/schema';
import { type CreateAppointmentInput } from '../schema';
import { createAppointment } from '../handlers/create_appointment';
import { eq } from 'drizzle-orm';

describe('createAppointment', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  let patientId: number;
  let doctorId: number;

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
        allergies: 'None',
        past_medical_history: 'No significant history'
      })
      .returning()
      .execute();
    patientId = patientResult[0].id;

    // Create test doctor
    const doctorResult = await db.insert(usersTable)
      .values({
        username: 'drsmith',
        email: 'drsmith@example.com',
        password_hash: 'hashed_password',
        full_name: 'Dr. Smith',
        role: 'doctor',
        is_active: true
      })
      .returning()
      .execute();
    doctorId = doctorResult[0].id;
  });

  const testInput: CreateAppointmentInput = {
    patient_id: 0, // Will be set in tests
    doctor_id: 0, // Will be set in tests
    appointment_date: new Date('2024-01-15T10:00:00Z'),
    duration_minutes: 45,
    status: 'scheduled',
    notes: 'Regular checkup'
  };

  it('should create an appointment', async () => {
    const input = {
      ...testInput,
      patient_id: patientId,
      doctor_id: doctorId
    };

    const result = await createAppointment(input);

    expect(result.patient_id).toEqual(patientId);
    expect(result.doctor_id).toEqual(doctorId);
    expect(result.appointment_date).toEqual(new Date('2024-01-15T10:00:00Z'));
    expect(result.duration_minutes).toEqual(45);
    expect(result.status).toEqual('scheduled');
    expect(result.notes).toEqual('Regular checkup');
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save appointment to database', async () => {
    const input = {
      ...testInput,
      patient_id: patientId,
      doctor_id: doctorId
    };

    const result = await createAppointment(input);

    const appointments = await db.select()
      .from(appointmentsTable)
      .where(eq(appointmentsTable.id, result.id))
      .execute();

    expect(appointments).toHaveLength(1);
    expect(appointments[0].patient_id).toEqual(patientId);
    expect(appointments[0].doctor_id).toEqual(doctorId);
    expect(appointments[0].appointment_date).toEqual(new Date('2024-01-15T10:00:00Z'));
    expect(appointments[0].duration_minutes).toEqual(45);
    expect(appointments[0].status).toEqual('scheduled');
    expect(appointments[0].notes).toEqual('Regular checkup');
  });

  it('should use default values when optional fields are not provided', async () => {
    const input = {
      patient_id: patientId,
      doctor_id: doctorId,
      appointment_date: new Date('2024-01-15T10:00:00Z'),
      notes: null
    };

    const result = await createAppointment(input);

    expect(result.duration_minutes).toEqual(30); // Default value
    expect(result.status).toEqual('scheduled'); // Default value
    expect(result.notes).toBeNull();
  });

  it('should throw error when patient does not exist', async () => {
    const input = {
      ...testInput,
      patient_id: 99999, // Non-existent patient
      doctor_id: doctorId
    };

    expect(createAppointment(input)).rejects.toThrow(/patient not found/i);
  });

  it('should throw error when doctor does not exist', async () => {
    const input = {
      ...testInput,
      patient_id: patientId,
      doctor_id: 99999 // Non-existent doctor
    };

    expect(createAppointment(input)).rejects.toThrow(/doctor not found/i);
  });

  it('should throw error when user is not a doctor', async () => {
    // Create a non-doctor user
    const nurseResult = await db.insert(usersTable)
      .values({
        username: 'nurse1',
        email: 'nurse1@example.com',
        password_hash: 'hashed_password',
        full_name: 'Nurse One',
        role: 'nurse',
        is_active: true
      })
      .returning()
      .execute();

    const input = {
      ...testInput,
      patient_id: patientId,
      doctor_id: nurseResult[0].id
    };

    expect(createAppointment(input)).rejects.toThrow(/doctor not found/i);
  });
});
