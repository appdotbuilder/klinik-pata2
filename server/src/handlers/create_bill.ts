
import { db } from '../db';
import { billsTable, billServicesTable, patientsTable } from '../db/schema';
import { type CreateBillInput, type Bill } from '../schema';
import { eq } from 'drizzle-orm';

export const createBill = async (input: CreateBillInput): Promise<Bill> => {
  try {
    // Verify patient exists
    const existingPatient = await db.select()
      .from(patientsTable)
      .where(eq(patientsTable.id, input.patient_id))
      .execute();

    if (existingPatient.length === 0) {
      throw new Error(`Patient with id ${input.patient_id} not found`);
    }

    // Insert bill record
    const billResult = await db.insert(billsTable)
      .values({
        patient_id: input.patient_id,
        bill_number: input.bill_number,
        subtotal: input.subtotal.toString(),
        tax_amount: (input.tax_amount || 0).toString(),
        total_amount: input.total_amount.toString(),
        payment_status: input.payment_status || 'pending',
        notes: input.notes
      })
      .returning()
      .execute();

    const bill = billResult[0];

    // Insert bill services
    if (input.services && input.services.length > 0) {
      await db.insert(billServicesTable)
        .values(input.services.map(service => ({
          bill_id: bill.id,
          service_id: service.service_id,
          quantity: service.quantity,
          unit_price: service.unit_price.toString(),
          total_price: service.total_price.toString()
        })))
        .execute();
    }

    // Convert numeric fields back to numbers before returning
    return {
      ...bill,
      subtotal: parseFloat(bill.subtotal),
      tax_amount: parseFloat(bill.tax_amount),
      total_amount: parseFloat(bill.total_amount)
    };
  } catch (error) {
    console.error('Bill creation failed:', error);
    throw error;
  }
};
