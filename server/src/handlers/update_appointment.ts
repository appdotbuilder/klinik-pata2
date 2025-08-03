
import { db } from '../db';
import { appointmentsTable } from '../db/schema';
import { type UpdateAppointmentInput, type Appointment } from '../schema';
import { eq } from 'drizzle-orm';

export const updateAppointment = async (input: UpdateAppointmentInput): Promise<Appointment> => {
  try {
    // Build update object with only provided fields
    const updateData: Record<string, any> = {};
    
    if (input.patient_id !== undefined) {
      updateData['patient_id'] = input.patient_id;
    }
    
    if (input.doctor_id !== undefined) {
      updateData['doctor_id'] = input.doctor_id;
    }
    
    if (input.appointment_date !== undefined) {
      updateData['appointment_date'] = input.appointment_date;
    }
    
    if (input.duration_minutes !== undefined) {
      updateData['duration_minutes'] = input.duration_minutes;
    }
    
    if (input.status !== undefined) {
      updateData['status'] = input.status;
    }
    
    if (input.notes !== undefined) {
      updateData['notes'] = input.notes;
    }

    // Always update the updated_at timestamp
    updateData['updated_at'] = new Date();

    // Update appointment record
    const result = await db.update(appointmentsTable)
      .set(updateData)
      .where(eq(appointmentsTable.id, input.appointment_id))
      .returning()
      .execute();

    if (result.length === 0) {
      throw new Error(`Appointment with id ${input.appointment_id} not found`);
    }

    return result[0];
  } catch (error) {
    console.error('Appointment update failed:', error);
    throw error;
  }
};
