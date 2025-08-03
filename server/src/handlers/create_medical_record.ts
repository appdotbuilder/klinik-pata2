
import { db } from '../db';
import { medicalRecordsTable, patientsTable, usersTable, appointmentsTable } from '../db/schema';
import { type CreateMedicalRecordInput, type MedicalRecord } from '../schema';
import { eq } from 'drizzle-orm';

export const createMedicalRecord = async (input: CreateMedicalRecordInput): Promise<MedicalRecord> => {
  try {
    // Verify patient exists
    const patients = await db.select()
      .from(patientsTable)
      .where(eq(patientsTable.id, input.patient_id))
      .execute();

    if (patients.length === 0) {
      throw new Error('Patient not found');
    }

    // Verify doctor exists and is a doctor
    const doctors = await db.select()
      .from(usersTable)
      .where(eq(usersTable.id, input.doctor_id))
      .execute();

    if (doctors.length === 0) {
      throw new Error('Doctor not found');
    }

    if (doctors[0].role !== 'doctor') {
      throw new Error('User is not a doctor');
    }

    // Verify appointment exists if provided
    if (input.appointment_id) {
      const appointments = await db.select()
        .from(appointmentsTable)
        .where(eq(appointmentsTable.id, input.appointment_id))
        .execute();

      if (appointments.length === 0) {
        throw new Error('Appointment not found');
      }
    }

    // Insert medical record
    const result = await db.insert(medicalRecordsTable)
      .values({
        patient_id: input.patient_id,
        doctor_id: input.doctor_id,
        appointment_id: input.appointment_id,
        diagnosis: input.diagnosis,
        symptoms: input.symptoms,
        treatment_plan: input.treatment_plan,
        notes: input.notes
      })
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('Medical record creation failed:', error);
    throw error;
  }
};
