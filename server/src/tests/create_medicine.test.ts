
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { medicinesTable } from '../db/schema';
import { type CreateMedicineInput } from '../schema';
import { createMedicine } from '../handlers/create_medicine';
import { eq } from 'drizzle-orm';

// Simple test input with all fields
const testInput: CreateMedicineInput = {
  name: 'Paracetamol',
  description: 'Pain reliever and fever reducer',
  dosage_form: 'Tablet',
  strength: '500mg',
  manufacturer: 'Test Pharma',
  unit_price: 2.50,
  stock_quantity: 100,
  expiry_date: new Date('2025-12-31')
};

// Minimal test input (only required fields)
const minimalInput: CreateMedicineInput = {
  name: 'Aspirin',
  description: null,
  dosage_form: null,
  strength: null,
  manufacturer: null,
  unit_price: 1.99,
  expiry_date: null
};

describe('createMedicine', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a medicine with all fields', async () => {
    const result = await createMedicine(testInput);

    // Basic field validation
    expect(result.name).toEqual('Paracetamol');
    expect(result.description).toEqual('Pain reliever and fever reducer');
    expect(result.dosage_form).toEqual('Tablet');
    expect(result.strength).toEqual('500mg');
    expect(result.manufacturer).toEqual('Test Pharma');
    expect(result.unit_price).toEqual(2.50);
    expect(typeof result.unit_price).toBe('number');
    expect(result.stock_quantity).toEqual(100);
    expect(result.expiry_date).toBeInstanceOf(Date);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should create a medicine with minimal fields', async () => {
    const result = await createMedicine(minimalInput);

    // Basic field validation
    expect(result.name).toEqual('Aspirin');
    expect(result.description).toBeNull();
    expect(result.dosage_form).toBeNull();
    expect(result.strength).toBeNull();
    expect(result.manufacturer).toBeNull();
    expect(result.unit_price).toEqual(1.99);
    expect(typeof result.unit_price).toBe('number');
    expect(result.stock_quantity).toEqual(0); // Default value
    expect(result.expiry_date).toBeNull();
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save medicine to database', async () => {
    const result = await createMedicine(testInput);

    // Query using proper drizzle syntax
    const medicines = await db.select()
      .from(medicinesTable)
      .where(eq(medicinesTable.id, result.id))
      .execute();

    expect(medicines).toHaveLength(1);
    expect(medicines[0].name).toEqual('Paracetamol');
    expect(medicines[0].description).toEqual('Pain reliever and fever reducer');
    expect(medicines[0].dosage_form).toEqual('Tablet');
    expect(medicines[0].strength).toEqual('500mg');
    expect(medicines[0].manufacturer).toEqual('Test Pharma');
    expect(parseFloat(medicines[0].unit_price)).toEqual(2.50);
    expect(medicines[0].stock_quantity).toEqual(100);
    expect(medicines[0].expiry_date).toBeInstanceOf(Date);
    expect(medicines[0].created_at).toBeInstanceOf(Date);
    expect(medicines[0].updated_at).toBeInstanceOf(Date);
  });

  it('should apply default stock_quantity when not provided', async () => {
    const inputWithoutStock: CreateMedicineInput = {
      ...minimalInput,
      name: 'Test Medicine'
    };

    const result = await createMedicine(inputWithoutStock);

    expect(result.stock_quantity).toEqual(0);

    // Verify in database
    const medicines = await db.select()
      .from(medicinesTable)
      .where(eq(medicinesTable.id, result.id))
      .execute();

    expect(medicines[0].stock_quantity).toEqual(0);
  });

  it('should handle numeric price conversion correctly', async () => {
    const inputWithDecimalPrice: CreateMedicineInput = {
      ...minimalInput,
      name: 'Expensive Medicine',
      unit_price: 123.45 // Use 2 decimal places to match PostgreSQL numeric(10,2)
    };

    const result = await createMedicine(inputWithDecimalPrice);

    // Verify numeric type and precision
    expect(typeof result.unit_price).toBe('number');
    expect(result.unit_price).toEqual(123.45);

    // Verify database storage and retrieval
    const medicines = await db.select()
      .from(medicinesTable)
      .where(eq(medicinesTable.id, result.id))
      .execute();

    expect(parseFloat(medicines[0].unit_price)).toEqual(123.45);
  });
});
