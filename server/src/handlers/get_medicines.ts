
import { db } from '../db';
import { medicinesTable } from '../db/schema';
import { type Medicine } from '../schema';

export const getMedicines = async (): Promise<Medicine[]> => {
  try {
    const results = await db.select()
      .from(medicinesTable)
      .execute();

    // Convert numeric fields from strings to numbers
    return results.map(medicine => ({
      ...medicine,
      unit_price: parseFloat(medicine.unit_price) // Convert numeric field to number
    }));
  } catch (error) {
    console.error('Failed to fetch medicines:', error);
    throw error;
  }
};
