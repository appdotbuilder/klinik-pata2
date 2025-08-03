
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { appointmentsTable, patientsTable, usersTable } from '../db/schema';
import { type UpdateAppointmentInput } from '../schema';
import { updateAppointment } from '../handlers/update_appointment';
import { eq } from 'drizzle-orm';

describe('updateAppointment', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  let patientId: number;
  let doctorId: number;
  let appointmentId: number;

  beforeEach(async () => {
    // Create test patient
    const patientResult = await db.insert(patientsTable)
      .values({
        patient_code: 'PAT001',
        full_name: 'Test Patient',
        date_of_birth: new Date('1990-01-01'),
        gender: 'male',
        phone: '123-456-7890',
        email: 'patient@test.com',
        address: '123 Test St'
      })
      .returning()
      .execute();
    patientId = patientResult[0].id;

    // Create test doctor
    const doctorResult = await db.insert(usersTable)
      .values({
        username: 'testdoctor',
        email: 'doctor@test.com',
        password_hash: 'hashedpassword',
        full_name: 'Dr. Test',
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
        appointment_date: new Date('2024-01-15T10:00:00Z'),
        duration_minutes: 30,
        status: 'scheduled',
        notes: 'Initial consultation'
      })
      .returning()
      .execute();
    appointmentId = appointmentResult[0].id;
  });

  it('should update appointment status', async () => {
    const input: UpdateAppointmentInput = {
      appointment_id: appointmentId,
      status: 'completed'
    };

    const result = await updateAppointment(input);

    expect(result.id).toEqual(appointmentId);
    expect(result.status).toEqual('completed');
    expect(result.patient_id).toEqual(patientId);
    expect(result.doctor_id).toEqual(doctorId);
    expect(result.duration_minutes).toEqual(30);
    expect(result.notes).toEqual('Initial consultation');
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should update multiple fields', async () => {
    const input: UpdateAppointmentInput = {
      appointment_id: appointmentId,
      duration_minutes: 45,
      status: 'completed',
      notes: 'Follow-up completed successfully'
    };

    const result = await updateAppointment(input);

    expect(result.id).toEqual(appointmentId);
    expect(result.duration_minutes).toEqual(45);
    expect(result.status).toEqual('completed');
    expect(result.notes).toEqual('Follow-up completed successfully');
    expect(result.patient_id).toEqual(patientId);
    expect(result.doctor_id).toEqual(doctorId);
  });

  it('should update appointment date', async () => {
    const newDate = new Date('2024-01-20T14:30:00Z');
    const input: UpdateAppointmentInput = {
      appointment_id: appointmentId,
      appointment_date: newDate
    };

    const result = await updateAppointment(input);

    expect(result.appointment_date).toEqual(newDate);
    expect(result.id).toEqual(appointmentId);
  });

  it('should save updated appointment to database', async () => {
    const input: UpdateAppointmentInput = {
      appointment_id: appointmentId,
      status: 'cancelled',
      notes: 'Patient cancelled'
    };

    await updateAppointment(input);

    const appointments = await db.select()
      .from(appointmentsTable)
      .where(eq(appointmentsTable.id, appointmentId))
      .execute();

    expect(appointments).toHaveLength(1);
    expect(appointments[0].status).toEqual('cancelled');
    expect(appointments[0].notes).toEqual('Patient cancelled');
    expect(appointments[0].updated_at).toBeInstanceOf(Date);
  });

  it('should update notes to null', async () => {
    const input: UpdateAppointmentInput = {
      appointment_id: appointmentId,
      notes: null
    };

    const result = await updateAppointment(input);

    expect(result.notes).toBeNull();
    expect(result.id).toEqual(appointmentId);
  });

  it('should throw error for non-existent appointment', async () => {
    const input: UpdateAppointmentInput = {
      appointment_id: 99999,
      status: 'completed'
    };

    expect(updateAppointment(input)).rejects.toThrow(/not found/i);
  });

  it('should preserve unchanged fields', async () => {
    const input: UpdateAppointmentInput = {
      appointment_id: appointmentId,
      notes: 'Updated notes only'
    };

    const result = await updateAppointment(input);

    // Check that other fields remain unchanged
    expect(result.patient_id).toEqual(patientId);
    expect(result.doctor_id).toEqual(doctorId);
    expect(result.duration_minutes).toEqual(30);
    expect(result.status).toEqual('scheduled');
    expect(result.notes).toEqual('Updated notes only');
    expect(result.appointment_date).toEqual(new Date('2024-01-15T10:00:00Z'));
  });
});
