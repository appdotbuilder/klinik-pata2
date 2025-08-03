
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { paymentsTable, billsTable, patientsTable } from '../db/schema';
import { type CreatePaymentInput } from '../schema';
import { createPayment } from '../handlers/create_payment';
import { eq } from 'drizzle-orm';

// Test input for payment
const testPaymentInput: CreatePaymentInput = {
  bill_id: 1,
  amount: 150.75,
  payment_method: 'cash',
  reference_number: 'REF-12345',
  notes: 'Payment received in full'
};

describe('createPayment', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a payment', async () => {
    // Create prerequisite patient first
    const patientResult = await db.insert(patientsTable)
      .values({
        patient_code: 'P001',
        full_name: 'Test Patient',
        date_of_birth: null,
        gender: null,
        phone: null,
        email: null,
        address: null,
        emergency_contact_name: null,
        emergency_contact_phone: null,
        blood_type: null,
        allergies: null,
        past_medical_history: null
      })
      .returning()
      .execute();

    // Create prerequisite bill
    await db.insert(billsTable)
      .values({
        id: 1,
        patient_id: patientResult[0].id,
        bill_number: 'BILL-001',
        subtotal: '140.00',
        tax_amount: '10.75',
        total_amount: '150.75',
        payment_status: 'pending',
        notes: null
      })
      .execute();

    const result = await createPayment(testPaymentInput);

    // Basic field validation
    expect(result.bill_id).toEqual(1);
    expect(result.amount).toEqual(150.75);
    expect(typeof result.amount).toBe('number');
    expect(result.payment_method).toEqual('cash');
    expect(result.reference_number).toEqual('REF-12345');
    expect(result.notes).toEqual('Payment received in full');
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.payment_date).toBeInstanceOf(Date);
  });

  it('should save payment to database', async () => {
    // Create prerequisite patient first
    const patientResult = await db.insert(patientsTable)
      .values({
        patient_code: 'P001',
        full_name: 'Test Patient',
        date_of_birth: null,
        gender: null,
        phone: null,
        email: null,
        address: null,
        emergency_contact_name: null,
        emergency_contact_phone: null,
        blood_type: null,
        allergies: null,
        past_medical_history: null
      })
      .returning()
      .execute();

    // Create prerequisite bill
    await db.insert(billsTable)
      .values({
        id: 1,
        patient_id: patientResult[0].id,
        bill_number: 'BILL-001',
        subtotal: '140.00',
        tax_amount: '10.75',
        total_amount: '150.75',
        payment_status: 'pending',
        notes: null
      })
      .execute();

    const result = await createPayment(testPaymentInput);

    // Query using proper drizzle syntax
    const payments = await db.select()
      .from(paymentsTable)
      .where(eq(paymentsTable.id, result.id))
      .execute();

    expect(payments).toHaveLength(1);
    expect(payments[0].bill_id).toEqual(1);
    expect(parseFloat(payments[0].amount)).toEqual(150.75);
    expect(payments[0].payment_method).toEqual('cash');
    expect(payments[0].reference_number).toEqual('REF-12345');
    expect(payments[0].notes).toEqual('Payment received in full');
    expect(payments[0].created_at).toBeInstanceOf(Date);
    expect(payments[0].payment_date).toBeInstanceOf(Date);
  });

  it('should handle payment with minimal data', async () => {
    // Create prerequisite patient first
    const patientResult = await db.insert(patientsTable)
      .values({
        patient_code: 'P002',
        full_name: 'Another Patient',
        date_of_birth: null,
        gender: null,
        phone: null,
        email: null,
        address: null,
        emergency_contact_name: null,
        emergency_contact_phone: null,
        blood_type: null,
        allergies: null,
        past_medical_history: null
      })
      .returning()
      .execute();

    // Create prerequisite bill
    await db.insert(billsTable)
      .values({
        id: 2,
        patient_id: patientResult[0].id,
        bill_number: 'BILL-002',
        subtotal: '100.00',
        tax_amount: '0.00',
        total_amount: '100.00',
        payment_status: 'pending',
        notes: null
      })
      .execute();

    const minimalInput: CreatePaymentInput = {
      bill_id: 2,
      amount: 100.00,
      payment_method: 'card',
      reference_number: null,
      notes: null
    };

    const result = await createPayment(minimalInput);

    expect(result.bill_id).toEqual(2);
    expect(result.amount).toEqual(100.00);
    expect(result.payment_method).toEqual('card');
    expect(result.reference_number).toBeNull();
    expect(result.notes).toBeNull();
    expect(result.id).toBeDefined();
  });

  it('should throw error for non-existent bill', async () => {
    const invalidInput: CreatePaymentInput = {
      bill_id: 999,
      amount: 50.00,
      payment_method: 'cash',
      reference_number: null,
      notes: null
    };

    expect(createPayment(invalidInput)).rejects.toThrow(/Bill with id 999 not found/i);
  });
});
