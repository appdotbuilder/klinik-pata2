
import { db } from '../db';
import { salesTable } from '../db/schema';
import { type Sale } from '../schema';

export const getSales = async (): Promise<Sale[]> => {
  try {
    const results = await db.select()
      .from(salesTable)
      .execute();

    // Convert numeric fields from strings to numbers
    return results.map(sale => ({
      ...sale,
      total_amount: parseFloat(sale.total_amount),
      amount_paid: parseFloat(sale.amount_paid),
      change_amount: parseFloat(sale.change_amount)
    }));
  } catch (error) {
    console.error('Sales retrieval failed:', error);
    throw error;
  }
};
