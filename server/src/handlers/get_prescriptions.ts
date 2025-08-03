
import { db } from '../db';
import { prescriptionsTable } from '../db/schema';
import { type Prescription } from '../schema';

export const getPrescriptions = async (): Promise<Prescription[]> => {
  try {
    const results = await db.select()
      .from(prescriptionsTable)
      .execute();

    return results.map(prescription => ({
      ...prescription,
      // No numeric conversions needed - all fields are already correct types
      prescription_date: prescription.prescription_date,
      created_at: prescription.created_at
    }));
  } catch (error) {
    console.error('Failed to fetch prescriptions:', error);
    throw error;
  }
};
