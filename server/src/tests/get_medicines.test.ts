
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { medicinesTable } from '../db/schema';
import { type CreateMedicineInput } from '../schema';
import { getMedicines } from '../handlers/get_medicines';

// Test medicine data
const testMedicine: CreateMedicineInput = {
  name: 'Test Medicine',
  description: 'A medicine for testing',
  dosage_form: 'tablet',
  strength: '500mg',
  manufacturer: 'Test Pharma',
  unit_price: 25.50,
  stock_quantity: 100,
  expiry_date: new Date('2025-12-31')
};

const testMedicine2: CreateMedicineInput = {
  name: 'Another Medicine',
  description: 'Second test medicine',
  dosage_form: 'capsule',
  strength: '250mg',
  manufacturer: 'Another Pharma',
  unit_price: 15.75,
  stock_quantity: 50,
  expiry_date: null
};

describe('getMedicines', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no medicines exist', async () => {
    const result = await getMedicines();
    
    expect(result).toEqual([]);
  });

  it('should return all medicines with correct data types', async () => {
    // Insert test medicines
    await db.insert(medicinesTable)
      .values([
        {
          ...testMedicine,
          unit_price: testMedicine.unit_price.toString() // Convert to string for insert
        },
        {
          ...testMedicine2,
          unit_price: testMedicine2.unit_price.toString() // Convert to string for insert
        }
      ])
      .execute();

    const result = await getMedicines();

    expect(result).toHaveLength(2);
    
    // Verify first medicine
    const medicine1 = result.find(m => m.name === 'Test Medicine');
    expect(medicine1).toBeDefined();
    expect(medicine1!.name).toEqual('Test Medicine');
    expect(medicine1!.description).toEqual('A medicine for testing');
    expect(medicine1!.dosage_form).toEqual('tablet');
    expect(medicine1!.strength).toEqual('500mg');
    expect(medicine1!.manufacturer).toEqual('Test Pharma');
    expect(medicine1!.unit_price).toEqual(25.50);
    expect(typeof medicine1!.unit_price).toBe('number');
    expect(medicine1!.stock_quantity).toEqual(100);
    expect(medicine1!.expiry_date).toBeInstanceOf(Date);
    expect(medicine1!.id).toBeDefined();
    expect(medicine1!.created_at).toBeInstanceOf(Date);
    expect(medicine1!.updated_at).toBeInstanceOf(Date);

    // Verify second medicine
    const medicine2 = result.find(m => m.name === 'Another Medicine');
    expect(medicine2).toBeDefined();
    expect(medicine2!.name).toEqual('Another Medicine');
    expect(medicine2!.unit_price).toEqual(15.75);
    expect(typeof medicine2!.unit_price).toBe('number');
    expect(medicine2!.stock_quantity).toEqual(50);
    expect(medicine2!.expiry_date).toBeNull();
  });

  it('should handle medicines with default stock quantity', async () => {
    // Insert medicine without explicit stock_quantity (should default to 0)
    await db.insert(medicinesTable)
      .values({
        name: 'Default Stock Medicine',
        description: null,
        dosage_form: null,
        strength: null,
        manufacturer: null,
        unit_price: '10.00',
        expiry_date: null
      })
      .execute();

    const result = await getMedicines();

    expect(result).toHaveLength(1);
    expect(result[0].name).toEqual('Default Stock Medicine');
    expect(result[0].stock_quantity).toEqual(0);
    expect(result[0].unit_price).toEqual(10.00);
    expect(typeof result[0].unit_price).toBe('number');
  });

  it('should handle medicines with null optional fields', async () => {
    await db.insert(medicinesTable)
      .values({
        name: 'Minimal Medicine',
        description: null,
        dosage_form: null,
        strength: null,
        manufacturer: null,
        unit_price: '5.99',
        stock_quantity: 25,
        expiry_date: null
      })
      .execute();

    const result = await getMedicines();

    expect(result).toHaveLength(1);
    const medicine = result[0];
    expect(medicine.name).toEqual('Minimal Medicine');
    expect(medicine.description).toBeNull();
    expect(medicine.dosage_form).toBeNull();
    expect(medicine.strength).toBeNull();
    expect(medicine.manufacturer).toBeNull();
    expect(medicine.unit_price).toEqual(5.99);
    expect(medicine.stock_quantity).toEqual(25);
    expect(medicine.expiry_date).toBeNull();
  });
});
