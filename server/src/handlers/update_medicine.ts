
import { db } from '../db';
import { medicinesTable } from '../db/schema';
import { type UpdateMedicineInput, type Medicine } from '../schema';
import { eq } from 'drizzle-orm';

export const updateMedicine = async (input: UpdateMedicineInput): Promise<Medicine> => {
  try {
    // Build update object only with provided fields
    const updateData: any = {};
    
    if (input.name !== undefined) {
      updateData.name = input.name;
    }
    if (input.description !== undefined) {
      updateData.description = input.description;
    }
    if (input.dosage_form !== undefined) {
      updateData.dosage_form = input.dosage_form;
    }
    if (input.strength !== undefined) {
      updateData.strength = input.strength;
    }
    if (input.manufacturer !== undefined) {
      updateData.manufacturer = input.manufacturer;
    }
    if (input.unit_price !== undefined) {
      updateData.unit_price = input.unit_price.toString(); // Convert number to string for numeric column
    }
    if (input.stock_quantity !== undefined) {
      updateData.stock_quantity = input.stock_quantity;
    }
    if (input.expiry_date !== undefined) {
      updateData.expiry_date = input.expiry_date;
    }
    
    // Always update the updated_at timestamp
    updateData.updated_at = new Date();

    // Update medicine record
    const result = await db.update(medicinesTable)
      .set(updateData)
      .where(eq(medicinesTable.id, input.medicine_id))
      .returning()
      .execute();

    if (result.length === 0) {
      throw new Error(`Medicine with id ${input.medicine_id} not found`);
    }

    // Convert numeric fields back to numbers before returning
    const medicine = result[0];
    return {
      ...medicine,
      unit_price: parseFloat(medicine.unit_price) // Convert string back to number
    };
  } catch (error) {
    console.error('Medicine update failed:', error);
    throw error;
  }
};
