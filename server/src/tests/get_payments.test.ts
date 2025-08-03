
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { patientsTable, billsTable, paymentsTable } from '../db/schema';
import { getPayments } from '../handlers/get_payments';

// Test data setup
const testPatient = {
  patient_code: 'P001',
  full_name: 'John Doe',
  date_of_birth: new Date('1980-01-01'),
  gender: 'male' as const,
  phone: '1234567890',
  email: 'john@example.com',
  address: '123 Main St',
  emergency_contact_name: 'Jane Doe',
  emergency_contact_phone: '0987654321',
  blood_type: 'O+',
  allergies: 'None',
  past_medical_history: 'No significant history'
};

const testBill = {
  bill_number: 'BILL001',
  subtotal: '100.00',
  tax_amount: '10.00',
  total_amount: '110.00',
  payment_status: 'pending' as const,
  notes: 'Test bill'
};

const testPayment1 = {
  amount: '50.00',
  payment_method: 'cash' as const,
  reference_number: 'REF001',
  notes: 'First payment'
};

const testPayment2 = {
  amount: '60.00',
  payment_method: 'card' as const,
  reference_number: 'REF002',
  notes: 'Second payment'
};

describe('getPayments', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no payments exist', async () => {
    const result = await getPayments();
    expect(result).toEqual([]);
  });

  it('should fetch all payments', async () => {
    // Create prerequisite data
    const patientResult = await db.insert(patientsTable)
      .values(testPatient)
      .returning()
      .execute();

    const billResult = await db.insert(billsTable)
      .values({
        ...testBill,
        patient_id: patientResult[0].id
      })
      .returning()
      .execute();

    // Create payments
    await db.insert(paymentsTable)
      .values([
        {
          ...testPayment1,
          bill_id: billResult[0].id
        },
        {
          ...testPayment2,
          bill_id: billResult[0].id
        }
      ])
      .execute();

    const result = await getPayments();

    expect(result).toHaveLength(2);

    // Verify first payment
    const payment1 = result.find(p => p.reference_number === 'REF001');
    expect(payment1).toBeDefined();
    expect(payment1!.amount).toEqual(50.00);
    expect(typeof payment1!.amount).toBe('number');
    expect(payment1!.payment_method).toEqual('cash');
    expect(payment1!.notes).toEqual('First payment');
    expect(payment1!.bill_id).toEqual(billResult[0].id);
    expect(payment1!.id).toBeDefined();
    expect(payment1!.payment_date).toBeInstanceOf(Date);
    expect(payment1!.created_at).toBeInstanceOf(Date);

    // Verify second payment
    const payment2 = result.find(p => p.reference_number === 'REF002');
    expect(payment2).toBeDefined();
    expect(payment2!.amount).toEqual(60.00);
    expect(typeof payment2!.amount).toBe('number');
    expect(payment2!.payment_method).toEqual('card');
    expect(payment2!.notes).toEqual('Second payment');
    expect(payment2!.bill_id).toEqual(billResult[0].id);
  });

  it('should handle payments with null fields correctly', async () => {
    // Create prerequisite data
    const patientResult = await db.insert(patientsTable)
      .values(testPatient)
      .returning()
      .execute();

    const billResult = await db.insert(billsTable)
      .values({
        ...testBill,
        patient_id: patientResult[0].id
      })
      .returning()
      .execute();

    // Create payment with null fields
    await db.insert(paymentsTable)
      .values({
        bill_id: billResult[0].id,
        amount: '25.50',
        payment_method: 'mobile_money' as const,
        reference_number: null,
        notes: null
      })
      .execute();

    const result = await getPayments();

    expect(result).toHaveLength(1);
    expect(result[0].amount).toEqual(25.50);
    expect(typeof result[0].amount).toBe('number');
    expect(result[0].payment_method).toEqual('mobile_money');
    expect(result[0].reference_number).toBeNull();
    expect(result[0].notes).toBeNull();
    expect(result[0].bill_id).toEqual(billResult[0].id);
  });
});
