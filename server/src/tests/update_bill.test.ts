
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { billsTable, patientsTable } from '../db/schema';
import { type UpdateBillInput } from '../schema';
import { updateBill } from '../handlers/update_bill';
import { eq } from 'drizzle-orm';

describe('updateBill', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update bill payment status', async () => {
    // Create test patient first
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

    // Create test bill
    const billResult = await db.insert(billsTable)
      .values({
        patient_id: patientResult[0].id,
        bill_number: 'BILL-001',
        subtotal: '100.00',
        tax_amount: '10.00',
        total_amount: '110.00',
        payment_status: 'pending',
        notes: null
      })
      .returning()
      .execute();

    const testInput: UpdateBillInput = {
      bill_id: billResult[0].id,
      payment_status: 'paid'
    };

    const result = await updateBill(testInput);

    expect(result.id).toEqual(billResult[0].id);
    expect(result.payment_status).toEqual('paid');
    expect(result.patient_id).toEqual(patientResult[0].id);
    expect(result.bill_number).toEqual('BILL-001');
    expect(typeof result.subtotal).toEqual('number');
    expect(result.subtotal).toEqual(100);
    expect(typeof result.tax_amount).toEqual('number');
    expect(result.tax_amount).toEqual(10);
    expect(typeof result.total_amount).toEqual('number');
    expect(result.total_amount).toEqual(110);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should update bill notes', async () => {
    // Create test patient
    const patientResult = await db.insert(patientsTable)
      .values({
        patient_code: 'P002',
        full_name: 'Test Patient 2',
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

    // Create test bill
    const billResult = await db.insert(billsTable)
      .values({
        patient_id: patientResult[0].id,
        bill_number: 'BILL-002',
        subtotal: '200.00',
        tax_amount: '20.00',
        total_amount: '220.00',
        payment_status: 'pending',
        notes: 'Original notes'
      })
      .returning()
      .execute();

    const testInput: UpdateBillInput = {
      bill_id: billResult[0].id,
      notes: 'Updated notes'
    };

    const result = await updateBill(testInput);

    expect(result.notes).toEqual('Updated notes');
    expect(result.payment_status).toEqual('pending'); // Should remain unchanged
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should update both payment status and notes', async () => {
    // Create test patient
    const patientResult = await db.insert(patientsTable)
      .values({
        patient_code: 'P003',
        full_name: 'Test Patient 3',
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

    // Create test bill
    const billResult = await db.insert(billsTable)
      .values({
        patient_id: patientResult[0].id,
        bill_number: 'BILL-003',
        subtotal: '150.00',
        tax_amount: '15.00',
        total_amount: '165.00',
        payment_status: 'pending',
        notes: null
      })
      .returning()
      .execute();

    const testInput: UpdateBillInput = {
      bill_id: billResult[0].id,
      payment_status: 'overdue',
      notes: 'Payment overdue - follow up required'
    };

    const result = await updateBill(testInput);

    expect(result.payment_status).toEqual('overdue');
    expect(result.notes).toEqual('Payment overdue - follow up required');
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save changes to database', async () => {
    // Create test patient
    const patientResult = await db.insert(patientsTable)
      .values({
        patient_code: 'P004',
        full_name: 'Test Patient 4',
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

    // Create test bill
    const billResult = await db.insert(billsTable)
      .values({
        patient_id: patientResult[0].id,
        bill_number: 'BILL-004',
        subtotal: '75.50',
        tax_amount: '7.55',
        total_amount: '83.05',
        payment_status: 'pending',
        notes: null
      })
      .returning()
      .execute();

    const testInput: UpdateBillInput = {
      bill_id: billResult[0].id,
      payment_status: 'paid',
      notes: 'Payment completed'
    };

    await updateBill(testInput);

    // Verify changes were saved to database
    const bills = await db.select()
      .from(billsTable)
      .where(eq(billsTable.id, billResult[0].id))
      .execute();

    expect(bills).toHaveLength(1);
    expect(bills[0].payment_status).toEqual('paid');
    expect(bills[0].notes).toEqual('Payment completed');
    expect(bills[0].updated_at).toBeInstanceOf(Date);
    expect(parseFloat(bills[0].subtotal)).toEqual(75.5);
    expect(parseFloat(bills[0].total_amount)).toEqual(83.05);
  });

  it('should throw error for non-existent bill', async () => {
    const testInput: UpdateBillInput = {
      bill_id: 999999,
      payment_status: 'paid'
    };

    await expect(updateBill(testInput)).rejects.toThrow(/Bill with id 999999 not found/i);
  });

  it('should handle null notes update', async () => {
    // Create test patient
    const patientResult = await db.insert(patientsTable)
      .values({
        patient_code: 'P005',
        full_name: 'Test Patient 5',
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

    // Create test bill with existing notes
    const billResult = await db.insert(billsTable)
      .values({
        patient_id: patientResult[0].id,
        bill_number: 'BILL-005',
        subtotal: '50.00',
        tax_amount: '5.00',
        total_amount: '55.00',
        payment_status: 'pending',
        notes: 'Existing notes'
      })
      .returning()
      .execute();

    const testInput: UpdateBillInput = {
      bill_id: billResult[0].id,
      notes: null
    };

    const result = await updateBill(testInput);

    expect(result.notes).toBeNull();
    expect(result.payment_status).toEqual('pending'); // Should remain unchanged
  });
});
