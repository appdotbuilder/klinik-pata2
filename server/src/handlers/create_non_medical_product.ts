
import { db } from '../db';
import { nonMedicalProductsTable } from '../db/schema';
import { type CreateNonMedicalProductInput, type NonMedicalProduct } from '../schema';

export const createNonMedicalProduct = async (input: CreateNonMedicalProductInput): Promise<NonMedicalProduct> => {
  try {
    // Insert non-medical product record
    const result = await db.insert(nonMedicalProductsTable)
      .values({
        name: input.name,
        description: input.description,
        unit_price: input.unit_price.toString(), // Convert number to string for numeric column
        stock_quantity: input.stock_quantity || 0 // Use default if not provided
      })
      .returning()
      .execute();

    // Convert numeric fields back to numbers before returning
    const product = result[0];
    return {
      ...product,
      unit_price: parseFloat(product.unit_price) // Convert string back to number
    };
  } catch (error) {
    console.error('Non-medical product creation failed:', error);
    throw error;
  }
};
