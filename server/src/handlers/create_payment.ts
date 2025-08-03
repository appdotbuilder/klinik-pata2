
import { db } from '../db';
import { paymentsTable, billsTable } from '../db/schema';
import { type CreatePaymentInput, type Payment } from '../schema';
import { eq } from 'drizzle-orm';

export const createPayment = async (input: CreatePaymentInput): Promise<Payment> => {
  try {
    // Verify that the bill exists
    const bill = await db.select()
      .from(billsTable)
      .where(eq(billsTable.id, input.bill_id))
      .execute();

    if (bill.length === 0) {
      throw new Error(`Bill with id ${input.bill_id} not found`);
    }

    // Insert payment record
    const result = await db.insert(paymentsTable)
      .values({
        bill_id: input.bill_id,
        amount: input.amount.toString(), // Convert number to string for numeric column
        payment_method: input.payment_method,
        reference_number: input.reference_number,
        notes: input.notes
      })
      .returning()
      .execute();

    // Convert numeric fields back to numbers before returning
    const payment = result[0];
    return {
      ...payment,
      amount: parseFloat(payment.amount) // Convert string back to number
    };
  } catch (error) {
    console.error('Payment creation failed:', error);
    throw error;
  }
};
