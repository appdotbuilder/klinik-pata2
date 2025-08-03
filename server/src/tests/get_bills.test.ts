
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { billsTable, patientsTable } from '../db/schema';
import { type CreateBillInput } from '../schema';
import { getBills } from '../handlers/get_bills';

describe('getBills', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no bills exist', async () => {
    const result = await getBills();
    expect(result).toEqual([]);
  });

  it('should return all bills with correct data types', async () => {
    // Create a patient first (required for foreign key)
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
        past_medical_history: null,
      })
      .returning()
      .execute();

    const patientId = patientResult[0].id;

    // Create test bills
    await db.insert(billsTable)
      .values([
        {
          patient_id: patientId,
          bill_number: 'BILL001',
          subtotal: '100.50',
          tax_amount: '10.05',
          total_amount: '110.55',
          payment_status: 'pending',
          notes: 'Test bill 1'
        },
        {
          patient_id: patientId,
          bill_number: 'BILL002',
          subtotal: '200.00',
          tax_amount: '20.00',
          total_amount: '220.00',
          payment_status: 'paid',
          notes: null
        }
      ])
      .execute();

    const result = await getBills();

    expect(result).toHaveLength(2);

    // Verify first bill
    const bill1 = result.find(b => b.bill_number === 'BILL001');
    expect(bill1).toBeDefined();
    expect(bill1!.patient_id).toEqual(patientId);
    expect(bill1!.subtotal).toEqual(100.50);
    expect(typeof bill1!.subtotal).toBe('number');
    expect(bill1!.tax_amount).toEqual(10.05);
    expect(typeof bill1!.tax_amount).toBe('number');
    expect(bill1!.total_amount).toEqual(110.55);
    expect(typeof bill1!.total_amount).toBe('number');
    expect(bill1!.payment_status).toEqual('pending');
    expect(bill1!.notes).toEqual('Test bill 1');
    expect(bill1!.id).toBeDefined();
    expect(bill1!.bill_date).toBeInstanceOf(Date);
    expect(bill1!.created_at).toBeInstanceOf(Date);
    expect(bill1!.updated_at).toBeInstanceOf(Date);

    // Verify second bill
    const bill2 = result.find(b => b.bill_number === 'BILL002');
    expect(bill2).toBeDefined();
    expect(bill2!.patient_id).toEqual(patientId);
    expect(bill2!.subtotal).toEqual(200.00);
    expect(typeof bill2!.subtotal).toBe('number');
    expect(bill2!.tax_amount).toEqual(20.00);
    expect(typeof bill2!.tax_amount).toBe('number');
    expect(bill2!.total_amount).toEqual(220.00);
    expect(typeof bill2!.total_amount).toBe('number');
    expect(bill2!.payment_status).toEqual('paid');
    expect(bill2!.notes).toBeNull();
  });

  it('should handle bills with zero amounts correctly', async () => {
    // Create a patient first
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
        past_medical_history: null,
      })
      .returning()
      .execute();

    const patientId = patientResult[0].id;

    // Create bill with zero tax amount
    await db.insert(billsTable)
      .values({
        patient_id: patientId,
        bill_number: 'BILL003',
        subtotal: '50.00',
        tax_amount: '0.00',
        total_amount: '50.00',
        payment_status: 'pending',
        notes: null
      })
      .execute();

    const result = await getBills();

    expect(result).toHaveLength(1);
    expect(result[0].subtotal).toEqual(50.00);
    expect(result[0].tax_amount).toEqual(0.00);
    expect(result[0].total_amount).toEqual(50.00);
    expect(typeof result[0].tax_amount).toBe('number');
  });
});
