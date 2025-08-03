
import { db } from '../db';
import { patientsTable } from '../db/schema';
import { type CreatePatientInput, type Patient } from '../schema';

export const createPatient = async (input: CreatePatientInput): Promise<Patient> => {
  try {
    // Insert patient record
    const result = await db.insert(patientsTable)
      .values({
        patient_code: input.patient_code,
        full_name: input.full_name,
        date_of_birth: input.date_of_birth,
        gender: input.gender,
        phone: input.phone,
        email: input.email,
        address: input.address,
        emergency_contact_name: input.emergency_contact_name,
        emergency_contact_phone: input.emergency_contact_phone,
        blood_type: input.blood_type,
        allergies: input.allergies,
        past_medical_history: input.past_medical_history
      })
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('Patient creation failed:', error);
    throw error;
  }
};
