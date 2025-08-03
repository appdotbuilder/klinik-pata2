
import { db } from '../db';
import { appointmentsTable, patientsTable, usersTable } from '../db/schema';
import { type CreateAppointmentInput, type Appointment } from '../schema';
import { eq, and } from 'drizzle-orm';

export const createAppointment = async (input: CreateAppointmentInput): Promise<Appointment> => {
  try {
    // Verify patient exists
    const patient = await db.select()
      .from(patientsTable)
      .where(eq(patientsTable.id, input.patient_id))
      .execute();
    
    if (patient.length === 0) {
      throw new Error('Patient not found');
    }

    // Verify doctor exists and is a doctor
    const doctor = await db.select()
      .from(usersTable)
      .where(and(
        eq(usersTable.id, input.doctor_id),
        eq(usersTable.role, 'doctor')
      ))
      .execute();
    
    if (doctor.length === 0) {
      throw new Error('Doctor not found');
    }

    // Insert appointment record
    const result = await db.insert(appointmentsTable)
      .values({
        patient_id: input.patient_id,
        doctor_id: input.doctor_id,
        appointment_date: input.appointment_date,
        duration_minutes: input.duration_minutes || 30,
        status: input.status || 'scheduled',
        notes: input.notes
      })
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('Appointment creation failed:', error);
    throw error;
  }
};
