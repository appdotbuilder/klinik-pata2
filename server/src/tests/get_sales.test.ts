
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { salesTable, nonMedicalProductsTable, saleItemsTable } from '../db/schema';
import { type CreateSaleInput } from '../schema';
import { getSales } from '../handlers/get_sales';

// Test sale input
const testSaleInput: CreateSaleInput = {
  sale_number: 'SALE-001',
  customer_name: 'John Doe',
  total_amount: 150.75,
  amount_paid: 200.00,
  change_amount: 49.25,
  payment_method: 'cash',
  items: [
    {
      product_id: 1,
      quantity: 2,
      unit_price: 75.00,
      total_price: 150.00
    }
  ]
};

describe('getSales', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no sales exist', async () => {
    const result = await getSales();

    expect(result).toEqual([]);
  });

  it('should return all sales with correct numeric conversions', async () => {
    // Create a test product first
    await db.insert(nonMedicalProductsTable)
      .values({
        name: 'Test Product',
        description: 'A test product',
        unit_price: '75.00',
        stock_quantity: 100
      })
      .execute();

    // Create a test sale
    const saleResult = await db.insert(salesTable)
      .values({
        sale_number: testSaleInput.sale_number,
        customer_name: testSaleInput.customer_name,
        total_amount: testSaleInput.total_amount.toString(),
        amount_paid: testSaleInput.amount_paid.toString(),
        change_amount: testSaleInput.change_amount.toString(),
        payment_method: testSaleInput.payment_method
      })
      .returning()
      .execute();

    const result = await getSales();

    expect(result).toHaveLength(1);
    expect(result[0].sale_number).toEqual('SALE-001');
    expect(result[0].customer_name).toEqual('John Doe');
    expect(result[0].total_amount).toEqual(150.75);
    expect(result[0].amount_paid).toEqual(200.00);
    expect(result[0].change_amount).toEqual(49.25);
    expect(result[0].payment_method).toEqual('cash');
    expect(result[0].id).toBeDefined();
    expect(result[0].sale_date).toBeInstanceOf(Date);
    expect(result[0].created_at).toBeInstanceOf(Date);

    // Verify numeric types
    expect(typeof result[0].total_amount).toBe('number');
    expect(typeof result[0].amount_paid).toBe('number');
    expect(typeof result[0].change_amount).toBe('number');
  });

  it('should return multiple sales correctly', async () => {
    // Create test product
    await db.insert(nonMedicalProductsTable)
      .values({
        name: 'Test Product',
        description: 'A test product',
        unit_price: '50.00',
        stock_quantity: 100
      })
      .execute();

    // Create multiple sales
    await db.insert(salesTable)
      .values([
        {
          sale_number: 'SALE-001',
          customer_name: 'Customer One',
          total_amount: '100.50',
          amount_paid: '150.00',
          change_amount: '49.50',
          payment_method: 'cash'
        },
        {
          sale_number: 'SALE-002',
          customer_name: null,
          total_amount: '75.25',
          amount_paid: '75.25',
          change_amount: '0.00',
          payment_method: 'card'
        }
      ])
      .execute();

    const result = await getSales();

    expect(result).toHaveLength(2);
    
    // Check first sale
    const sale1 = result.find(s => s.sale_number === 'SALE-001');
    expect(sale1).toBeDefined();
    expect(sale1!.customer_name).toEqual('Customer One');
    expect(sale1!.total_amount).toEqual(100.50);
    expect(sale1!.payment_method).toEqual('cash');

    // Check second sale
    const sale2 = result.find(s => s.sale_number === 'SALE-002');
    expect(sale2).toBeDefined();
    expect(sale2!.customer_name).toBeNull();
    expect(sale2!.total_amount).toEqual(75.25);
    expect(sale2!.change_amount).toEqual(0.00);
    expect(sale2!.payment_method).toEqual('card');
  });

  it('should handle sales with different payment methods', async () => {
    // Create test product
    await db.insert(nonMedicalProductsTable)
      .values({
        name: 'Test Product',
        description: 'A test product',
        unit_price: '25.00',
        stock_quantity: 100
      })
      .execute();

    // Create sales with different payment methods
    await db.insert(salesTable)
      .values([
        {
          sale_number: 'SALE-CASH',
          total_amount: '50.00',
          amount_paid: '50.00',
          change_amount: '0.00',
          payment_method: 'cash'
        },
        {
          sale_number: 'SALE-CARD',
          total_amount: '75.00',
          amount_paid: '75.00',
          change_amount: '0.00',
          payment_method: 'card'
        },
        {
          sale_number: 'SALE-MOBILE',
          total_amount: '100.00',
          amount_paid: '100.00',
          change_amount: '0.00',
          payment_method: 'mobile_money'
        }
      ])
      .execute();

    const result = await getSales();

    expect(result).toHaveLength(3);
    
    const paymentMethods = result.map(s => s.payment_method);
    expect(paymentMethods).toContain('cash');
    expect(paymentMethods).toContain('card');
    expect(paymentMethods).toContain('mobile_money');

    // Verify all amounts are properly converted to numbers
    result.forEach(sale => {
      expect(typeof sale.total_amount).toBe('number');
      expect(typeof sale.amount_paid).toBe('number');
      expect(typeof sale.change_amount).toBe('number');
    });
  });
});
