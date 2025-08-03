
import { db } from '../db';
import { nonMedicalProductsTable } from '../db/schema';
import { type NonMedicalProduct } from '../schema';

export const getNonMedicalProducts = async (): Promise<NonMedicalProduct[]> => {
  try {
    const results = await db.select()
      .from(nonMedicalProductsTable)
      .execute();

    // Convert numeric fields back to numbers before returning
    return results.map(product => ({
      ...product,
      unit_price: parseFloat(product.unit_price) // Convert string back to number
    }));
  } catch (error) {
    console.error('Failed to fetch non-medical products:', error);
    throw error;
  }
};
