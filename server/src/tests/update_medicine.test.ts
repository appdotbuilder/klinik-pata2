
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { medicinesTable } from '../db/schema';
import { type UpdateMedicineInput } from '../schema';
import { updateMedicine } from '../handlers/update_medicine';
import { eq } from 'drizzle-orm';

describe('updateMedicine', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  // Helper function to create a test medicine directly in the database
  const createTestMedicine = async () => {
    const result = await db.insert(medicinesTable)
      .values({
        name: 'Test Medicine',
        description: 'A medicine for testing',
        dosage_form: 'tablet',
        strength: '500mg',
        manufacturer: 'Test Pharma',
        unit_price: '25.50', // Store as string for numeric column
        stock_quantity: 100,
        expiry_date: new Date('2025-12-31'),
      })
      .returning()
      .execute();

    return result[0];
  };

  it('should update medicine fields', async () => {
    // Create a medicine first
    const created = await createTestMedicine();

    const updateInput: UpdateMedicineInput = {
      medicine_id: created.id,
      name: 'Updated Medicine Name',
      unit_price: 30.75,
      stock_quantity: 150,
    };

    const result = await updateMedicine(updateInput);

    // Verify updated fields
    expect(result.id).toEqual(created.id);
    expect(result.name).toEqual('Updated Medicine Name');
    expect(result.unit_price).toEqual(30.75);
    expect(result.stock_quantity).toEqual(150);
    
    // Verify unchanged fields
    expect(result.description).toEqual('A medicine for testing');
    expect(result.dosage_form).toEqual('tablet');
    expect(result.strength).toEqual('500mg');
    expect(result.manufacturer).toEqual('Test Pharma');
    expect(result.expiry_date).toEqual(new Date('2025-12-31'));
    
    // Verify timestamps
    expect(result.created_at).toEqual(created.created_at);
    expect(result.updated_at).toBeInstanceOf(Date);
    expect(result.updated_at.getTime()).toBeGreaterThan(created.updated_at.getTime());
  });

  it('should update medicine in database', async () => {
    // Create a medicine first
    const created = await createTestMedicine();

    const updateInput: UpdateMedicineInput = {
      medicine_id: created.id,
      name: 'Database Updated Medicine',
      unit_price: 45.99,
    };

    await updateMedicine(updateInput);

    // Query database directly to verify update
    const medicines = await db.select()
      .from(medicinesTable)
      .where(eq(medicinesTable.id, created.id))
      .execute();

    expect(medicines).toHaveLength(1);
    expect(medicines[0].name).toEqual('Database Updated Medicine');
    expect(parseFloat(medicines[0].unit_price)).toEqual(45.99);
    expect(medicines[0].updated_at).toBeInstanceOf(Date);
  });

  it('should update nullable fields to null', async () => {
    // Create a medicine first
    const created = await createTestMedicine();

    const updateInput: UpdateMedicineInput = {
      medicine_id: created.id,
      description: null,
      dosage_form: null,
      strength: null,
      manufacturer: null,
      expiry_date: null,
    };

    const result = await updateMedicine(updateInput);

    // Verify nullable fields are set to null
    expect(result.description).toBeNull();
    expect(result.dosage_form).toBeNull();
    expect(result.strength).toBeNull();
    expect(result.manufacturer).toBeNull();
    expect(result.expiry_date).toBeNull();
    
    // Verify required fields remain unchanged
    expect(result.name).toEqual('Test Medicine');
    expect(result.unit_price).toEqual(25.50);
    expect(result.stock_quantity).toEqual(100);
  });

  it('should update only specified fields', async () => {
    // Create a medicine first
    const created = await createTestMedicine();

    const updateInput: UpdateMedicineInput = {
      medicine_id: created.id,
      stock_quantity: 75,
    };

    const result = await updateMedicine(updateInput);

    // Verify only stock_quantity was updated
    expect(result.stock_quantity).toEqual(75);
    
    // Verify all other fields remain unchanged
    expect(result.name).toEqual('Test Medicine');
    expect(result.description).toEqual('A medicine for testing');
    expect(result.dosage_form).toEqual('tablet');
    expect(result.strength).toEqual('500mg');
    expect(result.manufacturer).toEqual('Test Pharma');
    expect(result.unit_price).toEqual(25.50);
    expect(result.expiry_date).toEqual(new Date('2025-12-31'));
  });

  it('should handle numeric price conversion correctly', async () => {
    // Create a medicine first
    const created = await createTestMedicine();

    const updateInput: UpdateMedicineInput = {
      medicine_id: created.id,
      unit_price: 99.99,
    };

    const result = await updateMedicine(updateInput);

    // Verify numeric conversion works correctly
    expect(typeof result.unit_price).toBe('number');
    expect(result.unit_price).toEqual(99.99);

    // Verify in database - stored as string
    const medicines = await db.select()
      .from(medicinesTable)
      .where(eq(medicinesTable.id, created.id))
      .execute();

    expect(typeof medicines[0].unit_price).toBe('string');
    expect(parseFloat(medicines[0].unit_price)).toEqual(99.99);
  });

  it('should throw error for non-existent medicine', async () => {
    const updateInput: UpdateMedicineInput = {
      medicine_id: 999999,
      name: 'Non-existent Medicine',
    };

    expect(async () => {
      await updateMedicine(updateInput);
    }).toThrow(/Medicine with id 999999 not found/i);
  });

  it('should update expiry date correctly', async () => {
    // Create a medicine first
    const created = await createTestMedicine();

    const newExpiryDate = new Date('2026-06-15');
    const updateInput: UpdateMedicineInput = {
      medicine_id: created.id,
      expiry_date: newExpiryDate,
    };

    const result = await updateMedicine(updateInput);

    // Verify expiry date was updated
    expect(result.expiry_date).toEqual(newExpiryDate);
    
    // Verify in database
    const medicines = await db.select()
      .from(medicinesTable)
      .where(eq(medicinesTable.id, created.id))
      .execute();

    expect(medicines[0].expiry_date).toEqual(newExpiryDate);
  });
});
