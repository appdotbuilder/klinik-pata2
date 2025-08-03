
import { db } from '../db';
import { salesTable, saleItemsTable, nonMedicalProductsTable } from '../db/schema';
import { type CreateSaleInput, type Sale } from '../schema';
import { eq } from 'drizzle-orm';

export const createSale = async (input: CreateSaleInput): Promise<Sale> => {
  try {
    // Verify all products exist and have sufficient stock
    for (const item of input.items) {
      const product = await db.select()
        .from(nonMedicalProductsTable)
        .where(eq(nonMedicalProductsTable.id, item.product_id))
        .execute();

      if (product.length === 0) {
        throw new Error(`Product with ID ${item.product_id} not found`);
      }

      if (product[0].stock_quantity < item.quantity) {
        throw new Error(`Insufficient stock for product ${product[0].name}. Available: ${product[0].stock_quantity}, Requested: ${item.quantity}`);
      }
    }

    // Insert sale record
    const saleResult = await db.insert(salesTable)
      .values({
        sale_number: input.sale_number,
        customer_name: input.customer_name,
        total_amount: input.total_amount.toString(),
        amount_paid: input.amount_paid.toString(),
        change_amount: input.change_amount.toString(),
        payment_method: input.payment_method
      })
      .returning()
      .execute();

    const sale = saleResult[0];

    // Insert sale items
    for (const item of input.items) {
      await db.insert(saleItemsTable)
        .values({
          sale_id: sale.id,
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price.toString(),
          total_price: item.total_price.toString()
        })
        .execute();

      // Update product stock
      const currentProduct = await db.select()
        .from(nonMedicalProductsTable)
        .where(eq(nonMedicalProductsTable.id, item.product_id))
        .execute();

      await db.update(nonMedicalProductsTable)
        .set({
          stock_quantity: currentProduct[0].stock_quantity - item.quantity
        })
        .where(eq(nonMedicalProductsTable.id, item.product_id))
        .execute();
    }

    // Convert numeric fields back to numbers before returning
    return {
      ...sale,
      total_amount: parseFloat(sale.total_amount),
      amount_paid: parseFloat(sale.amount_paid),
      change_amount: parseFloat(sale.change_amount)
    };
  } catch (error) {
    console.error('Sale creation failed:', error);
    throw error;
  }
};
