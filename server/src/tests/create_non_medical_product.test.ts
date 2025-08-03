
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { nonMedicalProductsTable } from '../db/schema';
import { type CreateNonMedicalProductInput } from '../schema';
import { createNonMedicalProduct } from '../handlers/create_non_medical_product';
import { eq } from 'drizzle-orm';

// Test input with all fields
const testInput: CreateNonMedicalProductInput = {
  name: 'Test Bandages',
  description: 'High-quality medical bandages for wound care',
  unit_price: 15.99,
  stock_quantity: 50
};

// Test input with minimal fields
const minimalInput: CreateNonMedicalProductInput = {
  name: 'Basic Thermometer',
  description: null,
  unit_price: 25.00
  // stock_quantity omitted to test default value
};

describe('createNonMedicalProduct', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a non-medical product with all fields', async () => {
    const result = await createNonMedicalProduct(testInput);

    // Basic field validation
    expect(result.name).toEqual('Test Bandages');
    expect(result.description).toEqual('High-quality medical bandages for wound care');
    expect(result.unit_price).toEqual(15.99);
    expect(typeof result.unit_price).toEqual('number');
    expect(result.stock_quantity).toEqual(50);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should create a product with minimal fields and apply defaults', async () => {
    const result = await createNonMedicalProduct(minimalInput);

    expect(result.name).toEqual('Basic Thermometer');
    expect(result.description).toBeNull();
    expect(result.unit_price).toEqual(25.00);
    expect(typeof result.unit_price).toEqual('number');
    expect(result.stock_quantity).toEqual(0); // Should use default value
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save product to database correctly', async () => {
    const result = await createNonMedicalProduct(testInput);

    // Query using proper drizzle syntax
    const products = await db.select()
      .from(nonMedicalProductsTable)
      .where(eq(nonMedicalProductsTable.id, result.id))
      .execute();

    expect(products).toHaveLength(1);
    expect(products[0].name).toEqual('Test Bandages');
    expect(products[0].description).toEqual('High-quality medical bandages for wound care');
    expect(parseFloat(products[0].unit_price)).toEqual(15.99);
    expect(products[0].stock_quantity).toEqual(50);
    expect(products[0].created_at).toBeInstanceOf(Date);
    expect(products[0].updated_at).toBeInstanceOf(Date);
  });

  it('should handle numeric price conversion correctly', async () => {
    const priceTestInput: CreateNonMedicalProductInput = {
      name: 'Price Test Product',
      description: 'Testing price conversion',
      unit_price: 99.95,
      stock_quantity: 10
    };

    const result = await createNonMedicalProduct(priceTestInput);

    // Verify the returned price is a number
    expect(typeof result.unit_price).toEqual('number');
    expect(result.unit_price).toEqual(99.95);

    // Verify it's stored correctly in database
    const dbProduct = await db.select()
      .from(nonMedicalProductsTable)
      .where(eq(nonMedicalProductsTable.id, result.id))
      .execute();

    expect(parseFloat(dbProduct[0].unit_price)).toEqual(99.95);
  });
});
