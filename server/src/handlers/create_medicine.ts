
import { db } from '../db';
import { medicinesTable } from '../db/schema';
import { type CreateMedicineInput, type Medicine } from '../schema';

export const createMedicine = async (input: CreateMedicineInput): Promise<Medicine> => {
  try {
    // Insert medicine record
    const result = await db.insert(medicinesTable)
      .values({
        name: input.name,
        description: input.description,
        dosage_form: input.dosage_form,
        strength: input.strength,
        manufacturer: input.manufacturer,
        unit_price: input.unit_price.toString(), // Convert number to string for numeric column
        stock_quantity: input.stock_quantity || 0, // Apply default if not provided
        expiry_date: input.expiry_date
      })
      .returning()
      .execute();

    // Convert numeric fields back to numbers before returning
    const medicine = result[0];
    return {
      ...medicine,
      unit_price: parseFloat(medicine.unit_price) // Convert string back to number
    };
  } catch (error) {
    console.error('Medicine creation failed:', error);
    throw error;
  }
};
