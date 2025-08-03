
import { db } from '../db';
import { patientsTable } from '../db/schema';
import { type UpdatePatientInput, type Patient } from '../schema';
import { eq } from 'drizzle-orm';

export const updatePatient = async (input: UpdatePatientInput): Promise<Patient> => {
  try {
    // Build update object with only provided fields
    const updateData: Partial<typeof patientsTable.$inferInsert> = {};
    
    if (input.patient_code !== undefined) {
      updateData.patient_code = input.patient_code;
    }
    if (input.full_name !== undefined) {
      updateData.full_name = input.full_name;
    }
    if (input.date_of_birth !== undefined) {
      updateData.date_of_birth = input.date_of_birth;
    }
    if (input.gender !== undefined) {
      updateData.gender = input.gender;
    }
    if (input.phone !== undefined) {
      updateData.phone = input.phone;
    }
    if (input.email !== undefined) {
      updateData.email = input.email;
    }
    if (input.address !== undefined) {
      updateData.address = input.address;
    }
    if (input.emergency_contact_name !== undefined) {
      updateData.emergency_contact_name = input.emergency_contact_name;
    }
    if (input.emergency_contact_phone !== undefined) {
      updateData.emergency_contact_phone = input.emergency_contact_phone;
    }
    if (input.blood_type !== undefined) {
      updateData.blood_type = input.blood_type;
    }
    if (input.allergies !== undefined) {
      updateData.allergies = input.allergies;
    }
    if (input.past_medical_history !== undefined) {
      updateData.past_medical_history = input.past_medical_history;
    }

    // Always update the updated_at timestamp
    updateData.updated_at = new Date();

    // Update patient record
    const result = await db.update(patientsTable)
      .set(updateData)
      .where(eq(patientsTable.id, input.patient_id))
      .returning()
      .execute();

    if (result.length === 0) {
      throw new Error(`Patient with id ${input.patient_id} not found`);
    }

    return result[0];
  } catch (error) {
    console.error('Patient update failed:', error);
    throw error;
  }
};
