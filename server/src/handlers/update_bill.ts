
import { db } from '../db';
import { billsTable } from '../db/schema';
import { type UpdateBillInput, type Bill } from '../schema';
import { eq } from 'drizzle-orm';

export const updateBill = async (input: UpdateBillInput): Promise<Bill> => {
  try {
    // Build update object with only provided fields
    const updateData: Record<string, any> = {
      updated_at: new Date()
    };

    if (input.payment_status !== undefined) {
      updateData['payment_status'] = input.payment_status;
    }

    if (input.notes !== undefined) {
      updateData['notes'] = input.notes;
    }

    // Update the bill
    const result = await db.update(billsTable)
      .set(updateData)
      .where(eq(billsTable.id, input.bill_id))
      .returning()
      .execute();

    if (result.length === 0) {
      throw new Error(`Bill with id ${input.bill_id} not found`);
    }

    // Convert numeric fields back to numbers
    const bill = result[0];
    return {
      ...bill,
      subtotal: parseFloat(bill.subtotal),
      tax_amount: parseFloat(bill.tax_amount),
      total_amount: parseFloat(bill.total_amount)
    };
  } catch (error) {
    console.error('Bill update failed:', error);
    throw error;
  }
};
