
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable, patientsTable, appointmentsTable } from '../db/schema';
import { getAppointments } from '../handlers/get_appointments';
import { type CreateUserInput, type CreatePatientInput, type CreateAppointmentInput } from '../schema';

// Test data
const testDoctor: CreateUserInput = {
  username: 'dr_test',
  email: 'doctor@test.com',
  password: 'password123',
  full_name: 'Dr. Test Doctor',
  role: 'doctor',
  is_active: true,
};

const testPatient: CreatePatientInput = {
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
  past_medical_history: 'No significant history',
};

describe('getAppointments', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no appointments exist', async () => {
    const result = await getAppointments();
    expect(result).toEqual([]);
  });

  it('should return all appointments', async () => {
    // Create prerequisite doctor and patient
    const doctorResult = await db.insert(usersTable)
      .values({
        username: testDoctor.username,
        email: testDoctor.email,
        password_hash: 'hashed_password',
        full_name: testDoctor.full_name,
        role: testDoctor.role,
        is_active: testDoctor.is_active,
      })
      .returning()
      .execute();

    const patientResult = await db.insert(patientsTable)
      .values({
        patient_code: testPatient.patient_code,
        full_name: testPatient.full_name,
        date_of_birth: testPatient.date_of_birth,
        gender: testPatient.gender,
        phone: testPatient.phone,
        email: testPatient.email,
        address: testPatient.address,
        emergency_contact_name: testPatient.emergency_contact_name,
        emergency_contact_phone: testPatient.emergency_contact_phone,
        blood_type: testPatient.blood_type,
        allergies: testPatient.allergies,
        past_medical_history: testPatient.past_medical_history,
      })
      .returning()
      .execute();

    const doctorId = doctorResult[0].id;
    const patientId = patientResult[0].id;

    // Create test appointments
    const appointmentDate1 = new Date('2024-01-15T10:00:00Z');
    const appointmentDate2 = new Date('2024-01-16T14:30:00Z');

    await db.insert(appointmentsTable)
      .values([
        {
          patient_id: patientId,
          doctor_id: doctorId,
          appointment_date: appointmentDate1,
          duration_minutes: 30,
          status: 'scheduled',
          notes: 'First appointment',
        },
        {
          patient_id: patientId,
          doctor_id: doctorId,
          appointment_date: appointmentDate2,
          duration_minutes: 45,
          status: 'completed',
          notes: 'Second appointment',
        },
      ])
      .execute();

    const result = await getAppointments();

    expect(result).toHaveLength(2);
    
    // Verify first appointment
    expect(result[0].patient_id).toEqual(patientId);
    expect(result[0].doctor_id).toEqual(doctorId);
    expect(result[0].appointment_date).toEqual(appointmentDate1);
    expect(result[0].duration_minutes).toEqual(30);
    expect(result[0].status).toEqual('scheduled');
    expect(result[0].notes).toEqual('First appointment');
    expect(result[0].id).toBeDefined();
    expect(result[0].created_at).toBeInstanceOf(Date);
    expect(result[0].updated_at).toBeInstanceOf(Date);

    // Verify second appointment
    expect(result[1].patient_id).toEqual(patientId);
    expect(result[1].doctor_id).toEqual(doctorId);
    expect(result[1].appointment_date).toEqual(appointmentDate2);
    expect(result[1].duration_minutes).toEqual(45);
    expect(result[1].status).toEqual('completed');
    expect(result[1].notes).toEqual('Second appointment');
    expect(result[1].id).toBeDefined();
    expect(result[1].created_at).toBeInstanceOf(Date);
    expect(result[1].updated_at).toBeInstanceOf(Date);
  });

  it('should handle appointments with nullable fields', async () => {
    // Create prerequisite doctor and patient
    const doctorResult = await db.insert(usersTable)
      .values({
        username: testDoctor.username,
        email: testDoctor.email,
        password_hash: 'hashed_password',
        full_name: testDoctor.full_name,
        role: testDoctor.role,
        is_active: testDoctor.is_active,
      })
      .returning()
      .execute();

    const patientResult = await db.insert(patientsTable)
      .values({
        patient_code: testPatient.patient_code,
        full_name: testPatient.full_name,
        date_of_birth: testPatient.date_of_birth,
        gender: testPatient.gender,
        phone: testPatient.phone,
        email: testPatient.email,
        address: testPatient.address,
        emergency_contact_name: testPatient.emergency_contact_name,
        emergency_contact_phone: testPatient.emergency_contact_phone,
        blood_type: testPatient.blood_type,
        allergies: testPatient.allergies,
        past_medical_history: testPatient.past_medical_history,
      })
      .returning()
      .execute();

    const doctorId = doctorResult[0].id;
    const patientId = patientResult[0].id;

    // Create appointment with minimal required fields
    const appointmentDate = new Date('2024-01-20T09:00:00Z');

    await db.insert(appointmentsTable)
      .values({
        patient_id: patientId,
        doctor_id: doctorId,
        appointment_date: appointmentDate,
        duration_minutes: 30, // Has default
        status: 'scheduled', // Has default
        notes: null, // Nullable field
      })
      .execute();

    const result = await getAppointments();

    expect(result).toHaveLength(1);
    expect(result[0].patient_id).toEqual(patientId);
    expect(result[0].doctor_id).toEqual(doctorId);
    expect(result[0].appointment_date).toEqual(appointmentDate);
    expect(result[0].duration_minutes).toEqual(30);
    expect(result[0].status).toEqual('scheduled');
    expect(result[0].notes).toBeNull();
    expect(result[0].id).toBeDefined();
    expect(result[0].created_at).toBeInstanceOf(Date);
    expect(result[0].updated_at).toBeInstanceOf(Date);
  });
});
