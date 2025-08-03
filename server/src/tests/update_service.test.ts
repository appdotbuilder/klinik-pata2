
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { servicesTable } from '../db/schema';
import { type CreateServiceInput, type UpdateServiceInput } from '../schema';
import { updateService } from '../handlers/update_service';
import { eq } from 'drizzle-orm';

// Test service data
const testService: CreateServiceInput = {
  name: 'Test Service',
  description: 'A service for testing',
  price: 50.00,
  duration_minutes: 30,
  is_active: true
};

const createTestService = async (): Promise<number> => {
  const result = await db.insert(servicesTable)
    .values({
      name: testService.name,
      description: testService.description,
      price: testService.price.toString(),
      duration_minutes: testService.duration_minutes,
      is_active: testService.is_active
    })
    .returning()
    .execute();
  
  return result[0].id;
};

describe('updateService', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update service fields', async () => {
    const serviceId = await createTestService();
    
    const updateInput: UpdateServiceInput = {
      service_id: serviceId,
      name: 'Updated Service Name',
      price: 75.50,
      is_active: false
    };

    const result = await updateService(updateInput);

    expect(result.id).toEqual(serviceId);
    expect(result.name).toEqual('Updated Service Name');
    expect(result.description).toEqual('A service for testing'); // Unchanged
    expect(result.price).toEqual(75.50);
    expect(result.duration_minutes).toEqual(30); // Unchanged
    expect(result.is_active).toEqual(false);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should update only provided fields', async () => {
    const serviceId = await createTestService();
    
    const updateInput: UpdateServiceInput = {
      service_id: serviceId,
      description: 'Updated description only'
    };

    const result = await updateService(updateInput);

    expect(result.id).toEqual(serviceId);
    expect(result.name).toEqual('Test Service'); // Unchanged
    expect(result.description).toEqual('Updated description only');
    expect(result.price).toEqual(50.00); // Unchanged
    expect(result.duration_minutes).toEqual(30); // Unchanged
    expect(result.is_active).toEqual(true); // Unchanged
  });

  it('should update service in database', async () => {
    const serviceId = await createTestService();
    
    const updateInput: UpdateServiceInput = {
      service_id: serviceId,
      name: 'Database Updated Service',
      price: 100.00
    };

    await updateService(updateInput);

    // Verify database was updated
    const services = await db.select()
      .from(servicesTable)
      .where(eq(servicesTable.id, serviceId))
      .execute();

    expect(services).toHaveLength(1);
    expect(services[0].name).toEqual('Database Updated Service');
    expect(parseFloat(services[0].price)).toEqual(100.00);
    expect(services[0].updated_at).toBeInstanceOf(Date);
  });

  it('should handle nullable fields correctly', async () => {
    const serviceId = await createTestService();
    
    const updateInput: UpdateServiceInput = {
      service_id: serviceId,
      description: null,
      duration_minutes: null
    };

    const result = await updateService(updateInput);

    expect(result.description).toBeNull();
    expect(result.duration_minutes).toBeNull();
    expect(result.name).toEqual('Test Service'); // Unchanged
    expect(result.price).toEqual(50.00); // Unchanged
  });

  it('should throw error for non-existent service', async () => {
    const nonExistentId = 99999;
    
    const updateInput: UpdateServiceInput = {
      service_id: nonExistentId,
      name: 'Should fail'
    };

    expect(updateService(updateInput)).rejects.toThrow(/not found/i);
  });

  it('should verify numeric price conversion', async () => {
    const serviceId = await createTestService();
    
    const updateInput: UpdateServiceInput = {
      service_id: serviceId,
      price: 123.45
    };

    const result = await updateService(updateInput);

    // Verify the returned value is a number
    expect(typeof result.price).toBe('number');
    expect(result.price).toEqual(123.45);

    // Verify database stores as string but retrieves correctly
    const dbService = await db.select()
      .from(servicesTable)
      .where(eq(servicesTable.id, serviceId))
      .execute();
    
    expect(typeof dbService[0].price).toBe('string');
    expect(parseFloat(dbService[0].price)).toEqual(123.45);
  });
});
