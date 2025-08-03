
import { db } from '../db';
import { patientsTable } from '../db/schema';
import { type Patient } from '../schema';

export const getPatients = async (): Promise<Patient[]> => {
  try {
    const results = await db.select()
      .from(patientsTable)
      .execute();

    // No numeric fields to convert in patients table - all fields are text, integer, or date
    return results;
  } catch (error) {
    console.error('Failed to fetch patients:', error);
    throw error;
  }
};
