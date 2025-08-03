
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { nonMedicalProductsTable, salesTable, saleItemsTable } from '../db/schema';
import { type CreateSaleInput } from '../schema';
import { createSale } from '../handlers/create_sale';
import { eq } from 'drizzle-orm';

// Test product data
const testProduct = {
  name: 'Test Product',
  description: 'A product for testing',
  unit_price: 25.00,
  stock_quantity: 50
};

// Test sale input
const testSaleInput: CreateSaleInput = {
  sale_number: 'SALE-001',
  customer_name: 'John Doe',
  total_amount: 75.00,
  amount_paid: 80.00,
  change_amount: 5.00,
  payment_method: 'cash',
  items: [
    {
      product_id: 1, // Will be set after product creation
      quantity: 3,
      unit_price: 25.00,
      total_price: 75.00
    }
  ]
};

describe('createSale', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a sale with items', async () => {
    // Create test product first
    const productResult = await db.insert(nonMedicalProductsTable)
      .values({
        name: testProduct.name,
        description: testProduct.description,
        unit_price: testProduct.unit_price.toString(),
        stock_quantity: testProduct.stock_quantity
      })
      .returning()
      .execute();

    const product = productResult[0];
    testSaleInput.items[0].product_id = product.id;

    const result = await createSale(testSaleInput);

    // Verify sale fields
    expect(result.sale_number).toEqual('SALE-001');
    expect(result.customer_name).toEqual('John Doe');
    expect(result.total_amount).toEqual(75.00);
    expect(result.amount_paid).toEqual(80.00);
    expect(result.change_amount).toEqual(5.00);
    expect(result.payment_method).toEqual('cash');
    expect(result.id).toBeDefined();
    expect(result.sale_date).toBeInstanceOf(Date);
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should save sale to database', async () => {
    // Create test product first
    const productResult = await db.insert(nonMedicalProductsTable)
      .values({
        name: testProduct.name,
        description: testProduct.description,
        unit_price: testProduct.unit_price.toString(),
        stock_quantity: testProduct.stock_quantity
      })
      .returning()
      .execute();

    const product = productResult[0];
    testSaleInput.items[0].product_id = product.id;

    const result = await createSale(testSaleInput);

    // Verify sale was saved
    const sales = await db.select()
      .from(salesTable)
      .where(eq(salesTable.id, result.id))
      .execute();

    expect(sales).toHaveLength(1);
    expect(sales[0].sale_number).toEqual('SALE-001');
    expect(sales[0].customer_name).toEqual('John Doe');
    expect(parseFloat(sales[0].total_amount)).toEqual(75.00);
    expect(parseFloat(sales[0].amount_paid)).toEqual(80.00);
    expect(parseFloat(sales[0].change_amount)).toEqual(5.00);
  });

  it('should create sale items', async () => {
    // Create test product first
    const productResult = await db.insert(nonMedicalProductsTable)
      .values({
        name: testProduct.name,
        description: testProduct.description,
        unit_price: testProduct.unit_price.toString(),
        stock_quantity: testProduct.stock_quantity
      })
      .returning()
      .execute();

    const product = productResult[0];
    testSaleInput.items[0].product_id = product.id;

    const result = await createSale(testSaleInput);

    // Verify sale items were created
    const saleItems = await db.select()
      .from(saleItemsTable)
      .where(eq(saleItemsTable.sale_id, result.id))
      .execute();

    expect(saleItems).toHaveLength(1);
    expect(saleItems[0].product_id).toEqual(product.id);
    expect(saleItems[0].quantity).toEqual(3);
    expect(parseFloat(saleItems[0].unit_price)).toEqual(25.00);
    expect(parseFloat(saleItems[0].total_price)).toEqual(75.00);
  });

  it('should update product stock quantity', async () => {
    // Create test product first
    const productResult = await db.insert(nonMedicalProductsTable)
      .values({
        name: testProduct.name,
        description: testProduct.description,
        unit_price: testProduct.unit_price.toString(),
        stock_quantity: testProduct.stock_quantity
      })
      .returning()
      .execute();

    const product = productResult[0];
    testSaleInput.items[0].product_id = product.id;

    await createSale(testSaleInput);

    // Verify stock was reduced
    const updatedProducts = await db.select()
      .from(nonMedicalProductsTable)
      .where(eq(nonMedicalProductsTable.id, product.id))
      .execute();

    expect(updatedProducts[0].stock_quantity).toEqual(47); // 50 - 3 = 47
  });

  it('should throw error when product does not exist', async () => {
    const invalidInput = {
      ...testSaleInput,
      items: [{
        product_id: 999, // Non-existent product
        quantity: 1,
        unit_price: 25.00,
        total_price: 25.00
      }]
    };

    await expect(createSale(invalidInput)).rejects.toThrow(/product with id 999 not found/i);
  });

  it('should throw error when insufficient stock', async () => {
    // Create test product with low stock
    const productResult = await db.insert(nonMedicalProductsTable)
      .values({
        name: testProduct.name,
        description: testProduct.description,
        unit_price: testProduct.unit_price.toString(),
        stock_quantity: 2 // Only 2 in stock
      })
      .returning()
      .execute();

    const product = productResult[0];
    const insufficientStockInput = {
      ...testSaleInput,
      items: [{
        product_id: product.id,
        quantity: 5, // Requesting more than available
        unit_price: 25.00,
        total_price: 125.00
      }]
    };

    await expect(createSale(insufficientStockInput)).rejects.toThrow(/insufficient stock/i);
  });
});
