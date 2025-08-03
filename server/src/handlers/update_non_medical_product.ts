
import { db } from '../db';
import { nonMedicalProductsTable } from '../db/schema';
import { type UpdateNonMedicalProductInput, type NonMedicalProduct } from '../schema';
import { eq } from 'drizzle-orm';

export const updateNonMedicalProduct = async (input: UpdateNonMedicalProductInput): Promise<NonMedicalProduct> => {
  try {
    // Check if the product exists
    const existingProduct = await db.select()
      .from(nonMedicalProductsTable)
      .where(eq(nonMedicalProductsTable.id, input.product_id))
      .execute();

    if (existingProduct.length === 0) {
      throw new Error(`Non-medical product with ID ${input.product_id} not found`);
    }

    // Build update object with only provided fields
    const updateData: any = {};
    
    if (input.name !== undefined) {
      updateData.name = input.name;
    }
    
    if (input.description !== undefined) {
      updateData.description = input.description;
    }
    
    if (input.unit_price !== undefined) {
      updateData.unit_price = input.unit_price.toString(); // Convert number to string for numeric column
    }
    
    if (input.stock_quantity !== undefined) {
      updateData.stock_quantity = input.stock_quantity;
    }

    // Always update the updated_at timestamp
    updateData.updated_at = new Date();

    // Update the product
    const result = await db.update(nonMedicalProductsTable)
      .set(updateData)
      .where(eq(nonMedicalProductsTable.id, input.product_id))
      .returning()
      .execute();

    const updatedProduct = result[0];
    
    // Convert numeric fields back to numbers before returning
    return {
      ...updatedProduct,
      unit_price: parseFloat(updatedProduct.unit_price) // Convert string back to number
    };
  } catch (error) {
    console.error('Non-medical product update failed:', error);
    throw error;
  }
};
