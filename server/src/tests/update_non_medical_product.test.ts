
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { nonMedicalProductsTable } from '../db/schema';
import { type CreateNonMedicalProductInput, type UpdateNonMedicalProductInput } from '../schema';
import { updateNonMedicalProduct } from '../handlers/update_non_medical_product';
import { eq } from 'drizzle-orm';

// Test data
const testProductInput: CreateNonMedicalProductInput = {
  name: 'Test Product',
  description: 'A product for testing',
  unit_price: 25.50,
  stock_quantity: 50
};

const createTestProduct = async () => {
  const result = await db.insert(nonMedicalProductsTable)
    .values({
      name: testProductInput.name,
      description: testProductInput.description,
      unit_price: testProductInput.unit_price.toString(),
      stock_quantity: testProductInput.stock_quantity || 0
    })
    .returning()
    .execute();

  return result[0];
};

describe('updateNonMedicalProduct', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update product name', async () => {
    const product = await createTestProduct();
    
    const updateInput: UpdateNonMedicalProductInput = {
      product_id: product.id,
      name: 'Updated Product Name'
    };

    const result = await updateNonMedicalProduct(updateInput);

    expect(result.id).toEqual(product.id);
    expect(result.name).toEqual('Updated Product Name');
    expect(result.description).toEqual(testProductInput.description);
    expect(result.unit_price).toEqual(25.50);
    expect(result.stock_quantity).toEqual(50);
    expect(result.updated_at).toBeInstanceOf(Date);
    expect(result.updated_at > product.updated_at).toBe(true);
  });

  it('should update product price and stock', async () => {
    const product = await createTestProduct();
    
    const updateInput: UpdateNonMedicalProductInput = {
      product_id: product.id,
      unit_price: 99.99,
      stock_quantity: 75
    };

    const result = await updateNonMedicalProduct(updateInput);

    expect(result.id).toEqual(product.id);
    expect(result.name).toEqual(testProductInput.name);
    expect(result.unit_price).toEqual(99.99);
    expect(result.stock_quantity).toEqual(75);
    expect(typeof result.unit_price).toBe('number');
  });

  it('should update all fields', async () => {
    const product = await createTestProduct();
    
    const updateInput: UpdateNonMedicalProductInput = {
      product_id: product.id,
      name: 'Completely Updated Product',
      description: 'Updated description',
      unit_price: 15.75,
      stock_quantity: 200
    };

    const result = await updateNonMedicalProduct(updateInput);

    expect(result.name).toEqual('Completely Updated Product');
    expect(result.description).toEqual('Updated description');
    expect(result.unit_price).toEqual(15.75);
    expect(result.stock_quantity).toEqual(200);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should update product to null description', async () => {
    const product = await createTestProduct();
    
    const updateInput: UpdateNonMedicalProductInput = {
      product_id: product.id,
      description: null
    };

    const result = await updateNonMedicalProduct(updateInput);

    expect(result.description).toBeNull();
    expect(result.name).toEqual(testProductInput.name);
  });

  it('should save updates to database', async () => {
    const product = await createTestProduct();
    
    const updateInput: UpdateNonMedicalProductInput = {
      product_id: product.id,
      name: 'Database Test Product',
      unit_price: 42.00
    };

    await updateNonMedicalProduct(updateInput);

    // Verify in database
    const products = await db.select()
      .from(nonMedicalProductsTable)
      .where(eq(nonMedicalProductsTable.id, product.id))
      .execute();

    expect(products).toHaveLength(1);
    expect(products[0].name).toEqual('Database Test Product');
    expect(parseFloat(products[0].unit_price)).toEqual(42.00);
  });

  it('should throw error for non-existent product', async () => {
    const updateInput: UpdateNonMedicalProductInput = {
      product_id: 999999,
      name: 'Non-existent Product'
    };

    expect(updateNonMedicalProduct(updateInput)).rejects.toThrow(/not found/i);
  });

  it('should handle zero stock quantity', async () => {
    const product = await createTestProduct();
    
    const updateInput: UpdateNonMedicalProductInput = {
      product_id: product.id,
      stock_quantity: 0
    };

    const result = await updateNonMedicalProduct(updateInput);

    expect(result.stock_quantity).toEqual(0);
  });
});
