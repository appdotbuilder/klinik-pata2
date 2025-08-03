
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { nonMedicalProductsTable } from '../db/schema';
import { type CreateNonMedicalProductInput } from '../schema';
import { getNonMedicalProducts } from '../handlers/get_non_medical_products';

// Test data
const testProduct1: CreateNonMedicalProductInput = {
  name: 'Bandages',
  description: 'Medical bandages for wound care',
  unit_price: 15.99,
  stock_quantity: 50
};

const testProduct2: CreateNonMedicalProductInput = {
  name: 'Thermometer',
  description: 'Digital thermometer',
  unit_price: 25.50,
  stock_quantity: 25
};

const testProduct3: CreateNonMedicalProductInput = {
  name: 'Hand Sanitizer',
  description: null,
  unit_price: 8.75,
  stock_quantity: 100
};

describe('getNonMedicalProducts', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no products exist', async () => {
    const result = await getNonMedicalProducts();

    expect(result).toEqual([]);
  });

  it('should return all non-medical products', async () => {
    // Create test products
    await db.insert(nonMedicalProductsTable)
      .values([
        {
          name: testProduct1.name,
          description: testProduct1.description,
          unit_price: testProduct1.unit_price.toString(),
          stock_quantity: testProduct1.stock_quantity
        },
        {
          name: testProduct2.name,
          description: testProduct2.description,
          unit_price: testProduct2.unit_price.toString(),
          stock_quantity: testProduct2.stock_quantity
        }
      ])
      .execute();

    const result = await getNonMedicalProducts();

    expect(result).toHaveLength(2);
    
    // Verify first product
    const product1 = result.find(p => p.name === 'Bandages');
    expect(product1).toBeDefined();
    expect(product1!.name).toEqual('Bandages');
    expect(product1!.description).toEqual('Medical bandages for wound care');
    expect(product1!.unit_price).toEqual(15.99);
    expect(typeof product1!.unit_price).toEqual('number');
    expect(product1!.stock_quantity).toEqual(50);
    expect(product1!.id).toBeDefined();
    expect(product1!.created_at).toBeInstanceOf(Date);
    expect(product1!.updated_at).toBeInstanceOf(Date);

    // Verify second product
    const product2 = result.find(p => p.name === 'Thermometer');
    expect(product2).toBeDefined();
    expect(product2!.name).toEqual('Thermometer');
    expect(product2!.description).toEqual('Digital thermometer');
    expect(product2!.unit_price).toEqual(25.50);
    expect(typeof product2!.unit_price).toEqual('number');
    expect(product2!.stock_quantity).toEqual(25);
  });

  it('should handle products with null descriptions', async () => {
    // Create product with null description
    await db.insert(nonMedicalProductsTable)
      .values({
        name: testProduct3.name,
        description: testProduct3.description,
        unit_price: testProduct3.unit_price.toString(),
        stock_quantity: testProduct3.stock_quantity
      })
      .execute();

    const result = await getNonMedicalProducts();

    expect(result).toHaveLength(1);
    expect(result[0].name).toEqual('Hand Sanitizer');
    expect(result[0].description).toBeNull();
    expect(result[0].unit_price).toEqual(8.75);
    expect(typeof result[0].unit_price).toEqual('number');
    expect(result[0].stock_quantity).toEqual(100);
  });

  it('should return products ordered by creation date', async () => {
    // Create multiple products
    await db.insert(nonMedicalProductsTable)
      .values([
        {
          name: 'Product A',
          description: 'First product',
          unit_price: '10.00',
          stock_quantity: 10
        },
        {
          name: 'Product B',
          description: 'Second product',
          unit_price: '20.00',
          stock_quantity: 20
        },
        {
          name: 'Product C',
          description: 'Third product',
          unit_price: '30.00',
          stock_quantity: 30
        }
      ])
      .execute();

    const result = await getNonMedicalProducts();

    expect(result).toHaveLength(3);
    
    // Verify all products are returned with correct numeric conversion
    result.forEach(product => {
      expect(typeof product.unit_price).toEqual('number');
      expect(product.created_at).toBeInstanceOf(Date);
      expect(product.updated_at).toBeInstanceOf(Date);
    });

    // Verify specific products exist
    expect(result.some(p => p.name === 'Product A' && p.unit_price === 10.00)).toBe(true);
    expect(result.some(p => p.name === 'Product B' && p.unit_price === 20.00)).toBe(true);
    expect(result.some(p => p.name === 'Product C' && p.unit_price === 30.00)).toBe(true);
  });
});
