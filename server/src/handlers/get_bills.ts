
import { db } from '../db';
import { billsTable } from '../db/schema';
import { type Bill } from '../schema';

export const getBills = async (): Promise<Bill[]> => {
  try {
    const results = await db.select()
      .from(billsTable)
      .execute();

    // Convert numeric fields from strings to numbers
    return results.map(bill => ({
      ...bill,
      subtotal: parseFloat(bill.subtotal),
      tax_amount: parseFloat(bill.tax_amount),
      total_amount: parseFloat(bill.total_amount)
    }));
  } catch (error) {
    console.error('Failed to fetch bills:', error);
    throw error;
  }
};
