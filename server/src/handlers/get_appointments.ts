
import { db } from '../db';
import { appointmentsTable } from '../db/schema';
import { type Appointment } from '../schema';

export const getAppointments = async (): Promise<Appointment[]> => {
  try {
    const results = await db.select()
      .from(appointmentsTable)
      .execute();

    return results;
  } catch (error) {
    console.error('Failed to fetch appointments:', error);
    throw error;
  }
};
