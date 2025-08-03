
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { billsTable, billServicesTable, patientsTable, servicesTable } from '../db/schema';
import { type CreateBillInput } from '../schema';
import { createBill } from '../handlers/create_bill';
import { eq } from 'drizzle-orm';

// Test data
const testPatient = {
  patient_code: 'PAT001',
  full_name: 'John Doe',
  date_of_birth: new Date('1990-01-01'),
  gender: 'male' as const,
  phone: '+1234567890',
  email: 'john@example.com',
  address: '123 Main St',
  emergency_contact_name: 'Jane Doe',
  emergency_contact_phone: '+1234567891',
  blood_type: 'O+',
  allergies: 'None',
  past_medical_history: 'No significant history'
};

const testService = {
  name: 'Consultation',
  description: 'General consultation',
  price: 100.00,
  duration_minutes: 30,
  is_active: true
};

describe('createBill', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a bill with services', async () => {
    // Create prerequisite patient
    const patientResult = await db.insert(patientsTable)
      .values(testPatient)
      .returning()
      .execute();
    const patient = patientResult[0];

    // Create prerequisite service
    const serviceResult = await db.insert(servicesTable)
      .values({
        ...testService,
        price: testService.price.toString()
      })
      .returning()
      .execute();
    const service = serviceResult[0];

    const testInput: CreateBillInput = {
      patient_id: patient.id,
      bill_number: 'BILL001',
      subtotal: 100.00,
      tax_amount: 10.00,
      total_amount: 110.00,
      payment_status: 'pending',
      notes: 'Test bill',
      services: [{
        service_id: service.id,
        quantity: 1,
        unit_price: 100.00,
        total_price: 100.00
      }]
    };

    const result = await createBill(testInput);

    // Verify bill fields
    expect(result.patient_id).toEqual(patient.id);
    expect(result.bill_number).toEqual('BILL001');
    expect(result.subtotal).toEqual(100.00);
    expect(result.tax_amount).toEqual(10.00);
    expect(result.total_amount).toEqual(110.00);
    expect(result.payment_status).toEqual('pending');
    expect(result.notes).toEqual('Test bill');
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
    expect(result.bill_date).toBeInstanceOf(Date);

    // Verify numeric types
    expect(typeof result.subtotal).toBe('number');
    expect(typeof result.tax_amount).toBe('number');
    expect(typeof result.total_amount).toBe('number');
  });

  it('should save bill to database', async () => {
    // Create prerequisite patient
    const patientResult = await db.insert(patientsTable)
      .values(testPatient)
      .returning()
      .execute();
    const patient = patientResult[0];

    // Create prerequisite service
    const serviceResult = await db.insert(servicesTable)
      .values({
        ...testService,
        price: testService.price.toString()
      })
      .returning()
      .execute();
    const service = serviceResult[0];

    const testInput: CreateBillInput = {
      patient_id: patient.id,
      bill_number: 'BILL002',
      subtotal: 200.00,
      tax_amount: 20.00,
      total_amount: 220.00,
      payment_status: 'paid',
      notes: null,
      services: [{
        service_id: service.id,
        quantity: 2,
        unit_price: 100.00,
        total_price: 200.00
      }]
    };

    const result = await createBill(testInput);

    // Verify bill in database
    const bills = await db.select()
      .from(billsTable)
      .where(eq(billsTable.id, result.id))
      .execute();

    expect(bills).toHaveLength(1);
    expect(bills[0].bill_number).toEqual('BILL002');
    expect(parseFloat(bills[0].subtotal)).toEqual(200.00);
    expect(parseFloat(bills[0].tax_amount)).toEqual(20.00);
    expect(parseFloat(bills[0].total_amount)).toEqual(220.00);
    expect(bills[0].payment_status).toEqual('paid');

    // Verify bill services in database
    const billServices = await db.select()
      .from(billServicesTable)
      .where(eq(billServicesTable.bill_id, result.id))
      .execute();

    expect(billServices).toHaveLength(1);
    expect(billServices[0].service_id).toEqual(service.id);
    expect(billServices[0].quantity).toEqual(2);
    expect(parseFloat(billServices[0].unit_price)).toEqual(100.00);
    expect(parseFloat(billServices[0].total_price)).toEqual(200.00);
  });

  it('should handle bill with default tax amount', async () => {
    // Create prerequisite patient
    const patientResult = await db.insert(patientsTable)
      .values(testPatient)
      .returning()
      .execute();
    const patient = patientResult[0];

    const testInput: CreateBillInput = {
      patient_id: patient.id,
      bill_number: 'BILL003',
      subtotal: 50.00,
      total_amount: 50.00,
      notes: null,
      services: []
    };

    const result = await createBill(testInput);

    expect(result.tax_amount).toEqual(0);
    expect(result.payment_status).toEqual('pending');
  });

  it('should throw error for non-existent patient', async () => {
    const testInput: CreateBillInput = {
      patient_id: 999,
      bill_number: 'BILL004',
      subtotal: 100.00,
      total_amount: 100.00,
      notes: null,
      services: []
    };

    expect(createBill(testInput)).rejects.toThrow(/Patient with id 999 not found/i);
  });

  it('should create bill without services', async () => {
    // Create prerequisite patient
    const patientResult = await db.insert(patientsTable)
      .values(testPatient)
      .returning()
      .execute();
    const patient = patientResult[0];

    const testInput: CreateBillInput = {
      patient_id: patient.id,
      bill_number: 'BILL005',
      subtotal: 75.00,
      tax_amount: 7.50,
      total_amount: 82.50,
      payment_status: 'overdue',
      notes: 'No services bill',
      services: []
    };

    const result = await createBill(testInput);

    expect(result.bill_number).toEqual('BILL005');
    expect(result.payment_status).toEqual('overdue');

    // Verify no bill services created
    const billServices = await db.select()
      .from(billServicesTable)
      .where(eq(billServicesTable.bill_id, result.id))
      .execute();

    expect(billServices).toHaveLength(0);
  });
});
